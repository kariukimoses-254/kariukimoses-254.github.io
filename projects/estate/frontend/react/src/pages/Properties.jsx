import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState('postgres');

  async function load() {
    setLoading(true);
    setError('');
    try {
      if (source === 'postgres') {
        const data = await api.getProperties();
        setProperties((data.properties || []).map((p) => ({ ...p, _source: 'PostgreSQL via Node.js' })));
      } else if (source === 'graphql') {
        const data = await api.graphqlProperties();
        setProperties((data.properties || []).map((p) => ({ ...p, _source: 'GraphQL via Node.js' })));
      } else if (source === 'mysql') {
        const data = await api.javaListings();
        setProperties(data.map((p) => ({ ...p, _source: 'MySQL via Java Spring Boot' })));
      } else if (source === 'php') {
        const data = await api.phpProperties();
        const rows = data.data || data;
        setProperties((Array.isArray(rows) ? rows : []).map((p) => ({ ...p, _source: 'PostgreSQL via PHP Laravel' })));
      }
    } catch (e) {
      setError(`Failed to load: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [source]);

  return (
    <div className="container py-5">
      <h1 className="mb-4 display-6">Properties Catalog</h1>
      <div className="mb-4">
        <label className="me-2 fw-semibold">Data Source:</label>
        <div className="btn-group">
          <button className={`btn ${source === 'postgres' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSource('postgres')}>PostgreSQL (Node REST)</button>
          <button className={`btn ${source === 'graphql' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSource('graphql')}>PostgreSQL (Node GraphQL)</button>
          <button className={`btn ${source === 'mysql' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSource('mysql')}>MySQL (Java REST)</button>
          <button className={`btn ${source === 'php' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSource('php')}>PostgreSQL (PHP GraphQL)</button>
        </div>
      </div>

      {loading && <div className="spinner-border text-primary"></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {properties.map((p) => (
          <div className="col-md-6 col-lg-4" key={p.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <span className="badge bg-brand-500 mb-2">{p._source}</span>
                <h5 className="card-title">{p.title}</h5>
                <p className="text-muted small mb-2">{p.location || p._source}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 text-brand-600 mb-0">
                    ${Number(p.price || 0).toLocaleString()}
                  </span>
                  <span className={`badge ${p.status === 'available' ? 'bg-success' : p.status === 'pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="mt-2 small text-muted">
                  {p.bedrooms != null && <span>{p.bedrooms} bd</span>} 
                  {p.bathrooms != null && <span> . {p.bathrooms} ba</span>}
                  {p.areaSqft != null && <span> . {p.areaSqft.toLocaleString()} sq ft</span>}
                </div>
                {p.agent && (
                  <p className="small mt-2 mb-0 text-muted">Agent: {p.agent.name}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}