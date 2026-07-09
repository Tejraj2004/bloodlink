import React, { useState, useEffect, useCallback } from 'react'
import { Truck, Navigation, Phone, CheckCircle, MapPin, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { PageLoader, BloodGroupBadge, StatusBadge, EmptyState, Alert } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'

const STATUS_STEPS = ['Assigned','Picked Up','In Transit','Delivered']

export default function AmbulanceDashboard() {
  const { user, socket } = useAuth()
  const { liveDeliveries } = useSync()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading]       = useState(true)
  const [active, setActive]         = useState(null)
  const [updating, setUpdating]     = useState(false)
  const [sharingGPS, setSharingGPS] = useState(false)
  const [gpsInterval, setGpsInterval] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/deliveries').then(r => {
      const d = r.data.data.deliveries||[]
      setDeliveries(d)
      const inProgress = d.find(x=>!['Delivered','Failed'].includes(x.status))
      setActive(inProgress||null)
    }).catch(console.error).finally(()=>setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Listen for new delivery assignments
  useEffect(() => {
    if (!socket) return
    const handler = () => { toast('🚚 New delivery assigned to you!', { icon:'🚚', duration:8000 }); load() }
    socket.on('new_delivery', handler)
    return () => socket.off('new_delivery', handler)
  }, [socket, load])

  // Auto-join delivery room when active delivery changes
  useEffect(() => {
    if (!socket||!active) return
    socket.emit('join_delivery', { deliveryId: active._id })
  }, [socket, active])

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => { if (gpsInterval) clearInterval(gpsInterval) }
  }, [gpsInterval])

  const updateStatus = async (deliveryId, status) => {
    setUpdating(true)
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status })
      toast.success(`Status updated to: ${status}`)
      load()
    } catch { toast.error('Update failed') }
    finally { setUpdating(false) }
  }

  const toggleGPS = () => {
    if (!active) return
    if (sharingGPS) {
      clearInterval(gpsInterval)
      setGpsInterval(null)
      setSharingGPS(false)
      toast('GPS sharing stopped.')
    } else {
      const share = () => {
        navigator.geolocation?.getCurrentPosition(pos => {
          const coords = [pos.coords.longitude, pos.coords.latitude]
          api.put(`/deliveries/${active.deliveryId}/location`, { coordinates: coords }).catch(()=>{})
          if (socket) socket.emit('driver_gps', { deliveryId: active._id, coordinates: coords })
        }, ()=>{})
      }
      share()
      const interval = setInterval(share, 5000)
      setGpsInterval(interval)
      setSharingGPS(true)
      toast.success('📍 Live GPS sharing started! Hospital can see your location.')
    }
  }

  if (loading) return <PageLoader/>

  const currentIdx = active ? STATUS_STEPS.indexOf(active.status) : -1

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Delivery Dashboard</h1>
          <p className="page-subtitle">Blood transport & real-time GPS tracking</p>
        </div>
        <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
      </div>

      {/* Active Delivery */}
      {active ? (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">Active Delivery</div>
              <div className="text-xl font-bold text-gray-900">{active.deliveryId}</div>
            </div>
            <div className="flex items-center gap-2">
              {sharingGPS && (
                <div className="flex items-center gap-1.5 bg-green-100 border border-green-200 rounded-full px-3 py-1 text-xs font-bold text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>GPS Live
                </div>
              )}
              <BloodGroupBadge group={active.units?.[0]?.bloodGroup||'?'} size="md"/>
            </div>
          </div>

          {/* Route */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-gray-400 mb-1">FROM</div>
              <div className="font-semibold text-gray-900 text-sm">{active.fromBank?.bankName||'Blood Bank'}</div>
              <div className="text-xs text-gray-500">{active.fromBank?.city}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-gray-400 mb-1">TO</div>
              <div className="font-semibold text-gray-900 text-sm">{active.toHospital?.hospitalName||'Hospital'}</div>
              <div className="text-xs text-gray-500">{active.toHospital?.city}</div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-1 mb-5">
            {STATUS_STEPS.map((step,i) => (
              <React.Fragment key={step}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i<currentIdx?'bg-red-600 border-red-600 text-white':i===currentIdx?'bg-blue-600 border-blue-600 text-white':'border-gray-200 text-gray-400'
                }`}>{i<currentIdx?'✓':i+1}</div>
                <div className="flex-1 text-center">
                  <div className={`text-xs truncate ${i<=currentIdx?'text-blue-600 font-medium':'text-gray-400'}`}>{step}</div>
                  {i < STATUS_STEPS.length-1 && <div className={`h-0.5 mt-1 rounded ${i<currentIdx?'bg-blue-600':'bg-gray-200'}`}/>}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {active.status==='Assigned'&&(
              <button onClick={()=>updateStatus(active.deliveryId,'Picked Up')} disabled={updating}
                className="btn-primary flex-1 justify-center text-sm">
                ✅ Confirm Pickup
              </button>
            )}
            {active.status==='Picked Up'&&(
              <button onClick={()=>updateStatus(active.deliveryId,'In Transit')} disabled={updating}
                className="btn-primary flex-1 justify-center text-sm">
                🚚 Start Delivery
              </button>
            )}
            {active.status==='In Transit'&&(
              <button onClick={()=>updateStatus(active.deliveryId,'Delivered')} disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 flex-1 justify-center transition-all">
                <CheckCircle size={16}/> Mark Delivered
              </button>
            )}
            <button onClick={toggleGPS}
              className={`px-4 text-sm rounded-xl font-semibold border transition-all flex items-center gap-2 ${sharingGPS?'bg-green-50 border-green-300 text-green-700':'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <Navigation size={15}/>{sharingGPS?'Stop GPS':'Share GPS'}
            </button>
            {active.toHospital?.emergencyContact&&(
              <a href={`tel:${active.toHospital.emergencyContact}`}
                className="btn-white px-4 text-sm flex items-center gap-2">
                <Phone size={15}/> Call Hospital
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="card bg-green-50 border border-green-200 p-5 text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3"/>
          <div className="font-semibold text-green-800">No active delivery</div>
          <div className="text-green-600 text-sm mt-1">You'll be notified instantly when a delivery is assigned.</div>
        </div>
      )}

      {/* History */}
      <div className="card">
        <h2 className="section-title mb-4">Delivery History</h2>
        {deliveries.filter(d=>['Delivered','Failed'].includes(d.status)).length===0 ? (
          <EmptyState icon="📦" title="No completed deliveries" description="Your completed deliveries will appear here."/>
        ) : (
          <div className="space-y-2">
            {deliveries.filter(d=>['Delivered','Failed'].includes(d.status)).map(d=>(
              <div key={d._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${d.status==='Delivered'?'bg-green-50':'bg-red-50'}`}>
                  {d.status==='Delivered'?<CheckCircle size={17} className="text-green-600"/>:<span className="text-red-500">✗</span>}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{d.deliveryId}</div>
                  <div className="text-xs text-gray-500">{d.fromBank?.bankName||'Bank'} → {d.toHospital?.hospitalName||'Hospital'}</div>
                </div>
                <StatusBadge status={d.status}/>
                <div className="text-xs text-gray-400">{new Date(d.updatedAt).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
