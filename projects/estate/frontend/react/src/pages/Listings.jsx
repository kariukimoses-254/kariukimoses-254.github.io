import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getListings().then((data) => {
      setListings(data.listings || []);
      setLoading(false);
    }).catch((e) => {
      setError(e.message);
      setLoading(false);
    });
  }, []);

  async function trackView(id) {
    try {
      const updated = await api.registerListingView(id);
      setListings((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    } catch {}
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 mb-0">Available Listings</h1>
        <span className="badge bg-success">MongoDB via Node.js</span>
      </div>

      {loading && <div className="spinner-border text-primary"></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {listings.map((listing) => (
          <div className="col-md-6 col-lg-4" key={listing._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{listing.title}</h5>
                <p className="text-muted small">{listing.description}</p>
                <p className="mb-1">
                  <i className="bi bi-geo-alt"></i>{' '}
                  {listing.location?.city}, {listing.location?.state} {listing.location?.country}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 mb-0 text-success">${listing.price.toLocaleString()}</span>
                  <span className="badge bg-info text-dark">{listing.views || 0} views</span>
                </div>
                <div className="mt-2">
                  {listing.features?.slice(0, 3).map((f) => (
                    <span key={f} className="badge bg-light text-dark me-1">{f}</span>
                  ))}
                </div>
                <button
                  className="btn btn-sm btn-outline-primary mt-3 w-100"
                  onClick={() => trackView(listing._id)}
                >
                  Track View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}