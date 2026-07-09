import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { PageLoader, BloodGroupBadge, StatusBadge, Modal, Alert, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const COMPONENTS   = ['Whole Blood','RBC','Plasma','Platelets','Cryoprecipitate']
const STATUSES     = ['Pending','Processing','Allocated','In Transit','Fulfilled','Cancelled']
const URGENCIES    = ['Normal','Urgent','Critical']
const urgencyColors= { Critical:'badge-red', Urgent:'badge-yellow', Normal:'badge-green' }

export default function RequestsPage() {
  const { user } = useAuth()
  const { newRequests } = useSync()
  const [requests, setRequests]  = useState([])
  const [loading, setLoading]    = useState(true)
  const [showModal, setShowModal]= useState(false)
  const [submitting, setSubmitting]= useState(false)
  const [search, setSearch]      = useState('')
  const [statusFilter, setStatus]= useState('')
  const [urgFilter, setUrg]      = useState('')
  const [form, setForm] = useState({
    patientName:'', patientAge:'', patientGender:'Male', diagnosis:'',
    hospitalName:'', bloodGroup:'O+', component:'RBC', units:1, urgency:'Normal', requiredBy:'', notes:''
  })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const load = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status',statusFilter)
    if (urgFilter)    p.set('urgency',urgFilter)
    api.get(`/requests?${p}`).then(r=>setRequests(r.data.data||[]))
      .catch(console.error).finally(()=>setLoading(false))
  }, [statusFilter, urgFilter])

  useEffect(()=>{load()},[load])

  // Real-time: new requests from other roles
  useEffect(()=>{
    if(newRequests.length && (user?.role==='bloodbank'||user?.role==='admin')) {
      setRequests(prev=>{
        const ids=new Set(prev.map(r=>r._id))
        return [...newRequests.filter(r=>!ids.has(r._id)), ...prev].slice(0,50)
      })
    }
  },[newRequests.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/requests',{...form, units:+form.units})
      toast.success(form.urgency==='Critical'
        ?'🚨 Emergency sent! Blood banks & donors notified instantly.'
        :'✅ Request submitted! Blood banks notified.')
      setShowModal(false)
      setForm({patientName:'',patientAge:'',patientGender:'Male',diagnosis:'',hospitalName:'',bloodGroup:'O+',component:'RBC',units:1,urgency:'Normal',requiredBy:'',notes:''})
      load()
    } catch(err){ toast.error(err.response?.data?.message||'Failed') }
    finally { setSubmitting(false) }
  }

  const filtered = requests.filter(r=>
    !search||r.patientName?.toLowerCase().includes(search.toLowerCase())||r.bloodGroup?.includes(search.toUpperCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Blood Requests</h1>
          <p className="page-subtitle">Manage all blood requisitions · real-time synced</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="btn-primary"><Plus size={17}/>New Request</button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          {label:'Critical',count:requests.filter(r=>r.urgency==='Critical').length,cls:'bg-red-50 text-red-700 border border-red-200'},
          {label:'Pending', count:requests.filter(r=>r.status==='Pending').length,  cls:'bg-yellow-50 text-yellow-700 border border-yellow-200'},
          {label:'In Transit',count:requests.filter(r=>r.status==='In Transit').length,cls:'bg-blue-50 text-blue-700 border border-blue-200'},
          {label:'Fulfilled',count:requests.filter(r=>r.status==='Fulfilled').length,cls:'bg-green-50 text-green-700 border border-green-200'},
        ].map(c=>(
          <span key={c.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${c.cls}`}>
            <span className="font-bold text-sm">{c.count}</span>{c.label}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="input pl-8 py-2 text-sm" placeholder="Search patient or blood group..."
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="input py-2 text-sm w-auto" value={statusFilter} onChange={e=>setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className="input py-2 text-sm w-auto" value={urgFilter} onChange={e=>setUrg(e.target.value)}>
            <option value="">All Urgencies</option>
            {URGENCIES.map(u=><option key={u}>{u}</option>)}
          </select>
          <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
        </div>
      </div>

      {/* Table */}
      {loading?<PageLoader/>:(
        <div className="card p-0 overflow-hidden">
          {filtered.length===0?(
            <EmptyState icon="📋" title="No requests found" description="No blood requests match your filters."/>
          ):(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-gray-50">
                  {['Request ID','Patient','Blood','Component','Units','Hospital','Urgency','Status','Date'].map(h=>(
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map(req=>(
                    <tr key={req._id} className="table-row">
                      <td className="table-cell font-mono text-xs text-gray-400">{req.requestId}</td>
                      <td className="table-cell font-medium text-gray-900">{req.patientName}</td>
                      <td className="table-cell"><BloodGroupBadge group={req.bloodGroup} size="sm"/></td>
                      <td className="table-cell text-gray-500">{req.component}</td>
                      <td className="table-cell font-semibold">{req.units}</td>
                      <td className="table-cell text-gray-500 truncate max-w-[100px]">{req.hospitalName||'—'}</td>
                      <td className="table-cell"><span className={urgencyColors[req.urgency]}>{req.urgency}</span></td>
                      <td className="table-cell"><StatusBadge status={req.status}/></td>
                      <td className="table-cell text-gray-400">{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* New Request Modal */}
      <Modal open={showModal} onClose={()=>setShowModal(false)} title="New Blood Request" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Patient Name *</label>
              <input className="input" required value={form.patientName} onChange={e=>set('patientName',e.target.value)}/></div>
            <div><label className="label">Hospital Name</label>
              <input className="input" value={form.hospitalName} onChange={e=>set('hospitalName',e.target.value)}/></div>
            <div><label className="label">Age</label>
              <input type="number" className="input" value={form.patientAge} onChange={e=>set('patientAge',e.target.value)}/></div>
            <div><label className="label">Diagnosis *</label>
              <input className="input" required value={form.diagnosis} onChange={e=>set('diagnosis',e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Blood Group *</label>
              <select className="input" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                {BLOOD_GROUPS.map(g=><option key={g}>{g}</option>)}</select></div>
            <div><label className="label">Component *</label>
              <select className="input" value={form.component} onChange={e=>set('component',e.target.value)}>
                {COMPONENTS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Units *</label>
              <input type="number" min={1} max={20} className="input" required value={form.units} onChange={e=>set('units',e.target.value)}/></div>
          </div>
          <div><label className="label">Urgency *</label>
            <div className="flex gap-3">
              {URGENCIES.map(u=>(
                <button key={u} type="button" onClick={()=>set('urgency',u)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.urgency===u
                      ?u==='Critical'?'bg-red-600 border-red-600 text-white':u==='Urgent'?'bg-amber-500 border-amber-500 text-white':'bg-green-600 border-green-600 text-white'
                      :'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>{u}</button>
              ))}
            </div>
          </div>
          {form.urgency==='Critical'&&(
            <Alert type="error" message="🚨 Blood banks and eligible donors will be notified instantly."/>
          )}
          <div><label className="label">Notes</label>
            <textarea className="input resize-none h-16" value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setShowModal(false)} className="btn-white flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting?'Submitting...':'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
