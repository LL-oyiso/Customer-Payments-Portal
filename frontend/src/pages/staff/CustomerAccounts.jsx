import Sidebar from '../../components/Sidebar'

export default function CustomerAccounts() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Customer Accounts</h1>
            <p>View and manage registered customer profiles</p>
          </div>
          <button className="btn btn-primary" disabled>+ Add Customer</button>
        </div>
        <div className="card">
          <div className="empty-state">
            <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <p>Customer accounts module coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}
