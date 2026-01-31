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
        // Check for error handling patterns
        const hasTry = /try\s*\{/.test(block);
        const hasCatch = /catch\s*\(/.test(block);
        const hasThrow = /\bthrow\s+/.test(block);
        const hasCatchMethod = /\.catch\s*\(/.test(block);
        const hasCircuitBreaker = /withCircuitBreaker\s*\(/.test(block);
        const hasRetryWithBackoff = /retryWithBackoff\s*\(/.test(block);
        const hasRetry = /\bretry\s*\(/.test(block);
        const hasCircuitBreakerClass = /\bCircuitBreaker\b/.test(block);
        const hasErrorHandlingComment = /\/\/.*no error handling|\/\/ NO ERROR HANDLING|\/\/.*errors handled by/i.test(block);
        const hasExpectedError = /expected.*error/i.test(block);

        // If any error handling pattern exists, this function is OK
        if (hasTry || hasCatch || hasThrow || hasCatchMethod || 
            hasCircuitBreaker || hasRetryWithBackoff || hasRetry || 
            hasCircuitBreakerClass || hasErrorHandlingComment || hasExpectedError) {
          return false; // This function has error handling, exclude it
        }

        return true; // This function has no error handling, keep it
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
