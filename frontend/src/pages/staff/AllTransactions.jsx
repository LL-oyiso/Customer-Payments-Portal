import Sidebar from '../../components/Sidebar'

export default function AllTransactions() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>All Transactions</h1>
          <p>Complete transaction history across all customers</p>
        </div>
        <div className="card" style={styles.card}>
          <div style={styles.filters}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Date Range</label>
              <select style={styles.select} disabled><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Status</label>
              <select style={styles.select} disabled><option>All</option><option>Pending</option><option>Verified</option><option>Submitted</option></select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Currency</label>
              <select style={styles.select} disabled><option>All currencies</option></select>
            </div>
            <button className="btn btn-primary btn-sm" disabled>Export CSV</button>
          </div>
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            This module is currently under development and will be available in the next release.
          </div>
          <div style={styles.mockTable}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={styles.mockRow}>
                <div style={{ ...styles.mockCell, width: '15%', background: '#e5e7eb', borderRadius: 4 }} />
                <div style={{ ...styles.mockCell, width: '20%', background: '#e5e7eb', borderRadius: 4 }} />
                <div style={{ ...styles.mockCell, width: '12%', background: '#e5e7eb', borderRadius: 4 }} />
                <div style={{ ...styles.mockCell, width: '25%', background: '#e5e7eb', borderRadius: 4 }} />
                <div style={{ ...styles.mockCell, width: '10%', background: '#dcfce7', borderRadius: 4 }} />
              </div>
            ))}
          </div>
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
  select: { padding: '0.5rem 0.75rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', color: '#9ca3af', background: '#f9fafb' },
  mockTable: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.4 },
  mockRow: { display: 'flex', gap: '1rem', alignItems: 'center' },
  mockCell: { height: '18px', flexShrink: 0 },
}
