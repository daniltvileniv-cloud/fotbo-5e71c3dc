// Military-grade button: sharp edges, tactical green accent, bold uppercase
export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-serif uppercase tracking-widest rounded-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

  const variants = {
    primary:
      'bg-primary text-accent border-2 border-accent/50 hover:bg-accent/10 hover:border-accent/70 hover:brightness-120 hover:scale-[1.03] active:scale-[0.96] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed px-10 py-5 text-lg shadow-lg shadow-black/40 hover:shadow-accent/10',
    secondary:
      'bg-transparent text-text-muted border-2 border-accent/20 hover:bg-accent/5 hover:text-accent hover:border-accent/40 active:scale-[0.96] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed px-10 py-5 text-lg',
    danger:
      'bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 active:scale-[0.97] px-3 py-1.5 text-sm',
    ghost:
      'text-text-muted hover:text-accent hover:bg-accent/5 px-3 py-1.5 text-sm',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}