import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts
 *
 * @param {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500')
 * cn('px-2', 'px-4') // Returns 'px-4' (tailwind-merge handles conflicts)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
