import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export function EventDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div
      className="w-full min-h-screen bg-[#F4F4FB]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-12 md:pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm hover:bg-[#F4F4FB] transition-colors"
        >
          <ArrowLeft size={18} className="text-[#12122A]" />
        </button>
        <span className="text-sm font-semibold text-[#12122A]/50">
          Événement #{id}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center justify-center px-5 pt-16 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          <span className="text-white font-extrabold text-2xl">N</span>
        </div>
        <div className="text-center">
          <h2
            className="font-bold text-[#12122A] mb-2"
            style={{ fontSize: '20px', letterSpacing: '-0.3px' }}
          >
            Page en construction
          </h2>
          <p className="text-sm text-[#12122A]/50 max-w-[260px] mx-auto leading-relaxed">
            La page détail des événements sera disponible très bientôt.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
