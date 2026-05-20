import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowRight, Calendar, MapPin, QrCode } from 'lucide-react'

interface PublicEvent {
  id: string
  title: string
  date: string | null
  location: string | null
  city: string | null
  cover_url: string | null
  category: string | null
}

// ── Animated stars background ──────────────────────────────────────────────────

function Stars() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`@keyframes twinkle { 0% { opacity:0.08; transform:scale(0.7) } 100% { opacity:0.7; transform:scale(1.3) } }`}</style>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: 'white',
            animation: `twinkle ${s.duration}s ${s.delay}s infinite alternate ease-in-out`,
          }}
        />
      ))}
    </div>
  )
}

// ── Animated counter ───────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const elRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const t0 = Date.now()
          const tick = () => {
            const p = Math.min((Date.now() - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setCount(Math.round(eased * target))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return { count, elRef }
}

function StatItem({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const { count, elRef } = useCounter(value)
  return (
    <div ref={elRef} className="text-center">
      <p className="text-4xl md:text-5xl font-black text-white">
        {count.toLocaleString('fr-FR')}{suffix}
      </p>
      <p className="text-sm text-white/45 mt-2 font-medium">{label}</p>
    </div>
  )
}

// ── Landing page ───────────────────────────────────────────────────────────────

export function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<PublicEvent[]>([])

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && user) navigate('/home', { replace: true })
  }, [user, loading, navigate])

  // Fetch public upcoming events (no auth required with anon key)
  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, date, location, city, cover_url, category')
      .eq('status', 'active')
      .eq('validated', true)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(3)
      .then(({ data }) => {
        if (data) setEvents(data as PublicEvent[])
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <div
          className="w-8 h-8 rounded-full border-[3px] animate-spin"
          style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <Stars />

        {/* Gradient blobs */}
        <div
          className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: '#2563EB', filter: 'blur(140px)', opacity: 0.18 }}
        />
        <div
          className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: '#9333EA', filter: 'blur(140px)', opacity: 0.18 }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Nexa Pass" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            <span className="font-black text-3xl tracking-tight">Nexa Pass</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Votre accès à tous<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              les événements
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/45 mb-10 max-w-md leading-relaxed">
            La billetterie numérique du Congo. Achetez, gérez et revendez vos billets en quelques secondes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #9333EA)',
                boxShadow: '0 0 50px rgba(37,99,235,0.45)',
              }}
            >
              Créer un compte
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-2xl font-bold text-lg border-2 transition-all hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97]"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)' }}
            >
              Se connecter
            </button>
          </div>
        </div>

        {/* Floating app mockup */}
        <div className="relative z-10 mt-16 w-full max-w-[300px]">
          <style>{`@keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-14px) } }`}</style>
          <div
            className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            style={{
              background: 'rgba(30,41,59,0.8)',
              backdropFilter: 'blur(20px)',
              animation: 'float 5s ease-in-out infinite',
            }}
          >
            {/* Mockup header */}
            <div className="px-5 pt-5 pb-3 border-b border-white/8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="h-2.5 w-20 rounded-full bg-white/25 mb-2" />
                  <div className="h-2 w-12 rounded-full bg-white/12" />
                </div>
                <div
                  className="px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}
                >
                  Valide ✓
                </div>
              </div>
            </div>
            {/* Mockup categories */}
            <div className="px-5 py-4 flex gap-2">
              {['VIP', 'Standard', 'Tribune'].map((cat, i) => (
                <div
                  key={cat}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-white/10"
                  style={{
                    background: i === 0 ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.05)',
                    color: i === 0 ? '#93c5fd' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
            {/* Mockup QR placeholder */}
            <div className="px-5 pb-5">
              <div
                className="w-full h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <QrCode size={36} className="text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] text-white/30 uppercase mb-4">Fonctionnalités</p>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-white/40 text-center mb-14 text-lg max-w-md mx-auto">
            Une plateforme complète pour les fans et les organisateurs
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🎟️',
                title: 'Billets numériques sécurisés',
                desc: "QR code unique par billet. Validation instantanée à l'entrée. Zéro fraude possible.",
                accent: '#2563EB',
              },
              {
                emoji: '🔁',
                title: 'Marketplace de revente',
                desc: "Revendez ou transférez vos billets en toute sécurité à d'autres acheteurs.",
                accent: '#9333EA',
              },
              {
                emoji: '📊',
                title: 'Dashboard organisateur',
                desc: 'Suivez vos ventes en temps réel, gérez les entrées et analysez vos performances.',
                accent: '#0ea5e9',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-7 border transition-all hover:scale-[1.02] hover:border-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="text-4xl mb-5">{f.emoji}</div>
                <h3 className="text-base font-black mb-3 leading-tight">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section className="py-20 px-6" style={{ background: 'rgba(255,255,255,0.025)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase mb-2">Découvrir</p>
              <h2 className="text-3xl font-black tracking-tight">Événements à venir</h2>
              <p className="text-white/40 mt-1">Les prochains événements au Congo</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-20 text-white/20">
              <QrCode size={48} className="mx-auto mb-4 opacity-25" />
              <p className="text-sm">Aucun événement à venir pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate('/register')}
                  className="rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] hover:border-white/20"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  {ev.cover_url ? (
                    <img src={ev.cover_url} alt={ev.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div
                      className="w-full h-40 flex items-center justify-center text-5xl"
                      style={{ background: 'linear-gradient(135deg,#1e3a8a,#4c1d95)' }}
                    >
                      🎵
                    </div>
                  )}
                  <div className="p-4">
                    {ev.category && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                        style={{ background: 'rgba(147,51,234,0.2)', color: '#c084fc' }}
                      >
                        {ev.category}
                      </span>
                    )}
                    <p className="font-bold text-sm truncate mt-1">{ev.title}</p>
                    {ev.date && (
                      <div className="flex items-center gap-1.5 mt-2 text-white/40 text-xs">
                        <Calendar size={11} />
                        {new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                    {(ev.city ?? ev.location) && (
                      <div className="flex items-center gap-1.5 mt-1 text-white/40 text-xs">
                        <MapPin size={11} />
                        {ev.city ?? ev.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border-2 transition-all hover:bg-white/10 hover:scale-[1.02]"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.65)' }}
            >
              Voir tous les événements
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-16 border"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(147,51,234,0.12))',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <p className="text-center text-xs font-bold tracking-[0.2em] text-white/30 uppercase mb-3">La plateforme</p>
            <h2 className="text-3xl font-black text-center mb-12 tracking-tight">Nexa Pass en chiffres</h2>
            <div className="grid grid-cols-3 gap-8">
              <StatItem value={120} label="Événements" suffix="+" />
              <StatItem value={5000} label="Billets vendus" suffix="+" />
              <StatItem value={30} label="Organisateurs" suffix="+" />
            </div>
          </div>
        </div>
      </section>

      {/* ── ORGANIZER CTA ── */}
      <section className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.025)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-8">🎪</div>
          <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">
            Vous organisez des événements ?
          </h2>
          <p className="text-white/45 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
            Créez votre événement en 2 minutes, gérez vos ventes en temps réel et validez les entrées avec votre scanner QR intégré.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #9333EA)',
              boxShadow: '0 0 50px rgba(37,99,235,0.35)',
            }}
          >
            Devenir organisateur
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Nexa Pass" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span className="font-black text-white/75 text-lg">Nexa Pass</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-white/35">
            <button className="hover:text-white/65 transition-colors">CGU</button>
            <button className="hover:text-white/65 transition-colors">Contact</button>
            <button className="hover:text-white/65 transition-colors">Instagram</button>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/25">© 2025 Nexa Pass — Brazzaville, Congo</p>
        </div>
      </footer>
    </div>
  )
}
