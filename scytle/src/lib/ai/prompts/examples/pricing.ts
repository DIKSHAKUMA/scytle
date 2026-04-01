/**
 * Pricing section few-shot examples — inspired by Relume Pricing layouts.
 */

/** Three-column pricing cards with highlighted plan (Relume Pricing 1-4) */
export const PRICING_CARDS = `<section class="bg-[{{theme.bg}}] py-28">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold tracking-wider uppercase text-[{{theme.accent}}] mb-4">Pricing</p>
      <h2 class="text-[40px] leading-[1.15] font-bold text-[{{theme.text}}] mb-4">Simple, transparent pricing</h2>
      <p class="text-lg text-[{{theme.text}}] opacity-70 max-w-2xl mx-auto">Choose the plan that works for you.</p>
    </div>
    <div class="grid grid-cols-3 gap-8">
      <div class="rounded-2xl border border-[{{theme.text}}]/10 p-10 flex flex-col">
        <h3 class="text-xl font-bold text-[{{theme.text}}] mb-2">Basic</h3>
        <p class="text-sm text-[{{theme.text}}] opacity-60 mb-6">Perfect for getting started</p>
        <div class="flex items-baseline gap-1 mb-8">
          <span class="text-[48px] font-bold text-[{{theme.text}}]">$19</span>
          <span class="text-base text-[{{theme.text}}] opacity-60">/mo</span>
        </div>
        <ul class="flex flex-col gap-4 mb-10 flex-1">
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> Feature one</li>
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> Feature two</li>
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> Feature three</li>
        </ul>
        <a href="#" class="block text-center px-7 py-3.5 rounded-lg border border-[{{theme.text}}]/20 text-[{{theme.text}}] font-medium">Get Started</a>
      </div>
      <div class="rounded-2xl bg-[{{theme.accent}}] p-10 flex flex-col text-white">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xl font-bold">Professional</h3>
          <span class="text-xs font-semibold px-3 py-1 rounded-full bg-white/20">Popular</span>
        </div>
        <p class="text-sm opacity-80 mb-6">Best for growing teams</p>
        <div class="flex items-baseline gap-1 mb-8">
          <span class="text-[48px] font-bold">$49</span>
          <span class="text-base opacity-80">/mo</span>
        </div>
        <ul class="flex flex-col gap-4 mb-10 flex-1">
          <li class="flex items-center gap-3"><span>✓</span> Everything in Basic</li>
          <li class="flex items-center gap-3"><span>✓</span> Advanced features</li>
          <li class="flex items-center gap-3"><span>✓</span> Priority support</li>
          <li class="flex items-center gap-3"><span>✓</span> Custom integrations</li>
        </ul>
        <a href="#" class="block text-center px-7 py-3.5 rounded-lg bg-white text-[{{theme.accent}}] font-medium">Get Started</a>
      </div>
      <div class="rounded-2xl border border-[{{theme.text}}]/10 p-10 flex flex-col">
        <h3 class="text-xl font-bold text-[{{theme.text}}] mb-2">Enterprise</h3>
        <p class="text-sm text-[{{theme.text}}] opacity-60 mb-6">For large organizations</p>
        <div class="flex items-baseline gap-1 mb-8">
          <span class="text-[48px] font-bold text-[{{theme.text}}]">$99</span>
          <span class="text-base text-[{{theme.text}}] opacity-60">/mo</span>
        </div>
        <ul class="flex flex-col gap-4 mb-10 flex-1">
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> Everything in Pro</li>
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> Dedicated support</li>
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> SLA guarantee</li>
          <li class="flex items-center gap-3 text-[{{theme.text}}]"><span class="text-[{{theme.accent}}]">✓</span> Custom contracts</li>
        </ul>
        <a href="#" class="block text-center px-7 py-3.5 rounded-lg border border-[{{theme.text}}]/20 text-[{{theme.text}}] font-medium">Contact Sales</a>
      </div>
    </div>
  </div>
</section>`

export const PRICING_EXAMPLES = [PRICING_CARDS]
