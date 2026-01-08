import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Find files with TypeScript 'any' type usage",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      const result = execSync("grep -rn ': any' src/ --include='*.ts' --include='*.tsx' 2>/dev/null || echo ''", {
        encoding: 'utf8'
      });
      return result || 'No any types found';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
})
