/**
 * CTA-C Thumbnails — Icon placeholder previews for the sidebar
 *
 * Render inside an aspect-video container in the component library panel.
 *
 * Visual cues per structural group:
 *   Left Normal:   AlignLeft icon + bg indicator
 *   Left Card:     CreditCard + bg indicator
 *   Center Normal: AlignCenter icon + bg indicator
 *   Center Card:   CreditCard + centered indicator
 *   Center Stacked: AlignCenter + image below
 *   Center Expand:  Maximize2 + full-width bar
 */

import {
    AlignLeft,
    AlignCenter,
    CreditCard,
    ImageIcon,
    Video,
    Mail,
    Maximize2,
} from 'lucide-react'

// ── Shared wrapper ──────────────────────────────────────────────

function Thumb({
    children,
    label,
}: {
    children: React.ReactNode
    label: string
}) {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">{children}</div>
            <span className="text-[10px] text-gray-400 font-medium">{label}</span>
        </div>
    )
}

// ============================================
// LEFT NORMAL (CTA 19, 20, 3, 4, 5, 6)
// ============================================

export function Cta19Thumbnail() {
    return (
        <Thumb label="Left + Btns">
            <AlignLeft className="w-4 h-4 text-gray-400" />
        </Thumb>
    )
}

export function Cta20Thumbnail() {
    return (
        <Thumb label="Left + Form">
            <AlignLeft className="w-4 h-4 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta3Thumbnail() {
    return (
        <Thumb label="Left BG Img + Btns">
            <AlignLeft className="w-4 h-4 text-gray-400" />
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta4Thumbnail() {
    return (
        <Thumb label="Left BG Img + Form">
            <AlignLeft className="w-4 h-4 text-gray-400" />
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta5Thumbnail() {
    return (
        <Thumb label="Left BG Video + Btns">
            <AlignLeft className="w-4 h-4 text-gray-400" />
            <Video className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta6Thumbnail() {
    return (
        <Thumb label="Left BG Video + Form">
            <AlignLeft className="w-4 h-4 text-gray-400" />
            <Video className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

// ============================================
// LEFT CARD (CTA 41, 42, 43, 44)
// ============================================

export function Cta41Thumbnail() {
    return (
        <Thumb label="Card BG Img + Btns">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta42Thumbnail() {
    return (
        <Thumb label="Card BG Img + Form">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta43Thumbnail() {
    return (
        <Thumb label="Card BG Vid + Btns">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <Video className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta44Thumbnail() {
    return (
        <Thumb label="Card BG Vid + Form">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <Video className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

// ============================================
// CENTER NORMAL (CTA 25, 26, 27, 28, 29, 30)
// ============================================

export function Cta25Thumbnail() {
    return (
        <Thumb label="Center + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
        </Thumb>
    )
}

export function Cta26Thumbnail() {
    return (
        <Thumb label="Center + Form">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta27Thumbnail() {
    return (
        <Thumb label="Center BG Img + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta28Thumbnail() {
    return (
        <Thumb label="Center BG Img + Form">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta29Thumbnail() {
    return (
        <Thumb label="Center BG Vid + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <Video className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta30Thumbnail() {
    return (
        <Thumb label="Center BG Vid + Form">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <Video className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

// ============================================
// CENTER CARD (CTA 51, 52, 53, 54, 55, 56)
// ============================================

export function Cta51Thumbnail() {
    return (
        <Thumb label="CtrCard + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta52Thumbnail() {
    return (
        <Thumb label="CtrCard + Form">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <Mail className="w-3.5 h-3.5 text-gray-400" />
        </Thumb>
    )
}

export function Cta53Thumbnail() {
    return (
        <Thumb label="CtrCard Img + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <ImageIcon className="w-3 h-3 text-gray-400" />
        </Thumb>
    )
}

export function Cta54Thumbnail() {
    return (
        <Thumb label="CtrCard Img + Form">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <ImageIcon className="w-3 h-3 text-gray-400" />
            <Mail className="w-3 h-3 text-gray-400" />
        </Thumb>
    )
}

export function Cta55Thumbnail() {
    return (
        <Thumb label="CtrCard Vid + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <Video className="w-3 h-3 text-gray-400" />
        </Thumb>
    )
}

export function Cta56Thumbnail() {
    return (
        <Thumb label="CtrCard Vid + Form">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <Video className="w-3 h-3 text-gray-400" />
            <Mail className="w-3 h-3 text-gray-400" />
        </Thumb>
    )
}

// ============================================
// CENTER STACKED (CTA 31, 32)
// ============================================

export function Cta31Thumbnail() {
    return (
        <Thumb label="Stacked + Btns">
            <AlignCenter className="w-4 h-4 text-gray-400" />
            <div className="w-6 h-3 bg-gray-200 rounded-sm" />
        </Thumb>
    )
}

export function Cta32Thumbnail() {
    return (
        <Thumb label="Stacked + Form">
            <Mail className="w-4 h-4 text-gray-400" />
            <div className="w-6 h-3 bg-gray-200 rounded-sm" />
        </Thumb>
    )
}

// ============================================
// CENTER EXPAND (CTA 65)
// ============================================

export function Cta65Thumbnail() {
    return (
        <Thumb label="Expand + Btns">
            <Maximize2 className="w-4 h-4 text-gray-400" />
            <AlignCenter className="w-3.5 h-3.5 text-gray-400" />
            <div className="w-full h-3 bg-gray-200" />
        </Thumb>
    )
}
