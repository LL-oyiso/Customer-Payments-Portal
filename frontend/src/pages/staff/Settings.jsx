import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../AuthContext'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your staff account preferences</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '800px' }}>
          {/* Profile */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 style={styles.sectionTitle}>Profile Information</h2>
            <div style={styles.profileRow}>
              <div style={styles.avatar}>{user?.fullName?.charAt(0) || 'S'}</div>
              <div>
                <div style={styles.profileName}>{user?.fullName}</div>
                <div style={styles.profileRole}>Staff Member · {user?.username}</div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <h2 style={styles.sectionTitle}>Security</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" disabled>Change Password</button>
              <button className="btn btn-outline btn-sm" disabled>Enable 2FA</button>
              <button className="btn btn-outline btn-sm" disabled>View Active Sessions</button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 style={styles.sectionTitle}>Notifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['New pending transactions', 'Daily summary report', 'Failed login alerts'].map((item) => (
                <div key={item} style={styles.toggleRow}>
                  <span style={{ fontSize: '0.88rem', color: '#374151' }}>{item}</span>
                  <div style={styles.toggleOff} />
                </div>
              ))}
            </div>
          </div>

          {/* System */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 style={styles.sectionTitle}>System</h2>
            <div className="alert alert-info">
              Advanced settings are managed by your system administrator.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' },
  profileRow:   { display: 'flex', alignItems: 'center', gap: '1rem' },
  avatar:       { width: '52px', height: '52px', borderRadius: '50%', background: '#14532d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700' },
  profileName:  { fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' },
  profileRole:  { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem' },
  toggleRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  toggleOff:    { width: '36px', height: '20px', borderRadius: '10px', background: '#d1d5db', cursor: 'not-allowed' },
}
