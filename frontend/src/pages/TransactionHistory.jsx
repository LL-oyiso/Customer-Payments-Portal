import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-ZA', { style: 'decimal', minimumFractionDigits: 2 }).format(amount) + ' ' + currency

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [filter, setFilter]             = useState('ALL')

  useEffect(() => {
    api.get('/transactions')
      .then(({ data }) => setTransactions(data.transactions))
      .catch(() => setError('Could not load transactions.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter((t) => t.status === filter)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>My Transactions</h1>
            <p>Full history of your international payments</p>
          </div>
          <Link to="/new-payment" className="btn btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            New Payment
          </Link>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {['ALL', 'PENDING', 'VERIFIED', 'SUBMITTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {}),
              }}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              <span style={styles.filterCount}>
                {f === 'ALL' ? transactions.length : transactions.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>{filter === 'ALL' ? 'No transactions yet' : `No ${filter.toLowerCase()} transactions`}</p>
              {filter === 'ALL' && (
                <Link to="/new-payment" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  Make your first payment
                </Link>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Payee Account</th>
                    <th>SWIFT Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.createdAt)}</td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatAmount(tx.amount, tx.currency)}</td>
                      <td>{tx.provider}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tx.payeeAccount}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tx.payeeSwiftCode}</td>
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
  filterRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '999px',
    border: '1.5px solid #d1d5db',
    background: 'white',
    color: '#374151',
    fontSize: '0.83rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: '#14532d',
    borderColor: '#14532d',
    color: 'white',
  },
  filterCount: {
    background: 'rgba(0,0,0,0.08)',
    borderRadius: '999px',
    padding: '0 0.4rem',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
}
