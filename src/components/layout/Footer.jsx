import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Головна' },
  { to: '/sergeants', label: 'Залучення Сержанського складу' },
  { to: '/evaluation', label: 'Оцінювання' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-accent/20 bg-secondary">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="h-5 w-5 text-accent"
              >
                <path d="M50 5L61 25L84 12L95 30L78 45L50 50L22 45L5 30L16 12L39 25L50 5Z" />
              </svg>
              <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-accent">
                Залучення Сержанського складу
              </span>
            </div>
            <p className="mt-4 max-w-xs font-sans text-xs leading-relaxed text-text-muted/70">
              Військова система обліку особового складу.
              Табель залучення, розподіл за змінами та оцінювання.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-accent">
              Розділи
            </h3>
            <ul className="mt-4 space-y-2">
              {LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-accent"
                  >
                    <span className="h-px w-3 bg-text-muted/40 transition-all duration-200 group-hover:w-5 group-hover:bg-accent" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System meta */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-accent">
              Система
            </h3>
            <dl className="mt-4 space-y-2 font-sans text-xs text-text-muted/70">
              <div className="flex items-center justify-between border-b border-surface-alt/40 pb-2">
                <dt className="uppercase tracking-[0.12em]">Версія</dt>
                <dd className="text-text-muted">2.1.0</dd>
              </div>
              <div className="flex items-center justify-between border-b border-surface-alt/40 pb-2">
                <dt className="uppercase tracking-[0.12em]">Статус</dt>
                <dd className="flex items-center gap-1.5 text-accent">
                  <span className="h-1.5 w-1.5 bg-accent" />
                  Активна
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="uppercase tracking-[0.12em]">Доступ</dt>
                <dd className="text-text-muted">Внутрішній</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-surface-alt/50 pt-5 sm:flex-row sm:items-center">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-text-muted/50">
            © {new Date().getFullYear()} Залучення Сержанського складу
          </span>
          <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-text-muted/35">
            Службове використання · не для публічного розповсюдження
          </span>
        </div>
      </div>
    </footer>
  )
}