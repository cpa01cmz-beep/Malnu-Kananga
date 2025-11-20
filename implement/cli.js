#!/usr/bin/env node

/**
 * Implementation Session CLI
 * Command line interface to manage implementation sessions
 */

import fs from 'fs/promises';
import path from 'path';
import SessionManager from './sessionManager.js';

const IMPLEMENT_DIR = './';
const STATE_FILE = path.join(IMPLEMENT_DIR, 'state.json');

async function showHelp() {
  // eslint-disable-next-line no-console
  console.log(`
Implementation Session CLI

Usage: node cli.js [command]

Commands:
  status     - Show current session status
  progress   - Show progress details
  checkpoint - Create a new checkpoint
  complete   - Mark a step as complete
  start      - Start a new session
  help       - Show this help message
  `);
}

async function showStatus() {
  try {
    const state = JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
    // eslint-disable-next-line no-console
    console.log('Session Status:', state.status);
    // eslint-disable-next-line no-console
    console.log('Session ID:', state.sessionId);
    // eslint-disable-next-line no-console
    console.log('Current Step:', state.progress.currentStep);
    // eslint-disable-next-line no-console
    console.log('Completed Steps:', state.progress.completedSteps.length, '/', state.progress.totalSteps);
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console
    console.log('Project:', state.projectContext.name);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading session state:', error.message);
  }
}

async function showProgress() {
  try {
    const state = JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
    // eslint-disable-next-line no-console
    console.log('\nProgress Details:');
    // eslint-disable-next-line no-console
    console.log('----------------');
    // eslint-disable-next-line no-console
    console.log(`Total Steps: ${state.progress.totalSteps}`);
    // eslint-disable-next-line no-console
    console.log(`Completed: ${state.progress.completedSteps.length}`);
    // eslint-disable-next-line no-console
    console.log(`Remaining: ${state.progress.totalSteps - state.progress.completedSteps.length}`);
    // eslint-disable-next-line no-console
    console.log('\nCompleted Steps:');
    state.progress.completedSteps.forEach((step, index) => {
      const checkpoint = state.checkpoints[step];
      // eslint-disable-next-line no-console
      console.log(`  ${index + 1}. ${step} - ${checkpoint ? checkpoint.description : 'No description'}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading session state:', error.message);
  }
}

async function createCheckpoint(step, description) {
  if (!step) {
    // eslint-disable-next-line no-console
    console.error('Error: Please provide a step name');
    return;
  }
  
  const session = new SessionManager();
  try {
    await session.completeStep(step, description || `Completed step: ${step}`);
    // eslint-disable-next-line no-console
    console.log(`Checkpoint created for step: ${step}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating checkpoint:', error.message);
  }
}

async function startNewSession() {
  const sessionId = `impl_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now().toString().slice(-3)}`;
  
  const newState = {
    sessionId: sessionId,
    sessionStart: new Date().toISOString(),
    status: "active",
    progress: {
      completedSteps: [],
      currentStep: "initialize_session",
      totalSteps: 1
    },
    checkpoints: {
      "initialize_session": {
        timestamp: new Date().toISOString(),
        description: "Session initialized"
      }
    },
    projectContext: {
      name: "Malnu-Kananga School Portal",
      type: "React 19, TypeScript, Tailwind CSS, Cloudflare Workers",
      directory: process.cwd(),
      lastUpdate: new Date().toISOString()
    }
  };
  
  try {
    await fs.writeFile(STATE_FILE, JSON.stringify(newState, null, 2));
    // eslint-disable-next-line no-console
    console.log(`New session started with ID: ${sessionId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating new session:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'progress':
      await showProgress();
      break;
    case 'checkpoint':
      await createCheckpoint(args[1], args.slice(2).join(' '));
      break;
    case 'complete':
      await createCheckpoint(args[1], args.slice(2).join(' '));
      break;
    case 'start':
      await startNewSession();
      break;
    case 'help':
    case '--help':
    default:
      await showHelp();
  }
}

// Run the main function
main().catch(console.error);