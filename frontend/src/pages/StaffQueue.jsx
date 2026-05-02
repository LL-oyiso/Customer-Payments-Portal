import Sidebar from '../components/Sidebar'

export default function StaffQueue() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Transaction Queue <span className="staff-badge">Staff</span></h1>
          <p>Review and process pending payments</p>
        </div>
        <div className="card">
          <p style={{ color: '#6b7280' }}>Staff queue coming soon...</p>
        </div>
      </main>
    </div>
  )
}
