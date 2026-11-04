import { Link, NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Головна', index: '01', end: true },
  { to: '/sergeants', label: 'Залучення', index: '02' },
  { to: '/evaluation', label: 'Оцінювання', index: '03' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-accent/15 bg-bg/98 backdrop-blur-sm">
      {/* Thin tactical green rule on top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-accent/70 via-accent/25 to-transparent" />

      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Brand */}
        <Link to="/" className="group flex items-center">
          <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Залучення Сержанського складу
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-stretch gap-1 sm:gap-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-2 border-b-2 px-2 py-2 font-sans text-[10px] uppercase tracking-[0.18em] transition-colors sm:px-3 sm:text-[11px] ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:border-accent/40 hover:text-accent/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`hidden font-sans text-[9px] tracking-[0.1em] sm:inline ${
                      isActive ? 'text-accent/60' : 'text-text-muted/40'
                    }`}
                  >
                    {item.index}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status — desktop only */}
        <div className="hidden items-center gap-2 border border-accent/20 px-3 py-1.5 lg:flex">
          <span className="h-1.5 w-1.5 animate-pulse bg-accent" />
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-accent/60">
            Система активна
          </span>
        </div>
      </div>
    </header>
  )
}