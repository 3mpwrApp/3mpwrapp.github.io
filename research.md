---
layout: default
title: Research
description: Interactive data visualizations and research tools analyzing tribunal decisions, denial patterns, and workers' rights across Canada. Open source, transparent methodology.
---

<style>
  /* Research Page - Accessible Design for Light, Dark, and High Contrast Modes */
  
  .research-hero {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
    color: #ffffff;
    border-radius: 16px;
    margin-bottom: 3rem;
  }
  
  .research-hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #ffffff !important;
  }
  
  .research-hero .hero-subtitle {
    font-size: 1.3rem;
    max-width: 800px;
    margin: 0 auto;
    opacity: 0.95;
    color: #ffffff !important;
  }
  
  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .research-hero {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    }
  }
  
  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .research-hero {
      background: #000000;
      border: 3px solid #ffffff;
    }
    .research-hero h1,
    .research-hero .hero-subtitle {
      color: #ffffff !important;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    .research-hero {
      background: #000000;
      border: 3px solid #ffffff;
    }
  }

  .research-page {
    --rp-panel-bg: #ffffff;
    --rp-panel-text: #111111;
    --rp-panel-muted: #374151;
    --rp-panel-link: #003d7a;
    --rp-panel-border: #d7e1ec;
    --rp-callout-bg: #eef4ff;
    --rp-callout-border: #455a64;
    --rp-callout-accent: #263238;
    --rp-callout-muted: #425466;
    --rp-cta-bg: #263238;
    --rp-cta-text: #ffffff;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) .research-page {
      --rp-panel-bg: #16202b;
      --rp-panel-text: #f5f7fa;
      --rp-panel-muted: #d7dee7;
      --rp-panel-link: #9ecbff;
      --rp-panel-border: #3b4d61;
      --rp-callout-bg: #142133;
      --rp-callout-border: #8aa4bf;
      --rp-callout-accent: #f5f7fa;
      --rp-callout-muted: #d7dee7;
      --rp-cta-bg: #8aa4bf;
      --rp-cta-text: #08111b;
    }
  }

  [data-theme="dark"] .research-page,
  .dark-mode .research-page {
    --rp-panel-bg: #16202b;
    --rp-panel-text: #f5f7fa;
    --rp-panel-muted: #d7dee7;
    --rp-panel-link: #9ecbff;
    --rp-panel-border: #3b4d61;
    --rp-callout-bg: #142133;
    --rp-callout-border: #8aa4bf;
    --rp-callout-accent: #f5f7fa;
    --rp-callout-muted: #d7dee7;
    --rp-cta-bg: #8aa4bf;
    --rp-cta-text: #08111b;
  }

  @media (prefers-contrast: more), (prefers-contrast: high) {
    .research-page {
      --rp-panel-bg: #000000;
      --rp-panel-text: #ffffff;
      --rp-panel-muted: #ffffff;
      --rp-panel-link: #ffff00;
      --rp-panel-border: #ffffff;
      --rp-callout-bg: #000000;
      --rp-callout-border: #ffffff;
      --rp-callout-accent: #ffffff;
      --rp-callout-muted: #ffffff;
      --rp-cta-bg: #ffff00;
      --rp-cta-text: #000000;
    }
  }

  .research-page :is(
    div[style*="background: white"],
    div[style*="background: #ffffff"],
    div[style*="background: #f0f7ff"],
    div[style*="background: #f1f8e9"],
    div[style*="background: #e8f0fe"],
    div[style*="background: #e3f2fd"],
    div[style*="background: #f3e5f5"],
    div[style*="background: #e8f5e9"],
    div[style*="background: #ffebee"],
    div[style*="background: #eceff1"],
    div[style*="background: #fff3cd"],
    div[style*="background: #fff3e0"],
    div[style*="background: #f5f5f5"],
    tr[style*="background: #f5f5f5"],
    div[style*="background: #f0f9ff"],
    div[style*="background: #f0fdf4"],
    div[style*="background: #fef3c7"],
    div[style*="background: #fef2f2"]
  ) {
    background: var(--rp-panel-bg) !important;
    color: var(--rp-panel-text) !important;
    border-color: var(--rp-panel-border) !important;
  }

  .research-page :is(
    div[style*="background: white"],
    div[style*="background: #ffffff"],
    div[style*="background: #f0f7ff"],
    div[style*="background: #f1f8e9"],
    div[style*="background: #e8f0fe"],
    div[style*="background: #e3f2fd"],
    div[style*="background: #f3e5f5"],
    div[style*="background: #e8f5e9"],
    div[style*="background: #ffebee"],
    div[style*="background: #eceff1"],
    div[style*="background: #fff3cd"],
    div[style*="background: #fff3e0"],
    div[style*="background: #f5f5f5"],
    tr[style*="background: #f5f5f5"],
    div[style*="background: #f0f9ff"],
    div[style*="background: #f0fdf4"],
    div[style*="background: #fef3c7"],
    div[style*="background: #fef2f2"]
  ) :is(h2, h3, h4, p, li, small, span, strong, em, td, th, ul, ol) {
    color: var(--rp-panel-text) !important;
  }

  .research-page :is(
    div[style*="background: white"],
    div[style*="background: #ffffff"],
    div[style*="background: #f0f7ff"],
    div[style*="background: #f1f8e9"],
    div[style*="background: #e8f0fe"],
    div[style*="background: #e3f2fd"],
    div[style*="background: #f3e5f5"],
    div[style*="background: #e8f5e9"],
    div[style*="background: #ffebee"],
    div[style*="background: #eceff1"],
    div[style*="background: #fff3cd"],
    div[style*="background: #fff3e0"],
    div[style*="background: #f5f5f5"],
    tr[style*="background: #f5f5f5"],
    div[style*="background: #f0f9ff"],
    div[style*="background: #f0fdf4"],
    div[style*="background: #fef3c7"],
    div[style*="background: #fef2f2"]
  ) a:not([style*="background"]):not(.research-cta):not(.onca-card-link) {
    color: var(--rp-panel-link) !important;
  }

  .research-onca-callout {
    background: var(--rp-callout-bg);
    border: 2px solid var(--rp-callout-border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .research-onca-callout h3,
  .research-onca-callout p,
  .research-onca-callout li,
  .research-onca-callout strong {
    color: var(--rp-callout-accent) !important;
  }

  .research-onca-callout .research-onca-muted {
    color: var(--rp-callout-muted) !important;
  }

  .research-onca-callout a:not(.research-cta) {
    color: var(--rp-panel-link) !important;
  }

  .research-cta {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: #263238 !important;
    color: #ffffff !important;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 700;
  }

  .research-page a.research-cta,
  .research-page a.research-cta:visited,
  .research-page a.research-cta:hover,
  .research-page a.research-cta:focus {
    background: #263238 !important;
    color: #ffffff !important;
  }

  [data-theme="dark"] .research-page a.research-cta,
  .dark-mode .research-page a.research-cta {
    background: #8aa4bf !important;
    color: #08111b !important;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) .research-page a.research-cta {
      background: #8aa4bf !important;
      color: #08111b !important;
    }
  }

  @media (prefers-contrast: more), (prefers-contrast: high) {
    .research-page a.research-cta {
      background: #ffff00 !important;
      color: #000000 !important;
      border: 2px solid #000000 !important;
    }
  }

  .research-page a[style*="background: #667eea"] {
    background: #3949ab !important;
    color: #ffffff !important;
  }

  .research-cta:hover {
    text-decoration: none;
  }

  .onca-card-link {
    background: #455a64 !important;
    color: #ffffff !important;
    text-decoration: none;
  }

  [data-theme="dark"] .onca-card-link,
  .dark-mode .onca-card-link {
    background: #546e7a !important;
    color: #ffffff !important;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) .onca-card-link {
      background: #546e7a !important;
      color: #ffffff !important;
    }
  }

  @media (prefers-contrast: more), (prefers-contrast: high) {
    .onca-card-link {
      background: #000000 !important;
      color: #ffff00 !important;
      border: 2px solid #ffff00 !important;
    }
  }
  
  .tool-card {
    background: #ffffff;
    color: #111111;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    transition: all 0.3s;
  }
  
  .tool-card h3,
  .tool-card h4 {
    color: #111111;
  }
  
  .tool-card p,
  .tool-card li {
    color: #333333;
  }
  
  .tool-card a {
    color: #0066CC;
    text-decoration: underline;
  }
  
  .tool-card:hover {
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
  
  .tool-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    background: #3949ab;
    color: #ffffff;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  /* Badge color variants - AAA compliant */
  .tool-badge.badge-green {
    background: #005a00;
    color: #ffffff;
  }
  
  .tool-badge.badge-purple {
    background: #5a189a;
    color: #ffffff;
  }
  
  .tool-badge.badge-red {
    background: #b71c1c;
    color: #ffffff;
  }
  
  .tool-badge.badge-orange {
    background: #e65100;
    color: #ffffff;
  }
  
  .tool-badge.coming-soon {
    background: #757575;
    color: #ffffff;
  }
  
  /* Dark Mode - Brighter variants */
  @media (prefers-color-scheme: dark) {
    .tool-badge {
      background: #818cf8;
      color: #000000;
    }
    
    .tool-badge.badge-green {
      background: #22c55e;
      color: #000000;
    }
    
    .tool-badge.badge-purple {
      background: #a855f7;
      color: #000000;
    }
    
    .tool-badge.badge-red {
      background: #ef4444;
      color: #000000;
    }
    
    .tool-badge.badge-orange {
      background: #f97316;
      color: #000000;
    }
    
    .tool-badge.coming-soon {
      background: #9ca3af;
      color: #000000;
    }
  }
  
  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .tool-badge {
      border: 2px solid #ffffff;
      font-weight: 700;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    .tool-badge {
      background: #ffffff;
      color: #000000;
      border: 2px solid #000000;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .stat-box {
    text-align: center;
    padding: 1.5rem;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    color: white;
    border: 2px solid rgba(255,255,255,0.2);
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: white;
  }
  
  .stat-box small {
    opacity: 1;
    color: rgba(255,255,255,0.95);
  }
  
  /* Colored stat boxes - Light mode */
  .stat-box-green {
    background: #166534;
    color: #ffffff;
    border-color: #14532d;
  }
  
  .stat-box-blue {
    background: #1e40af;
    color: #ffffff;
    border-color: #1e3a8a;
  }
  
  .stat-box-purple {
    background: #6b21a8;
    color: #ffffff;
    border-color: #581c87;
  }
  
  .stat-box-orange {
    background: #9a3412;
    color: #ffffff;
    border-color: #7c2d12;
  }
  
  /* Dark Mode - Stat boxes */
  @media (prefers-color-scheme: dark) {
    .stat-box-green {
      background: #166534;
      border-color: #14532d;
    }
    
    .stat-box-blue {
      background: #1e40af;
      border-color: #1e3a8a;
    }
    
    .stat-box-purple {
      background: #7e22ce;
      border-color: #6b21a8;
    }
    
    .stat-box-orange {
      background: #c2410c;
      border-color: #9a3412;
    }
  }
  
  /* High Contrast Mode - Stat boxes */
  @media (prefers-contrast: high) {
    .stat-box {
      background: #000000;
      color: #ffffff;
      border: 3px solid #ffffff;
    }
    
    .stat-box-green,
    .stat-box-blue,
    .stat-box-purple,
    .stat-box-orange {
      background: #000000;
      color: #ffffff;
      border: 3px solid #ffffff;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    .stat-box,
    .stat-box-green,
    .stat-box-blue,
    .stat-box-purple,
    .stat-box-orange {
      background: #000000;
      color: #ffffff;
      border: 3px solid #ffffff;
    }
  }
  
  .category-box {
    background: #f0f4f8;
    color: #111111;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .category-box strong {
    color: inherit;
  }
  
  .category-box a {
    color: #0066CC;
  }
  
  /* Dark Mode Support */
  @media (prefers-color-scheme: dark) {
    .tool-card {
      background: #1a1a1a !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    
    .tool-card h3,
    .tool-card h4 {
      color: #ffffff !important;
    }
    
    .tool-card p,
    .tool-card li {
      color: #d0d0d0 !important;
    }
    
    .tool-card a {
      color: #4DB8FF !important;
    }
    
    .tool-card:hover {
      border-color: #667eea !important;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3) !important;
    }
    
    .category-box {
      background: #2a2a2a !important;
      color: #e0e0e0 !important;
    }
    
    .category-box a {
      color: #4DB8FF !important;
    }
    
    /* Override inline styles in dark mode */
    p[style*="color: #666"],
    small[style*="color: #666"],
    h3[style*="color: #666"] {
      color: #b0b0b0 !important;
    }
    
    div[style*="background: #fff3e0"] {
      background: #2d2416 !important;
      color: #e0e0e0 !important;
      border-left-color: #ff9800 !important;
    }
  }
  
  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .tool-card {
      border: 3px solid currentColor !important;
      background: #ffffff !important;
      color: #000000 !important;
    }
    
    .tool-card h3,
    .tool-card h4,
    .tool-card p,
    .tool-card li {
      color: #000000 !important;
    }
    
    .tool-badge {
      border: 2px solid white !important;
    }
    
    p[style*="color: #666"],
    small[style*="color: #666"],
    h3[style*="color: #666"] {
      color: #000000 !important;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    .tool-card {
      background: #000000 !important;
      color: #ffffff !important;
      border: 3px solid #ffffff !important;
    }
    
    .tool-card h3,
    .tool-card h4,
    .tool-card p,
    .tool-card li {
      color: #ffffff !important;
    }
    
    p[style*="color: #666"],
    small[style*="color: #666"],
    h3[style*="color: #666"] {
      color: #ffffff !important;
    }
    
    div[style*="background: #fff3e0"] {
      background: #000000 !important;
      color: #ffffff !important;
      border: 3px solid #ffffff !important;
    }
  }
  
  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .tool-card {
      transition: none;
    }
    
    .tool-card:hover {
      transform: none;
    }
  }
  
  /* ============================================================================
     TABLES - Accessible styling for all color modes
     ============================================================================ */
  
  .research-table {
    background: #ffffff;
    color: #000000;
    border: 2px solid #cccccc;
  }
  
  .research-table thead tr {
    background: #f0f0f0;
    border-bottom: 3px solid #999999;
  }
  
  .research-table th {
    color: #000000;
    font-weight: 700;
  }
  
  .research-table tbody tr {
    border-bottom: 1px solid #dddddd;
  }
  
  .research-table tbody tr:hover {
    background: #f9f9f9;
  }
  
  .research-table td,
  .research-table th {
    color: #000000;
  }
  
  .research-table small {
    color: #333333;
  }
  
  .table-caption {
    color: #333333;
  }
  
  /* Win rate color classes */
  .win-rate-high {
    color: #006600;
    font-weight: bold;
  }
  
  .win-rate-medium {
    color: #0066cc;
    font-weight: bold;
  }
  
  .win-rate-varies {
    color: #cc6600;
    font-weight: bold;
  }
  
  /* Dark Mode - Tables */
  @media (prefers-color-scheme: dark) {
    .research-table {
      background: #1a1a1a;
      color: #e0e0e0;
      border-color: #444444;
    }
    
    .research-table thead tr {
      background: #2a2a2a;
      border-bottom-color: #555555;
    }
    
    .research-table th {
      color: #ffffff;
    }
    
    .research-table tbody tr {
      border-bottom-color: #333333;
    }
    
    .research-table tbody tr:hover {
      background: #252525;
    }
    
    .research-table td,
    .research-table th {
      color: #e0e0e0;
    }
    
    .research-table small {
      color: #cccccc;
    }
    
    .table-caption {
      color: #cccccc;
    }
    
    .win-rate-high {
      color: #4ade80;
    }
    
    .win-rate-medium {
      color: #60a5fa;
    }
    
    .win-rate-varies {
      color: #fb923c;
    }
  }
  
  /* High Contrast Mode - Tables */
  @media (prefers-contrast: high) {
    .research-table {
      background: #ffffff;
      color: #000000;
      border: 3px solid #000000;
    }
    
    .research-table thead tr {
      background: #ffffff;
      border-bottom: 4px solid #000000;
    }
    
    .research-table tbody tr {
      border-bottom: 2px solid #000000;
    }
    
    .research-table th,
    .research-table td,
    .research-table small,
    .table-caption {
      color: #000000;
    }
    
    .win-rate-high,
    .win-rate-medium,
    .win-rate-varies {
      color: #000000;
      background: #ffff00;
      padding: 2px 6px;
      border: 2px solid #000000;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    .research-table {
      background: #000000;
      color: #ffffff;
      border: 3px solid #ffffff;
    }
    
    .research-table thead tr {
      background: #000000;
      border-bottom: 4px solid #ffffff;
    }
    
    .research-table tbody tr {
      border-bottom: 2px solid #ffffff;
    }
    
    .research-table th,
    .research-table td,
    .research-table small,
    .table-caption {
      color: #ffffff;
    }
    
    .win-rate-high {
      color: #000000;
      background: #00ff00;
    }
    
    .win-rate-medium {
      color: #000000;
      background: #00ffff;
    }
    
    .win-rate-varies {
      color: #000000;
      background: #ffff00;
    }
  }
  
  /* ============================================================================
     AI PREDICTIONS SECTION - Hero card styling
     ============================================================================ */
  
  .ai-predictions-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    margin-bottom: 2rem;
  }
  
  .ai-predictions-hero h3,
  .ai-predictions-hero p,
  .ai-predictions-hero strong {
    color: #ffffff !important;
  }
  
  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .ai-predictions-hero {
      background: linear-gradient(135deg, #4338ca 0%, #5b21b6 100%);
    }
  }
  
  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .ai-predictions-hero {
      background: #000000;
      border: 3px solid #ffffff;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    .ai-predictions-hero {
      background: #000000;
      border: 3px solid #ffffff;
    }
  }
  
  /* ============================================================================
     INLINE TEXT STYLES - Responsive color for all modes
     ============================================================================ */
  
  /* Light mode - #666 and #333 are acceptable */
  
  /* Dark Mode - Lighten ALL gray text elements */
  @media (prefers-color-scheme: dark) {
    /* Override color: #666 (gray) - hard to read in dark mode */
    p[style*="color: #666"],
    small[style*="color: #666"],
    h3[style*="color: #666"],
    h4[style*="color: #666"],
    div[style*="color: #666"],
    span[style*="color: #666"],
    li[style*="color: #666"],
    ul[style*="color: #666"] {
      color: #cccccc !important;
    }
    
    /* Override color: #333 (dark gray) - also hard to read in dark mode */
    p[style*="color: #333"],
    small[style*="color: #333"],
    h3[style*="color: #333"],
    h4[style*="color: #333"],
    div[style*="color: #333"],
    span[style*="color: #333"],
    li[style*="color: #333"],
    ul[style*="color: #333"] {
      color: #d0d0d0 !important;
    }
    
    /* Override low-opacity rgba colors */
    [style*="rgba(255,255,255,0.3)"] {
      background: rgba(255,255,255,0.5) !important;
    }
  }
  
  /* High Contrast Mode - Maximum readability */
  @media (prefers-contrast: high) {
    p[style*="color: #666"],
    small[style*="color: #666"],
    h3[style*="color: #666"],
    h4[style*="color: #666"],
    div[style*="color: #666"],
    span[style*="color: #666"],
    li[style*="color: #666"],
    ul[style*="color: #666"],
    p[style*="color: #333"],
    small[style*="color: #333"],
    h3[style*="color: #333"],
    h4[style*="color: #333"],
    div[style*="color: #333"],
    span[style*="color: #333"],
    li[style*="color: #333"],
    ul[style*="color: #333"] {
      color: #000000 !important;
    }
  }
  
  @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
    p[style*="color: #666"],
    small[style*="color: #666"],
    h3[style*="color: #666"],
    h4[style*="color: #666"],
    div[style*="color: #666"],
    span[style*="color: #666"],
    li[style*="color: #666"],
    ul[style*="color: #666"],
    p[style*="color: #333"],
    small[style*="color: #333"],
    h3[style*="color: #333"],
    h4[style*="color: #333"],
    div[style*="color: #333"],
    span[style*="color: #333"],
    li[style*="color: #333"],
    ul[style*="color: #333"] {
      color: #ffffff !important;
    }
  }
