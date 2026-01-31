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
        // Check if STORAGE_KEYS appears in the block
        const hasStorageKeys = /STORAGE_KEYS\./.test(block);
        
        // Check for variable assignments from STORAGE_KEYS (e.g., const key = STORAGE_KEYS.MY_KEY)
        const hasVariableFromStorageKeys = /const\s+\w+\s*=\s*STORAGE_KEYS\./.test(block);
        const hasVariableAssignment = /\w+\s*=\s*STORAGE_KEYS\./.test(block);

        // Check for legitimate fallback values or intentionally documented cases
        const hasFallbackComment = /\/\/.*fallback/i.test(block);
        const hasHardcodedComment = /\/\/.*hardcoded/i.test(block);
        const hasTodoStorageKeys = /\/\/.*TODO.*STORAGE_KEYS/i.test(block);

        // If any of these patterns exist, this localStorage usage is OK
        if (hasStorageKeys || hasVariableFromStorageKeys || hasVariableAssignment ||
            hasFallbackComment || hasHardcodedComment || hasTodoStorageKeys) {
          return false; // This localStorage usage is OK, exclude it
        }

        // Check if it's just a comment
        const isComment = /^\s*\/\/.*/.test(block) || /^[^:]*:[0-9]*:\s*\/\/.*/.test(block);

        if (isComment) {
          return false; // Exclude comments
        }

        return true; // This localStorage usage might be problematic, keep it
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
