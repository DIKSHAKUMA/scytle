'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas } from '@/components/editor'
import type { FrameNode, ScytleNode } from '@/types/canvas'

// ═══════════════════════════════════════════════════════════════
// Parser Test — real canvas output
// Write Tailwind HTML → Parse → See it on the actual canvas
// Browser preview iframe floats on the canvas next to the parsed frame
// ═══════════════════════════════════════════════════════════════

const DEFAULT_HTML = `<div>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 1. NAVIGATION                              -->
  <!-- ═══════════════════════════════════════════ -->
  <nav class="flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span class="text-white text-sm font-bold">N</span>
      </div>
      <span class="text-lg font-bold text-gray-900">Nexus</span>
    </div>
    <div class="flex items-center gap-8">
      <a class="text-sm font-medium text-gray-600">Product</a>
      <a class="text-sm font-medium text-gray-600">Solutions</a>
      <a class="text-sm font-medium text-gray-600">Pricing</a>
      <a class="text-sm font-medium text-gray-600">Docs</a>
      <a class="text-sm font-medium text-gray-600">Blog</a>
    </div>
    <div class="flex items-center gap-3">
      <a class="text-sm font-medium text-gray-700">Log in</a>
      <button class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">Start Free</button>
    </div>
  </nav>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 2. HERO with absolute decorations          -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-16 py-28 overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"></div>
    <div class="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full opacity-20 translate-y-1/2 -translate-x-1/4"></div>

    <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
      <div>
        <div class="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
          <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
          Now in public beta
        </div>
        <h1 class="text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">Build faster.<br/>Ship smarter.<br/>Scale effortlessly.</h1>
        <p class="text-lg text-gray-500 mt-6 max-w-md leading-relaxed">The all-in-one platform for modern teams. Automate workflows, collaborate in real-time, and deploy with confidence.</p>
        <div class="flex items-center gap-4 mt-8">
          <button class="bg-indigo-600 text-white px-8 py-3.5 rounded-lg text-sm font-bold">Start Free Trial</button>
          <button class="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg text-sm font-semibold flex items-center gap-2">
            <div class="w-5 h-5 bg-gray-400 rounded-full"></div>
            Watch Demo
          </button>
        </div>
      </div>

      <div class="relative">
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-sm font-semibold text-gray-900">Project Overview</p>
              <p class="text-xs text-gray-400 mt-1">Last 30 days</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gray-100 rounded-lg"></div>
              <div class="w-8 h-8 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-indigo-50 rounded-xl p-4">
              <p class="text-2xl font-bold text-indigo-600">2,847</p>
              <p class="text-xs text-gray-500 mt-1">Active users</p>
            </div>
            <div class="bg-green-50 rounded-xl p-4">
              <p class="text-2xl font-bold text-green-600">98.5%</p>
              <p class="text-xs text-gray-500 mt-1">Uptime</p>
            </div>
            <div class="bg-purple-50 rounded-xl p-4">
              <p class="text-2xl font-bold text-purple-600">1.2s</p>
              <p class="text-xs text-gray-500 mt-1">Avg response</p>
            </div>
          </div>
          <div class="w-full h-40 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"></div>
        </div>

        <div class="absolute -bottom-6 -left-8 bg-white rounded-xl border border-gray-200 p-4 shadow-lg flex items-center gap-3 w-64">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-white text-sm font-bold">+</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Deploy successful</p>
            <p class="text-xs text-gray-400">Production - 2m ago</p>
          </div>
        </div>

        <div class="absolute -top-4 -right-4 flex items-center">
          <div class="w-10 h-10 bg-indigo-400 rounded-full border-2 border-white"></div>
          <div class="w-10 h-10 bg-pink-400 rounded-full border-2 border-white -ml-3"></div>
          <div class="w-10 h-10 bg-amber-400 rounded-full border-2 border-white -ml-3"></div>
          <div class="w-10 h-10 bg-gray-300 rounded-full border-2 border-white -ml-3 flex items-center justify-center">
            <span class="text-xs font-bold text-gray-600">+5</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 3. TRUSTED BY logos                        -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-12 bg-white border-b border-gray-100">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <span class="text-xs text-gray-400 uppercase tracking-wider font-medium">Trusted by leading teams</span>
      <div class="flex items-center gap-8">
        <div class="w-24 h-8 bg-gray-100 rounded"></div>
        <div class="w-20 h-8 bg-gray-100 rounded"></div>
        <div class="w-28 h-8 bg-gray-100 rounded"></div>
        <div class="w-20 h-8 bg-gray-100 rounded"></div>
        <div class="w-24 h-8 bg-gray-100 rounded"></div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 4. FEATURES: Grid with mixed col spans     -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-20 bg-white">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Features</p>
      <h2 class="text-4xl font-bold text-gray-900">Everything you need to ship</h2>
      <p class="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">Powerful tools designed for modern development teams. From planning to production.</p>
    </div>

    <div class="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
      <div class="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <div class="w-6 h-6 bg-white rounded"></div>
          </div>
          <h3 class="text-2xl font-bold mb-2">Real-time Collaboration</h3>
          <p class="text-indigo-200 text-sm max-w-md">Work together seamlessly with live cursors, instant updates, and zero-conflict editing. Built for distributed teams.</p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-2xl p-8">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-green-500 rounded"></div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">CI/CD Pipeline</h3>
        <p class="text-sm text-gray-500">Automated builds, tests, and deployments. Push to deploy in seconds.</p>
      </div>

      <div class="bg-gray-50 rounded-2xl p-8">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-purple-500 rounded"></div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
        <p class="text-sm text-gray-500">Track performance, identify bottlenecks, and make data-driven decisions.</p>
      </div>

      <div class="bg-gray-50 rounded-2xl p-8">
        <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-amber-500 rounded"></div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Integrations</h3>
        <p class="text-sm text-gray-500">Connect with Slack, GitHub, Jira, and 200+ tools your team already uses.</p>
      </div>

      <div class="bg-gray-50 rounded-2xl p-8">
        <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-rose-500 rounded"></div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Security</h3>
        <p class="text-sm text-gray-500">SOC 2 compliant, end-to-end encryption, and role-based access controls.</p>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 5. HOW IT WORKS: 3-step flow               -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-20 bg-gray-50">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">How it works</p>
      <h2 class="text-4xl font-bold text-gray-900">Up and running in minutes</h2>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-3 gap-12">
      <div class="text-center">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span class="text-white text-2xl font-bold">1</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Connect your repo</h3>
        <p class="text-sm text-gray-500">Link your GitHub, GitLab, or Bitbucket repository in one click. We auto-detect your stack.</p>
      </div>

      <div class="text-center">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span class="text-white text-2xl font-bold">2</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Configure pipelines</h3>
        <p class="text-sm text-gray-500">Set up build, test, and deploy pipelines with our visual editor. No YAML needed.</p>
      </div>

      <div class="text-center">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span class="text-white text-2xl font-bold">3</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Ship with confidence</h3>
        <p class="text-sm text-gray-500">Preview deployments, run checks, and push to production. Rollback instantly if needed.</p>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 6. STATS: dark bg, space-between, max-w    -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="bg-gray-900 px-16 py-16">
    <div class="max-w-5xl mx-auto flex justify-between items-center">
      <div class="text-center">
        <p class="text-4xl font-extrabold text-white">10K+</p>
        <p class="text-sm text-gray-400 mt-2">Teams worldwide</p>
      </div>
      <div class="text-center">
        <p class="text-4xl font-extrabold text-white">50M+</p>
        <p class="text-sm text-gray-400 mt-2">Tasks completed</p>
      </div>
      <div class="text-center">
        <p class="text-4xl font-extrabold text-white">99.99%</p>
        <p class="text-sm text-gray-400 mt-2">Uptime</p>
      </div>
      <div class="text-center">
        <p class="text-4xl font-extrabold text-white">4.9/5</p>
        <p class="text-sm text-gray-400 mt-2">User rating</p>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 7. TESTIMONIALS: 3-column cards            -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-20 bg-gray-50">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Testimonials</p>
      <h2 class="text-4xl font-bold text-gray-900">Loved by teams everywhere</h2>
    </div>

    <div class="max-w-6xl mx-auto grid grid-cols-3 gap-8">
      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-indigo-100 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Sarah Chen</p>
            <p class="text-xs text-gray-400">CTO at Velocity</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"Nexus cut our deployment time by 60%. The automation engine is incredibly powerful and the UI is a joy to use."</p>
        <div class="flex gap-1 mt-4">
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-green-100 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Marcus Johnson</p>
            <p class="text-xs text-gray-400">VP Eng at CloudScale</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"We migrated our entire infrastructure pipeline to Nexus. The integrations are top-notch. Slack, GitHub, Jira, everything just works."</p>
        <div class="flex gap-1 mt-4">
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-purple-100 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Elena Rodriguez</p>
            <p class="text-xs text-gray-400">Engineering Lead at Prism</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"Security was our top concern. Nexus checked every box: SOC 2, GDPR, and the audit logs are fantastic."</p>
        <div class="flex gap-1 mt-4">
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 8. PRICING: 3-tier cards                   -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-20 bg-white">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Pricing</p>
      <h2 class="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
      <p class="text-lg text-gray-500 mt-4">No hidden fees. Cancel anytime.</p>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-3 gap-8">
      <!-- Free tier -->
      <div class="bg-white rounded-2xl p-8 border border-gray-200">
        <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Free</p>
        <div class="mt-4 mb-6">
          <span class="text-5xl font-extrabold text-gray-900">$0</span>
          <span class="text-sm text-gray-400 ml-1">/month</span>
        </div>
        <p class="text-sm text-gray-500 mb-8">For individuals and side projects.</p>
        <button class="w-full border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-semibold">Get Started</button>
        <div class="mt-8 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">Up to 3 projects</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">1 GB storage</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">Community support</span>
          </div>
        </div>
      </div>

      <!-- Pro tier (highlighted) -->
      <div class="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div class="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>
        <p class="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Pro</p>
        <div class="mt-4 mb-6">
          <span class="text-5xl font-extrabold text-white">$29</span>
          <span class="text-sm text-indigo-200 ml-1">/month</span>
        </div>
        <p class="text-sm text-indigo-200 mb-8">For growing teams that need more power.</p>
        <button class="w-full bg-white text-indigo-600 py-3 rounded-lg text-sm font-bold">Start Free Trial</button>
        <div class="mt-8 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-white rounded-full"></div></div>
            <span class="text-sm text-indigo-100">Unlimited projects</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-white rounded-full"></div></div>
            <span class="text-sm text-indigo-100">100 GB storage</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-white rounded-full"></div></div>
            <span class="text-sm text-indigo-100">Priority support</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-white rounded-full"></div></div>
            <span class="text-sm text-indigo-100">Advanced analytics</span>
          </div>
        </div>

        <div class="mt-8 bg-white/10 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-indigo-200">Team productivity</p>
            <p class="text-lg font-bold">+47%</p>
          </div>
          <div class="w-full h-2 bg-white/10 rounded-full mt-2">
            <div class="w-3/4 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Enterprise tier -->
      <div class="bg-white rounded-2xl p-8 border border-gray-200">
        <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Enterprise</p>
        <div class="mt-4 mb-6">
          <span class="text-5xl font-extrabold text-gray-900">Custom</span>
        </div>
        <p class="text-sm text-gray-500 mb-8">For organizations with advanced needs.</p>
        <button class="w-full border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-semibold">Contact Sales</button>
        <div class="mt-8 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">Everything in Pro</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">Unlimited storage</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">SSO + SAML</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">Dedicated support</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><div class="w-2 h-2 bg-green-500 rounded-full"></div></div>
            <span class="text-sm text-gray-600">Custom SLA</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 9. CTA BANNER: gradient with button        -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-16 py-24 text-center overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full opacity-20"></div>
    <div class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-72 h-72 bg-indigo-400 rounded-full opacity-20"></div>
    <div class="relative z-10 max-w-2xl mx-auto">
      <h2 class="text-4xl font-extrabold text-white mb-4">Ready to accelerate your workflow?</h2>
      <p class="text-lg text-indigo-200 mb-8">Join 10,000+ teams shipping faster with Nexus.</p>
      <div class="flex items-center justify-center gap-4">
        <button class="bg-white text-indigo-600 px-8 py-3.5 rounded-lg text-sm font-bold">Start Free Trial</button>
        <button class="border border-white/30 text-white px-8 py-3.5 rounded-lg text-sm font-semibold">Talk to Sales</button>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- 10. FOOTER: multi-column links             -->
  <!-- ═══════════════════════════════════════════ -->
  <footer class="bg-gray-900 px-16 py-16 text-gray-400">
    <div class="max-w-6xl mx-auto grid grid-cols-5 gap-8">
      <div class="col-span-2">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-sm font-bold">N</span>
          </div>
          <span class="text-lg font-bold text-white">Nexus</span>
        </div>
        <p class="text-sm text-gray-500 max-w-xs leading-relaxed">The all-in-one platform for modern teams. Build, ship, and scale with confidence.</p>
      </div>

      <div>
        <p class="text-sm font-semibold text-white mb-4">Product</p>
        <div class="flex flex-col gap-2">
          <a class="text-sm text-gray-400">Features</a>
          <a class="text-sm text-gray-400">Pricing</a>
          <a class="text-sm text-gray-400">Integrations</a>
          <a class="text-sm text-gray-400">Changelog</a>
        </div>
      </div>

      <div>
        <p class="text-sm font-semibold text-white mb-4">Company</p>
        <div class="flex flex-col gap-2">
          <a class="text-sm text-gray-400">About</a>
          <a class="text-sm text-gray-400">Blog</a>
          <a class="text-sm text-gray-400">Careers</a>
          <a class="text-sm text-gray-400">Press</a>
        </div>
      </div>

      <div>
        <p class="text-sm font-semibold text-white mb-4">Legal</p>
        <div class="flex flex-col gap-2">
          <a class="text-sm text-gray-400">Privacy</a>
          <a class="text-sm text-gray-400">Terms</a>
          <a class="text-sm text-gray-400">Security</a>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 flex items-center justify-between">
      <p class="text-xs text-gray-500">2025 Nexus Inc. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
        <div class="w-8 h-8 bg-gray-800 rounded-full"></div>
      </div>
    </div>
  </footer>

</div>`