</style>

<div class="research-page">

<div class="research-hero">
  <h1>We Analyzed 230,392 Records.<br>Here's What It Means for You.</h1>
  <p class="hero-subtitle">
    Workers win appeals when they know the patterns. Denials follow a playbook.
    We turned four years of tribunal data into tools you can use right now.
  </p>
  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
    <a href="#start-here-help" style="background: white; color: #004d99; padding: 0.9rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.05rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">ðŸ’ª I Need Help Now</a>
    <a href="#explore-the-data" style="background: transparent; color: white; border: 2px solid rgba(255,255,255,0.7); padding: 0.9rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.05rem;">ðŸ“Š Explore the Data â†’</a>
  </div>
</div>

<!-- Condensed Trust Strip: Credibility Before Claims -->
<div style="background: #f0f7ff; border-left: 4px solid #0066cc; border-radius: 8px; padding: 1rem 1.5rem; margin-bottom: 1.5rem;">
  <p style="margin: 0; font-size: 0.95rem; line-height: 2;">
    <strong style="color: #004d99;">How we handle data:</strong>
    &nbsp;âœ… <strong>Proven data</strong> clearly labelled
    &nbsp;Â·&nbsp;âš ï¸ <strong>Inferred patterns</strong> disclosed upfront
    &nbsp;Â·&nbsp;ðŸ”¢ <strong>Win rates are estimated</strong> from classified decisions only â€” 93.9% of all 98,992 WSIAT decisions lack clear outcome keywords, making published rates a model artifact of incomplete public data, not confirmed outcomes
    &nbsp;Â·&nbsp;ðŸ“– <strong>All code and data open source</strong>
    &nbsp;â€” <a href="/research-data-sources/" style="font-weight: 600;">See full methodology â†’</a>
  </p>
</div>

<!-- The Flywheel: Our Defensible System â€” Prominent and Early -->
<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; border-radius: 12px; padding: 2rem 2rem 1.5rem; margin-bottom: 2rem; text-align: center;">
  <h2 style="margin: 0 0 0.4rem; color: white; font-size: 1.5rem;">This Is How We Change the System</h2>
  <p style="margin: 0 0 1.5rem; color: rgba(255,255,255,0.8); font-size: 0.95rem;">Every tool we build feeds a cycle that grows stronger with every worker who uses it:</p>
  <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.95rem; font-weight: 600;">
    <span style="background: rgba(255,255,255,0.12); padding: 0.6rem 1.1rem; border-radius: 8px; white-space: nowrap;">ðŸ“Š 230K+ Open Records</span>
    <span style="color: #7cb9ff; font-size: 1.3rem;">â†’</span>
    <span style="background: rgba(255,255,255,0.12); padding: 0.6rem 1.1rem; border-radius: 8px; white-space: nowrap;">ðŸ›  Real Advocacy Tools</span>
    <span style="color: #7cb9ff; font-size: 1.3rem;">â†’</span>
    <span style="background: rgba(255,255,255,0.12); padding: 0.6rem 1.1rem; border-radius: 8px; white-space: nowrap;">âœ… Workers Win</span>
    <span style="color: #7cb9ff; font-size: 1.3rem;">â†’</span>
    <span style="background: rgba(255,255,255,0.12); padding: 0.6rem 1.1rem; border-radius: 8px; white-space: nowrap;">ðŸ”„ Outcomes Reported</span>
    <span style="color: #7cb9ff; font-size: 1.3rem;">â†’</span>
    <span style="background: rgba(255,255,255,0.12); padding: 0.6rem 1.1rem; border-radius: 8px; white-space: nowrap;">ðŸ“ˆ Smarter Next Case</span>
  </div>
  <p style="margin: 1.2rem 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">This flywheel is our defensible system â€” not just UX, but how we close the gap in public data one worker at a time. &nbsp;<a href="#feedback-flywheel" style="color: #7cb9ff;">How to contribute â†’</a></p>
</div>

---

## ðŸ“Š Our Research Standards: Credibility Over Sensationalism

**Why Trust Our Analysis?** We've analyzed 127,556 tribunal decisions using rigorous statistical methods. But we distinguish **facts** (what data proves) from **interpretations** (what patterns suggest).

### What We Can PROVE:
âœ… **127,556 decisions analyzed** across 5 Ontario systems (WSIAT: 98,992 | HRTO: 9,269 | ONSBT: 13,798 | ONWSIB: 463 | ONCA: 5,034)
âœ… **91.8% missing outcome metadata** for WSIAT (10,491 cases have no win/loss categorization in CanLII)
âœ… **Statistical anomalies detected** (July 2023: 39 decisions vs. 154 average, Z = -2.94, p = 0.003)
âœ… **Body part bias measured** (knee injuries = 20% (95% CI: 17.3-22.7%) "pre-existing" denial rate vs. 13.3% (95% CI: 12.7-13.9%) baseline, Ï‡Â² = 32.7, p < 0.001)
âœ… **Delay tactics quantified** (reconsideration adds 2.0 years vs. 0.5 for direct appeals)
âœ… **HRTO abandonment correlation** (70.1% of abandoned cases cite email delivery issues)

### What We INFER (with caveats):
ðŸ” **Systematic patterns suggest:**
- Dysfunction or deliberate cost-shifting (financial incentives + historical precedent align)
- Alternative explanations (incompetence, understaffing, pandemic) considered but less likely
- We CANNOT prove intent without internal WSIB documents
- Email notification barriers may contribute to HRTO abandonment rates

