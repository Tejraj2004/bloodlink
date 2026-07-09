import React, { useState } from 'react'
import { Package, AlertTriangle, CheckCircle, Clock, Filter, Download, RefreshCw } from 'lucide-react'
import { inventory, bloodBanks } from '../../data/mockData'

export default function InventoryPage() {
  const [activeBank, setActiveBank] = useState('all')
  const [activeComponent, setActiveComponent] = useState('rbc')

  const components = [
    { id: 'rbc', label: 'Red Blood Cells', color: 'blood' },
    { id: 'plasma', label: 'Plasma', color: 'amber' },
    { id: 'platelets', label: 'Platelets', color: 'blue' },
    { id: 'whole', label: 'Whole Blood', color: 'purple' },
  ]

  const getStatus = (units) => {
    if (units < 5) return { label: 'Critical', cls: 'badge-red' }
    if (units < 15) return { label: 'Low', cls: 'badge-yellow' }
    return { label: 'Adequate', cls: 'badge-green' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Blood Inventory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time stock across all centers</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15}/> Sync
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={15}/> Export
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-blood-900/30 border border-blood-800/50 rounded-2xl p-4 flex items-center gap-4">
        <AlertTriangle size={20} className="text-blood-400 flex-shrink-0" />
        <div>
          <div className="text-blood-300 font-semibold text-sm">Shortage Alert</div>
          <div className="text-slate-400 text-sm">AB- and O- are critically low. AI recommends activating 8 eligible donors immediately.</div>
        </div>
        <button className="ml-auto btn-primary text-sm flex-shrink-0">Activate Donors</button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
          {components.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveComponent(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeComponent === c.id ? 'bg-blood-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1 ml-auto">
          <button
            onClick={() => setActiveBank('all')}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${activeBank === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >All Banks</button>
          {bloodBanks.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBank(b.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${activeBank === b.id ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >{b.name.split(' ')[0]}</button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-4 gap-4">
        {inventory.map(item => {
          const units = item[activeComponent]
          const status = getStatus(units)
          const maxUnits = 60
          const pct = Math.min((units / maxUnits) * 100, 100)
          const barColor = units < 5 ? 'bg-blood-600' : units < 15 ? 'bg-amber-500' : 'bg-emerald-500'

          return (
            <div key={item.group} className="card hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blood-900/50 rounded-xl flex items-center justify-center">
                  <span className="text-blood-300 font-display font-bold text-lg">{item.group}</span>
                </div>
                <span className={status.cls}>{status.label}</span>
              </div>
              <div className="font-display text-4xl font-bold text-white mb-1">{units}</div>
              <div className="text-slate-400 text-sm mb-4">units available</div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={11}/> Expires: {item.expiringSoon} soon
                </span>
                <span>{pct.toFixed(0)}% stocked</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Table */}
      <div className="card">
        <div className="section-title mb-4">Full Inventory Matrix</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                <th className="text-left py-3 pr-4">Blood Group</th>
                <th className="text-center py-3 px-4">RBC</th>
                <th className="text-center py-3 px-4">Plasma</th>
                <th className="text-center py-3 px-4">Platelets</th>
                <th className="text-center py-3 px-4">Whole Blood</th>
                <th className="text-center py-3 px-4">Expiring Soon</th>
                <th className="text-left py-3 pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const total = item.rbc + item.plasma + item.platelets + item.whole
                const status = getStatus(item.rbc)
                return (
                  <tr key={item.group} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all">
                    <td className="py-3 pr-4">
                      <span className="font-bold text-blood-300 text-base">{item.group}</span>
                    </td>
                    <td className="text-center py-3 px-4 text-white font-semibold">{item.rbc}</td>
                    <td className="text-center py-3 px-4 text-amber-300 font-semibold">{item.plasma}</td>
                    <td className="text-center py-3 px-4 text-blue-300 font-semibold">{item.platelets}</td>
                    <td className="text-center py-3 px-4 text-purple-300 font-semibold">{item.whole}</td>
                    <td className="text-center py-3 px-4">
                      {item.expiringSoon > 0
                        ? <span className="text-amber-400 font-semibold">{item.expiringSoon}</span>
                        : <span className="text-slate-600">—</span>
                      }
                    </td>
                    <td className="py-3 pl-4"><span className={status.cls}>{status.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
