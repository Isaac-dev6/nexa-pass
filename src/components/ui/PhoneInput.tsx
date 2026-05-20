import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Country {
  flag: string
  name: string
  code: string
  pattern: RegExp
  placeholder: string
  maxLength: number
}

const COUNTRIES: Country[] = [
  { flag: '🇨🇬', name: 'Congo',         code: '+242', pattern: /^0[56]\d{7}$/,  placeholder: '06 000 00 00',    maxLength: 9  },
  { flag: '🇨🇩', name: 'RDC',           code: '+243', pattern: /^0\d{8}$/,       placeholder: '09 000 00 000',   maxLength: 10 },
  { flag: '🇫🇷', name: 'France',        code: '+33',  pattern: /^0\d{9}$/,       placeholder: '06 00 00 00 00',  maxLength: 10 },
  { flag: '🇨🇲', name: 'Cameroun',      code: '+237', pattern: /^[26]\d{8}$/,    placeholder: '6 00 00 00 00',   maxLength: 9  },
  { flag: '🇬🇦', name: 'Gabon',         code: '+241', pattern: /^0[67]\d{6}$/,   placeholder: '06 00 00 00',     maxLength: 8  },
  { flag: '🇸🇳', name: 'Sénégal',       code: '+221', pattern: /^7\d{8}$/,       placeholder: '70 000 00 00',    maxLength: 9  },
  { flag: '🇧🇯', name: 'Bénin',         code: '+229', pattern: /^\d{8}$/,        placeholder: '00 00 00 00',     maxLength: 8  },
  { flag: '🇨🇮', name: "Côte d'Ivoire", code: '+225', pattern: /^0[57]\d{8}$/,   placeholder: '07 00 00 00 00',  maxLength: 10 },
  { flag: '🇧🇪', name: 'Belgique',      code: '+32',  pattern: /^0\d{8,9}$/,     placeholder: '04 00 00 00 00',  maxLength: 10 },
  { flag: '🇨🇭', name: 'Suisse',        code: '+41',  pattern: /^0\d{9}$/,       placeholder: '07 000 00 00',    maxLength: 10 },
]

export interface PhoneInputProps {
  value?: string
  onChange: (fullNumber: string, isValid: boolean) => void
  error?: string
  className?: string
}

export function PhoneInput({ value = '', onChange, error, className = '' }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const [localNumber, setLocalNumber] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [touched, setTouched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse initial value
  useEffect(() => {
    if (!value) return
    const found = COUNTRIES.find((c) => value.startsWith(c.code))
    if (found) {
      setSelectedCountry(found)
      setLocalNumber(value.slice(found.code.length).trim())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isValid = selectedCountry.pattern.test(localNumber)
  const showError = touched && localNumber.length > 0 && !isValid

  const handleNumberChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, selectedCountry.maxLength)
    setLocalNumber(cleaned)
    onChange(`${selectedCountry.code}${cleaned}`, selectedCountry.pattern.test(cleaned))
  }

  const selectCountry = (country: Country) => {
    setSelectedCountry(country)
    setLocalNumber('')
    onChange(country.code, false)
    setShowDropdown(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex rounded-xl border overflow-visible transition-all ${
          error || showError
            ? 'border-red-400'
            : 'border-[#E5E7EB] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10'
        }`}
      >
        {/* Country selector */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-3 py-3 bg-[#F4F4FB] border-r border-[#E5E7EB] h-full hover:bg-[#EBEBF5] transition-colors rounded-l-xl"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-sm text-[#12122A]/60 font-medium whitespace-nowrap">{selectedCountry.code}</span>
            <ChevronDown
              size={12}
              className={`text-[#12122A]/40 transition-transform duration-150 ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 overflow-auto max-h-60">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => selectCountry(country)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F4F4FB] transition-colors text-sm ${
                    selectedCountry.code === country.code ? 'bg-[#EEF2FF]' : ''
                  }`}
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="flex-1 font-medium text-[#12122A]">{country.name}</span>
                  <span className="text-[#12122A]/45 font-semibold text-xs">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number input */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={selectedCountry.placeholder}
          className="flex-1 px-3 py-3 bg-white text-[#12122A] text-sm outline-none placeholder-[#12122A]/35"
        />

        {/* Validation indicator */}
        {touched && localNumber.length > 0 && (
          <div className="flex items-center pr-3 shrink-0">
            {isValid ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg width="10" height="8" fill="none" viewBox="0 0 10 8">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center">
                <span className="text-white text-[10px] font-black">!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showError && (
        <p className="text-xs text-red-500 mt-1 font-medium">
          Format invalide pour {selectedCountry.name} — ex : {selectedCountry.placeholder}
        </p>
      )}
      {error && !showError && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  )
}
