import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'

interface Pokemon {
  id: number
  slot: number
  name: string
  species: string
  spriteUrl: string
  isDead: boolean
}

function Overlay() {
  const { apiKey } = useParams()
  const [team, setTeam] = useState<Pokemon[]>([])
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, settingsRes] = await Promise.all([
          axios.get(`/api/pokemon/${apiKey}`),
          axios.get(`/api/settings/${apiKey}`)
        ])
        setTeam(teamRes.data)
        setOrientation(settingsRes.data.orientation)
      } catch (err) {
        console.error(err)
      }
    }

    if (apiKey) {
      fetchData()

      const socket = io('/')

      socket.on('connect', () => {
        console.log('Conectado al servidor de WebSockets')
        socket.emit('join_room', apiKey)
      })

      socket.on('pokemon_updated', () => {
        console.log('Actualización recibida')
        fetchData()
      })

      socket.on('settings_updated', (data: { orientation: 'horizontal' | 'vertical' }) => {
        setOrientation(data.orientation)
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [apiKey])

  return (
    <div className={`p-4 transition-all duration-500`}>
      <SEO title="OBS Overlay" description="Overlay View" noindex={true} />

      <motion.div
        layout
        className={`flex ${orientation === 'vertical' ? 'flex-col gap-4 items-start' : 'flex-row gap-8 items-end'}`}
      >
        {[1, 2, 3, 4, 5, 6].map((slot) => {
          const pokemon = team.find((p) => p.slot === slot)
          const isVertical = orientation === 'vertical'

          return (
            <div
              key={slot}
              className={`relative flex flex-col items-center justify-end ${isVertical ? 'w-24 h-32' : 'w-32 h-40'}`}
            >
              <AnimatePresence mode='popLayout'>
                {pokemon && (
                  <motion.div
                    layoutId={`pokemon-${pokemon.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      filter: pokemon.isDead ? 'grayscale(100%)' : 'grayscale(0%)'
                    }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                      mass: 0.8
                    }}
                    className="flex flex-col items-center absolute bottom-0"
                    style={{ zIndex: 10 }} // Ensure it floats above empty slots if needed
                  >
                    <div className="relative group">
                      <motion.img
                        src={pokemon.spriteUrl}
                        alt={pokemon.name}
                        className={`object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transition-all ${isVertical ? 'w-24 h-24' : 'w-32 h-32'}`}
                        animate={{
                          filter: pokemon.isDead ? 'grayscale(100%)' : 'grayscale(0%)',
                        }}
                      />

                      <AnimatePresence>
                        {pokemon.isDead && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full opacity-90 font-bold shadow-md ring-1 ring-white/20"
                          >
                            KO
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className={`mt-1 text-center relative z-20 ${isVertical ? '-mt-1' : 'mt-2'}`}>
                      <motion.h2
                        layout
                        className={`font-bold capitalize tracking-wide ${pokemon.isDead ? 'text-gray-400' : 'text-white'} ${isVertical ? 'text-sm' : 'text-xl'}`}
                        style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                      >
                        {pokemon.name}
                      </motion.h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default Overlay