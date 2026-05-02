import Sidebar from '../../components/Sidebar'

const mockLogs = [
  { time: '2026-05-02 17:34:12', user: 'staff01',   action: 'VERIFY_TRANSACTION',     entity: 'TXN-0021', ip: '127.0.0.1', success: true },
  { time: '2026-05-02 17:31:05', user: 'staff01',   action: 'SUBMIT_TO_SWIFT',        entity: 'TXN-0019', ip: '127.0.0.1', success: true },
  { time: '2026-05-02 17:10:44', user: 'LL_oyiso',  action: 'CREATE_TRANSACTION',     entity: 'TXN-0021', ip: '127.0.0.1', success: true },
  { time: '2026-05-02 17:08:22', user: 'LL_oyiso',  action: 'LOGIN',                  entity: 'USER',     ip: '127.0.0.1', success: true },
  { time: '2026-05-02 16:55:01', user: 'unknown',   action: 'LOGIN',                  entity: 'USER',     ip: '192.168.1.4', success: false },
  { time: '2026-05-02 16:54:58', user: 'unknown',   action: 'LOGIN',                  entity: 'USER',     ip: '192.168.1.4', success: false },
  { time: '2026-05-02 16:30:10', user: 'staff02',   action: 'VERIFY_TRANSACTION',     entity: 'TXN-0018', ip: '127.0.0.1', success: true },
]

export default function AuditLogs() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Audit Logs</h1>
            <p>Immutable record of all security and transaction events</p>
          </div>
          <button className="btn btn-outline btn-sm" disabled>Export Logs</button>
        </div>

        <div className="alert alert-info">
          Displaying sample audit data. Live audit log viewer is under development.
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {mockLogs.map((log, i) => (
                  <tr key={i} style={{ opacity: 0.75 }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.time}</td>
                    <td style={{ fontWeight: 600 }}>{log.user}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#374151' }}>{log.action}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.entity}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip}</td>
                    <td>
                      <span className={`badge ${log.success ? 'badge-submitted' : 'badge-pending'}`}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
