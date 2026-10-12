import { useEffect, useState } from 'react';
import { api } from '../services/api';

const stations = [
  { name: 'Node.js REST + PostgreSQL', fn: (data) => ({ total: data.total, label: 'properties' }) },
  { name: 'Node.js REST + MongoDB', fn: (data) => ({ total: data.total, label: 'listings' }) },
  { name: 'Java REST + MySQL', fn: (data) => ({ total: Array.isArray(data) ? data.length : 0, label: 'listings' }) },
  { name: 'PHP + PostgreSQL via GraphQL', fn: (data) => ({ total: (data.data?.properties || []).length, label: 'properties' }) },
  { name: 'Ruby reviews', fn: (data) => ({ total: Array.isArray(data) ? data.length : 0, label: 'reviews' }) },
];

export default function Dashboard() {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getProperties(),
      api.getListings(),
      api.javaListings(),
      api.phpGraphQL('query { properties { id title } }'),
      api.rubyReviews(),
    ]).then(async (results) => {
      const mapped = stations.map((s, i) => {
        const r = results[i];
        if (r.status === 'fulfilled') {
          const info = s.fn(r.value);
          return { name: s.name, ok: true, ...info };
        }
        return { name: s.name, ok: false, error: r.reason?.message || 'offline' };
      });
      setResults(mapped);

      const market = await api.rubyMarketStats().catch(() => null);
      setStats(market);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container py-5">
      <h1 className="display-6 mb-1">Backend Live Dashboard</h1>
      <p className="text-muted mb-4">Health check across every backend service.</p>

      {loading && <div className="spinner-border text-primary"></div>}

      <div className="row g-3">
        {results.map((r) => (
          <div className="col-md-6 col-lg-4" key={r.name}>
            <div className={`card h-100 shadow-sm border-start border-4 ${r.ok ? 'border-success' : 'border-danger'}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h6 className="card-subtitle text-muted">{r.name}</h6>
                  <span className={`badge ${r.ok ? 'bg-success' : 'bg-danger'}`}>
                    {r.ok ? 'Online' : 'Offline'}
                  </span>
                </div>
                {r.ok ? (
                  <p className="h4 mt-2 mb-0">{r.total} <small className="text-muted">{r.label}</small></p>
                ) : (
                  <p className="small text-danger mt-2 mb-0">{r.error}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="card mt-5 shadow-sm">
          <div className="card-header bg-dark text-white">Market Stats (Ruby Sinatra)</div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col">
                <div className="h3">${stats.average_price?.toLocaleString()}</div>
                <div className="text-muted small">Average Price</div>
              </div>
              <div className="col">
                <div className="h3">{stats.total_listings}</div>
                <div className="text-muted small">Total Listings</div>
              </div>
              <div className="col">
                <div className="h3">{stats.growth_rate}%</div>
                <div className="text-muted small">Growth Rate</div>
              </div>
              <div className="col">
                <div className="h3">{stats.trending_cities?.join(', ')}</div>
                <div className="text-muted small">Trending Cities</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}