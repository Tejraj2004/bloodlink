import React, { useState, useEffect, useCallback } from 'react'
import { Truck, Clock, CheckCircle, RefreshCw, MapPin, Navigation } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, StatusBadge, BloodGroupBadge, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'

const STATUS_STEPS = ['Assigned','Picked Up','In Transit','Delivered']

export default function DeliveriesPage() {
  const { user, socket } = useAuth()
  const { liveDeliveries } = useSync()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/deliveries').then(r => setDeliveries(r.data.data.deliveries || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Join delivery rooms for active deliveries
  useEffect(() => {
    if (!socket) return
    deliveries.filter(d => !['Delivered','Failed'].includes(d.status)).forEach(d => {
      socket.emit('join_delivery', { deliveryId: d._id })
    })
    // Listen for status updates
    const onStatus = ({ deliveryId, status }) => {
      setDeliveries(prev => prev.map(d => d.deliveryId === deliveryId ? {...d, status} : d))
    }
    socket.on('delivery_status', onStatus)
    return () => socket.off('delivery_status', onStatus)
  }, [socket, deliveries.length])

  const progressPct = (status) => {
    const idx = STATUS_STEPS.indexOf(status)
    return idx < 0 ? 0 : Math.round(((idx+1)/STATUS_STEPS.length)*100)
  }

  const statusColor = { Assigned:'badge-yellow', 'Picked Up':'badge-blue', 'In Transit':'badge-blue', Delivered:'badge-green', Failed:'badge-red' }

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">Real-time blood transport tracking with live GPS</p>
        </div>
        <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        {[
          {label:'In Transit', count:deliveries.filter(d=>d.status==='In Transit').length, cls:'bg-blue-50 text-blue-700 border-blue-200'},
          {label:'Assigned',   count:deliveries.filter(d=>d.status==='Assigned').length,   cls:'bg-yellow-50 text-yellow-700 border-yellow-200'},
          {label:'Delivered',  count:deliveries.filter(d=>d.status==='Delivered').length,  cls:'bg-green-50 text-green-700 border-green-200'},
        ].map(c=>(
          <span key={c.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.cls}`}>
            <span className="font-bold text-sm">{c.count}</span>{c.label}
          </span>
        ))}
      </div>

      {loading ? <PageLoader/> : deliveries.length===0 ? (
        <EmptyState icon="🚚" title="No deliveries yet" description="Blood deliveries will appear here once dispatched."/>
      ) : (
        <div className="space-y-3">
          {deliveries.map(d => {
            const isActive  = !['Delivered','Failed'].includes(d.status)
            const pct       = progressPct(d.status)
            const liveCoords= liveDeliveries[d.deliveryId]
            return (
              <div key={d._id}
                className={`bg-white rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all ${isActive?'border-blue-100':'border-gray-100'}`}
                onClick={() => setSelected(selected?._id===d._id ? null : d)}>
                <div className="p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${d.status==='Delivered'?'bg-green-50':isActive?'bg-blue-50':'bg-gray-50'}`}>
                    <Truck size={20} className={d.status==='Delivered'?'text-green-600':isActive?'text-blue-600':'text-gray-400'}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{d.deliveryId}</span>
                      <span className={statusColor[d.status]||'badge-gray'}>{d.status}</span>
                      {liveCoords && isActive && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          <Navigation size={10}/>GPS Live
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {d.fromBank?.bankName||'Blood Bank'} → {d.toHospital?.hospitalName||'Hospital'}
                    </div>
                    {d.driverName && <div className="text-xs text-gray-400 mt-0.5">Driver: {d.driverName}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString('en-IN')}</div>
                    {d.estimatedArrival && isActive && (
                      <div className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-1 justify-end">
                        <Clock size={10}/>~{Math.max(0,Math.ceil((new Date(d.estimatedArrival)-new Date())/60000))} min
                      </div>
                    )}
                  </div>
                </div>

                {selected?._id===d._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        {STATUS_STEPS.map((s,i)=>(
                          <span key={s} className={STATUS_STEPS.indexOf(d.status)>=i?'text-blue-600 font-bold':''}>{s}</span>
                        ))}
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">FROM</div>
                        <div className="font-semibold text-gray-900">{d.fromBank?.bankName}</div>
                        <div className="text-xs text-gray-500">{d.fromBank?.city}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">TO</div>
                        <div className="font-semibold text-gray-900">{d.toHospital?.hospitalName}</div>
                        <div className="text-xs text-gray-500">{d.toHospital?.city}</div>
                      </div>
                    </div>
                    {liveCoords && (
                      <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                        <MapPin size={14}/>
                        <span className="font-medium">Live GPS: {liveCoords[1]?.toFixed(5)}, {liveCoords[0]?.toFixed(5)}</span>
                      </div>
                    )}
                    {d.vehicleNo && (
                      <div className="mt-2 text-xs text-gray-500">Vehicle: <span className="font-semibold">{d.vehicleNo}</span></div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
