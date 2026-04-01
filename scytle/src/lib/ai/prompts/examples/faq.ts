/**
 * FAQ section few-shot examples — inspired by Relume FAQ layouts.
 */

export const FAQ_ACCORDION = `<section class="bg-[{{theme.bg}}] py-28">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="grid grid-cols-2 gap-20">
      <div>
        <p class="text-sm font-semibold tracking-wider uppercase text-[{{theme.accent}}] mb-4">FAQ</p>
        <h2 class="text-[40px] leading-[1.15] font-bold text-[{{theme.text}}] mb-4">Frequently asked questions</h2>
        <p class="text-lg text-[{{theme.text}}] opacity-70">Everything you need to know about the product.</p>
      </div>
      <div class="flex flex-col divide-y divide-[{{theme.text}}]/10">
        <div class="py-6">
          <h3 class="text-lg font-semibold text-[{{theme.text}}] mb-3">What is your refund policy?</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
        </div>
        <div class="py-6">
          <h3 class="text-lg font-semibold text-[{{theme.text}}] mb-3">How do I change my plan?</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
        </div>
        <div class="py-6">
          <h3 class="text-lg font-semibold text-[{{theme.text}}] mb-3">Can I cancel my subscription?</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
        </div>
        <div class="py-6">
          <h3 class="text-lg font-semibold text-[{{theme.text}}] mb-3">Do you offer discounts?</h3>
          <p class="text-base text-[{{theme.text}}] opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
        </div>
      </div>
    </div>
  </div>
</section>`

export const FAQ_EXAMPLES = [FAQ_ACCORDION]
