import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const roles = [
  { id: 'admin', label: 'Administrator', color: 'purple' },
  { id: 'bloodbank', label: 'Blood Bank', color: 'red' },
  { id: 'hospital', label: 'Hospital', color: 'blue' },
  { id: 'donor', label: 'Donor', color: 'green' },
  { id: 'patient', label: 'Patient', color: 'amber' },
  { id: 'ambulance', label: 'Ambulance', color: 'orange' },
]

export function AppProvider({ children }) {
  const [activeRole, setActiveRole] = useState('admin')
  const [activePage, setActivePage] = useState('dashboard')
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', message: 'O- critically low — 3 units remain', read: false },
    { id: 2, type: 'request', message: 'New emergency request from AIIMS', read: false },
    { id: 3, type: 'delivery', message: 'Delivery DL002 is 25 min away', read: true },
  ])

  return (
    <AppContext.Provider value={{ activeRole, setActiveRole, activePage, setActivePage, notifications, setNotifications }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
