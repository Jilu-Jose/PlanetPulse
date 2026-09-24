import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Leaf, Bell, User, Plus, Zap, Menu, X } from 'lucide-react';
import './index.css';

import Dashboard from './pages/Dashboard';
import AddActivity from './pages/AddActivity';
import WhatIf from './pages/WhatIf';
import AskAI from './pages/AskAI';
import Landing from './pages/Landing';
import History from './pages/History';
import MapTab from './components/MapTab';

const Methodology = () => <div className="animate-fade-in"><h1 className="page-title">Methodology</h1></div>;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <Router>
      <div className="app-container">

        {/* Top Status Bar */}
        <div className="status-bar">
          <Zap size={12} />
          <span className="status-bar-text">Operational Live Feed - IPCC AR6 Climate Matrix Synced &bull; <span style={{color: '#4CAF50'}}>99.98% Model Confidence</span></span>
        </div>

        <nav className="navbar">
          {/* Left Brand */}
          <NavLink to="/landing" className="nav-brand" onClick={closeMenu}>
            <div style={{background: 'var(--color-primary-dark)', padding: '0.4rem', borderRadius: '8px', display: 'flex'}}>
              <Leaf size={20} color="white" />
            </div>
            <span>PlanetPulse</span>
            <span className="nav-brand-pill">Climate AI</span>
          </NavLink>

          {/* Center Links - desktop */}
          <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            <NavLink to="/landing" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/add" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Add Activity</NavLink>
            <NavLink to="/what-if" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>What-If</NavLink>
            <NavLink to="/ask" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Ask AI</NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>History</NavLink>
            <NavLink to="/map" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Map</NavLink>
            <NavLink to="/methodology" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>Methodology</NavLink>
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            <NavLink to="/add" style={{textDecoration: 'none'}} className="nav-quick-add-btn" onClick={closeMenu}>
              <button className="btn btn-primary" style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}}>
                <Plus size={16} /> Quick Add +
              </button>
            </NavLink>
            
            <div style={{position: 'relative', cursor: 'pointer', padding: '0.5rem'}} className="nav-bell">
              <Bell size={20} color="var(--color-text-main)" />
              <div style={{position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%', border: '2px solid white'}}></div>
            </div>

            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} className="nav-user">
              <User size={18} color="var(--color-text-muted)" />
            </div>

            {/* Hamburger - mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<AddActivity />} />
            <Route path="/what-if" element={<WhatIf />} />
            <Route path="/ask" element={<AskAI />} />
            <Route path="/history" element={<History />} />
            <Route path="/map" element={<MapTab />} />
            <Route path="/methodology" element={<Methodology />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-left">
            <div>Values are estimates based on documented emission factors - Open Climate Data Initiative</div>
            <div>Verified ISO 14064-1 &amp; GHG Protocol Standards Compliant</div>
          </div>
          <div className="footer-links">
            <a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Data Sources</a>
            <a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Emission Factors</a>
            <a href="#" style={{color: 'inherit', textDecoration: 'none'}}>API Documentation</a>
            <a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Privacy Policy</a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
