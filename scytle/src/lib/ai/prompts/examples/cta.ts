/**
 * CTA section few-shot examples — inspired by Relume CTA layouts.
 */

export const CTA_CENTERED = `<section class="bg-[{{theme.accent}}] py-24">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
      <h2 class="text-[40px] leading-[1.15] font-bold text-white">Ready to get started?</h2>
      <p class="text-lg text-white opacity-80 max-w-2xl">Join thousands of teams already using our platform to build better products.</p>
      <div class="flex gap-4 mt-4">
        <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-white text-[{{theme.accent}}] font-medium">Get Started Free</a>
        <a href="#" class="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-white text-white font-medium">Talk to Sales</a>
      </div>
    </div>
  </div>
</section>`

export const CTA_EXAMPLES = [CTA_CENTERED]
