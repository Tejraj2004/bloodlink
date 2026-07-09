import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function useHomeSocket() {
  const socketRef = useRef(null)
  const [liveStats, setLiveStats] = useState({
    totalDonors: 52847,
    liveUsers: 342,
    livesSaved: 2913,
    totalDonations: 18420,
    criticalAlerts: 3,
    activeCamps: 7,
    activeDeliveries: 12,
    fulfilledToday: 28,
  })
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, type: 'donation', msg: 'Arjun Sharma donated O+ at State Blood Bank', time: 'Just now',  role: 'donor'     },
    { id: 2, type: 'emergency',msg: 'AIIMS requested 3 units AB- urgently',         time: '1m ago',   role: 'hospital'  },
    { id: 3, type: 'delivery', msg: 'Delivery DL-009 is 8 min away from KIMS',     time: '2m ago',   role: 'ambulance' },
    { id: 4, type: 'camp',     msg: 'New camp registered – Infosys Patia Drive',    time: '5m ago',   role: 'bloodbank' },
    { id: 5, type: 'verified', msg: 'Red Cross Cuttack approved 6 new units',       time: '7m ago',   role: 'bloodbank' },
  ])
  const [onlineRoles, setOnlineRoles] = useState({ donor: 89, hospital: 34, bloodbank: 18, ambulance: 7, patient: 194, admin: 3 })

  useEffect(() => {
    // Simulate real-time updates when socket not available
    const mockInterval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        liveUsers: prev.liveUsers + Math.floor(Math.random() * 3 - 1),
        totalDonations: prev.totalDonations + (Math.random() > 0.8 ? 1 : 0),
        livesSaved: prev.livesSaved + (Math.random() > 0.9 ? 1 : 0),
        activeDeliveries: Math.max(8, prev.activeDeliveries + Math.floor(Math.random() * 3 - 1)),
      }))
    }, 3000)

    // Try real socket
    try {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'], timeout: 3000, reconnection: false })
      socketRef.current.on('live_stats', (data) => setLiveStats(prev => ({ ...prev, ...data })))
      socketRef.current.on('live_event', (event) => {
        setLiveEvents(prev => [event, ...prev.slice(0, 9)])
      })
      socketRef.current.on('online_roles', (data) => setOnlineRoles(data))
    } catch {}

    return () => {
      clearInterval(mockInterval)
      socketRef.current?.disconnect()
    }
  }, [])

  return { liveStats, liveEvents, onlineRoles }
}
