import Sidebar from '../../components/Sidebar'

export default function AuditLogs() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Audit Logs</h1>
            <p>Immutable record of all security and transaction events</p>
          </div>
          <button className="btn btn-outline btn-sm" disabled>Export Logs</button>
        </div>
        <div className="card">
          <div className="empty-state">
            <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <p>Audit log viewer coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}
