import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Find async functions without proper error handling",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      // Find async functions and get 30 lines of context
      // Then filter out functions that have error handling patterns in their context
      const asyncFunctions = execSync(
        "grep -rn 'async function\\|const.*= async\\|async (\\|class.*{' src/ --include='*.ts' --include='*.tsx' -A 30 2>/dev/null",
        { encoding: 'utf8' }
      );

      if (!asyncFunctions || asyncFunctions.trim() === '') {
        return 'No async functions found';
      }

      // Split into blocks (one block per async function)
      const blocks = asyncFunctions.split('\n--\n');
      
      // Filter out blocks that have error handling
      const problematicBlocks = blocks.filter(block => {
        const errorHandlingPatterns = [
          /try\s*\{/,
          /catch\s*\(/,
          /\bthrow\s+/,
          /\.catch\s*\(/,
          /\.catchError\s*\(/,
          /withCircuitBreaker\s*\(/,
          /retryWithBackoff\s*\(/,
          /\bretry\s*\(/,
          /\bCircuitBreaker\b/,
          /(error|err|onError)\s*:/,
          /\/\/.*no error handling|\/\/ NO ERROR HANDLING|\/\/.*errors handled by/i,
          /expected.*error/i,
        ];

        if (errorHandlingPatterns.some(pattern => pattern.test(block))) {
          return false;
        }

        return true;
      });

      if (problematicBlocks.length === 0) {
        return 'All async functions have error handling (or errors are properly delegated)';
      }

      // Return only the first few problematic blocks
      return problematicBlocks.slice(0, 15).join('\n--\n');
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
})
