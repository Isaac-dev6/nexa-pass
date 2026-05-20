import { useState } from 'react'
import {
  Pencil, Lock, Heart, CreditCard, List, Bell, Clock,
  Tag, RefreshCw, Shield, Smartphone, Trash2, Info,
  FileText, Mail, LogOut, ChevronRight, X, Check, Camera, LayoutDashboard,
  Moon, Sun, Eye, EyeOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { BottomNav } from '../components/ui/BottomNav'
import { useIsOrganizer } from '../hooks/useIsOrganizer'
import { useTickets } from '../hooks/useEvents'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
}

function fmtMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const PREF_CATEGORIES = ['Concerts', 'Sport', 'Culture', 'VIP', 'Cinéma', 'Showcases']

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${value ? 'bg-primary' : 'bg-[#D1D5DB]'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-[1.375rem]' : 'translate-x-1'}`}
      />
    </button>
  )
}

// ── Base Modal ────────────────────────────────────────────────────────────────

function Modal({
  title, onClose, children, danger = false,
}: { title: string; onClose: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
      >
        <div className={`flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F4F4FB] shrink-0 ${danger ? 'border-red-50' : ''}`}>
          <h3 className={`text-base font-extrabold ${danger ? 'text-red-500' : 'text-[#12122A]'}`}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4FB] flex items-center justify-center text-[#12122A]/50 hover:text-[#12122A] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function InputField({
  label, value, onChange, type = 'text', placeholder, rightEl,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; rightEl?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#12122A] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#F4F4FB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#12122A] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-[#12122A]/35 pr-10"
        />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  )
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────

function EditProfileModal({
  initial, userId, onClose, onSuccess,
}: {
  initial: { name: string; phone: string; city: string };
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone)
  const [city, setCity] = useState(initial.city)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { full_name: name, phone, city } })
      await supabase.from('profiles').upsert(
        { id: userId, full_name: name, phone, city },
        { onConflict: 'id' },
      )
      showToast('Profil mis à jour ✓')
      onSuccess()
    } catch (e) {
      showToast('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Modifier mes informations" onClose={onClose}>
      <div className="px-5 py-5 flex flex-col gap-4">
        <InputField label="Nom complet" value={name} onChange={setName} placeholder="Prénom et nom" />
        <InputField label="Téléphone" value={phone} onChange={setPhone} type="tel" placeholder="+242 06 000 0000" />
        <div>
          <label className="block text-sm font-bold text-[#12122A] mb-1.5">Ville</label>
          <div className="flex gap-2">
            {['Brazzaville', 'Pointe-Noire', 'Autre'].map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  city === c ? 'bg-primary text-white shadow-sm' : 'bg-[#F4F4FB] border border-[#E5E7EB] text-[#12122A]/70 hover:border-primary/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 pb-6 flex flex-col gap-2 shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          {saving ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Check size={16} /> Enregistrer</>}
        </button>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-sm font-semibold text-[#12122A]/50 hover:text-[#12122A] transition-colors">
          Annuler
        </button>
      </div>
    </Modal>
  )
}

// ── Password Modal ────────────────────────────────────────────────────────────

function PasswordModal({ userEmail, onClose, onSuccess }: { userEmail: string; onClose: () => void; onSuccess: () => void }) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleSave = async () => {
    setError(null)
    if (newPwd.length < 8) { setError('Le nouveau mot de passe doit contenir au moins 8 caractères'); return }
    if (newPwd !== confirmPwd) { setError('Les deux nouveaux mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      // Verify old password via re-authentication
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: oldPwd })
      if (signInErr) { setError('Ancien mot de passe incorrect'); return }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd })
      if (updateErr) { setError(updateErr.message); return }
      showToast('Mot de passe mis à jour ✓')
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (show: boolean, setShow: (v: boolean) => void) => (
    <button type="button" onClick={() => setShow(!show)} className="text-[#12122A]/40 hover:text-[#12122A]/70 transition-colors">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <Modal title="Changer mon mot de passe" onClose={onClose}>
      <div className="px-5 py-5 flex flex-col gap-4">
        <InputField label="Ancien mot de passe" value={oldPwd} onChange={setOldPwd} type={showOld ? 'text' : 'password'} placeholder="••••••••" rightEl={eyeBtn(showOld, setShowOld)} />
        <InputField label="Nouveau mot de passe" value={newPwd} onChange={setNewPwd} type={showNew ? 'text' : 'password'} placeholder="8 caractères minimum" rightEl={eyeBtn(showNew, setShowNew)} />
        <InputField label="Confirmer le nouveau mot de passe" value={confirmPwd} onChange={setConfirmPwd} type={showConfirm ? 'text' : 'password'} placeholder="••••••••" rightEl={eyeBtn(showConfirm, setShowConfirm)} />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {newPwd.length > 0 && (
          <div className="flex gap-1.5">
            {[4, 6, 8, 10].map((len) => (
              <div
                key={len}
                className={`flex-1 h-1.5 rounded-full transition-colors ${newPwd.length >= len ? (newPwd.length >= 10 ? 'bg-emerald-500' : newPwd.length >= 8 ? 'bg-primary' : 'bg-orange-400') : 'bg-[#E5E7EB]'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="px-5 pb-6 flex flex-col gap-2 shrink-0">
        <button
          onClick={handleSave}
          disabled={loading || !oldPwd || !newPwd || !confirmPwd}
          className="w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          {loading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Lock size={15} /> Mettre à jour</>}
        </button>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-sm font-semibold text-[#12122A]/50 hover:text-[#12122A] transition-colors">Annuler</button>
      </div>
    </Modal>
  )
}

// ── Preferences Modal ─────────────────────────────────────────────────────────

function PreferencesModal({ userId, initial, onClose, onSuccess }: {
  userId: string; initial: string[]; onClose: () => void; onSuccess: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const toggle = (cat: string) =>
    setSelected((p) => p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { preferences: selected } })
      await supabase.from('profiles').upsert({ id: userId, preferences: selected }, { onConflict: 'id' })
      showToast('Préférences enregistrées ✓')
      onSuccess()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Mes préférences" onClose={onClose}>
      <div className="px-5 py-5">
        <p className="text-sm text-[#12122A]/50 mb-5">Sélectionne tes catégories favorites pour des recommandations personnalisées.</p>
        <div className="flex flex-wrap gap-2.5">
          {PREF_CATEGORIES.map((cat) => {
            const active = selected.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  active ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm' : 'bg-[#F4F4FB] border border-[#E5E7EB] text-[#12122A]/70 hover:border-primary/30'
                }`}
              >
                {cat}
                {active && <Check size={12} className="inline ml-1.5" />}
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-5 pb-6 flex flex-col gap-2 shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          {saving ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Check size={16} /> Enregistrer</>}
        </button>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-sm font-semibold text-[#12122A]/50 hover:text-[#12122A] transition-colors">Annuler</button>
      </div>
    </Modal>
  )
}

// ── Delete Account Modal ──────────────────────────────────────────────────────

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    try {
      // Requires a Supabase Edge Function "delete-account" that calls auth.admin.deleteUser
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) {
        showToast('Erreur : ' + error.message)
        return
      }
      await supabase.auth.signOut()
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Supprimer mon compte" onClose={onClose} danger>
      <div className="px-5 py-5 flex flex-col gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-600 font-semibold mb-1">Action irréversible</p>
          <p className="text-xs text-red-500 leading-relaxed">
            Toutes tes données, billets et historique seront définitivement supprimés. Cette action ne peut pas être annulée.
          </p>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#12122A] mb-1.5">
            Tapez <span className="text-red-500 font-black">SUPPRIMER</span> pour confirmer
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SUPPRIMER"
            className="w-full bg-[#F4F4FB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#12122A] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder-[#12122A]/35 tracking-widest"
          />
        </div>
      </div>
      <div className="px-5 pb-6 flex flex-col gap-2 shrink-0">
        <button
          onClick={handleDelete}
          disabled={confirmText !== 'SUPPRIMER' || loading}
          className="w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40 bg-red-500"
        >
          {loading ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><Trash2 size={15} /> Supprimer définitivement</>}
        </button>
        <button onClick={onClose} className="w-full h-11 rounded-xl text-sm font-semibold text-[#12122A]/50 hover:text-[#12122A] transition-colors">Annuler</button>
      </div>
    </Modal>
  )
}

// ── Settings item ─────────────────────────────────────────────────────────────

interface SettingItemConfig {
  icon: LucideIcon
  label: string
  description?: string
  onClick?: () => void
  danger?: boolean
  badge?: string
  toggle?: { value: boolean; onToggle: () => void }
  noChevron?: boolean
}

function SettingItem({ icon: Icon, label, description, onClick, danger, badge, toggle, noChevron, isLast }: SettingItemConfig & { isLast?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        !toggle && onClick ? 'hover:bg-[#F9F9FC] active:bg-[#F4F4FB]' : ''
      } ${isLast ? '' : 'border-b border-[#F4F4FB]'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-50' : 'bg-[#F4F4FB]'}`}>
        <Icon size={16} className={danger ? 'text-red-500' : 'text-[#12122A]/55'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${danger ? 'text-red-500' : 'text-[#12122A]'}`}>{label}</p>
        {description && <p className="text-xs text-[#12122A]/45 mt-0.5">{description}</p>}
      </div>
      {badge && <span className="text-[10px] font-bold bg-[#E8E8F0] text-[#12122A]/60 px-2 py-0.5 rounded-full shrink-0">{badge}</span>}
      {toggle && <Toggle value={toggle.value} onChange={toggle.onToggle} />}
      {!toggle && !noChevron && !danger && <ChevronRight size={15} className="text-[#12122A]/25 shrink-0" />}
    </button>
  )
}

function SettingsSection({ title, items }: { title: string; items: SettingItemConfig[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[#12122A]/40 uppercase tracking-widest px-5 mb-2">{title}</p>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {items.map((item, idx) => (
          <SettingItem key={idx} {...item} isLast={idx === items.length - 1} />
        ))}
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { isDark, toggleTheme } = useTheme()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const { isOrganizer } = useIsOrganizer(user?.id)
  const { tickets } = useTickets(user?.id)
  const ticketCount = tickets.length
  const attendedCount = tickets.filter((t) => t.events?.date && new Date(t.events.date) < new Date()).length

  const fullName: string = user?.user_metadata?.full_name ?? 'Utilisateur'
  const initials = getInitials(fullName)
  const email: string = user?.email ?? ''
  const phone: string = user?.user_metadata?.phone ?? ''
  const city: string = user?.user_metadata?.city ?? ''
  const preferences: string[] = user?.user_metadata?.preferences ?? []
  const isVerified = !!user?.email_confirmed_at
  const memberSince = user?.created_at ? fmtMemberSince(user.created_at) : '—'

  // Notifications — persist in localStorage + profiles
  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('nexa_notifs')
      if (saved) return JSON.parse(saved) as Record<string, boolean>
    } catch { /* */ }
    return { newEvents: true, reminders: true, offers: false, resale: false }
  })

  const toggleNotif = async (key: string) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    localStorage.setItem('nexa_notifs', JSON.stringify(updated))
    if (user?.id) {
      await supabase.from('profiles').upsert(
        { id: user.id, notification_settings: updated },
        { onConflict: 'id' },
      )
    }
  }

  // Modal states
  const [showEdit, setShowEdit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Settings config
  const accountItems: SettingItemConfig[] = [
    { icon: Pencil, label: 'Modifier mes informations', description: 'Nom, téléphone, ville', onClick: () => setShowEdit(true) },
    { icon: Lock,   label: 'Changer mon mot de passe', onClick: () => setShowPassword(true) },
    { icon: Heart,  label: 'Mes préférences', description: preferences.length ? preferences.join(', ') : 'Catégories favorites', onClick: () => setShowPrefs(true) },
  ]

  const paymentItems: SettingItemConfig[] = [
    { icon: CreditCard, label: 'Mes moyens de paiement', description: 'MTN Mobile Money, Airtel Money', onClick: wip },
    { icon: List,       label: 'Historique des transactions', onClick: wip },
  ]

  const notifItems: SettingItemConfig[] = [
    { icon: Bell,      label: 'Nouveaux événements',     description: 'Alertes pour les événements proches', toggle: { value: !!notifs.newEvents,  onToggle: () => toggleNotif('newEvents')  } },
    { icon: Clock,     label: 'Rappels avant événement', description: '24h et 1h avant',                     toggle: { value: !!notifs.reminders,  onToggle: () => toggleNotif('reminders')  } },
    { icon: Tag,       label: 'Offres exclusives',       description: 'Promotions et early bird',             toggle: { value: !!notifs.offers,     onToggle: () => toggleNotif('offers')     } },
    { icon: RefreshCw, label: 'Nouvelles en revente',    description: 'Billets remis en vente',               toggle: { value: !!notifs.resale,     onToggle: () => toggleNotif('resale')     } },
  ]

  const securityItems: SettingItemConfig[] = [
    { icon: Shield,     label: 'Authentification deux facteurs', description: 'Sécurise ton compte avec un code SMS', onClick: wip },
    { icon: Smartphone, label: 'Sessions actives', onClick: wip },
    { icon: Trash2,     label: 'Supprimer mon compte', onClick: () => setShowDelete(true), danger: true, noChevron: true },
  ]

  const appearanceItems: SettingItemConfig[] = [
    {
      icon: isDark ? Moon : Sun,
      label: isDark ? 'Mode sombre' : 'Mode clair',
      description: 'Changer l\'apparence de l\'app',
      toggle: { value: isDark, onToggle: toggleTheme },
    },
  ]

  const aboutItems: SettingItemConfig[] = [
    { icon: Info,     label: "Version de l'app", description: '1.0.0', noChevron: true, onClick: () => {} },
    { icon: FileText, label: 'CGU / Politique de confidentialité', onClick: wip },
    { icon: Mail,     label: 'Nous contacter', onClick: wip },
  ]

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-28 md:pb-12"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-12 md:pt-8 pb-6">
        <h1 className="text-xl font-extrabold tracking-tight mb-6">Mon profil</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
            >
              {initials}
            </div>
            <button
              onClick={wip}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-[#F4F4FB] flex items-center justify-center shadow-sm hover:bg-[#F4F4FB] transition-colors"
            >
              <Camera size={14} className="text-[#12122A]/60" />
            </button>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight leading-tight">{fullName}</h2>
          <p className="text-sm text-[#12122A]/50 mt-0.5">{email}</p>
          {phone && <p className="text-sm text-[#12122A]/50">{phone}</p>}

          <div className="mt-3">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg width="8" height="6" fill="none" viewBox="0 0 8 6">
                    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Compte vérifié
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full">
                Email non vérifié
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 mb-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-4 py-5">
        <div className="flex items-center">
          <div className="flex-1 flex flex-col items-center">
            <p className="text-2xl font-extrabold text-[#12122A]">{attendedCount}</p>
            <p className="text-[11px] text-[#12122A]/45 text-center leading-tight mt-0.5 font-medium">Événements<br />assistés</p>
          </div>
          <div className="w-px h-12 bg-[#E5E7EB]" />
          <div className="flex-1 flex flex-col items-center">
            <p className="text-2xl font-extrabold text-[#12122A]">{ticketCount}</p>
            <p className="text-[11px] text-[#12122A]/45 text-center leading-tight mt-0.5 font-medium">Billets<br />achetés</p>
          </div>
          <div className="w-px h-12 bg-[#E5E7EB]" />
          <div className="flex-1 flex flex-col items-center">
            <p className="text-base font-extrabold text-[#12122A] leading-tight">{memberSince}</p>
            <p className="text-[11px] text-[#12122A]/45 text-center leading-tight mt-0.5 font-medium">Membre<br />depuis</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 flex flex-col gap-5">
        <SettingsSection title="Mon compte" items={accountItems} />
        <SettingsSection title="Paiements" items={paymentItems} />
        <SettingsSection title="Notifications" items={notifItems} />
        <SettingsSection title="Sécurité" items={securityItems} />
        <SettingsSection title="Apparence" items={appearanceItems} />
        <SettingsSection title="À propos" items={aboutItems} />

        {isOrganizer && (
          <button
            onClick={() => navigate('/organizer')}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 border font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg,rgba(37,99,235,0.06),rgba(147,51,234,0.06))',
              borderColor: 'rgba(37,99,235,0.2)',
              color: '#2563EB',
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard Pro
            <span className="ml-1 text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">PRO</span>
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 bg-red-50 border border-red-100 text-red-500 font-bold text-sm transition-all hover:bg-red-100 active:scale-[0.98]"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>

        <p className="text-center text-xs text-[#12122A]/25 pb-2">Nexa Pass · Brazzaville, Congo 🇨🇬</p>
      </div>

      {/* Modals */}
      {showEdit && (
        <EditProfileModal
          initial={{ name: fullName, phone, city }}
          userId={user!.id}
          onClose={() => setShowEdit(false)}
          onSuccess={() => setShowEdit(false)}
        />
      )}
      {showPassword && (
        <PasswordModal
          userEmail={email}
          onClose={() => setShowPassword(false)}
          onSuccess={() => setShowPassword(false)}
        />
      )}
      {showPrefs && (
        <PreferencesModal
          userId={user!.id}
          initial={preferences}
          onClose={() => setShowPrefs(false)}
          onSuccess={() => setShowPrefs(false)}
        />
      )}
      {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} />}

      <BottomNav />
    </div>
  )
}
