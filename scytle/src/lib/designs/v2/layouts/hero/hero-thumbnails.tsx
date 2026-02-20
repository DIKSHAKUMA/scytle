/**
 * Hero Thumbnails — Miniature preview components for the sidebar
 *
 * These render at ~200px width in the component library panel.
 * Styled to visually match the hero layouts at a glance.
 */

// ============================================
// Hero 44 Thumbnail — Left-aligned
// ============================================

export function Hero44Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center space-y-1.5">
            <div className="text-[5px] text-gray-400 uppercase tracking-wide">Tagline</div>
            <div className="text-[8px] font-semibold text-gray-800 leading-tight max-w-[75%]">
                Medium length hero headline goes here
            </div>
            <div className="text-[5px] text-gray-500 leading-tight max-w-[75%]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.
            </div>
            <div className="flex gap-1 mt-1">
                <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5 rounded-sm">
                    Button
                </div>
                <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5 rounded-sm">
                    Button
                </div>
            </div>
        </div>
    )
}

// ============================================
// Hero 57 Thumbnail — Split two-column
// ============================================

export function Hero57Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2 items-center">
            <div className="flex-1 space-y-1">
                <div className="text-[5px] text-gray-400 uppercase tracking-wide">Tagline</div>
                <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                    Medium length hero headline goes here
                </div>
            </div>
            <div className="flex-1 space-y-1">
                <div className="text-[5px] text-gray-500 leading-tight">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
                <div className="flex gap-1">
                    <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5 rounded-sm">
                        Button
                    </div>
                    <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5 rounded-sm">
                        Button
                    </div>
                </div>
            </div>
        </div>
    )
}