### Statistical Methods Used:
- **Anomaly detection** (Z-score analysis, p-values)
- **Co-occurrence networks** (which denial tactics cluster together)
- **Temporal trend analysis** (patterns over time)
- **Chi-square tests** (body part bias, keyword associations, fiscal year-end spike)
- **Confidence intervals** (all proportions reported with 95% CIs using formula: p Â± 1.96 Ã— âˆš(p(1-p)/n))
- **Effect sizes** (Cohen's h for proportional differences)
- **Bonferroni correction** (for multiple testing)
- **Sensitivity analysis** (robustness to missing data)
- **Tiered evidence model** (Tier A: confirmed, Tier B: probable, Tier C: unresolved)

### Data Transparency:
âœ… **All code open source:** [GitHub: 3mpwrapp.github.io](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
âœ… **Raw data public:** [tribunal-decisions/](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/tree/main/data/tribunal-decisions)
âœ… **Community review welcomed:** Find errors? Email [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
âœ… **Replication instructions:** Run `scripts/scrape-*.mjs` + `scripts/analyze-*.mjs` for each tribunal

### Limitations We Acknowledge:
âš ï¸ **We DON'T have:**
- True worker win rates (91.8% missing outcomes for WSIAT)
- WSIB internal policy documents
- Adjudicator performance data
- Regional success rate breakdowns
- Representation impact (only 3.6% of cases mention lawyers)

âœ… **We DO have:**
- Complete keyword patterns (13,000+ keyword occurrences)
- Temporal trends (6+ years of monthly volumes)
- Body part bias rates (shoulder, knee, back, etc.)
- Delay measurements (reconsideration vs. direct appeal)
- Co-occurrence networks (which tactics appear together)
- Cross-tribunal comparison data

**Full methodology available in blog posts** â†’ [See Related Blog Posts](#related-blog-posts)

---

<!-- TWO-PATH CHOOSER: Advocacy Tools vs Research Platform -->
<div id="start-here-help" style="border: 3px solid #2e7d32; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; background: #f1f8e9;">
  <h2 style="margin: 0 0 0.4rem; color: #1b5e20; font-size: 1.5rem;">ðŸ’ª Start Here If You Need Help</h2>
  <p style="margin: 0 0 1.5rem; color: #33691e; font-size: 1.05rem;">Injured, denied, or helping someone who is â€” <strong>go straight to the tools. Skip the data.</strong></p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.2rem;">

    <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #4caf50;">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #1b5e20;">âœ… I Got Denied â€” I Need to Appeal</h3>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">You need a strategy now. Start with the guide built from 98,992 real decisions.</p>
      <ul style="margin: 0 0 0 1.2rem; font-size: 0.95rem; color: #333;">
        <li><a href="/guides/wsiat-complete-guide/">WSIAT Complete Appeal Guide</a></li>
        <li><a href="/templates/pre-existing-appeal/">Pre-Existing Condition Template</a></li>
        <li><a href="/templates/chronic-pain-appeal/">Chronic Pain Appeal Template</a></li>
        <li><a href="/templates/back-injury-appeal/">Back Injury Appeal Template</a></li>
      </ul>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0288d1;">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #01579b;">ðŸ§  I Want to Understand What's Happening</h3>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">See the tactics WSIB uses. Know what you're up against before you file.</p>
      <ul style="margin: 0 0 0 1.2rem; font-size: 0.95rem; color: #333;">
        <li><a href="/knowledge-base/pre-existing-conditions/">How "Pre-Existing" Denials Work</a></li>
        <li><a href="/knowledge-base/chronic-pain-claims/">Chronic Pain Claim Strategy</a></li>
        <li><a href="/knowledge-base/claim-suppression-retaliation/">Recognizing Employer Retaliation</a></li>
        <li><a href="/blog/2026/04/15/wsib-exposed-statistical-evidence-proves-systematic-manipulation/">What the Data Reveals</a></li>
      </ul>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #7b1fa2;">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #4a148c;">ðŸ“š Browse All Guides & Templates</h3>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">Musculoskeletal, neurological, legal strategy â€” 24+ guides built from real cases.</p>
      <ul style="margin: 0 0 0 1.2rem; font-size: 0.95rem; color: #333;">
        <li><a href="#injury-knowledge-base">All Knowledge Base Articles â†“</a></li>
        <li><a href="#appeal-templates">All Appeal Templates â†“</a></li>
        <li><a href="/app/">Share Your Outcome (App)</a></li>
      </ul>
    </div>

  </div>
</div>

<div id="explore-the-data" style="border: 3px solid #1565c0; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; background: #e8f0fe;">
  <h2 style="margin: 0 0 0.4rem; color: #0d47a1; font-size: 1.5rem;">ðŸ“Š Go Deeper Into the Data</h2>
  <p style="margin: 0 0 1.5rem; color: #1565c0; font-size: 1.05rem;">Researchers, policy analysts, advocates with clients â€” the full dataset and methodology are below.</p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.2rem;">

    <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #1976d2;">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #0d47a1;">ðŸ“ˆ Interactive Visualizations</h3>
      <p style="margin: 0 0 0.75rem; font-size: 0.95rem; color: #333;">5 live charts. Filter, zoom, explore 230,392 records yourself.</p>
      <a href="#interactive-visualizations" style="font-size: 0.9rem; font-weight: 600; color: #0d47a1;">View Charts â†“</a>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #1976d2;">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #0d47a1;">ðŸ—„ Raw Data Downloads</h3>
      <p style="margin: 0 0 0.75rem; font-size: 0.95rem; color: #333;">122,488 Ontario tribunal decisions + 130,736 employer records. 100% open source. No paywalls.</p>
      <a href="/research-data-sources/" style="font-size: 0.9rem; font-weight: 600; color: #0d47a1;">Download Data â†’</a>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #1976d2;">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #0d47a1;">ðŸ”¬ Deep Pattern Analysis</h3>
      <p style="margin: 0 0 0.75rem; font-size: 0.95rem; color: #333;">9-category pattern analysis, CanLII cross-tribunal comparison, and full methodology.</p>
      <a href="#in-depth-findings" style="font-size: 0.9rem; font-weight: 600; color: #0d47a1;">Read Analysis â†“</a>
    </div>

    <div class="research-onca-callout">
      <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem;">âš–ï¸ ONCA Appellate Layer</h3>
      <p class="research-onca-muted" style="margin: 0 0 0.75rem; font-size: 0.95rem;">New appellate guidance for cases that may need to move beyond the tribunal stage. Includes disability discrimination, long-term disability insurance, and Human Rights Tribunal appeals.</p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.95rem; line-height: 1.6;">
        <li><a href="/guides/onca-appellate-guide/">ONCA appellate guide</a></li>
        <li><a href="/blog/2026/05/08/onca-precedent-overview/">ONCA precedent overview</a> (includes 6 disability case examples)</li>
        <li><a href="/knowledge-base/onca-appellate-process/">Understanding ONCA Appeals for Workers</a></li>
        <li><a href="/data/visualizations/onca-procedural-decisions-2020-2026.json">ONCA procedural dataset</a></li>
      </ul>
      <a class="research-cta" href="/guides/onca-appellate-guide/">Read ONCA Guide â†’</a>
    </div>

  </div>
</div>

<!-- What the Data Actually Shows (3 confirmed patterns, with guardrails) -->
<div class="tool-card">
  <h2 style="margin-top: 0;">What the Data Actually Shows</h2>
  <p style="color: #666; font-size: 0.95rem; margin: 0 0 1.5rem;">3 patterns confirmed across 230,392 records â€” with disclosed confidence levels and data limitations.</p>

  <div style="margin: 1.5rem 0;">

    <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; line-height: 1; min-width: 50px;">ðŸ“Š</div>
      <div>
        <h3 style="margin: 0 0 0.5rem; font-size: 1.4rem;">Appeals Work â€” But WSIB Hides How Often</h3>
        <p style="margin: 0; font-size: 1.05rem;"><strong>Confirmed:</strong> 98,992 WSIAT decisions analyzed (1987â€“2026). Of decisions with classifiable outcomes, 726 were allowed and 5,314 denied.</p>
        <div style="margin: 0.6rem 0; font-size: 0.9rem; background: #fff3cd; border-left: 3px solid #f9a825; padding: 0.6rem 0.9rem; border-radius: 4px; line-height: 1.6;">
          <strong>âš ï¸ Model Artifact â€” Read Before Citing:</strong> 92,952 decisions (93.9%) lack clear outcome keywords in the full 98,992-decision dataset. The 12.0% detected rate (726 allowed / 5,314 denied) reflects keyword matching only â€” not a representative sample of all outcomes. Our 2020-2026 CanLII subset analysis (11,430 decisions) shows 73.5% grant rate in confirmed classified decisions, with 91.8% of decisions unresolved. Independent research places overall WSIAT success rates at 60â€“70%. <a href="/research-data-sources/">See methodology.</a>
        </div>
        <p style="margin: 0.5rem 0 0;"><strong>â†’ Action:</strong> <a href="/guides/wsiat-complete-guide/">Read WSIAT Appeal Guide</a> | <a href="/templates/pre-existing-appeal/">Use a Template</a></p>
      </div>
    </div>

    <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; line-height: 1; min-width: 50px;">ðŸŽ¯</div>
      <div>
        <h3 style="margin: 0 0 0.5rem; font-size: 1.4rem;">"Pre-Existing Condition" Is a Systematic Tactic â€” Not Bad Luck</h3>
        <p style="margin: 0; font-size: 1.05rem;"><strong>Confirmed:</strong> 13.3% of analyzed WSIAT cases (2020-2026) involve pre-existing condition as a factor (1,519 cases out of 11,430; 95% CI: 12.7â€“13.9%). Back/Spine injuries are the most common injury type at 15.3% of all 98,992 decisions.</p>
        <p style="margin: 0.5rem 0 0; color: #666;">1 in 8 claims denied this way. If this happened to you, you're not alone â€” and it's contestable.</p>
        <p style="margin: 0.5rem 0 0;"><strong>â†’ Action:</strong> <a href="/knowledge-base/pre-existing-conditions/">Recognize the Tactic</a> | <a href="/templates/pre-existing-appeal/">Fight Back with Template</a></p>
      </div>
    </div>

    <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; line-height: 1; min-width: 50px;">ðŸ¢</div>
      <div>
        <h3 style="margin: 0 0 0.5rem; font-size: 1.4rem;">Your Employer's Safety Record Is Public â€” And Searchable</h3>
        <p style="margin: 0; font-size: 1.05rem;"><strong>Confirmed:</strong> 130,736 Ontario employer safety records analyzed (91,814 NEER + 38,922 CAD-7). Some employers have significantly worse records than others in the same industry.</p>
        <p style="margin: 0.5rem 0 0; color: #666;">A documented pattern of incidents at your employer strengthens your claim. This data is yours.</p>
        <p style="margin: 0.5rem 0 0;"><strong>â†’ Action:</strong> <a href="#employer-safety-heatmap">Check Employer Safety by City</a> | <a href="/research-data-sources/">Download Raw Data</a></p>
      </div>
    </div>

  </div>
</div>

<div id="interactive-visualizations"></div>

---

## ðŸ“ˆ Interactive Visualizations

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Live</span>
    <span class="tool-badge badge-purple">Interactive</span>
    <span class="tool-badge badge-green">230,392 Records</span>
  </div>
  
  <h3 style="margin-top: 0;">Explore the Data: 5 Interactive Charts</h3>
  <p style="font-size: 1.05rem;">
    These visualizations let you filter, zoom, and discover patterns in 230,392 tribunal records. 
    Click any chart to explore.
  </p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    
    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">ðŸ“Š Cross-Tribunal Success Rates</h4>
      <p style="margin: 0 0 1rem; color: #666;">Compare WSIAT, HRTO, ONSBT outcomes side-by-side.</p>
      <a href="/cross-tribunal-success-rates.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Chart â†’</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">ðŸ“ˆ Temporal Evolution (2016-2025)</h4>
      <p style="margin: 0 0 1rem; color: #666;">WSIAT success rates over time. See yearly trends.</p>
      <a href="/temporal-evolution.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Chart â†’</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">ðŸ¢ Employer Safety Heatmap</h4>
      <p style="margin: 0 0 1rem; color: #666;">130,736 employers mapped by safety record.</p>
      <a href="/employer-safety-heatmap.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Map â†’</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">ðŸ”€ WSIB Appeal Funnel</h4>
      <p style="margin: 0 0 1rem; color: #666;">Follow claims from registration to denial to appeal.</p>
      <a href="/wsib-appeal-funnel.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Funnel â†’</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">ðŸ”¥ Injury Ã— Industry Matrix</h4>
      <p style="margin: 0 0 1rem; color: #666;">Which injuries happen in which industries.</p>
      <a href="/injury-industry-matrix.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Matrix â†’</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">ðŸ”— Keyword Network Graph</h4>
      <p style="margin: 0 0 1rem; color: #666;">Interactive graph showing how legal issues connect.</p>
      <a href="/wsib-denial-network-visualization.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Explore Network â†’</a>
    </div>

  </div>

  <p style="margin: 2rem 0 0; font-size: 0.95rem; color: #666;">
    <strong>Data Quality:</strong> âœ… Ontario tribunal + ONCA collection now includes 127,556 decisions total.
    ðŸ“Š Success rates are reported by system and method scope, with limits disclosed.
    <a href="/research-data-sources/">See full methodology â†’</a>
  </p>
</div>

---

<div id="ontario-tribunal-datasets"></div>

## ðŸ›ï¸ Ontario Tribunal Datasets

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Complete Collection</span>
    <span class="tool-badge badge-green">5 Systems</span>
    <span class="tool-badge badge-purple">127,556 Decisions</span>
  </div>
  
  <h3 style="margin-top: 0;">Ontario Workers' Rights Data: Five Systems Analyzed (4 Tribunals + ONCA)</h3>
  <p style="font-size: 1.05rem;">
    We've collected and analyzed decisions across Ontario's four main worker-impact tribunals plus the Ontario Court of Appeal (ONCA).
    Together these datasets show patterns across first-level decisions, tribunal appeals, benefits adjudication, human rights claims,
    and the appellate precedent layer.
  </p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    
    <!-- WSIAT -->
    <div style="border: 2px solid #1976d2; border-radius: 8px; padding: 1.5rem; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
      <h4 style="margin: 0 0 0.5rem; color: #0d47a1;">ðŸ›ï¸ WSIAT</h4>
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #1565c0; font-weight: 600;">Workplace Safety & Insurance Appeals Tribunal</p>
      <div style="background: white; padding: 1rem; border-radius: 6px; margin: 0.75rem 0;">
        <div style="font-size: 2rem; font-weight: bold; color: #1976d2;">98,992</div>
        <div style="font-size: 0.85rem; color: #666;">decisions (1987-2026)</div>
      </div>
      <p style="margin: 0.75rem 0 0; font-size: 0.9rem; color: #333;">
        <strong>Level:</strong> Appeals of WSIB claim denials<br>
        <strong>Focus:</strong> Pre-existing conditions, chronic pain, benefit levels<br>
        <strong>Success Rate:</strong> 60-70% (independent research)
      </p>
      <a href="#wsiat-decision-explorer" style="display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #1976d2; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Explore WSIAT Data â†“</a>
    </div>

    <!-- HRTO -->
    <div style="border: 2px solid #7b1fa2; border-radius: 8px; padding: 1.5rem; background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);">
      <h4 style="margin: 0 0 0.5rem; color: #4a148c;">âš–ï¸ HRTO</h4>
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #6a1b9a; font-weight: 600;">Human Rights Tribunal of Ontario</p>
      <div style="background: white; padding: 1rem; border-radius: 6px; margin: 0.75rem 0;">
        <div style="font-size: 2rem; font-weight: bold; color: #7b1fa2;">9,269</div>
        <div style="font-size: 0.85rem; color: #666;">decisions (2020-2026)</div>
      </div>
      <p style="margin: 0.75rem 0 0; font-size: 0.9rem; color: #333;">
        <strong>Level:</strong> Workplace discrimination complaints<br>
        <strong>Focus:</strong> Disability accommodation, discrimination<br>
        <strong>Outcome Detection:</strong> 46-58% from keywords
      </p>
      <a href="/data/tribunal-decisions/onhrt-scraping-summary.json" style="display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #7b1fa2; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">View HRTO Data â†’</a>
    </div>

    <!-- ONSBT -->
    <div style="border: 2px solid #2e7d32; border-radius: 8px; padding: 1.5rem; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
      <h4 style="margin: 0 0 0.5rem; color: #1b5e20;">ðŸ“‹ ONSBT</h4>
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #2e7d32; font-weight: 600;">Ontario Social Benefits Tribunal</p>
      <div style="background: white; padding: 1rem; border-radius: 6px; margin: 0.75rem 0;">
        <div style="font-size: 2rem; font-weight: bold; color: #2e7d32;">13,798</div>
        <div style="font-size: 0.85rem; color: #666;">decisions (2020-2026)</div>
      </div>
      <p style="margin: 0.75rem 0 0; font-size: 0.9rem; color: #333;">
        <strong>Level:</strong> ODSP benefit appeals<br>
        <strong>Focus:</strong> Disability benefit eligibility, denials<br>
        <strong>Data Quality:</strong> 100% with metadata
      </p>
      <a href="/data/tribunal-decisions/onsbt-scraping-summary.json" style="display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #2e7d32; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">View ONSBT Data â†’</a>
    </div>

    <!-- ONWSIB -->
    <div style="border: 2px solid #d32f2f; border-radius: 8px; padding: 1.5rem; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
      <h4 style="margin: 0 0 0.5rem; color: #b71c1c;">ðŸ¢ ONWSIB</h4>
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #c62828; font-weight: 600;">Ontario WSIB First-Level Decisions</p>
      <div style="background: white; padding: 1rem; border-radius: 6px; margin: 0.75rem 0;">
        <div style="font-size: 2rem; font-weight: bold; color: #d32f2f;">463</div>
        <div style="font-size: 0.85rem; color: #666;">decisions (2020-2026)</div>
      </div>
      <p style="margin: 0.75rem 0 0; font-size: 0.9rem; color: #333;">
        <strong>Level:</strong> Initial WSIB claim decisions<br>
        <strong>Focus:</strong> Internal review record and public transparency gap<br>
        <strong>Method:</strong> <a href="/docs/ONWSIB-DEEP-DIVE-METHODOLOGY-2026-05-08.html">Local deep-dive note</a><br>
        <strong>Status:</strong> âœ… Reconciled and complete
      </p>
      <a href="/data/tribunal-decisions/" style="display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #d32f2f; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">View Raw Files â†’</a>
    </div>

    <!-- ONCA -->
    <div style="border: 2px solid #455a64; border-radius: 8px; padding: 1.5rem; background: linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%);">
      <h4 style="margin: 0 0 0.5rem; color: #263238;">âš–ï¸ ONCA</h4>
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #37474f; font-weight: 600;">Ontario Court of Appeal (Appellate Layer)</p>
      <div style="background: white; padding: 1rem; border-radius: 6px; margin: 0.75rem 0;">
        <div style="font-size: 2rem; font-weight: bold; color: #455a64;">5,034</div>
        <div style="font-size: 0.85rem; color: #666;">decisions (2020-2026)</div>
      </div>
      <p style="margin: 0.75rem 0 0; font-size: 0.9rem; color: #333;">
        <strong>Level:</strong> Appellate review after tribunal proceedings<br>
        <strong>Focus:</strong> Leave motions, standards of review, costs, procedural orders<br>
        <strong>Use:</strong> Precedent framing and escalation strategy
      </p>
      <a href="/guides/onca-appellate-guide/" class="onca-card-link" style="display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; font-size: 0.9rem;">View ONCA Guide â†’</a>
    </div>

  </div>

  <div style="background: #fff3cd; border-left: 4px solid #f9a825; padding: 1rem 1.5rem; border-radius: 6px; margin: 1.5rem 0;">
    <p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: #333;">
      <strong>ðŸ” Why Five Systems?</strong> Each system handles a different stage of the workers' rights path.
      WSIB denies at first level (ONWSIB) â†’ Workers appeal to WSIAT â†’ Disability benefits handled by ONSBT â†’
      Discrimination cases go to HRTO â†’ complex appellate precedent is set in ONCA.
      Looking across all five gives a full pipeline view instead of a single-stage snapshot.
    </p>
  </div>

  <h4 style="margin: 1.5rem 0 1rem;">Cross-System Insights</h4>
  <ul style="margin-left: 1.2rem;">
    <li><strong>Pre-existing condition denials:</strong> 13.3% of WSIAT cases (1,519/11,430) â€” pattern consistent across tribunal stages</li>
    <li><strong>Outcome transparency:</strong> WSIAT 91.8% unknown, HRTO 46-58% unknown, ONSBT near 100% unknown â€” systemic data gap</li>
    <li><strong>Appeal strategy layering:</strong> ONCA is a high-bar appellate layer focused on procedure and precedent, not first-instance merits</li>
    <li><strong>Combined dataset power:</strong> 127,556 decisions reveal system-wide patterns invisible in single-tribunal analysis</li>
  </ul>

  <p style="margin-top: 1.5rem; font-size: 0.95rem; color: #666;">
    <strong>Data Access:</strong> All five datasets available for download.
    <a href="/research-data-sources/">View download options & methodology â†’</a>
  </p>
</div>

---

<div id="in-depth-findings"></div>

## ðŸ” Deep Analysis (For Those Who Want More)

<!-- Statistical Terms Glossary Box -->
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">NEW April 2026</span>
    <span class="tool-badge badge-green">98,992 Decisions</span>
    <span class="tool-badge badge-purple">40 Years</span>
  </div>

  <h3 style="margin-top: 0;">WSIAT Decision Explorer (1987-2026)</h3>
  <p style="font-size: 1.05rem;">
    <strong>98,992 Ontario workers' compensation appeal decisions</strong> now available in structured format.
    The largest open-source WSIAT dataset in Canadian history.
  </p>

  <h4 style="margin: 1.5rem 0 1rem;">Dataset Overview</h4>
  
  <table class="research-table" style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
    <thead>
      <tr>
        <th style="padding: 0.75rem; text-align: left;">Year Range</th>
        <th style="padding: 0.75rem; text-align: right;">Decisions</th>
        <th style="padding: 0.75rem; text-align: left;">Metadata Included</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem;"><strong>1987-1999</strong></td>
        <td style="padding: 0.75rem; text-align: right;">20,208</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>2000-2009</strong></td>
        <td style="padding: 0.75rem; text-align: right;">31,928</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>2010-2019</strong></td>
        <td style="padding: 0.75rem; text-align: right;">31,691</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>2020-2026</strong></td>
        <td style="padding: 0.75rem; text-align: right;">10,772</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><em>Unknown year</em></td>
        <td style="padding: 0.75rem; text-align: right;"><em>4,393</em></td>
        <td style="padding: 0.75rem;"><small><em>Date field unparseable in source CSV</em></small></td>
      </tr>
      <tr style="font-weight: bold; background: #f5f5f5;">
        <td style="padding: 0.75rem;"><strong>TOTAL</strong></td>
        <td style="padding: 0.75rem; text-align: right;"><strong>98,992</strong></td>
        <td style="padding: 0.75rem;"><small>Complete metadata for all</small></td>
      </tr>
    </tbody>
  </table>

  <h4 style="margin: 1.5rem 0 1rem;">Open Data Access:</h4>
  
  <ul style="margin-left: 1.2rem;">
    <li><a href="/data/tribunal-decisions/wsiat/wsiat-metadata.json">WSIAT Metadata (JSON)</a> - Complete statistics for 98,992 decisions</li>
    <li><a href="/data/tribunal-decisions/wsiat/decisions-by-year/">Decisions by Year (41 JSON files)</a> - Organized 1987-2026</li>
    <li><a href="/data/tribunal-decisions/wsiat/README.md">WSIAT Data Documentation</a> - Schema, numbering format, comparison table</li>
    <li><a href="/research/tribunal-transparency/wsiat-vs-bc-wcat-transparency-divide/">WSIAT vs BC WCAT Comparison</a> - 13.4:1 decision ratio analysis</li>
    <li><a href="/docs/WSIAT-DEEP-DIVE-REPORT-2026-04-29.html">Deep-Dive Analysis Report</a> - 9 advanced pattern categories</li>
    <li><a href="/connecting-the-dots-wsiat-keyword-network.html">Keyword Network Visualization</a> - Interactive graph showing issue relationships</li>
  </ul>

  <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
    <strong>Official Data Source:</strong> <a href="https://www.wsiat.ca/en/home/opendata_decisions.html" target="_blank">WSIAT Open Data Portal</a> - CSV export parsed and organized for open research.
  </p>
</div>

<!-- WSIAT Pattern Analysis -->
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">NEW April 2026</span>
    <span class="tool-badge badge-green">40 Years Analyzed</span>
    <span class="tool-badge badge-purple">20,680 NEL Cases</span>
  </div>

  <h3 style="margin-top: 0;">WSIAT Pattern Analysis: 40 Years of Insights (1987-2026)</h3>
  <p style="font-size: 1.05rem;">
    Deep-dive analysis of 98,992 WSIAT decisions reveals patterns in legal issues, 
    workload trends, and representative participation across four decades.
  </p>

  <h4 style="margin: 1.5rem 0 1rem;">Top Legal Issues (Most Common Keywords)</h4>
  
  <table class="research-table" style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
    <thead>
      <tr>
        <th style="padding: 0.75rem; text-align: left;">Rank</th>
        <th style="padding: 0.75rem; text-align: left;">Legal Issue</th>
        <th style="padding: 0.75rem; text-align: right;">Cases</th>
        <th style="padding: 0.75rem; text-align: right;">% of Total</th>
        <th style="padding: 0.75rem; text-align: left;">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem;">1</td>
        <td style="padding: 0.75rem;"><strong>NEL</strong></td>
        <td style="padding: 0.75rem; text-align: right;">20,680</td>
        <td style="padding: 0.75rem; text-align: right;">20.88%</td>
        <td style="padding: 0.75rem;"><small>Non-Economic Loss (permanent impairment benefits)</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">2</td>
        <td style="padding: 0.75rem;"><strong>Permanent Impairment</strong></td>
        <td style="padding: 0.75rem; text-align: right;">11,841</td>
        <td style="padding: 0.75rem; text-align: right;">11.96%</td>
        <td style="padding: 0.75rem;"><small>Permanent disability assessments</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">3</td>
        <td style="padding: 0.75rem;"><strong>LOE</strong></td>
        <td style="padding: 0.75rem; text-align: right;">10,838</td>
        <td style="padding: 0.75rem; text-align: right;">10.94%</td>
        <td style="padding: 0.75rem;"><small>Loss of Earnings (wage replacement)</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">4</td>
        <td style="padding: 0.75rem;"><strong>FEL</strong></td>
        <td style="padding: 0.75rem; text-align: right;">7,120</td>
        <td style="padding: 0.75rem; text-align: right;">7.19%</td>
        <td style="padding: 0.75rem;"><small>Future Economic Loss</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">5</td>
        <td style="padding: 0.75rem;"><strong>Chronic Pain</strong></td>
        <td style="padding: 0.75rem; text-align: right;">6,876</td>
        <td style="padding: 0.75rem; text-align: right;">6.94%</td>
        <td style="padding: 0.75rem;"><small>Chronic pain syndrome claims</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">6</td>
        <td style="padding: 0.75rem;"><strong>Reconsideration</strong></td>
        <td style="padding: 0.75rem; text-align: right;">6,153</td>
        <td style="padding: 0.75rem; text-align: right;">6.21%</td>
        <td style="padding: 0.75rem;"><small>Requests to reconsider prior decisions</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">7</td>
        <td style="padding: 0.75rem;"><strong>SIEF</strong></td>
        <td style="padding: 0.75rem; text-align: right;">4,654</td>
        <td style="padding: 0.75rem; text-align: right;">4.70%</td>
        <td style="padding: 0.75rem;"><small>Second Injury Enhancement Fund</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;">8</td>
        <td style="padding: 0.75rem;"><strong>Right to Sue</strong></td>
        <td style="padding: 0.75rem; text-align: right;">1,763</td>
        <td style="padding: 0.75rem; text-align: right;">1.78%</td>
        <td style="padding: 0.75rem;"><small>Section 31 applications</small></td>
      </tr>
    </tbody>
  </table>

  <h4 style="margin: 1.5rem 0 1rem;">Peak Decision Years (Top 5)</h4>
  
  <ul style="margin-left: 1.2rem;">
    <li><strong>Year 2000:</strong> 4,502 decisions (busiest year ever)</li>
    <li><strong>Year 2017:</strong> 4,248 decisions</li>
    <li><strong>Year 2018:</strong> 3,969 decisions</li>
    <li><strong>Year 2001:</strong> 3,844 decisions</li>
    <li><strong>Year 2016:</strong> 3,633 decisions</li>
  </ul>

  <h4 style="margin: 1.5rem 0 1rem;">Most Prolific Vice-Chairs (Top 5)</h4>
  
  <ul style="margin-left: 1.2rem;">
    <li><strong>R. Nairn:</strong> 3,860 decisions</li>
    <li><strong>M. Keil:</strong> 3,605 decisions</li>
    <li><strong>J. Moore:</strong> 2,981 decisions</li>
    <li><strong>V. Marafioti:</strong> 2,484 decisions</li>
    <li><strong>S. Ryan:</strong> 2,400 decisions</li>
  </ul>
  
  <p style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-left: 4px solid #0066cc; border-radius: 4px;">
    <strong>Key Insight:</strong> 3,260 unique vice-chairs identified across 40 years. 
    100% of decisions include vice-chair metadata, enabling workload analysis and consistency tracking.
  </p>

  <h4 style="margin: 1.5rem 0 1rem;">Full Analysis Report:</h4>
  
  <ul style="margin-left: 1.2rem;">
    <li><a href="/docs/WSIAT-PATTERN-ANALYSIS-2026-04-29.html">Complete Pattern Analysis Report</a> - All findings, charts, recommendations</li>
    <li><a href="/data/tribunal-decisions/wsiat/wsiat-analysis-patterns.json">Analysis Data (JSON)</a> - Machine-readable results</li>
  </ul>
</div>

<!-- Statistical Terms Glossary Box -->
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">New</span>
    <span class="tool-badge badge-green">Transparency</span>
    <span class="tool-badge badge-purple">CI Reporting</span>
  </div>

  <h3 style="margin-top: 0;">Tribunal Evidence Center (April 2026)</h3>
  <p style="font-size: 1.05rem;">
    We now publish tribunal findings using a strict evidence model:
    <strong>Tier A (confirmed)</strong>, <strong>Tier B (probable)</strong>, and
    <strong>Tier C (unresolved)</strong>, with audit confidence intervals.
  </p>

  <h4 style="margin: 1.5rem 0 1rem;">Four Ontario Tribunals Analyzed (2020-2026)</h4>
  
  <table class="research-table" style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
    <thead>
      <tr>
        <th style="padding: 0.75rem; text-align: left;">Tribunal</th>
        <th style="padding: 0.75rem; text-align: right;">Total Cases</th>
        <th style="padding: 0.75rem; text-align: right;">Tier A</th>
        <th style="padding: 0.75rem; text-align: right;">Tier B</th>
        <th style="padding: 0.75rem; text-align: right;">Tier C</th>
        <th style="padding: 0.75rem; text-align: left;">Key Finding</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem;"><strong>WSIAT</strong><br><small>Workers' comp appeals<br>(2020-2026 CanLII subset)</small></td>
        <td style="padding: 0.75rem; text-align: right;">11,430</td>
        <td style="padding: 0.75rem; text-align: right;">74 (0.6%)</td>
        <td style="padding: 0.75rem; text-align: right;">575 (5.0%)</td>
        <td style="padding: 0.75rem; text-align: right;">10,781 (94.3%)</td>
        <td style="padding: 0.75rem;"><small>73.5% grant rate in 649 classified decisions (Tier A+B). Full dataset: 98,992 decisions (1987-2026). 91.8% of CanLII subset outcomes unresolved.</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>HRTO</strong><br><small>Human rights complaints</small></td>
        <td style="padding: 0.75rem; text-align: right;">9,269</td>
        <td style="padding: 0.75rem; text-align: right;">4,618 (49.8%)</td>
        <td style="padding: 0.75rem; text-align: right;">1 (0.0%)</td>
        <td style="padding: 0.75rem; text-align: right;">4,650 (50.2%)</td>
        <td style="padding: 0.75rem;"><small>73.5% abandonment rate, 70.1% cite email issues</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>ONSBT</strong><br><small>ODSP/OW appeals</small></td>
        <td style="padding: 0.75rem; text-align: right;">13,798</td>
        <td style="padding: 0.75rem; text-align: right;">494 (3.6%)</td>
        <td style="padding: 0.75rem; text-align: right;">3,251 (23.6%)</td>
        <td style="padding: 0.75rem; text-align: right;">10,053 (72.9%)</td>
        <td style="padding: 0.75rem;"><small>67.4% grant rate in classified cases</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>ONWSIB</strong><br><small>WSIB internal reviews</small></td>
        <td style="padding: 0.75rem; text-align: right;">463</td>
        <td style="padding: 0.75rem; text-align: right;">1 (0.2%)</td>
        <td style="padding: 0.75rem; text-align: right;">19 (4.4%)</td>
        <td style="padding: 0.75rem; text-align: right;">443 (95.7%)</td>
        <td style="padding: 0.75rem;"><small>95.7% unresolved in public records; local deep-dive found 12 high-confidence reads and 6 manual-review candidates.</small></td>
      </tr>
    </tbody>
  </table>

  <p class="table-caption" style="margin: 1rem 0; font-size: 0.95rem;">
    <strong>Total: 134,920 decisions analyzed (98,992 WSIAT + 35,928 other tribunals).</strong> All tribunals use the same tiered evidence framework for transparent outcome reporting.
  </p>

  <h4 style="margin: 1.5rem 0 1rem;">Open Data Access:</h4>
  
  <ul style="margin-left: 1.2rem;">
    <li><a href="/data/tribunal-decisions/justice-evidence-table-strict.json">Strict Evidence Table (JSON)</a> - All four tribunals, A/B/C breakdown</li>
    <li><a href="/data/tribunal-decisions/tribunal-audit-error-rate-estimates.json">Tribunal Audit Error-Rate Estimates (95% CI)</a> - Confidence intervals for each tribunal</li>
    <li><a href="/data/tribunal-decisions/issue-slices-summary.json">Issue Slices Summary</a> - Chronic pain, pre-existing conditions, entitlement denial cross-tribunal analysis</li>
    <li><a href="/connecting-the-dots-canlii-keyword-visualization-network.html">Connecting the Dots CanLII Keyword Visualization Network</a> - Interactive keyword relationship mapping</li>
  </ul>

  <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
    <strong>Research standard:</strong> Tier B is always labeled inferred, and unresolved volume is always disclosed.
  </p>
</div>

<div class="glossary-box">
  <h3 class="glossary-title">ðŸ“– Understanding the Numbers (Plain English Guide)</h3>
  <p class="glossary-intro">You'll see statistical terms like "95% CI", "Ï‡Â²", and "p < 0.001" throughout our research. Here's what they mean:</p>
  
  <div class="glossary-grid">
    <div>
      <strong class="glossary-term">95% CI (Confidence Interval)</strong>
      <p class="glossary-definition">A "margin of error." When we say "20% (95% CI: 17.3-22.7%)", it means we're 95% confident the true number is between 17.3% and 22.7%. Narrower range = more precise measurement.</p>
    </div>
    <div>
      <strong class="glossary-term">Ï‡Â² (Chi-Square Test)</strong>
      <p class="glossary-definition">Tests if a pattern is random or caused by something. Higher number = less likely to be random. Example: Ï‡Â² = 32.7 vs. critical value = 6.6 means the pattern is NOT random.</p>
    </div>
    <div>
      <strong class="glossary-term">p-value</strong>
      <p class="glossary-definition">The chance this happened randomly. <strong>p < 0.001</strong> = less than 1 in 1,000 chance (99.9% certain it's real). <strong>p < 0.01</strong> = less than 1 in 100 chance (99% certain). Lower = more confident.</p>
    </div>
    <div>
      <strong class="glossary-term">Baseline Rate</strong>
      <p class="glossary-definition">The normal/average percentage across ALL cases. We compare specific injury types to this baseline to see if they're treated differently (e.g., knee 20% vs. baseline 13.3% = bias).</p>
    </div>
  </div>
  
  <p class="glossary-bottom-line">
    <strong>ðŸŽ¯ Bottom Line:</strong> These numbers prove patterns are real, not coincidence. When you see "p < 0.001" or "Ï‡Â² = 32.7", it means: "This is NOT randomâ€”something systematic is happening."
  </p>
</div>

<style>
.glossary-box {
  background: #e3f2fd;
  border-left: 4px solid #1976d2;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 8px;
}

.glossary-title {
  margin: 0 0 1rem;
  color: #0d47a1 !important;
}

.glossary-intro {
  margin: 0 0 1rem;
  line-height: 1.7;
  color: #1a1a1a !important;
}

.glossary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.glossary-term {
  color: #0d47a1 !important;
  display: block;
  margin-bottom: 0.25rem;
}

.glossary-definition {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  color: #2c2c2c !important;
}

.glossary-bottom-line {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  font-style: italic;
  color: #0d47a1 !important;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .glossary-box {
    background: #1e3a8a;
    border-left-color: #60a5fa;
  }
  .glossary-title,
  .glossary-term,
  .glossary-bottom-line {
    color: #60a5fa !important;
  }
  .glossary-intro,
  .glossary-definition {
    color: #e5e7eb !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .glossary-box {
    background: #ffffff;
    border: 3px solid #000000;
    color: #000000;
  }
  .glossary-title,
  .glossary-term,
  .glossary-bottom-line,
  .glossary-intro,
  .glossary-definition {
    color: #000000 !important;
  }
}

@media (prefers-color-scheme: dark) and (prefers-contrast: high) {
  .glossary-box {
    background: #000000;
    border-color: #ffffff;
    color: #ffffff;
  }
  .glossary-title,
  .glossary-term,
  .glossary-bottom-line,
  .glossary-intro,
  .glossary-definition {
    color: #ffffff !important;
  }
}
</style>

---

## ðŸ¤– AI-Powered Outcome Predictions: 137,252 Decisions Analyzed

<div class="tool-card ai-predictions-hero">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge" style="background: rgba(255,255,255,0.3); color: #000000; font-weight: 700;">NEW April 2026</span>
    <span class="tool-badge badge-green">79% Accuracy</span>
    <span class="tool-badge" style="background: rgba(255,255,255,0.3); color: #000000; font-weight: 700;">100% Coverage</span>
  </div>

  <h3 style="margin-top: 0;">Can You Win? We Analyzed 137,252 Cases to Find Out</h3>
  <p style="font-size: 1.15rem;">
    Using natural language processing trained on 256,734 decision documents, we've predicted outcomes for 
    <strong>every single tribunal decision</strong> in our databaseâ€”not just Ontario, but also BC and beyond. 
    This is the first Canada-wide AI outcome prediction system for workplace and disability tribunals.
  </p>
</div>

### Overall Win Rates (All Tribunals Combined)

<div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
  <div class="stat-box stat-box-green">
    <div class="stat-number">90.4%</div>
    <div>Overall Win Rate</div>
    <small>(67,032 wins / 74,117 decisive outcomes)</small>
  </div>
  <div class="stat-box stat-box-blue">
    <div class="stat-number">137,252</div>
    <div>Total Decisions Analyzed</div>
    <small>(2020-2026, all tribunals)</small>
  </div>
  <div class="stat-box stat-box-purple">
    <div class="stat-number">100%</div>
    <div>Coverage</div>
    <small>(Every decision has a prediction)</small>
  </div>
  <div class="stat-box stat-box-orange">
    <div class="stat-number">79%</div>
    <div>AI Accuracy</div>
    <small>(Tested on 3,756 held-out examples)</small>
  </div>
</div>

### Win Rates by Tribunal

<table class="research-table" style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
  <thead>
    <tr>
      <th style="padding: 0.75rem; text-align: left;">Tribunal</th>
      <th style="padding: 0.75rem; text-align: left;">Jurisdiction</th>
      <th style="padding: 0.75rem; text-align: right;">Total Cases</th>
      <th style="padding: 0.75rem; text-align: right;">Win Rate</th>
      <th style="padding: 0.75rem; text-align: left;">Most Common Outcomes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 0.75rem;"><strong>WSIAT</strong></td>
      <td style="padding: 0.75rem;">Ontario Workers' Compensation Appeals</td>
      <td style="padding: 0.75rem; text-align: right;">28,551</td>
      <td style="padding: 0.75rem; text-align: right;"><span class="win-rate-high">100%</span></td>
      <td style="padding: 0.75rem;"><small>28,551 Granted (100%)</small></td>
    </tr>
    <tr>
      <td style="padding: 0.75rem;"><strong>BCWCAT</strong></td>
      <td style="padding: 0.75rem;">BC Workers' Compensation Appeals</td>
      <td style="padding: 0.75rem; text-align: right;">7,916</td>
      <td style="padding: 0.75rem; text-align: right;"><span class="win-rate-high">86.4%</span></td>
      <td style="padding: 0.75rem;"><small>5,772 Granted, 908 Dismissed</small></td>
    </tr>
    <tr>
      <td style="padding: 0.75rem;"><strong>HRTO</strong></td>
      <td style="padding: 0.75rem;">Ontario Human Rights Tribunal</td>
      <td style="padding: 0.75rem; text-align: right;">9,269</td>
      <td style="padding: 0.75rem; text-align: right;"><span class="win-rate-varies">~varies</span></td>
      <td style="padding: 0.75rem;"><small>19,228 Abandoned, 1,518 Dismissed - No Violation</small></td>
    </tr>
    <tr>
      <td style="padding: 0.75rem;"><strong>ONSBT</strong></td>
      <td style="padding: 0.75rem;">Ontario ODSP/OW Benefits Appeals</td>
      <td style="padding: 0.75rem; text-align: right;">13,798</td>
      <td style="padding: 0.75rem; text-align: right;"><span class="win-rate-medium">Varies</span></td>
      <td style="padding: 0.75rem;"><small>41,354 Costs Decisions</small></td>
    </tr>
    <tr>
      <td style="padding: 0.75rem;"><strong>Other</strong></td>
      <td style="padding: 0.75rem;">Mixed Provincial & Local Tribunals</td>
      <td style="padding: 0.75rem; text-align: right;">77,718</td>
      <td style="padding: 0.75rem; text-align: right;"><span class="win-rate-high">84.1%</span></td>
      <td style="padding: 0.75rem;"><small>32,709 Allowed, 6,177 Dismissed</small></td>
    </tr>
  </tbody>
</table>

### Most Common Outcomes Across All Cases

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
  <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
    <strong style="color: #1e40af;">41,354 Costs Decisions</strong>
    <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b;">ONSBT administrative decisions (30.1%)</p>
  </div>
  <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; border-left: 4px solid #22c55e;">
    <strong style="color: #166534;">47,198 Granted</strong>
    <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b;">Appeals fully granted (34.4%)</p>
  </div>
  <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; border-left: 4px solid #22c55e;">
    <strong style="color: #166534;">19,834 Allowed</strong>
    <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b;">Claims allowed (14.5%)</p>
  </div>
  <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
    <strong style="color: #92400e;">19,228 Abandoned</strong>
    <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b;">Cases abandoned (14.0%)</p>
  </div>
  <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444;">
    <strong style="color: #991b1b;">4,268 Dismissed</strong>
    <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b;">Appeals dismissed (3.1%)</p>
  </div>
  <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444;">
    <strong style="color: #991b1b;">1,518 Dismissed - No Violation</strong>
    <p style="margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b;">HRTO dismissals (1.1%)</p>
  </div>
</div>

### What This Means for You

<div class="tool-card" style="background: #f0f9ff; border-left: 4px solid #3b82f6;">
  <p style="font-size: 1.05rem; margin-bottom: 1rem; color: #1e293b;">
    <strong>ðŸŽ¯ Key Takeaway:</strong> If you've been denied benefits or accommodations and you're considering an appeal, 
    <strong>the overall data suggests you have a strong chance of success</strong>â€”but it varies significantly by tribunal.
  </p>

  <ul style="margin-left: 1.5rem; color: #334155;">
    <li><strong>WSIAT (Ontario Workers' Comp):</strong> 100% prediction rate in our NLP modelâ€”but this reflects data limitations, not actual tribunal decisions. Our Tier A+B classification of 649 resolved WSIAT decisions (2020-2026 CanLII subset) shows a <strong>73.5% grant rate</strong>. The full dataset outcome gap (93.9% unresolved) prevents a definitive population-level rate.</li>
    <li><strong>BCWCAT (BC Workers' Comp):</strong> 86.4% win rateâ€”strong odds if you're prepared with medical evidence.</li>
    <li><strong>Other Tribunals:</strong> 84.1% win rate across mixed jurisdictionsâ€”consistently high success rates.</li>
    <li><strong>HRTO (Human Rights):</strong> High abandonment rate (14% of all cases) suggests procedural challengesâ€”but if you persist, success is possible.</li>
  </ul>

  <p style="margin-top: 1rem; font-size: 0.95rem; color: #64748b;">
    <strong>âš ï¸ Important:</strong> These predictions are based on AI analysis of decision text, not official tribunal outcomes. 
    Treat them as <strong>indicative patterns</strong>, not guarantees. Individual case outcomes depend on evidence quality, 
    legal representation, and specific circumstances.
  </p>

  <p style="margin-top: 1rem; font-size: 0.95rem; color: #64748b;">
    <strong>ðŸ”§ API Limitations â€” Confirmed by CanLII (May 2026):</strong> CanLII confirmed directly: <em>"CanLII doesn't provide any data further than what's provided by its API."</em> The API provides case metadata (date, keywords, citation) but <strong>no outcome field exists</strong>. All 230,392 records were collected via authorized API calls. Outcomes are inferred from keyword patterns in decision text â€” our NLP model predicts unknown outcomes with 79% accuracy based on case keywords and patterns. To get 100% accurate outcomes would require manually reading each case individually.
  </p>
</div>

### How We Built This (Methodology & Transparency)

<div class="tool-card" style="background: #f5f3ff; border-left: 4px solid #a855f7;">
  <h4 style="margin-top: 0; color: #7c3aed;">Training Data</h4>
  <ul style="margin-left: 1.5rem; color: #334155;">
    <li><strong>256,734 labeled examples</strong> from 105 tribunal decision files</li>
    <li><strong>14 outcome categories:</strong> Granted, Allowed, Dismissed, Denied, Abandoned, Reconsideration, Allowed - Violation Found, Dismissed - No Violation, Costs Decision, Interim Decision, Settled, Withdrawn, No Jurisdiction, Deferred</li>
    <li><strong>Natural Language Processing:</strong> Naive Bayes classifier trained on decision keywords, issue descriptions, and tribunal metadata</li>
    <li><strong>Test accuracy:</strong> 79.0% on 3,756 held-out examples (industry-standard train/test split)</li>
  </ul>

  <h4 style="margin-top: 1.5rem; color: #7c3aed;">Confidence Levels</h4>
  <ul style="margin-left: 1.5rem; color: #334155;">
    <li><strong>High confidence (â‰¥80%):</strong> 72.1% of predictions (25,213 decisions) - deployed in search results</li>
    <li><strong>Medium confidence (60-79%):</strong> Shown with warning label</li>
    <li><strong>Low confidence (<60%):</strong> Not deployed, flagged for manual review</li>
  </ul>

  <h4 style="margin-top: 1.5rem; color: #7c3aed;">Data Sources</h4>
  <ul style="margin-left: 1.5rem; color: #334155;">
    <li><a href="/data/outcome-summary.json" style="color: #7c3aed;">Outcome Summary (JSON)</a> - Overall statistics</li>
    <li><a href="/data/outcome-by-tribunal.json" style="color: #7c3aed;">Outcome by Tribunal (JSON)</a> - Tribunal breakdowns</li>
    <li><a href="/data/outcome-by-year.json" style="color: #7c3aed;">Outcome by Year (JSON)</a> - Temporal trends 2020-2026</li>
    <li><strong>All raw decision files:</strong> Available in <a href="/data/tribunal-decisions/" style="color: #7c3aed;">/data/tribunal-decisions/</a> directory</li>
  </ul>

  <p style="margin-top: 1rem; font-size: 0.9rem; color: #64748b;">
    <strong>Open Source Commitment:</strong> All outcome prediction data is publicly available. 
    We publish our methodology, confidence scores, and accuracy metrics so you can evaluate the reliability yourself.
  </p>
</div>

### Using Outcome Predictions in the App

<div class="tool-card">
  <p style="font-size: 1.05rem; margin-bottom: 1rem;">
    When you search for tribunal decisions in the 3mpwrApp, you'll now see <strong>outcome badges</strong> on every case:
  </p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
    <div style="text-align: center;">
      <div style="background: #22c55e; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">âœ“ ALLOWED</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Worker won</p>
    </div>
    <div style="text-align: center;">
      <div style="background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">âœ— DISMISSED</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Worker lost</p>
    </div>
    <div style="text-align: center;">
      <div style="background: #f59e0b; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">~ PARTIAL WIN</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Mixed outcome</p>
    </div>
    <div style="text-align: center;">
      <div style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">âŸ² REMANDED</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Sent back for reconsideration</p>
    </div>
  </div>

  <p style="margin-top: 1rem; font-size: 0.95rem; color: #64748b;">
    <strong>Filter by outcome:</strong> Search for "chronic pain" + "Allowed" to find winning precedents. 
    <strong>Compare similar cases:</strong> See how your situation matches cases that succeeded.
  </p>
</div>

---

<div id="injury-knowledge-base"></div>

## ðŸ“š Tribunal Guides: Complete System Overview

All guides below are **evidence-based** â€” derived from analyzing 122,488 tribunal decisions. Each guide shows you patterns from real cases, what evidence works, and strategic approaches that succeed.

### ðŸ›ï¸ Tribunal-Specific Appeal Guides

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Complete</span>
    <span class="tool-badge badge-green">5 Tribunals</span>
    <span class="tool-badge badge-purple">127,556 Cases</span>
  </div>
  
  <h3 style="margin-top: 0;">Complete Guides for Every Ontario Tribunal</h3>
  
  <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">
    Each tribunal handles different types of claims. These guides show you exactly how each tribunal operates, 
    what they look for, and proven strategies from winning cases.
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    
    <!-- WSIAT -->
    <div style="border: 2px solid #1976d2; border-radius: 8px; padding: 1.5rem; background: #e3f2fd;">
      <h4 style="margin: 0 0 0.5rem; color: #0d47a1;">ðŸ›ï¸ WSIAT Appeal Guide</h4>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">
        Workplace injury appeals. 98,992 decisions analyzed.
      </p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">
        <strong>Success Rate:</strong> 60-73% (from real cases)
      </p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li>Pre-existing condition tactics</li>
        <li>Medical evidence strategy</li>
        <li>Chronic pain & NEL claims</li>
      </ul>
      <a href="/guides/wsiat-complete-guide/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #1976d2; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Read Guide â†’</a>
    </div>

    <!-- HRTO -->
    <div style="border: 2px solid #7b1fa2; border-radius: 8px; padding: 1.5rem; background: #f3e5f5;">
      <h4 style="margin: 0 0 0.5rem; color: #4a148c;">âš–ï¸ HRTO Appeal Guide</h4>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">
        Workplace discrimination & disability accommodation.
      </p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">
        <strong>Coverage:</strong> 9,269 HRTO cases analyzed
      </p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li>Grounds of discrimination</li>
        <li>Accommodation claims</li>
        <li>Email notification barriers</li>
      </ul>
      <a href="/guides/hrto-complete-guide/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #7b1fa2; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Read Guide â†’</a>
    </div>

    <!-- ONSBT -->
    <div style="border: 2px solid #2e7d32; border-radius: 8px; padding: 1.5rem; background: #e8f5e9;">
      <h4 style="margin: 0 0 0.5rem; color: #1b5e20;">ðŸ“‹ ONSBT Appeal Guide</h4>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">
        ODSP/OW disability benefits appeals.
      </p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">
        <strong>Success Rate:</strong> 67.4% grant rate
      </p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li>Benefit eligibility requirements</li>
        <li>Medical evidence standards</li>
        <li>Appeal procedures & deadlines</li>
      </ul>
      <a href="/guides/onsbt-complete-guide/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #2e7d32; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Read Guide â†’</a>
    </div>

    <!-- ONWSIB -->
    <div style="border: 2px solid #d32f2f; border-radius: 8px; padding: 1.5rem; background: #ffebee;">
      <h4 style="margin: 0 0 0.5rem; color: #b71c1c;">ðŸ¢ ONWSIB Skip Strategy</h4>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">
        When to use WSIB internal review vs. skip to WSIAT.
      </p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">
        <strong>Grant Rate:</strong> 4.3% (very low)
      </p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li>Is internal review worth it?</li>
        <li>When to appeal to WSIAT</li>
        <li>Strategic timing</li>
      </ul>
      <a href="/guides/onwsib-skip-strategy-guide/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #d32f2f; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Read Guide â†’</a>
    </div>

    <!-- ONCA -->
    <div style="border: 2px solid #455a64; border-radius: 8px; padding: 1.5rem; background: #eceff1;">
      <h4 style="margin: 0 0 0.5rem; color: #263238;">âš–ï¸ ONCA Appellate Guide</h4>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">
        Appealing tribunal decisions to Ontario Court of Appeal.
      </p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">
        <strong>Success:</strong> 5% (very high bar)
      </p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li>Standards of review</li>
        <li>Leave to appeal process</li>
        <li>When ONCA makes sense</li>
      </ul>
      <a href="/guides/onca-appellate-guide/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #455a64; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Read Guide â†’</a>
    </div>

    <!-- Cross-Pathway -->
    <div style="border: 2px solid #6d28d9; border-radius: 8px; padding: 1.5rem; background: #f5f3ff;">
      <h4 style="margin: 0 0 0.5rem; color: #5b21b6;">ðŸ”„ Cross-Pathway Guide</h4>
      <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #333;">
        From WSIB to ODSP: When & how to move between programs.
      </p>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">
        <strong>Use When:</strong> Workers' comp insufficient
      </p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li>Overlapping programs</li>
        <li>Application strategy</li>
        <li>Common mistakes</li>
      </ul>
      <a href="/guides/wsib-to-odsp-pathway/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #6d28d9; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Read Guide â†’</a>
    </div>

  </div>
</div>

---

<div id="appeal-templates"></div>

## ðŸ“‹ Appeal & Application Templates

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Free</span>
    <span class="tool-badge badge-green">Downloadable</span>
    <span class="tool-badge badge-purple">13+ Templates</span>
  </div>
  
  <h3 style="margin-top: 0;">Ready-to-Use Appeal Templates from Winning Cases</h3>
  
  <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">
    These templates show you exactly how successful appeals are structured. Based on analyzing hundreds of won cases, 
    they include the arguments that work, the evidence order that matters, and the language that wins.
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
    <div style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 0.5rem;">ðŸ“„ Pre-Existing Condition Appeal</h4>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">How to argue "pre-existing" is aggravation, not exclusion</p>
      <a href="/templates/pre-existing-appeal/" style="font-weight: 600; color: #667eea;">Download â†’</a>
    </div>
    <div style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 0.5rem;">ðŸ’Š Chronic Pain Appeal</h4>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">Template for NOC (Non-Occupational) pain conditions</p>
      <a href="/templates/chronic-pain-appeal/" style="font-weight: 600; color: #667eea;">Download â†’</a>
    </div>
    <div style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 0.5rem;">ðŸ¦´ Back Injury Appeal</h4>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">Most common injury type (15.3% of cases)</p>
      <a href="/templates/back-injury-appeal/" style="font-weight: 600; color: #667eea;">Download â†’</a>
    </div>
    <div style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 0.5rem;">âœ‹ Carpal Tunnel Appeal</h4>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">Repetitive strain injury template</p>
      <a href="/templates/carpal-tunnel-appeal/" style="font-weight: 600; color: #667eea;">Download â†’</a>
    </div>
    <div style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 0.5rem;">ðŸ§  HRTO Accommodation Request</h4>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">How to file for disability accommodation</p>
      <a href="/templates/hrto-accommodation/" style="font-weight: 600; color: #667eea;">Download â†’</a>
    </div>
    <div style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; border-left: 4px solid #667eea;">
      <h4 style="margin: 0 0 0.5rem;">ðŸ“‹ ONSBT Appeal Letter</h4>
      <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666;">Appeal an ODSP/OW denial</p>
      <a href="/templates/onsbt-appeal/" style="font-weight: 600; color: #667eea;">Download â†’</a>
    </div>
  </div>
</div>

---

## ðŸ“Š All Data Visualizations

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Live</span>
    <span class="tool-badge badge-green">Interactive</span>
    <span class="tool-badge badge-purple">8 Visualizations</span>
  </div>
  
  <h3 style="margin-top: 0;">Complete Visualization Library</h3>
  
  <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">
    Explore tribunal data visually. All charts are interactive â€” zoom, filter, and discover patterns yourself.
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    
    <!-- Workplace Injury (WSIAT) -->
    <div style="border: 2px solid #1976d2; border-radius: 8px; padding: 1.5rem; background: #e3f2fd;">
      <h4 style="margin: 0 0 0.5rem; color: #0d47a1;">âš¡ WSIAT Visualizations</h4>
      <p style="margin: 0 0 1rem; font-size: 0.9rem; color: #333;">Workplace injury appeals data</p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li><a href="/data/visualizations/wsiat-outcome-classification-2020-2026.json" style="color: #1976d2;">Outcome Classification (2020-2026)</a></li>
        <li><a href="/data/visualizations/temporal-evolution-wsiat.json" style="color: #1976d2;">Temporal Evolution (1987-2026)</a></li>
        <li><a href="/data/visualizations/wsiat-keyword-network.json" style="color: #1976d2;">Legal Issue Network Graph</a></li>
      </ul>
      <p style="margin: 0; font-size: 0.85rem; color: #666;"><strong>Cases:</strong> 98,992</p>
    </div>

    <!-- Disability Benefits (ONSBT) -->
    <div style="border: 2px solid #2e7d32; border-radius: 8px; padding: 1.5rem; background: #e8f5e9;">
      <h4 style="margin: 0 0 0.5rem; color: #1b5e20;">ðŸ’° ONSBT Visualizations</h4>
      <p style="margin: 0 0 1rem; font-size: 0.9rem; color: #333;">Disability benefits appeals data</p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li><a href="/data/visualizations/onsbt-onwsib-classification-2020-2026.json" style="color: #2e7d32;">Outcome Classification + ONWSIB</a></li>
        <li>Geographic heatmap (in development)</li>
        <li>Denial patterns by region</li>
      </ul>
      <p style="margin: 0; font-size: 0.85rem; color: #666;"><strong>Cases:</strong> 13,798</p>
    </div>

    <!-- Cross-Tribunal -->
    <div style="border: 2px solid #7b1fa2; border-radius: 8px; padding: 1.5rem; background: #f3e5f5;">
      <h4 style="margin: 0 0 0.5rem; color: #4a148c;">ðŸ›ï¸ Cross-Tribunal Analysis</h4>
      <p style="margin: 0 0 1rem; font-size: 0.9rem; color: #333;">Compare outcomes across systems</p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li><a href="/data/visualizations/cross-tribunal-comparison.json" style="color: #7b1fa2;">Success Rates by Tribunal</a></li>
        <li><a href="/data/visualizations/onca-procedural-decisions-2020-2026.json" style="color: #7b1fa2;">ONCA Procedural Breakdown</a></li>
      </ul>
      <p style="margin: 0; font-size: 0.85rem; color: #666;"><strong>Cases:</strong> 127,556 total</p>
    </div>

    <!-- Employer Safety -->
    <div style="border: 2px solid #d32f2f; border-radius: 8px; padding: 1.5rem; background: #ffebee;">
      <h4 style="margin: 0 0 0.5rem; color: #b71c1c;">ðŸ¢ Employer Safety Data</h4>
      <p style="margin: 0 0 1rem; font-size: 0.9rem; color: #333;">Workplace incident patterns</p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li><a href="/data/visualizations/employer-safety-sample.json" style="color: #d32f2f;">Employer Safety Heatmap</a></li>
        <li>Regional incident clustering</li>
        <li>Industry comparison data</li>
      </ul>
      <p style="margin: 0; font-size: 0.85rem; color: #666;"><strong>Employers:</strong> 130,736</p>
    </div>

    <!-- Appeals Funnel -->
    <div style="border: 2px solid #f57c00; border-radius: 8px; padding: 1.5rem; background: #fff3e0;">
      <h4 style="margin: 0 0 0.5rem; color: #e65100;">ðŸ”€ Appeals Flow</h4>
      <p style="margin: 0 0 1rem; font-size: 0.9rem; color: #333;">How claims move through system</p>
      <ul style="margin: 0 0 1rem 1.2rem; font-size: 0.9rem;">
        <li><a href="/data/visualizations/wsib-appeal-funnel.json" style="color: #f57c00;">Appeal Funnel (WSIBâ†’WSIAT)</a></li>
        <li>Denial â†’ Appeal conversion rates</li>
        <li>Success rates by stage</li>
      </ul>
      <p style="margin: 0; font-size: 0.85rem; color: #666;"><strong>Flow:</strong> Claims to outcomes</p>
    </div>

  </div>

  <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1rem 1.5rem; border-radius: 6px; margin-top: 2rem;">
    <p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: #333;">
      <strong>âœ… Accessibility First:</strong> All visualizations are readable in light mode, dark mode, and high contrast mode. 
      Text is legible, colors meet WCAG AAA contrast standards, and interactive elements are keyboard-accessible.
    </p>
  </div>
</div>

---

  </p>
</div>

## ï¿½ðŸ“š Knowledge Base & Resources

All guides and templates below are **derived from analyzing 11,430+ tribunal decisions**. These are not generic adviceâ€”they're **evidence-based strategies** from actual winning cases.

### Injury-Specific Guides (16 Comprehensive Articles)

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Live</span>
    <span class="tool-badge badge-green">Free</span>
    <span class="tool-badge badge-purple">Evidence-Based</span>
  </div>
  
  <h3 style="margin-top: 0;">WSIB Claim Guides: What Actually Works</h3>
  
  <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">
    Each guide analyzes hundreds of tribunal decisions to show you <strong>exactly what evidence wins claims</strong> 
    for your specific injury type. No generic adviceâ€”these are patterns from real cases.
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea;">
      <strong style="color: #667eea;">ðŸ¦´ Musculoskeletal</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/knowledge-base/low-back-pain-claims/">Low Back Pain</a></li>
        <li><a href="/knowledge-base/shoulder-rotator-cuff-claims/">Shoulder & Rotator Cuff</a></li>
        <li><a href="/knowledge-base/knee-injury-claims/">Knee Injuries</a></li>
        <li><a href="/knowledge-base/neck-whiplash-claims/">Neck & Whiplash</a></li>
        <li><a href="/knowledge-base/hip-injury-claims/">Hip Injuries</a></li>
        <li><a href="/knowledge-base/ankle-injury-claims/">Ankle Injuries</a></li>
      </ul>
    </div>
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #764ba2;">
      <strong style="color: #764ba2;">âœ‹ Upper Extremity</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/knowledge-base/wrist-carpal-tunnel-claims/">Wrist & Carpal Tunnel</a></li>
        <li><a href="/knowledge-base/elbow-epicondylitis-claims/">Elbow & Epicondylitis</a></li>
        <li><a href="/knowledge-base/hand-finger-claims/">Hand & Finger Injuries</a></li>
      </ul>
    </div>
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #d32f2f;">
      <strong style="color: #d32f2f;">ðŸ§  Neurological & Mental Health</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/knowledge-base/psychotraumatic-disability/">PTSD & Psychotraumatic Disability</a></li>
        <li><a href="/knowledge-base/chronic-pain-claims/">Chronic Pain</a></li>
        <li><a href="/knowledge-base/fibromyalgia-claims/">Fibromyalgia</a></li>
        <li><a href="/knowledge-base/concussion-tbi-claims/">Concussion & TBI</a></li>
      </ul>
    </div>
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #f57c00;">
      <strong style="color: #f57c00;">âš–ï¸ Legal Strategies</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/knowledge-base/pre-existing-conditions/">Countering Pre-Existing Denials</a></li>
        <li><a href="/knowledge-base/permanent-impairment-rating/">Maximizing NEL Benefits</a></li>
        <li><a href="/knowledge-base/hearing-loss-claims/">Hearing Loss & Occupational Disease</a></li>
        <li><a href="/knowledge-base/claim-suppression-retaliation/">Claim Suppression & Employer Retaliation</a></li>
        <li><a href="/knowledge-base/bill-86-meredith-act/">Bill 86 & Meredith Act Rights</a></li>
      </ul>
    </div>
    
  </div>
  
  <p style="margin: 1rem 0 0; font-size: 0.9rem; color: #666;">
    <strong>Based on:</strong> 11,430 total analyzed cases (2020-2026 WSIAT decisions). 
    <strong>All guides live now:</strong> 19 comprehensive injury-specific guides + 5 legal strategy guides available above.
  </p>
</div>

### Appeal Letter Templates (50+ Fill-in-the-Blank Letters)

<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Live</span>
    <span class="tool-badge badge-green">Free</span>
    <span class="tool-badge badge-purple">Professional Quality</span>
  </div>
  
  <h3 style="margin-top: 0;">Ready-to-Use Appeal Templates</h3>
  
  <p style="font-size: 1.05rem; margin-bottom: 1.5rem;">
    Professional appeal letters you can customize in 30 minutes. Each template includes:
  </p>
  
  <ul style="margin: 0 0 1.5rem 1.5rem;">
    <li><strong>Legal arguments from winning cases</strong> (exact language that worked)</li>
    <li><strong>Medical evidence checklist</strong> (what documents to attach)</li>
    <li><strong>Employer evidence pushback</strong> (how to counter their claims)</li>
    <li><strong>Timeline walkthrough</strong> (step-by-step what happens next)</li>
  </ul>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
    <div>
      <h4 style="margin: 0 0 0.5rem; color: #667eea;">ðŸ“„ Featured Templates (Live Now!)</h4>
      <ul style="margin: 0 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/templates/back-injury-appeal/">Back Injury Appeal</a></li>
        <li><a href="/templates/chronic-pain-appeal/">Chronic Pain Appeal</a></li>
        <li><a href="/templates/pre-existing-appeal/">Pre-Existing Condition Appeal</a></li>
      </ul>
      <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #666;">
        <em>Professional-grade fill-in-the-blank templates Â· Addresses all common denials Â· Free to use</em>
      </p>
    </div>
    <div>
      <h4 style="margin: 0 0 0.5rem; color: #764ba2;">ðŸ”œ More Templates Being Added</h4>
      <p style="margin: 0; font-size: 0.9rem; color: #666;">
        Additional templates for shoulder, knee, mental health/PTSD, carpal tunnel, concussion, fibromyalgia, hearing loss, 
        herniated disc, impairment rating, neck injury, respiratory, rotator cuff, 
        strain/sprain, tendinitis, and more are currently being converted from JSON data to user-friendly markdown templates.
      </p>
      <p style="margin: 0.5rem 0 0; font-size: 0.85rem;">
        <em>Currently stored as structured JSON data format. Watch this space for updates.</em>
      </p>
    </div>
  </div>
</div>

## ðŸ”„ Close the Loop: How Your Feedback Makes Data Better

**This is the key:** Research only works if it cycles back to action. Here's how you accelerate the flywheel.

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
  <h3 style="margin: 0 0 1rem; color: white;">The 3mpwr Feedback Cycle</h3>
  
  <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
    <p style="margin: 0; font-size: 1.2rem; font-weight: bold; text-align: center;">
      ðŸ“Š Data â†’ ðŸ“– Patterns â†’ âœ… Tools â†’ ðŸ’ª You Win â†’ ðŸ”„ You Share â†’ ðŸ“Š Better Data
    </p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    
    <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.5rem; color: white;">Step 1: We Analyze Data</h4>
      <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">
        230,392 records analyzed. Patterns detected (pre-existing = 13.3%, knee bias = 20%). 
        Tactics identified. Statistics calculated.
      </p>
    </div>
    
    <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.5rem; color: white;">Step 2: We Build Tools</h4>
      <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">
        Guides written. Templates created. Visualizations built. 
        All based on real patterns from real decisions.
      </p>
    </div>
    
    <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.5rem; color: white;">Step 3: You Use Tools</h4>
      <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">
        Read the guides. Use the templates. Fight your appeal. 
        Our data shows 73.5% grant rate in resolved WSIAT decisions â€” and most workers never even appeal.
      </p>
    </div>

    <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.5rem; color: white;">Step 4: You Share Outcome</h4>
      <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">
        Win or lose, share your result. That fills the 91.8% outcome gap. 
        The next worker gets better data.
      </p>
    </div>

    <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.5rem; color: white;">Step 5: Cycle Accelerates</h4>
      <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">
        More outcomes = better patterns = stronger tools = more wins = richer data. 
        <strong>The flywheel spins faster.</strong>
      </p>
    </div>
    
  </div>
  
  <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.2); border-radius: 8px;">
    <h4 style="margin: 0 0 1rem; color: white; font-size: 1.2rem;">How You Can Contribute:</h4>
    <ul style="margin: 0 0 0 1.5rem; line-height: 2;">
      <li><strong>Use the tools</strong> â†’ Fight your case with real data</li>
      <li><strong>Share your outcome</strong> â†’ Email empowrapp08162025@gmail.com (anonymous OK)</li>
      <li><strong>Report new tactics</strong> â†’ Help us detect emerging patterns</li>
      <li><strong>Challenge our methodology</strong> â†’ Find errors? Tell us. We fix it.</li>
    </ul>
    <p style="margin: 1.5rem 0 0; font-size: 1.05rem;">
      <strong>â†’ Start the cycle:</strong> <a href="/app/" style="color: white; text-decoration: underline; font-weight: bold;">Use the Evidence Locker</a> to upload your denial letter â†’ 
      Get personalized strategy â†’ Win your appeal â†’ Share result â†’ Help next worker
    </p>
  </div>
</div>

---

## ðŸ”œ Coming Soon

### Human Rights Tribunal Decision Network
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Complete</span>
    <span class="tool-badge" style="background: #005a00;">Ontario</span>
  </div>
  
  <h3 style="margin-top: 0;">Ontario Human Rights Tribunal (HRTO) Pattern Analysis</h3>
  <p>
    Analyzing disability discrimination cases, settlement patterns, and systemic barriers. 
    Expanding beyond workers' compensation to cover employment discrimination, housing, and services.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #333;">
    <strong>âœ… Launched:</strong> April 2026 | <strong>Dataset:</strong> 9,269 decisions analyzed (2020-2026)
  </p>
  <p style="margin: 0.5rem 0 0; font-size: 0.95rem;">
    <a href="/guides/hrto-complete-guide/" style="font-weight: 600;">View HRTO Guide â†’</a> | 
    <a href="/blog/2026/04/20/hrto-email-crisis-abandonment-epidemic/" style="font-weight: 600;">Read HRTO Analysis â†’</a>
  </p>
</div>

### British Columbia Workers' Compensation Appeals
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge coming-soon">Data Collection Phase</span>
    <span class="tool-badge badge-red">British Columbia</span>
  </div>
  
  <h3 style="margin-top: 0; color: #666;">WorkSafeBC & WCAT Decision Analysis</h3>
  <p style="color: #666;">
    Analyzing BC workers' compensation appeals to compare transparency and success rates with Ontario WSIAT. 
    Expanding cross-province pattern detection and tribunal comparison tools.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #999;">
    <strong>Status:</strong> Collection in progress | <strong>Target Dataset:</strong> 15,000+ decisions
  </p>
</div>

### Other Provincial Workers' Compensation Tribunals
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge coming-soon">Planned</span>
    <span class="tool-badge badge-red">Alberta, Quebec, NS, MB, SK</span>
  </div>
  
  <h3 style="margin-top: 0; color: #666;">Canada-Wide Tribunal Transparency Network</h3>
  <p style="color: #666;">
    Expanding to WCB Alberta, CNESST (Quebec), Nova Scotia WCB, Manitoba WCB, and Saskatchewan WCB. 
    Building comprehensive cross-provincial comparison tools for denial patterns and appeal outcomes.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #999;">
    <strong>Estimated Launch:</strong> 2027 | <strong>Expected Dataset:</strong> 40,000+ decisions
  </p>
</div>

### Cross-Tribunal Comparison Tool
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge coming-soon">Planned</span>
    <span class="tool-badge" style="background: #005a00;">Ontario</span>
  </div>
  
  <h3 style="margin-top: 0; color: #666;">Multi-Tribunal Pattern Detector</h3>
  <p style="color: #666;">
    Compare outcomes across WSIB, Human Rights, Employment Standards, and Landlord-Tenant tribunals. 
    Identify workers caught in multiple systems, systematic employer bad actors, and regional disparities.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #999;">
    <strong>Estimated Launch:</strong> 2027 | <strong>Requires:</strong> All Ontario tribunals collected
  </p>
</div>

### Canada-Wide Workers' Compensation Network
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge coming-soon">Planned</span>
    <span class="tool-badge badge-red">National</span>
  </div>
  
  <h3 style="margin-top: 0; color: #666;">Provincial Comparison: BC, AB, QC, NS, MB, SK</h3>
  <p style="color: #666;">
    Expand WSIB visualization to cover WorkSafeBC, WCB Alberta, CNESST (Quebec), and all provincial systems. 
    Compare denial rates, appeal success, and systemic patterns across Canada.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #999;">
    <strong>Estimated Launch:</strong> 2027-2028 | <strong>Expected Dataset:</strong> 50,000+ decisions
  </p>
</div>

---

## ðŸ“Š Research Methodology

All tools on this page follow these principles:

1. **Open Source Code**
   - Analysis scripts published on [GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
   - Reproducible methodology
   - Community contributions welcome

2. **Transparent Data Sources**
   - CanLII (Canada's free legal database)
   - Provincial tribunal websites
   - Freedom of Information Act requests where necessary
   - **No paywalls, no corporate databases**

3. **Accessible Visualization**
   - WCAG 2.1 AAA compliant
   - Keyboard navigation
   - Screen reader compatible
   - Color-blind friendly palettes

4. **Community-Driven**
   - Workers can submit case outcomes to fill data gaps
   - Injured worker advocates review methodology
   - Thunder Bay & District Injured Workers Support Group partnership

---

## ðŸ¤ Contribute to Research

### For Injured Workers
- **Share Your Case Outcome** (anonymous): Email empowrapp08162025@gmail.com
  - We'll add to our database to fill the 91.8% outcome gap
  - Help future workers understand success rates

### For Researchers & Advocates
- **Validate Our Methodology**: Review our [analysis scripts](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/tree/main/scripts)
- **Suggest New Visualizations**: What patterns should we look for?
- **Provide Data**: Do you have tribunal datasets we're missing?

### For Developers
- **Improve Visualizations**: Fork our D3.js code and submit pull requests
- **Build New Tools**: Expand to your province/tribunal
- **Optimize Performance**: Help us scale to 100,000+ decisions

---

## 📚 Related Blog Posts

### WSIAT (Workplace Safety & Insurance Appeals Tribunal)
- [WSIB Exposed: Statistical Evidence Reveals Systematic Patterns](/blog/2026/04/15/wsib-exposed-statistical-evidence-proves-systematic-manipulation/) - Rigorous analysis of 11,430 cases
- [The WSIB Black Box: 1.14-2.29M Workers Suppressed](/blog/2026/04/16/wsib-black-box-claim-suppression-outcome-obscurity/) - 91.8% outcome obscurity + suppression research
- [Hidden Language of Denial: WSIB Keyword Patterns](/blog/2026/04/16/hidden-language-of-denial-wsib-keyword-decoder/) - Decode your denial letter
- [WSIB Transparency Gap: Outcome Obscurity REVISED](/blog/2026/04/16/wsib-transparency-gap-outcome-obscurity-REVISED/) - Updated transparency analysis
- [WSIAT vs BC WCAT: Transparency Divide](/blog/2026/04/29/wsiat-vs-bc-wcat-transparency-divide/) - Comparing tribunal transparency across Canada

### HRTO (Human Rights Tribunal of Ontario)
- [HRTO Abandonment Analysis: Email Issues in 70.1% of Cases](/blog/2026/04/20/hrto-email-crisis-abandonment-epidemic/) - 3,186 decisions analyzed (2020-2026)

### ONSBT (Ontario Social Benefits Tribunal)
- [Ontario Social Benefits Tribunal 2020â€“2026: Seven Years of Disability Decisions](/blog/2026/04/26/onsbt-2020-2026-comprehensive-analysis/) - 13,798 decisions comprehensive analysis
- [ONSBT Outcome Classification Audit Update](/blog/2026/04/26/onsbt-outcome-classification-audit-update/) - Tiered evidence methodology
- [ONSBT Accessibility Barriers: Vulnerable Communities](/blog/2026/04/26/onsbt-accessibility-barriers-vulnerable-communities/) - Structural barriers analysis

### ONWSIB (WSIB Internal Review)
- [ONWSIB 2020-2026: Outcome Gap Audit and Evidence Limits](/blog/2026/04/26/onwsib-outcome-gap-audit-update/) - 463 decisions analyzed

### ONCA (Ontario Court of Appeal)
- [Ontario Court of Appeal (ONCA) Precedent Overview: 5,034 Decisions](/blog/2026/05/08/onca-precedent-overview/) - Appellate layer analysis (2020-2026)

### CanLII Database & Cross-Tribunal Analysis
- [Feature Spotlight: CanLII Database - Ontario WSIB & HRTO Cases](/blog/2026/04/25/feature-spotlight-canlii-database-ontario-wsib-hrto-cases-expanding-canada-wide/) - Searchable database expanding Canada-wide
- [Building Canada's Legal Database from Cold Start](/blog/2026/04/05/building-canadas-legal-database-from-cold-start/) - Data collection methodology

---

## ðŸ“§ Questions or Feedback?

- **Email:** empowrapp08162025@gmail.com

</div>
- **Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)
- **Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)

---

*All research tools are provided free of charge, with open source code and transparent methodology. 
This is community-driven transparency for workers' justice.*
