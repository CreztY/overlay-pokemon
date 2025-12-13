import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Eye,
  EyeOff,
  Copy,
  LogOut,
  ArrowLeftRight,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Skull,
  Heart,
  Search,
  Key
} from 'lucide-react'

interface Pokemon {
  id: number
  slot: number
  name: string
  species: string
  spriteUrl: string
  isDead: boolean
}

// Componente para cada Slot Sortable
function SortableSlot({ slot, pokemon, onEdit, onToggleDead }: { slot: number, pokemon?: Pokemon, onEdit: () => void, onToggleDead: (status: boolean) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slot })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='relative'>
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl transform rotate-2 group-hover:rotate-1 transition-transform duration-500 cursor-grab" />
      <div
        className={`bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow min-h-[250px] relative cursor-grab ${pokemon?.isDead ? 'bg-gray-100' : ''} ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''}`}
      >
        <div className="text-gray-400 font-semibold mb-2 w-full flex justify-between items-center">
          <span>Slot {slot}</span>
          {pokemon && (
            <button
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
              onClick={(e) => {
                e.stopPropagation();
                onToggleDead(!!pokemon.isDead);
              }}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-bold cursor-pointer transition-colors ${pokemon.isDead ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'}`}
              title={pokemon.isDead ? "Revivir" : "Debilitar"}
            >
              {pokemon.isDead ? <Heart size={14} /> : <Skull size={14} />}
              {pokemon.isDead ? "REVIVIR" : "DEBILITAR"}
            </button>
          )}
        </div>
        {pokemon ? (
          <div className="flex flex-col items-center">
            <img
              src={pokemon.spriteUrl}
              alt={pokemon.name}
              className={`w-32 h-32 object-contain mb-4 drop-shadow-md ${pokemon.isDead ? 'grayscale opacity-60' : ''}`}
            />
            <p className={'text-xl font-bold capitalize text-gray-800'}>{pokemon.name}</p>
            {pokemon.name.toLowerCase() !== pokemon.species.toLowerCase() && (
              <p className="text-sm text-gray-500 capitalize">({pokemon.species})</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow text-gray-400">
            <Plus size={48} className="mb-2 opacity-20" />
            <p>Vacío</p>
          </div>
        )}
        <button
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
          onClick={onEdit}
          className="mt-6 w-full py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium cursor-pointer flex items-center justify-center gap-2"
        >
          {pokemon ? <><Edit2 size={16} /> Editar</> : <><Plus size={16} /> Añadir Pokémon</>}
        </button>
      </div>
    </div>
  )
}

function Panel() {
  const { userKey, setUserKey } = useAuth()
  const [inputKey, setInputKey] = useState('')
  const [showLoginKey, setShowLoginKey] = useState(false)
  const [isCreatingKey, setIsCreatingKey] = useState(false)

  const [team, setTeam] = useState<Pokemon[]>([])
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [isDead, setIsDead] = useState(false)
  const [customSpriteUrl, setCustomSpriteUrl] = useState('')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [showApiKey, setShowApiKey] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchTeam = async () => {
    if (!userKey) return
    try {
      const res = await axios.get(`http://localhost:3000/api/pokemon/${userKey}`)
      setTeam(res.data)

      const settingsRes = await axios.get(`http://localhost:3000/api/settings/${userKey}`)
      setOrientation(settingsRes.data.orientation)
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        alert('API Key inválida')
        setUserKey(null)
      }
    }
  }

  const toggleOrientation = async () => {
    if (!userKey) return
    const newOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'
    setOrientation(newOrientation)
    try {
      await axios.post(`http://localhost:3000/api/settings/${userKey}`, { orientation: newOrientation })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (userKey) {
      fetchTeam()

      const socket = io('http://localhost:3000')

      socket.on('connect', () => {
        socket.emit('join_room', userKey)
      })

      socket.on('pokemon_updated', () => {
        fetchTeam()
      })

      return () => {
        socket.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey])

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUserKey(inputKey)
  }

  const handleCreateKey = async () => {
    setIsCreatingKey(true)
    try {
      const res = await axios.post('http://localhost:3000/api/keys')
      if (res.data.success) {
        setInputKey(res.data.apiKey)
        setUserKey(res.data.apiKey)
      }
    } catch (err) {
      console.error(err)
      alert('Error al crear la API Key')
    } finally {
      setIsCreatingKey(false)
    }
  }

  const openEditModal = (slot: number) => {
    setEditingSlot(slot)
    setSearchQuery('')
    setSearchResults([])
    setSelectedPokemon(null)
    setNickname('')
    setIsDead(false)
    setCustomSpriteUrl('')

    // Pre-fill if slot exists
    const existing = team.find(p => p.slot === slot)
    if (existing) {
      setNickname(existing.name)
      setIsDead(!!existing.isDead)
      // Check if it's a custom URL (not from pokeapi) - simple heuristic or just leave empty
      if (!existing.spriteUrl.includes('pokeapi.co')) {
        setCustomSpriteUrl(existing.spriteUrl)
      }
    }
  }

  const searchPokemon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery) return
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`)
      setSearchResults([res.data])
      setSelectedPokemon(res.data)
    } catch (err) {
      console.error(err)
      setSearchResults([])
      alert('Pokémon no encontrado')
    }
  }

  const toggleDeadStatus = async (slot: number, currentStatus: boolean) => {
    if (!userKey) return
    const pokemon = team.find(p => p.slot === slot)
    if (!pokemon) return

    try {
      await axios.post(`http://localhost:3000/api/pokemon/${userKey}`, {
        slot,
        name: pokemon.name,
        species: pokemon.species,
        spriteUrl: pokemon.spriteUrl,
        isDead: !currentStatus
      })
      // Socket will update the UI
    } catch (err) {
      console.error(err)
    }
  }

  const saveSlot = async () => {
    if (!userKey || !editingSlot) return

    const existing = team.find(p => p.slot === editingSlot)

    let species = existing?.species
    let spriteUrl = existing?.spriteUrl

    if (selectedPokemon) {
      species = selectedPokemon.name
      spriteUrl = selectedPokemon.sprites.front_default
    }

    if (customSpriteUrl) {
      spriteUrl = customSpriteUrl
      if (!species && !existing) {
        species = "Custom"
      }
    }

    if (!species && !spriteUrl && !existing) {
      alert('Selecciona un Pokémon o introduce una URL')
      return
    }

    // If we are just updating status of existing pokemon without selecting new one
    if (!selectedPokemon && !customSpriteUrl && existing) {
      species = existing.species
      spriteUrl = existing.spriteUrl
    }

    try {
      await axios.post(`http://localhost:3000/api/pokemon/${userKey}`, {
        slot: editingSlot,
        name: nickname || species,
        species,
        spriteUrl,
        isDead
      })
      setEditingSlot(null)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteSlot = async () => {
    if (!userKey || !editingSlot) return
    if (!confirm('¿Estás seguro de que quieres liberar a este Pokémon?')) return

    try {
      await axios.delete(`http://localhost:3000/api/pokemon/${userKey}/${editingSlot}`)
      setEditingSlot(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = (active.id as number) - 1
      const newIndex = (over?.id as number) - 1

      const slots = [1, 2, 3, 4, 5, 6]
      const newSlots = arrayMove(slots, oldIndex, newIndex)

      const updates: { id: number, slot: number }[] = []

      newSlots.forEach((originalSlotNum, index) => {
        const newSlotNum = index + 1
        const pokemon = team.find(p => p.slot === originalSlotNum)
        if (pokemon) {
          updates.push({ id: pokemon.id, slot: newSlotNum })
        }
      })

      // Optimistic update
      const newTeam = team.map(p => {
        const update = updates.find(u => u.id === p.id)
        return update ? { ...p, slot: update.slot } : p
      })
      setTeam(newTeam)

      try {
        await axios.put(`http://localhost:3000/api/pokemon/${userKey}/reorder`, { items: updates })
      } catch (err) {
        console.error("Failed to reorder", err)
        fetchTeam() // Revert on error
      }
    }
  }

  if (!userKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Acceso al Panel</h1>
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showLoginKey ? "text" : "password"}
                placeholder="Introduce tu API Key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowLoginKey(!showLoginKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showLoginKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-3">¿Aún no tienes una API Key?</p>
            <button
              onClick={handleCreateKey}
              disabled={isCreatingKey}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-2 mx-auto hover:underline"
            >
              {isCreatingKey ? 'Creando...' : <><Key size={16} /> Pulsa aquí y crea una gratis</>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Tu Equipo Pokémon</h1>
          <div className="flex gap-4">
            <button
              onClick={toggleOrientation}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 cursor-pointer"
            >
              {orientation === 'horizontal' ? <ArrowLeftRight size={18} /> : <ArrowUpDown size={18} />}
              <span>{orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
            </button>
            <button
              onClick={() => setUserKey(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Información de Conexión</h2>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${showApiKey
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              {showApiKey ? 'Ocultar Datos' : 'Mostrar Datos'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
              <span className="font-medium text-gray-600 mb-1 sm:mb-0">API Key:</span>
              <div className="flex items-center gap-2 overflow-hidden max-w-full">
                <code className={`font-mono text-sm bg-white px-2 py-1 rounded border border-gray-200 text-gray-700 transition-all duration-300 ${!showApiKey ? 'blur-[4px] select-none' : ''}`}>
                  {userKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userKey)
                    alert('API Key copiada al portapapeles')
                  }}
                  className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-colors flex-shrink-0"
                  title="Copiar API Key"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
              <span className="font-medium text-gray-600 mb-1 sm:mb-0">Overlay URL:</span>
              <div className="flex items-center gap-2 overflow-hidden max-w-full">
                <a
                  href={`${window.location.origin}/overlay/${userKey}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-blue-600 hover:underline text-sm truncate transition-all duration-300 ${!showApiKey ? 'blur-[4px] select-none' : ''}`}
                >
                  {window.location.origin}/overlay/{userKey}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/overlay/${userKey}`)
                    alert('URL copiada al portapapeles')
                  }}
                  className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-colors flex-shrink-0"
                  title="Copiar URL"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={[1, 2, 3, 4, 5, 6]}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((slot) => {
                const pokemon = team.find((p) => p.slot === slot)
                return (
                  <SortableSlot
                    key={slot}
                    slot={slot}
                    pokemon={pokemon}
                    onEdit={() => openEditModal(slot)}
                    onToggleDead={(status) => toggleDeadStatus(slot, status)}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>

        {editingSlot && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Editar Slot {editingSlot}</h2>
                <button
                  onClick={() => setEditingSlot(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Pokémon</label>
                  <form onSubmit={searchPokemon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ej: pikachu, charizard..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Buscar
                    </button>
                  </form>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">O URL de Imagen Personalizada</label>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/mi-imagen.png"
                    value={customSpriteUrl}
                    onChange={(e) => setCustomSpriteUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {(selectedPokemon || customSpriteUrl || (team.find(p => p.slot === editingSlot) && !selectedPokemon)) && (
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={customSpriteUrl || (selectedPokemon ? selectedPokemon.sprites.front_default : team.find(p => p.slot === editingSlot)?.spriteUrl)}
                      alt="Preview"
                      className={`w-24 h-24 object-contain ${isDead ? 'grayscale' : ''}`}
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/96?text=?')}
                    />
                    <p className="font-bold text-gray-800 capitalize">
                      {selectedPokemon ? selectedPokemon.name : (customSpriteUrl ? 'Imagen Personalizada' : team.find(p => p.slot === editingSlot)?.species)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mote (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Sparky"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isDead"
                    checked={isDead}
                    onChange={(e) => setIsDead(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isDead" className="text-gray-700 font-medium cursor-pointer flex items-center gap-2">
                    <Skull size={18} />
                    Marcar como debilitado (Blanco y Negro)
                  </label>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                {team.find(p => p.slot === editingSlot) ? (
                  <button
                    onClick={deleteSlot}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Liberar
                  </button>
                ) : <div></div>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveSlot}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-2"
                  >
                    <Save size={18} />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Panel
