/**
 * Loading Component
 * 
 * Loading state for login page
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#001489] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Carregando...</p>
      </div>
    </div>
  )
}
