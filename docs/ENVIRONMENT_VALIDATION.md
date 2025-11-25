# 🔍 Environment Validation Guide - MA Malnu Kananga

## 🌟 Overview

Comprehensive guide for validating and troubleshooting environment configuration for MA Malnu Kananga portal system. This guide ensures all required environment variables, dependencies, and system requirements are properly configured.

**Environment Validation Version: 1.3.1**  
**Last Updated: November 25, 2025**  
**Status: Production Ready**

---

## 📋 Environment Validation Checklist

### ✅ Required Environment Variables

#### Development Environment (.env)
```bash
# Required: Google Gemini AI API
API_KEY=AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxx  # Your Google Gemini API key

# Application Configuration
NODE_ENV=development
VITE_APP_ENV=development

# Optional Development Overrides
VITE_DEV_MODE=true
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_CHAT=true
VITE_WORKER_URL=http://localhost:8787  # Local worker URL
```

#### Production Environment (Cloudflare Workers Secrets)
```bash
# Required Secrets (set via wrangler secret put)
API_KEY=your_gemini_api_key_here          # Google Gemini API key
SECRET_KEY=your_jwt_secret_key_here       # HMAC secret for JWT (32+ chars)

# Application Configuration
NODE_ENV=production
VITE_APP_ENV=production

# Optional Production Variables
VITE_WORKER_URL=https://your-worker.workers.dev
```

### 🔧 Environment Validation Script

