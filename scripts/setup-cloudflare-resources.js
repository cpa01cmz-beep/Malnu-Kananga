#!/usr/bin/env node

/**
 * One-Click Cloudflare Resources Setup
 * Script untuk membuat semua resources Cloudflare yang diperlukan
 */

/* global console process */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// const PROJECT_NAME = 'ma-malnu-kananga';
const DB_NAME = 'malnu-kananga-auth';
const VECTORIZE_NAME = 'malnu-kananga-docs';

class CloudflareResourceManager {
  constructor() {
    this.checkPrerequisites();
  }

  checkPrerequisites() {
    try {
      execSync('npx wrangler --version', { stdio: 'pipe' });
    } catch {
      console.error('❌ Wrangler CLI tidak ditemukan. Install dengan: npm install -g wrangler');
      process.exit(1);
    }
  }

  async runCommand(command, description) {
    console.log(`🔄 ${description}...`);
    try {
      const output = execSync(command, { encoding: 'utf8' });
      console.log(`✅ ${description} berhasil`);
      return output;
    } catch (error) {
      console.error(`❌ ${description} gagal:`, error.message);
      throw error;
    }
  }

  async setupDatabase() {
    console.log('\n🗄️  Setup Database...');

    try {
      // Create D1 database
      await this.runCommand(
        `npx wrangler d1 create ${DB_NAME}`,
        'Membuat database D1'
      );

      // Run migration
      if (existsSync('./migration.sql')) {
        await this.runCommand(
          `npx wrangler d1 execute ${DB_NAME} --file=./migration.sql`,
          'Menjalankan migration database'
        );
      }
    } catch {
      console.log('ℹ️  Database mungkin sudah ada, melanjutkan...');
    }
  }

  async setupVectorize() {
    console.log('\n🧠 Setup Vectorize Index...');

    try {
      // Create Vectorize index
      await this.runCommand(
        `npx wrangler vectorize create ${VECTORIZE_NAME} --dimensions=768 --metric=cosine`,
        'Membuat Vectorize index'
      );
    } catch {
      console.log('ℹ️  Vectorize index mungkin sudah ada, melanjutkan...');
    }
  }

  async getResourceIds() {
    console.log('\n🔍 Mengambil resource IDs...');

    let databaseId = null;
    let vectorizeId = null;

    try {
      // Get database ID
      const dbList = execSync(`npx wrangler d1 list`, { encoding: 'utf8' });
      const dbMatch = dbList.match(new RegExp(`${DB_NAME}\\s+([a-f0-9-]+)`));
      databaseId = dbMatch ? dbMatch[1] : null;
    } catch (error) {
      console.log('ℹ️  Database belum dibuat, akan dibuat baru');
    }

    try {
      // Get Vectorize ID
      const vecList = execSync(`npx wrangler vectorize list`, { encoding: 'utf8' });
      const vecMatch = vecList.match(new RegExp(`${VECTORIZE_NAME}\\s+([a-f0-9-]+)`));
      vectorizeId = vecMatch ? vecMatch[1] : null;
    } catch (error) {
      console.log('ℹ️  Vectorize index belum dibuat, akan dibuat baru');
    }

    return { databaseId, vectorizeId };
  }

  updateWranglerConfig(databaseId, vectorizeId) {
    console.log('\n📝 Update konfigurasi wrangler.toml...');

    let config = readFileSync('wrangler.toml', 'utf8');

    // Update database ID
    if (databaseId) {
      config = config.replace(
        /database_id = "your_database_id_here"/,
        `database_id = "${databaseId}"`
      );
    }

    // Add Vectorize ID if not present
    if (vectorizeId && !config.includes('preview')) {
      const vectorizeConfig = `
# Vectorize index untuk RAG functionality
[[vectorize]]
index_name = "${VECTORIZE_NAME}"`;

      config = config.replace(
        '[env.production]',
        `[env.production]\n${vectorizeConfig}`
      );
    }

    writeFileSync('wrangler.toml', config);
    console.log('✅ Konfigurasi wrangler.toml berhasil diupdate');
  }

  async deployWorker() {
    console.log('\n🚀 Deploy Cloudflare Worker...');

    await this.runCommand(
      'npx wrangler deploy --env=production',
      'Deploy worker ke production'
    );
  }

  async seedDatabase() {
    console.log('\n🌱 Seed database...');

    try {
      // Get worker URL
      const deployments = execSync('npx wrangler deployments list', { encoding: 'utf8' });
      const workerUrlMatch = deployments.match(/https:\/\/[^\s]+\.workers\.dev/);

      if (workerUrlMatch) {
        const workerUrl = workerUrlMatch[0];
        console.log(`📡 Worker URL: ${workerUrl}`);

        // Seed data
        await this.runCommand(
          `curl -X POST ${workerUrl}/seed`,
          'Seed initial data'
        );
      } else {
        console.log('⚠️  Tidak dapat menemukan Worker URL, skipping seed');
      }
    } catch (error) {
      console.log('⚠️  Seed gagal, tapi deployment tetap berhasil');
    }
  }

  async run() {
    console.log('🚀 Starting One-Click Cloudflare Setup...\n');

    try {
      // Setup resources
      await this.setupDatabase();
      await this.setupVectorize();

      // Get resource IDs and update config
      const { databaseId, vectorizeId } = await this.getResourceIds();
      this.updateWranglerConfig(databaseId, vectorizeId);

      // Deploy worker
      await this.deployWorker();

      // Seed database
      await this.seedDatabase();

      console.log('\n🎉 Setup berhasil! Website siap digunakan.');
      console.log('\n📋 Next steps:');
      console.log('1. Set API_KEY di Cloudflare Dashboard atau dengan:');
      console.log('   npx wrangler secret put API_KEY --env=production');
      console.log('2. Test website dengan mengunjungi Pages URL');
      console.log('3. Test AI chat functionality');

    } catch (error) {
      console.error('\n❌ Setup gagal:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Pastikan Anda sudah login: npx wrangler login');
      console.log('2. Pastikan API token memiliki permissions yang benar');
      console.log('3. Check https://dash.cloudflare.com/ untuk error details');
      process.exit(1);
    }
  }
}

// Run setup
const setup = new CloudflareResourceManager();
setup.run().catch(console.error);