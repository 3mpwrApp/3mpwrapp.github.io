#!/usr/bin/env node
/**
 * WCAG Compliance Audit (runtime JS version)
 * Features:
 *  - Palette contrast (light/dark) vs background
 *  - Inline hex literal scan (light & dark assumed backgrounds)
 *  - Configurable thresholds (--aa, --aaa)
 *  - JSON output (--json / --json=path)
 *  - Suggestions for failing tokens / inline colors (lightness adjustment heuristic)
 */
const fs = require('fs');
const path = require('path');

const COLORS_PATH = path.join(process.cwd(), 'constants', 'Colors.ts');

function parseColors() {
  if (!fs.existsSync(COLORS_PATH)) return null;
  const src = fs.readFileSync(COLORS_PATH, 'utf8');
  const theme = { light: {}, dark: {} };
  let current = null;
  for (const line of src.split(/\r?\n/)) {
    const h = line.trim();
    if (h.startsWith('light:')) { current = 'light'; continue; }
    if (h.startsWith('dark:')) { current = 'dark'; continue; }
    if (current) {
      const m = h.match(/^(\w+):\s*"(#[0-9a-fA-F]{3,8})"/);
      if (m) theme[current][m[1]] = m[2];
      if (h.startsWith('},')) current = null;
    }
  }
  return theme;
}

function hexToRgb(hex) {
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c=> c+c).join('');
  if (h.length === 8) h = h.slice(0,6);
  const num = parseInt(h, 16);
  return { r:(num>>16)&0xFF, g:(num>>8)&0xFF, b:num&0xFF };
}

