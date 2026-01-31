import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Check if all localStorage keys are using STORAGE_KEYS constants",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      // Find localStorage calls with 5 lines before and after context
      const localStorageUsage = execSync(
        "grep -rn 'localStorage\\.(getItem|setItem|removeItem|clear)' src/ --include='*.ts' --include='*.tsx' -B 5 -A 5 2>/dev/null",
        { encoding: 'utf8' }
      );

      if (!localStorageUsage || localStorageUsage.trim() === '') {
        return 'No localStorage usage found';
      }

      // Split into blocks (one block per localStorage call)
      const blocks = localStorageUsage.split('\n--\n');
      
      // Filter out blocks that use STORAGE_KEYS in their context
      const problematicBlocks = blocks.filter(block => {
        const exclusionPatterns = [
          /STORAGE_KEYS\./,
          /const\s+\w+\s*=\s*STORAGE_KEYS\./,
          /\w+\s*=\s*STORAGE_KEYS\./,
          /\/\/.*fallback/i,
          /\/\/.*hardcoded/i,
          /\/\/.*TODO.*STORAGE_KEYS/i,
        ];

        if (exclusionPatterns.some(pattern => pattern.test(block))) {
          return false;
        }

        if (/\/\/[^\n]*localStorage\./.test(block) || /\/\*[\s\S]*?localStorage\./.test(block)) {
          return false;
        }

        return true;
      });

      if (problematicBlocks.length === 0) {
        return 'All localStorage keys use STORAGE_KEYS constants (or use appropriate fallback values)';
      }

      // Return only the first few problematic blocks
      return problematicBlocks.slice(0, 10).join('\n--\n');
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
})
