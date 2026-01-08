import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Check if all localStorage keys are using STORAGE_KEYS constants",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      const result = execSync("grep -rn 'localStorage\\.' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v 'STORAGE_KEYS' || echo ''", {
        encoding: 'utf8'
      });
      return result || 'All localStorage keys use STORAGE_KEYS constants';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
})