function relLuminance({r,g,b}) {
  const f = c=> { const chan = c/255; return chan <= 0.03928 ? chan/12.92 : Math.pow((chan+0.055)/1.055, 2.4); };
  const R=f(r), G=f(g), B=f(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

function contrastRatio(fg, bg) {
  const L1 = relLuminance(hexToRgb(fg));
  const L2 = relLuminance(hexToRgb(bg));
  const hi = Math.max(L1, L2); const lo = Math.min(L1, L2);
  return (hi + 0.05)/(lo + 0.05);
}

function tweakTowardsContrast(hex, bg, target, maxIters=24) {
  try {
    let { r, g, b } = hexToRgb(hex);
    const toHsl=(r,g,b)=>{ r/=255; g/=255; b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); let h=0,s=0,l=(max+min)/2; const d=max-min; if(d){ s=l>0.5? d/(2-max-min): d/(max+min); switch(max){case r:h=((g-b)/d+(g<b?6:0));break;case g:h=((b-r)/d+2);break;case b:h=((r-g)/d+4);break;} h/=6;} return {h,s,l};};
    const fromHsl=(h,s,l)=>{ const f=n=>{ const k=(n+h*6)%6; const a=s*Math.min(l,1-l); const c=l - a*Math.max(-1,Math.min(k-3,Math.min(9-k,1))); return c; }; const R=Math.round(f(0)*255), G=Math.round(f(8/6)*255), B=Math.round(f(4/6)*255); return {r:R,g:G,b:B}; };
    let { h,s,l } = toHsl(r,g,b);
    const bgLum = relLuminance(hexToRgb(bg));
    const originalIsDarker = relLuminance({r,g,b}) < bgLum;
    for (let i=0;i<maxIters;i++) {
      const step=(i+1)/maxIters*0.4;
      const newL = originalIsDarker? Math.max(0,l-step):Math.min(1,l+step);
      const rgb = fromHsl(h,s,newL);
      const candidate = `#${[rgb.r,rgb.g,rgb.b].map(v=> v.toString(16).padStart(2,'0')).join('')}`;
      if (contrastRatio(candidate, bg) >= target) return candidate;
    }
  } catch {}
  return undefined;
}

function auditTheme(theme, name, aa, aaa) {
  const bg = theme.background || '#FFFFFF';
  return Object.entries(theme).filter(([k])=> k !== 'background').map(([k, hex]) => {
    const ratio = contrastRatio(hex, bg);
    const relaxAA = (k.toLowerCase().includes('tint') || k.toLowerCase().includes('accent')) ? 3 : aa;
    const passesAA = ratio >= relaxAA; const passesAAA = ratio >= aaa;
    return { pair: `${name}.${k} on background`, token: k, theme: name, ratio, passesAA, passesAAA, fg: hex, bg, suggestion: passesAA? undefined : tweakTowardsContrast(hex,bg,relaxAA) };
  });
}

const SCAN_DIRS = ['app','components'];
const HEX_RE = /#[0-9a-fA-F]{3,8}/g;

function walk(dir) {
  const out=[]; if(!fs.existsSync(dir)) return out; const stack=[dir];
  while(stack.length){ const cur=stack.pop(); let entries=[]; try{ entries=fs.readdirSync(cur,{withFileTypes:true}); }catch{ continue; }
    for(const entry of entries){ const p=path.join(cur, entry.name); if(entry.isDirectory()) stack.push(p); else if(/\.(tsx|ts|jsx|js)$/.test(entry.name)) out.push(p); }
  }
  return out;
}

function scanInlineColors(bgLight, bgDark, aa){
  const issues=[];
  for(const base of SCAN_DIRS){ const dir=path.join(process.cwd(), base); for(const file of walk(dir)){ let src=''; try { src=fs.readFileSync(file,'utf8'); } catch { continue; }
      const lines=src.split(/\r?\n/);
      lines.forEach((l,idx)=>{ const matches=l.match(HEX_RE); if(!matches) return; matches.forEach(hex=>{ if(hex.length<=4) return; try { const rL=contrastRatio(hex,bgLight); if(rL<aa) issues.push({ file:path.relative(process.cwd(),file), line:idx+1, color:hex, ratio:rL, context:'light', suggested:tweakTowardsContrast(hex,bgLight,aa)}); const rD=contrastRatio(hex,bgDark); if(rD<aa) issues.push({ file:path.relative(process.cwd(),file), line:idx+1, color:hex, ratio:rD, context:'dark', suggested:tweakTowardsContrast(hex,bgDark,aa)}); } catch{} }); }); }}
  return issues;
}

function parseArgs(){
  const args=process.argv.slice(2); const opts={ aa:4.5, aaa:7 };
  args.forEach(a=>{ if(a.startsWith('--aa=')) opts.aa=parseFloat(a.split('=')[1]);
    else if(a.startsWith('--aaa=')) opts.aaa=parseFloat(a.split('=')[1]);
    else if(a==='--json') opts.json=true;
    else if(a.startsWith('--json=')) opts.json=a.split('=')[1];
    else if(a.startsWith('--inline-bg=')) opts.inlineBg=a.split('=')[1];
    else if(a.startsWith('--inline-bg-dark=')) opts.inlineBgDark=a.split('=')[1]; });
  return opts;
}

function main(){
  const opts=parseArgs();
  const colors=parseColors();
  const results=[];
  if(colors){ results.push(...auditTheme(colors.light,'light',opts.aa,opts.aaa)); results.push(...auditTheme(colors.dark,'dark',opts.aa,opts.aaa)); }
  const failing=results.filter(r=> !r.passesAA);
  const inlineIssues=scanInlineColors(
    opts.inlineBg || (colors && colors.light.background) || '#FFFFFF',
    opts.inlineBgDark || (colors && colors.dark.background) || '#000000',
    opts.aa
  );

  if(!opts.json){
    console.log('WCAG Color Contrast Audit');
    console.log('==========================');
    console.log(`Thresholds: AA=${opts.aa} AAA=${opts.aaa}`);
    console.log('\nPalette Contrast Ratios:');
    results.forEach(r=>{ const sugg=r.suggestion?` (suggestion: ${r.suggestion})`:''; console.log(`${r.pair}: ${r.ratio.toFixed(2)}  AA:${r.passesAA?'✓':'✗'} AAA:${r.passesAAA?'✓':'✗'}${sugg}`); });
    if(!results.length) console.log('No theme colors parsed.');
    if(failing.length) console.log(`\nFAIL: ${failing.length} palette pair(s) below AA threshold (${opts.aa}:1).`); else console.log('\nAll palette pairs meet AA (heuristic rules).');
    console.log(`\nInline Hex Color Issues (<${opts.aa}:1 contrast against light/dark backgrounds):`);
    if(!inlineIssues.length) console.log('None detected');
    inlineIssues.forEach(i=>{ const sugg=i.suggested?` -> suggestion ${i.suggested}`:''; console.log(`  [${i.context}] ${i.file}:${i.line}  ${i.color} ratio=${i.ratio.toFixed(2)}${sugg}`); });
  }

  if(opts.json){ const payload={ thresholds:{ aa:opts.aa, aaa:opts.aaa }, palette:results, paletteFailing:failing, inlineIssues}; const jsonStr=JSON.stringify(payload,null,2); if(typeof opts.json==='string'){ fs.writeFileSync(opts.json,jsonStr,'utf8'); } else { console.log(jsonStr); } }

  if(failing.length) process.exitCode=1;
}

main();
