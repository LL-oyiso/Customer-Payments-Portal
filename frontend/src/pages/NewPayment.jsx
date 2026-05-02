import Sidebar from '../components/Sidebar'

export default function NewPayment() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>New Payment</h1>
          <p>Submit an international payment</p>
        </div>
        <div className="card">
          <p style={{ color: '#6b7280' }}>Payment form coming soon...</p>
        </div>
      </main>
    </div>
  )
}
