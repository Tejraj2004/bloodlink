import React, { useState, useEffect, useCallback } from 'react'
import { Users, Droplets, Building2, ClipboardList, AlertTriangle, Truck, Package, Activity, RefreshCw, Bell, CheckCircle, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { StatCard, PageLoader, BloodGroupBadge, StatusBadge, Alert, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1 font-medium">{label}</p>
      {payload.map((p,i)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { thresholdAlerts, newRequests, inventoryUpdates, onlineCounts } = useSync()
  const [stats, setStats]         = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [pending, setPending]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [verifying, setVerifying] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics'),
      api.get('/admin/verifications'),
    ]).then(([s,a,v]) => {
      setStats(s.data.data)
      setAnalytics(a.data.data)
      setPending(v.data.data.pending||[])
    }).catch(console.error).finally(()=>setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh on sync events
  useEffect(() => { if (newRequests.length||inventoryUpdates.length) load() }, [newRequests.length, inventoryUpdates.length])

  const verify = async (userId, entityType, action) => {
    setVerifying(userId)
    try {
      await api.post('/admin/verify', { userId, entityType, action })
      toast.success(`${action==='approve'?'✅ Approved':'❌ Rejected'} — entity notified in real-time.`)
      load()
    } catch { toast.error('Action failed') }
    finally { setVerifying(null) }
  }

  if (loading) return <PageLoader/>

  const trendData = MONTHS.slice(0,6).map((m,i)=>({
    month:m,
    donations: analytics?.monthlyDonations?.[i]?.count||0,
    requests:  analytics?.monthlyRequests?.[i]?.count||0,
  }))

  const invData = stats?.inventorySummary
    ? Object.entries(stats.inventorySummary).map(([g,v])=>({ group:g, total:v.rbc+v.plasma+v.platelets+v.wholeBlood, rbc:v.rbc }))
    : []

  const critGlobal = (stats?.globalAlerts||[]).filter(a=>a.level==='critical')
  const totalOnline = Object.values(onlineCounts).reduce((a,b)=>a+b,0)

  return (
    <div className="space-y-6 animate-fade-in">
      <SyncBanner/>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            Platform overview · {totalOnline > 0 && <span className="text-green-600 font-medium">{totalOnline} users online now</span>}
          </p>
        </div>
        <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
      </div>

      {/* Critical alerts */}
      {critGlobal.map((a,i) => (
        <Alert key={i} type="error" message={`⚠️ CRITICAL: ${a.bloodGroup} only ${a.total} units at ${a.bankName}, ${a.city}`}/>
      ))}

      {/* Pending verifications alert */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-amber-600"/>
            <span className="text-amber-800 font-semibold text-sm">{pending.length} hospital/blood bank account(s) awaiting your verification</span>
          </div>
          <button onClick={()=>document.getElementById('verifications')?.scrollIntoView({behavior:'smooth'})}
            className="text-amber-700 text-xs font-bold hover:underline">Review →</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22}/>}         label="Registered Donors"  value={stats?.totalDonors?.toLocaleString()||0}  color="red"    sub="Active donors"/>
        <StatCard icon={<Package size={22}/>}        label="Total Blood Units"  value={stats?.totalUnits?.toLocaleString()||0}   color="green"  sub="Approved units"/>
        <StatCard icon={<AlertTriangle size={22}/>}  label="Critical Requests"  value={stats?.criticalRequests||0}               color="amber"  sub="Need action"/>
        <StatCard icon={<Truck size={22}/>}          label="Active Deliveries"  value={stats?.activeDeliveries||0}               color="blue"   sub="In transit now"/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Droplets size={22}/>}       label="Donations Today"    value={stats?.donationsToday||0}                 color="red"    sub="New collections"/>
        <StatCard icon={<ClipboardList size={22}/>}  label="Requests Today"     value={stats?.requestsToday||0}                  color="purple" sub="New requests"/>
        <StatCard icon={<Activity size={22}/>}       label="Fulfilled Today"    value={stats?.fulfilledToday||0}                  color="green"  sub="Completed"/>
        <StatCard icon={<Building2 size={22}/>}      label="Pending Approvals"  value={stats?.pendingVerifications||0}           color="amber"  sub="Awaiting review"/>
      </div>

      {/* Trend Chart */}
      <div className="card">
        <div className="section-header mb-5">
          <h2 className="section-title">Donations vs Requests (6 months)</h2>
          <span className="badge-green">Live Data</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/><stop offset="95%" stopColor="#dc2626" stopOpacity={0}/></linearGradient>
              <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.12}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:12}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fill:'#9ca3af',fontSize:12}}/>
            <Tooltip content={<ChartTip/>}/>
            <Area type="monotone" dataKey="donations" name="Donations" stroke="#dc2626" strokeWidth={2.5} fill="url(#gD)"/>
            <Area type="monotone" dataKey="requests"  name="Requests"  stroke="#2563eb" strokeWidth={2}   fill="url(#gR)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* National Inventory */}
      <div className="card">
        <h2 className="section-title mb-4">National Inventory Overview</h2>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {invData.map(item => {
            const crit = item.rbc < 5
            const low  = item.rbc < 15
            return (
              <div key={item.group} className={`rounded-xl p-3 text-center border ${crit?'bg-red-50 border-red-200':low?'bg-amber-50 border-amber-100':'bg-gray-50 border-gray-100'}`}>
                <div className={`font-bold text-sm ${crit?'text-red-600':low?'text-amber-600':'text-gray-800'}`}>{item.group}</div>
                <div className={`text-2xl font-black mt-1 ${crit?'text-red-700':'text-gray-900'}`}>{item.rbc}</div>
                <div className="text-xs text-gray-400">RBC</div>
                {crit&&<div className="text-xs font-bold text-red-500 mt-1">CRITICAL</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Online Users by Role */}
      {totalOnline > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Online Users by Role</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(onlineCounts).filter(([,v])=>v>0).map(([role,count])=>(
              <div key={role} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                <span className="text-green-800 text-sm font-semibold capitalize">{count} {role}{count>1?'s':''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Verifications */}
      {pending.length > 0 && (
        <div className="card" id="verifications">
          <h2 className="section-title mb-4">Pending Verifications ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map(({ user:u, profile }) => (
              <div key={u._id} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center font-bold text-red-700 flex-shrink-0 text-lg">
                    {u.name?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email} · {u.phone}</div>
                    <span className={`badge text-xs mt-1 ${u.role==='hospital'?'badge-blue':'badge-red'}`}>{u.role}</span>
                    {profile && (
                      <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        <div><span className="font-medium">Name: </span>{profile.hospitalName||profile.bankName}</div>
                        <div><span className="font-medium">City: </span>{profile.city}</div>
                        <div><span className="font-medium">Reg/License: </span>{profile.registrationNo||profile.licenseNo}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={()=>verify(u._id,u.role,'reject')} disabled={verifying===u._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                    <XCircle size={15}/> Reject
                  </button>
                  <button onClick={()=>verify(u._id,u.role,'approve')} disabled={verifying===u._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all">
                    <CheckCircle size={15}/> {verifying===u._id?'Processing...':'Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
