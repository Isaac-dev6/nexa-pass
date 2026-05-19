export const CATEGORIES = ['Tous', 'Concerts', 'VIP', 'Cinéma', 'Sport'] as const

interface CategoryPillsProps {
  activeCategory: string
  onChange: (category: string) => void
}

export function CategoryPills({ activeCategory, onChange }: CategoryPillsProps) {
  return (
    <div className="pl-5 mb-8 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={
            activeCategory === cat
              ? 'bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all'
              : 'bg-white text-[#12122A]/70 border border-[#E5E7EB] px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm hover:border-[#2563EB]/30 hover:text-[#12122A] transition-all'
          }
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
