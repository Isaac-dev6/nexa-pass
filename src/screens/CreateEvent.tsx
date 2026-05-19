/*
 * SQL SETUP — run once in Supabase SQL Editor
 *
 * create table if not exists public.events (
 *   id           uuid default gen_random_uuid() primary key,
 *   title        text not null,
 *   description  text,
 *   category     text,
 *   date         timestamptz,
 *   location     text,
 *   city         text,
 *   cover_url    text,
 *   organizer_id uuid references auth.users(id),
 *   status       text default 'active',
 *   created_at   timestamptz default now()
 * );
 *
 * -- Storage: in Supabase dashboard create bucket "event-covers" (Public = true)
 * -- INSERT policy (authenticated users):
 * --   ((bucket_id = 'event-covers') AND (auth.role() = 'authenticated'))
 * -- SELECT policy (public read):
 * --   (bucket_id = 'event-covers')
 */

import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import {
  ArrowLeft, Check, Plus, Trash2, ImageIcon,
  Calendar, Clock, MapPin, Ticket, X, Upload, Save,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BottomNav } from '../components/ui/BottomNav'

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ['Infos', 'Lieu & Date', 'Billets', 'Récap']

const CATEGORIES = ['Concert', 'Sport', 'Culture', 'VIP', 'Cinéma', 'Showcase', 'Festival']

const CITIES = ['Brazzaville', 'Pointe-Noire', 'Autre']

const DRAFT_KEY = 'nexa_create_event_draft'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TicketType {
  id: string
  name: string
  description: string
  price: string
  quantity: string
}

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
  tickets: TicketType[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function newTicket(): TicketType {
  return { id: Math.random().toString(36).slice(2), name: '', description: '', price: '', quantity: '' }
}

const DEFAULT_FORM: FormState = {
  title: '', category: '', description: '', imageUrl: '',
  date: '', startTime: '', endTime: '', venue: '', city: '', address: '',
  tickets: [newTicket()],
}

function loadDraft(): FormState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return DEFAULT_FORM
    const parsed = JSON.parse(raw) as Partial<FormState>
    return {
      ...DEFAULT_FORM,
      ...parsed,
      tickets: parsed.tickets?.length ? parsed.tickets : [newTicket()],
    }
  } catch {
    return DEFAULT_FORM
  }
}

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

