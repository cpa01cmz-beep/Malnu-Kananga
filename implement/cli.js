#!/usr/bin/env node

/**
 * Implementation Session CLI
 * Command line interface to manage implementation sessions
 */

import fs from 'fs/promises';
import path from 'path';
import SessionManager from './sessionManager.js';

// Global console for CLI usage
const globalConsole = console;

const IMPLEMENT_DIR = './';
const STATE_FILE = path.join(IMPLEMENT_DIR, 'state.json');

async function showHelp() {
  globalConsole.log(`
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
    globalConsole.log('Session Status:', state.status);
    globalConsole.log('Session ID:', state.sessionId);
    globalConsole.log('Current Step:', state.progress.currentStep);
    globalConsole.log('Completed Steps:', state.progress.completedSteps.length, '/', state.progress.totalSteps);
    globalConsole.log('Project:', state.projectContext.name);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading session state:', error.message);
  }
}

async function showProgress() {
  try {
    const state = JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
    globalConsole.log('\nProgress Details:');
    globalConsole.log('----------------');
    globalConsole.log(`Total Steps: ${state.progress.totalSteps}`);
    globalConsole.log(`Completed: ${state.progress.completedSteps.length}`);
    globalConsole.log(`Remaining: ${state.progress.totalSteps - state.progress.completedSteps.length}`);
    globalConsole.log('\nCompleted Steps:');
    state.progress.completedSteps.forEach((step, index) => {
      const checkpoint = state.checkpoints[step];
      globalConsole.log(`  ${index + 1}. ${step} - ${checkpoint ? checkpoint.description : 'No description'}`);
    });
  } catch (error) {
    globalConsole.error('Error reading session state:', error.message);
  }
}

async function createCheckpoint(step, description) {
  if (!step) {
    globalConsole.error('Error: Please provide a step name');
    return;
  }
  
  const session = new SessionManager();
  try {
    await session.completeStep(step, description || `Completed step: ${step}`);
    globalConsole.log(`Checkpoint created for step: ${step}`);
  } catch (error) {
    globalConsole.error('Error creating checkpoint:', error.message);
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
    globalConsole.log(`New session started with ID: ${sessionId}`);
  } catch (error) {
    globalConsole.error('Error creating new session:', error.message);
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
main().catch(globalConsole.error);