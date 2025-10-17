// Daily curator: enhanced with language filtering & JSON export.
const fs = require('fs');
const path = require('path');
const https = require('https');

const CFG_PATH = path.join(process.cwd(), '_data', 'curator.json');

function getCfg(){
  let cfg = { rssFeeds: [], mastodon: { enabled:false, instance:'mastodon.social', query:'' }, keywords:[], tags:[], maxItems:25, minScore:1, postDaily:true };
  if (fs.existsSync(CFG_PATH)) { try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync(CFG_PATH,'utf8')) }; } catch(_){} }
  return cfg;
}

function httpGet(url, timeoutMs=12000){
  return new Promise((resolve,reject)=>{
    const req = https.get(url, res=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>resolve({ status:res.statusCode, data }));
    });
    req.on('error',reject);
    req.setTimeout(timeoutMs,()=>req.destroy(new Error('timeout')));
  });
}

function parseRSS(xml){
  const items=[]; const re=/<item>([\s\S]*?)<\/item>/g; let m;
  while((m=re.exec(xml))){
    const chunk=m[1];
    const get=tag=>{ const r=new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`,'i'); const mm=r.exec(chunk); return mm? mm[1].replace(/<[^>]+>/g,'').trim():''; };
    items.push({ title:get('title'), link:get('link'), description:get('description'), pubDate:get('pubDate') });
  }
  return items;
}

function scoreItem(text, link, cfg){
  let s=0; const t=(text||'').toLowerCase(); const url=(link||'').toLowerCase();
  for (const k of cfg.keywords) if (t.includes(k.toLowerCase())) s+=1;
  for (const tag of cfg.tags) if (t.includes(tag.toLowerCase())) s+=0.5;
  const highPriority=['un crpd','uncrpd','convention on the rights of persons with disabilities','bill c-81','accessible canada act','wsib appeal','wcb appeal','benefits denied','discrimination','accessibility barrier','duty to accommodate','human rights complaint','injured worker','workplace injury','workers compensation'];
  for (const term of highPriority) if (t.includes(term)) s+=2;
  const canadian=['canada','canadian','ontario','quebec','bc','british columbia','alberta','manitoba','saskatchewan','nova scotia','new brunswick','newfoundland','pei','yukon','nwt','nunavut','toronto','vancouver','montreal','calgary','ottawa','edmonton','winnipeg'];
  if (canadian.some(w=>t.includes(w))) s+=1;
  const intl=['united nations','world health organization','who','ilo','international labour','disability rights','global accessibility'];
  if (intl.some(w=>t.includes(w))) s+=1.5;
  if (url.includes('.gc.ca')||url.includes('.canada.ca')) s+=2;
  if (url.includes('.gov.')||url.includes('.gouv.')) s+=1.5;
  if (url.includes('chrc-ccdp')||url.includes('ohrc')) s+=2;
  if (/wsib|worksafebc|wcb\.|cnesst|wscc|whscc/.test(url)) s+=1.5;
  if (url.includes('arch')||url.includes('ccdonline')||url.includes('disabilityalliancebc')||url.includes('aoda')||url.includes('inclusioncanada')) s+=1;
  if (url.includes('cbc.ca')||url.includes('thestar.com')||url.includes('globeandmail.com')||url.includes('nationalpost.com')) s+=0.5;
  if (/viagra|casino|lottery|crypto|forex|binary/.test(t)) s=0;
  if (/click here|buy now|limited time|act now/.test(t)) s*=0.5;
  return Math.round(s*10)/10;
}

function toISODate(d){ return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }

function detectLang(str){
  const s=(str||'').toLowerCase();
  const fr=(s.match(/\b(le|la|les|des|une|pour|avec|sur|est|et|dans|pas|que|qui|du|au|aux)\b/g)||[]).length;
  const en=(s.match(/\b(the|and|for|with|from|this|that|not|will|can|have|has|are|was|were)\b/g)||[]).length;
  if (fr>en*1.2 && fr>=3) return 'fr';
  if (en>=fr) return 'en';
  return 'und';
}

async function fetchMastodon(cfg){
  if (!cfg.mastodon || !cfg.mastodon.enabled) return [];
  const q=encodeURIComponent(cfg.mastodon.query || cfg.keywords.join(' '));
  const url=`https://${cfg.mastodon.instance}/api/v2/search?q=${q}&type=statuses&limit=40`;
  try {
    const resp=await httpGet(url);
    if (resp.status!==200) return [];
    const json=JSON.parse(resp.data);
    return (json.statuses||[]).map(s=>({
      title: s.account?.display_name || s.account?.acct || 'Mastodon post',
      link: s.url,
      description: (s.content||'').replace(/<[^>]+>/g,'').trim(),
      pubDate: s.created_at
    }));
  } catch(_) { return []; }
}

async function main(){
  const cfg=getCfg();
  if (process.env.MIN_SCORE){ const v=parseFloat(process.env.MIN_SCORE); if(!isNaN(v)) cfg.minScore=v; }
  const forceDaily=process.env.FORCE_DAILY==='1';
  const debug=process.env.DEBUG_CURATOR==='1';
  const writeJson=process.env.WRITE_JSON==='1';
  const filterLangs=(process.env.FILTER_LANGS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  if (debug){
    console.log('[curator] cfg.minScore', cfg.minScore);
    console.log('[curator] forceDaily', forceDaily);
    console.log('[curator] writeJson', writeJson);
    console.log('[curator] filterLangs', filterLangs);
  }
  const now=new Date();
  const todayISO=toISODate(now);
  const collected=[];
  let fetchOk=0, fetchFail=0;
  for (const feed of cfg.rssFeeds){
    try {
      const resp=await httpGet(feed);
      if (resp.status!==200) continue;
      const items=parseRSS(resp.data).slice(0,20);
      for (const it of items){
        const text=`${it.title} ${it.description}`;
        let score=scoreItem(text, it.link||feed, cfg);
        const pub=Date.parse(it.pubDate||'');
        if(!isNaN(pub) && (Date.now()-pub)<24*60*60*1000) score+=1;
        if(!isNaN(pub) && (Date.now()-pub)<6*60*60*1000) score+=0.5;
        collected.push({ ...it, source:feed, score });
      }
      fetchOk++;
    } catch(e){ fetchFail++; if(debug) console.warn('Feed error', feed, e.message); }
  }
  const masto=await fetchMastodon(cfg);
  for (const it of masto){
    const text=`${it.title} ${it.description}`;
    const score=scoreItem(text, it.link||'', cfg);
    collected.push({ ...it, source:`mastodon:${cfg.mastodon.instance}`, score });
  }
  const byLink=new Map();
  for (const it of collected){
    const key=(it.link||'').trim();
    if(!key) continue;
    const prev=byLink.get(key);
    if(!prev || it.score>prev.score) byLink.set(key,it);
  }
  const deduped=Array.from(byLink.values());
  const annotated=deduped.map(it=>({ ...it, lang: detectLang(`${it.title||''} ${it.description||''}`) }));
  const filtered=filterLangs.length? annotated.filter(i=>filterLangs.includes(i.lang)) : annotated;
  const domainCounts=Object.create(null);
  const capPerSource=Number(cfg.perSourceCap||4);
  const capped=[];
  for (const it of filtered.sort((a,b)=>b.score-a.score)){
    const m=(it.link||'').match(/^https?:\/\/([^\/]+)/i);
    const host=m? m[1].toLowerCase():'unknown';
    domainCounts[host]=(domainCounts[host]||0)+1;
    if(domainCounts[host]<=capPerSource) capped.push(it);
  }
  const mustIncludeHosts=Array.isArray(cfg.mustIncludeHosts)? cfg.mustIncludeHosts : ['accessible.canada.ca','www.canada.ca','chrc-ccdp.gc.ca','www.wsib.ca','www.worksafebc.com','www.wcb.ab.ca'];
  const ensured=new Map();
  for (const it of filtered){
    const m=(it.link||'').match(/^https?:\/\/([^\/]+)/i);
    const host=m? m[1].toLowerCase():'';
    if (mustIncludeHosts.includes(host) && !ensured.has(host)) ensured.set(host,it);
  }
  const ranked=capped.filter(i=>i.score>=cfg.minScore).sort((a,b)=>b.score-a.score);
  for (const it of ensured.values()) if (!ranked.find(r=>r.link===it.link)) ranked.unshift(it);
  ranked.splice(cfg.maxItems);
  if (debug){
    console.log('[curator] Ranked count', ranked.length);
    console.log('[curator] Sample', ranked.slice(0,5).map(r=>({score:r.score,lang:r.lang,title:r.title?.slice(0,40)})));
  }
  if (cfg.postDaily && (ranked.length>0 || forceDaily)){
    const postsDir=path.join(process.cwd(),'_posts');
    if(!fs.existsSync(postsDir)) fs.mkdirSync(postsDir,{recursive:true});
    const file=path.join(postsDir,`${todayISO}-daily-curation.md`);
    if(!fs.existsSync(file)){
      const out=['---','layout: post',`title: Daily Highlights (${todayISO})`,`date: ${todayISO} 09:00:00 +0000`,'tags: [community, highlights]','categories: [community]','---','', 'A quick round-up of community stories, mutual aid, and calls-to-action:',''];
      if (ranked.length===0) out.push('_(No items met the score threshold today; forced publication to maintain daily cadence.)_');
      else for (const it of ranked){ out.push(`- [${it.title||'Post'}](${it.link}) — ${it.description||''}`); }
      out.push('');
      fs.writeFileSync(file,out.join('\n'),'utf8');
      console.log('Wrote daily draft', file);
    } else console.log('Daily draft already exists, skipping');
  } else if (cfg.postDaily && ranked.length===0){
    console.log('Skipping daily post - no items met minimum score threshold (and not forced)');
  }
  if (ranked.length>0){
    const issuesDir=path.join(process.cwd(),'_curation');
    if(!fs.existsSync(issuesDir)) fs.mkdirSync(issuesDir,{recursive:true});
    const issueFile=path.join(issuesDir,`${todayISO}-curation.md`);
    const lines=[`# Daily Curation — ${todayISO}`,'','Top items (auto-scored):',''];
    ranked.forEach((it,idx)=>{ lines.push(`${idx+1}. [${it.title||'Post'}](${it.link})  `); lines.push(`   - Score: ${it.score}  `); lines.push(`   - Source: ${it.source}  `); lines.push(`   - Lang: ${it.lang||'und'}  `); if (it.description) lines.push(`   - ${it.description}`); });
    fs.writeFileSync(issueFile, lines.join('\n'),'utf8');
    console.log('Wrote curation summary', issueFile);
  } else if (debug){
    console.log('[curator] Suppressing empty _curation file');
  }
  if (writeJson){
    try {
      const outDir=path.join(process.cwd(),'public');
      if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
      const jsonFile=path.join(outDir,'curation-latest.json');
      const payload={ generated:new Date().toISOString(), minScore:cfg.minScore, forced:forceDaily, filterLangs, totalRanked:ranked.length, items: ranked.map(r=>({ title:r.title, link:r.link, description:r.description, score:r.score, source:r.source, lang:r.lang })) };
      fs.writeFileSync(jsonFile, JSON.stringify(payload,null,2),'utf8');
      if (debug) console.log('[curator] Wrote JSON file', jsonFile);
    } catch(e){ console.error('JSON output failed:', e.message); }
  }
  console.log(`Feeds success: ${fetchOk}, failed: ${fetchFail}, ranked: ${ranked.length}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
