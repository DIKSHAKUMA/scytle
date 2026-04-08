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
  <!-- STICKY NAV with absolute-positioned dropdown -->
  <!-- ═══════════════════════════════════════════ -->
  <nav class="flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span class="text-white text-sm font-bold">N</span>
      </div>
      <span class="text-lg font-bold text-gray-900">Nexus</span>
    </div>
    <div class="flex items-center gap-6">
      <a class="text-sm font-medium text-gray-600">Platform</a>
      <a class="text-sm font-medium text-gray-600">Solutions</a>
      <a class="text-sm font-medium text-gray-600">Resources</a>
      <a class="text-sm font-medium text-gray-600">Pricing</a>
    </div>
    <div class="flex items-center gap-3">
      <a class="text-sm font-medium text-gray-700">Log in</a>
      <button class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">Get Started</button>
    </div>
  </nav>

  <!-- ═══════════════════════════════════════════ -->
  <!-- HERO: relative container with absolute decorations -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-16 py-24 overflow-hidden">
    <!-- Absolute decorative blobs -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"></div>
    <div class="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full opacity-20 translate-y-1/2 -translate-x-1/4"></div>

    <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
      <!-- Left: Text content -->
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
        <!-- Trust logos row -->
        <div class="flex items-center gap-6 mt-12">
          <span class="text-xs text-gray-400 uppercase tracking-wider font-medium">Trusted by</span>
          <div class="flex items-center gap-5">
            <div class="w-20 h-6 bg-gray-200 rounded"></div>
            <div class="w-16 h-6 bg-gray-200 rounded"></div>
            <div class="w-24 h-6 bg-gray-200 rounded"></div>
            <div class="w-18 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Right: Dashboard mockup with overlapping cards -->
      <div class="relative">
        <!-- Main dashboard card -->
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
          <!-- Stats grid inside dashboard -->
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
          <!-- Chart placeholder -->
          <div class="w-full h-40 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"></div>
        </div>

        <!-- Floating notification card (absolute, overlaps main) -->
        <div class="absolute -bottom-6 -left-8 bg-white rounded-xl border border-gray-200 p-4 shadow-lg flex items-center gap-3 w-64">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Deploy successful</p>
            <p class="text-xs text-gray-400">Production • 2m ago</p>
          </div>
        </div>

        <!-- Floating user avatars (absolute, top-right overlap) -->
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
  <!-- FEATURES: CSS Grid with mixed column spans -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-20 bg-white">
    <div class="text-center mb-16">
      <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Features</p>
      <h2 class="text-4xl font-bold text-gray-900">Everything you need to ship</h2>
      <p class="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">Powerful tools designed for modern development teams. From planning to production.</p>
    </div>

    <div class="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Feature 1: spans 2 cols -->
      <div class="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <div class="w-6 h-6 bg-white rounded"></div>
          </div>
          <h3 class="text-2xl font-bold mb-2">Real-time Collaboration</h3>
          <p class="text-indigo-200 text-sm max-w-md">Work together seamlessly with live cursors, instant updates, and zero-conflict editing. Built for distributed teams.</p>
        </div>
        <!-- Inline mockup -->
        <div class="relative z-10 mt-6 bg-white/10 rounded-xl p-4 backdrop-blur">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-6 h-6 bg-indigo-300 rounded-full"></div>
            <div class="w-32 h-3 bg-white/30 rounded"></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-pink-300 rounded-full"></div>
            <div class="w-48 h-3 bg-white/30 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Feature 2: single col, tall -->
      <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex flex-col justify-between">
        <div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <div class="w-6 h-6 bg-green-500 rounded"></div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Smart Automations</h3>
          <p class="text-sm text-gray-500">Set it and forget it. Trigger workflows based on events, schedules, or custom conditions.</p>
        </div>
        <div class="mt-6 flex items-center gap-2">
          <div class="w-full h-2 bg-green-200 rounded-full">
            <div class="w-3/4 h-2 bg-green-500 rounded-full"></div>
          </div>
          <span class="text-xs font-bold text-green-600">75%</span>
        </div>
      </div>

      <!-- Feature 3 -->
      <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-purple-500 rounded"></div>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
        <p class="text-sm text-gray-500">Deep insights into your team's performance with customizable dashboards.</p>
        <!-- Mini bar chart -->
        <div class="flex items-end gap-1.5 mt-6 h-16">
          <div class="w-6 h-4 bg-purple-200 rounded-t"></div>
          <div class="w-6 h-8 bg-purple-300 rounded-t"></div>
          <div class="w-6 h-12 bg-purple-400 rounded-t"></div>
          <div class="w-6 h-6 bg-purple-200 rounded-t"></div>
          <div class="w-6 h-16 bg-purple-500 rounded-t"></div>
          <div class="w-6 h-10 bg-purple-300 rounded-t"></div>
        </div>
      </div>

      <!-- Feature 4 -->
      <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-amber-500 rounded"></div>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Integrations</h3>
        <p class="text-sm text-gray-500">Connect with 200+ tools your team already uses.</p>
        <!-- Integration icons grid -->
        <div class="grid grid-cols-4 gap-2 mt-6">
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span class="text-xs font-bold text-indigo-600">+42</span>
          </div>
        </div>
      </div>

      <!-- Feature 5: spans 1 col but contains a nested 2-col grid -->
      <div class="bg-gray-900 rounded-2xl p-8 text-white">
        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
          <div class="w-6 h-6 bg-white rounded"></div>
        </div>
        <h3 class="text-xl font-bold mb-2">Security First</h3>
        <p class="text-sm text-gray-400">SOC 2 Type II certified. End-to-end encryption. Zero-trust architecture.</p>
        <div class="grid grid-cols-2 gap-3 mt-6">
          <div class="bg-white/5 rounded-lg p-3 text-center">
            <p class="text-lg font-bold text-green-400">256-bit</p>
            <p class="text-xs text-gray-500">Encryption</p>
          </div>
          <div class="bg-white/5 rounded-lg p-3 text-center">
            <p class="text-lg font-bold text-green-400">99.99%</p>
            <p class="text-xs text-gray-500">Uptime SLA</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- TESTIMONIALS: Masonry-like mixed grid -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="px-16 py-20 bg-gray-50">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-bold text-gray-900">Loved by teams everywhere</h2>
      <p class="text-lg text-gray-500 mt-3">Over 10,000 teams trust Nexus for their daily workflow.</p>
    </div>

    <div class="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Testimonial 1 -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-indigo-200 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Sarah Chen</p>
            <p class="text-xs text-gray-400">CTO at Velocity</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"Nexus cut our deployment time by 60%. The automation engine is incredibly powerful and the UI is a joy to use."</p>
        <div class="flex items-center gap-1 mt-4">
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
          <div class="w-4 h-4 bg-amber-400 rounded-sm"></div>
        </div>
      </div>

      <!-- Testimonial 2 (taller) -->
      <div class="bg-indigo-600 rounded-2xl p-6 text-white row-span-2">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-indigo-300 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold">Marcus Johnson</p>
            <p class="text-xs text-indigo-200">VP Eng at CloudScale</p>
          </div>
        </div>
        <p class="text-sm text-indigo-100 leading-relaxed">"We migrated our entire infrastructure pipeline to Nexus. The real-time collaboration alone saved us 20+ hours per sprint. The integrations are top-notch — Slack, GitHub, Jira, everything just works out of the box. I can't imagine going back."</p>
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

      <!-- Testimonial 3 -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-pink-200 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Aisha Patel</p>
            <p class="text-xs text-gray-400">Head of Product at Bloom</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"The analytics dashboard gives us visibility we never had before. We make better decisions faster."</p>
      </div>

      <!-- Testimonial 4 -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-green-200 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">David Kim</p>
            <p class="text-xs text-gray-400">Founder at Arcline</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"As a solo founder, Nexus automates 80% of what I used to do manually. It's like having a DevOps team on autopilot."</p>
      </div>

      <!-- Testimonial 5 -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-amber-200 rounded-full"></div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Elena Rodriguez</p>
            <p class="text-xs text-gray-400">Engineering Lead at Prism</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">"Security was our top concern. Nexus checked every box — SOC 2, GDPR, and the audit logs are fantastic."</p>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- STATS BANNER: Flex with dividers -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="bg-gray-900 px-16 py-16">
    <div class="flex items-center justify-between max-w-5xl mx-auto">
      <div class="text-center">
        <p class="text-5xl font-extrabold text-white">10K+</p>
        <p class="text-sm text-gray-400 mt-2">Teams worldwide</p>
      </div>
      <div class="w-px h-16 bg-gray-700"></div>
      <div class="text-center">
        <p class="text-5xl font-extrabold text-white">50M+</p>
        <p class="text-sm text-gray-400 mt-2">Tasks completed</p>
      </div>
      <div class="w-px h-16 bg-gray-700"></div>
      <div class="text-center">
        <p class="text-5xl font-extrabold text-white">99.99%</p>
        <p class="text-sm text-gray-400 mt-2">Uptime</p>
      </div>
      <div class="w-px h-16 bg-gray-700"></div>
      <div class="text-center">
        <p class="text-5xl font-extrabold text-white">4.9/5</p>
        <p class="text-sm text-gray-400 mt-2">User rating</p>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- CTA: Gradient background with nested layout -->
  <!-- ═══════════════════════════════════════════ -->
  <section class="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-16 py-24 text-center overflow-hidden">
    <!-- Decorative grid dots (absolute) -->
    <div class="absolute inset-0 opacity-10">
      <div class="grid grid-cols-12 gap-8 h-full px-16 py-16">
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
    <div class="relative z-10">
      <h2 class="text-5xl font-extrabold text-white leading-tight">Ready to transform<br/>your workflow?</h2>
      <p class="text-lg text-indigo-200 mt-6 max-w-xl mx-auto">Join 10,000+ teams already building faster with Nexus. Free 14-day trial, no credit card required.</p>
      <div class="flex items-center justify-center gap-4 mt-10">
        <button class="bg-white text-indigo-700 px-8 py-4 rounded-lg text-sm font-bold shadow-lg">Start Free Trial</button>
        <button class="border border-white/30 text-white px-8 py-4 rounded-lg text-sm font-semibold">Schedule a Demo</button>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════ -->
  <!-- FOOTER: Complex multi-column grid -->
  <!-- ═══════════════════════════════════════════ -->
  <footer class="bg-gray-900 px-16 py-16 text-gray-400">
    <div class="grid grid-cols-5 gap-8 max-w-6xl mx-auto">
      <!-- Brand col -->
      <div class="col-span-2">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg"></div>
          <span class="text-lg font-bold text-white">Nexus</span>
        </div>
        <p class="text-sm text-gray-500 max-w-xs leading-relaxed">The modern platform for teams who build. Automate, collaborate, and ship with confidence.</p>
        <div class="flex items-center gap-3 mt-6">
          <div class="w-8 h-8 bg-gray-800 rounded-lg"></div>
          <div class="w-8 h-8 bg-gray-800 rounded-lg"></div>
          <div class="w-8 h-8 bg-gray-800 rounded-lg"></div>
          <div class="w-8 h-8 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
      <!-- Links col 1 -->
      <div>
        <p class="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Product</p>
        <ul class="space-y-3 text-sm">
          <li>Features</li>
          <li>Pricing</li>
          <li>Integrations</li>
          <li>Changelog</li>
          <li>Roadmap</li>
        </ul>
      </div>
      <!-- Links col 2 -->
      <div>
        <p class="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Company</p>
        <ul class="space-y-3 text-sm">
          <li>About</li>
          <li>Blog</li>
          <li>Careers</li>
          <li>Press</li>
        </ul>
      </div>
      <!-- Links col 3 -->
      <div>
        <p class="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">Support</p>
        <ul class="space-y-3 text-sm">
          <li>Help Center</li>
          <li>Documentation</li>
          <li>API Reference</li>
          <li>Status</li>
          <li>Contact</li>
        </ul>
      </div>
    </div>
    <!-- Bottom bar -->
    <div class="border-t border-gray-800 mt-12 pt-8 flex items-center justify-between max-w-6xl mx-auto">
      <p class="text-xs text-gray-500">© 2026 Nexus Inc. All rights reserved.</p>
      <div class="flex items-center gap-6">
        <a class="text-xs text-gray-500">Privacy Policy</a>
        <a class="text-xs text-gray-500">Terms of Service</a>
        <a class="text-xs text-gray-500">Cookie Settings</a>
      </div>
    </div>
  </footer>

  <!-- ═══════════════════════════════════════════ -->
  <!-- STRESS TEST: Absolute Positioning Patterns  -->
  <!-- Tests all fixed bugs + edge cases            -->
  <!-- ═══════════════════════════════════════════ -->

  <!-- TEST 1: All four corners + translate combinations -->
  <section class="relative bg-slate-100 px-16 py-20 overflow-hidden">
    <div class="text-center mb-8">
      <p class="text-xs font-bold text-red-500 uppercase tracking-widest">⚡ Stress Test 1</p>
      <h2 class="text-3xl font-bold text-gray-900 mt-2">Four Corner Blobs + Translate</h2>
    </div>
    <!-- Top-left: no translate -->
    <div class="absolute top-0 left-0 w-32 h-32 bg-red-300 rounded-full opacity-30"></div>
    <!-- Top-right: translate-x-1/4 -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-blue-300 rounded-full opacity-30 translate-x-1/4"></div>
    <!-- Bottom-left: -translate-x-1/3 translate-y-1/2 -->
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-green-300 rounded-full opacity-30 -translate-x-1/3 translate-y-1/2"></div>
    <!-- Bottom-right: translate-x-1/2 translate-y-1/4 -->
    <div class="absolute bottom-0 right-0 w-36 h-36 bg-purple-300 rounded-full opacity-30 translate-x-1/2 translate-y-1/4"></div>
    <!-- Center absolute: top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-400 rounded-xl opacity-40"></div>

    <div class="relative z-10 max-w-4xl mx-auto text-center">
      <p class="text-gray-600">This section has 5 absolute blobs: TL, TR, BL, BR, and one centered via top-1/2 left-1/2 -translate-x/y-1/2. All should be partially clipped by overflow-hidden.</p>
    </div>
  </section>

  <!-- TEST 2: Overlapping cards with negative offsets -->
  <section class="px-16 py-20 bg-white">
    <div class="text-center mb-8">
      <p class="text-xs font-bold text-red-500 uppercase tracking-widest">⚡ Stress Test 2</p>
      <h2 class="text-3xl font-bold text-gray-900 mt-2">Overlapping Cards (Negative Offsets)</h2>
    </div>
    <div class="max-w-5xl mx-auto grid grid-cols-2 gap-12">
      <!-- Card with 3 absolute overlapping elements -->
      <div class="relative">
        <div class="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 shadow-xl">
          <h3 class="text-xl font-bold text-white mb-2">Primary Card</h3>
          <p class="text-sm text-violet-200">This card has overlapping badges at all edges.</p>
          <div class="mt-4 h-32 bg-white/10 rounded-xl"></div>
        </div>
        <!-- Top-left badge -->
        <div class="absolute -top-3 -left-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
          <span class="text-white text-xs font-bold">1</span>
        </div>
        <!-- Top-right badge -->
        <div class="absolute -top-3 -right-3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span class="text-white text-xs font-bold">2</span>
        </div>
        <!-- Bottom-right floating card -->
        <div class="absolute -bottom-4 -right-6 bg-white rounded-xl p-3 shadow-lg border border-gray-200 flex items-center gap-2">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">✓</span>
          </div>
          <span class="text-sm font-semibold text-gray-900">Verified</span>
        </div>
      </div>

      <!-- Card with centered absolute overlay -->
      <div class="relative">
        <div class="bg-gray-100 rounded-2xl p-8 border border-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Background Card</h3>
          <p class="text-sm text-gray-500">Has a centered play button overlay.</p>
          <div class="mt-4 h-32 bg-gray-200 rounded-xl"></div>
        </div>
        <!-- Centered play button -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div class="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-indigo-600 ml-1"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- TEST 3: Col-span variations in grid -->
  <section class="px-16 py-20 bg-gray-50">
    <div class="text-center mb-8">
      <p class="text-xs font-bold text-red-500 uppercase tracking-widest">⚡ Stress Test 3</p>
      <h2 class="text-3xl font-bold text-gray-900 mt-2">Grid Col-Span + Absolute Children</h2>
    </div>
    <div class="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
      <!-- col-span-3: wide card with absolute badge -->
      <div class="col-span-3 relative bg-indigo-600 rounded-2xl p-6 text-white overflow-hidden">
        <div class="absolute top-0 right-0 w-48 h-48 bg-indigo-400 rounded-full opacity-40 translate-x-1/4 -translate-y-1/4"></div>
        <div class="relative z-10">
          <h3 class="text-lg font-bold">Wide Card (col-span-3)</h3>
          <p class="text-indigo-200 text-sm mt-1">Decorative circle should be at top-right corner.</p>
        </div>
        <div class="absolute -bottom-2 left-4 bg-white text-indigo-600 rounded-full px-3 py-1 text-xs font-bold shadow-md">NEW</div>
      </div>
      <!-- col-span-1: narrow card -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 class="text-lg font-bold text-gray-900">Narrow</h3>
        <p class="text-gray-500 text-sm mt-1">col-span-1</p>
      </div>
      <!-- col-span-2: medium cards -->
      <div class="col-span-2 relative bg-emerald-600 rounded-2xl p-6 text-white overflow-hidden">
        <div class="absolute -top-6 -right-6 w-32 h-32 bg-emerald-400 rounded-full opacity-50"></div>
        <div class="relative z-10">
          <h3 class="text-lg font-bold">Medium (col-span-2)</h3>
          <p class="text-emerald-200 text-sm mt-1">Circle at top-right with negative offsets.</p>
        </div>
      </div>
      <div class="col-span-2 relative bg-amber-500 rounded-2xl p-6 text-white">
        <h3 class="text-lg font-bold">Medium (col-span-2)</h3>
        <p class="text-amber-100 text-sm mt-1">No absolute children.</p>
        <div class="absolute bottom-0 right-0 w-20 h-20 bg-amber-300 rounded-tl-3xl opacity-50"></div>
      </div>
    </div>
  </section>

  <!-- TEST 4: Deeply nested absolute positioning -->
  <section class="px-16 py-20 bg-white">
    <div class="text-center mb-8">
      <p class="text-xs font-bold text-red-500 uppercase tracking-widest">⚡ Stress Test 4</p>
      <h2 class="text-3xl font-bold text-gray-900 mt-2">Deep Nesting + Multiple Absolute Layers</h2>
    </div>
    <div class="max-w-4xl mx-auto">
      <!-- Outer relative container -->
      <div class="relative bg-gray-100 rounded-3xl p-8 border border-gray-200">
        <!-- Outer absolute blob -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-pink-200 rounded-full opacity-20 translate-x-1/3 -translate-y-1/3"></div>

        <div class="relative z-10 grid grid-cols-2 gap-8">
          <!-- Left column with its own nested absolute -->
          <div class="relative bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Nested Level 1</h3>
            <p class="text-sm text-gray-500 mb-4">This card is inside the outer relative container.</p>
            <!-- Inner relative container -->
            <div class="relative bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-600 mb-8">Nested Level 2 - has its own absolute children.</p>
              <!-- Absolute within nested -->
              <div class="absolute -bottom-3 -right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <!-- Absolute on level 1 card -->
            <div class="absolute -top-2 -left-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-xs font-bold shadow">HOT</div>
          </div>

          <!-- Right column -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Right Column</h3>
            <p class="text-sm text-gray-500">No absolute children here. Just content to establish height for the grid row.</p>
            <div class="mt-4 space-y-2">
              <div class="h-3 bg-gray-200 rounded-full w-full"></div>
              <div class="h-3 bg-gray-200 rounded-full w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded-full w-5/6"></div>
              <div class="h-3 bg-gray-200 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TEST 5: Notification/Toast-style absolute elements -->
  <section class="relative px-16 py-20 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
    <div class="text-center mb-8">
      <p class="text-xs font-bold text-red-400 uppercase tracking-widest">⚡ Stress Test 5</p>
      <h2 class="text-3xl font-bold text-white mt-2">Edge-Pinned Elements (like Toasts)</h2>
    </div>
    <!-- Top-left notification -->
    <div class="absolute top-4 left-4 bg-white rounded-xl p-3 shadow-lg flex items-center gap-2 w-56">
      <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <span class="text-white text-xs font-bold">i</span>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-900">Top-Left Toast</p>
        <p class="text-xs text-gray-400">Pinned top + left</p>
      </div>
    </div>
    <!-- Top-right notification -->
    <div class="absolute top-4 right-4 bg-white rounded-xl p-3 shadow-lg flex items-center gap-2 w-56">
      <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <span class="text-white text-xs font-bold">✓</span>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-900">Top-Right Toast</p>
        <p class="text-xs text-gray-400">Pinned top + right</p>
      </div>
    </div>
    <!-- Bottom-left notification -->
    <div class="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-lg flex items-center gap-2 w-56">
      <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <span class="text-white text-xs font-bold">⚠</span>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-900">Bottom-Left Toast</p>
        <p class="text-xs text-gray-400">Pinned bottom + left</p>
      </div>
    </div>
    <!-- Bottom-right notification -->
    <div class="absolute bottom-4 right-4 bg-white rounded-xl p-3 shadow-lg flex items-center gap-2 w-56">
      <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <span class="text-white text-xs font-bold">✕</span>
      </div>
      <div>
        <p class="text-xs font-semibold text-gray-900">Bottom-Right Toast</p>
        <p class="text-xs text-gray-400">Pinned bottom + right</p>
      </div>
    </div>

    <div class="relative z-10 text-center max-w-2xl mx-auto">
      <p class="text-slate-300 text-sm leading-relaxed">Four toasts pinned to each corner with top/bottom + left/right. No translate, just direct edge pinning. Tests that right: and bottom: calculate correctly against parent dimensions.</p>
    </div>
  </section>
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
