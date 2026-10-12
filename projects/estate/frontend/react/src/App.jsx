import { Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import $ from 'jquery';
import './App.css';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import Listings from './pages/Listings.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-brand-800 shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <span className="text-2xl">EstateHub</span> <small className="badge bg-brand-500 ms-2">React</small>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/properties">Properties <span className="text-muted small">(PostgreSQL + Java)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/listings">Listings <span className="text-muted small">(MongoDB + Node)</span></Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Live Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}