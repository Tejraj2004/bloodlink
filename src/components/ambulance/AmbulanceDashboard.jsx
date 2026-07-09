import React, { useState } from 'react'
import { Truck, MapPin, Clock, CheckCircle, Navigation, Phone } from 'lucide-react'
import { deliveries } from '../../data/mockData'

export default function AmbulanceDashboard() {
  const [activeDelivery, setActiveDelivery] = useState(deliveries[1])
  const [status, setStatus] = useState('In Transit')

  const statusFlow = ['Assigned', 'Picked Up', 'In Transit', 'Delivered']
  const currentStep = statusFlow.indexOf(status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Delivery Assignments</h1>
        <p className="text-slate-500 text-sm mt-0.5">Driver: Suresh Babu · Vehicle: OD-05-AB-1234</p>
      </div>

      {/* Active delivery */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-blue-400 text-xs font-semibold mb-1">ACTIVE DELIVERY</div>
            <h2 className="font-display font-bold text-2xl text-white">{activeDelivery.id}</h2>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold text-blue-300">{activeDelivery.eta}</div>
            <div className="text-slate-500 text-xs">ETA remaining</div>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-0.5">FROM</div>
            <div className="font-semibold text-white text-sm">{activeDelivery.from}</div>
          </div>
          <Navigation size={18} className="text-blue-400 flex-shrink-0"/>
          <div className="flex-1 bg-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-0.5">TO</div>
            <div className="font-semibold text-white text-sm">{activeDelivery.to}</div>
          </div>
        </div>

        {/* Cargo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blood-900/50 border border-blood-700 rounded-xl flex items-center justify-center">
            <span className="text-blood-300 font-bold">{activeDelivery.bloodGroup}</span>
          </div>
          <div>
            <div className="text-white font-semibold">{activeDelivery.units} units — {activeDelivery.bloodGroup}</div>
            <div className="text-xs text-slate-500">Refrigerated transport required · Handle with care</div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-5">
          {statusFlow.map((step, i) => (
            <React.Fragment key={step}>
              <button
                onClick={() => setStatus(step)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  i <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >{step}</button>
              {i < statusFlow.length - 1 && <div className={`w-4 h-0.5 flex-shrink-0 ${i < currentStep ? 'bg-blue-500' : 'bg-slate-700'}`}/>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2"><Phone size={14}/> Call Hospital</button>
          <button className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
            <CheckCircle size={14}/> Mark as Delivered
          </button>
        </div>
      </div>

      {/* Delivery History */}
      <div className="card">
        <div className="section-title mb-4">Recent Deliveries</div>
        <div className="space-y-2">
          {deliveries.filter(d => d.status !== 'In Transit').map(d => (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.status==='Delivered' ? 'bg-emerald-900/50' : 'bg-amber-900/50'}`}>
                {d.status==='Delivered' ? <CheckCircle size={15} className="text-emerald-400"/> : <Clock size={15} className="text-amber-400"/>}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{d.id} — {d.bloodGroup}</div>
                <div className="text-xs text-slate-500">{d.from} → {d.to}</div>
              </div>
              <span className={`badge text-xs ${d.status==='Delivered' ? 'badge-green' : 'badge-yellow'}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