const PAGE_WIDTH = 1440
const PREVIEW_GAP = 100
const PREVIEW_X = PAGE_WIDTH + PREVIEW_GAP // 1540 — right of the parsed frame

function createPageFrame(width: number = PAGE_WIDTH): FrameNode {
    return {
        id: crypto.randomUUID(),
        type: 'frame',
        name: 'Test Page',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width,
        height: 800,
        sizing: { horizontal: 'fixed', vertical: 'hug' },
        positioning: 'auto',
        opacity: 1,
        rotation: 0,
        overflow: 'hidden',
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
        fills: [{ type: 'solid', color: '#FFFFFF', opacity: 1, visible: true }],
        shadows: [],
        children: [],
        layout: { mode: 'flex', direction: 'column', gap: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }
}

/** Build an iframe srcdoc that renders the HTML with Tailwind CDN */
function buildIframeSrcdoc(htmlContent: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<script src="https://cdn.tailwindcss.com"><\/script>
<style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;}</style>
</head>
<body>${htmlContent}</body>
</html>`
}

/**
 * Overlay iframe that floats on the canvas, positioned using the same
 * zoom/pan CSS vars as real canvas nodes. Appears to the right of the
 * parsed frame with a 100px gap.
 */
function BrowserPreviewOverlay({ srcdoc }: { srcdoc: string }) {
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [iframeHeight, setIframeHeight] = useState(5000)

    // Poll iframe content height to auto-size
    useEffect(() => {
        if (!srcdoc) return
        const interval = setInterval(() => {
            try {
                const doc = iframeRef.current?.contentDocument
                if (doc?.body) {
                    const h = Math.max(
                        doc.body.scrollHeight,
                        doc.documentElement?.scrollHeight || 0,
                        doc.body.offsetHeight,
                    )
                    if (h > 0 && h !== iframeHeight) setIframeHeight(h)
                }
            } catch { /* cross-origin safety */ }
        }, 300)
        return () => clearInterval(interval)
    }, [srcdoc, iframeHeight])

    if (!srcdoc) return null

    // Position using same formula as canvas nodes:
    // left = canvasX * zoom + panX
    // top  = canvasY * zoom + panY
    const left = PREVIEW_X * zoom + panX
    const top = 0 * zoom + panY
    const width = PAGE_WIDTH * zoom
    const height = iframeHeight * zoom

    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                pointerEvents: 'none', // Let canvas events pass through
                zIndex: 10,
            }}
        >
            {/* Label above the preview */}
            <div style={{
                position: 'absolute',
                top: -24 * zoom,
                left: 0,
                fontSize: 12 * zoom,
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: 'system-ui, sans-serif',
                whiteSpace: 'nowrap',
            }}>
                Browser Preview (Ground Truth)
            </div>
            <iframe
                ref={iframeRef}
                srcDoc={srcdoc}
                style={{
                    width: PAGE_WIDTH,
                    height: iframeHeight,
                    border: 'none',
                    background: '#fff',
                    display: 'block',
                    transformOrigin: 'top left',
                    transform: `scale(${zoom})`,
                    pointerEvents: 'none', // All events go to canvas (zoom/pan)
                    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                }}
                sandbox="allow-scripts"
                title="Browser Preview"
            />
        </div>
    )
}

export default function ParserTestPage() {
    const [html, setHtml] = useState(DEFAULT_HTML)
    const [timing, setTiming] = useState<{ convert: number; parse: number } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const [iframeSrc, setIframeSrc] = useState<string>('')

    // Initialize editor store once on mount
    useEffect(() => {
        const store = useEditorStore.getState()
        if (store._projectId !== 'parser-test') {
            store.initForProject('parser-test')
        }
        setReady(true)
    }, [])

    const run = useCallback(async () => {
        if (!ready) return
        setLoading(true)
        setError(null)
        try {
            // Update browser preview
            setIframeSrc(buildIframeSrcdoc(html))

            // Step 1: Tailwind → inline styles
            const t0 = performance.now()
            const res = await fetch('/api/tailwind-to-inline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html }),
            })
            if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
            const { html: inlined } = await res.json()
            const convertMs = Math.round(performance.now() - t0)

            // Step 2: DOMParser → ScytleNode tree
            const t1 = performance.now()
            const { parseHtmlViaDOMParser } = await import('@/lib/parser/domparser')
            const parsed = await parseHtmlViaDOMParser(inlined, 'Section')
            const parseMs = Math.round(performance.now() - t1)

            // Step 3: Inject into canvas
            const store = useEditorStore.getState()
            store.setNodes([])

            const pageFrame = createPageFrame(PAGE_WIDTH)
            store.addNode(pageFrame)

            const newNode: ScytleNode = parsed.children.length === 1 ? parsed.children[0] : parsed
            newNode.width = PAGE_WIDTH
            newNode.sizing = { horizontal: 'fill', vertical: 'hug' }
            store.addNode(newNode, pageFrame.id)

            setTiming({ convert: convertMs, parse: parseMs })
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e))
        }
        setLoading(false)
    }, [html, ready])

    const clearCanvas = useCallback(() => {
        useEditorStore.getState().setNodes([])
        setIframeSrc('')
        setTiming(null)
    }, [])

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
            {/* Left: Code Editor Panel */}
            <div style={{
                width: 420,
                minWidth: 420,
                borderRight: '1px solid #e5e5e5',
                display: 'flex',
                flexDirection: 'column',
                background: '#fafafa',
            }}>
                {/* Toolbar */}
                <div style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#fff',
                }}>
                    <button
                        onClick={run}
                        disabled={loading || !ready}
                        style={{
                            padding: '7px 18px',
                            background: loading ? '#999' : '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {loading ? '⏳ Parsing...' : '▶ Parse & Render'}
                    </button>
                    <button
                        onClick={clearCanvas}
                        style={{
                            padding: '7px 14px',
                            background: '#fff',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Clear
                    </button>
                    {timing && (
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#999', marginLeft: 'auto' }}>
                            tw:{timing.convert}ms dom:{timing.parse}ms total:{timing.convert + timing.parse}ms
                        </span>
                    )}
                </div>

                {error && (
                    <div style={{
                        padding: '8px 12px',
                        background: '#fef2f2',
                        borderBottom: '1px solid #fecaca',
                        color: '#dc2626',
                        fontSize: 11,
                        fontFamily: 'monospace',
                    }}>
                        {error}
                    </div>
                )}

                {/* HTML Editor */}
                <textarea
                    value={html}
                    onChange={e => setHtml(e.target.value)}
                    spellCheck={false}
                    style={{
                        flex: 1,
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        border: 'none',
                        padding: 12,
                        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                        fontSize: 11,
                        lineHeight: 1.6,
                        resize: 'none',
                        outline: 'none',
                        tabSize: 2,
                    }}
                />
            </div>

            {/* Right: Canvas + Browser Preview Overlay */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {ready && <EditorCanvas showToolbar={false} />}
                {/* Browser preview floats on canvas at x=1540, same zoom/pan */}
                <BrowserPreviewOverlay srcdoc={iframeSrc} />
            </div>
        </div>
    )
}
