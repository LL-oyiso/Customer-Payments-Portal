import Sidebar from '../components/Sidebar'

export default function TransactionHistory() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>My Transactions</h1>
          <p>Your payment history</p>
        </div>
        <div className="card">
          <p style={{ color: '#6b7280' }}>Transaction history coming soon...</p>
        </div>
      </main>
    </div>
  )
}
