/**
 * Footer section few-shot examples — inspired by Relume Footer layouts.
 */

export const FOOTER_COLUMNS = `<footer class="bg-[{{theme.text}}] py-20">
  <div class="mx-auto max-w-[1440px] px-16">
    <div class="grid grid-cols-5 gap-8 mb-16">
      <div class="col-span-2">
        <h3 class="text-xl font-bold text-white mb-4">Brand</h3>
        <p class="text-sm text-white opacity-60 max-w-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h4>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="text-sm text-white opacity-60">Features</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Pricing</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Integrations</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Changelog</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="text-sm text-white opacity-60">About</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Blog</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Careers</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="text-sm text-white opacity-60">Privacy</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Terms</a></li>
          <li><a href="#" class="text-sm text-white opacity-60">Cookies</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10 pt-8 flex items-center justify-between">
      <p class="text-sm text-white opacity-40">© 2026 Brand. All rights reserved.</p>
      <div class="flex gap-4">
        <a href="#" class="text-white opacity-40">Twitter</a>
        <a href="#" class="text-white opacity-40">LinkedIn</a>
        <a href="#" class="text-white opacity-40">GitHub</a>
      </div>
    </div>
  </div>
</footer>`

export const FOOTER_EXAMPLES = [FOOTER_COLUMNS]