function TextInput({
  value, onChange, placeholder, type = 'text', error, className = '',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; error?: string; className?: string
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
      } ${className}`}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CreateEvent() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>(loadDraft)

  // Image upload
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Publishing
  const [isPublishing, setIsPublishing] = useState(false)

  // Draft persistence
  const [hasDraft, setHasDraft] = useState(() => !!localStorage.getItem(DRAFT_KEY))
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const formRef = useRef(form)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Keep formRef in sync so saveDraft can read latest state without deps
  useEffect(() => { formRef.current = form }, [form])

  const saveDraft = useCallback(() => {
    const current = formRef.current
    const urlToSave = current.imageUrl.startsWith('blob:') ? '' : current.imageUrl
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, imageUrl: urlToSave }))
    setHasDraft(true)
    setLastSaved(new Date())
  }, [])

  // 1s debounce save on any form change
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(saveDraft, 1000)
    return () => clearTimeout(debounceRef.current)
  }, [form, saveDraft])

  // 30s interval auto-save
  useEffect(() => {
    const interval = setInterval(saveDraft, 30_000)
    return () => clearInterval(interval)
  }, [saveDraft])

  // Revoke blob URL when it changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  // ── Form helpers ──

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }

  function updateTicket(id: string, key: keyof TicketType, value: string) {
    setForm((p) => ({
      ...p,
      tickets: p.tickets.map((t) => (t.id === id ? { ...t, [key]: value } : t)),
    }))
    setErrors((p) => {
      const next = { ...p }
      const idx = form.tickets.findIndex((t) => t.id === id)
      delete next[`t${idx}_${key}`]
      return next
    })
  }

  function addTicket() {
    setForm((p) => ({ ...p, tickets: [...p.tickets, newTicket()] }))
  }

  function removeTicket(id: string) {
    if (form.tickets.length <= 1) return
    setForm((p) => ({ ...p, tickets: p.tickets.filter((t) => t.id !== id) }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (step === 0) {
      if (!form.title.trim())  errs.title    = 'Le titre est requis'
      if (!form.category)      errs.category = 'Sélectionne une catégorie'
    }

    if (step === 1) {
      if (!form.date)           errs.date      = 'La date est requise'
      if (!form.startTime)      errs.startTime = "L'heure de début est requise"
      if (!form.venue.trim())   errs.venue     = 'Le nom du lieu est requis'
      if (!form.city)           errs.city      = 'La ville est requise'
    }

    if (step === 2) {
      form.tickets.forEach((t, i) => {
        if (!t.name.trim())                     errs[`t${i}_name`]  = 'Nom requis'
        if (!t.price || isNaN(Number(t.price))) errs[`t${i}_price`] = 'Prix requis'
        if (!t.quantity || isNaN(Number(t.quantity))) errs[`t${i}_qty`] = 'Quantité requise'
      })
    }

    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      showToast('Remplis les champs obligatoires')
    }
    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (!validate()) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── File upload ──

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showToast('Format non supporté. Utilise JPG, PNG ou WEBP.')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image trop lourde. Max 5 MB.')
      e.target.value = ''
      return
    }

    // Immediate blob preview
    const blobUrl = URL.createObjectURL(file)
    setImagePreviewUrl(blobUrl)
    setField('imageUrl', '')

    // Fake progress 0 → 85%
    setIsUploading(true)
    setUploadProgress(0)
    let timer: ReturnType<typeof setInterval>
    timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) { clearInterval(timer); return 85 }
        return Math.min(prev + Math.random() * 14, 85)
      })
    }, 180)

    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user?.id ?? 'anon'}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('event-covers')
        .upload(path, file, { contentType: file.type, upsert: false })

      clearInterval(timer)

      if (error) {
        const msg = error.message.toLowerCase().includes('bucket')
          ? 'Bucket "event-covers" introuvable — crée-le dans Supabase Storage'
          : `Erreur upload: ${error.message}`
        showToast(msg)
        setImagePreviewUrl(null)
        setUploadProgress(0)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('event-covers').getPublicUrl(data.path)
      setUploadProgress(100)
      setField('imageUrl', publicUrl)
    } catch {
      clearInterval(timer)
      showToast("Erreur inattendue lors de l'upload")
      setImagePreviewUrl(null)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  // ── Publish & draft ──

  async function handlePublish() {
    if (!validate()) return
    setIsPublishing(true)
    try {
      const dateIso = form.date
        ? new Date(`${form.date}T${form.startTime || '00:00'}`).toISOString()
        : null

      const { error } = await supabase.from('events').insert({
        title: form.title,
        description: form.description || null,
        category: form.category,
        date: dateIso,
        location: form.venue,
        city: form.city,
        cover_url: form.imageUrl || null,
        organizer_id: user?.id,
        status: 'active',
      })

      if (error) {
        showToast(`Erreur: ${error.message}`)
        return
      }

      // Unlock organizer role on first publish
      await supabase.from('profiles').upsert({ id: user!.id, role: 'organizer' }, { onConflict: 'id' })
      await supabase.auth.updateUser({ data: { role: 'organizer' } })

      localStorage.removeItem(DRAFT_KEY)
      showToast('Événement publié avec succès ! 🎉')
      navigate('/organizer')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleDraft() {
    setIsPublishing(true)
    try {
      const { error } = await supabase.from('events').insert({
        title: form.title || 'Sans titre',
        description: form.description || null,
        category: form.category || null,
        date: form.date ? new Date(form.date).toISOString() : null,
        location: form.venue || null,
        city: form.city || null,
        cover_url: form.imageUrl || null,
        organizer_id: user?.id,
        status: 'draft',
      })

      if (error) {
        showToast(`Erreur: ${error.message}`)
        return
      }

      localStorage.removeItem(DRAFT_KEY)
      showToast('📝 Brouillon enregistré')
      navigate('/organizer')
    } finally {
      setIsPublishing(false)
    }
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setLastSaved(null)
    setForm({ ...DEFAULT_FORM, tickets: [newTicket()] })
    setImagePreviewUrl(null)
    showToast('Brouillon effacé')
  }

  // ── Recap helpers ──
  const totalCapacity = form.tickets.reduce((s, t) => s + (parseInt(t.quantity) || 0), 0)
  const minPrice = form.tickets.reduce((min, t) => {
    const p = parseInt(t.price)
    return (!isNaN(p) && p < min) ? p : min
  }, Infinity)

  const coverSrc = imagePreviewUrl ?? (form.imageUrl || null)

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-28 md:pb-12"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ── Header ── */}
      <div className="flex items-start gap-3 px-5 pt-12 md:pt-8 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm hover:bg-[#F4F4FB] transition-colors shrink-0 mt-0.5"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight leading-none">Créer un événement</h1>
          <p className="text-xs text-[#12122A]/50 mt-0.5">Étape {step + 1} sur {STEPS.length}</p>
          {/* Auto-save indicator */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {lastSaved && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <Save size={9} />
                Brouillon sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {hasDraft && (
              <button
                onClick={clearDraft}
                className="text-[10px] text-red-400 hover:text-red-600 font-semibold underline transition-colors"
              >
                Effacer le brouillon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center px-5 mb-6 mt-3">
        {STEPS.map((label, i) => (
          <Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                    ? 'bg-primary text-white ring-4 ring-primary/15'
                    : 'bg-[#E8E8F0] text-[#12122A]/30'
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <p className={`text-[10px] font-bold mt-1 whitespace-nowrap transition-colors ${
                i === step ? 'text-primary' : 'text-[#12122A]/30'
              }`}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-all duration-300 ${
                i < step ? 'bg-primary' : 'bg-[#E8E8F0]'
              }`} />
            )}
          </Fragment>
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="px-5">

        {/* ────── Step 0 — Infos générales ────── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel required>Titre de l'événement</FieldLabel>
              <TextInput
                value={form.title}
                onChange={(v) => setField('title', v)}
                placeholder="Ex : Nuit Jazz du Congo, Derby de Brazzaville…"
                error={errors.title}
              />
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
              {/* Upload zone */}
              <div
                className={`w-full h-[170px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all bg-white mb-3 ${
                  isUploading ? 'border-primary/40' : 'border-[#E5E7EB] hover:border-primary/40'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {coverSrc ? (
                  <div className="relative w-full h-full">
                    <img src={coverSrc} alt="Couverture" className="w-full h-full object-cover" />
                    {/* Upload progress overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 px-6">
                        <p className="text-white text-xs font-bold">Upload en cours…</p>
                        <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-white/70 text-[10px]">{Math.round(uploadProgress)}%</p>
                      </div>
                    )}
                    {!isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setField('imageUrl', '')
                          setImagePreviewUrl(null)
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#12122A]/25 pointer-events-none">
                    <Upload size={28} />
                    <p className="text-sm font-semibold">Cliquer pour ajouter une image</p>
                    <p className="text-xs">JPG, PNG, WEBP · Max 5 MB</p>
                  </div>
                )}
              </div>
              {/* Progress bar below zone (when no preview yet) */}
              {isUploading && !coverSrc && (
                <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg,#2563EB,#9333EA)',
                    }}
                  />
                </div>
              )}
              {/* URL fallback */}
              {!coverSrc && (
                <TextInput
                  value={form.imageUrl}
                  onChange={(v) => setField('imageUrl', v)}
                  placeholder="Ou coller une URL d'image…"
                  type="url"
                />
              )}
            </div>
          </div>
        )}

        {/* ────── Step 1 — Lieu & Date ────── */}
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
                      errors.date
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
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
                      errors.startTime
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
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
                    errors.venue
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-[#E5E7EB] focus:border-primary focus:ring-2 focus:ring-primary/10'
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
                      form.city === city
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-[#E5E7EB] text-[#12122A]/70 hover:border-primary/30'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.city} />
            </div>

            <div>
              <FieldLabel>Adresse complète <span className="text-xs text-[#12122A]/40 font-normal">(optionnel)</span></FieldLabel>
              <TextInput
                value={form.address}
                onChange={(v) => setField('address', v)}
                placeholder="Ex : Avenue des 3 Martyrs, Brazzaville"
              />
            </div>
          </div>
        )}

        {/* ────── Step 2 — Billets ────── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#12122A]/50">
              Définis les types de billets disponibles pour ton événement.
            </p>

            {form.tickets.map((ticket, idx) => (
              <div key={ticket.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}
                    >
                      <Ticket size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-extrabold">Type {idx + 1}</span>
                  </div>
                  {form.tickets.length > 1 && (
                    <button
                      onClick={() => removeTicket(ticket.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <FieldLabel required>Nom du billet</FieldLabel>
                    <TextInput
                      value={ticket.name}
                      onChange={(v) => updateTicket(ticket.id, 'name', v)}
                      placeholder="Ex : VIP, Standard, Early Bird…"
                      error={errors[`t${idx}_name`]}
                    />
                    <FieldError msg={errors[`t${idx}_name`]} />
                  </div>

                  <div>
                    <FieldLabel>Description <span className="text-xs text-[#12122A]/40 font-normal">(optionnel)</span></FieldLabel>
                    <TextInput
                      value={ticket.description}
                      onChange={(v) => updateTicket(ticket.id, 'description', v)}
                      placeholder="Ex : Accès tribune + cocktail d'accueil"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel required>Prix (FCFA)</FieldLabel>
                      <TextInput
                        value={ticket.price}
                        onChange={(v) => updateTicket(ticket.id, 'price', v.replace(/\D/g, ''))}
                        placeholder="5 000"
                        type="text"
                        error={errors[`t${idx}_price`]}
                      />
                      <FieldError msg={errors[`t${idx}_price`]} />
                    </div>
                    <div>
                      <FieldLabel required>Quantité</FieldLabel>
                      <TextInput
                        value={ticket.quantity}
                        onChange={(v) => updateTicket(ticket.id, 'quantity', v.replace(/\D/g, ''))}
                        placeholder="100"
                        type="text"
                        error={errors[`t${idx}_qty`]}
                      />
                      <FieldError msg={errors[`t${idx}_qty`]} />
                    </div>
                  </div>

                  {ticket.price && !isNaN(Number(ticket.price)) && ticket.quantity && !isNaN(Number(ticket.quantity)) && (
                    <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg">
                      Potentiel : {(parseInt(ticket.price) * parseInt(ticket.quantity)).toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addTicket}
              className="w-full h-12 rounded-xl border-2 border-dashed border-[#E5E7EB] flex items-center justify-center gap-2 text-sm font-bold text-[#12122A]/50 hover:border-primary/40 hover:text-primary transition-all"
            >
              <Plus size={16} />
              Ajouter un type de billet
            </button>
          </div>
        )}

        {/* ────── Step 3 — Récap ────── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-[#12122A]/50">
              Vérifie les informations avant de publier ton événement.
            </p>

            {/* Event preview card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="relative h-[160px]">
                {coverSrc ? (
                  <img src={coverSrc} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}
                  >
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
                        {form.endTime && ` → ${form.endTime}`}
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

            {/* Tickets summary */}
            {form.tickets.some((t) => t.name) && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4">
                <h4 className="text-sm font-extrabold mb-3 flex items-center gap-2">
                  <Ticket size={15} className="text-primary" />
                  Billets ({totalCapacity.toLocaleString('fr-FR')} places)
                </h4>
                <div className="flex flex-col gap-2">
                  {form.tickets.filter((t) => t.name).map((t) => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-[#F4F4FB] last:border-0">
                      <div>
                        <p className="text-sm font-bold">{t.name}</p>
                        {t.description && <p className="text-xs text-[#12122A]/45">{t.description}</p>}
                        {t.quantity && <p className="text-xs text-[#12122A]/40">{parseInt(t.quantity).toLocaleString('fr-FR')} places</p>}
                      </div>
                      <p className="text-sm font-extrabold text-primary">
                        {t.price ? `${parseInt(t.price).toLocaleString('fr-FR')} F` : '—'}
                      </p>
                    </div>
                  ))}
                </div>
                {minPrice !== Infinity && (
                  <p className="text-xs text-[#12122A]/40 mt-3 font-medium">
                    À partir de {minPrice.toLocaleString('fr-FR')} FCFA
                  </p>
                )}
              </div>
            )}

            {/* Publish actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full h-14 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}
              >
                {isPublishing ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                {isPublishing ? 'Publication…' : "Publier l'événement"}
              </button>
              <button
                onClick={handleDraft}
                disabled={isPublishing}
                className="w-full h-12 rounded-2xl border-2 border-[#E5E7EB] text-sm font-bold text-[#12122A]/60 hover:text-[#12122A] hover:border-[#12122A]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enregistrer en brouillon
              </button>
            </div>
          </div>
        )}

        {/* ── Step navigation ── */}
        {step < 3 && (
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 h-12 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/60 hover:text-[#12122A] hover:border-[#12122A]/20 transition-all"
              >
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

        {step === 3 && step > 0 && (
          <button
            onClick={prevStep}
            className="w-full mt-3 h-11 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/50 hover:text-[#12122A] hover:border-[#12122A]/20 transition-all"
          >
            ← Modifier
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
