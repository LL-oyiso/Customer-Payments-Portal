import Sidebar from '../../components/Sidebar'

export default function Reports() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Reports</h1>
          <p>Analytics and compliance reporting for international payments</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <p>Reporting module coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}
