/**
 * CTA Thumbnails — Icon placeholder previews for the sidebar
 *
 * Render inside an aspect-video container in the component library panel.
 * Will be replaced with actual thumbnail images from Figma later.
 */

import { AlignLeft, ImageIcon, CreditCard, Maximize2, Mail } from 'lucide-react'

// ============================================
// CTA 1 — Normal + Button
// ============================================

export function Cta1Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">CTA + Image</span>
        </div>
    )
}

// ============================================
// CTA 2 — Normal + Form
// ============================================

export function Cta2Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Form + Image</span>
        </div>
    )
}

// ============================================
// CTA 39 — Card + Button
// ============================================

export function Cta39Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Card + Image</span>
        </div>
    )
}

// ============================================
// CTA 40 — Card + Form
// ============================================

export function Cta40Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Card + Form</span>
        </div>
    )
}

// ============================================
// CTA 59 — Expand + Button
// ============================================

export function Cta59Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Expand + Image</span>
        </div>
    )
}

// ============================================
// CTA 60 — Expand + Form
// ============================================

export function Cta60Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Expand + Form</span>
        </div>
    )
}
