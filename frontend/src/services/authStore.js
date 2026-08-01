import { create } from 'zustand'
import api from './api.js'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false })
      throw error
    }
  },

  register: async (name, email, phone, password, confirmPassword) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { 
        name, email, phone, password, confirmPassword 
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false, error: null })
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user })
      return data.user
    } catch {
      get().logout()
    }
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user })
    return data.user
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
