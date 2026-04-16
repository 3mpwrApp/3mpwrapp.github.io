---
layout: default
title: Research & Data Tools - 3mpwrApp
description: Interactive data visualizations and research tools analyzing tribunal decisions, denial patterns, and workers' rights across Canada. Open source, transparent methodology.
permalink: /research/
---

<style>
  .research-hero {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    margin-bottom: 3rem;
  }
  .tool-card {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    transition: all 0.3s;
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
    color: white;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .tool-badge.coming-soon {
    background: #999;
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
  }
  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
</style>

<div class="research-hero">
  <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: white;">🔬 Research & Data Tools</h1>
  <p style="font-size: 1.3rem; max-width: 800px; margin: 0 auto; opacity: 0.95;">
    Interactive visualizations analyzing tens of thousands of tribunal decisions across Canada. 
    Open source methodology. Complete transparency. Community-driven insights.
  </p>
  
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-number">11,430+</div>
      <div>WSIAT Decisions Analyzed</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">300+</div>
      <div>Keyword Patterns</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">6 Years</div>
      <div>Data Coverage (2020-2026)</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">100%</div>
      <div>Open Source</div>
    </div>
  </div>
</div>

## 🚀 Live Tools

### WSIB Denial Network Visualization
<div class="tool-card">
  <div style="margin-bottom: 1rem;">
    <span class="tool-badge">Live</span>
    <span class="tool-badge" style="background: #5a189a;">Interactive</span>
    <span class="tool-badge" style="background: #005a00;">Ontario</span>
  </div>
  
  <h3 style="margin-top: 0; font-size: 1.8rem;">Interactive Network Graph: WSIB Denial Tactics</h3>
  
  <p style="font-size: 1.1rem; color: #555;">
    Explore 11,430+ tribunal decisions from Ontario's WSIAT (2020-2026). Interactive D3.js network visualization 
    revealing systematic denial patterns, keyword co-occurrence, and the hidden language WSIB uses to reject injured workers.
  </p>
  
  <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
    <strong>Features:</strong>
    <ul style="margin: 0.5rem 0 0 1.5rem;">
      <li>Interactive force-directed graph with 300+ keywords</li>
      <li>Co-occurrence analysis (which denial tactics appear together)</li>
      <li>Filtering by keyword frequency and connection strength</li>
      <li>Case citation links for every keyword pattern</li>
      <li>Export-ready visualizations</li>
    </ul>
  </div>
  
  <div style="margin-top: 1.5rem;">
    <a href="/wsib-denial-network-visualization.html" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: 700; transition: all 0.3s;" onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">
      <span>🚀 Launch Visualization</span>
      <span aria-hidden="true">→</span>
    </a>
    
    <a href="/blog/2026/04/15/wsib-exposed-statistical-evidence-proves-systematic-manipulation/" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 1.5rem; background: transparent; color: #667eea; border: 2px solid #667eea; border-radius: 8px; text-decoration: none; font-weight: 600; margin-left: 1rem; transition: all 0.3s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">
      <span>📖 Read Research Blog</span>
    </a>
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
    <span class="tool-badge" style="background: #d32f2f;">National</span>
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

## 📖 Related Blog Posts

- [WSIB Exposed: Statistical Evidence Proves Systematic Manipulation](/blog/2026/04/15/wsib-exposed-statistical-evidence-proves-systematic-manipulation/) - Full investigative report (8 smoking guns)
- [The WSIB Black Box: How 2 Million Workers Disappeared](/blog/2026/05/01/wsib-black-box-claim-suppression-outcome-obscurity/) - 91.8% outcome obscurity crisis
- [The Hidden Language of Denial: WSIB Keyword Decoder](/blog/2026/04/22/hidden-language-of-denial-wsib-keyword-decoder/) - Decode your denial letter
- [Building Canada's Legal Database from Cold Start](/blog/2026/04/05/building-canadas-legal-database-from-cold-start/) - How we collected 14,000+ decisions

---

## 📧 Questions or Feedback?

- **Email:** empowrapp08162025@gmail.com
- **Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)
- **Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)

---

*All research tools are provided free of charge, with open source code and transparent methodology. 
This is community-driven transparency for workers' justice.*
