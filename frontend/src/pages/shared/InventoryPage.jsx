import React, { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, AlertTriangle, Download, Activity } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, BloodGroupBadge, Alert, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useSync } from '../../context/SyncContext'

const COMPONENTS = ['rbc','plasma','platelets','wholeBlood']
const COMP_LABELS= { rbc:'RBC', plasma:'Plasma', platelets:'Platelets', wholeBlood:'Whole Blood' }
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function InventoryPage() {
  const { inventoryUpdates, thresholdAlerts } = useSync()
  const [banks, setBanks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeComp, setActiveComp] = useState('rbc')
  const [search, setSearch]       = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/bloodbank/list').then(r => {
      setBanks(r.data.data.banks || [])
      setLastUpdated(new Date())
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh when inventory changes via Socket.IO
  useEffect(() => {
    if (inventoryUpdates.length) {
      load()
    }
  }, [inventoryUpdates.length])

  const aggregated = BLOOD_GROUPS.map(g => {
    const totals = { rbc:0, plasma:0, platelets:0, wholeBlood:0 }
    banks.forEach(bank => {
      const inv = bank.inventory?.find(i => i.bloodGroup === g)
      if (inv) {
        totals.rbc        += inv.rbc        || 0
        totals.plasma     += inv.plasma     || 0
        totals.platelets  += inv.platelets  || 0
        totals.wholeBlood += inv.wholeBlood || 0
      }
    })
    return { group:g, ...totals, total: Object.values(totals).reduce((a,b)=>a+b,0) }
  })

  const criticals = aggregated.filter(a => a[activeComp] < 5)
  const filtered  = banks.filter(b =>
    !search || b.bankName?.toLowerCase().includes(search.toLowerCase()) || b.city?.toLowerCase().includes(search.toLowerCase())
  )

  // Latest threshold alerts from sync
  const latestAlerts = thresholdAlerts.slice(0,3)

  return (
    <div className="space-y-5 animate-fade-in">
      <SyncBanner/>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Blood Inventory</h1>
          <p className="page-subtitle">
            Real-time stock across all verified blood banks
            {lastUpdated && <span className="text-xs text-green-600 ml-2">· Updated {lastUpdated.toLocaleTimeString('en-IN')}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-white py-2 px-3 flex items-center gap-2 text-sm">
            <RefreshCw size={15}/> Sync
          </button>
          <button className="btn-white py-2 px-3 text-sm flex items-center gap-2">
            <Download size={15}/> Export
          </button>
        </div>
      </div>

      {/* Real-time alerts */}
      {latestAlerts.map((alert, i) => (
        <Alert key={i} type="error"
          message={`⚠️ ${alert.bankName}: ${alert.alerts?.map(a=>`${a.bloodGroup} ${a.level} (${a.total}u)`).join(', ')}`}
        />
      ))}

      {criticals.length > 0 && latestAlerts.length === 0 && (
        <Alert type="error"
          message={`⚠️ Critical shortage: ${criticals.map(c=>c.group).join(', ')} — ${COMP_LABELS[activeComp]} below safe threshold.`}
        />
      )}

      {/* Component selector */}
      <div className="flex flex-wrap gap-2">
        {COMPONENTS.map(c => (
          <button key={c} onClick={() => setActiveComp(c)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
              activeComp===c ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
            }`}>{COMP_LABELS[c]}</button>
        ))}
      </div>

      {/* Blood group grid */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {aggregated.map(item => {
          const val = item[activeComp]
          const status = val < 5 ? 'critical' : val < 15 ? 'low' : 'ok'
          return (
            <div key={item.group}
              className={`rounded-2xl p-4 border-2 text-center transition-all hover:shadow-md ${
                status==='critical' ? 'bg-red-50 border-red-300' :
                status==='low'      ? 'bg-amber-50 border-amber-200' :
                'bg-white border-gray-100'
              }`}>
              <div className={`font-bold text-sm ${status==='critical'?'text-red-700':status==='low'?'text-amber-700':'text-gray-700'}`}>
                {item.group}
              </div>
              <div className={`text-3xl font-black my-1 ${status==='critical'?'text-red-600':status==='low'?'text-amber-600':'text-gray-900'}`}>
                {val}
              </div>
              <div className="text-xs text-gray-400">units</div>
              {status==='critical' && (
                <div className="mt-1 text-xs font-bold text-red-500 flex items-center justify-center gap-1">
                  <AlertTriangle size={10}/> CRITICAL
                </div>
              )}
              {status==='low' && <div className="mt-1 text-xs font-bold text-amber-500">LOW</div>}
            </div>
          )
        })}
      </div>

      {/* Full matrix */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Full Inventory Matrix</h2>
          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <Activity size={13}/>Real-time synced
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="table-header">Blood Group</th>
                <th className="table-header text-red-600">RBC</th>
                <th className="table-header text-amber-600">Plasma</th>
                <th className="table-header text-blue-600">Platelets</th>
                <th className="table-header text-purple-600">Whole Blood</th>
                <th className="table-header">Total</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {aggregated.map(item => {
                const status = item.rbc < 5 ? 'Critical' : item.rbc < 15 ? 'Low' : 'Adequate'
                return (
                  <tr key={item.group} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="table-cell"><BloodGroupBadge group={item.group} size="sm"/></td>
                    <td className="table-cell font-bold text-red-600">{item.rbc}</td>
                    <td className="table-cell font-bold text-amber-600">{item.plasma}</td>
                    <td className="table-cell font-bold text-blue-600">{item.platelets}</td>
                    <td className="table-cell font-bold text-purple-600">{item.wholeBlood}</td>
                    <td className="table-cell font-black text-gray-900">{item.total}</td>
                    <td className="table-cell">
                      <span className={status==='Critical'?'badge-red':status==='Low'?'badge-yellow':'badge-green'}>{status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blood Banks list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Blood Banks ({banks.length})</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="input pl-8 py-2 text-sm w-48" placeholder="Search banks..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon="🩸" title="No banks found" description="Verified blood banks will appear here."/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(bank => {
              const totalUnits = bank.inventory?.reduce((s,i)=>s+i.rbc+i.plasma+i.platelets+i.wholeBlood, 0) || 0
              const hasCritical = bank.inventory?.some(i => i.rbc < 5)
              return (
                <div key={bank._id} className={`border rounded-xl p-4 transition-all hover:shadow-md ${hasCritical?'border-red-200 bg-red-50/30':'border-gray-100 hover:border-red-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{bank.bankName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">📍 {bank.city} · {bank.contactPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${totalUnits < 20 ? 'text-red-600' : 'text-gray-900'}`}>{totalUnits}</div>
                      <div className="text-xs text-gray-400">total units</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {BLOOD_GROUPS.map(g => {
                      const inv = bank.inventory?.find(i=>i.bloodGroup===g)
                      const rbc = inv?.rbc || 0
                      return (
                        <div key={g} className={`rounded-lg p-1 text-center ${rbc<5?'bg-red-100':'bg-gray-50'}`}>
                          <div className={`text-xs font-bold ${rbc<5?'text-red-600':'text-gray-600'}`}>{g}</div>
                          <div className={`text-sm font-black ${rbc<5?'text-red-700':'text-gray-900'}`}>{rbc}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
