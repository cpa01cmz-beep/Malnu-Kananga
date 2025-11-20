/**
 * Implementation Session Manager
 * Manages the state of implementation sessions
 */

import fs from 'fs/promises';

/* global console */

class SessionManager {
  constructor() {
    this.stateFile = './state.json';
    this.planFile = './plan.md';
    this.state = {};
  }

  /**
   * Load the current session state
   */
  async loadState() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      this.state = JSON.parse(data);
      return this.state;
    } catch (error) {
      console.error('Error loading session state:', error);
      throw error;
    }
  }

  /**
   * Save the current session state
   */
  async saveState() {
    try {
      await fs.writeFile(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Error saving session state:', error);
      throw error;
    }
  }

  /**
   * Update progress with a completed step
   * @param {string} step - The step that was completed
   * @param {string} description - Description of what was done
   */
  async completeStep(step, description) {
    await this.loadState();
    
    // Add to completed steps if not already there
    if (!this.state.progress.completedSteps.includes(step)) {
      this.state.progress.completedSteps.push(step);
    }
    
    // Update checkpoint
    this.state.checkpoints[step] = {
      timestamp: new Date().toISOString(),
      description: description
    };
    
    // Update last modified
    this.state.projectContext.lastUpdate = new Date().toISOString();
    
    await this.saveState();
  }

  /**
   * Set the current working step
   * @param {string} step - The current step
   */
  async setCurrentStep(step) {
    await this.loadState();
    this.state.progress.currentStep = step;
    this.state.projectContext.lastUpdate = new Date().toISOString();
    await this.saveState();
  }
}

export default SessionManager;