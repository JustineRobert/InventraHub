export async function getDemandForecast(businessId: string) {
  return {
    businessId,
    generatedAt: new Date().toISOString(),
    forecastWindowDays: 30,
    predictions: [
      { sku: 'HW-001', name: '4G Router', expectedDemand: 34, confidence: 0.86 },
      { sku: 'HW-002', name: 'POS Terminal', expectedDemand: 21, confidence: 0.78 },
      { sku: 'HW-003', name: 'DVR Camera', expectedDemand: 15, confidence: 0.72 }
    ],
    summary: {
      totalForecast: 70,
      keyGrowthAreas: ['POS devices', 'Networking hardware']
    }
  };
}
