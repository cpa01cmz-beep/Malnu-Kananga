#!/usr/bin/env node

import { readdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Plugin {
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  commands?: Array<{ name: string; description: string; prompt: string }>;
  tools?: Array<{ name: string; description: string }>;
  rules?: Array<{ name: string; description: string; pattern: string; priority: string }>;
}

interface Theme {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const CONFIG_PATH = join(__dirname, 'config.json');
const PLUGINS_DIR = join(__dirname, 'plugins');
const THEMES_DIR = join(__dirname, 'themes');

interface Config {
  enabledPlugins: string[];
  activeTheme: string;
  customCommands: Array<{ name: string; prompt: string }>;
  customRules: Array<{ name: string; pattern: string }>;
}

function loadConfig(): Config {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  }
  return {
    enabledPlugins: ['core', 'performance', 'testing'],
    activeTheme: 'default',
    customCommands: [],
    customRules: []
  };
}

function saveConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function loadPlugins(): Plugin[] {
  const plugins: Plugin[] = [];
  const pluginDirs = readdirSync(PLUGINS_DIR, { withFileTypes: true });

  for (const dir of pluginDirs) {
    if (dir.isDirectory()) {
      const pluginPath = join(PLUGINS_DIR, dir.name, 'plugin.json');
      if (existsSync(pluginPath)) {
        plugins.push(JSON.parse(readFileSync(pluginPath, 'utf-8')));
      }
    }
  }
  return plugins;
}

function loadThemes(): Theme[] {
  const themes: Theme[] = [];
  const themeFiles = readdirSync(THEMES_DIR);

  for (const file of themeFiles) {
    if (file.endsWith('.json')) {
      const themePath = join(THEMES_DIR, file);
      themes.push(JSON.parse(readFileSync(themePath, 'utf-8')));
    }
  }
  return themes;
}

function listPlugins(): void {
  const plugins = loadPlugins();
  const config = loadConfig();

  console.log('\n📦 Oh My OpenCode Plugins\n');
  plugins.forEach(plugin => {
    const status = config.enabledPlugins.includes(plugin.name) ? '✅' : '❌';
    console.log(`${status} ${plugin.name} v${plugin.version}`);
    console.log(`   ${plugin.description}\n`);
  });
}

function listThemes(): void {
  const themes = loadThemes();
  const config = loadConfig();

  console.log('\n🎨 Oh My OpenCode Themes\n');
  themes.forEach(theme => {
    const status = config.activeTheme === theme.name ? '✅' : '';
    console.log(`${status} ${theme.name}`);
    console.log(`   ${theme.description}\n`);
  });
}

function enablePlugin(pluginName: string): void {
  const config = loadConfig();
  if (!config.enabledPlugins.includes(pluginName)) {
    config.enabledPlugins.push(pluginName);
    saveConfig(config);
    console.log(`✅ Plugin "${pluginName}" enabled`);
  } else {
    console.log(`⚠️  Plugin "${pluginName}" is already enabled`);
  }
}

function disablePlugin(pluginName: string): void {
  const config = loadConfig();
  const index = config.enabledPlugins.indexOf(pluginName);
  if (index > -1) {
    config.enabledPlugins.splice(index, 1);
    saveConfig(config);
    console.log(`✅ Plugin "${pluginName}" disabled`);
  } else {
    console.log(`⚠️  Plugin "${pluginName}" is not enabled`);
  }
}

function setTheme(themeName: string): void {
  const themes = loadThemes();
  const theme = themes.find(t => t.name === themeName);

  if (theme) {
    const config = loadConfig();
    config.activeTheme = themeName;
    saveConfig(config);
    console.log(`✅ Theme "${themeName}" set as active`);
  } else {
    console.log(`❌ Theme "${themeName}" not found`);
  }
}

function showStatus(): void {
  const config = loadConfig();
  const plugins = loadPlugins();

  console.log('\n🚀 Oh My OpenCode Status\n');
  console.log(`Active Theme: ${config.activeTheme}`);
  console.log(`Enabled Plugins: ${config.enabledPlugins.length}/${plugins.length}\n`);

  console.log('Enabled Plugins:');
  config.enabledPlugins.forEach(pluginName => {
    const plugin = plugins.find(p => p.name === pluginName);
    if (plugin) {
      console.log(`  ✅ ${plugin.name} v${plugin.version}`);
    }
  });

  const enabledPlugins = new Set(config.enabledPlugins);
  console.log('\nAvailable Plugins:');
  plugins.forEach(plugin => {
    if (!enabledPlugins.has(plugin.name)) {
      console.log(`  ❌ ${plugin.name} v${plugin.version}`);
    }
  });
}

function init(): void {
  if (!existsSync(CONFIG_PATH)) {
    const defaultConfig: Config = {
      enabledPlugins: ['core', 'performance', 'testing'],
      activeTheme: 'default',
      customCommands: [],
      customRules: []
    };
    saveConfig(defaultConfig);
    console.log('✅ Oh My OpenCode initialized with default configuration');
  } else {
    console.log('⚠️  Oh My OpenCode is already initialized');
  }
}

function showHelp(): void {
  console.log(`
Oh My OpenCode - Plugin and Theme Manager

Usage: oh-my-opencode [command] [options]

Commands:
  init              Initialize Oh My OpenCode
  status            Show current status
  list-plugins      List all available plugins
  list-themes       List all available themes
  enable <plugin>   Enable a plugin
  disable <plugin>  Disable a plugin
  set-theme <name>  Set active theme
  help              Show this help message

Examples:
  oh-my-opencode init
  oh-my-opencode enable performance
  oh-my-opencode set-theme dark
  oh-my-opencode status

For more information, visit https://github.com/opencode/oh-my-opencode
`);
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'init':
    init();
    break;
  case 'status':
    showStatus();
    break;
  case 'list-plugins':
    listPlugins();
    break;
  case 'list-themes':
    listThemes();
    break;
  case 'enable':
    enablePlugin(args[0]);
    break;
  case 'disable':
    disablePlugin(args[0]);
    break;
  case 'set-theme':
    setTheme(args[0]);
    break;
  case 'help':
  default:
    showHelp();
    break;
}
