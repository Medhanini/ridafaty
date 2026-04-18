export type VideoEmbedType = 'youtube' | 'vimeo' | 'direct' | 'unknown'

export interface VideoEmbed {
  type: VideoEmbedType
  /** Ready-to-use embed/src URL */
  src: string
  /** Thumbnail URL (only for YouTube) */
  thumbnail?: string
}

/**
 * Parses a video URL and returns embed metadata.
 *
 * Supports:
 *  - YouTube watch & short URLs  → <iframe> embed
 *  - Vimeo URLs                  → <iframe> embed
 *  - Direct video files (.mp4 …) → <video> element
 *  - Unknown URLs                → display as a plain link
 */
export function getVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null

  // YouTube: youtube.com/watch?v=ID  |  youtu.be/ID  |  youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    }
  }

  // Vimeo: vimeo.com/ID  |  vimeo.com/video/ID  |  player.vimeo.com/video/ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url)) {
    return { type: 'direct', src: url }
  }

  // Fallback – treat as unknown, still show a player attempt
  return { type: 'unknown', src: url }
}
