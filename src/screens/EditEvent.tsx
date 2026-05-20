import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import {
  ArrowLeft, Check, ImageIcon,
  Calendar, Clock, MapPin, X, Upload,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BottomNav } from '../components/ui/BottomNav'

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ['Infos', 'Lieu & Date', 'Récap']
const CATEGORIES = ['Concert', 'Sport', 'Culture', 'VIP', 'Cinéma', 'Showcase', 'Festival']
const CITIES = ['Brazzaville', 'Pointe-Noire', 'Autre']

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  category: string
  description: string
  imageUrl: string
  date: string
  startTime: string
  endTime: string
  venue: string
  city: string
  address: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-bold text-[#12122A] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1 font-medium">{msg}</p>
}

function TextInput({ value, onChange, placeholder, type = 'text', error = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-[#12122A] outline-none transition-all placeholder-[#12122A]/35 ${
        error
          ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
          : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
      }`}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function EditEvent() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState<FormState>({
    title: '', category: '', description: '', imageUrl: '',
    date: '', startTime: '', endTime: '', venue: '', city: '', address: '',
  })

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef(form)

  useEffect(() => { formRef.current = form }, [form])

  // Fetch existing event
  useEffect(() => {
    if (!id) return
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          showToast('Événement introuvable')
          navigate('/organizer')
          return
        }
        const d = data.date ? new Date(data.date) : null
        setForm({
          title: data.title ?? '',
          category: data.category ?? '',
          description: data.description ?? '',
          imageUrl: data.cover_url ?? '',
          date: d ? d.toISOString().split('T')[0] : '',
          startTime: d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '',
          endTime: '',
          venue: data.location ?? '',
          city: data.city ?? '',
          address: '',
        })
        setLoadingEvent(false)
      })
  }, [id, navigate, showToast])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (step === 0) {
      if (!form.title.trim())  errs.title    = 'Le titre est requis'
      if (!form.category)      errs.category = 'Sélectionne une catégorie'
    }
    if (step === 1) {
      if (!form.date)          errs.date      = 'La date est requise'
      if (!form.startTime)     errs.startTime = "L'heure de début est requise"
      if (!form.venue.trim())  errs.venue     = 'Le nom du lieu est requis'
      if (!form.city)          errs.city      = 'La ville est requise'
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0) showToast('Remplis les champs obligatoires')
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (!validate()) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Image upload ──────────────────────────────────────────────────────────────

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Format non supporté. Utilise JPG, PNG ou WEBP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image trop lourde. Max 5 MB.')
      return
    }
    const blobUrl = URL.createObjectURL(file)
    setImagePreviewUrl(blobUrl)
    setField('imageUrl', '')
    setIsUploading(true)
    setUploadProgress(0)
    let timer: ReturnType<typeof setInterval>
    timer = setInterval(() => {
      setUploadProgress((p) => { if (p >= 85) { clearInterval(timer); return 85 } return Math.min(p + Math.random() * 14, 85) })
    }, 180)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user?.id ?? 'anon'}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('event-covers').upload(path, file, { contentType: file.type, upsert: false })
      clearInterval(timer)
      if (error) { showToast(`Erreur upload: ${error.message}`); setImagePreviewUrl(null); return }
      const { data: { publicUrl } } = supabase.storage.from('event-covers').getPublicUrl(data.path)
      setUploadProgress(100)
      setField('imageUrl', publicUrl)
    } catch {
      clearInterval(timer)
      showToast("Erreur inattendue lors de l'upload")
      setImagePreviewUrl(null)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      const dateIso = form.date
        ? new Date(`${form.date}T${form.startTime || '00:00'}`).toISOString()
        : null

      const { error } = await supabase
        .from('events')
        .update({
          title: form.title,
          description: form.description || null,
          category: form.category,
          date: dateIso,
          location: form.venue,
          city: form.city,
          cover_url: form.imageUrl || null,
        })
        .eq('id', id!)
        .eq('organizer_id', user?.id!)

      if (error) {
        showToast(`Erreur: ${error.message}`)
        return
      }

      showToast('Événement mis à jour ✓')
      navigate('/organizer')
    } finally {
      setIsSaving(false)
    }
  }, [form, id, user, navigate, showToast])

  const coverSrc = imagePreviewUrl ?? (form.imageUrl || null)

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-[#F4F4FB] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-28 md:pb-12"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-12 md:pt-8 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm hover:bg-[#F4F4FB] transition-colors shrink-0 mt-0.5"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight leading-none">Modifier l'événement</h1>
          <p className="text-xs text-[#12122A]/50 mt-0.5">Étape {step + 1} sur {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-5 mb-6 mt-3">
        {STEPS.map((label, i) => (
          <Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${
                  i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white ring-4 ring-primary/15' : 'bg-[#E8E8F0] text-[#12122A]/30'
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <p className={`text-[10px] font-bold mt-1 whitespace-nowrap transition-colors ${i === step ? 'text-primary' : 'text-[#12122A]/30'}`}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-[#E8E8F0]'}`} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="px-5">

        {/* Step 0 — Infos */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel required>Titre de l'événement</FieldLabel>
              <TextInput value={form.title} onChange={(v) => setField('title', v)} placeholder="Titre de l'événement" error={errors.title} />
              <FieldError msg={errors.title} />
            </div>

            <div>
              <FieldLabel required>Catégorie</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setField('category', cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      form.category === cat
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                        : 'bg-white border border-[#E5E7EB] text-[#12122A]/70 hover:border-primary/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.category} />
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value.slice(0, 500))}
                  placeholder="Décris l'ambiance, les artistes, le programme…"
                  rows={4}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#12122A] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-[#12122A]/35 resize-none"
                />
                <span className="absolute bottom-2.5 right-3 text-xs text-[#12122A]/25 font-medium pointer-events-none">
                  {form.description.length}/500
                </span>
              </div>
            </div>

            <div>
              <FieldLabel>Image de couverture</FieldLabel>
              <div
                className={`w-full h-[170px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all bg-white mb-3 ${
                  isUploading ? 'border-primary/40' : 'border-[#E5E7EB] hover:border-primary/40'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {coverSrc ? (
                  <div className="relative w-full h-full">
                    <img src={coverSrc} alt="Couverture" className="w-full h-full object-cover" />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 px-6">
                        <p className="text-white text-xs font-bold">Upload en cours…</p>
                        <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {!isUploading && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setField('imageUrl', ''); setImagePreviewUrl(null) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#12122A]/25 pointer-events-none">
                    <Upload size={28} />
                    <p className="text-sm font-semibold">Cliquer pour changer l'image</p>
                    <p className="text-xs">JPG, PNG, WEBP · Max 5 MB</p>
                  </div>
                )}
              </div>
              {!coverSrc && (
                <TextInput value={form.imageUrl} onChange={(v) => setField('imageUrl', v)} placeholder="Ou coller une URL d'image…" type="url" />
              )}
            </div>
          </div>
        )}

        {/* Step 1 — Lieu & Date */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>Date</FieldLabel>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#12122A]/35 pointer-events-none" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                    className={`w-full bg-white border rounded-xl pl-9 pr-3 py-3 text-sm text-[#12122A] outline-none transition-all ${
                      errors.date ? 'border-red-400' : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                  />
                </div>
                <FieldError msg={errors.date} />
              </div>
              <div>
                <FieldLabel required>Heure début</FieldLabel>
                <div className="relative">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#12122A]/35 pointer-events-none" />
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setField('startTime', e.target.value)}
                    className={`w-full bg-white border rounded-xl pl-9 pr-3 py-3 text-sm text-[#12122A] outline-none transition-all ${
                      errors.startTime ? 'border-red-400' : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
                  />
                </div>
                <FieldError msg={errors.startTime} />
              </div>
            </div>

            <div>
              <FieldLabel>Heure de fin <span className="text-xs text-[#12122A]/40 font-normal">(optionnel)</span></FieldLabel>
              <div className="relative">
                <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#12122A]/35 pointer-events-none" />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setField('endTime', e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-3 text-sm text-[#12122A] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div>
              <FieldLabel required>Nom du lieu</FieldLabel>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#12122A]/35 pointer-events-none" />
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setField('venue', e.target.value)}
                  placeholder="Ex : Palais des Congrès, Stade Éboué…"
                  className={`w-full bg-white border rounded-xl pl-9 pr-4 py-3 text-sm text-[#12122A] outline-none transition-all placeholder-[#12122A]/35 ${
                    errors.venue ? 'border-red-400' : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
                  }`}
                />
              </div>
              <FieldError msg={errors.venue} />
            </div>

            <div>
              <FieldLabel required>Ville</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => setField('city', city)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      form.city === city ? 'bg-primary text-white shadow-sm' : 'bg-white border border-[#E5E7EB] text-[#12122A]/70 hover:border-primary/30'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.city} />
            </div>

            <div>
              <FieldLabel>Adresse <span className="text-xs text-[#12122A]/40 font-normal">(optionnel)</span></FieldLabel>
              <TextInput value={form.address} onChange={(v) => setField('address', v)} placeholder="Ex : Avenue des 3 Martyrs, Brazzaville" />
            </div>
          </div>
        )}

        {/* Step 2 — Récap */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-[#12122A]/50">Vérifie les informations avant d'enregistrer.</p>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="relative h-[160px]">
                {coverSrc ? (
                  <img src={coverSrc} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}>
                    <ImageIcon size={40} className="text-white/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {form.category && (
                  <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {form.category}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-extrabold text-lg leading-tight mb-1">
                  {form.title || <span className="text-[#12122A]/30">Titre de l'événement</span>}
                </h3>
                {form.description && (
                  <p className="text-sm text-[#12122A]/50 mb-3 line-clamp-2 leading-relaxed">{form.description}</p>
                )}
                <div className="flex flex-col gap-1.5 text-xs text-[#12122A]/60">
                  {form.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>
                        {new Date(form.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {form.startTime && ` · ${form.startTime}`}
                      </span>
                    </div>
                  )}
                  {form.venue && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      <span>{form.venue}{form.city ? `, ${form.city}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}
              >
                {isSaving
                  ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <Check size={18} />
                }
                {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 2 && (
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={prevStep} className="flex-1 h-12 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/60 hover:text-[#12122A] hover:border-[#12122A]/20 transition-all">
                Précédent
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex-1 h-12 rounded-2xl text-white font-bold text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}
            >
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <button onClick={prevStep} className="w-full mt-3 h-11 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/50 hover:text-[#12122A] hover:border-[#12122A]/20 transition-all">
            ← Modifier
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
