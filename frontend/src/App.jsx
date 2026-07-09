import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SyncProvider } from './context/SyncContext'
import AppLayout from './components/layout/AppLayout'
import { PageLoader } from './components/shared/UI'
import HomePage from './pages/HomePage'

// Auth
import LoginPage           from './pages/auth/LoginPage'
import RegisterPage        from './pages/auth/RegisterPage'
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage'

// Role dashboards
import AdminDashboard      from './pages/admin/AdminDashboard'
import DonorDashboard      from './pages/donor/DonorDashboard'
import BloodBankDashboard  from './pages/bloodbank/BloodBankDashboard'
import HospitalDashboard   from './pages/hospital/HospitalDashboard'
import AmbulanceDashboard  from './pages/ambulance/AmbulanceDashboard'

// Shared
import RequestsPage        from './pages/shared/RequestsPage'
import NotificationsPage   from './pages/shared/NotificationsPage'
import InventoryPage       from './pages/shared/InventoryPage'
import CampsPage           from './pages/shared/CampsPage'
import DeliveriesPage      from './pages/shared/DeliveriesPage'
import SettingsPage        from './pages/shared/SettingsPage'

// Admin
import UsersPage           from './pages/admin/UsersPage'
import AnalyticsPage       from './pages/admin/AnalyticsPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>
  return children
}

function RoleDashboard() {
  const { user } = useAuth()
  switch (user?.role) {
    case 'admin':     return <AdminDashboard />
    case 'bloodbank': return <BloodBankDashboard />
    case 'hospital':  return <HospitalDashboard />
    case 'donor':     return <DonorDashboard />
    case 'ambulance': return <AmbulanceDashboard />
    case 'patient':   return <RequestsPage />
    default:          return <AdminDashboard />
  }
}

function AppShell() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/"              element={<Navigate to="/dashboard" replace/>}/>
        <Route path="/dashboard"     element={<RoleDashboard />}/>
        <Route path="/requests"      element={<RequestsPage />}/>
        <Route path="/requests/new"  element={<RequestsPage />}/>
        <Route path="/notifications" element={<NotificationsPage />}/>
        <Route path="/inventory"     element={<InventoryPage />}/>
        <Route path="/camps"         element={<CampsPage />}/>
        <Route path="/deliveries"    element={<DeliveriesPage />}/>
        <Route path="/settings"      element={<SettingsPage />}/>
        <Route path="/history"       element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>}/>
        <Route path="/appointments"  element={<ProtectedRoute roles={['donor','bloodbank']}><DonorDashboard /></ProtectedRoute>}/>
        <Route path="/achievements"  element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>}/>
        <Route path="/testing"       element={<ProtectedRoute roles={['bloodbank']}><BloodBankDashboard /></ProtectedRoute>}/>
        <Route path="/units"         element={<ProtectedRoute roles={['bloodbank']}><BloodBankDashboard /></ProtectedRoute>}/>
        <Route path="/donors"        element={<ProtectedRoute roles={['admin','bloodbank']}><UsersPage /></ProtectedRoute>}/>
        <Route path="/hospitals"     element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>}/>
        <Route path="/bloodbanks"    element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>}/>
        <Route path="/analytics"     element={<ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>}/>
        <Route path="*"              element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
    </AppLayout>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><PageLoader /></div>
  return (
    <Routes>
      <Route path="/"                element={<HomePage />}/>
      <Route path="/home"            element={<HomePage />}/>
      <Route path="/login"           element={!user ? <LoginPage/> : <Navigate to="/dashboard" replace/>}/>
      <Route path="/register"        element={!user ? <RegisterPage/> : <Navigate to="/dashboard" replace/>}/>
      <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
      <Route path="/*"               element={user ? <AppShell /> : <Navigate to="/login" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SyncProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            duration: 4500,
            style: { background:'#fff', color:'#1f2937', border:'1px solid #fee2e2', borderRadius:'12px', fontSize:'14px', fontWeight:500, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
            success: { iconTheme: { primary:'#dc2626', secondary:'#fff' } },
          }}/>
        </SyncProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
