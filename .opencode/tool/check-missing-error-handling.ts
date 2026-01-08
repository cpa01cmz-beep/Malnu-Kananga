import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Find async functions without proper error handling",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      const result = execSync("grep -rn 'async function\\|const.*= async' src/ --include='*.ts' --include='*.tsx' -A 10 2>/dev/null | grep -v 'try\\|catch\\|throw' | head -30 || echo ''", {
        encoding: 'utf8'
      });
      return result || 'All async functions have error handling';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
})
