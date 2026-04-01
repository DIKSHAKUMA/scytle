/**
 * Hero section few-shot examples — inspired by Relume Hero Headers.
 * These are clean Tailwind HTML skeletons for the AI to use as design reference.
 * Each represents a distinct layout archetype.
 */

/** Split hero: text left, image right (Relume Header 1-4 pattern) */
export const HERO_SPLIT = `<section class="bg-[{{theme.bg}}]">
  <div class="mx-auto max-w-[1440px] px-16 py-28">
    <div class="grid grid-cols-2 items-center gap-20">
      <div class="flex flex-col gap-6">
        <p class="text-sm font-semibold tracking-wider uppercase text-[{{theme.accent}}]">Tagline</p>
        <h1 class="text-[56px] leading-[1.1] font-bold text-[{{theme.text}}]">Medium length hero headline goes here</h1>
        <p class="text-lg leading-relaxed text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
        <div class="flex gap-4 mt-4">
          <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-[{{theme.accent}}] text-white font-medium">Get Started</a>
          <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-current text-[{{theme.text}}] font-medium">Learn More</a>
        </div>
      </div>
      <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-[{{theme.secondary}}]">
        <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>`

/** Centered hero: text centered with image below (Relume Header 5-8 pattern) */
export const HERO_CENTERED = `<section class="bg-[{{theme.bg}}]">
  <div class="mx-auto max-w-[1440px] px-16 py-28">
    <div class="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
      <p class="text-sm font-semibold tracking-wider uppercase text-[{{theme.accent}}]">Tagline</p>
      <h1 class="text-[56px] leading-[1.1] font-bold text-[{{theme.text}}]">Medium length hero headline goes here</h1>
      <p class="text-lg leading-relaxed text-[{{theme.text}}] opacity-70 max-w-2xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
      <div class="flex gap-4 mt-4">
        <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-[{{theme.accent}}] text-white font-medium">Get Started</a>
        <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-current text-[{{theme.text}}] font-medium">Learn More</a>
      </div>
    </div>
    <div class="mt-20 aspect-[16/9] rounded-2xl overflow-hidden bg-[{{theme.secondary}}]">
      <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
    </div>
  </div>
</section>`

/** Full-bleed hero: dark background with overlay image (Relume Header 30+ pattern) */
export const HERO_FULLBLEED = `<section class="relative min-h-[900px] flex items-center bg-[{{theme.text}}]">
  <div class="absolute inset-0">
    <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover opacity-40" />
  </div>
  <div class="relative mx-auto max-w-[1440px] px-16 py-28 w-full">
    <div class="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
      <h1 class="text-[56px] leading-[1.1] font-bold text-white">Medium length hero headline goes here</h1>
      <p class="text-lg leading-relaxed text-white opacity-80 max-w-2xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
      <div class="flex gap-4 mt-4">
        <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-[{{theme.accent}}] text-white font-medium">Get Started</a>
        <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-white text-white font-medium">Learn More</a>
      </div>
    </div>
  </div>
</section>`

export const HERO_EXAMPLES = [HERO_SPLIT, HERO_CENTERED, HERO_FULLBLEED]
