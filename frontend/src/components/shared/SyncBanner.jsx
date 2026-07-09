import React, { useState } from 'react'
import { Wifi, WifiOff, ChevronDown, ChevronUp, AlertTriangle, Bell } from 'lucide-react'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'

function PulseDot({ color = 'bg-green-500' }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}/>
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}/>
    </span>
  )
}

export default function SyncBanner() {
  const { socket } = useAuth()
  const { thresholdAlerts, newRequests, newCamps, onlineCounts } = useSync()
  const [expanded, setExpanded] = useState(false)
  const connected = socket?.connected

  const totalOnline = Object.values(onlineCounts).reduce((a, b) => a + b, 0)
  const criticals = thresholdAlerts.flatMap(a => a.alerts?.filter(x => x.level === 'critical') || [])

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden transition-all ${connected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {connected
            ? <><PulseDot color="bg-green-500"/><span className="text-xs font-semibold text-green-700">Live Sync Active</span></>
            : <><WifiOff size={14} className="text-gray-400"/><span className="text-xs font-medium text-gray-500">Connecting...</span></>
          }
          {connected && totalOnline > 0 && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
              {totalOnline} users online
            </span>
          )}
          {criticals.length > 0 && (
            <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <AlertTriangle size={11}/>{criticals.length} critical alerts
            </span>
          )}
          {newRequests.length > 0 && (
            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Bell size={11}/>{newRequests.length} new requests
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {Object.entries(onlineCounts).filter(([,v])=>v>0).map(([role,count])=>(
            <span key={role} className="hidden sm:inline capitalize">{count} {role}</span>
          ))}
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-green-200 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {criticals.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs">
                <AlertTriangle size={13} className="text-red-600 flex-shrink-0"/>
                <span className="text-red-700 font-semibold">{a.bloodGroup} critically low ({a.total} units)</span>
              </div>
            ))}
            {newCamps.slice(0,2).map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs">
                <span>📍</span>
                <span className="text-purple-700 font-medium truncate">New camp: {c.camp?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
