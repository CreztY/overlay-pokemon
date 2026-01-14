import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'

interface Pokemon {
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
    <div className={`flex p-4 transition-all duration-500 ${orientation === 'vertical' ? 'flex-col gap-2 items-start' : 'flex-row gap-8 items-end'}`}>
      {[1, 2, 3, 4, 5, 6].map((slot) => {
        const pokemon = team.find((p) => p.slot === slot)
        const isVertical = orientation === 'vertical'

        return (
          <div
            key={slot}
            className={`flex flex-col items-center transition-all duration-500 ease-in-out ${isVertical ? 'w-24' : 'w-32'}`}
            style={{
              opacity: pokemon ? 1 : 0,
              transform: pokemon
                ? 'translate3d(0,0,0) scale(1)'
                : isVertical
                  ? 'translate3d(-50px, 0, 0) scale(0.8)'
                  : 'translate3d(0, 50px, 0) scale(0.8)'
            }}
          >
            {pokemon && (
              <>
                <div className="relative">
                  <img
                    src={pokemon.spriteUrl}
                    alt={pokemon.name}
                    className={`object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] filter transition-all duration-500 ${pokemon.isDead ? 'grayscale' : ''} ${isVertical ? 'w-24 h-24' : 'w-32 h-32'}`}
                  />
                  {!!pokemon.isDead && (
                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-full opacity-80">
                      KO
                    </div>
                  )}
                </div>
                <div className={`mt-1 text-center ${isVertical ? '-mt-1' : 'mt-2'}`}>
                  <h2
                    className={`font-bold capitalize tracking-wide transition-all duration-500 ${pokemon.isDead ? 'text-gray-300' : 'text-white'} ${isVertical ? 'text-sm' : 'text-xl'}`}
                    style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                  >
                    {pokemon.name}
                  </h2>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Overlay