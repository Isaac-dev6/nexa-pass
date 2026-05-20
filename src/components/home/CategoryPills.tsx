import { useTheme } from '../../contexts/ThemeContext'

export const CATEGORIES = ['Tous', 'Concerts', 'VIP', 'Cinéma', 'Sport'] as const

interface CategoryPillsProps {
  activeCategory: string
  onChange: (category: string) => void
}

export function CategoryPills({ activeCategory, onChange }: CategoryPillsProps) {
  const { isDark } = useTheme()

  return (
    <div className="pl-5 mb-8 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={
            activeCategory === cat
              ? 'bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all'
              : 'px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border'
          }
          style={
            activeCategory !== cat
              ? {
                  background: isDark ? '#1E1E30' : 'white',
                  color: isDark ? '#9494B8' : 'rgba(18,18,42,0.7)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                }
              : undefined
          }
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
