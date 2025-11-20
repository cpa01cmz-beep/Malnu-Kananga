#!/usr/bin/env node

/**
 * Test script for documentation manager
 */

import DocumentationManager from './docManager.js';

/* global console */

async function testDocManager() {
  console.log('Testing Documentation Manager...');
  
  const docManager = new DocumentationManager();
  
  try {
    const scanResults = await docManager.scanCodebase();
    console.log('Codebase scan results:', scanResults);
    
    console.log('Documentation manager test completed successfully!');
  } catch (error) {
    console.error('Error testing documentation manager:', error);
  }
}

testDocManager();