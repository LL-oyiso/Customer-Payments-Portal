import { useState, useEffect, useMemo, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-ZA', { style: 'decimal', minimumFractionDigits: 2 }).format(amount) + ' ' + currency

const DATE_RANGES = {
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  '365': 'This year',
  'all': 'All time',
}

const badgeClass = (status) => {
  if (status === 'PENDING') return 'badge badge-pending'
  if (status === 'VERIFIED') return 'badge badge-verified'
  return 'badge badge-submitted'
}

export default function AllTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  const [dateRange, setDateRange] = useState('30')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currencyFilter, setCurrencyFilter] = useState('ALL')
  // Captured once on mount so date filtering stays pure across re-renders
  const [nowTs] = useState(() => Date.now())

  const fetchAll = useCallback(() => {
    setLoading(true)
    api.get('/transactions/all')
      .then(({ data }) => {
        setTransactions(data.transactions)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load transaction history.')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    api.get('/transactions/all')
      .then(({ data }) => {
        setTransactions(data.transactions)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load transaction history.')
        setLoading(false)
      })
  }, [])

  const currencies = useMemo(
    () => [...new Set(transactions.map((tx) => tx.currency))].sort((a, b) => a.localeCompare(b)),
    [transactions]
  )

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false
      if (currencyFilter !== 'ALL' && tx.currency !== currencyFilter) return false
      if (dateRange !== 'all') {
        const days = Number.parseInt(dateRange, 10)
        const cutoff = nowTs - days * 24 * 60 * 60 * 1000
        if (new Date(tx.createdAt).getTime() < cutoff) return false
      }
      return true
    })
  }, [transactions, statusFilter, currencyFilter, dateRange, nowTs])

  const exportCsv = () => {
    const headers = ['Customer', 'Account', 'Amount', 'Currency', 'Payee Account', 'SWIFT Code', 'Status', 'Verified By', 'Date']
    const rows = filtered.map((tx) => [
      tx.customer?.fullName || '',
      tx.customer?.accountNumber || '',
      tx.amount,
      tx.currency,
      tx.payeeAccount,
      tx.payeeSwiftCode,
      tx.status,
      tx.verifiedBy?.fullName || '',
      new Date(tx.createdAt).toISOString(),
    ])
    const escape = (v) => `"${String(v).replaceAll('"', '""')}"`
    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>
              All Transactions{' '}
              <span className="staff-badge">Staff</span>
            </h1>
            <p>Complete, read-only transaction history across all customers — retained for audit</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchAll} disabled={loading}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={styles.card}>
          <div style={styles.filters}>
            <div style={styles.filterGroup}>
              <label style={styles.label} htmlFor="filter-date">Date Range</label>
              <select id="filter-date" style={styles.select} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                {Object.entries(DATE_RANGES).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label} htmlFor="filter-status">Status</label>
              <select id="filter-status" style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="SUBMITTED">Submitted</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label} htmlFor="filter-currency">Currency</label>
              <select id="filter-currency" style={styles.select} value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}>
                <option value="ALL">All currencies</option>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={exportCsv} disabled={filtered.length === 0}>
              Export CSV
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                <p>No transactions match the selected filters</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>SWIFT Code</th>
                      <th>Status</th>
                      <th>Verified By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: 600 }}>{tx.customer?.fullName || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tx.customer?.accountNumber || '—'}</td>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatAmount(tx.amount, tx.currency)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{tx.payeeSwiftCode}</td>
                        <td><span className={badgeClass(tx.status)}>{tx.status}</span></td>
                        <td>{tx.verifiedBy?.fullName || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <div style={styles.count}>
              Showing {filtered.length} of {transactions.length} total transaction{transactions.length === 1 ? '' : 's'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const styles = {
  card: { padding: '1.5rem' },
  filters: { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.78rem', fontWeight: '600', color: '#6b7280' },
  select: { padding: '0.5rem 0.75rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', color: '#374151', background: '#fff' },
  count: { marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'right' },
}
