import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Generate deployment checklist for production",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    
    try {
      const checklist: string[] = [];
      
      checklist.push('# Production Deployment Checklist');
      checklist.push('');
      checklist.push('## Pre-Deployment');
      checklist.push('- [ ] Run full test suite: `npm run test:run`');
      checklist.push('- [ ] Run type checking: `npm run typecheck`');
      checklist.push('- [ ] Run linting: `npm run lint:fix`');
      checklist.push('- [ ] Check for any TypeScript errors');
      checklist.push('- [ ] Run security scan: `npm run security:scan`');
      checklist.push('- [ ] Build production bundle: `npm run build`');
      checklist.push('- [ ] Check build output size');
      checklist.push('- [ ] Verify no build warnings');
      checklist.push('- [ ] Update version in package.json');
      checklist.push('- [ ] Update CHANGELOG.md');
      checklist.push('');
      
      checklist.push('## Environment Configuration');
      checklist.push('- [ ] Verify VITE_API_BASE_URL is set for production');
      checklist.push('- [ ] Check all required environment variables');
      checklist.push('- [ ] Verify API keys are configured');
      checklist.push('- [ ] Verify Cloudflare Workers secrets');
      checklist.push('- [ ] Test with production environment variables');
      checklist.push('');
      
      checklist.push('## Backend Deployment');
      checklist.push('- [ ] Deploy to Cloudflare Workers: `wrangler deploy --env production`');
      checklist.push('- [ ] Verify worker starts successfully');
      checklist.push('- [ ] Test API endpoints');
      checklist.push('- [ ] Check database migrations');
      checklist.push('- [ ] Verify D1 database bindings');
      checklist.push('- [ ] Test authentication flows');
      checklist.push('- [ ] Verify R2 storage configuration');
      checklist.push('');
      
      checklist.push('## Frontend Deployment');
      checklist.push('- [ ] Build production bundle: `npm run build`');
      checklist.push('- [ ] Deploy to Cloudflare Pages: `wrangler pages deploy dist --project-name=malnu-kananga`');
      checklist.push('- [ ] Verify PWA service worker');
      checklist.push('- [ ] Test offline functionality');
      checklist.push('- [ ] Check push notifications');
      checklist.push('- [ ] Test on multiple browsers');
      checklist.push('- [ ] Verify mobile responsiveness');
      checklist.push('- [ ] Test voice features (if applicable)');
      checklist.push('- [ ] Test AI features (if applicable)');
      checklist.push('');
      
      checklist.push('## Post-Deployment');
      checklist.push('- [ ] Verify all features work');
      checklist.push('- [ ] Check console for errors');
      checklist.push('- [ ] Test authentication flow');
      checklist.push('- [ ] Test API connectivity');
      checklist.push('- [ ] Verify data persistence');
      checklist.push('- [ ] Test notifications');
      checklist.push('- [ ] Check SEO meta tags');
      checklist.push('- [ ] Test performance (Lighthouse)');
      checklist.push('- [ ] Monitor error logs');
      checklist.push('- [ ] Test with real users');
      checklist.push('');
      
      try {
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
        
        checklist.push('## Git Status');
        checklist.push(`- Current branch: ${branch}`);
        checklist.push(`- Uncommitted changes: ${status ? 'Yes ⚠️' : 'No ✅'}`);
        checklist.push(`- Recommendation: ${status ? 'Commit changes before deploying' : 'Good to deploy'}`);
        checklist.push('');
      } catch (_e) {
        checklist.push('## Git Status');
        checklist.push('- Unable to check git status');
        checklist.push('');
      }
      
      checklist.push('## Rollback Plan');
      checklist.push('- [ ] Keep previous deployment version');
      checklist.push('- [ ] Document rollback steps');
      checklist.push('- [ ] Test rollback procedure');
      checklist.push('- [ ] Have database backup ready');
      checklist.push('');
      
      checklist.push('## Monitoring');
      checklist.push('- [ ] Set up error tracking');
      checklist.push('- [ ] Monitor performance metrics');
      checklist.push('- [ ] Check API response times');
      checklist.push('- [ ] Monitor user errors');
      checklist.push('- [ ] Set up alerts for critical failures');
      
      return checklist.join('\n');
    } catch (error) {
      return `Error generating checklist: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
})
