import React, { useState, useEffect, useCallback } from 'react'
import { Bell, AlertTriangle, Heart, Truck, CheckCircle, Info, Calendar, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState } from '../../components/shared/UI'
import SyncBanner from '../../components/shared/SyncBanner'
import { useAuth } from '../../context/AuthContext'
import { useSync } from '../../context/SyncContext'

const typeConfig = {
  emergency:   { icon: AlertTriangle, bg:'bg-red-50',    text:'text-red-600',    border:'border-red-100'    },
  shortage:    { icon: AlertTriangle, bg:'bg-amber-50',  text:'text-amber-600',  border:'border-amber-100'  },
  appointment: { icon: Calendar,     bg:'bg-blue-50',    text:'text-blue-600',   border:'border-blue-100'   },
  delivery:    { icon: Truck,        bg:'bg-blue-50',    text:'text-blue-600',   border:'border-blue-100'   },
  campaign:    { icon: Calendar,     bg:'bg-purple-50',  text:'text-purple-600', border:'border-purple-100' },
  eligibility: { icon: Heart,        bg:'bg-green-50',   text:'text-green-600',  border:'border-green-100'  },
  system:      { icon: Info,         bg:'bg-gray-50',    text:'text-gray-500',   border:'border-gray-100'   },
}

export default function NotificationsPage() {
  const { setUnreadCount } = useAuth()
  const { newCamps, newRequests } = useSync()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]   = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const load = useCallback(() => {
    const params = unreadOnly ? '?unread=true' : ''
    api.get(`/notifications${params}`)
      .then(r => {
        setNotifications(r.data.data.notifications || [])
        setUnreadCount(r.data.data.unreadCount || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [unreadOnly, setUnreadCount])

  useEffect(() => { load() }, [load])

  // Refresh when real-time events arrive
  useEffect(() => {
    if (newCamps.length || newRequests.length) load()
  }, [newCamps.length, newRequests.length])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(n => n.map(notif => notif._id === id ? { ...notif, read: true } : notif))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(n => n.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <SyncBanner/>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{notifications.filter(n => !n.read).length} unread · real-time synced</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-white py-2 px-3"><RefreshCw size={15}/></button>
          <button onClick={() => setUnreadOnly(!unreadOnly)}
            className={`btn-white text-sm py-2 ${unreadOnly ? 'border-red-300 text-red-600' : ''}`}>
            {unreadOnly ? 'Show All' : 'Unread Only'}
          </button>
          <button onClick={markAllRead} className="btn-white text-sm py-2">Mark all read</button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="All caught up!" description="New notifications from blood banks, hospitals, and donors will appear here in real-time."/>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.system
            const Icon = cfg.icon
            return (
              <div key={n._id}
                onClick={() => !n.read && markRead(n._id)}
                className={`bg-white flex gap-4 p-4 rounded-2xl border cursor-pointer hover:shadow-sm transition-all ${cfg.border} ${!n.read ? 'shadow-sm' : 'opacity-70'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon size={18} className={cfg.text}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-gray-900 text-sm">{n.title}</div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                      {!n.read && <span className="w-2 h-2 bg-red-600 rounded-full"/>}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
