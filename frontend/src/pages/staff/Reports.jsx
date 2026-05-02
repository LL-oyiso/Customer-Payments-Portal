import Sidebar from '../../components/Sidebar'

const reportCards = [
  { title: 'Monthly SWIFT Volume',     desc: 'Total value of payments submitted to SWIFT per month', icon: '📊' },
  { title: 'Currency Breakdown',       desc: 'Distribution of transactions by currency code',         icon: '💱' },
  { title: 'Processing Time Report',   desc: 'Average time from submission to SWIFT forwarding',      icon: '⏱️' },
  { title: 'Failed Transactions',      desc: 'Transactions that were rejected or flagged',            icon: '🚫' },
  { title: 'Staff Activity Log',       desc: 'Number of verifications and submissions per staff',     icon: '👤' },
  { title: 'Compliance Summary',       desc: 'Audit-ready summary of all SWIFT-submitted payments',  icon: '📋' },
]

export default function Reports() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Reports</h1>
          <p>Analytics and compliance reporting for international payments</p>
        </div>

        <div className="alert alert-info">
          Reporting module is under development and will be available in the next release.
        </div>

        <div style={styles.grid}>
          {reportCards.map((r, i) => (
            <div key={i} className="card" style={styles.reportCard}>
              <div style={styles.icon}>{r.icon}</div>
              <h3 style={styles.title}>{r.title}</h3>
              <p style={styles.desc}>{r.desc}</p>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} disabled>
                Generate Report
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles = {
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' },
  reportCard: { display: 'flex', flexDirection: 'column', opacity: 0.75 },
  icon:       { fontSize: '1.75rem', marginBottom: '0.75rem' },
  title:      { fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' },
  desc:       { fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5', flex: 1 },
}
