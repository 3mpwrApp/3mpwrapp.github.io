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

// Decode HTML entities and numeric character references
function decodeHtmlEntities(text){
  if(!text) return '';
  const entities={'&nbsp;':' ','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&amp;':'&','&#039;':"'",'&#8217;':"'",'&#038;':'&','&#8211;':'–','&#8212;':'—','&mdash;':'—','&ndash;':'–'};
  let result=text;
  for(const [ent,ch] of Object.entries(entities)){ result=result.replace(new RegExp(ent,'g'),ch); }
  result=result.replace(/&#(\d+);/g,(_,code)=>String.fromCharCode(code));
  result=result.replace(/&#x([A-Fa-f0-9]+);/g,(_,code)=>String.fromCharCode(parseInt(code,16)));
  return result;
}

function parseRSS(xml){
  const items=[]; 
  
  // Try RSS <item> format first
  const rssRe=/<item[^>]*>([\s\S]*?)<\/item>/gi; 
  let m;
  while((m=rssRe.exec(xml))){
    const chunk=m[1];
    const getField=tag=>{
      // First try CDATA sections
      const cdataRe=new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[(.*?)\\]\\]>\\s*</${tag}>`,'i');
      let match=cdataRe.exec(chunk);
      if(match) return decodeHtmlEntities(match[1].trim());
      // Then try regular tags
      const tagRe=new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`,'i');
      match=tagRe.exec(chunk);
      if(match){
        let content=match[1];
        if(['description','summary','content','content:encoded'].includes(tag.toLowerCase())){
          content=content.replace(/<[^>]+>/g,'').trim();
        }
        return decodeHtmlEntities(content.trim());
      }
      return '';
    };
    const title=getField('title');
    const link=getField('link')||getField('guid');
    const description=getField('description')||getField('content:encoded')||getField('summary');
    const pubDate=getField('pubDate')||getField('updated');
    // Only add items with valid title or link
    if(title||link){
      items.push({title,link,description,pubDate});
    }
  }
  
  // If no items found, try Atom <entry> format
  if(items.length===0){
    const atomRe=/<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while((m=atomRe.exec(xml))){
      const chunk=m[1];
      const getField=tag=>{
        const cdataRe=new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[(.*?)\\]\\]>\\s*</${tag}>`,'i');
        let match=cdataRe.exec(chunk);
        if(match) return decodeHtmlEntities(match[1].trim());
        const tagRe=new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`,'i');
        match=tagRe.exec(chunk);
        if(match){
          let content=match[1];
          if(['summary','content'].includes(tag.toLowerCase())){
            content=content.replace(/<[^>]+>/g,'').trim();
          }
          return decodeHtmlEntities(content.trim());
        }
        return '';
      };
      const linkMatch=chunk.match(/<link[^>]*href=["']([^"']+)["']/i);
      const link=linkMatch?linkMatch[1]:'';
      const title=getField('title');
      const description=getField('summary')||getField('content');
      const pubDate=getField('updated');
      if(title||link){
        items.push({title,link,description,pubDate});
      }
    }
  }
  
  return items;
}

