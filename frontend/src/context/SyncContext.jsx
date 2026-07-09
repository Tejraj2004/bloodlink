import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const { user, socket } = useAuth()
  const [inventoryUpdates, setInventoryUpdates] = useState([])   // live inventory changes
  const [newRequests,      setNewRequests]       = useState([])   // new blood requests (for bloodbank)
  const [newCamps,         setNewCamps]          = useState([])   // new camps (for donors)
  const [thresholdAlerts,  setThresholdAlerts]   = useState([])   // low-stock alerts
  const [liveDeliveries,   setLiveDeliveries]    = useState({})   // deliveryId → latest coords
  const [onlineCounts,     setOnlineCounts]      = useState({})   // role → count
  const [verificationResult, setVerificationResult] = useState(null)

  const addToast = useCallback((msg, type = 'default') => {
    if (type === 'error')   toast.error(msg, { duration: 6000 })
    else if (type === 'success') toast.success(msg, { duration: 5000 })
    else toast(msg, { duration: 5000, icon: '🩸' })
  }, [])

  useEffect(() => {
    if (!socket || !user) return

    // Join entity-specific rooms
    socket.emit('join', { userId: user._id, role: user.role })

    // ── INVENTORY UPDATED (hospitals, admins, bloodbank) ──────────────────
    socket.on('inventory_updated', (data) => {
      setInventoryUpdates(prev => [data, ...prev.slice(0, 9)])
      if (user.role === 'hospital' || user.role === 'admin') {
        addToast(`📦 Inventory updated at ${data.bankName}, ${data.city}`)
      }
    })

    // ── THRESHOLD ALERT (admins, bloodbank) ──────────────────────────────
    socket.on('threshold_alert', (data) => {
      setThresholdAlerts(prev => [data, ...prev.slice(0, 9)])
      const criticals = data.alerts?.filter(a => a.level === 'critical')
      if (criticals?.length) {
        addToast(`⚠️ CRITICAL: ${criticals.map(a => a.bloodGroup).join(', ')} low at ${data.bankName}`, 'error')
      }
    })

    // ── NEW REQUEST (bloodbank, admin) ────────────────────────────────────
    socket.on('new_request', (data) => {
      setNewRequests(prev => [data.request, ...prev.slice(0, 19)])
      if (user.role === 'bloodbank') {
        addToast(`🩸 New ${data.request.urgency} request: ${data.request.bloodGroup} — ${data.request.patientName}`)
      }
    })

    socket.on('emergency_request', (data) => {
      if (user.role === 'bloodbank' || user.role === 'admin') {
        toast.error(`🚨 EMERGENCY: ${data.request?.bloodGroup || ''} blood urgently needed!`, { duration: 10000 })
      }
    })

    // ── REQUEST STATUS CHANGED (requester, hospital) ──────────────────────
    socket.on('request_status_changed', (data) => {
      addToast(`📋 Request ${data.requestId_str || ''} → ${data.status}`)
    })

    socket.on('request_fulfilled', (data) => {
      toast.success(`✅ Blood request fulfilled for ${data.patientName}!`, { duration: 8000 })
    })

    // ── NEW CAMP (donors) ─────────────────────────────────────────────────
    socket.on('new_camp', (data) => {
      setNewCamps(prev => [data, ...prev.slice(0, 9)])
      if (user.role === 'donor') {
        toast(`📍 New donation camp: ${data.camp?.name} — Register now!`, { duration: 8000, icon: '📍' })
      }
    })

    // ── CAMP REGISTRATION (bloodbank) ─────────────────────────────────────
    socket.on('camp_registration', (data) => {
      if (user.role === 'bloodbank') {
        addToast(`❤️ ${data.donor?.name} registered for ${data.campName} (${data.registered}/${data.target})`)
      }
    })

    // ── DONATION RECORDED (donor) ─────────────────────────────────────────
    socket.on('donation_recorded', (data) => {
      toast.success(`❤️ Your donation at ${data.bankName} has been recorded!`, { duration: 8000 })
    })

    // ── TTI COMPLETED (bloodbank, hospitals) ──────────────────────────────
    socket.on('tti_completed', (data) => {
      if (user.role === 'bloodbank') {
        const ok = data.status === 'Approved'
        addToast(`🧪 Unit ${data.unit?.unitId} ${ok ? 'APPROVED ✅' : 'REJECTED ❌'} after TTI`, ok ? 'success' : 'error')
      }
    })

    // ── DELIVERY ──────────────────────────────────────────────────────────
    socket.on('new_delivery', (data) => {
      if (user.role === 'ambulance') {
        toast(`🚚 New delivery assigned: ${data.delivery?.deliveryId}`, { duration: 8000, icon: '🚚' })
      }
    })

    socket.on('delivery_status', (data) => {
      addToast(`🚚 Delivery ${data.deliveryId} → ${data.status}`)
    })

    socket.on('delivery_created', (data) => {
      if (user.role === 'hospital') {
        toast(`🚚 Blood delivery dispatched to your hospital — ETA soon!`, { duration: 8000, icon: '🚚' })
      }
    })

    socket.on('delivery_location', (data) => {
      setLiveDeliveries(prev => ({ ...prev, [data.deliveryId]: data.coordinates }))
    })

    // ── EMERGENCY ALERT (donors) ──────────────────────────────────────────
    socket.on('emergency_alert', (data) => {
      if (user.role === 'donor') {
        toast.error(`🚨 EMERGENCY: ${data.bloodGroup} blood needed at ${data.hospitalName}! Please donate.`, { duration: 15000 })
      }
    })

    // ── ADMIN VERIFICATION RESULT ─────────────────────────────────────────
    socket.on('verification_result', (data) => {
      setVerificationResult(data)
      if (data.approved) toast.success(data.message, { duration: 10000 })
      else               toast.error(data.message,   { duration: 10000 })
    })

    // ── ONLINE COUNTS ─────────────────────────────────────────────────────
    socket.on('online_counts', (data) => setOnlineCounts(data))

    return () => {
      socket.off('inventory_updated')
      socket.off('threshold_alert')
      socket.off('new_request')
      socket.off('emergency_request')
      socket.off('request_status_changed')
      socket.off('request_fulfilled')
      socket.off('new_camp')
      socket.off('camp_registration')
      socket.off('donation_recorded')
      socket.off('tti_completed')
      socket.off('new_delivery')
      socket.off('delivery_status')
      socket.off('delivery_created')
      socket.off('delivery_location')
      socket.off('emergency_alert')
      socket.off('verification_result')
      socket.off('online_counts')
    }
  }, [socket, user, addToast])

  return (
    <SyncContext.Provider value={{
      inventoryUpdates, newRequests, newCamps, thresholdAlerts,
      liveDeliveries, onlineCounts, verificationResult,
    }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => useContext(SyncContext)
