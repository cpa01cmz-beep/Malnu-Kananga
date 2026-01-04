#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.requiredVars = {
      development: ['VITE_GEMINI_API_KEY'],
      production: ['VITE_GEMINI_API_KEY', 'SECRET_KEY']
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

  loadEnvFromFile() {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) return;
    
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    } catch (error) {
      this.errors.push('❌ Error reading .env file: ' + error.message);
    }
  }

  validateEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      this.errors.push('❌ .env file not found');
      return;
    }
    
    console.log('✅ .env file found');
    
    // Check .env.example exists and is secure
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      console.log('✅ .env.example file found');
      
      // Check for real keys in template
      const templateContent = fs.readFileSync(examplePath, 'utf8');
      const realKeyPatterns = [
        /AIza[0-9A-Za-z_-]{35}/,
        /sk-[a-zA-Z0-9]{48}/,
        /ghp_[a-zA-Z0-9]{36}/
      ];
      
      const hasRealKeys = realKeyPatterns.some(pattern => pattern.test(templateContent));
      if (hasRealKeys) {
        this.errors.push('❌ .env.example may contain real API keys');
      } else {
        console.log('✅ .env.example appears safe');
      }
    } else {
      this.warnings.push('⚠️ .env.example file not found');
    }
    
    // Check .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env')) {
        console.log('✅ .env is in .gitignore');
      } else {
        this.errors.push('❌ .env not found in .gitignore');
      }
    } else {
      this.warnings.push('⚠️ .gitignore not found');
    }
  }

  validateRequiredVariables(env) {
    const required = this.requiredVars[env] || this.requiredVars.development;
    
    required.forEach(varName => {
      // Load from .env file if not in process.env
      if (!process.env[varName]) {
        this.loadEnvFromFile();
      }
      
      const value = process.env[varName];
      
      if (!value) {
        this.errors.push(`❌ Required variable ${varName} is not set`);
      } else if (value.includes('placeholder') || value.includes('your_')) {
        this.errors.push(`❌ ${varName} contains placeholder value`);
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
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) return;
    
    // Check Gemini API key format
    if (!apiKey.startsWith('AIza')) {
      this.errors.push('❌ VITE_GEMINI_API_KEY does not appear to be a valid Google Gemini API key');
    } else {
      console.log('✅ VITE_GEMINI_API_KEY format appears valid');
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
      const devDependencies = packageJson.devDependencies || {};
      
      // Check critical dependencies in both deps and devDeps
      const allDependencies = { ...dependencies, ...devDependencies };
      const criticalDeps = ['react', 'react-dom', 'vite'];
      criticalDeps.forEach(dep => {
        if (allDependencies[dep]) {
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