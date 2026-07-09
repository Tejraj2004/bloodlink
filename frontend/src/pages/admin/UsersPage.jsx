import React, { useState, useEffect } from 'react'
import { Search, UserCheck, UserX, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { PageLoader, StatusBadge, EmptyState } from '../../components/shared/UI'

const roleColors = {
  admin:'bg-purple-100 text-purple-700', bloodbank:'bg-red-100 text-red-700',
  hospital:'bg-blue-100 text-blue-700', donor:'bg-green-100 text-green-700',
  patient:'bg-amber-100 text-amber-700', ambulance:'bg-orange-100 text-orange-700',
}

export default function UsersPage() {
  const [tab, setTab]               = useState('users') // users | verifications
  const [users, setUsers]           = useState([])
  const [pending, setPending]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/admin/users?search=${search}&role=${roleFilter}`),
      api.get('/admin/verifications'),
    ]).then(([u, v]) => {
      setUsers(u.data.data || [])
      setPending(v.data.data.pending || [])
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, roleFilter])

  const toggleUser = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`)
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`)
      load()
    } catch { toast.error('Action failed') }
  }

  const verify = async (userId, entityType, action) => {
    try {
      await api.post('/admin/verify', { userId, entityType, action })
      toast.success(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`)
      load()
    } catch { toast.error('Verification failed') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all platform users and verifications</p>
        </div>
        <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
      </div>

      {/* Pending verification alert */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Clock size={20} className="text-amber-600 flex-shrink-0"/>
          <div className="flex-1 text-sm text-amber-800">
            <span className="font-bold">{pending.length}</span> hospitals/blood banks are awaiting verification.
          </div>
          <button onClick={() => setTab('verifications')} className="text-xs font-semibold text-amber-700 hover:underline">
            Review →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        {[['users','All Users'],['verifications',`Verifications (${pending.length})`]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab===id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input className="input pl-9 py-2 text-sm" placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="input py-2 text-sm w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {['admin','donor','patient','hospital','bloodbank','ambulance'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {loading ? <PageLoader /> : users.length === 0 ? (
            <EmptyState icon="👥" title="No users found" description="No users match your filters."/>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">
                    {['User','Email','Role','Verified','Joined','Status','Action'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                              {u.avatar
                                ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover"/>
                                : u.name?.[0]
                              }
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-[120px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-gray-500 truncate max-w-[160px]">{u.email}</td>
                        <td className="table-cell">
                          <span className={`badge text-xs px-2 py-0.5 rounded-full ${roleColors[u.role]}`}>{u.role}</span>
                        </td>
                        <td className="table-cell">
                          {u.isEmailVerified
                            ? <CheckCircle size={15} className="text-green-500"/>
                            : <Clock size={15} className="text-gray-300"/>}
                        </td>
                        <td className="table-cell text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="table-cell">
                          <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => toggleUser(u._id, u.isActive)}
                            className={`text-xs font-medium hover:underline ${u.isActive ? 'text-red-500' : 'text-green-600'}`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Verifications Tab */}
      {tab === 'verifications' && (
        pending.length === 0 ? (
          <EmptyState icon="✅" title="All caught up!" description="No pending verifications at the moment."/>
        ) : (
          <div className="space-y-4">
            {pending.map(({ user: u, profile }) => (
              <div key={u._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center font-bold text-primary-700 flex-shrink-0">
                      {u.name?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email} · {u.phone}</div>
                      <span className={`badge text-xs mt-1 ${roleColors[u.role]}`}>{u.role}</span>
                      {profile && (
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          <div><span className="font-medium">Name:</span> {profile.hospitalName || profile.bankName}</div>
                          <div><span className="font-medium">City:</span> {profile.city}</div>
                          <div><span className="font-medium">License/Reg:</span> {profile.licenseNo || profile.registrationNo}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => verify(u._id, u.role, 'reject')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                      <UserX size={15}/> Reject
                    </button>
                    <button
                      onClick={() => verify(u._id, u.role, 'approve')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all">
                      <UserCheck size={15}/> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
