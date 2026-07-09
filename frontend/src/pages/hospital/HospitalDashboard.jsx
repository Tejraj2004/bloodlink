import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Truck, CheckCircle, AlertTriangle, Plus, MapPin, RefreshCw, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { StatCard, PageLoader, BloodGroupBadge, StatusBadge, Modal, Alert, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const COMPONENTS   = ['Whole Blood','RBC','Plasma','Platelets','Cryoprecipitate']

export default function HospitalDashboard() {
  const { inventoryUpdates, liveDeliveries } = useSync()
  const [data, setData]           = useState(null)
  const [nearbyBanks, setNearbyBanks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showReqModal, setShowReqModal] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [form, setForm] = useState({
    patientName:'', patientAge:'', patientGender:'Male', diagnosis:'',
    bloodGroup:'O+', component:'RBC', units:1, urgency:'Normal', requiredBy:'', notes:''
  })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/hospital/dashboard'),
      api.get('/bloodbank/list'),
    ]).then(([d, b]) => {
      setData(d.data.data)
      setNearbyBanks(b.data.data.banks || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Refresh when inventory updated (blood bank issued blood)
  useEffect(() => {
    if (inventoryUpdates.length) load()
  }, [inventoryUpdates.length])

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/requests', {
        ...form, units: +form.units,
        hospitalName: data?.profile?.hospitalName || '',
      })
      toast.success(form.urgency === 'Critical'
        ? '🚨 Emergency request sent! Blood banks & donors notified instantly.'
        : '✅ Blood request submitted! Blood banks have been notified.')
      setShowReqModal(false)
      setForm({ patientName:'', patientAge:'', patientGender:'Male', diagnosis:'', bloodGroup:'O+', component:'RBC', units:1, urgency:'Normal', requiredBy:'', notes:'' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <PageLoader/>

  const recentRequests = data?.recentRequests || []
  const activeDeliveries = data?.activeDeliveries || []

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{data?.profile?.hospitalName || 'Hospital Dashboard'}</h1>
          <p className="page-subtitle">Blood request management & real-time delivery tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
          <button onClick={() => setShowReqModal(true)} className="btn-primary">
            <Plus size={17}/> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ClipboardList size={22}/>} label="Active Requests"  value={data?.stats?.active || 0}    color="amber"/>
        <StatCard icon={<Truck size={22}/>}         label="In Transit"       value={data?.stats?.inTransit || 0} color="blue"/>
        <StatCard icon={<CheckCircle size={22}/>}   label="Fulfilled"        value={data?.stats?.fulfilled || 0} color="green"/>
        <StatCard icon={<AlertTriangle size={22}/>} label="Critical Pending" value={recentRequests.filter(r=>r.urgency==='Critical'&&r.status!=='Fulfilled').length} color="red"/>
      </div>

      {/* Active Deliveries — live GPS */}
      {activeDeliveries.length > 0 && (
        <div className="space-y-3">
          {activeDeliveries.map(d => {
            const liveCoords = liveDeliveries[d.deliveryId]
            return (
              <div key={d._id} className="card bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-blue-700 font-bold text-sm flex items-center gap-2">
                      <Truck size={16}/> Delivery {d.deliveryId} — In Transit
                      {liveCoords && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">GPS Live</span>}
                    </div>
                    <div className="text-blue-600 text-xs mt-0.5">
                      {d.fromBank?.bankName} → Your Hospital
                      {d.driverName && ` · Driver: ${d.driverName}`}
                    </div>
                  </div>
                  <div className="text-right">
                    {d.estimatedArrival && (
                      <>
                        <div className="font-bold text-blue-800 text-lg">
                          ~{Math.max(0,Math.ceil((new Date(d.estimatedArrival)-new Date())/60000))} min
                        </div>
                        <div className="text-xs text-blue-500">ETA</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{width:'65%'}}/>
                </div>
                {liveCoords && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <MapPin size={11}/> Live coordinates: {liveCoords[1]?.toFixed(4)}, {liveCoords[0]?.toFixed(4)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="card lg:col-span-2">
          <div className="section-header">
            <h2 className="section-title">Blood Requests</h2>
            <Link to="/requests" className="text-red-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState icon="📋" title="No requests yet" description="Create your first blood request using the button above."/>
          ) : (
            <div className="space-y-2">
              {recentRequests.map(req => (
                <div key={req._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <BloodGroupBadge group={req.bloodGroup} size="sm"/>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{req.patientName}</div>
                    <div className="text-xs text-gray-500">{req.component} · {req.units} unit(s) · {new Date(req.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span className={`badge text-xs ${req.urgency==='Critical'?'badge-red':req.urgency==='Urgent'?'badge-yellow':'badge-green'}`}>{req.urgency}</span>
                  <StatusBadge status={req.status}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Blood Banks with live inventory */}
        <div className="card">
          <h2 className="section-title mb-4">Nearby Blood Banks</h2>
          {nearbyBanks.length === 0 ? (
            <EmptyState icon="🩸" title="No verified banks" description="Blood banks will appear here."/>
          ) : (
            <div className="space-y-3">
              {nearbyBanks.slice(0,4).map(bank => {
                const totalUnits = bank.inventory?.reduce((s,i)=>s+i.rbc+i.plasma+i.platelets+i.wholeBlood,0)||0
                const hasStock   = totalUnits > 10
                return (
                  <div key={bank._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 text-sm">{bank.bankName}</div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hasStock?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                        {totalUnits} units
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-2"><MapPin size={11}/>{bank.city} · {bank.contactPhone}</div>
                    <div className="grid grid-cols-4 gap-1">
                      {(bank.inventory||[]).slice(0,4).map(inv => (
                        <div key={inv.bloodGroup} className="bg-white rounded-lg p-1.5 text-center border border-gray-100">
                          <div className="text-xs font-bold text-red-600">{inv.bloodGroup}</div>
                          <div className="text-xs font-bold text-gray-800">{inv.rbc}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setShowReqModal(true) }}
                      className="mt-2 w-full text-xs text-red-600 font-semibold border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition-all">
                      Request Blood →
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      <Modal open={showReqModal} onClose={()=>setShowReqModal(false)} title="New Blood Request" size="lg">
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Patient Name *</label>
              <input className="input" required value={form.patientName} onChange={e=>set('patientName',e.target.value)}/></div>
            <div><label className="label">Diagnosis *</label>
              <input className="input" required value={form.diagnosis} onChange={e=>set('diagnosis',e.target.value)} placeholder="e.g. Surgery, Accident"/></div>
            <div><label className="label">Age</label>
              <input type="number" className="input" value={form.patientAge} onChange={e=>set('patientAge',e.target.value)}/></div>
            <div><label className="label">Gender</label>
              <select className="input" value={form.patientGender} onChange={e=>set('patientGender',e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option></select></div>
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
          <div>
            <label className="label">Urgency Level *</label>
            <div className="flex gap-3">
              {['Normal','Urgent','Critical'].map(u=>(
                <button key={u} type="button" onClick={()=>set('urgency',u)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.urgency===u
                      ? u==='Critical'?'bg-red-600 border-red-600 text-white'
                        :u==='Urgent'?'bg-amber-500 border-amber-500 text-white'
                        :'bg-green-600 border-green-600 text-white'
                      :'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>{u}</button>
              ))}
            </div>
          </div>
          {form.urgency==='Critical'&&(
            <Alert type="error" message="🚨 Critical — Blood banks & eligible donors will be alerted instantly via SMS, email & push."/>
          )}
          <div><label className="label">Notes</label>
            <textarea className="input resize-none h-16" value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setShowReqModal(false)} className="btn-white flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className={`flex-1 justify-center py-2.5 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${form.urgency==='Critical'?'bg-red-600 hover:bg-red-700':'bg-gray-800 hover:bg-gray-700'}`}>
              {submitting?'Submitting...':<><Zap size={15}/>{form.urgency==='Critical'?'Send Emergency':'Submit Request'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
