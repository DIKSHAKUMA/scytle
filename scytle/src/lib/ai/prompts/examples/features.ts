/**
 * Features section few-shot examples — inspired by Relume Features layouts.
 * Distinct layout archetypes for feature showcases.
 */

/** Bento grid: mixed-size feature cards (Relume Layout 1-4) */
export const FEATURES_BENTO = `<section class="bg-[{{theme.bg}}] py-28">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold tracking-wider uppercase text-[{{theme.accent}}] mb-4">Features</p>
      <h2 class="text-[40px] leading-[1.15] font-bold text-[{{theme.text}}] mb-4">Powerful features for modern teams</h2>
      <p class="text-lg text-[{{theme.text}}] opacity-70 max-w-2xl mx-auto">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
    <div class="grid grid-cols-3 gap-8">
      <div class="col-span-2 rounded-2xl bg-[{{theme.secondary}}] p-10 flex flex-col justify-between min-h-[360px]">
        <div>
          <div class="w-12 h-12 rounded-xl bg-[{{theme.accent}}] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="text-2xl font-bold text-[{{theme.text}}] mb-3">Lightning fast performance</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.</p>
        </div>
      </div>
      <div class="rounded-2xl bg-[{{theme.secondary}}] p-10 flex flex-col justify-between min-h-[360px]">
        <div>
          <div class="w-12 h-12 rounded-xl bg-[{{theme.accent}}] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 class="text-2xl font-bold text-[{{theme.text}}] mb-3">Secure by default</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
      <div class="rounded-2xl bg-[{{theme.secondary}}] p-10 flex flex-col justify-between min-h-[360px]">
        <div>
          <div class="w-12 h-12 rounded-xl bg-[{{theme.accent}}] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
          </div>
          <h3 class="text-2xl font-bold text-[{{theme.text}}] mb-3">Flexible layouts</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
      <div class="col-span-2 rounded-2xl bg-[{{theme.secondary}}] p-10 flex flex-col justify-between min-h-[360px]">
        <div>
          <div class="w-12 h-12 rounded-xl bg-[{{theme.accent}}] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <h3 class="text-2xl font-bold text-[{{theme.text}}] mb-3">Advanced analytics</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.</p>
        </div>
      </div>
    </div>
  </div>
</section>`

/** Zigzag: alternating text/image rows (Relume Layout 5-8) */
export const FEATURES_ZIGZAG = `<section class="bg-[{{theme.bg}}] py-28">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="text-center mb-20">
      <p class="text-sm font-semibold tracking-wider uppercase text-[{{theme.accent}}] mb-4">Features</p>
      <h2 class="text-[40px] leading-[1.15] font-bold text-[{{theme.text}}]">Everything you need</h2>
    </div>
    <div class="flex flex-col gap-24">
      <div class="grid grid-cols-2 items-center gap-20">
        <div class="flex flex-col gap-4">
          <h3 class="text-3xl font-bold text-[{{theme.text}}]">Built for scale</h3>
          <p class="text-base leading-relaxed text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
          <ul class="flex flex-col gap-3 mt-2">
            <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="w-5 h-5 rounded-full bg-[{{theme.accent}}] flex items-center justify-center text-white text-xs">✓</span> Feature benefit one</li>
            <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="w-5 h-5 rounded-full bg-[{{theme.accent}}] flex items-center justify-center text-white text-xs">✓</span> Feature benefit two</li>
            <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="w-5 h-5 rounded-full bg-[{{theme.accent}}] flex items-center justify-center text-white text-xs">✓</span> Feature benefit three</li>
          </ul>
        </div>
        <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-[{{theme.secondary}}]">
          <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
        </div>
      </div>
      <div class="grid grid-cols-2 items-center gap-20">
        <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-[{{theme.secondary}}]">
          <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col gap-4">
          <h3 class="text-3xl font-bold text-[{{theme.text}}]">Intuitive design</h3>
          <p class="text-base leading-relaxed text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
        </div>
      </div>
    </div>
  </div>
</section>`

export const FEATURES_EXAMPLES = [FEATURES_BENTO, FEATURES_ZIGZAG]
