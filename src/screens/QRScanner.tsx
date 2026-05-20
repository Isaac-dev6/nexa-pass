import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ArrowLeft, QrCode, Camera, CameraOff, FlipHorizontal,
  CheckCircle2, XCircle, AlertTriangle, Keyboard, X,
  FlaskConical, Ticket, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

// ── Types ─────────────────────────────────────────────────────────────────────

type ResultKind = 'valid' | 'used' | 'invalid' | 'not_your_event'

interface ScanResult {
  kind: ResultKind
  eventTitle?: string
  category?: string
  usedAt?: string
  message?: string
}

interface HistoryEntry {
  uid: string
  kind: ResultKind
  label: string
  time: string
}

interface TicketRow {
  id: string
  qr_code: string
  category: string
  status: string
  events: { title: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SCANNER_ELEM_ID = 'nexa-qr-scanner'

// Normalize: lowercase + strip whitespace + strip NEXA- prefix
function normalizeCode(raw: string): string {
  const t = raw.replace(/\s+/g, '').toLowerCase()
  return t.startsWith('nexa-') ? t.slice(5) : t
}

function nowTime(): string {
  return new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const KIND_CONFIG = {
  valid: {
    bg: '#052e16', border: '#16a34a',
    Icon: CheckCircle2, iconColor: '#4ade80',
    title: 'Billet valide !', titleColor: '#4ade80',
    historyColor: 'text-emerald-400',
    vibrate: [300] as number[],
  },
  used: {
    bg: '#431407', border: '#ea580c',
    Icon: AlertTriangle, iconColor: '#fb923c',
    title: 'Déjà utilisé', titleColor: '#fb923c',
    historyColor: 'text-orange-400',
    vibrate: [200, 100, 200] as number[],
  },
  invalid: {
    bg: '#450a0a', border: '#dc2626',
    Icon: XCircle, iconColor: '#f87171',
    title: 'Billet invalide', titleColor: '#f87171',
    historyColor: 'text-red-400',
    vibrate: [100, 50, 100] as number[],
  },
  not_your_event: {
    bg: '#422006', border: '#d97706',
    Icon: AlertTriangle, iconColor: '#f59e0b',
    title: 'REFUSÉ', titleColor: '#f59e0b',
    historyColor: 'text-amber-400',
    vibrate: [200, 100, 200, 100, 200] as number[],
  },
} as const

// ── Animated scan frame ───────────────────────────────────────────────────────

function ScanFrame() {
  const SIZE = 240
  const C = 28

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        style={{
          width: SIZE, height: SIZE, flexShrink: 0, position: 'relative',
          boxShadow: '0 0 0 9999px rgba(15,23,42,0.75)',
          borderRadius: 14,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: C, height: C,
          borderTop: '3px solid #2563EB', borderLeft: '3px solid #2563EB', borderRadius: '10px 0 0 0' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: C, height: C,
          borderTop: '3px solid #9333EA', borderRight: '3px solid #9333EA', borderRadius: '0 10px 0 0' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: C, height: C,
          borderBottom: '3px solid #9333EA', borderLeft: '3px solid #9333EA', borderRadius: '0 0 0 10px' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: C, height: C,
          borderBottom: '3px solid #2563EB', borderRight: '3px solid #2563EB', borderRadius: '0 0 10px 0' }} />

        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 14 }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg,transparent,#2563EB 30%,#9333EA 70%,transparent)',
            animation: 'nexa-sweep 2s linear infinite',
          }} />
        </div>
      </div>
      <style>{`@keyframes nexa-sweep { 0% { top:0 } 100% { top:${SIZE}px } }`}</style>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function QRScanner() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  // Scanner
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processingRef = useRef(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [frontCamera, setFrontCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)

  // Result overlay
  const [result, setResult] = useState<ScanResult | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Manual entry sheet
  const [showManual, setShowManual] = useState(false)
  const [manualCode, setManualCode] = useState('')

  // Ticket picker (inside manual sheet)
  const [ticketRows, setTicketRows] = useState<TicketRow[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  // Session stats
  const [validCount, setValidCount] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // ── Validation (ref so scanner callback always has latest closure) ──────────

  const validateRef = useRef<(code: string) => Promise<void>>(async () => {})

  validateRef.current = async (code: string) => {
    console.log('[QRScanner] 🔍 Validating via RPC — code:', code)

    const { data, error } = await supabase.rpc('scan_ticket', {
      p_qr_code: code,
      p_organizer_id: user?.id ?? null,
    })

    if (error) {
      console.error('[QRScanner] ❌ RPC error:', error.message)
      emitResult({ kind: 'invalid' })
      return
    }

    const res = data as {
      status: 'valid' | 'already_used' | 'invalid' | 'not_your_event'
      category?: string
      event_title?: string
      used_at?: string
    }

    console.log('[QRScanner] 🎫 RPC result:', res)

    if (res.status === 'invalid') {
      console.log('[QRScanner] ❌ No ticket found')
      emitResult({ kind: 'invalid' })
      return
    }

    if (res.status === 'not_your_event') {
      console.log('[QRScanner] 🚫 Ticket belongs to another organizer')
      emitResult({
        kind: 'not_your_event',
        message: "Ce billet n'appartient pas à vos événements",
      })
      return
    }

    if (res.status === 'already_used') {
      console.log('[QRScanner] ⚠️ Already used — usedAt:', res.used_at)
      emitResult({
        kind: 'used',
        eventTitle: res.event_title,
        category: res.category,
        usedAt: res.used_at,
      })
      return
    }

    // status === 'valid' → atomically marked as used by the RPC
    console.log('[QRScanner] ✅ Valid — marked used atomically')
    emitResult({
      kind: 'valid',
      eventTitle: res.event_title,
      category: res.category,
    })
    setValidCount((n) => n + 1)
  }

  function emitResult(res: ScanResult) {
    setResult(res)
    navigator.vibrate?.(KIND_CONFIG[res.kind].vibrate)

    const label =
      res.kind === 'valid'            ? `✅ ${res.eventTitle ?? 'Billet valide'}`
      : res.kind === 'used'           ? `⚠️ ${res.eventTitle ?? 'Déjà utilisé'}`
      : res.kind === 'not_your_event' ? `🚫 Billet autre organisateur`
      : '❌ Code invalide'

    setHistory((h) => [
      { uid: crypto.randomUUID(), kind: res.kind, label, time: nowTime() },
      ...h.slice(0, 4),
    ])

    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    resultTimerRef.current = setTimeout(() => {
      setResult(null)
      processingRef.current = false
    }, 3000)
  }

  function dismissResult() {
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
    setResult(null)
    processingRef.current = false
  }

  // ── Camera ──────────────────────────────────────────────────────────────────

  function clearScannerDom() {
    const el = document.getElementById(SCANNER_ELEM_ID)
    if (el) el.innerHTML = ''
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* already stopped */ }
      scannerRef.current = null
    }
    clearScannerDom()
    setCameraActive(false)
  }

