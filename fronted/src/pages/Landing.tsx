import { useState } from 'react'
import { Link } from 'react-router-dom'
import preview1 from '../assets/preview1.png'
import preview2 from '../assets/preview2.png'
import { X, ZoomIn } from 'lucide-react'

function Landing() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Section */}
            <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white pt-32 pb-40 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6 tracking-wide uppercase">
                        v1.0 Ahora Disponible
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 tracking-tight drop-shadow-xl leading-tight">
                        Tu Nuzlocke,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                            Más Profesional
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 opacity-90 font-light max-w-2xl mx-auto leading-relaxed text-blue-50">
                        Gestiona tu equipo Pokémon en tiempo real, sincroniza con OBS y sorprende a tu audiencia con un overlay dinámico y moderno.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            to="/panel"
                            className="px-10 py-4 bg-white text-blue-700 rounded-full font-bold text-lg shadow-2xl hover:shadow-blue-900/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
                        >
                            Comenzar Ahora
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <a
                            href="#showcase"
                            className="px-10 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        >
                            Saber más
                        </a>
                    </div>
                </div>

                {/* Curve Divider */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] fill-white">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </header>

            {/* Showcase Section 1 */}
            <section id="showcase" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Panel de Control
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Control Total de tu Equipo
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Olvídate de editar textos en OBS manualmente. Accede a tu panel personal y gestiona cada aspecto de tu equipo con una interfaz intuitiva y rápida.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Búsqueda instantánea con la PokéAPI",
                                "Soporte para motes y estados (Vivo/Muerto)",
                                "Previsualización de sprites en tiempo real",
                                "Drag & Drop para reordenar tu equipo"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 relative group cursor-pointer" onClick={() => setSelectedImage(preview1)}>
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl transform rotate-2 group-hover:rotate-1 transition-transform duration-500"></div>
                        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 group-hover:scale-[1.02] transition-transform duration-500">
                            <img src={preview1} alt="Panel Dashboard" className="w-full h-auto" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-full font-medium shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                                    <ZoomIn size={18} /> Ampliar
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Showcase Section 2 */}
            <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
                    <div className="flex-1 relative group cursor-pointer" onClick={() => setSelectedImage(preview2)}>
                        <div className="absolute -inset-4 bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl transform -rotate-2 group-hover:-rotate-1 transition-transform duration-500"></div>
                        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 group-hover:scale-[1.02] transition-transform duration-500">
                            <img src={preview2} alt="OBS Overlay Preview" className="w-full h-auto" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-full font-medium shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                                    <ZoomIn size={18} /> Ampliar
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 font-medium text-sm">
                            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                            Integración OBS
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Diseñado para Streamers
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Un overlay limpio, moderno y totalmente adaptable. Copia la URL, pégala en OBS como fuente de navegador y listo.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Fondo transparente nativo",
                                "Animaciones suaves de entrada y salida",
                                "Modo Vertical y Horizontal ajustable",
                                "Sincronización instantánea vía WebSockets"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">✓</div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Todo lo que necesitas para tu Nuzlocke
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Hemos pensado en cada detalle para que tú solo te preocupes de no perder el locke.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "⚡",
                                title: "Tiempo Real",
                                desc: "Cualquier cambio en el panel se refleja en milisegundos en tu stream. Sin refrescar."
                            },
                            {
                                icon: "🎨",
                                title: "Diseño Premium",
                                desc: "Estética moderna con sombras suaves, tipografía limpia y efectos visuales atractivos."
                            },
                            {
                                icon: "📱",
                                title: "Responsive",
                                desc: "Gestiona tu equipo desde el PC, tablet o móvil mientras juegas en tu consola."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-cta" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-cta)" />
                    </svg>
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">
                        ¿Listo para mejorar tu stream?
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Únete a otros creadores que ya están usando Pokémon Overlay para sus series.
                    </p>
                    <Link
                        to="/panel"
                        className="inline-block px-12 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                    >
                        Crear mi Overlay Gratis
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-950 text-gray-400 py-12 px-6 border-t border-gray-900">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">Pokémon Overlay</h3>
                        <p className="text-sm">Hecho con ❤️ para la comunidad.</p>
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <a href="https://crezty.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            crezty.com
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            GitHub
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Twitter
                        </a>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-900 text-center text-xs text-gray-600">
                    © {new Date().getFullYear()} Pokémon Overlay. Todos los derechos reservados.
                </div>
            </footer>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Preview Fullscreen"
                            className="w-full h-full object-contain rounded-lg shadow-2xl animate-zoom-in"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Landing
