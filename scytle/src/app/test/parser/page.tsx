'use client'

import { useState, useEffect, useCallback, useMemo, useRef, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { parseHtmlToNodesViaIframe } from '@/lib/parser/iframe-parser'
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
  // ── 1. Dashboard with sidebar, header row, grid stats, absolute badge ──
  'Dashboard + Absolute': `<div class="flex flex-row h-[600px] bg-gray-100">
  <aside class="w-56 bg-gray-900 text-white flex flex-col shrink-0">
    <div class="px-5 py-4 text-lg font-bold border-b border-gray-700">Dashboard</div>
    <nav class="flex flex-col gap-1 p-3">
      <a class="px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium">Overview</a>
      <a class="px-3 py-2 text-gray-300 text-sm hover:bg-gray-800 rounded-lg">Analytics</a>
      <a class="px-3 py-2 text-gray-300 text-sm hover:bg-gray-800 rounded-lg">Projects</a>
      <a class="px-3 py-2 text-gray-300 text-sm hover:bg-gray-800 rounded-lg">Settings</a>
    </nav>
    <div class="mt-auto p-4 border-t border-gray-700">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-500 rounded-full"></div>
        <div class="flex flex-col">
          <span class="text-xs font-medium">John Doe</span>
          <span class="text-[10px] text-gray-400">Admin</span>
        </div>
      </div>
    </div>
  </aside>
  <main class="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Overview</h1>
      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium">New Project</button>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="relative p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        <p class="text-sm text-gray-500 mb-1">Revenue</p>
        <p class="text-2xl font-bold text-gray-900">$45,231</p>
        <p class="text-xs text-green-600 mt-1">+20.1% from last month</p>
      </div>
      <div class="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Active Users</p>
        <p class="text-2xl font-bold text-gray-900">2,350</p>
        <p class="text-xs text-green-600 mt-1">+180 new this week</p>
      </div>
      <div class="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">Projects</p>
        <p class="text-2xl font-bold text-gray-900">12</p>
        <p class="text-xs text-gray-400 mt-1">3 in progress</p>
      </div>
    </div>
    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
      <h3 class="font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div class="w-8 h-8 bg-blue-100 rounded-full shrink-0"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">New project created</p>
            <p class="text-xs text-gray-400">2 hours ago</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-100 rounded-full shrink-0"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">Design review completed</p>
            <p class="text-xs text-gray-400">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`,

  // ── 2. Complex grid with col-span, row-span, nested flex ──
  'Grid + Spans + Nested Flex': `<div class="grid grid-cols-4 gap-4 p-6 bg-gray-50">
  <div class="col-span-2 row-span-2 relative bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden">
    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <h2 class="text-xl font-bold mb-2">Featured Project</h2>
    <p class="text-sm text-blue-100 mb-4">A complex layout with overlapping elements and gradients.</p>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-white/20 rounded-full"></div>
      <div class="flex flex-col">
        <span class="text-sm font-semibold">Team Alpha</span>
        <span class="text-xs text-blue-200">12 members</span>
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <button class="px-3 py-1.5 bg-white text-blue-600 text-xs font-semibold rounded-lg">View Details</button>
      <button class="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/30">Share</button>
    </div>
  </div>
  <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center gap-2 mb-3">
      <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
        <div class="w-4 h-4 bg-emerald-500 rounded"></div>
      </div>
      <span class="text-sm font-semibold text-gray-900">Sales</span>
    </div>
    <p class="text-2xl font-bold text-gray-900">$12.4k</p>
    <p class="text-xs text-emerald-600 mt-1">+8.2%</p>
  </div>
  <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center gap-2 mb-3">
      <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
        <div class="w-4 h-4 bg-violet-500 rounded"></div>
      </div>
      <span class="text-sm font-semibold text-gray-900">Users</span>
    </div>
    <p class="text-2xl font-bold text-gray-900">8,491</p>
    <p class="text-xs text-violet-600 mt-1">+23.1%</p>
  </div>
  <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-gray-500">Progress</span>
      <span class="text-xs font-medium text-gray-700">73%</span>
    </div>
    <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div class="w-3/4 h-full bg-blue-500 rounded-full"></div>
    </div>
  </div>
  <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-gray-500">Completion</span>
      <span class="text-xs font-medium text-gray-700">45%</span>
    </div>
    <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div class="w-5/12 h-full bg-amber-500 rounded-full"></div>
    </div>
  </div>
  <div class="col-span-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">Team Members</h3>
      <button class="text-xs text-blue-600 font-medium">View All</button>
    </div>
    <div class="flex items-center gap-4 mt-3">
      <div class="flex -space-x-2">
        <div class="w-8 h-8 bg-blue-400 rounded-full border-2 border-white"></div>
        <div class="w-8 h-8 bg-green-400 rounded-full border-2 border-white"></div>
        <div class="w-8 h-8 bg-purple-400 rounded-full border-2 border-white"></div>
        <div class="w-8 h-8 bg-orange-400 rounded-full border-2 border-white"></div>
        <div class="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">+5</div>
      </div>
      <span class="text-xs text-gray-500">9 people working on this project</span>
    </div>
  </div>
</div>`,

  // ── 3. Card grid with shadows, gradients, buttons, icons ──
  'Cards + Effects': `<div class="p-8 bg-gray-50">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Popular Products</h2>
      <p class="text-sm text-gray-500 mt-1">Browse our best sellers</p>
    </div>
    <button class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg font-medium">View All</button>
  </div>
  <div class="grid grid-cols-3 gap-6">
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div class="h-44 bg-linear-to-br from-blue-400 to-blue-600 relative">
        <div class="absolute top-3 left-3 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-blue-600">NEW</div>
      </div>
      <div class="p-5">
        <h3 class="font-semibold text-lg text-gray-900 mb-1">Product One</h3>
        <p class="text-sm text-gray-500 mb-4">A fantastic product with great features and excellent reviews.</p>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-blue-600">$49</span>
          <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div class="h-44 bg-linear-to-br from-green-400 to-emerald-600 relative">
        <div class="absolute top-3 left-3 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-emerald-600">POPULAR</div>
      </div>
      <div class="p-5">
        <h3 class="font-semibold text-lg text-gray-900 mb-1">Product Two</h3>
        <p class="text-sm text-gray-500 mb-4">Another amazing product for your needs with premium quality.</p>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-emerald-600">$79</span>
          <button class="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div class="h-44 bg-linear-to-br from-purple-400 to-violet-600 relative">
        <div class="absolute top-3 left-3 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-violet-600">SALE</div>
      </div>
      <div class="p-5">
        <h3 class="font-semibold text-lg text-gray-900 mb-1">Product Three</h3>
        <p class="text-sm text-gray-500 mb-4">Premium product with exclusive features and lifetime updates.</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 line-through">$129</span>
            <span class="text-xl font-bold text-violet-600">$99</span>
          </div>
          <button class="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg font-medium">Buy Now</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

  // ── 4. Flex mixed widths: fixed, grow, percentage ──
  'Flex Sizing Stress': `<div class="flex flex-col gap-6 p-6 bg-white">
  <h2 class="text-lg font-bold text-gray-900">Flex Sizing Patterns</h2>

  <div class="flex flex-col gap-1">
    <p class="text-xs text-gray-400 font-medium">ROW: fixed(25%) + grow(flex-1) + fixed(192px)</p>
    <div class="flex flex-row gap-3">
      <div class="w-1/4 p-3 bg-blue-50 border border-blue-200 rounded-lg shrink-0">
        <p class="text-xs font-medium text-blue-700">w-1/4</p>
      </div>
      <div class="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-xs font-medium text-green-700">flex-1 (grows)</p>
      </div>
      <div class="w-48 p-3 bg-purple-50 border border-purple-200 rounded-lg shrink-0">
        <p class="text-xs font-medium text-purple-700">w-48 (192px)</p>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <p class="text-xs text-gray-400 font-medium">ROW: 3 equal grow + hug button</p>
    <div class="flex flex-row gap-3 items-center">
      <div class="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p class="text-xs font-medium text-amber-700">flex-1</p>
      </div>
      <div class="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p class="text-xs font-medium text-amber-700">flex-1</p>
      </div>
      <div class="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p class="text-xs font-medium text-amber-700">flex-1</p>
      </div>
      <button class="px-4 py-2 bg-gray-900 text-white text-xs rounded-lg shrink-0 font-medium">Action</button>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <p class="text-xs text-gray-400 font-medium">ROW: justify-between with hug children</p>
    <div class="flex flex-row justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <span class="text-sm font-semibold text-gray-900">Title Text</span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400">Status:</span>
        <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
      </div>
      <button class="px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-medium">Edit</button>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <p class="text-xs text-gray-400 font-medium">COLUMN: stretch (default) vs center vs start</p>
    <div class="flex flex-row gap-3">
      <div class="flex-1 flex flex-col gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
        <p class="text-xs text-rose-500 font-medium">items-stretch (default)</p>
        <div class="p-2 bg-rose-100 rounded text-xs text-rose-700">fills width</div>
        <button class="py-1 bg-rose-500 text-white text-xs rounded">full-width btn</button>
      </div>
      <div class="flex-1 flex flex-col gap-2 items-center p-3 bg-sky-50 border border-sky-200 rounded-lg">
        <p class="text-xs text-sky-500 font-medium">items-center</p>
        <div class="p-2 bg-sky-100 rounded text-xs text-sky-700">hugs content</div>
        <button class="px-4 py-1 bg-sky-500 text-white text-xs rounded">hug btn</button>
      </div>
      <div class="flex-1 flex flex-col gap-2 items-start p-3 bg-teal-50 border border-teal-200 rounded-lg">
        <p class="text-xs text-teal-500 font-medium">items-start</p>
        <div class="p-2 bg-teal-100 rounded text-xs text-teal-700">hugs left</div>
        <button class="px-4 py-1 bg-teal-500 text-white text-xs rounded">hug btn</button>
      </div>
    </div>
  </div>
</div>`,

  // ── 5. SVG icons + absolute positioned badges + overlapping elements ──
  'Icons + Badges + Overlap': `<div class="p-8 bg-white">
  <h2 class="text-xl font-bold text-gray-900 mb-6">Notification Center</h2>
  <div class="flex flex-col gap-3">
    <div class="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <div class="relative shrink-0">
        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span class="text-[8px] text-white font-bold">3</span>
        </div>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-900">New Messages</h4>
          <span class="text-[10px] text-gray-400">2 min ago</span>
        </div>
        <p class="text-xs text-gray-600 mt-1">You have 3 unread messages from your team members.</p>
      </div>
    </div>
    <div class="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
      <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-900">Task Completed</h4>
          <span class="text-[10px] text-gray-400">1 hour ago</span>
        </div>
        <p class="text-xs text-gray-600 mt-1">Project milestone "UI Review" has been completed successfully.</p>
      </div>
    </div>
    <div class="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
      <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-900">Storage Warning</h4>
          <span class="text-[10px] text-gray-400">3 hours ago</span>
        </div>
        <p class="text-xs text-gray-600 mt-1">You're using 85% of your storage. Consider upgrading your plan.</p>
        <div class="flex gap-2 mt-2">
          <button class="px-3 py-1 bg-amber-500 text-white text-xs rounded-md font-medium">Upgrade</button>
          <button class="px-3 py-1 bg-white text-gray-600 text-xs rounded-md border border-gray-200 font-medium">Dismiss</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

  // ── 6. Pricing table — complex nested flex+grid, badges, borders ──
  'Pricing Table': `<div class="flex flex-col items-center px-8 py-16 bg-gray-50">
  <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">Simple Pricing</h2>
  <p class="text-lg text-gray-500 text-center mb-12">No hidden fees. Cancel anytime.</p>
  <div class="grid grid-cols-3 gap-6 w-full max-w-4xl">
    <div class="flex flex-col p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Starter</h3>
      <p class="text-sm text-gray-500 mb-4">For individuals</p>
      <div class="flex items-baseline gap-1 mb-6">
        <span class="text-4xl font-bold text-gray-900">$9</span>
        <span class="text-sm text-gray-500">/month</span>
      </div>
      <div class="flex flex-col gap-2.5 mb-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">5 projects</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">1GB storage</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">Email support</span>
        </div>
      </div>
      <button class="mt-auto w-full py-2.5 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg">Get Started</button>
    </div>
    <div class="flex flex-col p-6 bg-blue-600 rounded-2xl shadow-xl relative">
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Most Popular</div>
      <h3 class="text-lg font-semibold text-white mb-1">Pro</h3>
      <p class="text-sm text-blue-200 mb-4">For teams</p>
      <div class="flex items-baseline gap-1 mb-6">
        <span class="text-4xl font-bold text-white">$29</span>
        <span class="text-sm text-blue-200">/month</span>
      </div>
      <div class="flex flex-col gap-2.5 mb-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-400 rounded-full shrink-0"></div>
          <span class="text-sm text-blue-100">Unlimited projects</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-400 rounded-full shrink-0"></div>
          <span class="text-sm text-blue-100">50GB storage</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-400 rounded-full shrink-0"></div>
          <span class="text-sm text-blue-100">Priority support</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-400 rounded-full shrink-0"></div>
          <span class="text-sm text-blue-100">Advanced analytics</span>
        </div>
      </div>
      <button class="mt-auto w-full py-2.5 bg-white text-sm font-semibold text-blue-600 rounded-lg">Get Started</button>
    </div>
    <div class="flex flex-col p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Enterprise</h3>
      <p class="text-sm text-gray-500 mb-4">For organizations</p>
      <div class="flex items-baseline gap-1 mb-6">
        <span class="text-4xl font-bold text-gray-900">$99</span>
        <span class="text-sm text-gray-500">/month</span>
      </div>
      <div class="flex flex-col gap-2.5 mb-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">Everything in Pro</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">500GB storage</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">SSO & SAML</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded-full shrink-0"></div>
          <span class="text-sm text-gray-600">Dedicated support</span>
        </div>
      </div>
      <button class="mt-auto w-full py-2.5 border border-gray-300 text-sm font-semibold text-gray-700 rounded-lg">Contact Sales</button>
    </div>
  </div>
</div>`,

  // ── 7. Hero with overlapping layers, gradients, absolute elements ──
  'Hero + Overlapping Layers': `<div class="relative overflow-hidden bg-gray-900">
  <div class="absolute inset-0 bg-linear-to-br from-blue-600/20 to-purple-600/20"></div>
  <div class="absolute top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-10 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
  <nav class="relative flex items-center justify-between px-8 py-5">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-blue-500 rounded-lg"></div>
      <span class="text-lg font-bold text-white">Nebula</span>
    </div>
    <div class="flex items-center gap-6">
      <a class="text-sm text-gray-300 font-medium">Features</a>
      <a class="text-sm text-gray-300 font-medium">Pricing</a>
      <a class="text-sm text-gray-300 font-medium">Docs</a>
      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium">Get Started</button>
    </div>
  </nav>
  <section class="relative flex flex-col items-center px-8 pt-20 pb-32">
    <div class="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6 border border-white/10">
      <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      <span class="text-xs text-gray-300 font-medium">Now in public beta</span>
    </div>
    <h1 class="text-5xl font-bold text-white text-center mb-6 leading-tight">Build the future<br/>with intelligent design</h1>
    <p class="text-lg text-gray-400 text-center mb-10 max-w-xl">The next generation platform for design engineers. Ship faster, collaborate better, iterate with confidence.</p>
    <div class="flex items-center gap-4">
      <button class="px-6 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25">Start Building Free</button>
      <button class="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold text-sm rounded-xl border border-white/20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Watch Demo
      </button>
    </div>
  </section>
</div>`,

  // ── 8. Data table with alternating rows, badges, inline actions ──
  'Data Table': `<div class="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">Recent Orders</h3>
    <div class="flex items-center gap-2">
      <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">Filter</button>
      <button class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium">Export</button>
    </div>
  </div>
  <div class="flex flex-col">
    <div class="flex items-center gap-4 py-2.5 px-3 bg-gray-50 rounded-t-lg border-b border-gray-100">
      <span class="w-24 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Order ID</span>
      <span class="flex-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Customer</span>
      <span class="w-20 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Amount</span>
      <span class="w-20 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</span>
      <span class="w-16 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Action</span>
    </div>
    <div class="flex items-center gap-4 py-3 px-3 border-b border-gray-50">
      <span class="w-24 text-xs font-medium text-gray-900">#ORD-001</span>
      <div class="flex-1 flex items-center gap-2">
        <div class="w-6 h-6 bg-blue-100 rounded-full shrink-0"></div>
        <span class="text-xs text-gray-700">Alice Johnson</span>
      </div>
      <span class="w-20 text-xs font-semibold text-gray-900">$234.50</span>
      <span class="w-20"><span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">Delivered</span></span>
      <span class="w-16"><button class="text-xs text-blue-600 font-medium">View</button></span>
    </div>
    <div class="flex items-center gap-4 py-3 px-3 bg-gray-50/50 border-b border-gray-50">
      <span class="w-24 text-xs font-medium text-gray-900">#ORD-002</span>
      <div class="flex-1 flex items-center gap-2">
        <div class="w-6 h-6 bg-purple-100 rounded-full shrink-0"></div>
        <span class="text-xs text-gray-700">Bob Smith</span>
      </div>
      <span class="w-20 text-xs font-semibold text-gray-900">$89.00</span>
      <span class="w-20"><span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">Pending</span></span>
      <span class="w-16"><button class="text-xs text-blue-600 font-medium">View</button></span>
    </div>
    <div class="flex items-center gap-4 py-3 px-3 border-b border-gray-50">
      <span class="w-24 text-xs font-medium text-gray-900">#ORD-003</span>
      <div class="flex-1 flex items-center gap-2">
        <div class="w-6 h-6 bg-green-100 rounded-full shrink-0"></div>
        <span class="text-xs text-gray-700">Carol Davis</span>
      </div>
      <span class="w-20 text-xs font-semibold text-gray-900">$567.80</span>
      <span class="w-20"><span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">Shipped</span></span>
      <span class="w-16"><button class="text-xs text-blue-600 font-medium">View</button></span>
    </div>
    <div class="flex items-center gap-4 py-3 px-3 bg-gray-50/50">
      <span class="w-24 text-xs font-medium text-gray-900">#ORD-004</span>
      <div class="flex-1 flex items-center gap-2">
        <div class="w-6 h-6 bg-red-100 rounded-full shrink-0"></div>
        <span class="text-xs text-gray-700">Dan Wilson</span>
      </div>
      <span class="w-20 text-xs font-semibold text-gray-900">$45.00</span>
      <span class="w-20"><span class="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">Cancelled</span></span>
      <span class="w-16"><button class="text-xs text-blue-600 font-medium">View</button></span>
    </div>
  </div>
</div>`,
}

const DEFAULT_HTML = PRESETS['Dashboard + Absolute']


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
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"><\/script>
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
  const useIframeParser = true
  const [isParsing, setIsParsing] = useState(false)
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
    setIsParsing(true)
    let cancelled = false
    parseHtmlToNodesViaIframe(html, 'Test', { rootWidth: parseWidth })
      .then(root => {
        if (!cancelled) {
          setParsedRoot(root)
          setError(null)
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Parse error')
          setParsedRoot(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsParsing(false)
      })
    return () => { cancelled = true }
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

          {isParsing && <span className="text-xs text-blue-500 animate-pulse">Parsing...</span>}
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