  async function startScanner(useFront = frontCamera) {
    setCameraError(null)
    await stopScanner()

    if (!document.getElementById(SCANNER_ELEM_ID)) {
      setCameraError("Erreur d'initialisation. Recharge la page.")
      return
    }

    const onSuccess = (raw: string) => {
      if (!processingRef.current) {
        processingRef.current = true
        const code = normalizeCode(raw)
        console.log('[QRScanner] 📷 QR scanned raw:', raw, '→ normalized:', code)
        validateRef.current(code).catch(console.error)
      }
    }

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEM_ID, { verbose: false })
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: useFront ? 'user' : 'environment' },
          { fps: 12 },
          onSuccess,
          () => {}, // suppress per-frame "no QR found" logs
        )
      } catch {
        console.warn('[QRScanner] environment camera failed, trying user camera')
        await scanner.start(
          { facingMode: 'user' },
          { fps: 12 },
          onSuccess,
          () => {},
        )
      }

      setCameraActive(true)
      console.log('[QRScanner] ✅ Camera started')
    } catch (err) {
      console.error('[QRScanner] Camera start failed:', err)
      scannerRef.current = null
      clearScannerDom()

      const msg = String(err)
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError(
          "Accès caméra refusé. Clique sur 🔒 dans la barre d'adresse → autorise la caméra → recharge."
        )
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFound')) {
        setCameraError('Aucune caméra détectée sur cet appareil.')
      } else {
        setCameraError("Impossible de démarrer la caméra. Vérifie les autorisations du navigateur.")
      }
      setCameraActive(false)
    }
  }

  async function toggleCamera() {
    if (cameraActive) await stopScanner()
    else await startScanner()
  }

  async function switchCamera() {
    const useFront = !frontCamera
    setFrontCamera(useFront)
    if (cameraActive) await startScanner(useFront)
  }

  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => {}) }
  }, [])

  // ── Simulate scan ───────────────────────────────────────────────────────────

  async function simulateScan() {
    if (processingRef.current || simulating) return
    setSimulating(true)

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, qr_code, category, status, events(title)')
        .not('qr_code', 'is', null)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('[QRScanner] simulateScan error:', error.message)
        showToast('Erreur Supabase : ' + error.message)
        return
      }

      if (!data?.qr_code) {
        console.log('[QRScanner] simulateScan: aucun ticket trouvé')
        showToast("Aucun billet avec qr_code dans Supabase. Achète un billet d'abord.")
        return
      }

      const normalized = normalizeCode(data.qr_code)
      console.log('[QRScanner] 🧪 Simulate scan')
      console.log('  qr_code (DB)  :', data.qr_code)
      console.log('  normalized    :', normalized)
      console.log('  ticket id     :', data.id)
      console.log('  category      :', data.category)
      console.log('  status        :', data.status)
      console.log('  event         :', (data.events as {title?:string}|null)?.title)

      showToast(`🧪 Simul. qr_code = ${data.qr_code.slice(0, 13)}…`)

      processingRef.current = true
      await validateRef.current(normalized)
    } finally {
      setSimulating(false)
    }
  }

  // ── Load ticket picker ──────────────────────────────────────────────────────

  async function loadTickets() {
    setLoadingTickets(true)
    setShowPicker(false)

    const { data, error } = await supabase
      .from('tickets')
      .select('id, qr_code, category, status, events(title)')
      .not('qr_code', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('[QRScanner] loadTickets error:', error.message)
      showToast('Erreur lors du chargement des billets.')
    } else {
      const rows = (data ?? []) as unknown as TicketRow[]
      console.log('[QRScanner] 📋 Available tickets (qr_code format debug):')
      rows.forEach((t, i) => {
        console.log(`  [${i}] qr_code="${t.qr_code}"  id=${t.id}  status=${t.status}`)
      })
      setTicketRows(rows)
      setShowPicker(true)
    }

    setLoadingTickets(false)
  }

  // ── Manual entry ────────────────────────────────────────────────────────────

  async function submitManual() {
    const code = normalizeCode(manualCode)
    if (!code) return
    console.log('[QRScanner] Manual entry raw:', manualCode, '→ normalized:', code)
    setManualCode('')
    setShowManual(false)
    setShowPicker(false)
    processingRef.current = true
    await validateRef.current(code).catch(console.error)
  }

  function openManual() {
    setShowPicker(false)
    setTicketRows([])
    setManualCode('')
    setShowManual(true)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen text-white flex flex-col select-none"
      style={{ background: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      <style>{`
        #${SCANNER_ELEM_ID} { overflow: hidden; }
        #${SCANNER_ELEM_ID} video { width:100% !important; height:100% !important; object-fit:cover !important; display:block !important; }
        #${SCANNER_ELEM_ID} canvas { display:none !important; }
        #${SCANNER_ELEM_ID} img { display:none !important; }
        #${SCANNER_ELEM_ID} > div { border:none !important; padding:0 !important; }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 md:pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Scanner billets</h1>
            <p className="text-xs text-white/40">
              {validCount} entrée{validCount !== 1 ? 's' : ''} validée{validCount !== 1 ? 's' : ''} cette session
            </p>
          </div>
        </div>
        <button
          onClick={openManual}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Saisie manuelle"
        >
          <Keyboard size={18} />
        </button>
      </div>

      {/* ── Camera viewport ── */}
      <div className="relative flex-1 flex flex-col">
        <div
          className="relative w-full bg-black overflow-hidden"
          style={{ minHeight: cameraActive ? 360 : 0, transition: 'min-height 0.3s' }}
        >
          <div id={SCANNER_ELEM_ID} style={{ width: '100%', minHeight: cameraActive ? 360 : 0 }} />
          {cameraActive && <ScanFrame />}
        </div>

        {/* Camera-off placeholder */}
        {!cameraActive && (
          <div className="flex flex-col items-center justify-center gap-5 py-14 flex-1 px-8">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <QrCode size={42} className="text-white/20" />
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-white/50 mb-1">Caméra désactivée</p>
              {cameraError ? (
                <p className="text-xs text-red-400 mt-2 leading-relaxed max-w-xs">{cameraError}</p>
              ) : (
                <p className="text-xs text-white/25 leading-relaxed mt-1">
                  Appuie sur le bouton pour activer le scanner.
                  <br />Le navigateur demandera l'accès à la caméra.
                </p>
              )}
            </div>

            {/* Test / simulate */}
            <button
              onClick={simulateScan}
              disabled={simulating || !!result}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all hover:bg-white/10 disabled:opacity-40"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
            >
              <FlaskConical size={15} />
              {simulating ? 'Simulation en cours…' : 'Simuler un scan'}
            </button>
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center justify-center gap-6 py-8 shrink-0">
          <button
            onClick={switchCamera}
            disabled={!cameraActive}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-25"
            title="Changer de caméra"
          >
            <FlipHorizontal size={20} />
          </button>

          <button
            onClick={toggleCamera}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: cameraActive
                ? 'linear-gradient(135deg,#dc2626,#9f1239)'
                : 'linear-gradient(135deg,#2563EB,#9333EA)',
            }}
          >
            {cameraActive ? <CameraOff size={24} /> : <Camera size={24} />}
          </button>

          {/* Simulate button — always visible when camera is active */}
          {cameraActive ? (
            <button
              onClick={simulateScan}
              disabled={simulating || !!result}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-25"
              title="Simuler un scan (test)"
            >
              <FlaskConical size={18} />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>
      </div>

      {/* ── Scan history ── */}
      {history.length > 0 && (
        <div className="px-5 pb-8 shrink-0">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">
            Derniers scans
          </p>
          <div className="flex flex-col gap-2">
            {history.map((entry) => (
              <div
                key={entry.uid}
                className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <p className={`text-sm font-semibold truncate mr-3 ${KIND_CONFIG[entry.kind].historyColor}`}>
                  {entry.label}
                </p>
                <p className="text-xs text-white/25 shrink-0">{entry.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Result overlay ── */}
      {result && (() => {
        const cfg = KIND_CONFIG[result.kind]
        const { Icon } = cfg
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-5 border-2 shadow-2xl"
              style={{ background: cfg.bg, borderColor: cfg.border }}
            >
              <Icon size={68} style={{ color: cfg.iconColor }} strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-2xl font-extrabold tracking-tight" style={{ color: cfg.titleColor }}>
                  {cfg.title}
                </p>
                {result.message && (
                  <p className="text-sm mt-2 font-semibold" style={{ color: cfg.iconColor }}>{result.message}</p>
                )}
                {result.eventTitle && (
                  <p className="text-white/70 text-sm mt-2 font-semibold">{result.eventTitle}</p>
                )}
                {result.category && (
                  <p className="text-white/35 text-xs mt-1">{result.category}</p>
                )}
                {result.kind === 'used' && result.usedAt && (
                  <p className="text-white/35 text-xs mt-2">
                    Scanné le{' '}
                    {new Date(result.usedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {' à '}
                    {new Date(result.usedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <button
                onClick={dismissResult}
                className="px-8 py-2.5 rounded-xl text-sm font-bold text-white/70 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                Continuer
              </button>
            </div>
          </div>
        )
      })()}

      {/* ── Manual entry sheet ── */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowManual(false)} />
          <div
            className="relative w-full max-w-sm rounded-t-3xl flex flex-col"
            style={{ background: '#1E293B', maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <h3 className="text-base font-extrabold">Saisie manuelle</h3>
              <button onClick={() => setShowManual(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {/* Input */}
              <div>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitManual()}
                  placeholder="UUID du billet ou NEXA-…"
                  autoFocus
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-white/30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)', fontFamily: 'monospace' }}
                />
                <p className="text-[11px] mt-1.5 px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Insensible à la casse · les espaces sont ignorés
                </p>
              </div>

              {/* "Voir mes billets" button */}
              <button
                onClick={loadTickets}
                disabled={loadingTickets}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-50"
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
              >
                <div className="flex items-center gap-2">
                  <Ticket size={15} />
                  {loadingTickets ? 'Chargement…' : 'Voir les billets disponibles (Supabase)'}
                </div>
                <ChevronRight size={14} />
              </button>

              {/* Ticket picker list */}
              {showPicker && (
                <div className="flex flex-col gap-2">
                  {ticketRows.length === 0 ? (
                    <p className="text-sm text-white/40 text-center py-4">
                      Aucun billet avec qr_code trouvé.
                    </p>
                  ) : (
                    ticketRows.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setManualCode(t.qr_code)
                          setShowPicker(false)
                        }}
                        className="w-full text-left rounded-xl px-4 py-3 border transition-all hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white/70 truncate mr-2">
                            {(t.events as {title?:string}|null)?.title ?? 'Événement'} · {t.category}
                          </p>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              background: t.status === 'used' ? 'rgba(251,146,60,0.15)' : 'rgba(74,222,128,0.15)',
                              color: t.status === 'used' ? '#fb923c' : '#4ade80',
                            }}
                          >
                            {t.status}
                          </span>
                        </div>
                        <p
                          className="text-[11px] break-all"
                          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}
                        >
                          {t.qr_code}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-8 pt-3 shrink-0">
              <button
                onClick={submitManual}
                disabled={!manualCode.trim()}
                className="w-full h-12 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
