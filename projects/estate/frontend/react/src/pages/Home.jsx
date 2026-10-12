import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getProperties().then((data) => {
      setStats({ total: data.total });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <header className="bg-gradient-to-r from-brand-800 to-brand-500 text-white">
        <div className="container py-5">
          <div className="row align-items-center py-4">
            <div className="col-lg-8">
              <span className="badge bg-light text-dark mb-3">React 18 + Vite + Tailwind + Bootstrap + jQuery</span>
              <h1 className="display-4 fw-bold mb-3">EstateHub</h1>
              <p className="lead">
                A full-stack real estate platform demonstrating interoperability across{' '}
                <strong>Java, PHP, Ruby, JavaScript</strong> backends and{' '}
                <strong>PostgreSQL, MySQL, MongoDB</strong> databases.
              </p>
              <Link to="/properties" className="btn btn-warning btn-lg me-2">Browse Properties</Link>
              <Link to="/dashboard" className="btn btn-outline-light btn-lg">Live Dashboard</Link>
            </div>
            <div className="col-lg-4 d-none d-lg-block">
              <div className="card bg-white text-dark border-0 shadow-lg">
                <div className="card-body">
                  <h5 className="card-title">Stack Overview</h5>
                  <ul className="list-unstyled mb-0 small">
                    <li><b>Frontend:</b> React, Angular, Vue</li>
                    <li><b>Libraries:</b> Bootstrap, Tailwind, jQuery</li>
                    <li><b>APIs:</b> REST + GraphQL</li>
                    <li><b>Backend:</b> Java, PHP, Ruby, Node.js</li>
                    <li><b>Databases:</b> PostgreSQL, MySQL, MongoDB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container py-5">
        <h2 className="text-center mb-4 text-3xl font-bold">Explore the Tech Stack</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-top border-warning border-4">
              <div className="card-body">
                <h3 className="h5">REST APIs</h3>
                <p className="text-muted small">
                  Node.js (Express) serves PostgreSQL + MongoDB. Java (Spring Boot) serves MySQL.
                  PHP (Laravel) bridges PostgreSQL + MySQL. Ruby (Sinatra) provides analytics.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-top border-primary border-4">
              <div className="card-body">
                <h3 className="h5">GraphQL APIs</h3>
                <p className="text-muted small">
                  Node.js uses express-graphql (GraphiQL included). Java uses graphql-java-kickstart.
                  PHP handles GraphQL natively. Ruby exposes query + mutation resolvers.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-top border-success border-4">
              <div className="card-body">
                <h3 className="h5">3 Databases, one platform</h3>
                <p className="text-muted small">
                  <strong>PostgreSQL</strong> powers relational property data.
                  <strong>MySQL</strong> stores customer / tour visitor data via Java + PHP.
                  <strong>MongoDB</strong> stores flexible listing documents via Node.js.
                </p>
              </div>
            </div>
          </div>
        </div>
        {stats && (
          <div className="alert alert-info mt-4 d-flex align-items-center">
            <i className="bi bi-database me-2"></i>
            PostgreSQL connected with {stats.total} properties ready to browse.
          </div>
        )}
      </section>
    </div>
  );
}