function scoreItem(text, link, cfg){
  let s=0; 
  const t=(text||'').toLowerCase(); 
  const url=(link||'').toLowerCase();
  
  // Use scoring configuration from curator.json if available
  if (cfg.scoringKeywords) {
    // HIGH PRIORITY KEYWORDS
    if (cfg.scoringKeywords.high_priority) {
      for (const term of cfg.scoringKeywords.high_priority.terms) {
        if (t.includes(term.toLowerCase())) {
          s += cfg.scoringKeywords.high_priority.score;
        }
      }
    }
    
    // MEDIUM PRIORITY KEYWORDS
    if (cfg.scoringKeywords.medium_priority) {
      for (const term of cfg.scoringKeywords.medium_priority.terms) {
        if (t.includes(term.toLowerCase())) {
          s += cfg.scoringKeywords.medium_priority.score;
        }
      }
    }
    
    // CRITICAL TERMS (HIGHEST)
    if (cfg.scoringKeywords.critical) {
      for (const term of cfg.scoringKeywords.critical.terms) {
        if (t.includes(term.toLowerCase())) {
          s += cfg.scoringKeywords.critical.score;
        }
      }
    }
    
    // PROVINCIAL PROGRAMS
    if (cfg.provincialPrograms) {
      for (const term of cfg.provincialPrograms.terms) {
        if (t.includes(term.toLowerCase())) {
          s += cfg.provincialPrograms.score;
        }
      }
    }
  }
  
  // Fallback traditional scoring if no config
  if (s === 0) {
    // Keywords scoring
    for (const k of cfg.keywords || []) {
      if (typeof k === 'string' && !k.startsWith('//')) {
        if (t.includes(k.toLowerCase())) s+=1;
      }
    }
    for (const tag of cfg.tags || []) if (t.includes(tag.toLowerCase())) s+=0.5;
    
    // HIGHEST PRIORITY - Breaking news and critical updates
    const criticalTerms=['breaking','urgent','emergency','crisis','lawsuit','court ruling','federal court','supreme court','charter challenge','benefits cut','program cancelled','funding cut','accessibility violation','discrimination ruling'];
    for (const term of criticalTerms) if (t.includes(term)) s+=3;
    
    // HIGH PRIORITY - Federal and provincial program updates
    const highPriority=[
      'un crpd','uncrpd','convention on the rights of persons with disabilities',
      'bill c-81','accessible canada act','canada disability benefit',
      'wsib appeal','wcb appeal','benefits denied','claim denied','appeal denied',
      'discrimination','accessibility barrier','duty to accommodate',
      'human rights complaint','injured worker','workplace injury','workers compensation',
      'odsp','aish','pwd benefits','disability benefits increase','benefits expansion',
      'new program','program launch','service expansion','funding announced',
      'policy change','regulation change','legislation passed','law passed'
    ];
    for (const term of highPriority) if (t.includes(term)) s+=2.5;
  }
  
  // SOURCE PRIORITY (always apply)
  // FEDERAL GOVERNMENT SOURCES - Premium scoring
  if (url.includes('.gc.ca')||url.includes('.canada.ca')) s+=2.5;
  if (url.includes('accessible.canada.ca')) s+=3;
  if (url.includes('chrc-ccdp')||url.includes('statcan.gc.ca')) s+=2.5;
  if (url.includes('veterans.gc.ca')||url.includes('servicecanada.gc.ca')) s+=2;
  
  // PROVINCIAL GOVERNMENT SOURCES - High priority
  if (url.includes('.gov.')||url.includes('.gouv.')||url.includes('ontario.ca')||url.includes('gov.bc.ca')||url.includes('alberta.ca')||url.includes('gov.mb.ca')||url.includes('saskatchewan.gov.sk.ca')||url.includes('quebec.ca')||url.includes('novascotia.ca')||url.includes('gnb.ca')||url.includes('gov.nl.ca')||url.includes('princeedwardisland.ca')) s+=2;
  
  // WORKERS' COMPENSATION BOARDS - Critical for injured workers
  if (/wsib|worksafebc|wcb\.|cnesst|wscc|whscc|workplacenl/.test(url)) s+=2.5;
  
  // HUMAN RIGHTS COMMISSIONS - Essential for discrimination cases
  if (url.includes('ohrc')||url.includes('chrc')||url.includes('human-rights')) s+=2.5;
  
  // DISABILITY ORGANIZATIONS - Community voice priority
  if (url.includes('arch')||url.includes('ccdonline')||url.includes('disabilityalliancebc')||url.includes('aoda')||url.includes('inclusioncanada')||url.includes('cacl')||url.includes('cnib')) s+=1.5;
  
  // NEWS SOURCES - Credible media coverage
  if (url.includes('cbc.ca')||url.includes('thestar.com')||url.includes('globeandmail.com')||url.includes('nationalpost.com')||url.includes('ctvnews.ca')||url.includes('globalnews.ca')) s+=1;
  
  // SPAM FILTER
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

function detectContentType(text, link) {
  const t = (text || '').toLowerCase();
  const url = (link || '').toLowerCase();
  
  // BREAKING NEWS - Highest priority
  if (t.includes('breaking') || t.includes('urgent') || t.includes('emergency') || 
      t.includes('alert') || t.includes('just in') || t.includes('developing')) {
    return 'BREAKING_NEWS';
  }
  
  // NEWS ARTICLES - Current events and reports
  if (url.includes('cbc.ca/news') || url.includes('thestar.com') || url.includes('globeandmail.com') || 
      url.includes('nationalpost.com') || url.includes('ctv') || url.includes('globalnews.ca') ||
      url.includes('/news/') || t.includes('news:') || t.includes('reports:') ||
      t.includes('announces') || t.includes('launches') || t.includes('reveals')) {
    return 'NEWS_ARTICLE';
  }
  
  // GOVERNMENT ANNOUNCEMENTS - Policy and program updates
  if ((url.includes('.gc.ca') || url.includes('.canada.ca') || url.includes('.gov.') || url.includes('.gouv.') ||
       url.includes('ontario.ca') || url.includes('gov.bc.ca') || url.includes('alberta.ca')) &&
      (t.includes('announces') || t.includes('launches') || t.includes('introduces') ||
       t.includes('expands') || t.includes('new program') || t.includes('funding') ||
       t.includes('budget') || t.includes('investment'))) {
    return 'GOVERNMENT_ANNOUNCEMENT';
  }
  
  // RESEARCH & STUDIES - Data and evidence
  if (url.includes('statcan.gc.ca') || url.includes('pub/') || url.includes('research') ||
      url.includes('study') || url.includes('survey') || url.includes('report') ||
      t.includes('study shows') || t.includes('research finds') || t.includes('data reveals') ||
      t.includes('survey results') || t.includes('statistics') || t.includes('findings') ||
      t.includes('analysis reveals') || t.includes('report shows')) {
    return 'RESEARCH_REPORT';
  }
  
  // LEGAL RESOURCES - Court decisions, legislation, legal guidance
  if (url.includes('laws') || url.includes('legislation') || url.includes('act') || url.includes('bill') ||
      url.includes('court') || url.includes('tribunal') || url.includes('legal') ||
      t.includes('court rules') || t.includes('court decision') || t.includes('ruling') || 
      t.includes('lawsuit') || t.includes('legal action') || t.includes('complaint') || 
      t.includes('appeal') || t.includes('tribunal decision') || t.includes('legislation') ||
      t.includes('law passed') || t.includes('bill passed') || t.includes('charter challenge')) {
    return 'LEGAL_RESOURCE';
  }
  
  // WORKERS' COMPENSATION UPDATES - Critical for injured workers
  if (url.includes('wsib') || url.includes('wcb') || url.includes('worksafe') || url.includes('cnesst') ||
      url.includes('wscc') || url.includes('whscc') || url.includes('workplacenl') ||
      t.includes('workers compensation') || t.includes('workplace injury') || 
      t.includes('return to work') || t.includes('wcb') || t.includes('wsib') ||
      t.includes('compensation board') || t.includes('workplace safety')) {
    return 'WORKERS_COMP_UPDATE';
  }
  
  // DISABILITY BENEFITS UPDATES - Provincial and federal programs
  if (t.includes('odsp') || t.includes('aish') || t.includes('pwd benefits') || 
      t.includes('disability benefits') || t.includes('cpp disability') || 
      t.includes('disability support') || t.includes('benefits increase') ||
      t.includes('benefits expansion') || t.includes('said') || t.includes('eia') ||
      t.includes('income assistance') || t.includes('social assistance') ||
      t.includes('disability tax credit') || t.includes('rdsp')) {
    return 'BENEFITS_UPDATE';
  }
  
  // SUPPORT RESOURCES - Programs and services
  if (t.includes('support') || t.includes('help') || t.includes('assistance') || 
      t.includes('service') || t.includes('program available') || t.includes('resource') ||
      t.includes('how to apply') || t.includes('eligibility') || t.includes('application') ||
      t.includes('support available') || t.includes('services offered')) {
    return 'SUPPORT_RESOURCE';
  }
  
  // POLICY RESOURCES - Government policies and guidelines
  if ((url.includes('.gc.ca') || url.includes('.canada.ca') || url.includes('.gov.') ||
       url.includes('accessible.canada.ca')) &&
      (t.includes('policy') || t.includes('guidelines') || t.includes('standards') ||
       t.includes('framework') || t.includes('compliance') || t.includes('requirements') ||
       t.includes('regulations') || t.includes('directive'))) {
    return 'POLICY_RESOURCE';
  }
  
  // ACCESSIBILITY UPDATES - Barrier removal and accessibility improvements
  if (t.includes('accessible') || t.includes('accessibility') || t.includes('barrier-free') ||
      t.includes('accommodation') || t.includes('inclusive') || t.includes('universal design') ||
      t.includes('aoda') || t.includes('accessible canada act') || t.includes('wcag') ||
      url.includes('accessible.canada.ca') || url.includes('aoda.ca')) {
    return 'ACCESSIBILITY_UPDATE';
  }
  
  // ADVOCACY ORGANIZATIONS - Community voice and advocacy
  if (url.includes('ccdonline') || url.includes('inclusioncanada') || url.includes('advocacy') ||
      url.includes('cacl') || url.includes('cnib') || url.includes('arch') ||
      t.includes('advocacy') || t.includes('organization') || t.includes('coalition') || 
      t.includes('alliance') || t.includes('council') || t.includes('association') ||
      t.includes('community group') || t.includes('rights group')) {
    return 'ADVOCACY_ORG';
  }
  
  // HEALTHCARE UPDATES - Medical and rehabilitation services
  if (t.includes('healthcare') || t.includes('medical') || t.includes('health services') ||
      t.includes('rehabilitation') || t.includes('therapy') || t.includes('treatment') ||
      t.includes('mental health') || t.includes('addiction services') || 
      t.includes('home care') || t.includes('community health')) {
    return 'HEALTHCARE_UPDATE';
  }
  
  // EMPLOYMENT RESOURCES - Job support and training
  if (t.includes('employment') || t.includes('job') || t.includes('work') || 
      t.includes('training') || t.includes('career') || t.includes('workplace') ||
      t.includes('supported employment') || t.includes('job coaching') ||
      t.includes('employment services') || t.includes('vocational')) {
    return 'EMPLOYMENT_RESOURCE';
  }
  
  // FEATURE ARTICLES - In-depth analysis and opinion
  if (t.includes('opinion:') || t.includes('editorial:') || t.includes('analysis:') ||
      t.includes('feature:') || t.includes('why ') || t.includes('how to') ||
      t.includes('guide to') || t.includes('understanding') || t.includes('explained') ||
      t.includes('in-depth') || t.includes('special report')) {
    return 'FEATURE_ARTICLE';
  }
  
  return 'GENERAL_CONTENT';
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
  // CRITICAL FIX: Only force publish if explicitly requested AND there is content
  const forcePublish=process.env.FORCE_PUBLISH==='1';
  const debug=process.env.DEBUG_CURATOR==='1';
  const writeJson=process.env.WRITE_JSON==='1';
  const filterLangs=(process.env.FILTER_LANGS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  if (debug){
    console.log('[curator] cfg.minScore', cfg.minScore);
    console.log('[curator] forcePublish', forcePublish);
    console.log('[curator] writeJson', writeJson);
    console.log('[curator] filterLangs', filterLangs);
  }
  const now=new Date();
  const todayISO=toISODate(now);
  const collected=[];
  let fetchOk=0, fetchFail=0, itemsFound=0;
  for (const feed of cfg.rssFeeds){
    try {
      const resp=await httpGet(feed);
      if (resp.status!==200) { if(debug) console.warn('Feed error', feed, `status ${resp.status}`); fetchFail++; continue; }
      const items=parseRSS(resp.data).slice(0,20);
      if (debug && items.length > 0) {
        console.log(`[curator] Feed: ${feed.slice(0,50)} → ${items.length} items`);
        if (items[0].title) console.log(`  [sample] "${items[0].title?.slice(0,50)}..."`);
      }
      itemsFound += items.length;
      for (const it of items){
        const text=`${it.title} ${it.description}`;
        let score=scoreItem(text, it.link||feed, cfg);
        const pub=Date.parse(it.pubDate||'');
        if(!isNaN(pub) && (Date.now()-pub)<24*60*60*1000) score+=1;
        if(!isNaN(pub) && (Date.now()-pub)<6*60*60*1000) score+=0.5;
        collected.push({ ...it, source:feed, score });
        if (debug && score > 0) console.log(`[curator] Item "${it.title?.slice(0, 40)}..." → Score: ${score}`);
      }
      fetchOk++;
    } catch(e){ fetchFail++; if(debug) console.warn('Feed error', feed.slice(0,50), e.message); }
  }
  const masto=await fetchMastodon(cfg);
  for (const it of masto){
    const text=`${it.title} ${it.description}`;
    const score=scoreItem(text, it.link||'', cfg);
    collected.push({ ...it, source:`mastodon:${cfg.mastodon.instance}`, score });
  }
  const byLink=new Map();
  let noLinkItems=[];
  for (const it of collected){
    const key=(it.link||'').trim();
    if(!key) { 
      // Keep items without links, but limit to 5
      if (noLinkItems.length < 5) noLinkItems.push(it);
      continue;
    }
    const prev=byLink.get(key);
    if(!prev || it.score>prev.score) byLink.set(key,it);
  }
  const deduped=Array.from(byLink.values()).concat(noLinkItems);
  if (debug) console.log(`[curator] After dedup: ${deduped.length} unique items (${byLink.size} with links, ${noLinkItems.length} without)`);
  const annotated=deduped.map(it=>({ 
    ...it, 
    lang: detectLang(`${it.title||''} ${it.description||''}`),
    contentType: detectContentType(`${it.title||''} ${it.description||''}`, it.link)
  }));
  if (debug) console.log(`[curator] filterLangs: ${filterLangs.length > 0 ? filterLangs.join(',') : 'all'}`);
  const filtered=filterLangs.length? annotated.filter(i=>filterLangs.includes(i.lang)) : annotated;
  if (debug) console.log(`[curator] After language filter: ${filtered.length} items`);
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
  
  // CRITICAL FIX: Only create posts when there IS content
  // Do NOT force publish empty content
  const shouldPublish = ranked.length > 0 || (forcePublish && ranked.length > 0);
  
  if (cfg.postDaily && shouldPublish){
    const postsDir=path.join(process.cwd(),'_posts');
    if(!fs.existsSync(postsDir)) fs.mkdirSync(postsDir,{recursive:true});
    const file=path.join(postsDir,`${todayISO}-daily-curation.md`);
    if(!fs.existsSync(file)){
      const out=['---','layout: post',`title: "Daily News Highlights - ${todayISO}"`,`date: ${todayISO} 09:00:00 +0000`,'tags: [highlights]','categories: [curation, news]',`excerpt: "Today's curated disability rights, accessibility, and social policy news from across Canada."`,'---','',`# Daily News Highlights - ${todayISO}`,'',`Curated ${ranked.length} items from disability, accessibility, and social policy sources across Canada.`,''];
      
      // Add top stories with better formatting
      ranked.forEach((it,idx)=>{
        out.push(`## ${idx+1}. ${it.title||'Story'}`);
        if(it.description) out.push(it.description);
        out.push(`📍 [Read Full Story](${it.link})`);
        out.push(`**Score:** ${it.score} | **Type:** ${it.contentType||'News'}`);
        out.push('');
      });
      
      out.push('---');
      out.push('');
      out.push('📰 **Stay Informed**: [Subscribe to updates](https://3mpwrapp.pages.dev/newsletter/)');
      out.push('');
      out.push('🌐 **Explore More**: [Visit 3mpwrApp Blog](https://3mpwrapp.pages.dev/blog/)');
      out.push('');
      fs.writeFileSync(file,out.join('\n'),'utf8');
      console.log('Wrote daily draft', file);
    } else console.log('Daily draft already exists, skipping');
  } else if (cfg.postDaily && ranked.length===0){
    console.log('[curator] ✓ Skipping daily post - no items met minimum score threshold');
  }
  if (ranked.length>0){
    const issuesDir=path.join(process.cwd(),'_curation');
    if(!fs.existsSync(issuesDir)) fs.mkdirSync(issuesDir,{recursive:true});
    const issueFile=path.join(issuesDir,`${todayISO}-curation.md`);
    const lines=[`# Daily Curation — ${todayISO}`,'','Top items (auto-scored):',''];
    ranked.forEach((it,idx)=>{ lines.push(`${idx+1}. [${it.title||'Post'}](${it.link})  `); lines.push(`   - Score: ${it.score}  `); lines.push(`   - Source: ${it.source}  `); lines.push(`   - Lang: ${it.lang||'und'}  `); lines.push(`   - Type: ${it.contentType||'GENERAL_CONTENT'}  `); if (it.description) lines.push(`   - ${it.description}`); });
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
      const payload={ generated:new Date().toISOString(), minScore:cfg.minScore, forced:forcePublish, filterLangs, totalRanked:ranked.length, items: ranked.map(r=>({ title:r.title, link:r.link, description:r.description, score:r.score, source:r.source, lang:r.lang, contentType:r.contentType })) };
      fs.writeFileSync(jsonFile, JSON.stringify(payload,null,2),'utf8');
      if (debug) console.log('[curator] Wrote JSON file', jsonFile);
    } catch(e){ console.error('JSON output failed:', e.message); }
  }
  console.log(`Feeds success: ${fetchOk}, failed: ${fetchFail}, ranked: ${ranked.length}, total items found: ${itemsFound}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
