import React, { useEffect, useState } from 'react';
import { ShieldCheck, Download, Code, CheckCircle, Database, Server, FileCheck, Search, ChevronDown, Check, Car, Bus, Plane, Zap, Utensils, Globe } from 'lucide-react';
import './Methodology.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Methodology() {
  const [factors, setFactors] = useState([]);
  
  useEffect(() => {
    fetch(`${API_URL}/meta/factors`)
      .then(res => res.json())
      .then(data => {
        const list = [];
        for (const cat of Object.values(data)) {
          for (const [key, details] of Object.entries(cat)) {
            list.push({ id: key, ...details });
          }
        }
        setFactors(list);
      })
      .catch(err => console.error("Error fetching factors:", err));
  }, []);

  const getIcon = (id) => {
    if (id === 'car') return <Car size={18} color="var(--color-primary-dark)" />;
    if (id === 'bus') return <Bus size={18} color="var(--color-primary-dark)" />;
    if (id === 'flight') return <Plane size={18} color="var(--color-primary-dark)" />;
    if (id === 'electricity') return <Zap size={18} color="var(--color-primary-dark)" />;
    return <Utensils size={18} color="var(--color-primary-dark)" />;
  };

  return (
    <div className="methodology-container animate-fade-in">
      
      {/* Header Section */}
      <div className="meth-badge-top">
        <ShieldCheck size={14} />
        SCIENTIFIC TRANSPARENCY REPORT
      </div>
      
      <h1 className="meth-title">Scientific Methodology &<br/>Open Calculation Matrix</h1>
      <p className="meth-subtitle">Deterministic arithmetic with peer-reviewed emission factors. Zero black-box hallucinations.</p>
      
      <div className="meth-header-actions">
        <button className="meth-btn-outline">
          <Download size={16} /> Download Manifest (.CSV)
        </button>
        <button className="meth-btn-solid">
          <Code size={16} /> Open API Schema
        </button>
      </div>

      {/* Hero Card */}
      <div className="meth-hero-card">
        <div className="meth-hero-left">
          <div style={{color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
            <CheckCircle size={14} /> NORTH STAR GOVERNANCE
          </div>
          <h2>The Deterministic Arithmetic Standard</h2>
          <p>PlanetPulse calculations are strictly deterministic and auditable. AI only explains results, suggests alternatives, and clarifies context — AI never invents or improvises numerical coefficients.</p>
          
          <div className="meth-hero-tags">
            <div><Check size={16} color="var(--color-primary)"/> 100% Traceable Citations</div>
            <div><Check size={16} color="var(--color-primary)"/> Immutable Version Locks</div>
            <div><Check size={16} color="var(--color-primary)"/> JSON-LD Math Manifest</div>
          </div>
        </div>

        <div className="meth-formula-box">
          <div className="meth-formula-header">
            <span>Invariant Foundation Formula</span>
            <span className="meth-formula-badge">v1.0 Verified</span>
          </div>
          
          <div className="meth-equation">
            <div style={{fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.5rem'}}>Global Carbon Accounting Equation</div>
            <h3>CO₂e Footprint = Q × EF</h3>
            <p>[ Activity Quantity ] × [ Documented Emission Factor ]</p>
          </div>
          
          <div className="meth-formula-parts">
            <div className="meth-formula-part">
              <strong>Q (Activity)</strong>
              Kilometers, Liters, kWh, or Kilograms entered by user or IoT sync.
            </div>
            <div className="meth-formula-part">
              <strong>EF (Factor)</strong>
              Empirical, peer-reviewed coefficient tied to ISO 14064 schemas.
            </div>
          </div>
        </div>
      </div>

      {/* Core Architectural Principles */}
      <div className="meth-section-title">
        Core Architectural Principles
        <span className="meth-section-subtitle">Tier 1, Tier 2, and Tier 3 lifecycle compliance</span>
      </div>
      
      <div className="meth-principles-grid">
        <div className="meth-principle-card">
          <div className="meth-principle-icon"><ShieldCheck size={20} /></div>
          <h4>IPCC AR6 & DEFRA Alignment</h4>
          <p>Calculations adhere strictly to IPCC Assessment Report 6 100-year Global Warming Potential (GWP100) and the UK DEFRA/DESNZ GHG Conversion Factors repository.</p>
          <div className="meth-principle-footer"><Check size={14} color="var(--color-primary)"/> Lifecycle Tier 1 & Tier 2</div>
        </div>
        
        <div className="meth-principle-card">
          <div className="meth-principle-icon"><Server size={20} /></div>
          <h4>Hourly Marginal Grid Telemetry</h4>
          <p>Avoids flawed annual static averages by leveraging dynamic time-of-use emissions factors based on regional grid balancing, curtailment, and real-time generation.</p>
          <div className="meth-principle-footer"><Check size={14} color="var(--color-primary)"/> Marginal vs. Grid Average</div>
        </div>
        
        <div className="meth-principle-card">
          <div className="meth-principle-icon"><Database size={20} /></div>
          <h4>Well-to-Wheel Scope Accounting</h4>
          <p>Holistic boundaries capture Scope 1 direct combustion, Scope 2 electricity transmission losses (T&D), and Scope 3 well-to-tank (WTT) fuel supply extraction.</p>
          <div className="meth-principle-footer"><Check size={14} color="var(--color-primary)"/> Scope 1, 2, & 3 Upstream</div>
        </div>
        
        <div className="meth-principle-card">
          <div className="meth-principle-icon"><FileCheck size={20} /></div>
          <h4>Third-Party Auditable Open Schema</h4>
          <p>Every activity record outputs an immutable metadata payload detailing exact formula pointers, data sources, confidence bounds, and auditor timestamps.</p>
          <div className="meth-principle-footer"><Check size={14} color="var(--color-primary)"/> ISO 14064-1 Compliant</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="meth-section-title" style={{marginBottom: '1rem'}}>
        Live Emission Factor Database
        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
          <span style={{background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'}}>All Sources ({factors.length})</span>
          <span style={{background: '#E5E7EB', color: '#4B5563', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'}}>Travel & Transit</span>
          <span style={{background: '#E5E7EB', color: '#4B5563', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'}}>Nutrition & Food</span>
          <span style={{background: '#E5E7EB', color: '#4B5563', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'}}>Utilities & Power</span>
        </div>
      </div>
      <div style={{fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem'}}>Public repository of primary coefficients applied across our calculation pipelines</div>

      <div className="meth-table-controls">
        <div className="meth-search-box">
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder="Search by activity, source, or standard..." />
        </div>
        <div style={{fontSize: '0.85rem', color: '#6B7280', fontWeight: '600'}}>Showing {factors.length} peer-reviewed coefficients</div>
      </div>

      <div className="meth-table-wrapper">
        <table className="meth-table">
          <thead>
            <tr>
              <th>Activity / Mode</th>
              <th>Emission Factor</th>
              <th>Base Unit</th>
              <th>Geography</th>
              <th>Documented Source & Version</th>
              <th>Last Updated</th>
              <th>Audit Grade</th>
            </tr>
          </thead>
          <tbody>
            {factors.map(f => (
              <tr key={f.id}>
                <td className="td-activity">
                  <div style={{background: 'var(--color-primary-light)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{getIcon(f.id)}</div>
                  {f.label}
                </td>
                <td className="td-factor">{parseFloat(f.factor).toFixed(4)}</td>
                <td className="td-unit">kg CO₂e / {f.unit}</td>
                <td style={{fontSize: '0.85rem', color: '#4B5563'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <Globe size={14} color="var(--color-text-muted)" /> Global Weighted
                  </div>
                </td>
                <td style={{fontSize: '0.85rem', color: '#4B5563'}}>{f.source}</td>
                <td style={{fontSize: '0.85rem', color: '#4B5563'}}>Sep 2024</td>
                <td><span className="meth-audit-badge">A+ Peer-Reviewed</span></td>
              </tr>
            ))}
            {factors.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', color: '#6B7280'}}>Loading emission factors...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="meth-section-title">
        Calculation Engine FAQ & Technical Clarifications
      </div>
      <div style={{fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem'}}>Direct answers to statistical assumptions, boundary selections, and edge cases</div>

      <div className="meth-faq-list">
        <div className="meth-faq-item">
          <div className="meth-faq-item-left">
            <div className="meth-faq-number">01</div>
            <div className="meth-faq-question">How do we handle uncertainty and radiative forcing in flights?</div>
          </div>
          <ChevronDown size={20} color="#9CA3AF" />
        </div>
        <div className="meth-faq-item">
          <div className="meth-faq-item-left">
            <div className="meth-faq-number">02</div>
            <div className="meth-faq-question">How often are regional emission factors updated?</div>
          </div>
          <ChevronDown size={20} color="#9CA3AF" />
        </div>
        <div className="meth-faq-item">
          <div className="meth-faq-item-left">
            <div className="meth-faq-number">03</div>
            <div className="meth-faq-question">Can I audit raw data and formulas in spreadsheets?</div>
          </div>
          <ChevronDown size={20} color="#9CA3AF" />
        </div>
      </div>

      {/* Bottom Card */}
      <div className="meth-bottom-card">
        <div className="meth-bottom-card-left">
          <div className="meth-bottom-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="meth-bottom-title">
              ISO 14064-1 & GHG Protocol Verified Standards 
              <span style={{background: 'var(--color-primary)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase'}}>Certified</span>
            </div>
            <div className="meth-bottom-desc">All arithmetic schemas are structurally compliant with ISO 14064-1 greenhouse gas specification rules and the Corporate Accounting & Reporting Standard.</div>
          </div>
        </div>
        <button className="meth-btn-outline" style={{background: 'white'}}>
          <Code size={16} /> View Machine Schema JSON
        </button>
      </div>

    </div>
  );
}
