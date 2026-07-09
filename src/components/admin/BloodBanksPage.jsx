import React from 'react'
import { Droplets, CheckCircle, MapPin, Phone, Package, Plus } from 'lucide-react'
import { bloodBanks, inventory } from '../../data/mockData'

export default function BloodBanksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Blood Bank Network</h1>
          <p className="text-slate-500 text-sm mt-0.5">Licensed and accredited blood collection centers</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={15}/>Register Bank</button>
      </div>

      <div className="space-y-4">
        {bloodBanks.map(bank => {
          const totalUnits = inventory.reduce((sum, i) => sum + i.rbc + i.platelets + i.plasma + i.whole, 0)
          return (
            <div key={bank.id} className="card">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-blood-900/40 rounded-2xl flex items-center justify-center border border-blood-800/50">
                  <Droplets size={26} className="text-blood-400"/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-white text-lg">{bank.name}</h3>
                    {bank.accredited && <span className="badge-green flex items-center gap-1 text-xs"><CheckCircle size={10}/>NBTC Accredited</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-slate-500 text-sm"><MapPin size={12}/>{bank.city}</span>
                    <span className="flex items-center gap-1 text-slate-500 text-sm"><Phone size={12}/>{bank.contact}</span>
                    <span className="text-slate-600 text-xs font-mono">License: {bank.license}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold text-white">{bank.totalUnits}</div>
                  <div className="text-slate-500 text-xs">Total Units</div>
                  <div className="text-slate-600 text-xs">Updated: {bank.lastUpdated}</div>
                </div>
              </div>

              {/* Mini inventory */}
              <div className="grid grid-cols-8 gap-2">
                {inventory.map(item => {
                  const units = item.rbc
                  const low = units < 5
                  return (
                    <div key={item.group} className={`rounded-xl p-2 text-center border ${low ? 'bg-blood-900/30 border-blood-800/50' : 'bg-slate-800 border-slate-700'}`}>
                      <div className={`font-bold text-sm ${low ? 'text-blood-400' : 'text-white'}`}>{item.group}</div>
                      <div className={`text-xs mt-0.5 ${low ? 'text-blood-500' : 'text-slate-500'}`}>{item.rbc}u</div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <button className="btn-secondary text-sm flex-1">View Details</button>
                <button className="btn-secondary text-sm flex-1">Request Transfer</button>
                <button className="btn-primary text-sm flex-1">Manage</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
