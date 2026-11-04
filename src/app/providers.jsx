// Global providers wrap the whole app exactly once. Add context providers from
// src/store here (auth, cart, theme, ...) instead of nesting them in pages.
export default function Providers({ children }) {
  return children
}
