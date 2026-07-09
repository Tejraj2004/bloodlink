import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { io } from 'socket.io-client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [socket, setSocket]       = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Bootstrap: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.data.user)
          initSocket(data.data.user._id)
        })
        .catch(() => clearSession())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const initSocket = (userId) => {
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { transports: ['websocket'] })
    s.on('connect', () => {
      s.emit('join_user', userId)
      console.log('🔌 Socket connected')
    })
    s.on('notification', () => setUnreadCount(c => c + 1))
    setSocket(s)
    return s
  }

  const saveSession = (accessToken, refreshToken, userData) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setUser(userData)
    initSocket(userData._id)
  }

  const clearSession = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    socket?.disconnect()
    setSocket(null)
  }

  // Register
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    const { user: u, accessToken, refreshToken } = data.data
    saveSession(accessToken, refreshToken, u)
    return data
  }

  // Login
  const login = async (email, password, role) => {
    const { data } = await api.post('/auth/login', { email, password, role })
    const { user: u, accessToken, refreshToken } = data.data
    saveSession(accessToken, refreshToken, u)
    return data
  }

  // Google OAuth
  const googleLogin = async (idToken, role = null) => {
    const { data } = await api.post('/auth/google', { idToken, role })
    const { user: u, accessToken, refreshToken } = data.data
    saveSession(accessToken, refreshToken, u)
    return data
  }

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp })
    setUser(data.data.user)
    return data
  }

  // Resend OTP
  const resendOTP = async (email) => {
    const { data } = await api.post('/auth/resend-otp', { email })
    return data
  }

  // Logout
  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    clearSession()
  }

  // Forgot / Reset
  const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
  const resetPassword  = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword })

  const isRole = useCallback((...roles) => roles.includes(user?.role), [user])

  return (
    <AuthContext.Provider value={{
      user, loading, socket, unreadCount, setUnreadCount,
      register, login, googleLogin, verifyOTP, resendOTP, logout,
      forgotPassword, resetPassword, isRole,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
