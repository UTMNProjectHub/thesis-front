import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function fullNameToInitials(fullName: string) {
  const names = fullName.split(' ')
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} ${names[1][0]}.`
  if (names.length >= 3) return `${names[0]} ${names[1][0]}. ${names[2][0]}.`
}

export function fullNameToLetters(fullName: string) {
  const names = fullName.split(' ')
  names.map((n, i) => (names[i] = n[0]))
  return names.join('')
}
