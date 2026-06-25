export function openUploadedFile(path?: string | null) {
  if (!path?.trim()) return

  if (path.startsWith('http')) {
    window.open(path, '_blank')
    return
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  window.open(`${baseUrl}${cleanPath}`, '_blank')
}

export function hasUploadedFile(path?: string | null): boolean {
  return Boolean(path?.trim())
}
