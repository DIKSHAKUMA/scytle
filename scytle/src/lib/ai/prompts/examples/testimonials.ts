/**
 * Testimonials section few-shot examples — inspired by Relume Testimonials layouts.
 */

/** Card mosaic: testimonial cards in a grid (Relume Testimonials 1-4) */
export const TESTIMONIALS_GRID = `<section class="bg-[{{theme.secondary}}] py-28">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="text-center mb-16">
      <h2 class="text-[40px] leading-[1.15] font-bold text-[{{theme.text}}] mb-4">What our customers say</h2>
      <p class="text-lg text-[{{theme.text}}] opacity-70 max-w-2xl mx-auto">Trusted by thousands of teams worldwide.</p>
    </div>
    <div class="grid grid-cols-3 gap-8">
      <div class="rounded-2xl bg-[{{theme.bg}}] p-8 flex flex-col gap-6">
        <div class="flex gap-1">
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
        </div>
        <p class="text-base leading-relaxed text-[{{theme.text}}] opacity-80">"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."</p>
        <div class="flex items-center gap-4 mt-auto">
          <div class="w-12 h-12 rounded-full bg-[{{theme.secondary}}] overflow-hidden">
            <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="font-semibold text-[{{theme.text}}]">Jane Cooper</p>
            <p class="text-sm text-[{{theme.text}}] opacity-60">CEO, Acme Inc</p>
          </div>
        </div>
      </div>
      <div class="rounded-2xl bg-[{{theme.bg}}] p-8 flex flex-col gap-6">
        <div class="flex gap-1">
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
        </div>
        <p class="text-base leading-relaxed text-[{{theme.text}}] opacity-80">"Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat."</p>
        <div class="flex items-center gap-4 mt-auto">
          <div class="w-12 h-12 rounded-full bg-[{{theme.secondary}}] overflow-hidden">
            <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="font-semibold text-[{{theme.text}}]">Robert Fox</p>
            <p class="text-sm text-[{{theme.text}}] opacity-60">CTO, Widget Co</p>
          </div>
        </div>
      </div>
      <div class="rounded-2xl bg-[{{theme.bg}}] p-8 flex flex-col gap-6">
        <div class="flex gap-1">
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
          <span class="text-[{{theme.accent}}] text-lg">★</span>
        </div>
        <p class="text-base leading-relaxed text-[{{theme.text}}] opacity-80">"Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."</p>
        <div class="flex items-center gap-4 mt-auto">
          <div class="w-12 h-12 rounded-full bg-[{{theme.secondary}}] overflow-hidden">
            <img src="{{image.url}}" alt="{{image.alt}}" class="w-full h-full object-cover" />
          </div>
          <div>
            <p class="font-semibold text-[{{theme.text}}]">Sarah Johnson</p>
            <p class="text-sm text-[{{theme.text}}] opacity-60">VP Design, StartupXYZ</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`

export const TESTIMONIALS_EXAMPLES = [TESTIMONIALS_GRID]
