import { useState } from 'react';
import {
  Server,
  Layers,
  Cpu,
  BarChart3,
  RefreshCw,
  Database,
  RotateCcw,
  Download,
  Upload,
  PlayCircle,
  Compass
} from 'lucide-react';

export default function Navbar({
  appMode = 'operational',
  setAppMode,
  activeTab,
  setActiveTab,
  isPresentationMode = false,
  setIsPresentationMode,
  onResetOfficial,
  onOpenTestRunner,
  onExportJSON,
  onImportJSON,
  isDbReady = true
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const operationalNavItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'labs-requests', label: 'Labs & Requests', icon: Server },
    { id: 'allocation', label: 'Allocation Engine', icon: Cpu },
    { id: 'analytics', label: 'Comparison & Analytics', icon: BarChart3 },
    { id: 'rescheduling', label: 'Dynamic Rescheduling', icon: RefreshCw, badge: '15 Marks' }
  ];

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand-group">
          <div className="brand-logo-container">
            <Cpu className="brand-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-row">
              <span className="brand-name">LABWISE</span>
              <span className="brand-edition-badge">CODE CRACK 3.0</span>
            </div>
            <div className="brand-subtitle">
              Campus Laboratory Allocation & Optimization System
            </div>
          </div>
        </div>

        {/* Central Mode Switcher: Operational vs Algorithm Lab */}
        <div className="app-mode-switch-wrapper">
          <div className="app-mode-toggle-box">
            <button
              className={`mode-toggle-option ${appMode === 'operational' ? 'active' : ''}`}
              onClick={() => setAppMode('operational')}
            >
              <Layers size={14} />
              <span>Operational Mode</span>
            </button>

            <button
              className={`mode-toggle-option ${appMode === 'evaluation' ? 'active' : ''}`}
              onClick={() => setAppMode('evaluation')}
            >
              <Cpu size={14} className="text-violet" />
              <span>Algorithm Lab</span>
              <span className="mode-sub-badge">EVALUATION</span>
            </button>
          </div>
        </div>

        {/* Global System Actions */}
        <div className="navbar-actions">
          {/* 5-Min Guided Demo Launcher */}
          <button
            className={`btn btn-sm pres-launcher-btn ${isPresentationMode ? 'active' : ''}`}
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            title="Start or toggle guided 5-minute competition evaluation walkthrough"
          >
            <Compass size={14} className="text-amber" />
            <span>5-Min Demo</span>
          </button>

          {/* Storage Status */}
          <div className="db-status-pill" title="Local browser IndexedDB storage active">
            <span className={`status-dot ${isDbReady ? 'online' : 'sync'}`}></span>
            <Database size={13} />
            <span>IndexedDB</span>
          </div>

          {/* Test Runner Button */}
          <button
            className="btn btn-secondary btn-sm test-runner-btn"
            onClick={onOpenTestRunner}
            title="Run the 10 automated competition verification tests"
          >
            <PlayCircle size={14} className="text-blue" />
            <span>Verify (10 Tests)</span>
          </button>

          {/* Reset to Official Sample Data */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowResetConfirm(true)}
            title="Reset to official sample dataset"
          >
            <RotateCcw size={13} />
            <span>Reset Data</span>
          </button>

          {/* Export JSON */}
          <button
            className="btn btn-secondary btn-sm icon-only-btn"
            onClick={onExportJSON}
            title="Export complete database as JSON"
          >
            <Download size={14} />
          </button>

          {/* Import JSON */}
          <label
            className="btn btn-secondary btn-sm icon-only-btn"
            title="Import database from JSON"
            style={{ cursor: 'pointer' }}
          >
            <Upload size={14} />
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => onImportJSON(event.target.result);
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Operational Mode Navigation Tabs (Only rendered in operational mode) */}
      {appMode === 'operational' && (
        <div className="operational-tabs-bar">
          <div className="operational-tabs-container">
            <nav className="navbar-tabs">
              {operationalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-special-badge">{item.badge}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={18} className="text-amber" />
                Restore Official Dataset?
              </h3>
            </div>
            <div className="modal-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              <p>
                This will reset all laboratories and requests back to the official Code Crack 3.0 problem statement dataset:
              </p>
              <ul style={{ margin: '12px 0 12px 20px', lineHeight: 1.6 }}>
                <li><strong>4 Laboratories:</strong> Lab A (60), Lab B (40), Lab C (50), Lab D (30)</li>
                <li><strong>5 Requests:</strong> R1 (CSE, 55), R2 (IT, 35), R3 (AI & DS, 45), R4 (ECE, 25), R5 (MCA, 40)</li>
              </ul>
              <p style={{ fontSize: 13, color: '#f87171' }}>
                Any custom laboratory or request modifications will be replaced.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetOfficial();
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
