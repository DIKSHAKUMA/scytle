/**
 * Video embed helpers for design mode
 *
 * Parses YouTube/Vimeo URLs into embed URLs for iframe rendering.
 * Falls back to null for direct video files (mp4, webm).
 */

/**
 * Convert a YouTube or Vimeo watch URL into an embeddable iframe URL.
 * Returns null for direct video files or unrecognised patterns.
 */
export function getEmbedUrl(url: string): string | null {
    if (!url) return null

    // YouTube patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    )
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
    }

    // Vimeo patterns: vimeo.com/123456
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    return null // Direct video file — use <video> tag
}

/**
 * Check whether a URL points to a direct video file (mp4, webm, ogg).
 */
export function isDirectVideoUrl(url: string): boolean {
    if (!url) return false
    try {
        const pathname = new URL(url, 'https://placeholder.local').pathname.toLowerCase()
        return /\.(mp4|webm|ogg|mov)$/.test(pathname)
    } catch {
        return false
    }
}
