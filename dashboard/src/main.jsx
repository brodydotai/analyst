import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import WorkflowPage from './WorkflowPage.jsx'
import './style.css'

function Shell() {
  const [page, setPage] = useState("reports");

  return (
    <div className="app-shell">
      <nav className="global-nav">
        <div className="global-nav-left">
          <span className="global-nav-brand">Analyst</span>
        </div>
        <div className="global-nav-tabs">
          <button
            type="button"
            className={`global-nav-tab ${page === "reports" ? "active" : ""}`}
            onClick={() => setPage("reports")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h2v16H4V4zm14 6h2v10h-2V10zM9 12h2v8H9v-8zm5-8h2v16h-2V4z" /></svg>
            Reports
          </button>
          <button
            type="button"
            className={`global-nav-tab ${page === "workflow" ? "active" : ""}`}
            onClick={() => setPage("workflow")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
            Workflow
          </button>
        </div>
        <div className="global-nav-right" />
      </nav>
      <div className="page-content">
        {page === "reports" ? <App /> : <WorkflowPage />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
)
