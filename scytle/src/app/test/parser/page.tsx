'use client'

import { useState, useEffect, useCallback, useMemo, useRef, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { parseHtmlToNodes } from '@/lib/parser/html-to-nodes'
import { NodeRenderer } from '@/components/editor'
import { findNodeById } from '@/types/canvas'
import type { FrameNode, ScytleNode } from '@/types/canvas'
import {
  ChevronRight, ChevronDown, Save, Trash2, Copy, Check,
  ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Columns2,
} from 'lucide-react'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const INTER_FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'

// ============================================================
// Test Presets
// ============================================================

const PRESETS: Record<string, string> = {
  'Margin Spacing': `<div class="flex flex-col gap-2 p-4 bg-gray-50">
  <div class="m-4 p-4 bg-blue-100 rounded-lg">
    <p class="text-sm text-blue-800">m-4 (16px all sides)</p>
  </div>
  <div class="mx-8 my-2 p-4 bg-green-100 rounded-lg">
    <p class="text-sm text-green-800">mx-8 my-2 (32px horizontal, 8px vertical)</p>
  </div>
  <div class="mt-6 mb-2 ml-12 p-4 bg-purple-100 rounded-lg">
    <p class="text-sm text-purple-800">mt-6 mb-2 ml-12 (asymmetric)</p>
  </div>
  <div class="flex flex-row gap-2">
    <div class="flex-1 mr-4 p-3 bg-red-100 rounded">
      <p class="text-xs text-red-800">flex-1 mr-4</p>
    </div>
    <div class="flex-1 ml-4 p-3 bg-orange-100 rounded">
      <p class="text-xs text-orange-800">flex-1 ml-4</p>
    </div>
  </div>
</div>`,

  'Grid Col-Span': `<div class="grid grid-cols-4 gap-4 p-6 bg-white">
  <div class="p-4 bg-blue-100 rounded-lg text-center text-sm font-medium">1 col</div>
  <div class="p-4 bg-blue-100 rounded-lg text-center text-sm font-medium">1 col</div>
  <div class="col-span-2 p-4 bg-indigo-200 rounded-lg text-center text-sm font-medium">col-span-2</div>
  <div class="col-span-3 p-4 bg-purple-200 rounded-lg text-center text-sm font-medium">col-span-3</div>
  <div class="p-4 bg-blue-100 rounded-lg text-center text-sm font-medium">1 col</div>
  <div class="col-span-full p-4 bg-pink-200 rounded-lg text-center text-sm font-medium">col-span-full (entire row)</div>
  <div class="col-span-2 p-4 bg-rose-200 rounded-lg text-center text-sm font-medium">col-span-2</div>
  <div class="col-span-2 p-4 bg-rose-200 rounded-lg text-center text-sm font-medium">col-span-2</div>
</div>`,

  'Section No Padding': `<div class="bg-white">
  <section class="bg-gray-900 text-white">
    <h2 class="text-2xl font-bold">Section with NO padding classes</h2>
    <p class="text-gray-300 mt-2">Should have zero padding, not hardcoded 64/80px</p>
  </section>
  <section class="p-8 bg-blue-50">
    <h2 class="text-2xl font-bold text-blue-900">Section with p-8</h2>
    <p class="text-blue-700 mt-2">Should have exactly 32px padding all sides</p>
  </section>
  <section class="px-4 py-12 bg-green-50">
    <h2 class="text-2xl font-bold text-green-900">Section with px-4 py-12</h2>
    <p class="text-green-700 mt-2">16px horizontal, 48px vertical</p>
  </section>
</div>`,

  'Flex Mixed Widths': `<div class="flex flex-row gap-4 p-6 bg-gray-50">
  <div class="w-1/4 p-4 bg-blue-100 rounded-lg shrink-0">
    <p class="text-sm font-medium">w-1/4 (fixed 25%)</p>
    <p class="text-xs text-gray-500 mt-1">shrink-0</p>
  </div>
  <div class="flex-1 p-4 bg-green-100 rounded-lg">
    <p class="text-sm font-medium">flex-1 (grows)</p>
    <p class="text-xs text-gray-500 mt-1">Takes remaining space</p>
  </div>
  <div class="w-48 p-4 bg-purple-100 rounded-lg shrink-0">
    <p class="text-sm font-medium">w-48 (192px fixed)</p>
    <p class="text-xs text-gray-500 mt-1">shrink-0</p>
  </div>
</div>`,

  'Typography & Line Height': `<div class="flex flex-col gap-6 p-8 bg-white">
  <div>
    <p class="text-xs text-gray-400 mb-1">text-xs (12px / leading 16px)</p>
    <p class="text-xs">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-base (16px / leading 24px)</p>
    <p class="text-base">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-2xl (24px / leading 32px)</p>
    <p class="text-2xl font-bold">The quick brown fox jumps over the lazy dog.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-base leading-tight (1.25x)</p>
    <p class="text-base leading-tight">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-base leading-loose (2x)</p>
    <p class="text-base leading-loose">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.</p>
  </div>
</div>`,

  'Nested Complex Layout': `<div class="flex flex-col bg-white">
  <nav class="flex items-center justify-between px-6 py-4 bg-white shadow">
    <div class="text-xl font-bold text-blue-600">Brand</div>
    <div class="flex items-center gap-6">
      <a class="text-sm text-gray-600">Products</a>
      <a class="text-sm text-gray-600">Pricing</a>
      <a class="text-sm text-gray-600">About</a>
      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">Sign Up</button>
    </div>
  </nav>
  <section class="flex flex-col items-center py-16 px-8 bg-linear-to-br from-blue-600 to-purple-700 text-white">
    <h1 class="text-4xl font-bold mb-4 text-center">Build Something Amazing</h1>
    <p class="text-lg text-center max-w-2xl mb-8 opacity-90">The all-in-one platform for teams.</p>
    <div class="flex gap-4">
      <button class="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold text-sm">Get Started Free</button>
      <button class="px-6 py-3 border-2 border-white rounded-full font-semibold text-sm">Watch Demo</button>
    </div>
  </section>
  <section class="py-16 px-8">
    <h2 class="text-2xl font-bold text-center mb-12">Features</h2>
    <div class="grid grid-cols-3 gap-8">
      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="w-10 h-10 bg-blue-100 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold mb-2">Lightning Fast</h3>
        <p class="text-sm text-gray-600">Built for speed with optimized rendering.</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="w-10 h-10 bg-green-100 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold mb-2">Team Ready</h3>
        <p class="text-sm text-gray-600">Real-time collaboration built-in.</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="w-10 h-10 bg-purple-100 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold mb-2">AI Powered</h3>
        <p class="text-sm text-gray-600">Smart suggestions save hours.</p>
      </div>
    </div>
  </section>
  <footer class="flex items-center justify-between px-8 py-6 bg-gray-900 text-white">
    <p class="text-sm text-gray-400">2026 Brand Inc.</p>
    <div class="flex gap-6">
      <a class="text-sm text-gray-400">Privacy</a>
      <a class="text-sm text-gray-400">Terms</a>
    </div>
  </footer>
</div>`,

  'Card Grid + Margins': `<div class="p-8 bg-gray-100">
  <h2 class="text-2xl font-bold mb-6">Popular Products</h2>
  <div class="grid grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="h-40 bg-linear-to-br from-blue-400 to-blue-600"></div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1">Product One</h3>
        <p class="text-sm text-gray-500 mb-3">A fantastic product with great features.</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-blue-600">$49</span>
          <button class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="h-40 bg-linear-to-br from-green-400 to-green-600"></div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1">Product Two</h3>
        <p class="text-sm text-gray-500 mb-3">Another amazing product for your needs.</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-green-600">$79</span>
          <button class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="h-40 bg-linear-to-br from-purple-400 to-purple-600"></div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1">Product Three</h3>
        <p class="text-sm text-gray-500 mb-3">Premium product with exclusive features.</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-purple-600">$99</span>
          <button class="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

  'Full Landing Page': `<div class="flex flex-col w-full bg-white">
  <!-- Navbar -->
  <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-blue-600 rounded-lg"></div>
      <span class="text-lg font-bold text-gray-900">Acme Inc</span>
    </div>
    <div class="flex items-center gap-8">
      <a class="text-sm font-medium text-gray-600">Products</a>
      <a class="text-sm font-medium text-gray-600">Solutions</a>
      <a class="text-sm font-medium text-gray-600">Pricing</a>
      <a class="text-sm font-medium text-gray-600">Resources</a>
      <a class="text-sm font-medium text-gray-600">Contact</a>
    </div>
    <div class="flex items-center gap-3">
      <button class="px-4 py-2 text-sm font-medium text-gray-700">Log in</button>
      <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">Start Free Trial</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="flex flex-col items-center px-8 py-24 bg-linear-to-br from-slate-50 to-blue-50">
    <div class="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full mb-6">
      <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span class="text-xs font-medium text-blue-700">Now with AI-powered analytics</span>
    </div>
    <h1 class="text-5xl font-bold text-gray-900 text-center mb-6">Build products that<br/>customers love</h1>
    <p class="text-lg text-gray-500 text-center mb-8">The modern platform for product teams to ship faster, measure impact, and iterate with confidence.</p>
    <div class="flex items-center gap-4 mb-12">
      <button class="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg">Get Started Free</button>
      <button class="flex items-center gap-2 px-6 py-3 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg">
        <div class="w-4 h-4 bg-gray-400 rounded-full"></div>
        Watch Demo
      </button>
    </div>
    <div class="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div class="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div class="w-3 h-3 bg-red-400 rounded-full"></div>
        <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
        <div class="w-3 h-3 bg-green-400 rounded-full"></div>
        <span class="text-xs text-gray-400 ml-2">dashboard.acme.com</span>
      </div>
      <img src="https://placehold.co/1200x600/f8fafc/94a3b8?text=Dashboard+Preview" alt="Dashboard" class="w-full" />
    </div>
  </section>

  <!-- Logos Section -->
  <section class="flex flex-col items-center px-8 py-16 bg-gray-50">
    <p class="text-sm font-medium text-gray-400 mb-8">TRUSTED BY 10,000+ COMPANIES WORLDWIDE</p>
    <div class="flex items-center gap-12">
      <div class="w-28 h-8 bg-gray-200 rounded"></div>
      <div class="w-28 h-8 bg-gray-200 rounded"></div>
      <div class="w-28 h-8 bg-gray-200 rounded"></div>
      <div class="w-28 h-8 bg-gray-200 rounded"></div>
      <div class="w-28 h-8 bg-gray-200 rounded"></div>
      <div class="w-28 h-8 bg-gray-200 rounded"></div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="flex flex-col items-center px-8 py-24">
    <span class="text-sm font-semibold text-blue-600 mb-2">FEATURES</span>
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-4">Everything you need to ship faster</h2>
    <p class="text-lg text-gray-500 text-center mb-16">Powerful tools designed for modern product teams</p>
    <div class="grid grid-cols-3 gap-8 w-full">
      <div class="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <div class="w-12 h-12 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
          <div class="w-6 h-6 bg-blue-600 rounded"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
        <p class="text-sm text-gray-500">Track user behavior and product metrics in real-time with our powerful analytics dashboard.</p>
      </div>
      <div class="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <div class="w-12 h-12 bg-emerald-100 rounded-xl mb-6 flex items-center justify-center">
          <div class="w-6 h-6 bg-emerald-600 rounded"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
        <p class="text-sm text-gray-500">Work together seamlessly with real-time editing, comments, and shared workspaces.</p>
      </div>
      <div class="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <div class="w-12 h-12 bg-violet-100 rounded-xl mb-6 flex items-center justify-center">
          <div class="w-6 h-6 bg-violet-600 rounded"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Smart Automation</h3>
        <p class="text-sm text-gray-500">Automate repetitive tasks and workflows with AI-powered automation tools.</p>
      </div>
      <div class="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <div class="w-12 h-12 bg-amber-100 rounded-xl mb-6 flex items-center justify-center">
          <div class="w-6 h-6 bg-amber-600 rounded"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Advanced Security</h3>
        <p class="text-sm text-gray-500">Enterprise-grade security with SOC 2 compliance, SSO, and granular permissions.</p>
      </div>
      <div class="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <div class="w-12 h-12 bg-rose-100 rounded-xl mb-6 flex items-center justify-center">
          <div class="w-6 h-6 bg-rose-600 rounded"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">API & Integrations</h3>
        <p class="text-sm text-gray-500">Connect with 200+ tools including Slack, Jira, GitHub, and Figma.</p>
      </div>
      <div class="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <div class="w-12 h-12 bg-sky-100 rounded-xl mb-6 flex items-center justify-center">
          <div class="w-6 h-6 bg-sky-600 rounded"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
        <p class="text-sm text-gray-500">Build custom dashboards and reports with our drag-and-drop report builder.</p>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="flex items-center justify-center gap-16 px-8 py-20 bg-gray-900">
    <div class="flex flex-col items-center">
      <span class="text-4xl font-bold text-white">10K+</span>
      <span class="text-sm text-gray-400">Active Companies</span>
    </div>
    <div class="w-px h-16 bg-gray-700"></div>
    <div class="flex flex-col items-center">
      <span class="text-4xl font-bold text-white">2M+</span>
      <span class="text-sm text-gray-400">Events Tracked Daily</span>
    </div>
    <div class="w-px h-16 bg-gray-700"></div>
    <div class="flex flex-col items-center">
      <span class="text-4xl font-bold text-white">99.9%</span>
      <span class="text-sm text-gray-400">Uptime SLA</span>
    </div>
    <div class="w-px h-16 bg-gray-700"></div>
    <div class="flex flex-col items-center">
      <span class="text-4xl font-bold text-white">150+</span>
      <span class="text-sm text-gray-400">Countries Served</span>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="flex flex-col items-center px-8 py-24">
    <span class="text-sm font-semibold text-blue-600 mb-2">TESTIMONIALS</span>
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-16">Loved by product teams everywhere</h2>
    <div class="grid grid-cols-3 gap-8 w-full">
      <div class="flex flex-col p-8 bg-gray-50 rounded-2xl">
        <p class="text-sm text-gray-600 mb-6">&ldquo;This platform completely transformed how we ship products. Our velocity increased 3x in the first month.&rdquo;</p>
        <div class="flex items-center gap-3">
          <img src="https://placehold.co/40x40/3b82f6/ffffff?text=JD" alt="Avatar" class="w-10 h-10 rounded-full" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">Jane Doe</span>
            <span class="text-xs text-gray-500">VP Product at TechCorp</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col p-8 bg-gray-50 rounded-2xl">
        <p class="text-sm text-gray-600 mb-6">&ldquo;The analytics are incredible. We finally understand what our users actually need and can prioritize accordingly.&rdquo;</p>
        <div class="flex items-center gap-3">
          <img src="https://placehold.co/40x40/10b981/ffffff?text=MS" alt="Avatar" class="w-10 h-10 rounded-full" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">Mike Smith</span>
            <span class="text-xs text-gray-500">CTO at StartupXYZ</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col p-8 bg-gray-50 rounded-2xl">
        <p class="text-sm text-gray-600 mb-6">&ldquo;Best-in-class integrations. It fits perfectly into our existing workflow without any friction at all.&rdquo;</p>
        <div class="flex items-center gap-3">
          <img src="https://placehold.co/40x40/8b5cf6/ffffff?text=AJ" alt="Avatar" class="w-10 h-10 rounded-full" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">Alicia Johnson</span>
            <span class="text-xs text-gray-500">Engineering Lead at DevCo</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section class="flex flex-col items-center px-8 py-24 bg-gray-50">
    <span class="text-sm font-semibold text-blue-600 mb-2">PRICING</span>
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-4">Simple, transparent pricing</h2>
    <p class="text-lg text-gray-500 text-center mb-16">No hidden fees. Cancel anytime.</p>
    <div class="grid grid-cols-3 gap-8 w-full">
      <div class="flex flex-col p-8 bg-white rounded-2xl border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Starter</h3>
        <p class="text-sm text-gray-500 mb-6">For small teams getting started</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-bold text-gray-900">$29</span>
          <span class="text-sm text-gray-500">/month</span>
        </div>
        <div class="flex flex-col gap-3 mb-8">
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Up to 5 team members</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">10,000 events/mo</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Basic analytics</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Email support</span></div>
        </div>
        <button class="w-full py-3 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg">Get Started</button>
      </div>
      <div class="flex flex-col p-8 bg-blue-600 rounded-2xl border-2 border-blue-600 relative">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">MOST POPULAR</div>
        <h3 class="text-lg font-semibold text-white mb-1">Pro</h3>
        <p class="text-sm text-blue-200 mb-6">For growing product teams</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-bold text-white">$79</span>
          <span class="text-sm text-blue-200">/month</span>
        </div>
        <div class="flex flex-col gap-3 mb-8">
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-400 rounded-full"></div><span class="text-sm text-blue-100">Up to 20 team members</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-400 rounded-full"></div><span class="text-sm text-blue-100">100,000 events/mo</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-400 rounded-full"></div><span class="text-sm text-blue-100">Advanced analytics</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-400 rounded-full"></div><span class="text-sm text-blue-100">Priority support</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-400 rounded-full"></div><span class="text-sm text-blue-100">Custom integrations</span></div>
        </div>
        <button class="w-full py-3 bg-white text-sm font-semibold text-blue-600 rounded-lg">Get Started</button>
      </div>
      <div class="flex flex-col p-8 bg-white rounded-2xl border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Enterprise</h3>
        <p class="text-sm text-gray-500 mb-6">For large organizations</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-bold text-gray-900">Custom</span>
        </div>
        <div class="flex flex-col gap-3 mb-8">
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Unlimited team members</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Unlimited events</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Custom analytics</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">Dedicated support</span></div>
          <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded-full"></div><span class="text-sm text-gray-600">SSO & SAML</span></div>
        </div>
        <button class="w-full py-3 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg">Contact Sales</button>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="flex flex-col items-center px-8 py-24 bg-blue-600">
    <h2 class="text-3xl font-bold text-white text-center mb-4">Ready to get started?</h2>
    <p class="text-lg text-blue-100 text-center mb-8">Join 10,000+ teams already building better products.</p>
    <div class="flex items-center gap-4">
      <button class="px-8 py-3 bg-white text-blue-600 text-sm font-semibold rounded-lg">Start Free Trial</button>
      <button class="px-8 py-3 border-2 border-white text-white text-sm font-semibold rounded-lg">Talk to Sales</button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="flex flex-col px-8 py-16 bg-gray-900">
    <div class="grid grid-cols-4 gap-8 mb-12">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span class="text-lg font-bold text-white">Acme Inc</span>
        </div>
        <p class="text-sm text-gray-400">Building the future of product development, one team at a time.</p>
      </div>
      <div class="flex flex-col gap-3">
        <span class="text-sm font-semibold text-white">Product</span>
        <a class="text-sm text-gray-400">Features</a>
        <a class="text-sm text-gray-400">Pricing</a>
        <a class="text-sm text-gray-400">Changelog</a>
        <a class="text-sm text-gray-400">Roadmap</a>
      </div>
      <div class="flex flex-col gap-3">
        <span class="text-sm font-semibold text-white">Company</span>
        <a class="text-sm text-gray-400">About</a>
        <a class="text-sm text-gray-400">Blog</a>
        <a class="text-sm text-gray-400">Careers</a>
        <a class="text-sm text-gray-400">Contact</a>
      </div>
      <div class="flex flex-col gap-3">
        <span class="text-sm font-semibold text-white">Legal</span>
        <a class="text-sm text-gray-400">Privacy Policy</a>
        <a class="text-sm text-gray-400">Terms of Service</a>
        <a class="text-sm text-gray-400">Cookie Policy</a>
      </div>
    </div>
    <div class="flex items-center justify-between pt-8 border-t border-gray-800">
      <p class="text-sm text-gray-500">2026 Acme Inc. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
      </div>
    </div>
  </footer>
</div>`,

  'Dashboard Layout': `<div class="flex flex-row h-150 bg-gray-100">
  <aside class="w-56 bg-gray-900 text-white flex flex-col shrink-0">
    <div class="px-5 py-4 text-lg font-bold border-b border-gray-700">Dashboard</div>
    <nav class="flex flex-col gap-1 p-3">
      <a class="px-3 py-2 bg-blue-600 rounded-lg text-sm">Overview</a>
      <a class="px-3 py-2 text-gray-300 text-sm">Analytics</a>
      <a class="px-3 py-2 text-gray-300 text-sm">Projects</a>
      <a class="px-3 py-2 text-gray-300 text-sm">Settings</a>
    </nav>
  </aside>
  <main class="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Overview</h1>
      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">New Project</button>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="p-5 bg-white rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Total Revenue</p>
        <p class="text-2xl font-bold">$45,231</p>
        <p class="text-xs text-green-600 mt-1">+20.1% from last month</p>
      </div>
      <div class="p-5 bg-white rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Active Users</p>
        <p class="text-2xl font-bold">2,350</p>
        <p class="text-xs text-green-600 mt-1">+180 new this week</p>
      </div>
      <div class="p-5 bg-white rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Projects</p>
        <p class="text-2xl font-bold">12</p>
        <p class="text-xs text-gray-400 mt-1">3 in progress</p>
      </div>
    </div>
    <div class="flex-1 bg-white rounded-xl shadow-sm p-5">
      <h3 class="font-semibold mb-4">Recent Activity</h3>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div class="w-8 h-8 bg-blue-100 rounded-full shrink-0"></div>
          <div class="flex-1">
            <p class="text-sm font-medium">New project created</p>
            <p class="text-xs text-gray-400">2 hours ago</p>
          </div>
        </div>
        <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div class="w-8 h-8 bg-green-100 rounded-full shrink-0"></div>
          <div class="flex-1">
            <p class="text-sm font-medium">Design review completed</p>
            <p class="text-xs text-gray-400">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`,
}

const DEFAULT_HTML = PRESETS['Full Landing Page']

// ============================================================
// Resize Handle Hook
// ============================================================

function useResizeHandle(
  initialWidth: number,
  minWidth: number,
  maxWidth: number,
  direction: 'left' | 'right' = 'right'
) {
  const [width, setWidth] = useState(initialWidth)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width

    const onMouseMove = (me: MouseEvent) => {
      if (!dragging.current) return
      const dx = me.clientX - startX.current
      const delta = direction === 'right' ? dx : -dx
      const newW = Math.max(minWidth, Math.min(maxWidth, startW.current + delta))
      setWidth(newW)
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width, minWidth, maxWidth, direction])

  return { width, onMouseDown }
}

// ============================================================
// Drag Handle Component
// ============================================================

function DragHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="w-1.5 cursor-col-resize flex items-center justify-center group hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors shrink-0 select-none"
      onMouseDown={onMouseDown}
    >
      <div className="w-0.5 h-8 bg-gray-300 group-hover:bg-blue-500 rounded-full transition-colors" />
    </div>
  )
}

// ============================================================
// Node Tree Component
// ============================================================

interface NodeTreeProps {
  node: ScytleNode
  depth?: number
  selectedId: string | null
  onSelect: (id: string) => void
}

function NodeTree({ node, depth = 0, selectedId, onSelect }: NodeTreeProps) {
  const [expanded, setExpanded] = useState(depth < 3)
  const hasChildren = node.type === 'frame' && (node as FrameNode).children?.length > 0
  const isSelected = selectedId === node.id

  const layoutBadge = useMemo(() => {
    if (node.type !== 'frame') return ''
    const frame = node as FrameNode
    if (frame.layout?.mode === 'flex') return frame.layout.direction === 'row' ? '→' : '↓'
    if (frame.layout?.mode === 'grid') return '▦'
    return ''
  }, [node])

  const sizingBadge = useMemo(() => {
    const h = node.sizing?.horizontal?.[0]?.toUpperCase() || '?'
    const v = node.sizing?.vertical?.[0]?.toUpperCase() || '?'
    return `${h}×${v}`
  }, [node.sizing])

  const hasMargin = node.margin && (node.margin.top > 0 || node.margin.right > 0 || node.margin.bottom > 0 || node.margin.left > 0)

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div
        className={`flex items-center gap-1 py-0.5 px-1.5 rounded cursor-pointer text-xs font-mono ${isSelected
          ? 'bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/30'
          : 'hover:bg-white/60'
          }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(node.id)
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="w-3.5 h-3.5 flex items-center justify-center shrink-0"
          >
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className={`px-1 py-px rounded text-[10px] leading-none shrink-0 ${node.type === 'frame' ? 'bg-violet-500/15 text-violet-600' :
          node.type === 'text' ? 'bg-emerald-500/15 text-emerald-600' :
            node.type === 'image' ? 'bg-amber-500/15 text-amber-600' :
              'bg-sky-500/15 text-sky-600'
          }`}>
          {node.type}
        </span>
        <span className="truncate flex-1 text-gray-700">{node.name}</span>
        {layoutBadge && <span className="text-[10px] text-violet-400 shrink-0">{layoutBadge}</span>}
        {hasMargin && <span className="text-[10px] text-orange-400 shrink-0" title="Has margin">M</span>}
        <span className="text-[10px] text-gray-400 shrink-0">{sizingBadge}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {(node as FrameNode).children.map((child) => (
            <NodeTree
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Node Inspector
// ============================================================

function NodeInspector({ node }: { node: ScytleNode | null }) {
  const [copied, setCopied] = useState(false)

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Click a node in the tree to inspect
      </div>
    )
  }

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(node, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="font-semibold text-xs text-gray-700 truncate">{node.name}</h4>
        <button onClick={copyJson} className="p-1 hover:bg-gray-200 rounded shrink-0" title="Copy JSON">
          {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
        </button>
      </div>
      <pre className="text-[10px] leading-tight bg-gray-50 p-2 rounded overflow-auto max-h-75 font-mono text-gray-600 border border-gray-100">
        {JSON.stringify(node, null, 2)}
      </pre>
    </div>
  )
}

// ============================================================
// Browser Preview (iframe positioned above the canvas frame)
// ============================================================

function BrowserPreviewOverlay({
  html,
  frameNode,
  zoom,
  panX,
  panY,
}: {
  html: string
  frameNode: FrameNode
  zoom: number
  panX: number
  panY: number
}) {
  const previewWidth = frameNode.width
  const previewHeight = frameNode.height || 800

  // Place the browser preview above the parsed frame
  const previewX = frameNode.x
  const previewY = frameNode.y - previewHeight - 60

  const screenLeft = previewX * zoom + panX
  const screenTop = previewY * zoom + panY
  const screenWidth = previewWidth * zoom
  const screenHeight = previewHeight * zoom

  return (
    <div
      className="absolute overflow-hidden pointer-events-auto"
      style={{
        left: screenLeft,
        top: screenTop,
        width: screenWidth,
        height: screenHeight,
      }}
    >
      <iframe
        srcDoc={`<!DOCTYPE html>
<html>
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${INTER_FONT_URL}" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] } } }
    }
  <\/script>
  <style>body { margin: 0; font-family: 'Inter', sans-serif; overflow: hidden; }</style>
</head>
<body>${html}</body>
</html>`}
        className="border border-gray-200 bg-white shadow-lg rounded-sm"
        style={{
          width: previewWidth,
          height: previewHeight,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        sandbox="allow-scripts"
        title="Browser Preview"
      />
    </div>
  )
}

// ============================================================
// Canvas Frame Label (screen-space overlay)
// ============================================================

function CanvasFrameLabel({
  x, y, label, width, zoom, panX, panY, color,
}: {
  x: number; y: number; label: string; width: number
  zoom: number; panX: number; panY: number; color: string
}) {
  const screenLeft = x * zoom + panX
  const screenTop = y * zoom + panY

  return (
    <div
      className="absolute pointer-events-none flex items-center gap-1.5 text-xs whitespace-nowrap"
      style={{
        left: screenLeft,
        top: screenTop - 22,
        transform: `scale(${1 / Math.max(zoom, 0.3)})`,
        transformOrigin: '0 100%',
        color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-medium">{label}</span>
      <span style={{ opacity: 0.5 }}>{Math.round(width)}px</span>
    </div>
  )
}

// ============================================================
// Debug Canvas — lightweight infinite canvas using the real NodeRenderer
// ============================================================

function DebugCanvas({
  parsedRoot,
  html,
  showBrowserPreview,
}: {
  parsedRoot: FrameNode | null
  html: string
  showBrowserPreview: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.5)
  const [panX, setPanX] = useState(100)
  const [panY, setPanY] = useState(100)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  // Refs to avoid stale closures in native event listener
  const zoomRef = useRef(zoom)
  const panXRef = useRef(panX)
  const panYRef = useRef(panY)
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panXRef.current = panX }, [panX])
  useEffect(() => { panYRef.current = panY }, [panY])

  // Wheel handler: attached via addEventListener for { passive: false }
  // so preventDefault() actually works (React onWheel is passive)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const z = zoomRef.current
    const px = panXRef.current
    const py = panYRef.current

    if (e.metaKey || e.ctrlKey) {
      const focalX = e.clientX - rect.left
      const focalY = e.clientY - rect.top
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(0.05, Math.min(10, z * zoomFactor))
      const canvasX = (focalX - px) / z
      const canvasY = (focalY - py) / z
      setPanX(focalX - canvasX * newZoom)
      setPanY(focalY - canvasY * newZoom)
      setZoom(newZoom)
    } else {
      setPanX(px - e.deltaX)
      setPanY(py - e.deltaY)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Middle-mouse or Alt+drag to pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY }
        ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
  }, [panX, panY])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return
    setPanX(panStart.current.panX + (e.clientX - panStart.current.x))
    setPanY(panStart.current.panY + (e.clientY - panStart.current.y))
  }, [isPanning])

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Auto zoom-to-fit when parsedRoot changes
  useEffect(() => {
    if (!parsedRoot || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const PAD = 80

    const minX = parsedRoot.x
    const minY = showBrowserPreview
      ? parsedRoot.y - (parsedRoot.height || 800) - 60
      : parsedRoot.y
    const maxX = parsedRoot.x + parsedRoot.width
    const maxY = parsedRoot.y + (parsedRoot.height || 800)

    const contentW = maxX - minX
    const contentH = maxY - minY

    if (contentW <= 0 || contentH <= 0) return

    const fitZoom = Math.min(
      (rect.width - PAD * 2) / contentW,
      (rect.height - PAD * 2) / contentH,
      1
    )
    const centerX = minX + contentW / 2
    const centerY = minY + contentH / 2

    setZoom(fitZoom)
    setPanX(rect.width / 2 - centerX * fitZoom)
    setPanY(rect.height / 2 - centerY * fitZoom)
  }, [parsedRoot, showBrowserPreview])

  const zoomBy = useCallback((factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const newZoom = Math.max(0.05, Math.min(10, zoom * factor))
    const cx = rect.width / 2
    const cy = rect.height / 2
    const canvasX = (cx - panX) / zoom
    const canvasY = (cy - panY) / zoom
    setPanX(cx - canvasX * newZoom)
    setPanY(cy - canvasY * newZoom)
    setZoom(newZoom)
  }, [zoom, panX, panY])

  const zoomToFit = useCallback(() => {
    if (!parsedRoot || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const PAD = 80
    const minX = parsedRoot.x
    const minY = showBrowserPreview ? parsedRoot.y - (parsedRoot.height || 800) - 60 : parsedRoot.y
    const maxX = parsedRoot.x + parsedRoot.width
    const maxY = parsedRoot.y + (parsedRoot.height || 800)
    const contentW = maxX - minX
    const contentH = maxY - minY
    if (contentW <= 0 || contentH <= 0) return
    const fitZoom = Math.min((rect.width - PAD * 2) / contentW, (rect.height - PAD * 2) / contentH, 1)
    const centerX = minX + contentW / 2
    const centerY = minY + contentH / 2
    setZoom(fitZoom)
    setPanX(rect.width / 2 - centerX * fitZoom)
    setPanY(rect.height / 2 - centerY * fitZoom)
  }, [parsedRoot, showBrowserPreview])

  // Browser preview virtual position (above parsed frame)
  const browserX = parsedRoot?.x ?? 0
  const browserY = (parsedRoot?.y ?? 0) - (parsedRoot?.height ?? 800) - 60
  const browserW = parsedRoot?.width ?? 1280

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Canvas viewport */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{
          backgroundColor: '#e8e8e8',
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`,
          cursor: isPanning ? 'grabbing' : 'default',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Transform container for NodeRenderer (uses CSS custom properties) */}
        {parsedRoot && (
          <div
            className="absolute top-0 left-0"
            style={{ '--z': zoom, '--px': panX, '--py': panY } as React.CSSProperties}
          >
            <NodeRenderer node={parsedRoot} isTopLevel />
          </div>
        )}

        {/* Browser preview iframe overlay (screen-space positioned) */}
        {showBrowserPreview && parsedRoot && (
          <BrowserPreviewOverlay
            html={html}
            frameNode={{
              ...parsedRoot,
              x: browserX,
              y: browserY,
            }}
            zoom={zoom}
            panX={panX}
            panY={panY}
          />
        )}

        {/* Frame labels */}
        {parsedRoot && (
          <CanvasFrameLabel
            x={parsedRoot.x} y={parsedRoot.y}
            label="Canvas Output" width={parsedRoot.width}
            zoom={zoom} panX={panX} panY={panY}
            color="#3b82f6"
          />
        )}
        {showBrowserPreview && parsedRoot && (
          <CanvasFrameLabel
            x={browserX} y={browserY}
            label="Browser Preview" width={browserW}
            zoom={zoom} panX={panX} panY={panY}
            color="#22c55e"
          />
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow-md border border-gray-200 px-1.5 py-1">
        <button onClick={() => zoomBy(0.8)} className="p-1 hover:bg-gray-100 rounded" title="Zoom Out">
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-mono text-gray-500 min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => zoomBy(1.25)} className="p-1 hover:bg-gray-100 rounded" title="Zoom In">
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button onClick={zoomToFit} className="p-1 hover:bg-gray-100 rounded" title="Zoom to Fit">
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Saved Tests Persistence
// ============================================================

interface SavedTest {
  id: string
  name: string
  html: string
  createdAt: number
}

const STORAGE_KEY = 'scytle-parser-tests'

function loadSavedTests(): SavedTest[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveSavedTests(tests: SavedTest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
}

// ============================================================
// Main Page
// ============================================================

export default function ParserDebugStudio() {
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [parsedRoot, setParsedRoot] = useState<FrameNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedTests, setSavedTests] = useState<SavedTest[]>([])
  const [testName, setTestName] = useState('')
  const [showBrowserPreview, setShowBrowserPreview] = useState(true)
  const [parseWidth, setParseWidth] = useState(1280)
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null)

  const leftPanel = useResizeHandle(420, 250, 700, 'right')
  const rightPanel = useResizeHandle(300, 220, 500, 'left')

  // Load saved tests on mount
  useEffect(() => {
    setSavedTests(loadSavedTests())
  }, [])

  // Load Inter font
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = INTER_FONT_URL
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // Parse HTML whenever source or width changes
  useEffect(() => {
    try {
      const root = parseHtmlToNodes(html, 'Test', { rootWidth: parseWidth })
      setParsedRoot(root)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error')
      setParsedRoot(null)
    }
  }, [html, parseWidth])

  // Resolve inspected node from tree
  const inspectedNode = useMemo(() => {
    if (!inspectedNodeId || !parsedRoot) return null
    if (parsedRoot.id === inspectedNodeId) return parsedRoot
    return findNodeById([parsedRoot], inspectedNodeId) ?? null
  }, [inspectedNodeId, parsedRoot])

  const handleSaveTest = useCallback(() => {
    const name = testName.trim() || `Test ${savedTests.length + 1}`
    const newTest: SavedTest = {
      id: crypto.randomUUID(),
      name,
      html,
      createdAt: Date.now(),
    }
    const updated = [...savedTests, newTest]
    setSavedTests(updated)
    saveSavedTests(updated)
    setTestName('')
  }, [html, testName, savedTests])

  const handleDeleteTest = useCallback((id: string) => {
    const updated = savedTests.filter(t => t.id !== id)
    setSavedTests(updated)
    saveSavedTests(updated)
  }, [savedTests])

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Parser Debug Studio is only available in development.</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#fafafa]">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-1.5 bg-white border-b shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight text-gray-900">Parser Debug Studio</h1>
          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Width:</span>
            <input
              type="number"
              value={parseWidth}
              onChange={(e) => setParseWidth(Math.max(320, Math.min(2560, parseInt(e.target.value) || 1280)))}
              className="w-16 px-1.5 py-0.5 border rounded text-xs text-center"
              min={320}
              max={2560}
            />
            <span>px</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />

          <button
            onClick={() => setShowBrowserPreview(!showBrowserPreview)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${showBrowserPreview
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {showBrowserPreview ? <Eye size={12} /> : <EyeOff size={12} />}
            Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="px-2 py-1 border rounded text-xs"
            onChange={(e) => e.target.value && setHtml(PRESETS[e.target.value])}
            defaultValue=""
          >
            <option value="" disabled>Load Preset...</option>
            {Object.keys(PRESETS).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Test name..."
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="px-2 py-1 border rounded text-xs w-24"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTest()}
            />
            <button
              onClick={handleSaveTest}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              <Save size={12} />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Saved Tests Bar */}
      {savedTests.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border-b overflow-x-auto shrink-0">
          <span className="text-[10px] text-gray-400 shrink-0 uppercase tracking-wider">Saved:</span>
          {savedTests.map(test => (
            <div
              key={test.id}
              className="flex items-center gap-1 px-2 py-0.5 bg-white border rounded text-xs shrink-0 hover:border-blue-300 transition-colors"
            >
              <button onClick={() => setHtml(test.html)} className="hover:text-blue-600">
                {test.name}
              </button>
              <button onClick={() => handleDeleteTest(test.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monaco HTML Editor */}
        <div className="flex flex-col bg-white" style={{ width: leftPanel.width }}>
          <div className="px-3 py-1.5 bg-gray-50 border-b text-xs font-medium text-gray-500 flex items-center gap-1.5 shrink-0">
            <Columns2 size={12} />
            HTML + Tailwind Input
            {error && (
              <span className="ml-auto text-red-500 text-[10px] truncate max-w-[200px]">{error}</span>
            )}
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language="html"
              theme="vs-light"
              value={html}
              onChange={(value) => setHtml(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                wordWrap: 'on',
                tabSize: 2,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                padding: { top: 8 },
              }}
            />
          </div>
        </div>

        <DragHandle onMouseDown={leftPanel.onMouseDown} />

        {/* Middle: Infinite Canvas */}
        <div className="flex-1 min-w-0">
          <DebugCanvas
            parsedRoot={parsedRoot}
            html={html}
            showBrowserPreview={showBrowserPreview}
          />
        </div>

        <DragHandle onMouseDown={rightPanel.onMouseDown} />

        {/* Right: Node Tree + Inspector */}
        <div className="flex flex-col bg-white" style={{ width: rightPanel.width }}>
          <div className="flex-1 flex flex-col border-b overflow-hidden min-h-0">
            <div className="px-3 py-1.5 bg-gray-50 border-b text-xs font-medium text-gray-500 shrink-0">
              Node Tree
            </div>
            <div className="flex-1 overflow-auto p-1.5">
              {parsedRoot && (
                <NodeTree
                  node={parsedRoot}
                  selectedId={inspectedNodeId}
                  onSelect={setInspectedNodeId}
                />
              )}
            </div>
          </div>

          <div className="h-[40%] flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 bg-gray-50 border-b text-xs font-medium text-gray-500 shrink-0">
              Node Inspector
            </div>
            <div className="flex-1 overflow-auto">
              <NodeInspector node={inspectedNode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
