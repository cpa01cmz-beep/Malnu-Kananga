import { createServer, Server } from 'http';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

async function startStaticServer(): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let filePath = join('dist', req.url === '/' ? 'index.html' : req.url || 'index.html');
        filePath = filePath.split('?')[0];
        
        if (!filePath.includes('.')) {
          filePath = join('dist', 'index.html');
        }
        
        const content = await readFile(filePath);
        const ext = filePath.split('.').pop() || '';
        const contentTypes: Record<string, string> = {
          'html': 'text/html',
          'js': 'application/javascript',
          'css': 'text/css',
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'svg': 'image/svg+xml',
          'ico': 'image/x-icon',
          'webmanifest': 'application/manifest+json',
        };
        
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        try {
          const content = await readFile(join('dist', 'index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        } catch {
          res.writeHead(404);
          res.end('Not found');
        }
      }
    });
    
    server.listen(3456, () => {
      console.log('Static server started on http://localhost:3456');
      resolve(server);
    });
  });
}

async function main() {
  console.log('🌟 BroCula: Starting Lighthouse audit...\n');
  
  const server = await startStaticServer();
  
  try {
    console.log('Running Lighthouse audit on http://localhost:3456...\n');
    
    const output = execSync(
      'lighthouse http://localhost:3456 --chrome-flags="--headless --no-sandbox --disable-gpu" --preset=desktop --output=json --output-path=./lighthouse-report.json 2>&1',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    console.log(output);
    
    // Read and parse the report
    const reportData = await readFile('./lighthouse-report.json', 'utf-8');
    const report = JSON.parse(reportData);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 LIGHTHOUSE AUDIT RESULTS');
    console.log('='.repeat(70));
    
    // Scores
    const categories = report.categories as Record<string, { title: string; score: number | null }>;
    console.log('\n🎯 SCORES:');
    for (const [, category] of Object.entries(categories)) {
      const score = category.score;
      const scoreNum = score !== null ? Math.round(score * 100) : 0;
      const icon = scoreNum >= 90 ? '✅' : scoreNum >= 50 ? '⚠️' : '❌';
      console.log(`  ${icon} ${category.title}: ${scoreNum}`);
    }
    
    // Audits
    console.log('\n🔍 KEY METRICS:');
    const audits = report.audits;
    const keyMetrics = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'total-blocking-time',
      'cumulative-layout-shift',
      'speed-index',
      'interactive',
    ];
    
    for (const metric of keyMetrics) {
      if (audits[metric]) {
        const audit = audits[metric];
        const score = audit.score;
        const icon = score === 1 ? '✅' : score === 0 ? '❌' : '⚠️';
        console.log(`  ${icon} ${audit.title}: ${audit.displayValue || audit.numericValue}`);
      }
    }
    
    // Opportunities
    console.log('\n⚡ OPPORTUNITIES FOR IMPROVEMENT:');
    const opportunities = Object.values(audits).filter((audit: unknown) => {
      const a = audit as { details?: { type: string }; numericValue?: number };
      return a.details?.type === 'opportunity' && a.numericValue && a.numericValue > 0;
    }) as Array<{ title: string; displayValue?: string; numericValue: number }>;
    
    if (opportunities.length === 0) {
      console.log('  ✅ No significant opportunities found!');
    } else {
      // Sort by impact (numericValue)
      opportunities.sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0));
      
      for (const opp of opportunities.slice(0, 10)) {
        const savings = opp.displayValue || `${Math.round(opp.numericValue)}ms`;
        console.log(`  ⚠️  ${opp.title}: Save ${savings}`);
      }
    }
    
    // Diagnostics
    console.log('\n🔧 DIAGNOSTICS:');
    const diagnostics = Object.values(audits).filter((audit: unknown) => {
      const a = audit as { score: number | null; details?: { type: string } };
      return a.score !== null && a.score < 1 && a.details?.type === 'table';
    }) as Array<{ title: string; description: string }>;
    
    if (diagnostics.length === 0) {
      console.log('  ✅ All diagnostics passing!');
    } else {
      for (const diag of diagnostics.slice(0, 5)) {
        console.log(`  ⚠️  ${diag.title}`);
      }
    }
    
    // Passed audits
    console.log('\n✅ PASSED AUDITS:');
    const passed = Object.values(audits).filter((audit: unknown) => {
      const a = audit as { score: number | null };
      return a.score === 1;
    });
    console.log(`  ${passed.length} audits passed`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🧛 BroCula: Lighthouse audit complete!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('Error running Lighthouse:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
