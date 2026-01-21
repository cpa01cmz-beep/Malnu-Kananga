/**
 * AI Service Health Check
 * Validates that environment configuration allows AI functionality
 */

import { EXTERNAL_URLS } from '../constants';

export async function checkAIServiceHealth(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check API key configuration
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    issues.push('VITE_GEMINI_API_KEY is not configured');
    recommendations.push('Set VITE_GEMINI_API_KEY in .env file');
  } else if (typeof apiKey === 'string' && (apiKey.includes('your_actual') || apiKey.includes('placeholder'))) {
    issues.push('VITE_GEMINI_API_KEY contains placeholder value');
    recommendations.push(`Replace placeholder with actual Gemini API key from ${EXTERNAL_URLS.MAKER_SUITE_API}`);
  }

  // Check worker configuration
  const workerUrl = import.meta.env.VITE_API_BASE_URL;
  if (!workerUrl || (typeof workerUrl === 'string' && workerUrl.includes('your-worker-subdomain'))) {
    issues.push('Worker URL not configured');
    recommendations.push('Set VITE_API_BASE_URL to your Cloudflare Worker URL');
  }

  // Check feature flags
  if (import.meta.env.VITE_ENABLE_AI_CHAT !== 'true') {
    issues.push('AI chat is disabled');
    recommendations.push('Set VITE_ENABLE_AI_CHAT=true in .env');
  }

  // Determine overall status
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  if (issues.some(issue => typeof issue === 'string' && (issue.includes('not configured') || issue.includes('placeholder')))) {
    status = 'error';
  } else if (issues.length > 0) {
    status = 'warning';
  }

  return {
    status,
    issues,
    recommendations
  };
}

/**
 * Quick API key validation (client-side only)
 */
export function validateAPIKeyFormat(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return typeof apiKey === 'string' &&
         !apiKey.includes('your_actual') &&
         !apiKey.includes('placeholder') &&
         apiKey.length > 20;
}

/**
 * Get setup instructions based on current configuration
 */
export async function getSetupInstructions(): Promise<string> {
  const health = await checkAIServiceHealth();

  if (health.status === 'healthy') {
    return '✅ AI service is properly configured!';
  }

  let instructions = '🔧 Setup Required:\n\n';

  health.recommendations.forEach((rec, index) => {
    instructions += `${index + 1}. ${rec}\n`;
  });

  instructions += '\n📖 For detailed setup, run: ./setup-env.sh';

  return instructions;
}