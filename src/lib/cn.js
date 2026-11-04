/** Join conditional class names: cn('p-4', isOpen && 'block') */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
