import Sidebar from '../../components/Sidebar'

const mockCustomers = [
  { name: 'Loyiso Tose',    account: '••• 4821', joined: '01 May 2026', transactions: 3,  status: 'Active' },
  { name: 'Thabo Nkosi',    account: '••• 7734', joined: '28 Apr 2026', transactions: 1,  status: 'Active' },
  { name: 'Ayanda Dlamini', account: '••• 2219', joined: '25 Apr 2026', transactions: 7,  status: 'Active' },
  { name: 'Sipho Mokoena',  account: '••• 9943', joined: '20 Apr 2026', transactions: 0,  status: 'Inactive' },
  { name: 'Naledi Sithole', account: '••• 3367', joined: '15 Apr 2026', transactions: 12, status: 'Active' },
]

export default function CustomerAccounts() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Customer Accounts</h1>
            <p>View and manage registered customer profiles</p>
          </div>
          <button className="btn btn-primary" disabled>+ Add Customer</button>
        </div>

        <div className="alert alert-info">
          This module is currently under development. Displaying sample data only.
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Account</th>
                  <th>Date Joined</th>
                  <th>Transactions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCustomers.map((c, i) => (
                  <tr key={i} style={{ opacity: 0.65 }}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{c.account}</td>
                    <td>{c.joined}</td>
                    <td>{c.transactions}</td>
                    <td>
                      <span className={`badge ${c.status === 'Active' ? 'badge-submitted' : 'badge-pending'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" disabled>View</button>
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
