#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class EnvironmentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async setupEnvironment() {
    console.log('🚀 MA Malnu Kananga Environment Setup');
    console.log('=====================================\n');

    // Check if .env exists
    const envPath = path.join(process.cwd(), '.env');
    const envExists = fs.existsSync(envPath);

    if (envExists) {
      console.log('⚠️ .env file already exists');
      const overwrite = await this.question('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        this.rl.close();
        return;
      }
    }

    // Get required values
    const apiKey = await this.question('Enter your Google Gemini API Key: ');
    const nodeEnv = await this.question('Enter NODE_ENV (development/production): ', 'development');

    // Validate inputs
    if (!apiKey.startsWith('AIzaSy')) {
      console.log('⚠️ API Key does not appear to be valid Gemini API key');
      const continueAnyway = await this.question('Continue anyway? (y/N): ');
      if (continueAnyway.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        this.rl.close();
        return;
      }
    }

    // Create .env file
    const envContent = `# Google Gemini AI Configuration
API_KEY=${apiKey}

# Application Configuration
NODE_ENV=${nodeEnv}
VITE_APP_ENV=${nodeEnv}

# Development Configuration
VITE_DEV_MODE=true
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_CHAT=true

# Worker Configuration (uncomment if using local worker)
# VITE_WORKER_URL=http://localhost:8787
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');

    // Validate setup
    console.log('\n🔍 Validating setup...');
    const { spawn } = require('child_process');
    const validate = spawn('npm', ['run', 'env:validate'], { 
      stdio: 'inherit',
      shell: true 
    });

    validate.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Environment setup completed successfully!');
        console.log('You can now run: npm run dev');
      } else {
        console.log('\n❌ Environment setup validation failed');
        console.log('Please check the errors above and fix them manually');
      }
      this.rl.close();
    });
  }

  question(query, defaultValue = '') {
    return new Promise((resolve) => {
      this.rl.question(query, (answer) => {
        resolve(answer || defaultValue);
      });
    });
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.setupEnvironment();
}

module.exports = EnvironmentSetup;