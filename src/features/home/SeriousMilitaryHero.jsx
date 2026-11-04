import Button from '../../components/ui/Button.jsx'

export default function SeriousMilitaryHero({ onEnter, onEvaluate, onRoster }) {
  return (
    <section className="relative flex h-full min-h-[calc(100vh-96px)] items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base dark */}
        <div className="absolute inset-0 bg-bg" />

        {/* Armored vehicle background — desaturated, dark overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/40013152/pexels-photo-40013152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt=""
            width="7924"
            height="5948"
            className="h-full w-full object-cover opacity-15 grayscale"
            style={{ backgroundColor: '#443E30' }}
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90" />

        {/* Tactical topographic lines */}
        <div className="absolute inset-0 topo-lines opacity-40" />

        {/* Crosshair pattern */}
        <div className="absolute inset-0 crosshair-pattern opacity-30" />

        {/* Scan line overlay */}
        <div className="absolute inset-0 scan-line opacity-20" />

        {/* Top-left green glow */}
        <div className="absolute left-0 top-0 h-[500px] w-[600px] bg-accent/5 blur-[160px] rounded-full" />

        {/* Bottom-right subtle glow */}
        <div className="absolute -bottom-40 right-0 h-[400px] w-[500px] bg-surface-alt/30 blur-[140px] rounded-full" />

        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

        {/* Border frame — tactical green */}
        <div className="absolute inset-0 border-[12px] border-primary/30 pointer-events-none" />
        <div className="absolute inset-0 border-[4px] border-accent/10 pointer-events-none" />

        {/* Corner markers — tactical green */}
        <div className="absolute left-6 top-6 h-10 w-10 border-l-[3px] border-t-[3px] border-accent/40" />
        <div className="absolute right-6 top-6 h-10 w-10 border-r-[3px] border-t-[3px] border-accent/40" />
        <div className="absolute bottom-6 left-6 h-10 w-10 border-b-[3px] border-l-[3px] border-accent/40" />
        <div className="absolute bottom-6 right-6 h-10 w-10 border-b-[3px] border-r-[3px] border-accent/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
          {/* Left: Uploaded image — armored vehicle with shield emblem */}
          <div className="flex-shrink-0 md:w-2/5">
            <div className="relative mx-auto max-w-[280px] md:max-w-[380px]">
              <img
                src="/uploads/2026-11-03_211726973-a47693aa.png"
                alt="Емблема Збройних Сил"
                width="408"
                height="524"
                className="h-auto w-full object-contain drop-shadow-[0_0_40px_rgba(139,195,74,0.15)]"
                style={{ backgroundColor: '#31322d' }}
              />
              {/* Green glow behind image */}
              <div className="absolute -inset-8 -z-10 rounded-full bg-accent/5 blur-[80px]" />
            </div>
          </div>

          {/* Right: Title + Buttons */}
          <div className="flex flex-col items-center text-center md:w-3/5 md:items-start md:text-left">
            {/* Title — tactical green, Playfair Display */}
            <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.12em] text-accent md:text-5xl lg:text-6xl">
              Залучення
            </h1>
            <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.12em] text-text md:text-5xl lg:text-6xl">
              Сержанського складу
            </h1>

            {/* Subtitle */}
            <p className="mt-6 font-sans text-sm uppercase tracking-[0.18em] text-text-muted md:text-base">
              Система обліку особового складу
            </p>

            {/* Tactical divider */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-[2px] w-12 bg-accent/80" />
              <div className="h-[2px] w-6 bg-accent/40" />
              <div className="h-[2px] w-3 bg-accent/20" />
            </div>

            {/* Button group */}
            <div className="mt-10 flex flex-col gap-4">
              <Button onClick={onEnter} className="!min-w-[240px] !py-4 !text-base !tracking-[0.15em]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Додати до навчання
              </Button>

              <Button onClick={onEvaluate} variant="secondary" className="!min-w-[240px] !py-4 !text-base !tracking-[0.15em]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                  <path d="M5 5l14 0 0 14-14 0 0-14M12 12l5 5-5-5" />
                </svg>
                Оцінювання
              </Button>

              <Button onClick={onRoster} variant="secondary" className="!min-w-[240px] !py-4 !text-base !tracking-[0.15em]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Перелік О/С
              </Button>

              <p className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-text-muted/40">
                Виберіть режим для входу в систему
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}