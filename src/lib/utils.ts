// Autor: Mohamad Haj Ahmad, Eya Mathlouthi und Wajdy Eleyan
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
