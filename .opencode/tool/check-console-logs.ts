import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Find console.log usage (should use logger instead)",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      const result = execSync("grep -rn 'console\\.log\\|console\\.error\\|console\\.warn' src/ --include='*.ts' --include='*.tsx' 2>/dev/null || echo ''", {
        encoding: 'utf8'
      });
      return result || 'No console.log found';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
})
