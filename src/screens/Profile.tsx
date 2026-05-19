import { useState } from 'react'
import {
  User, Pencil, Lock, Heart, CreditCard, List, Bell, Clock,
  Tag, RefreshCw, Shield, Smartphone, Trash2, Info,
  FileText, Mail, LogOut, ChevronRight, X, Check, Camera,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import { BottomNav } from '../components/ui/BottomNav'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
}

function fmtMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        value ? 'bg-primary' : 'bg-[#D1D5DB]'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? 'translate-x-[1.375rem]' : 'translate-x-1'
        }`}
      />
    </button>
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

function SettingItem({
  icon: Icon, label, description, onClick, danger, badge, toggle, noChevron, isLast,
}: SettingItemConfig & { isLast?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        !toggle && onClick ? 'hover:bg-[#F9F9FC] active:bg-[#F4F4FB]' : ''
      } ${isLast ? '' : 'border-b border-[#F4F4FB]'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        danger ? 'bg-red-50' : 'bg-[#F4F4FB]'
      }`}>
        <Icon size={16} className={danger ? 'text-red-500' : 'text-[#12122A]/55'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${danger ? 'text-red-500' : 'text-[#12122A]'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#12122A]/45 mt-0.5">{description}</p>
        )}
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-[#E8E8F0] text-[#12122A]/60 px-2 py-0.5 rounded-full shrink-0">
          {badge}
        </span>
      )}
      {toggle && <Toggle value={toggle.value} onChange={toggle.onToggle} />}
      {!toggle && !noChevron && !danger && (
        <ChevronRight size={15} className="text-[#12122A]/25 shrink-0" />
      )}
    </button>
  )
}

