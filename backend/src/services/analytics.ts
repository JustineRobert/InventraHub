import prisma from '../utils/prisma';
import config from '../config';

type TopDemandItem = {
  sku: string;
  name: string;
  expectedDemand: number;
  trend: string;
};

type AnalyticsPayload = {
  businessId: string;
  generatedAt: string;
  salesByStatus: Array<{ status: string; total: number; count: number }>;
  inventoryValue: number;
  lowStockItems: Array<{ id: string; name: string; sku: string; quantity: number; threshold: number }>;
  branchCount: number;
  topDemand: TopDemandItem[];
  averageOrderValue: number;
  summary: {
    totalSales: number;
    forecastSignal: string;
  };
};

const analyticsCache = new Map<string, AnalyticsPayload>();

export async function computeBusinessAnalytics(businessId: string): Promise<AnalyticsPayload> {
  const salesByStatus = await prisma.order.groupBy({
    by: ['status'],
    where: { businessId },
    _sum: { total: true },
    _count: { id: true }
  });

  const inventoryValueResult = await prisma.inventoryItem.aggregate({
    where: { businessId },
    _sum: { sellingPrice: true, purchaseCost: true }
  });

  const lowStockItems = await prisma.inventoryItem.findMany({
    where: { businessId, quantity: { lt: 5 } },
    orderBy: { quantity: 'asc' },
    take: 10
  });

  const branchCount = await prisma.branch.count({ where: { businessId } });

  const orders = await prisma.order.findMany({
    where: { businessId },
    select: { id: true, total: true, createdAt: true }
  });

  const recentOrders = await prisma.order.findMany({
    where: {
      businessId,
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    },
    include: {
      items: { include: { inventoryItem: true } }
    }
  });

  const demandMap = new Map<string, { sku: string; name: string; quantity: number; dates: number[] }>();
  recentOrders.forEach((order) => {
    order.items.forEach((item) => {
      const sku = item.inventoryItem?.sku || 'unknown';
      const name = item.inventoryItem?.name || 'Unknown item';
      const entry = demandMap.get(item.inventoryItemId) ?? { sku, name, quantity: 0, dates: [] };
      entry.quantity += item.quantity;
      entry.dates.push(order.createdAt.getTime());
      demandMap.set(item.inventoryItemId, entry);
    });
  });

  const topDemand = Array.from(demandMap.values())
    .map((item) => ({
      sku: item.sku,
      name: item.name,
      expectedDemand: Math.round(item.quantity * 1.2),
      trend: item.dates.length > 5 ? 'rising' : 'stable'
    }))
    .sort((a, b) => b.expectedDemand - a.expectedDemand)
    .slice(0, 10);

  const totalSales = orders.reduce((total, order) => total + order.total, 0);
  const averageOrderValue = orders.length ? totalSales / orders.length : 0;

  return {
    businessId,
    generatedAt: new Date().toISOString(),
    salesByStatus: salesByStatus.map((item) => ({ status: item.status, total: item._sum.total ?? 0, count: item._count.id })),
    inventoryValue: Number((inventoryValueResult._sum.sellingPrice ?? 0) * 1),
    lowStockItems: lowStockItems.map((item) => ({ id: item.id, name: item.name, sku: item.sku, quantity: item.quantity, threshold: item.threshold })),
    branchCount,
    topDemand,
    averageOrderValue,
    summary: {
      totalSales,
      forecastSignal: topDemand.length > 0 ? 'Review stock for top SKUs' : 'No demand signal available'
    }
  };
}

export function getCachedBusinessAnalytics(businessId: string) {
  return analyticsCache.get(businessId);
}

export function startAnalyticsAggregationService() {
  const intervalMs = config.analyticsRunIntervalMinutes * 60 * 1000;

  const refreshAllAnalytics = async () => {
    try {
      const businesses = await prisma.business.findMany({ select: { id: true } });
      await Promise.all(
        businesses.map(async (business) => {
          const analytics = await computeBusinessAnalytics(business.id);
          analyticsCache.set(business.id, analytics);
        })
      );
    } catch (error) {
      console.error('Analytics aggregation job failed:', error);
    }
  };

  refreshAllAnalytics();
  setInterval(refreshAllAnalytics, intervalMs);
}
