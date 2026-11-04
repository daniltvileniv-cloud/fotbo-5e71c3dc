# Design System — Облік Сержантів (Sergeant Roster)

## Brand
- **Project name:** Облік сержантів (Sergeant Roster)
- **One-line description:** Військова система обліку особового складу сержантського корпусу
- **Emotional tone:** Бойова, преміальна, авторитарна — темна тактична військова естетика
- **Archetype:** Dark-Military — near-black `#0c0c0c`, оливково-зелений акцент, золоті підсвітки, броньована техніка, камуфляжні паттерни

## Color Palette (→ @theme tokens → Tailwind utilities)

| Token                     | Hex       | Usage                              |
|---------------------------|-----------|------------------------------------|
| `--color-primary`         | `#0C0C0C` | Near-black — основний фон          |
| `--color-secondary`       | `#1A1A1A` | Dark border, panels                |
| `--color-accent`          | `#4A7C3F` | Olive green — заголовки таблиці, акценти, CTA |
| `--color-bg`              | `#0C0C0C` | Near-black — фон сторінки          |
| `--color-surface`         | `#1A1A1A` | Темна поверхня — картки, панелі    |
| `--color-surface-alt`     | `#5C6E52` | Muted olive — альтернативні панелі |
| `--color-text`            | `#E5E5E5` | Off-white — основний текст         |
| `--color-text-muted`      | `#8A8678` | Muted khaki — другорядний текст    |
| `--color-gold`            | `#C9A44A` | Gold — підсвітки, заголовки, акценти |
| `--color-danger`          | `#8C2F26` | Warning red — видалення            |
| `--color-table-header`    | `#4A7C3F` | Olive green — фон заголовків таблиці |
| `--color-table-header-text` | `#1A1A1A` | Near-black — текст заголовків таблиці |

## Typography (→ --font-* tokens → font-sans / font-serif)

- **Heading font:** `Oswald` — Google Fonts (400, 500, 600, 700) → `--font-serif` (заголовки, тактичні акценти, uppercase)
- **Body font:** `Inter` — Google Fonts (300, 400, 500, 600, 700) → `--font-sans` (текст, таблиці, навігація)
- **Base size:** `text-base` (16px) body, `leading-relaxed`
- **Scale:** h1 `text-4xl md:text-6xl` / h2 `text-3xl md:text-5xl` / h3 `text-2xl` / h4 `text-xl`

## Spacing & Layout (Tailwind utilities)

- Section padding: `py-24` (вертикальні секції)
- Container: `max-w-7xl mx-auto px-6`
- Border radius: `rounded-none` військові гострі кути, `rounded-sm` мінімальні
- Border: `border-[#1A1A1A]` темні рамки

## Pages & Component Inventory

### Pages

- **src/features/home/HomePage.jsx** — route `/`, композує MilitaryHero + ButtonGroup
- **src/features/sergeants/SergeantTablePage.jsx** — route `/sergeants`, Excel-style таблиця з усіма сержантами
- **src/features/evaluation/EvaluationPage.jsx** — route `/evaluation`, placeholder сторінка

### Components

- **src/features/home/SeriousMilitaryHero.jsx** — Full-viewport landing: броньована техніка зліва (з зеленим глоу), текст справа, зелений заголовок, кнопка «Додати до навчання»
- **src/features/sergeants/SergeantTablePage.jsx** — Excel-style таблиця з колонками: № з/п, Звання, ПІБ, Підрозділ, Посада, Дії; редагований сплошний верхній рядок (олівково-зелений `#4A7C3F`)
- **src/features/evaluation/EvaluationPage.jsx** — Placeholder page with military heading
- **src/components/ui/Button.jsx** — Тактична кнопка: гострий кут, зелений акцент, hover/active стани

### Layout

- **src/components/layout/Layout.jsx** — Оболонка: `<Header />` + `<main>` з `<Outlet />` + `<Footer />`
- **src/components/layout/Header.jsx** — Sticky шапка: тактичний стиль, зелений акцент, військова навігація
- **src/components/layout/Footer.jsx** — Темний футер: три колонки, зелені заголовки

## Images

- **hero-military** — броньована військова техніка, затемнена, зліва від тексту героя
- **hero-emblem** — `/uploads/2026-11-03_211726973-a47693aa.png` — монохромна емблема (броньована техніка + щит), зліва під заголовком
- **camo-texture** — камуфляжний паттерн для фонових елементів

## Animations

- Кнопка hover: brightness(1.2) + scale(1.03) + зелений глоу
- Кнопка active: scale(0.96)
- Фокус комірки: підсвітка бордеру accent (зелений)
- Hover на рядку таблиці: bg-accent/5
- Пульсуючий індикатор "Система активна"