function SettingsSection({ title, items }: { title: string; items: SettingItemConfig[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[#12122A]/40 uppercase tracking-widest px-5 mb-2">
        {title}
      </p>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {items.map((item, idx) => (
          <SettingItem key={idx} {...item} isLast={idx === items.length - 1} />
        ))}
      </div>
    </div>
  )
}

// ── Edit profile sheet ────────────────────────────────────────────────────────

interface EditSheetProps {
  name: string
  phone: string
  city: string
  onName: (v: string) => void
  onPhone: (v: string) => void
  onCity: (v: string) => void
  onSave: () => void
  onClose: () => void
  saving: boolean
}

function EditSheet({ name, phone, city, onName, onPhone, onCity, onSave, onClose, saving }: EditSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F4F4FB]">
          <h3 className="text-base font-extrabold">Modifier mes informations</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4FB] flex items-center justify-center text-[#12122A]/50 hover:text-[#12122A] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-[#12122A] mb-1.5">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onName(e.target.value)}
              placeholder="Prénom et nom"
              className="w-full bg-[#F4F4FB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#12122A] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-[#12122A]/35"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#12122A] mb-1.5">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
              placeholder="+242 06 000 0000"
              className="w-full bg-[#F4F4FB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#12122A] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-[#12122A]/35"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#12122A] mb-1.5">Ville</label>
            <div className="flex gap-2">
              {['Brazzaville', 'Pointe-Noire', 'Autre'].map((c) => (
                <button
                  key={c}
                  onClick={() => onCity(c)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    city === c
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-[#F4F4FB] border border-[#E5E7EB] text-[#12122A]/70 hover:border-primary/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <><Check size={16} /> Enregistrer</>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl text-sm font-semibold text-[#12122A]/50 hover:text-[#12122A] transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  // Profile data
  const fullName: string = user?.user_metadata?.full_name ?? 'Utilisateur'
  const initials = getInitials(fullName)
  const email: string = user?.email ?? ''
  const phone: string = user?.user_metadata?.phone ?? ''
  const city: string = user?.user_metadata?.city ?? ''
  const isVerified = !!user?.email_confirmed_at
  const memberSince = user?.created_at ? fmtMemberSince(user.created_at) : '—'

  // Notification toggles
  const [notifs, setNotifs] = useState({
    newEvents: true,
    reminders: true,
    offers: false,
    resale: false,
  })
  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((p) => ({ ...p, [key]: !p[key] }))

  // Edit sheet
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCity, setEditCity] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const openEdit = () => {
    setEditName(fullName)
    setEditPhone(phone)
    setEditCity(city)
    setShowEdit(true)
  }

  async function handleSaveProfile() {
    setIsSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: editName, phone: editPhone, city: editCity },
    })
    setIsSaving(false)
    if (error) {
      showToast(`Erreur: ${error.message}`)
    } else {
      showToast('Profil mis à jour ✓')
      setShowEdit(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Settings sections config
  const accountItems: SettingItemConfig[] = [
    { icon: Pencil, label: 'Modifier mes informations', description: 'Nom, téléphone, ville', onClick: openEdit },
    { icon: Lock,   label: 'Changer mon mot de passe', onClick: wip },
    { icon: Heart,  label: 'Mes préférences', description: 'Catégories favorites', onClick: wip },
  ]

  const paymentItems: SettingItemConfig[] = [
    { icon: CreditCard, label: 'Mes moyens de paiement', description: 'MTN Mobile Money, Airtel Money', onClick: wip },
    { icon: List,       label: 'Historique des transactions', onClick: wip },
  ]

  const notifItems: SettingItemConfig[] = [
    { icon: Bell,      label: 'Nouveaux événements',     description: 'Alertes pour les événements proches', toggle: { value: notifs.newEvents,  onToggle: () => toggleNotif('newEvents')  } },
    { icon: Clock,     label: 'Rappels avant événement', description: '24h et 1h avant',                     toggle: { value: notifs.reminders,  onToggle: () => toggleNotif('reminders')  } },
    { icon: Tag,       label: 'Offres exclusives',       description: 'Promotions et early bird',             toggle: { value: notifs.offers,     onToggle: () => toggleNotif('offers')     } },
    { icon: RefreshCw, label: 'Nouvelles en revente',    description: 'Billets remis en vente',               toggle: { value: notifs.resale,     onToggle: () => toggleNotif('resale')     } },
  ]

  const securityItems: SettingItemConfig[] = [
    { icon: Shield,     label: 'Authentification deux facteurs', description: 'Sécurise ton compte avec un code SMS', onClick: wip },
    { icon: Smartphone, label: 'Sessions actives', onClick: wip },
    { icon: Trash2,     label: 'Supprimer mon compte', onClick: wip, danger: true, noChevron: true },
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
      {/* ── Header ── */}
      <div className="px-5 pt-12 md:pt-8 pb-6">
        <h1 className="text-xl font-extrabold tracking-tight mb-6">Mon profil</h1>

        {/* Avatar + infos */}
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

      {/* ── Stats ── */}
      <div className="mx-5 mb-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-4 py-5">
        <div className="flex items-center">
          <div className="flex-1 flex flex-col items-center">
            <p className="text-2xl font-extrabold text-[#12122A]">0</p>
            <p className="text-[11px] text-[#12122A]/45 text-center leading-tight mt-0.5 font-medium">
              Événements<br />assistés
            </p>
          </div>
          <div className="w-px h-12 bg-[#E5E7EB]" />
          <div className="flex-1 flex flex-col items-center">
            <p className="text-2xl font-extrabold text-[#12122A]">0</p>
            <p className="text-[11px] text-[#12122A]/45 text-center leading-tight mt-0.5 font-medium">
              Billets<br />achetés
            </p>
          </div>
          <div className="w-px h-12 bg-[#E5E7EB]" />
          <div className="flex-1 flex flex-col items-center">
            <p className="text-base font-extrabold text-[#12122A] leading-tight">{memberSince}</p>
            <p className="text-[11px] text-[#12122A]/45 text-center leading-tight mt-0.5 font-medium">
              Membre<br />depuis
            </p>
          </div>
        </div>
      </div>

      {/* ── Settings sections ── */}
      <div className="px-5 flex flex-col gap-5">

        <SettingsSection title="Mon compte" items={accountItems} />
        <SettingsSection title="Paiements" items={paymentItems} />
        <SettingsSection title="Notifications" items={notifItems} />
        <SettingsSection title="Sécurité" items={securityItems} />
        <SettingsSection title="À propos" items={aboutItems} />

        {/* Déconnexion */}
        <button
          onClick={handleSignOut}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 bg-red-50 border border-red-100 text-red-500 font-bold text-sm transition-all hover:bg-red-100 active:scale-[0.98]"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>

        <p className="text-center text-xs text-[#12122A]/25 pb-2">
          Nexa Pass · Brazzaville, Congo 🇨🇬
        </p>
      </div>

      {/* ── Edit profile sheet ── */}
      {showEdit && (
        <EditSheet
          name={editName}
          phone={editPhone}
          city={editCity}
          onName={setEditName}
          onPhone={setEditPhone}
          onCity={setEditCity}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
          saving={isSaving}
        />
      )}

      <BottomNav />
    </div>
  )
}
