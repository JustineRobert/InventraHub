import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Forecast() {
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    async function loadForecast() {
      try {
        const response = await api.get('/forecast/demand');
        setForecast(response.data);
      } catch (_err) {
        setForecast(null);
      }
    }
    loadForecast();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Demand Forecast</h1>
        <p>AI-powered demand forecasts help you stock the right hardware.</p>
      </div>
      <div className="card">
        {forecast ? (
          <>
            <p>Forecast window: {forecast.forecastWindowDays} days</p>
            <p>Generated at: {new Date(forecast.generatedAt).toLocaleString()}</p>
            <div className="card">
              <h2>Top predictions</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Demand</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.predictions.map((item: any) => (
                    <tr key={item.sku}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.expectedDemand}</td>
                      <td>{Math.round(item.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>Loading forecast...</p>
        )}
      </div>
    </section>
  );
}
