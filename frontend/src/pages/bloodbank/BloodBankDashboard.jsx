import React, { useState, useEffect, useCallback } from 'react'
import { Package, Droplets, FlaskConical, AlertTriangle, Plus, RefreshCw, Bell, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { StatCard, PageLoader, BloodGroupBadge, StatusBadge, Modal, Alert, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const COMPONENTS   = ['Whole Blood','RBC','Plasma','Platelets','Cryoprecipitate']

export default function BloodBankDashboard() {
  const { newRequests, inventoryUpdates, thresholdAlerts } = useSync()
  const [data, setData]         = useState(null)
  const [units, setUnits]       = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')
  const [showAddModal, setShowAddModal]   = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ bloodGroup:'O+', component:'Whole Blood', volume:450, notes:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/bloodbank/dashboard'),
      api.get('/bloodbank/units?limit=30'),
      api.get('/requests?status=Pending,Processing'),
    ]).then(([d,u,r]) => {
      setData(d.data.data)
      setUnits(u.data.data||[])
      setRequests(r.data.data||[])
    }).catch(console.error).finally(()=>setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Refresh inventory when real-time update received
  useEffect(() => {
    if (inventoryUpdates.length) load()
  }, [inventoryUpdates.length])

  // Show new request notification
  useEffect(() => {
    if (newRequests.length) {
      setRequests(prev => {
        const ids = new Set(prev.map(r=>r._id||r.requestId))
        const fresh = newRequests.filter(r=>!ids.has(r._id||r.requestId))
        return [...fresh, ...prev].slice(0,50)
      })
    }
  }, [newRequests])

  const handleAddUnit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/bloodbank/units', form)
      toast.success('Blood unit recorded!')
      setShowAddModal(false)
      load()
    } catch(err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSubmitting(false) }
  }

  const updateTTI = async (unitId, result) => {
    try {
      await api.put(`/bloodbank/units/${unitId}/tti`, result)
      toast.success(result.hiv==='Clear' ? '✅ Unit approved & inventory updated!' : '❌ Unit rejected')
      load()
    } catch { toast.error('TTI update failed') }
  }

  const issueToHospital = async (requestId) => {
    const req = requests.find(r=>r._id===requestId)
    if (!req) return
    setSelectedRequest(req)
    setShowIssueModal(true)
  }

  const confirmIssue = async () => {
    if (!selectedRequest) return
    setSubmitting(true)
    try {
      // Find available approved units matching blood group + component
      const { data } = await api.get(`/bloodbank/units?status=Approved&bloodGroup=${selectedRequest.bloodGroup}&limit=10`)
      const matchingUnits = (data.data||[]).filter(u=>u.component===selectedRequest.component||u.component==='Whole Blood').slice(0, selectedRequest.units)
      if (!matchingUnits.length) { toast.error('No approved units available for this request'); return }
      await api.post('/bloodbank/issue', {
        unitIds: matchingUnits.map(u=>u._id),
        requestId: selectedRequest._id,
        hospitalId: selectedRequest.hospital,
      })
      toast.success(`✅ ${matchingUnits.length} unit(s) issued to hospital. Inventory updated!`)
      setShowIssueModal(false)
      load()
    } catch(err) { toast.error(err.response?.data?.message||'Issue failed') }
    finally { setSubmitting(false) }
  }

  if (loading) return <PageLoader/>

  const pendingTTI   = units.filter(u=>u.status==='Collected')
  const criticalInv  = (data?.alerts||[]).filter(a=>a.level==='critical')
  const lowInv       = (data?.alerts||[]).filter(a=>a.level==='low')
  const pendingReqs  = requests.filter(r=>['Pending','Processing'].includes(r.status))

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Blood Bank Dashboard</h1>
          <p className="page-subtitle">Manage inventory, donations, TTI testing &amp; hospital requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
          <button onClick={()=>setShowAddModal(true)} className="btn-primary">
            <Plus size={17}/> Record Donation
          </button>
        </div>
      </div>

      {/* Critical alerts */}
      {criticalInv.map(a=>(
        <Alert key={a.bloodGroup} type="error" message={`⚠️ CRITICAL: ${a.bloodGroup} only has ${a.total} units — below threshold! Activate donors immediately.`}/>
      ))}
      {lowInv.map(a=>(
        <Alert key={a.bloodGroup} type="warning" message={`⚠️ LOW STOCK: ${a.bloodGroup} has only ${a.total} units remaining.`}/>
      ))}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package size={22}/>}       label="Total Inventory"  value={data?.totalInventory||0}    color="red"   />
        <StatCard icon={<Droplets size={22}/>}      label="Donations Today"  value={data?.donationsToday||0}    color="green" />
        <StatCard icon={<FlaskConical size={22}/>}  label="Pending Tests"    value={pendingTTI.length}          color="amber" />
        <StatCard icon={<Bell size={22}/>}          label="Hospital Requests"value={pendingReqs.length}         color="blue"  sub={pendingReqs.filter(r=>r.urgency==='Critical').length+' critical'}/>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        {[['overview','Inventory'],['requests','Hospital Requests'],['units','Blood Units'],['tti','TTI Testing']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${tab===id?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            {label}
            {id==='requests'&&pendingReqs.length>0&&<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingReqs.length}</span>}
            {id==='tti'&&pendingTTI.length>0&&<span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingTTI.length}</span>}
          </button>
        ))}
      </div>

      {/* INVENTORY */}
      {tab==='overview'&&(
        <div className="card">
          <h2 className="section-title mb-4">Live Inventory by Blood Group</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(data?.inventory||[]).map(inv=>{
              const total = inv.rbc+inv.plasma+inv.platelets+inv.wholeBlood
              const isCrit = total<=(data?.criticalThreshold||2)
              const isLow  = total<=(data?.lowStockThreshold||5)
              return (
                <div key={inv.bloodGroup} className={`rounded-xl p-4 border ${isCrit?'bg-red-50 border-red-200':isLow?'bg-amber-50 border-amber-100':'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-bold text-xl ${isCrit?'text-red-600':isLow?'text-amber-600':'text-gray-900'}`}>{inv.bloodGroup}</span>
                    {isCrit&&<AlertTriangle size={15} className="text-red-500"/>}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[['RBC',inv.rbc,'text-red-500'],['Plasma',inv.plasma,'text-amber-500'],['Platelets',inv.platelets,'text-blue-500'],['Whole',inv.wholeBlood,'text-purple-500']].map(([l,v,c])=>(
                      <div key={l} className="flex justify-between">
                        <span className="text-gray-500">{l}</span>
                        <span className={`font-bold ${c}`}>{v}u</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 text-center text-xs font-bold ${isCrit?'text-red-600':isLow?'text-amber-600':'text-green-600'}`}>
                    {isCrit?'CRITICAL':isLow?'LOW':'OK'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* HOSPITAL REQUESTS — blood bank can see and fulfil */}
      {tab==='requests'&&(
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="section-title">Incoming Hospital Requests</h2>
            <span className="text-xs text-gray-400">Real-time · click Fulfil to issue blood</span>
          </div>
          {pendingReqs.length===0?(
            <EmptyState icon="📋" title="No pending requests" description="New hospital requests will appear here in real-time."/>
          ):(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['ID','Patient','Hospital','Blood','Component','Units','Urgency','Status','Action'].map(h=>(
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {pendingReqs.map(req=>(
                    <tr key={req._id} className="table-row">
                      <td className="table-cell font-mono text-xs text-gray-400">{req.requestId}</td>
                      <td className="table-cell font-medium">{req.patientName}</td>
                      <td className="table-cell text-gray-500 truncate max-w-[100px]">{req.hospitalName||req.hospital?.hospitalName||'—'}</td>
                      <td className="table-cell"><BloodGroupBadge group={req.bloodGroup} size="sm"/></td>
                      <td className="table-cell text-gray-500">{req.component}</td>
                      <td className="table-cell font-bold">{req.units}</td>
                      <td className="table-cell"><span className={req.urgency==='Critical'?'badge-red':req.urgency==='Urgent'?'badge-yellow':'badge-green'}>{req.urgency}</span></td>
                      <td className="table-cell"><StatusBadge status={req.status}/></td>
                      <td className="table-cell">
                        {req.status==='Pending'&&(
                          <button onClick={()=>issueToHospital(req._id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                            Fulfil →
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BLOOD UNITS */}
      {tab==='units'&&(
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="section-title">Blood Units</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                {['Unit ID','Group','Component','Donor','Collected','Expires','Status'].map(h=><th key={h} className="table-header">{h}</th>)}
              </tr></thead>
              <tbody>
                {units.length===0?<tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No units recorded yet</td></tr>:
                units.map(u=>(
                  <tr key={u._id} className="table-row">
                    <td className="table-cell font-mono text-xs">{u.unitId}</td>
                    <td className="table-cell"><BloodGroupBadge group={u.bloodGroup} size="sm"/></td>
                    <td className="table-cell text-gray-500">{u.component}</td>
                    <td className="table-cell">{u.donorName}</td>
                    <td className="table-cell text-gray-400">{new Date(u.collectedAt).toLocaleDateString('en-IN')}</td>
                    <td className="table-cell text-gray-400">{new Date(u.expiresAt).toLocaleDateString('en-IN')}</td>
                    <td className="table-cell"><StatusBadge status={u.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TTI TESTING */}
      {tab==='tti'&&(
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="section-title">TTI Screening ({pendingTTI.length} pending)</h2>
            <span className="text-xs text-gray-400">Approved units auto-added to inventory</span>
          </div>
          {pendingTTI.length===0?(
            <EmptyState icon="🧪" title="No units pending TTI" description="Collected blood units awaiting screening will appear here."/>
          ):(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Unit ID','Group','Donor','HIV','HBsAg','HCV','Malaria','Syphilis','Action'].map(h=><th key={h} className="table-header">{h}</th>)}
                </tr></thead>
                <tbody>
                  {pendingTTI.map(u=>(
                    <tr key={u._id} className="table-row">
                      <td className="table-cell font-mono text-xs">{u.unitId}</td>
                      <td className="table-cell"><BloodGroupBadge group={u.bloodGroup} size="sm"/></td>
                      <td className="table-cell">{u.donorName}</td>
                      {['HIV','HBsAg','HCV','Malaria','Syphilis'].map(t=>(
                        <td key={t} className="table-cell">
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
                        </td>
                      ))}
                      <td className="table-cell">
                        <div className="flex gap-1.5">
                          <button onClick={()=>updateTTI(u.unitId,{ hiv:'Clear',hbv:'Clear',hcv:'Clear',malaria:'Clear',syphilis:'Clear',testedBy:'Lab' })}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all">
                            <CheckCircle size={12}/> All Clear
                          </button>
                          <button onClick={()=>updateTTI(u.unitId,{ hiv:'Reactive',hbv:'Clear',hcv:'Clear',malaria:'Clear',syphilis:'Clear',testedBy:'Lab' })}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all">
                            <XCircle size={12}/> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Donation Modal */}
      <Modal open={showAddModal} onClose={()=>setShowAddModal(false)} title="Record Blood Donation">
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Blood Group *</label>
              <select className="input" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                {BLOOD_GROUPS.map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className="label">Component *</label>
              <select className="input" value={form.component} onChange={e=>set('component',e.target.value)}>
                {COMPONENTS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Volume (ml)</label>
            <input type="number" className="input" value={form.volume} onChange={e=>set('volume',e.target.value)}/></div>
          <div><label className="label">Notes</label>
            <textarea className="input resize-none h-16" value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div className="flex gap-3">
            <button type="button" onClick={()=>setShowAddModal(false)} className="btn-white flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting?'Recording...':'Record Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue to Hospital Modal */}
      <Modal open={showIssueModal} onClose={()=>setShowIssueModal(false)} title="Issue Blood to Hospital">
        {selectedRequest&&(
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Patient:</span><span className="font-semibold">{selectedRequest.patientName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Blood Group:</span><BloodGroupBadge group={selectedRequest.bloodGroup} size="sm"/></div>
              <div className="flex justify-between"><span className="text-gray-500">Component:</span><span className="font-semibold">{selectedRequest.component}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Units Needed:</span><span className="font-bold text-gray-900">{selectedRequest.units}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hospital:</span><span className="font-semibold">{selectedRequest.hospitalName||'—'}</span></div>
            </div>
            <Alert type="warning" message="Issuing will reduce inventory. The hospital will be notified in real-time."/>
            <div className="flex gap-3">
              <button onClick={()=>setShowIssueModal(false)} className="btn-white flex-1 justify-center">Cancel</button>
              <button onClick={confirmIssue} disabled={submitting} className="btn-primary flex-1 justify-center">
                {submitting?'Processing...':'Confirm & Issue'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
