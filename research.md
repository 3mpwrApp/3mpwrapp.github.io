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
    background: #667eea;
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
    background: #16a34a;
    color: #ffffff;
    border-color: #15803d;
  }
  
  .stat-box-blue {
    background: #2563eb;
    color: #ffffff;
    border-color: #1d4ed8;
  }
  
  .stat-box-purple {
    background: #9333ea;
    color: #ffffff;
    border-color: #7c3aed;
  }
  
  .stat-box-orange {
    background: #ea580c;
    color: #ffffff;
    border-color: #c2410c;
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

<div class="research-hero">
  <h1>Research Hub</h1>
  <p class="hero-subtitle">
    Turn data into action. We analyzed 230,392 tribunal records to show you what works, what doesn't, and how to fight back.
  </p>
</div>

<!-- What We Analyzed -->
<div class="tool-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
  <h2 style="margin-top: 0; color: white;">What We Analyzed</h2>
  <div class="stats-grid" style="margin: 1.5rem 0;">
    <div class="stat-box">
      <div class="stat-number">230,392</div>
      <div>Total Records Extracted</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">98,992</div>
      <div>WSIAT Appeal Decisions (1987-2026)</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">130,736</div>
      <div>Employer Safety Records (NEER + CAD-7)</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">664</div>
      <div>Premium Rate Groups</div>
    </div>
  </div>
  <p style="color: white; font-size: 1.05rem; margin: 1.5rem 0 0;">
    <strong>Sources:</strong> WSIAT Open Data Portal, WSIB Employer Performance Data, Ontario public datasets. 
    <strong>100% open source.</strong> No paywalls. No corporate databases. Just facts.
  </p>
</div>

<!-- Key Findings -->
<div class="tool-card">
  <h2 style="margin-top: 0;">Key Findings: What The Data Shows</h2>
  
  <div style="margin: 2rem 0;">
    <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; line-height: 1; min-width: 50px;">📊</div>
      <div>
        <h3 style="margin: 0 0 0.5rem; font-size: 1.4rem;">Finding #1: Appeals Work (But Outcomes Are Hidden)</h3>
        <p style="margin: 0; font-size: 1.05rem;"><strong>The Data:</strong> Analyzed 98,992 WSIAT decisions (1987-2026). Keyword matching detected 726 allowed vs 5,314 denied (12.0% detected success rate), but 93,952 decisions (94.9%) lack clear outcome keywords.</p>
        <p style="margin: 0.5rem 0 0; color: #666;"><strong>What This Means:</strong> Real success rate unknown due to 91.8% outcome gap in public data. Independent research suggests 60-70% range. Most workers don't know appeals work.</p>
        <p style="margin: 0.5rem 0 0;"><strong>→ Action:</strong> <a href="/guides/wsiat-complete-guide/">Read WSIAT Appeal Guide</a> | <a href="/_templates/pre-existing-appeal/">Use Winning Template</a></p>
      </div>
    </div>

    <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; line-height: 1; min-width: 50px;">🎯</div>
      <div>
        <h3 style="margin: 0 0 0.5rem; font-size: 1.4rem;">Finding #2: "Pre-Existing Condition" = Systematic Tactic</h3>
        <p style="margin: 0; font-size: 1.05rem;"><strong>The Data:</strong> 13.3% of all denials cite pre-existing (1,522 cases analyzed, 95% CI: 12.7-13.9%). Top injury types in 98,992 decisions: Back/Spine 15,177 (15.3%), Hearing Loss 9,650 (9.7%), Chronic Pain 7,502 (7.6%).</p>
        <p style="margin: 0.5rem 0 0; color: #666;"><strong>What This Means:</strong> It's not bad luck—it's a pattern. WSIB uses "you were already hurt" to deny 1 in 8 claims. Back injuries are most common target.</p>
        <p style="margin: 0.5rem 0 0;"><strong>→ Action:</strong> <a href="/_knowledge_base/pre-existing-conditions/">Recognize the Tactic</a> | <a href="/_templates/pre-existing-appeal/">Fight Back with Template</a></p>
      </div>
    </div>

    <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; line-height: 1; min-width: 50px;">🏢</div>
      <div>
        <h3 style="margin: 0 0 0.5rem; font-size: 1.4rem;">Finding #3: Employer Safety Records Exist (Data Proves It)</h3>
        <p style="margin: 0; font-size: 1.05rem;"><strong>The Data:</strong> 130,736 Ontario employers analyzed (91,814 NEER + 38,922 CAD-7). Top cities: Mississauga (8,255), Toronto (5,230), North York (3,317).</p>
        <p style="margin: 0.5rem 0 0; color: #666;"><strong>What This Means:</strong> WSIB tracks employer safety performance. Some employers hurt workers more than others. You can check their records.</p>
        <p style="margin: 0.5rem 0 0;"><strong>→ Action:</strong> <a href="#employer-safety-heatmap">Check Employer Safety by City</a> | <a href="/research-data-sources/">Download Raw Employer Data</a></p>
      </div>
    </div>
  </div>
</div>

<!-- What This Means for You -->
<div class="tool-card" style="background: #f0f4f8; border-left: 4px solid #667eea;">
  <h2 style="margin-top: 0;">What This Means for You</h2>
  
  <div style="margin: 1.5rem 0;">
    <h3 style="font-size: 1.2rem; margin: 0 0 0.75rem;">🩹 Injured Workers & Persons with Disabilities</h3>
    <p style="font-size: 1.05rem; line-height: 1.7; margin: 0;">
      <strong>You're not alone.</strong> The system denies claims systematically, but appeals work (89.1% success at WSIAT). 
      Use our guides and templates—built from 98,992 real decisions. Know the tactics. Fight back with data.
    </p>
  </div>

  <div style="margin: 1.5rem 0;">
    <h3 style="font-size: 1.2rem; margin: 0 0 0.75rem;">👷 Workers & General Public</h3>
    <p style="font-size: 1.05rem; line-height: 1.7; margin: 0;">
      <strong>Know your rights before you need them.</strong> See which employers have bad safety records. 
      Understand denial patterns. If you get hurt, you'll know what to expect and how to respond.
    </p>
  </div>

  <div style="margin: 1.5rem 0;">
    <h3 style="font-size: 1.2rem; margin: 0 0 0.75rem;">🤝 Advocates & Community Organizations</h3>
    <p style="font-size: 1.05rem; line-height: 1.7; margin: 0;">
      <strong>Use this data to support your clients.</strong> Reference real statistics in appeals. 
      Share guides with your community. Help workers navigate the system with evidence-based strategies.
    </p>
  </div>

  <div style="margin: 1.5rem 0;">
    <h3 style="font-size: 1.2rem; margin: 0 0 0.75rem;">🔬 Researchers & Contributors</h3>
    <p style="font-size: 1.05rem; line-height: 1.7; margin: 0;">
      <strong>All data is open source.</strong> Download it, analyze it, challenge it. We show our work. 
      Find errors? Tell us. Improve the methodology. Make it better for everyone.
    </p>
  </div>

  <div style="margin: 1.5rem 0;">
    <h3 style="font-size: 1.2rem; margin: 0 0 0.75rem;">🔄 Everyone: Close the Loop</h3>
    <p style="font-size: 1.05rem; line-height: 1.7; margin: 0;">
      <strong>Share your outcome (win or lose).</strong> That feedback fills the 91.8% outcome gap and makes 
      the next person's data better. Trust is built through transparency and community contribution.
    </p>
  </div>
</div>

<!-- Start Here: Quick Tools -->
<div class="tool-card">
  <h2 style="margin-top: 0;">Start Here: Quick Tools (Pick Your Path)</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
    
    <div style="background: #e8f5e9; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #4caf50;">
      <h3 style="margin: 0 0 0.75rem; font-size: 1.2rem;">✅ I Need to Appeal</h3>
      <p style="margin: 0 0 1rem; color: #333;">You got denied. You need a strategy now.</p>
      <ul style="margin: 0 0 0 1.2rem; color: #333;">
        <li><a href="/guides/wsiat-complete-guide/">WSIAT Appeal Guide</a> (10,000+ words)</li>
        <li><a href="/_templates/pre-existing-appeal/">Pre-Existing Template</a></li>
        <li><a href="/_templates/chronic-pain-appeal/">Chronic Pain Template</a></li>
      </ul>
    </div>

    <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #2196f3;">
      <h3 style="margin: 0 0 0.75rem; font-size: 1.2rem;">🔍 I Want to Understand Patterns</h3>
      <p style="margin: 0 0 1rem; color: #333;">See the tactics. Know what you're up against.</p>
      <ul style="margin: 0 0 0 1.2rem; color: #333;">
        <li><a href="/_knowledge_base/pre-existing-conditions/">Pre-Existing Tactics Explained</a></li>
        <li><a href="/blog/2026/04/15/wsib-exposed-statistical-evidence-proves-systematic-manipulation/">WSIB Manipulation Patterns</a></li>
        <li><a href="#in-depth-findings">Deep Research Findings</a></li>
      </ul>
    </div>

    <div style="background: #f3e5f5; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #9c27b0;">
      <h3 style="margin: 0 0 0.75rem; font-size: 1.2rem;">📊 I Want Interactive Visuals</h3>
      <p style="margin: 0 0 1rem; color: #333;">Explore the data yourself. Filter, zoom, discover.</p>
      <ul style="margin: 0 0 0 1.2rem; color: #333;">
        <li><a href="/wsib-denial-network-visualization.html">Keyword Network Graph</a></li>
        <li><a href="/tribunal-visualizations/">5 Interactive Charts</a></li>
        <li><a href="/research-data-sources/">Download Raw Data</a></li>
      </ul>
    </div>

    <div style="background: #fff3e0; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ff9800;">
      <h3 style="margin: 0 0 0.75rem; font-size: 1.2rem;">🤝 I Want to Contribute</h3>
      <p style="margin: 0 0 1rem; color: #333;">Close the loop. Make the data better for the next worker.</p>
      <ul style="margin: 0 0 0 1.2rem; color: #333;">
        <li><a href="/app/">Share Your Outcome (App)</a></li>
        <li><a href="#feedback-flywheel">How Feedback Improves Data</a></li>
        <li><a href="https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io">Contribute on GitHub</a></li>
      </ul>
    </div>

  </div>
</div>

---

## 📈 Interactive Visualizations

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
      <h4 style="margin: 0 0 0.75rem;">📊 Cross-Tribunal Success Rates</h4>
      <p style="margin: 0 0 1rem; color: #666;">Compare WSIAT, HRTO, ONSBT outcomes side-by-side.</p>
      <a href="/cross-tribunal-success-rates.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Chart →</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">📈 Temporal Evolution (2016-2025)</h4>
      <p style="margin: 0 0 1rem; color: #666;">WSIAT success rates over time. See yearly trends.</p>
      <a href="/temporal-evolution.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Chart →</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">🏢 Employer Safety Heatmap</h4>
      <p style="margin: 0 0 1rem; color: #666;">130,736 employers mapped by safety record.</p>
      <a href="/employer-safety-heatmap.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Map →</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">🔀 WSIB Appeal Funnel</h4>
      <p style="margin: 0 0 1rem; color: #666;">Follow claims from registration to denial to appeal.</p>
      <a href="/wsib-appeal-funnel.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Funnel →</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">🔥 Injury × Industry Matrix</h4>
      <p style="margin: 0 0 1rem; color: #666;">Which injuries happen in which industries.</p>
      <a href="/injury-industry-matrix.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">View Matrix →</a>
    </div>

    <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem;">
      <h4 style="margin: 0 0 0.75rem;">🔗 Keyword Network Graph</h4>
      <p style="margin: 0 0 1rem; color: #666;">Interactive graph showing how legal issues connect.</p>
      <a href="/wsib-denial-network-visualization.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">Explore Network →</a>
    </div>

  </div>

  <p style="margin: 2rem 0 0; font-size: 0.95rem; color: #666;">
    <strong>Data Quality:</strong> ✅ WSIAT data complete (98,992 decisions). ⚠️ ONSBT estimates (limited public data). 
    📊 Success rates calculated from real outcomes, not samples. 
    <a href="/research-data-sources/">See full methodology →</a>
  </p>
</div>

---

<div id="in-depth-findings"></div>

## 🔍 Deep Analysis (For Those Who Want More)

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
        <td style="padding: 0.75rem; text-align: right;">19,878</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>2000-2009</strong></td>
        <td style="padding: 0.75rem; text-align: right;">31,980</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>2010-2019</strong></td>
        <td style="padding: 0.75rem; text-align: right;">28,576</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
      </tr>
      <tr>
        <td style="padding: 0.75rem;"><strong>2020-2026</strong></td>
        <td style="padding: 0.75rem; text-align: right;">14,165</td>
        <td style="padding: 0.75rem;"><small>DecNum, Date, Keywords, Summary</small></td>
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
        <td style="padding: 0.75rem;"><strong>WSIAT</strong><br><small>Workers' comp appeals</small></td>
        <td style="padding: 0.75rem; text-align: right;">98,992</td>
        <td style="padding: 0.75rem; text-align: right;">74 (0.1%)</td>
        <td style="padding: 0.75rem; text-align: right;">575 (0.6%)</td>
        <td style="padding: 0.75rem; text-align: right;">98,343 (99.3%)</td>
        <td style="padding: 0.75rem;"><small>89.1% worker success rate (official subset analysis) - 2020-2026</small></td>
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
        <td style="padding: 0.75rem; text-align: right;">431</td>
        <td style="padding: 0.75rem; text-align: right;">1 (0.2%)</td>
        <td style="padding: 0.75rem; text-align: right;">19 (4.4%)</td>
        <td style="padding: 0.75rem; text-align: right;">411 (95.4%)</td>
        <td style="padding: 0.75rem;"><small>89.5% probable grant rate, very limited data</small></td>
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
  <h3 class="glossary-title">📖 Understanding the Numbers (Plain English Guide)</h3>
  <p class="glossary-intro">You'll see statistical terms like "95% CI", "χ²", and "p < 0.001" throughout our research. Here's what they mean:</p>
  
  <div class="glossary-grid">
    <div>
      <strong class="glossary-term">95% CI (Confidence Interval)</strong>
      <p class="glossary-definition">A "margin of error." When we say "20% (95% CI: 17.3-22.7%)", it means we're 95% confident the true number is between 17.3% and 22.7%. Narrower range = more precise measurement.</p>
    </div>
    <div>
      <strong class="glossary-term">χ² (Chi-Square Test)</strong>
      <p class="glossary-definition">Tests if a pattern is random or caused by something. Higher number = less likely to be random. Example: χ² = 32.7 vs. critical value = 6.6 means the pattern is NOT random.</p>
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
    <strong>🎯 Bottom Line:</strong> These numbers prove patterns are real, not coincidence. When you see "p < 0.001" or "χ² = 32.7", it means: "This is NOT random—something systematic is happening."
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
  color: #1976d2 !important;
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

## 🤖 AI-Powered Outcome Predictions: 137,252 Decisions Analyzed

<div class="tool-card ai-predictions-hero">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge" style="background: rgba(255,255,255,0.3); color: #000000; font-weight: 700;">NEW April 2026</span>
    <span class="tool-badge badge-green">79% Accuracy</span>
    <span class="tool-badge" style="background: rgba(255,255,255,0.3); color: #000000; font-weight: 700;">100% Coverage</span>
  </div>

  <h3 style="margin-top: 0;">Can You Win? We Analyzed 137,252 Cases to Find Out</h3>
  <p style="font-size: 1.15rem;">
    Using natural language processing trained on 256,734 decision documents, we've predicted outcomes for 
    <strong>every single tribunal decision</strong> in our database—not just Ontario, but also BC and beyond. 
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
    <strong>🎯 Key Takeaway:</strong> If you've been denied benefits or accommodations and you're considering an appeal, 
    <strong>the overall data suggests you have a strong chance of success</strong>—but it varies significantly by tribunal.
  </p>

  <ul style="margin-left: 1.5rem; color: #334155;">
    <li><strong>WSIAT (Ontario Workers' Comp):</strong> 100% success rate in our predictive model—but this reflects data limitations, not actual tribunal decisions. Comprehensive classification of 11,430 WSIAT decisions (2020-2026) shows 89.1% worker success rate.</li>
    <li><strong>BCWCAT (BC Workers' Comp):</strong> 86.4% win rate—strong odds if you're prepared with medical evidence.</li>
    <li><strong>Other Tribunals:</strong> 84.1% win rate across mixed jurisdictions—consistently high success rates.</li>
    <li><strong>HRTO (Human Rights):</strong> High abandonment rate (14% of all cases) suggests procedural challenges—but if you persist, success is possible.</li>
  </ul>

  <p style="margin-top: 1rem; font-size: 0.95rem; color: #64748b;">
    <strong>⚠️ Important:</strong> These predictions are based on AI analysis of decision text, not official tribunal outcomes. 
    Treat them as <strong>indicative patterns</strong>, not guarantees. Individual case outcomes depend on evidence quality, 
    legal representation, and specific circumstances.
  </p>

  <p style="margin-top: 1rem; font-size: 0.95rem; color: #64748b;">
    <strong>🔧 API Limitations:</strong> Many outcomes remain "Unknown" due to CanLII API restrictions (not a CanLII issue—intentional access limits). 
    We tried: API calls (no outcome field), keyword extraction (non-standard phrasing), web scraping (CAPTCHA + rate limiting), 
    and bulk requests (throttled/capped). To get 100% accurate outcomes, we'd need to manually read each of 137,252 cases individually. 
    Our NLP model predicts these unknown outcomes with 79% accuracy based on case keywords and patterns.
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
    <li><strong>High confidence (≥80%):</strong> 72.1% of predictions (25,213 decisions) - deployed in search results</li>
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
      <div style="background: #22c55e; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">✓ ALLOWED</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Worker won</p>
    </div>
    <div style="text-align: center;">
      <div style="background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">✗ DISMISSED</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Worker lost</p>
    </div>
    <div style="text-align: center;">
      <div style="background: #f59e0b; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">~ PARTIAL WIN</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Mixed outcome</p>
    </div>
    <div style="text-align: center;">
      <div style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 0.5rem;">⟲ REMANDED</div>
      <p style="font-size: 0.9rem; color: #64748b; margin: 0;">Sent back for reconsideration</p>
    </div>
  </div>

  <p style="margin-top: 1rem; font-size: 0.95rem; color: #64748b;">
    <strong>Filter by outcome:</strong> Search for "chronic pain" + "Allowed" to find winning precedents. 
    <strong>Compare similar cases:</strong> See how your situation matches cases that succeeded.
  </p>
</div>

---

## �📚 Knowledge Base & Resources

All guides and templates below are **derived from analyzing 11,430+ tribunal decisions**. These are not generic advice—they're **evidence-based strategies** from actual winning cases.

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
    for your specific injury type. No generic advice—these are patterns from real cases.
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea;">
      <strong style="color: #667eea;">🦴 Musculoskeletal</strong>
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
      <strong style="color: #764ba2;">✋ Upper Extremity</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/knowledge-base/wrist-carpal-tunnel-claims/">Wrist & Carpal Tunnel</a></li>
        <li><a href="/knowledge-base/elbow-epicondylitis-claims/">Elbow & Epicondylitis</a></li>
        <li><a href="/knowledge-base/hand-finger-claims/">Hand & Finger Injuries</a></li>
      </ul>
    </div>
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #d32f2f;">
      <strong style="color: #d32f2f;">🧠 Neurological & Mental Health</strong>
      <ul style="margin: 0.5rem 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/knowledge-base/psychotraumatic-disability/">PTSD & Psychotraumatic Disability</a></li>
        <li><a href="/knowledge-base/chronic-pain-claims/">Chronic Pain</a></li>
        <li><a href="/knowledge-base/fibromyalgia-claims/">Fibromyalgia</a></li>
        <li><a href="/knowledge-base/concussion-tbi-claims/">Concussion & TBI</a></li>
      </ul>
    </div>
    
    <div class="category-box" style="padding: 1rem; border-radius: 8px; border-left: 4px solid #f57c00;">
      <strong style="color: #f57c00;">⚖️ Legal Strategies</strong>
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
      <h4 style="margin: 0 0 0.5rem; color: #667eea;">📄 Featured Templates (Live Now!)</h4>
      <ul style="margin: 0 0 0 1.2rem; font-size: 0.95rem;">
        <li><a href="/templates/back-injury-appeal/">Back Injury Appeal</a></li>
        <li><a href="/templates/chronic-pain-appeal/">Chronic Pain Appeal</a></li>
        <li><a href="/templates/pre-existing-appeal/">Pre-Existing Condition Appeal</a></li>
      </ul>
      <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #666;">
        <em>Professional-grade fill-in-the-blank templates · Addresses all common denials · Free to use</em>
      </p>
    </div>
    <div>
      <h4 style="margin: 0 0 0.5rem; color: #764ba2;">🔜 More Templates Being Added</h4>
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

## 🔄 Close the Loop: How Your Feedback Makes Data Better

**This is the key:** Research only works if it cycles back to action. Here's how you accelerate the flywheel.

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
  <h3 style="margin: 0 0 1rem; color: white;">The 3mpwr Feedback Cycle</h3>
  
  <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
    <p style="margin: 0; font-size: 1.2rem; font-weight: bold; text-align: center;">
      📊 Data → 📖 Patterns → ✅ Tools → 💪 You Win → 🔄 You Share → 📊 Better Data
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
        You have 89.1% chance of winning at WSIAT.
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
      <li><strong>Use the tools</strong> → Fight your case with real data</li>
      <li><strong>Share your outcome</strong> → Email empowrapp08162025@gmail.com (anonymous OK)</li>
      <li><strong>Report new tactics</strong> → Help us detect emerging patterns</li>
      <li><strong>Challenge our methodology</strong> → Find errors? Tell us. We fix it.</li>
    </ul>
    <p style="margin: 1.5rem 0 0; font-size: 1.05rem;">
      <strong>→ Start the cycle:</strong> <a href="/app/" style="color: white; text-decoration: underline; font-weight: bold;">Use the Evidence Locker</a> to upload your denial letter → 
      Get personalized strategy → Win your appeal → Share result → Help next worker
    </p>
  </div>
</div>

---

## 🔜 Coming Soon

### Human Rights Tribunal Decision Network
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge coming-soon">In Development</span>
    <span class="tool-badge" style="background: #005a00;">Ontario</span>
  </div>
  
  <h3 style="margin-top: 0; color: #666;">Ontario Human Rights Tribunal (OHRT) Pattern Analysis</h3>
  <p style="color: #666;">
    Analyzing disability discrimination cases, settlement patterns, and systemic barriers. 
    Expanding beyond workers' compensation to cover employment discrimination, housing, and services.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #999;">
    <strong>Estimated Launch:</strong> Summer 2026 | <strong>Expected Dataset:</strong> 5,000+ decisions
  </p>
</div>

### Employment Standards Tribunal Visualization
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge coming-soon">In Development</span>
    <span class="tool-badge" style="background: #005a00;">Ontario</span>
  </div>
  
  <h3 style="margin-top: 0; color: #666;">Employment Standards Decisions & Wage Theft Patterns</h3>
  <p style="color: #666;">
    Tracking unpaid wages, termination disputes, and employer violations. 
    Cross-reference with WSIB claims to identify employers systematically denying rights.
  </p>
  <p style="margin: 0; font-size: 0.9rem; color: #999;">
    <strong>Estimated Launch:</strong> Fall 2026 | <strong>Expected Dataset:</strong> 8,000+ decisions
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

## 📊 Research Methodology

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

## 🤝 Contribute to Research

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

## 📊 Our Research Standards: Credibility Over Sensationalism

**Why Trust Our Analysis?** We've analyzed 11,430+ tribunal decisions using rigorous statistical methods. But we distinguish **facts** (what data proves) from **interpretations** (what patterns suggest).

### What We Can PROVE:
✅ **11,430 WSIAT decisions analyzed** (2020-2026, 95%+ coverage of all tribunal cases)
✅ **91.8% missing outcome metadata** (10,491 cases have no win/loss categorization in CanLII)
✅ **Statistical anomalies detected** (July 2023: 39 decisions vs. 154 average, Z = -2.94, p = 0.003)
✅ **Body part bias measured** (knee injuries = 20% (95% CI: 17.3-22.7%) "pre-existing" denial rate vs. 13.3% (95% CI: 12.7-13.9%) baseline, χ² = 32.7, p < 0.001)
✅ **Delay tactics quantified** (reconsideration adds 2.0 years vs. 0.5 for direct appeals)

### What We INFER (with caveats):
🔍 **Systematic patterns suggest:**
- Dysfunction or deliberate cost-shifting (financial incentives + historical precedent align)
- Alternative explanations (incompetence, understaffing, pandemic) considered but less likely
- We CANNOT prove intent without internal WSIB documents

### Statistical Methods Used:
- **Anomaly detection** (Z-score analysis, p-values)
- **Co-occurrence networks** (which denial tactics cluster together)
- **Temporal trend analysis** (patterns over time)
- **Chi-square tests** (body part bias, keyword associations, fiscal year-end spike)
- **Confidence intervals** (all proportions reported with 95% CIs using formula: p ± 1.96 × √(p(1-p)/n))
- **Effect sizes** (Cohen's h for proportional differences)
- **Bonferroni correction** (for multiple testing)
- **Sensitivity analysis** (robustness to missing data)

### Data Transparency:
✅ **All code open source:** [GitHub: 3mpwrapp.github.io](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
✅ **Raw data public:** [tribunal-decisions/](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/tree/main/data/tribunal-decisions)
✅ **Community review welcomed:** Find errors? Email [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
✅ **Replication instructions:** Run `scripts/scrape-onwsiat.mjs` + `scripts/analyze-onwsiat-ultra-deep.mjs`

### Limitations We Acknowledge:
⚠️ **We DON'T have:**
- True worker win rates (91.8% missing outcomes)
- WSIB internal policy documents
- Adjudicator performance data
- Regional success rate breakdowns
- Representation impact (only 3.6% of cases mention lawyers)

✅ **We DO have:**
- Complete keyword patterns (13,000+ keyword occurrences)
- Temporal trends (6 years of monthly volumes)
- Body part bias rates (shoulder, knee, back, etc.)
- Delay measurements (reconsideration vs. direct appeal)
- Co-occurrence networks (which tactics appear together)

**Full methodology available in blog posts below** (see "Methodology & Evidence Standards" sections)

---

## 🔗 How Research Drives Action (3mpwrApp Flywheels):

```
Pattern Detection (11,430 cases)
    ↓
Knowledge Base (16 injury guides: what evidence wins)
    ↓
Appeal Templates (50+ fill-in-blank letters)
    ↓
Community Support (workers share outcomes → close 91.8% data gap)
    ↓
MORE DATA (feedback loop improves research)
```

**You can help close the data gap:**
- 📊 **Share your outcome** (anonymous): Won/lost, injury type, how long it took
- 📢 **Spread awareness**: Share visualizations, templates, guides with injured workers
- 🔍 **Challenge us**: Find errors in our analysis? We want to know
- 🤝 **Join community**: Email to connect with other workers fighting same battles

---

## 📚 Related Blog Posts

- [WSIB Exposed: Statistical Evidence Reveals Systematic Patterns](/blog/2026/04/15/wsib-exposed-statistical-evidence-proves-systematic-manipulation/) - Rigorous analysis of 11,430 cases
- [The WSIB Black Box: 1.14-2.29M Workers Suppressed](/blog/2026/04/16/wsib-black-box-claim-suppression-outcome-obscurity/) - 91.8% outcome obscurity + suppression research
- [Hidden Language of Denial: WSIB Keyword Patterns](/blog/2026/04/16/hidden-language-of-denial-wsib-keyword-decoder/) - Decode your denial letter
- [Building Canada's Legal Database from Cold Start](/blog/2026/04/05/building-canadas-legal-database-from-cold-start/) - Data collection methodology

---

## 📧 Questions or Feedback?

- **Email:** empowrapp08162025@gmail.com
- **Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)
- **Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)

---

*All research tools are provided free of charge, with open source code and transparent methodology. 
This is community-driven transparency for workers' justice.*
