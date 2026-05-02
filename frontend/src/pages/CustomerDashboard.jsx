import Sidebar from '../components/Sidebar'
import { useAuth } from '../AuthContext'

export default function CustomerDashboard() {
  const { user } = useAuth()
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p>Here is an overview of your account</p>
        </div>
        <div className="card">
          <p style={{ color: '#6b7280' }}>Dashboard coming soon...</p>
        </div>
      </main>
    </div>
  )
}
