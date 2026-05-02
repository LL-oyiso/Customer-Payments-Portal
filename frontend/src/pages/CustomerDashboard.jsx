import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:   'badge badge-pending',
    VERIFIED:  'badge badge-verified',
    SUBMITTED: 'badge badge-submitted',
  }
  return <span className={map[status] || 'badge'}>{status}</span>
}

const maskAccount = (num) =>
  num ? `•••• •••• ${num.slice(-4)}` : '—'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-ZA', { style: 'decimal', minimumFractionDigits: 2 }).format(amount) + ' ' + currency

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    api.get('/transactions')
      .then(({ data }) => setTransactions(data.transactions))
      .catch(() => setError('Could not load transactions.'))
      .finally(() => setLoading(false))
  }, [])

  const pending   = transactions.filter((t) => t.status === 'PENDING').length
  const submitted = transactions.filter((t) => t.status === 'SUBMITTED').length
  const recent    = transactions.slice(0, 5)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <h1>Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p>Here is an overview of your account activity</p>
        </div>

        {/* Account card */}
        <div style={styles.accountCard}>
          <div style={styles.accountLeft}>
            <div style={styles.accountLabel}>Account Number</div>
            <div style={styles.accountNumber}>{maskAccount(user?.accountNumber || '00000000')}</div>
            <div style={styles.accountName}>{user?.fullName}</div>
          </div>
          <div style={styles.accountRight}>
            <Link to="/new-payment" className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              New Payment
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div style={styles.statsRow}>
          <div className="card" style={styles.statCard}>
            <div style={styles.statLabel}>Total Payments</div>
            <div style={styles.statValue}>{transactions.length}</div>
          </div>
          <div className="card" style={styles.statCard}>
            <div style={styles.statLabel}>Pending</div>
            <div style={{ ...styles.statValue, color: '#d97706' }}>{pending}</div>
          </div>
          <div className="card" style={styles.statCard}>
            <div style={styles.statLabel}>Submitted to SWIFT</div>
            <div style={{ ...styles.statValue, color: '#14532d' }}>{submitted}</div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Recent Transactions</h2>
            <Link to="/transactions" style={styles.viewAll}>View all →</Link>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Loading...
            </div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>No transactions yet</p>
              <Link to="/new-payment" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Make your first payment
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Payee SWIFT</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td style={{ fontWeight: 600 }}>{formatAmount(tx.amount, tx.currency)}</td>
                      <td>{tx.provider}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx.payeeSwiftCode}</td>
                      <td><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const styles = {
  accountCard: {
    background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
    borderRadius: '12px',
    padding: '1.75rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    color: 'white',
    boxShadow: '0 4px 16px rgba(20,83,45,0.25)',
  },
  accountLeft:   { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  accountLabel:  { fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  accountNumber: { fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.1em' },
  accountName:   { fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' },
  accountRight:  {},
  statsRow:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  statCard:  { textAlign: 'center' },
  statLabel: { fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#0f172a' },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  tableTitle:  { fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' },
  viewAll:     { fontSize: '0.85rem', color: '#14532d', fontWeight: '600' },
}
