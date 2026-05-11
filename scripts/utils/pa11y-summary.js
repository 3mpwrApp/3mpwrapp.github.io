// Summarize pa11y-ci JSON output and write to GitHub Step Summary or a file
const fs = require('fs');

function summarize(inputPath = 'pa11y-report.json') {
  let out = '';
  try {
    const txt = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(txt);
    if (Array.isArray(data)) {
      let total = 0;
      out += '# Pa11y Summary\n\n';
      for (const r of data) {
        const url = r.url || '';
        const issues = (r.issues || []).filter(i => i.type === 'error');
        total += issues.length;
        if (issues.length) {
          out += `## ${url} — ${issues.length} error(s)\n`;
          for (const i of issues.slice(0, 10)) {
            const sel = (i.selector || '').toString().trim().replace(/\n/g, ' ');
            out += `- [${i.code}] ${i.message} (selector: \`${sel}\`)\n`;
          }
          if (issues.length > 10) {
            out += `- …and ${issues.length - 10} more on this page\n`;
          }
          out += '\n';
        }
      }
      out += `\nTotal errors: ${total}\n`;
    } else {
      out = 'No pa11y JSON array found.';
    }
    // Always write a local file for later steps
    fs.writeFileSync('pa11y-summary.md', out);
    // Also write to the GitHub Step Summary when available
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY, out);
    }
  } catch (e) {
    const fallback = 'Pa11y report not available.';
    fs.writeFileSync('pa11y-summary.md', fallback);
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY, fallback);
    }
  }
}

if (require.main === module) {
  summarize();
}

module.exports = { summarize };
