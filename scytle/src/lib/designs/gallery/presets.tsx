'use client'

/**
 * Gallery Presets — 28 named snapshots for all gallery families.
 */

import { ImageIcon, Maximize2, Eye } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

function Gallery1Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Grid</div><div className="grid grid-cols-3 gap-0.5 flex-1">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-2 h-2 text-gray-300" /></div>))}</div></div>)
}
function Gallery2Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Grid Tight</div><div className="grid grid-cols-2 gap-0.5 flex-1">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-2 h-2 text-gray-300" /></div>))}</div></div>)
}
function Gallery3Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Masonry</div><div className="flex gap-0.5 flex-1"><div className="flex-1 flex flex-col gap-0.5"><div className="flex-[3] bg-gray-100 border border-gray-200 rounded" /><div className="flex-[2] bg-gray-100 border border-gray-200 rounded" /></div><div className="flex-1 flex flex-col gap-0.5"><div className="flex-[2] bg-gray-100 border border-gray-200 rounded" /><div className="flex-[3] bg-gray-100 border border-gray-200 rounded" /></div></div></div>)
}
function Gallery4Thumbnail() {
    return (<div className="w-full h-full bg-white p-1.5 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Carousel</div><div className="flex gap-0.5 flex-1">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-2 h-2 text-gray-300" /></div>))}<div className="w-2 bg-gray-100 border border-gray-200 rounded opacity-40" /></div></div>)
}
function Gallery5Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Lightbox</div><div className="grid grid-cols-3 gap-0.5 flex-1">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><Maximize2 className="w-1.5 h-1.5 text-gray-400" /></div>))}</div></div>)
}
function Gallery6Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Featured</div><div className="flex-1 flex flex-col gap-0.5"><div className="flex-[3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-3 h-3 text-gray-300" /></div><div className="flex gap-0.5 flex-1">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="flex-1 bg-gray-100 border border-gray-200 rounded" />))}</div></div></div>)
}
function Gallery7Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Filmstrip</div><div className="flex-1 flex items-center"><div className="flex gap-0.5 w-full">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex-1 aspect-[3/2] bg-gray-100 border border-gray-200 rounded" />))}</div></div></div>)
}
function Gallery8Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Mosaic</div><div className="flex-1 grid grid-cols-3 grid-rows-2 gap-0.5"><div className="col-span-2 row-span-2 bg-gray-100 border border-gray-200 rounded" /><div className="bg-gray-100 border border-gray-200 rounded" /><div className="bg-gray-100 border border-gray-200 rounded" /></div></div>)
}
function Gallery9Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Slideshow</div><div className="flex-[3] bg-gray-100 border border-gray-200 rounded mb-0.5 flex items-center justify-center"><ImageIcon className="w-3 h-3 text-gray-300" /></div><div className="flex gap-0.5 flex-1">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className={`flex-1 border border-gray-200 rounded ${i === 0 ? 'bg-gray-200' : 'bg-gray-100'}`} />))}</div></div>)
}
function Gallery10Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Collage</div><div className="flex-1 relative"><div className="absolute top-0 left-0 w-[55%] h-[65%] bg-gray-100 border border-gray-200 rounded -rotate-2" /><div className="absolute bottom-0 right-0 w-[55%] h-[65%] bg-gray-100 border border-gray-200 rounded rotate-2" /></div></div>)
}
function Gallery11Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Full Width</div><div className="flex-1 flex flex-col gap-0.5">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-2 h-2 text-gray-300" /></div>))}</div></div>)
}
function Gallery12Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">With Text</div><div className="flex-1 flex flex-col gap-1">{Array.from({ length: 2 }).map((_, i) => (<div key={i} className="flex gap-1 flex-1"><div className="flex-1 bg-gray-100 border border-gray-200 rounded" /><div className="flex-1 flex flex-col justify-center"><div className="h-1 bg-gray-300 rounded w-full mb-0.5" /><div className="h-0.5 bg-gray-200 rounded w-3/4" /></div></div>))}</div></div>)
}
function Gallery13Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Offset</div><div className="flex-1 grid grid-cols-2 gap-0.5"><div className="bg-gray-100 border border-gray-200 rounded mt-2" /><div className="bg-gray-100 border border-gray-200 rounded" /><div className="bg-gray-100 border border-gray-200 rounded" /><div className="bg-gray-100 border border-gray-200 rounded mt-2" /></div></div>)
}
function Gallery14Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Compare</div><div className="flex-1 flex gap-0.5"><div className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[5px] text-gray-400">Before</div><div className="flex-1 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-[5px] text-gray-500">After</div></div></div>)
}
function Gallery15Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Cards</div><div className="grid grid-cols-2 gap-0.5 flex-1">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="bg-white border border-gray-200 rounded shadow-sm p-0.5 flex flex-col"><div className="flex-1 bg-gray-100 rounded mb-0.5" /><div className="h-0.5 bg-gray-200 rounded w-3/4" /></div>))}</div></div>)
}
function Gallery16Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Hover</div><div className="grid grid-cols-3 gap-0.5 flex-1">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className={`border border-gray-200 rounded flex items-center justify-center ${i === 1 ? 'bg-gray-800' : 'bg-gray-100'}`}>{i === 1 && <Eye className="w-1.5 h-1.5 text-white" />}</div>))}</div></div>)
}
function Gallery17Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Magazine</div><div className="flex-1 grid grid-cols-3 grid-rows-2 gap-0.5"><div className="col-span-2 row-span-2 bg-gray-100 border border-gray-200 rounded" /><div className="bg-gray-100 border border-gray-200 rounded" /><div className="bg-gray-100 border border-gray-200 rounded" /></div></div>)
}
function Gallery18Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Split</div><div className="flex-1 flex gap-1"><div className="flex-1 bg-gray-100 border border-gray-200 rounded" /><div className="flex-1 flex flex-col justify-center gap-0.5"><div className="h-1 bg-gray-300 rounded w-full" /><div className="h-0.5 bg-gray-200 rounded w-2/3" /></div></div></div>)
}
function Gallery19Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Minimal</div><div className="flex-1 grid grid-cols-2 gap-2 p-1">{Array.from({ length: 2 }).map((_, i) => (<div key={i} className="bg-gray-50 border border-gray-100 rounded flex items-center justify-center"><ImageIcon className="w-2 h-2 text-gray-200" /></div>))}</div></div>)
}
function Gallery20Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Numbered</div><div className="grid grid-cols-2 gap-0.5 flex-1">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="bg-gray-100 border border-gray-200 rounded relative flex items-center justify-center"><span className="absolute top-0.5 left-0.5 text-[5px] font-bold text-gray-500 bg-white rounded-full w-2.5 h-2.5 flex items-center justify-center">{i + 1}</span></div>))}</div></div>)
}
function Gallery21Thumbnail() {
    return (<div className="w-full h-full bg-gray-50 p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Polaroid</div><div className="flex-1 flex gap-1 items-center justify-center">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className={`bg-white shadow-sm p-0.5 pb-2 ${i === 0 ? '-rotate-3' : i === 2 ? 'rotate-2' : '-rotate-1'}`}><div className="w-5 h-5 bg-gray-100 border border-gray-200" /></div>))}</div></div>)
}
function Gallery22Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Portrait</div><div className="grid grid-cols-3 gap-0.5 flex-1">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-1.5 h-1.5 text-gray-300" /></div>))}</div></div>)
}
function Gallery23Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Panoramic</div><div className="flex-1 flex flex-col gap-0.5 justify-center">{Array.from({ length: 2 }).map((_, i) => (<div key={i} className="h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-2 h-2 text-gray-300" /></div>))}</div></div>)
}
function Gallery24Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Scattered</div><div className="flex-1 relative"><div className="absolute top-1 left-0 w-[45%] h-[50%] bg-gray-100 border border-gray-200 rounded -rotate-3" /><div className="absolute top-0 right-0 w-[40%] h-[45%] bg-gray-100 border border-gray-200 rounded rotate-2" /><div className="absolute bottom-0 left-2 w-[42%] h-[48%] bg-gray-100 border border-gray-200 rounded rotate-1" /></div></div>)
}
function Gallery25Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Stacked</div><div className="flex-1 flex items-center justify-center relative"><div className="absolute w-10 h-7 bg-gray-200 border border-gray-300 rounded translate-x-1 translate-y-1" /><div className="absolute w-10 h-7 bg-gray-100 border border-gray-200 rounded" /></div></div>)
}
function Gallery26Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Tabs</div><div className="flex gap-1 mb-1"><div className="h-1.5 w-4 bg-gray-800 rounded-full" /><div className="h-1.5 w-4 bg-gray-200 rounded-full" /><div className="h-1.5 w-4 bg-gray-200 rounded-full" /></div><div className="grid grid-cols-3 gap-0.5 flex-1">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-gray-100 border border-gray-200 rounded" />))}</div></div>)
}
function Gallery27Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Zigzag</div><div className="flex-1 flex flex-col gap-0.5"><div className="flex-1 bg-gray-100 border border-gray-200 rounded w-[60%]" /><div className="flex-1 bg-gray-100 border border-gray-200 rounded w-[60%] ml-auto" /><div className="flex-1 bg-gray-100 border border-gray-200 rounded w-[60%]" /></div></div>)
}
function Gallery28Thumbnail() {
    return (<div className="w-full h-full bg-white p-2 flex flex-col"><div className="text-[6px] font-semibold text-gray-800 mb-1">Banner</div><div className="flex-1 flex flex-col gap-0.5">{Array.from({ length: 2 }).map((_, i) => (<div key={i} className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-end p-0.5"><div className="h-1 bg-gray-400/60 rounded w-3/4" /></div>))}</div></div>)
}

// ===== PRESETS =====

export const Gallery1Preset: DesignPreset = { id: 'gallery-1', familyId: 'gallery-grid', name: 'Gallery 1', description: '3-column uniform grid', controls: { columns: '3', gap: 'normal', showCaptions: false }, Thumbnail: Gallery1Thumbnail }
export const Gallery2Preset: DesignPreset = { id: 'gallery-2', familyId: 'gallery-grid', name: 'Gallery 2', description: '2-column tight grid with captions', controls: { columns: '2', gap: 'tight', showCaptions: true }, Thumbnail: Gallery2Thumbnail }
export const Gallery3Preset: DesignPreset = { id: 'gallery-3', familyId: 'gallery-masonry', name: 'Gallery 3', description: '3-column masonry layout', controls: { columns: '3', showCaptions: false }, Thumbnail: Gallery3Thumbnail }
export const Gallery4Preset: DesignPreset = { id: 'gallery-4', familyId: 'gallery-carousel', name: 'Gallery 4', description: 'Carousel with arrows and dots', controls: { showArrows: true, showDots: true, showCaption: false }, Thumbnail: Gallery4Thumbnail }
export const Gallery5Preset: DesignPreset = { id: 'gallery-5', familyId: 'gallery-lightbox', name: 'Gallery 5', description: 'Grid with lightbox overlay', controls: { columns: '3', overlayStyle: 'icon' }, Thumbnail: Gallery5Thumbnail }
export const Gallery6Preset: DesignPreset = { id: 'gallery-6', familyId: 'gallery-featured', name: 'Gallery 6', description: 'Hero image with thumbnails', controls: { thumbnailCount: '4', layout: 'below' }, Thumbnail: Gallery6Thumbnail }
export const Gallery7Preset: DesignPreset = { id: 'gallery-7', familyId: 'gallery-filmstrip', name: 'Gallery 7', description: 'Horizontal filmstrip', controls: { height: 'medium', showCaptions: false }, Thumbnail: Gallery7Thumbnail }
export const Gallery8Preset: DesignPreset = { id: 'gallery-8', familyId: 'gallery-mosaic', name: 'Gallery 8', description: 'Mixed-size mosaic tiles', controls: { pattern: 'hero-grid', showCaptions: false }, Thumbnail: Gallery8Thumbnail }
export const Gallery9Preset: DesignPreset = { id: 'gallery-9', familyId: 'gallery-slideshow', name: 'Gallery 9', description: 'Slideshow with thumbnails', controls: { showArrows: true, showThumbnails: true, aspectRatio: 'wide' }, Thumbnail: Gallery9Thumbnail }
export const Gallery10Preset: DesignPreset = { id: 'gallery-10', familyId: 'gallery-collage', name: 'Gallery 10', description: 'Creative overlapping collage', controls: { style: 'overlap' }, Thumbnail: Gallery10Thumbnail }
export const Gallery11Preset: DesignPreset = { id: 'gallery-11', familyId: 'gallery-fullwidth', name: 'Gallery 11', description: 'Full-bleed stacked images', controls: { spacing: 'small', showCaptions: true }, Thumbnail: Gallery11Thumbnail }
export const Gallery12Preset: DesignPreset = { id: 'gallery-12', familyId: 'gallery-with-text', name: 'Gallery 12', description: 'Images with side text', controls: { layout: 'side', imagePosition: 'left' }, Thumbnail: Gallery12Thumbnail }
export const Gallery13Preset: DesignPreset = { id: 'gallery-13', familyId: 'gallery-offset', name: 'Gallery 13', description: 'Staggered offset grid', controls: { columns: '2', offsetAmount: 'large', showCaptions: true }, Thumbnail: Gallery13Thumbnail }
export const Gallery14Preset: DesignPreset = { id: 'gallery-14', familyId: 'gallery-before-after', name: 'Gallery 14', description: 'Side-by-side comparison', controls: { layout: 'side', showLabels: true }, Thumbnail: Gallery14Thumbnail }
export const Gallery15Preset: DesignPreset = { id: 'gallery-15', familyId: 'gallery-card', name: 'Gallery 15', description: 'Card-style with metadata', controls: { columns: '3', showCategory: true, cardStyle: 'shadow' }, Thumbnail: Gallery15Thumbnail }
export const Gallery16Preset: DesignPreset = { id: 'gallery-16', familyId: 'gallery-hover', name: 'Gallery 16', description: 'Grid with hover-reveal captions', controls: { columns: '3', overlayColor: 'dark' }, Thumbnail: Gallery16Thumbnail }
export const Gallery17Preset: DesignPreset = { id: 'gallery-17', familyId: 'gallery-magazine', name: 'Gallery 17', description: 'Editorial magazine layout', controls: { style: 'editorial', showMeta: true }, Thumbnail: Gallery17Thumbnail }
export const Gallery18Preset: DesignPreset = { id: 'gallery-18', familyId: 'gallery-split', name: 'Gallery 18', description: 'Alternating image-text split', controls: { imagePosition: 'left', showDescription: true }, Thumbnail: Gallery18Thumbnail }
export const Gallery19Preset: DesignPreset = { id: 'gallery-19', familyId: 'gallery-minimal', name: 'Gallery 19', description: 'Clean minimal with whitespace', controls: { columns: '2', showCaption: true }, Thumbnail: Gallery19Thumbnail }
export const Gallery20Preset: DesignPreset = { id: 'gallery-20', familyId: 'gallery-numbered', name: 'Gallery 20', description: 'Grid with number badges', controls: { columns: '2', showCaption: true }, Thumbnail: Gallery20Thumbnail }
export const Gallery21Preset: DesignPreset = { id: 'gallery-21', familyId: 'gallery-polaroid', name: 'Gallery 21', description: 'Tilted polaroid-style cards', controls: { columns: '3', tilt: true }, Thumbnail: Gallery21Thumbnail }
export const Gallery22Preset: DesignPreset = { id: 'gallery-22', familyId: 'gallery-portrait', name: 'Gallery 22', description: 'Tall portrait orientation', controls: { columns: '3', showCaption: true }, Thumbnail: Gallery22Thumbnail }
export const Gallery23Preset: DesignPreset = { id: 'gallery-23', familyId: 'gallery-panoramic', name: 'Gallery 23', description: 'Ultra-wide landscape images', controls: { spacing: 'normal', showCaption: true }, Thumbnail: Gallery23Thumbnail }
export const Gallery24Preset: DesignPreset = { id: 'gallery-24', familyId: 'gallery-scattered', name: 'Gallery 24', description: 'Creative scattered placement', controls: { density: 'normal', showCaption: true }, Thumbnail: Gallery24Thumbnail }
export const Gallery25Preset: DesignPreset = { id: 'gallery-25', familyId: 'gallery-stacked', name: 'Gallery 25', description: 'Overlapping stacked cards', controls: { style: 'cards', showCaption: true }, Thumbnail: Gallery25Thumbnail }
export const Gallery26Preset: DesignPreset = { id: 'gallery-26', familyId: 'gallery-tabs', name: 'Gallery 26', description: 'Category-tabbed gallery', controls: { columns: '3', tabStyle: 'underline' }, Thumbnail: Gallery26Thumbnail }
export const Gallery27Preset: DesignPreset = { id: 'gallery-27', familyId: 'gallery-zigzag', name: 'Gallery 27', description: 'Alternating zigzag layout', controls: { imageSize: 'medium', showCaption: true }, Thumbnail: Gallery27Thumbnail }
export const Gallery28Preset: DesignPreset = { id: 'gallery-28', familyId: 'gallery-banner', name: 'Gallery 28', description: 'Full-width hero banners', controls: { height: 'medium', showOverlay: true }, Thumbnail: Gallery28Thumbnail }

export const galleryPresets: DesignPreset[] = [
    Gallery1Preset, Gallery2Preset, Gallery3Preset, Gallery4Preset,
    Gallery5Preset, Gallery6Preset, Gallery7Preset, Gallery8Preset,
    Gallery9Preset, Gallery10Preset, Gallery11Preset, Gallery12Preset,
    Gallery13Preset, Gallery14Preset, Gallery15Preset, Gallery16Preset,
    Gallery17Preset, Gallery18Preset, Gallery19Preset, Gallery20Preset,
    Gallery21Preset, Gallery22Preset, Gallery23Preset, Gallery24Preset,
    Gallery25Preset, Gallery26Preset, Gallery27Preset, Gallery28Preset,
]
