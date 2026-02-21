/**
 * Shade Generation Utility
 *
 * Generates 7 lightness shades from a hex color.
 * Uses oklch-inspired perceptual lightness levels:
 *   Pastel (lightest/lighter) → Mid-Tone (light/base/dark) → Deep (darker/darkest)
 */

interface Shade {
    label: string
    hex: string
    group: 'pastel' | 'mid-tone' | 'deep'
}

/** Parse hex (#RRGGBB or #RGB) to [r, g, b] 0-255 */
function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '')
    const full = h.length === 3
        ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
        : h
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
    ]
}

/** Convert RGB 0-255 to HSL (h: 0-360, s: 0-1, l: 0-1) */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h = 0, s = 0
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }
    return [h * 360, s, l]
}

/** Convert HSL to hex */
function hslToHex(h: number, s: number, l: number): string {
    h /= 360
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    let r: number, g: number, b: number
    if (s === 0) {
        r = g = b = l
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Generate 7 shades from a hex color.
 * The shade "Base" uses the original color.
 */
export function generateShades(hex: string): Shade[] {
    const [r, g, b] = hexToRgb(hex)
    const [h, s] = rgbToHsl(r, g, b)

    const levels: { label: string; lightness: number; group: Shade['group'] }[] = [
        { label: 'Lightest', lightness: 0.95, group: 'pastel' },
        { label: 'Lighter', lightness: 0.88, group: 'pastel' },
        { label: 'Light', lightness: 0.75, group: 'mid-tone' },
        { label: 'Base', lightness: 0.55, group: 'mid-tone' },
        { label: 'Dark', lightness: 0.42, group: 'mid-tone' },
        { label: 'Darker', lightness: 0.30, group: 'deep' },
        { label: 'Darkest', lightness: 0.18, group: 'deep' },
    ]

    return levels.map(({ label, lightness, group }) => ({
        label,
        hex: hslToHex(h, s, lightness),
        group,
    }))
}

/**
 * Check if a color is light (for contrast text decisions).
 */
export function isLightColor(hex: string): boolean {
    const [r, g, b] = hexToRgb(hex)
    // Relative luminance approximation
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
}