Create `scripts/validate-env.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.requiredVars = {
      development: ['API_KEY'],
      production: ['API_KEY', 'SECRET_KEY']
    };
  }

  validateEnvironment(env = process.env.NODE_ENV || 'development') {
    console.log(`🔍 Validating ${env} environment...\n`);

    // Check .env file exists
    this.validateEnvFile();
    
    // Check required variables
    this.validateRequiredVariables(env);
    
    // Check API key format
    this.validateAPIKey();
    
    // Check Node.js version
    this.validateNodeVersion();
    
    // Check dependencies
    this.validateDependencies();
    
    // Display results
    this.displayResults();
    
    return this.errors.length === 0;
  }

  validateEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      this.errors.push('❌ .env file not found');
      return;
    }
    
    console.log('✅ .env file found');
    
    // Check .env.example exists
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      console.log('✅ .env.example file found');
    } else {
      this.warnings.push('⚠️ .env.example file not found');
    }
  }

  validateRequiredVariables(env) {
    const required = this.requiredVars[env] || this.requiredVars.development;
    
    required.forEach(varName => {
      const value = process.env[varName];
      
      if (!value) {
        this.errors.push(`❌ Required variable ${varName} is not set`);
      } else {
        console.log(`✅ ${varName} is set`);
        
        // Additional validation for specific variables
        if (varName === 'SECRET_KEY' && value.length < 32) {
          this.errors.push(`❌ SECRET_KEY must be at least 32 characters (current: ${value.length})`);
        }
      }
    });
  }

  validateAPIKey() {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) return;
    
    // Check Gemini API key format
    if (!apiKey.startsWith('AIzaSy')) {
      this.errors.push('❌ API_KEY does not appear to be a valid Google Gemini API key');
    } else {
      console.log('✅ API_KEY format appears valid');
    }
  }

  validateNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      this.errors.push(`❌ Node.js version ${nodeVersion} is too old. Required: v18+`);
    } else {
      console.log(`✅ Node.js version ${nodeVersion} is supported`);
    }
  }

  validateDependencies() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.errors.push('❌ package.json not found');
      return;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const dependencies = packageJson.dependencies || {};
      
      // Check critical dependencies
      const criticalDeps = ['react', 'react-dom', 'vite'];
      criticalDeps.forEach(dep => {
        if (dependencies[dep]) {
          console.log(`✅ ${dep} dependency found`);
        } else {
          this.errors.push(`❌ Critical dependency ${dep} not found`);
        }
      });
      
    } catch (error) {
      this.errors.push('❌ Error reading package.json: ' + error.message);
    }
  }

  displayResults() {
    console.log('\n📊 Validation Results:');
    console.log('========================');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All validations passed!');
    } else {
      if (this.errors.length > 0) {
        console.log('\n❌ Errors:');
        this.errors.forEach(error => console.log(`  ${error}`));
      }
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️ Warnings:');
        this.warnings.forEach(warning => console.log(`  ${warning}`));
      }
    }
    
    console.log('\n📋 Summary:');
    console.log(`  Errors: ${this.errors.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Status: ${this.errors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new EnvironmentValidator();
  const success = validator.validateEnvironment();
  process.exit(success ? 0 : 1);
}

module.exports = EnvironmentValidator;
```

### 🚀 Enhanced npm Scripts

Update `package.json` scripts:

```json
{
  "scripts": {
    "env:validate": "node scripts/validate-env.js",
    "env:check": "node -e \"console.log('Environment Variables:'); console.log('NODE_ENV:', process.env.NODE_ENV || 'not set'); console.log('API_KEY:', process.env.API_KEY ? 'set' : 'not set'); console.log('SECRET_KEY:', process.env.SECRET_KEY ? 'set' : 'not set');\"",
    "env:setup": "node scripts/setup-env.js",
    "env:test": "NODE_ENV=test npm run env:validate",
    "env:prod": "NODE_ENV=production npm run env:validate"
  }
}
```

---

## 🔧 Environment Setup Script

Create `scripts/setup-env.js`:

```javascript
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
```

---

## 📋 Environment Variables Reference

### Required Variables

#### 🔑 API Configuration
```bash
# Google Gemini AI API Key (REQUIRED)
API_KEY=AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxx
# Description: API key untuk Google Gemini AI
# Source: https://makersuite.google.com/app/apikey
# Required for: AI chat functionality, content generation
# Validation: Test dengan curl ke Gemini API endpoint

# JWT Secret Key (AUTO-GENERATED if not set)
SECRET_KEY=your_jwt_secret_key_here
# Description: Secret key untuk JWT token signing
# Source: Auto-generated atau custom string
# Required for: Authentication token security
# Validation: Minimum 32 characters recommended
```

#### 🌐 Application Configuration
```bash
# Environment Mode
NODE_ENV=development|production
# Description: Mode aplikasi (development/production)
# Default: development
# Required for: Error handling, logging, optimization

# Vite Environment
VITE_APP_ENV=development|production
# Description: Frontend environment mode
# Default: development
# Required for: Build configuration, API endpoints

# Worker URL Override (Optional)
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
# Description: Override URL untuk Cloudflare Worker
# Default: Auto-detected from deployment
# Required for: Production API communication
```

### Optional Variables

#### 🚀 Development Features
```bash
# Development Mode
VITE_DEV_MODE=true|false
# Description: Enable development-specific features
# Default: true in development
# Required for: Debug logging, hot reload

# PWA Features
VITE_ENABLE_PWA=true|false
# Description: Enable Progressive Web App features
# Default: true
# Required for: App installation, offline support

# AI Chat Features
VITE_ENABLE_AI_CHAT=true|false
# Description: Enable AI chat functionality
# Default: true
# Required for: AI assistant, RAG system

# Analytics Tracking
VITE_ENABLE_ANALYTICS=true|false
# Description: Enable analytics and tracking
# Default: false
# Required for: User behavior tracking, performance metrics
```

#### 🔧 Advanced Configuration
```bash
# API Timeout
VITE_API_TIMEOUT=10000
# Description: API request timeout in milliseconds
# Default: 10000 (10 seconds)
# Required for: Network error handling

# Retry Attempts
VITE_RETRY_ATTEMPTS=3
# Description: Number of API retry attempts
# Default: 3
# Required for: Network reliability

# Debug Mode
VITE_DEBUG=true|false
# Description: Enable debug logging
# Default: false in production
# Required for: Troubleshooting, development
```

---

## ✅ Validation Scripts

### Automated Validation Script

Create file `validate-env.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Environment validation
const validateEnvironment = () => {
  console.log('🔍 Validating Environment Configuration...\n');

  // Check .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('💡 Copy .env.example to .env and configure your variables');
    process.exit(1);
  }

  // Load environment variables
  require('dotenv').config();

  const requiredVars = [
    {
      name: 'API_KEY',
      description: 'Google Gemini AI API Key',
      validate: async (value) => {
        if (!value || value.length < 20) return false;
        return await testGeminiAPI(value);
      }
    }
  ];

  const optionalVars = [
    { name: 'NODE_ENV', default: 'development' },
    { name: 'VITE_APP_ENV', default: 'development' },
    { name: 'VITE_DEV_MODE', default: 'true' },
    { name: 'VITE_ENABLE_PWA', default: 'true' },
    { name: 'VITE_ENABLE_AI_CHAT', default: 'true' }
  ];

  let allValid = true;

  // Validate required variables
  console.log('📋 Required Variables:');
  for (const variable of requiredVars) {
    const value = process.env[variable.name];
    console.log(`   ${variable.name}: ${value ? '✅ Set' : '❌ Missing'}`);
    
    if (value) {
      try {
        const isValid = await variable.validate(value);
        console.log(`   ${variable.name}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (!isValid) allValid = false;
      } catch (error) {
        console.log(`   ${variable.name}: ⚠️  Validation failed: ${error.message}`);
        allValid = false;
      }
    } else {
      allValid = false;
    }
    console.log(`   └─ ${variable.description}\n`);
  }

  // Check optional variables
  console.log('📝 Optional Variables:');
  for (const variable of optionalVars) {
    const value = process.env[variable.name] || variable.default;
    console.log(`   ${variable.name}: ${value} ${value === variable.default ? '(default)' : '(custom)'}`);
  }
  console.log('');

  return allValid;
};

// Test Gemini API connectivity
const testGeminiAPI = (apiKey) => {
  return new Promise((resolve) => {
    const testData = JSON.stringify({
      contents: [{
        parts: [{
          text: "Hello"
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.write(testData);
    req.end();
  });
};

// Node.js version validation
const validateNodeVersion = () => {
  console.log('🟢 Node.js Version Check:');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`   Current: ${nodeVersion}`);
  
  if (majorVersion >= 18) {
    console.log('   ✅ Node.js 18+ detected');
    return true;
  } else {
    console.log('   ❌ Node.js 18+ required');
    console.log('   💡 Please upgrade Node.js to version 18 or higher');
    return false;
  }
};

// npm version validation
const validateNpmVersion = () => {
  console.log('📦 npm Version Check:');
  const { execSync } = require('child_process');
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    
    console.log(`   Current: ${npmVersion}`);
    
    if (majorVersion >= 8) {
      console.log('   ✅ npm 8+ detected');
      return true;
    } else {
      console.log('   ❌ npm 8+ recommended');
      console.log('   💡 Consider upgrading npm: npm install -g npm@latest');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Unable to check npm version');
    return false;
  }
};

// Main validation function
const runValidation = async () => {
  console.log('🚀 MA Malnu Kananga Environment Validation\n');
  
  const nodeValid = validateNodeVersion();
  const npmValid = validateNpmVersion();
  const envValid = await validateEnvironment();
  
  console.log('📊 Validation Summary:');
  console.log(`   Node.js: ${nodeValid ? '✅' : '❌'}`);
  console.log(`   npm: ${npmValid ? '✅' : '❌'}`);
  console.log(`   Environment: ${envValid ? '✅' : '❌'}`);
  
  if (nodeValid && npmValid && envValid) {
    console.log('\n🎉 All validations passed! Environment is ready.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some validations failed. Please fix the issues above.');
    process.exit(1);
  }
};

// Run validation if called directly
if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { validateEnvironment, validateNodeVersion, validateNpmVersion };
```

### Package.json Script

Add to `package.json`:

```json
{
  "scripts": {
    "env:validate": "node validate-env.js",
    "env:check": "node -e \"console.log('NODE_ENV:', process.env.NODE_ENV || 'development'); console.log('API_KEY:', process.env.API_KEY ? 'Set' : 'Missing');\""
  }
}
```

---

## 🔧 Manual Validation Steps

### Step 1: Verify Node.js Version
```bash
# Check Node.js version
node --version
# Expected: v18.x.x or higher

# Check npm version
npm --version
# Expected: 8.x.x or higher
```

### Step 2: Verify Environment File
```bash
# Check if .env file exists
ls -la .env

# Check .env file content
cat .env

# Verify required variables are set
grep -E "^(API_KEY|NODE_ENV)" .env
```

### Step 3: Test API Key
```bash
# Test Gemini API key
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Expected: JSON response with AI-generated content
```

### Step 4: Validate Application Startup
```bash
# Start development server
npm run dev

# Check for errors in console output
# Expected: Server running on http://localhost:9000
```

---

## 🚨 Common Validation Issues

### Issue: API_KEY Not Working
**Symptoms:**
- AI chat not responding
- API test returns 403/400 error
- Console shows "API_KEY invalid"

**Solutions:**
1. **Check API Key Format**
   ```bash
   # Verify API key format (should start with "AIzaSy")
   echo $API_KEY | grep -E "^AIzaSy"
   ```

2. **Test API Key Manually**
   ```bash
   # Test with curl
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```

3. **Check API Key Status**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Verify API key is active
   - Check usage quotas

### Issue: Environment Variables Not Loading
**Symptoms:**
- `process.env.API_KEY` is undefined
- Application shows "Missing API key" error
- Environment validation fails

**Solutions:**
1. **Check .env File Location**
   ```bash
   # Verify .env file in project root
   ls -la .env
   pwd
   ```

2. **Check dotenv Loading**
   ```bash
   # Test dotenv loading
   node -e "require('dotenv').config(); console.log('API_KEY:', process.env.API_KEY ? 'Set' : 'Missing');"
   ```

3. **Verify File Permissions**
   ```bash
   # Check file permissions
   ls -la .env
   
   # Fix permissions if needed
   chmod 644 .env
   ```

### Issue: Node.js Version Too Old
**Symptoms:**
- Build fails with syntax errors
- Import/export not working
- Modern JavaScript features not supported

**Solutions:**
1. **Install Node.js 18+**
   ```bash
   # Using NVM
   nvm install 18
   nvm use 18
   
   # Verify installation
   node --version
   ```

2. **Update Package Scripts**
   ```json
   {
     "engines": {
       "node": ">=18.0.0",
       "npm": ">=8.0.0"
     }
   }
   ```

---

## 🔍 Production Environment Validation

### Pre-Deployment Checklist

#### Security Validation
```bash
# Ensure API keys are set as secrets (not in .env)
wrangler secret list

# Verify no hardcoded secrets in code
grep -r "AIzaSy" src/ --exclude-dir=node_modules

# Check environment-specific configurations
echo "NODE_ENV: $NODE_ENV"
echo "VITE_APP_ENV: $VITE_APP_ENV"
```

#### Performance Validation
```bash
# Test build performance
npm run build

# Analyze bundle size
npm run build:analyze

# Check production configuration
npm run preview
```

#### API Validation
```bash
# Test production endpoints
curl https://your-worker-url.workers.dev/seed

# Verify AI functionality
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Check authentication flow
curl -X POST https://your-worker-url.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Environment-Specific Configurations

#### Development Environment
```bash
# .env.development
NODE_ENV=development
VITE_APP_ENV=development
VITE_DEV_MODE=true
VITE_DEBUG=true
API_KEY=your_development_api_key
```

#### Production Environment
```bash
# Set via Cloudflare Workers secrets
wrangler secret put API_KEY
wrangler secret put SECRET_KEY

# Environment variables in wrangler.toml
[vars]
NODE_ENV=production
VITE_APP_ENV=production
```

---

## 📊 Validation Report Template

### Automated Report Generation

Create `generate-validation-report.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const generateReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    validations: {}
  };

  // Node.js validation
  report.validations.nodejs = {
    version: process.version,
    valid: parseInt(process.version.slice(1).split('.')[0]) >= 18
  };

  // npm validation
  const { execSync } = require('child_process');
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    report.validations.npm = {
      version: npmVersion,
      valid: parseInt(npmVersion.split('.')[0]) >= 8
    };
  } catch (error) {
    report.validations.npm = { valid: false, error: error.message };
  }

  // Environment variables validation
  require('dotenv').config();
  report.validations.environment = {
    API_KEY: {
      set: !!process.env.API_KEY,
      length: process.env.API_KEY?.length || 0
    },
    NODE_ENV: process.env.NODE_ENV || 'development',
    VITE_APP_ENV: process.env.VITE_APP_ENV || 'development'
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📊 Validation report generated: validation-report.json');
  return report;
};

if (require.main === module) {
  generateReport().catch(console.error);
}

module.exports = { generateReport };
```

---

## ✅ Validation Success Criteria

### Minimum Requirements for Development
- [ ] Node.js 18.0.0+ installed
- [ ] npm 8.0.0+ installed
- [ ] .env file exists and readable
- [ ] API_KEY is set and valid
- [ ] Development server starts without errors
- [ ] AI chat responds to test messages

### Minimum Requirements for Production
- [ ] All development requirements met
- [ ] API keys stored as secrets (not in code)
- [ ] Production build completes successfully
- [ ] All endpoints respond correctly
- [ ] Vector database seeded
- [ ] Authentication flow working end-to-end

---

## 🆘 Troubleshooting Resources

### Debug Commands
```bash
# Check all environment variables
printenv | grep -E "(NODE_|VITE_|API_)"

# Test API connectivity
node -e "require('dotenv').config(); console.log('API_KEY:', process.env.API_KEY?.length || 'Missing');"

# Validate Node.js modules
npm ls --depth=0

# Check for syntax errors
npm run lint
npm run type-check
```

### Support Channels
- **Documentation**: [Installation Guide](./INSTALLATION_GUIDE.md)
- **API Reference**: [API Documentation](./API_DOCUMENTATION.md)
- **Troubleshooting**: [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- **GitHub Issues**: [Report issues](https://github.com/sulhi/ma-malnu-kananga/issues)

---

**🔐 Environment Validation Guide - MA Malnu Kananga**

*Comprehensive guide for validating and troubleshooting environment configuration*

---

*Guide Version: 1.2.0*  
*Last Updated: November 23, 2024*  
*Maintained by: MA Malnu Kananga Technical Team*