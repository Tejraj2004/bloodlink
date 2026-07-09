import React, { useState } from 'react'
import { Droplets, FlaskConical, Package, Users, AlertTriangle, CheckCircle, Clock, Plus, Truck } from 'lucide-react'
import { inventory, donors, deliveries } from '../../data/mockData'

const ttResults = [
  { id: 'BU-20250616-001', group: 'O+', donor: 'Arjun Sharma', hiv: 'Clear', hbv: 'Clear', hcv: 'Clear', malaria: 'Clear', syphilis: 'Clear', status: 'Approved' },
  { id: 'BU-20250616-002', group: 'A+', donor: 'Priya Patel', hiv: 'Clear', hbv: 'Reactive', hcv: 'Clear', malaria: 'Clear', syphilis: 'Clear', status: 'Rejected' },
  { id: 'BU-20250616-003', group: 'B+', donor: 'Ramesh Das', hiv: 'Clear', hbv: 'Clear', hcv: 'Clear', malaria: 'Clear', syphilis: 'Clear', status: 'Pending' },
]

export default function BloodBankDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">State Blood Bank</h1>
          <p className="text-slate-500 text-sm mt-0.5">License: SBBHBW001 · Bhubaneswar</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={15}/>Record Donation</button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800 rounded-xl p-1 gap-1 w-fit">
        {['overview','testing','deliveries'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab===tab ? 'bg-blood-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'testing' ? 'TTI Testing' : tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Units in Stock', value: 248, icon: Package, color: 'blood' },
              { label: 'Donations Today', value: 12, icon: Droplets, color: 'emerald' },
              { label: 'Pending Tests', value: 3, icon: FlaskConical, color: 'amber' },
              { label: 'Active Requests', value: 5, icon: AlertTriangle, color: 'blue' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="card flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${s.color}-900/30 border border-${s.color}-800/50`}>
                    <Icon size={22} className={`text-${s.color}-400`}/>
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold text-white">{s.value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Inventory Grid */}
          <div className="card">
            <div className="section-title mb-4">Live Inventory</div>
            <div className="grid grid-cols-4 gap-3">
              {inventory.map(item => {
                const total = item.rbc + item.plasma + item.platelets + item.whole
                const isCritical = total < 15
                return (
                  <div key={item.group} className={`rounded-xl p-4 border ${isCritical ? 'bg-blood-900/30 border-blood-700' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-display font-bold text-xl ${isCritical ? 'text-blood-300' : 'text-white'}`}>{item.group}</span>
                      {isCritical && <AlertTriangle size={14} className="text-blood-400"/>}
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {[['RBC', item.rbc, 'text-blood-400'],['Plasma', item.plasma, 'text-amber-400'],['Platelets', item.platelets, 'text-blue-400']].map(([label, val, cls]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-slate-500">{label}</span>
                          <span className={`font-semibold ${cls}`}>{val}u</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'testing' && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-slate-800">
            <div className="section-title">TTI Screening Results</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                {['Unit ID','Blood Group','Donor','HIV','HBsAg','HCV','Malaria','Syphilis','Decision'].map(h=>(
                  <th key={h} className="text-left px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ttResults.map(row => (
                <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{row.id}</td>
                  <td className="px-5 py-4 font-bold text-blood-300">{row.group}</td>
                  <td className="px-5 py-4 text-white">{row.donor}</td>
                  {[row.hiv, row.hbv, row.hcv, row.malaria, row.syphilis].map((v,i) => (
                    <td key={i} className="px-5 py-4">
                      <span className={v === 'Clear' ? 'text-emerald-400 text-xs font-semibold' : 'text-blood-400 text-xs font-bold'}>{v}</span>
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${row.status==='Approved' ? 'badge-green' : row.status==='Rejected' ? 'badge-red' : 'badge-yellow'}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'deliveries' && (
        <div className="space-y-3">
          {deliveries.map(d => (
            <div key={d.id} className="card flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${d.status==='Delivered' ? 'bg-emerald-900/30 border-emerald-800' : d.status==='In Transit' ? 'bg-blue-900/30 border-blue-800' : 'bg-amber-900/30 border-amber-800'}`}>
                <Truck size={20} className={d.status==='Delivered' ? 'text-emerald-400' : d.status==='In Transit' ? 'text-blue-400' : 'text-amber-400'}/>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{d.from} → {d.to}</div>
                <div className="text-xs text-slate-500 mt-0.5">{d.bloodGroup} · {d.units} units · Driver: {d.driver}</div>
              </div>
              <div className="text-right">
                <span className={`badge text-xs ${d.status==='Delivered' ? 'badge-green' : d.status==='In Transit' ? 'badge-blue' : 'badge-yellow'}`}>{d.status}</span>
                {d.eta && <div className="text-xs text-blue-400 mt-1 font-medium">ETA: {d.eta}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
