import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Chatbot from './components/shared/Chatbot'

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard'
import DonorsPage from './components/admin/DonorsPage'
import HospitalsPage from './components/admin/HospitalsPage'
import BloodBanksPage from './components/admin/BloodBanksPage'
import ForecastingPage from './components/admin/ForecastingPage'
import AnalyticsPage from './components/admin/AnalyticsPage'
import CampaignsPage from './components/admin/CampaignsPage'

// Shared pages
import InventoryPage from './components/shared/InventoryPage'
import RequestsPage from './components/shared/RequestsPage'
import NotificationsPage from './components/shared/NotificationsPage'

// Role dashboards
import DonorDashboard from './components/donor/DonorDashboard'
import PatientDashboard from './components/patient/PatientDashboard'
import HospitalDashboard from './components/hospital/HospitalDashboard'
import BloodBankDashboard from './components/bloodbank/BloodBankDashboard'
import AmbulanceDashboard from './components/ambulance/AmbulanceDashboard'

function PageRenderer() {
  const { activeRole, activePage } = useApp()

  // Notifications is universal
  if (activePage === 'notifications') return <NotificationsPage />

  // Role-specific routing
  if (activeRole === 'admin') {
    switch (activePage) {
      case 'dashboard': return <AdminDashboard />
      case 'inventory': return <InventoryPage />
      case 'requests': return <RequestsPage />
      case 'donors': return <DonorsPage />
      case 'hospitals': return <HospitalsPage />
      case 'bloodbanks': return <BloodBanksPage />
      case 'analytics': return <AnalyticsPage />
      case 'forecasting': return <ForecastingPage />
      case 'campaigns': return <CampaignsPage />
      default: return <AdminDashboard />
    }
  }

  if (activeRole === 'bloodbank') {
    switch (activePage) {
      case 'dashboard': return <BloodBankDashboard />
      case 'inventory': return <InventoryPage />
      case 'requests': return <RequestsPage />
      default: return <BloodBankDashboard />
    }
  }

  if (activeRole === 'hospital') {
    switch (activePage) {
      case 'dashboard': return <HospitalDashboard />
      case 'inventory': return <InventoryPage />
      case 'requests': return <RequestsPage showNewRequestForm={activePage === 'requests'} />
      case 'hospitals': return <HospitalsPage />
      default: return <HospitalDashboard />
    }
  }

  if (activeRole === 'donor') {
    switch (activePage) {
      case 'dashboard': return <DonorDashboard />
      case 'camps': return <CampaignsPage />
      default: return <DonorDashboard />
    }
  }

  if (activeRole === 'patient') {
    switch (activePage) {
      case 'dashboard': return <PatientDashboard />
      case 'newrequest': return <RequestsPage showNewRequestForm={true} />
      case 'inventory': return <InventoryPage />
      default: return <PatientDashboard />
    }
  }

  if (activeRole === 'ambulance') {
    return <AmbulanceDashboard />
  }

  return <AdminDashboard />
}

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <PageRenderer />
        </main>
      </div>
      <Chatbot />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  )
}
