import { Link } from 'react-router-dom'

function Error404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <p className="text-2xl font-medium mt-4 mb-8">Página no encontrada</p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}

export default Error404