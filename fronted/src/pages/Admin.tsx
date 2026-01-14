import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  Search,
  Plus,
  Trash2,
  Copy,
  LogOut,
  Key,
  Calendar,
  Database,
  ShieldAlert,
  X,
  Skull,
  Heart,
  Box as BoxIcon
} from 'lucide-react'

interface User {
  apiKey: string
  createdAt: string
  pokemonCount: number
}

interface Pokemon {
  id: number
  slot: number
  name: string
  species: string
  spriteUrl: string
  isDead: boolean
}

interface BoxPokemon {
  id: number
  name: string
  species: string
  spriteUrl: string
  isDead: boolean
}

function Admin() {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuth()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPokemon, setUserPokemon] = useState<Pokemon[]>([])
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false)
  const [userBox, setUserBox] = useState<BoxPokemon[]>([])

  const fetchKeys = useCallback(async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/admin/keys')
      const data: User[] = res.data
      setUsers(data)
      return data
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      const socket = io(import.meta.env.VITE_API_URL)

      const loadAndJoinRooms = async () => {
        const data = await fetchKeys()
        if (data) {
          data.forEach((user) => {
            socket.emit('join_room', user.apiKey)
          })
        }
      }

      loadAndJoinRooms()

      socket.on('keys_updated', () => {
        loadAndJoinRooms()
      })

      socket.on('pokemon_updated', () => {
        fetchKeys()
        if (selectedUser) {
          setIsLoadingPokemon(true)
          Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/pokemon/${selectedUser.apiKey}`),
            axios.get(`${import.meta.env.VITE_API_URL}/api/box/${selectedUser.apiKey}`)
          ])
            .then(([teamRes, boxRes]) => {
              setUserPokemon(teamRes.data)
              setUserBox(boxRes.data)
            })
            .catch((err) => {
              console.error(err)
              setUserPokemon([])
              setUserBox([])
            })
            .finally(() => {
              setIsLoadingPokemon(false)
            })
        }
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [isAdmin, fetchKeys, selectedUser])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const lowerQuery = searchQuery.toLowerCase()
      setFilteredUsers(users.filter(user =>
        user.apiKey.toLowerCase().includes(lowerQuery)
      ))
    }
  }, [searchQuery, users])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const success = await loginAdmin(password)
      if (!success) {
        setError('Contraseña incorrecta')
      } else {
        setError('')
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError('Demasiados intentos. Por favor, espera 15 minutos.')
      } else {
        setError('Contraseña incorrecta')
      }
    }
  }

  const generateKey = async () => {
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/admin/keys')
      fetchKeys()
      showToast('Nueva API Key generada', 'success')
    } catch (err) {
      console.error(err)
    }
  }

  const deleteKey = async (key: string) => {
    if (!confirm('¿Seguro que quieres borrar esta key? Esta acción no se puede deshacer y el usuario perderá acceso a su equipo.')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/keys/${key}`)
      fetchKeys()
      if (selectedUser?.apiKey === key) {
        setSelectedUser(null)
      }
      showToast('Key eliminada correctamente', 'success')
    } catch (err) {
      console.error(err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
  }

  const handleUserClick = async (user: User) => {
    setSelectedUser(user)
    setIsLoadingPokemon(true)
    try {
      const [teamRes, boxRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/pokemon/${user.apiKey}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/box/${user.apiKey}`)
      ])
      setUserPokemon(teamRes.data)
      setUserBox(boxRes.data)
    } catch (err) {
      console.error(err)
      setUserPokemon([])
      setUserBox([])
    } finally {
      setIsLoadingPokemon(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <ShieldAlert size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Acceso Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Contraseña de Administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Entrar
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 text-center text-sm bg-red-50 p-2 rounded border border-red-100">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldAlert className="text-blue-600" />
              Panel de Administración
            </h1>
            <p className="text-gray-500 mt-1">Gestiona las API Keys y usuarios del sistema</p>
          </div>
          <button
            onClick={logoutAdmin}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Key size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pokémon</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.reduce((acc, user) => acc + user.pokemonCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-full">
                <Database size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Nuevos (24h)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => {
                    const date = new Date(u.createdAt)
                    const now = new Date()
                    const diffTime = Math.abs(now.getTime() - date.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays <= 1
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                <Calendar size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por API Key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={generateKey}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <Plus size={20} /> Generar Nueva Key
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">API Key</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pokémon</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Database className="mb-2 opacity-20" size={48} />
                        <p>No se encontraron resultados.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.apiKey}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                            {user.apiKey}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(user.apiKey)
                            }}
                            className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copiar Key"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.pokemonCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.pokemonCount} / 6
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteKey(user.apiKey)
                          }}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-md transition-colors"
                          title="Revocar acceso"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <span>Mostrando {filteredUsers.length} de {users.length} usuarios</span>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalles del Usuario</h2>
                <p className="text-sm text-gray-500 font-mono mt-1">{selectedUser.apiKey}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 flex gap-4 text-sm">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                  Creado: {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                  Pokémon: {userPokemon.length} / 6
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                  Caja: {userBox.length}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database size={20} className="text-gray-400" />
                Equipo Pokémon
              </h3>

              {isLoadingPokemon ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userPokemon.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">Este usuario no tiene Pokémon registrados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {userPokemon.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className={`relative p-3 rounded-lg border ${pokemon.isDead ? 'bg-gray-100 border-gray-200' : 'bg-white border-blue-100 shadow-sm'}`}
                    >
                      <div className="absolute top-2 right-2">
                        {pokemon.isDead ? (
                          <Skull size={16} className="text-gray-400" />
                        ) : (
                          <Heart size={16} className="text-red-400 fill-red-400" />
                        )}
                      </div>
                      <div className="aspect-square flex items-center justify-center mb-2">
                        <img
                          src={pokemon.spriteUrl}
                          alt={pokemon.name}
                          className={`w-full h-full object-contain ${pokemon.isDead ? 'grayscale opacity-50' : ''}`}
                        />
                      </div>
                      <p className="text-center font-bold text-sm capitalize truncate" title={pokemon.name}>
                        {pokemon.name}
                      </p>
                      <p className="text-center text-xs text-gray-500">Slot {pokemon.slot}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BoxIcon size={20} className="text-gray-400" />
                  Caja Pokémon
                </h3>

                {isLoadingPokemon ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : userBox.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">Este usuario no tiene Pokémon en la caja.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {userBox.map((pokemon) => (
                      <div
                        key={pokemon.id}
                        className={`relative p-3 rounded-lg border ${pokemon.isDead ? 'bg-gray-100 border-gray-200' : 'bg-white border-blue-100 shadow-sm'}`}
                      >
                        <div className="absolute top-2 right-2">
                          {pokemon.isDead ? (
                            <Skull size={16} className="text-gray-400" />
                          ) : (
                            <Heart size={16} className="text-red-400 fill-red-400" />
                          )}
                        </div>
                        <div className="aspect-square flex items-center justify-center mb-2">
                          <img
                            src={pokemon.spriteUrl}
                            alt={pokemon.name}
                            className={`w-full h-full object-contain ${pokemon.isDead ? 'grayscale opacity-50' : ''}`}
                          />
                        </div>
                        <p className="text-center font-bold text-sm capitalize truncate" title={pokemon.name}>
                          {pokemon.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={() => deleteKey(selectedUser.apiKey)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 size={18} />
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
