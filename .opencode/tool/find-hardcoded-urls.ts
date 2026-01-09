import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Find hardcoded URLs in the codebase",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      const patterns = [
        { pattern: 'http[s]?://[^\\s"\'`<>]+', name: 'HTTP/HTTPS URLs' },
        { pattern: 'localhost:[0-9]+', name: 'Localhost URLs' },
        { pattern: '127\\.0\\.0\\.1:[0-9]+', name: 'Local IP URLs' },
        { pattern: '/api/[a-zA-Z0-9_/-]+', name: 'API endpoints' }
      ];
      
      let results: string[] = [];
      
      for (const { pattern, name } of patterns) {
        const cmd = `grep -rn '${pattern}' src/ --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' 2>/dev/null | grep -v 'STORAGE_KEYS\\|VITE_API_BASE_URL\\|API_BASE_URL' || echo ''`;
        const output = execSync(cmd, { encoding: 'utf8' }).trim();
        
        if (output && output !== '') {
          results.push(`\n## ${name}\n${output}`);
        }
      }
      
      if (results.length === 0) {
        return 'No hardcoded URLs found!';
      }
      
      const suggestions = `\n\n## Recommendations:\n- Move URLs to src/constants.ts or environment variables\n- Use VITE_API_BASE_URL for API base URL\n- Use STORAGE_KEYS for storage-related constants\n- Avoid hardcoded API endpoints, use apiService.ts`;
      
      return `Found hardcoded URLs:\n${results.join('')}${suggestions}`;
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
})
