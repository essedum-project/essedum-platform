import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Render any value as a human-readable preview string.
 *
 * Plain primitives are stringified directly. Objects / arrays are
 * JSON-stringified with indentation so the inspector and node preview
 * never show "[object Object]".
 */
export function formatOutputPreview(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value)
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
