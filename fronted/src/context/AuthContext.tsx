import { createContext, useState, useContext, type ReactNode } from 'react'
import axios from 'axios'

interface AuthContextType {
  isAdmin: boolean
  loginAdmin: (password: string) => Promise<boolean>
  logoutAdmin: () => void
  userKey: string | null
  setUserKey: (key: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [userKey, setUserKey] = useState<string | null>(localStorage.getItem('pokemon_overlay_key'))

  const loginAdmin = async (password: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, { password })
      if (response.data.success) {
        setIsAdmin(true)
        return true
      }
    } catch (error) {
      console.error('Login failed', error)
      throw error
    }
    return false
  }

  const logoutAdmin = () => {
    setIsAdmin(false)
  }

  const setKey = (key: string | null) => {
    setUserKey(key)
    if (key) {
      localStorage.setItem('pokemon_overlay_key', key)
    } else {
      localStorage.removeItem('pokemon_overlay_key')
    }
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin, userKey, setUserKey: setKey }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
