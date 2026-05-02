import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'

const CustomerNav = () => (
  <>
    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      Dashboard
    </NavLink>
    <NavLink to="/new-payment" className={({ isActive }) => isActive ? 'active' : ''}>
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      New Payment
    </NavLink>
    <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
      My Transactions
    </NavLink>
  </>
)

const StaffNav = () => (
  <NavLink to="/staff" className={({ isActive }) => isActive ? 'active' : ''}>
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
    Transaction Queue
  </NavLink>
)

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="RAND" />
        <span>RAND</span>
      </div>

      <nav className="sidebar-nav">
        {user?.role === 'CUSTOMER' ? <CustomerNav /> : <StaffNav />}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.75rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 600, color: 'white' }}>{user?.fullName}</div>
          <div>{user?.role === 'STAFF' ? 'Staff Member' : 'Customer'}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'transparent', color:'rgba(255,255,255,0.65)', fontSize:'0.85rem', fontWeight:500, padding:'0.4rem 0', border:'none', cursor:'pointer', width:'100%' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
