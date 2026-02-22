/**
 * CTA-B Thumbnails — Icon placeholder previews for the sidebar
 *
 * Render inside an aspect-video container in the component library panel.
 * Will be replaced with actual thumbnail images from Figma later.
 *
 * Visual cues for each variant:
 *   Text-Only (13–18):  Two text columns only, no image icon
 *   Stacked   (21–22):  Text columns + image below
 *   Expand    (61–62):  Full-width indicator + image below
 */

import { AlignLeft, ImageIcon, Columns2, Mail, Video, Maximize2 } from 'lucide-react'

// ============================================
// CTA 13 — Text-Only, No BG, Button
// ============================================

export function Cta13Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-gray-400" />
                <AlignLeft className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Text + Buttons</span>
        </div>
    )
}

// ============================================
// CTA 14 — Text-Only, No BG, Form
// ============================================

export function Cta14Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-gray-400" />
                <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Text + Form</span>
        </div>
    )
}

// ============================================
// CTA 15 — Text-Only, BG Image, Button
// ============================================

export function Cta15Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">BG Image + Btns</span>
        </div>
    )
}

// ============================================
// CTA 16 — Text-Only, BG Image, Form
// ============================================

export function Cta16Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                <Mail className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">BG Image + Form</span>
        </div>
    )
}

// ============================================
// CTA 17 — Text-Only, BG Video, Button
// ============================================

export function Cta17Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-gray-400" />
                <Video className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">BG Video + Btns</span>
        </div>
    )
}

// ============================================
// CTA 18 — Text-Only, BG Video, Form
// ============================================

export function Cta18Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Columns2 className="w-4 h-4 text-gray-400" />
                <Video className="w-3.5 h-3.5 text-gray-400" />
                <Mail className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">BG Video + Form</span>
        </div>
    )
}

// ============================================
// CTA 21 — Stacked, Default, Button
// ============================================

export function Cta21Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-gray-400" />
            </div>
            <div className="w-8 h-4 bg-gray-200 rounded-sm" />
            <span className="text-[10px] text-gray-400 font-medium">Stacked + Btns</span>
        </div>
    )
}

// ============================================
// CTA 22 — Stacked, Default, Form
// ============================================

export function Cta22Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="w-8 h-4 bg-gray-200 rounded-sm" />
            <span className="text-[10px] text-gray-400 font-medium">Stacked + Form</span>
        </div>
    )
}

// ============================================
// CTA 61 — Expand, Button
// ============================================

export function CtaB61Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="w-full h-3 bg-gray-200" />
            <span className="text-[10px] text-gray-400 font-medium">Expand + Btns</span>
        </div>
    )
}

// ============================================
// CTA 62 — Expand, Form
// ============================================

export function CtaB62Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                <Mail className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="w-full h-3 bg-gray-200" />
            <span className="text-[10px] text-gray-400 font-medium">Expand + Form</span>
        </div>
    )
}
