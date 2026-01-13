# Oh My OpenCode

A powerful plugin and theme management system for OpenCode CLI, inspired by oh-my-zsh.

## Overview

Oh My OpenCode provides:
- **Plugin System**: Extensible plugins for commands, tools, and rules
- **Theme Support**: Customizable visual themes
- **Easy Configuration**: Simple CLI for managing plugins and themes
- **Community Driven**: Easy to create and share plugins

## Installation

Oh My OpenCode is pre-configured in the `.opencode/` directory. No additional installation needed!

## Quick Start

```bash
# Initialize Oh My OpenCode
npx ts-node .opencode/oh-my-opencode.ts init

# Show current status
npx ts-node .opencode/oh-my-opencode.ts status

# List available plugins
npx ts-node .opencode/oh-my-opencode.ts list-plugins

# List available themes
npx ts-node .opencode/oh-my-opencode.ts list-themes

# Enable a plugin
npx ts-node .opencode/oh-my-opencode.ts enable security

# Disable a plugin
npx ts-node .opencode/oh-my-opencode.ts disable testing

# Set a theme
npx ts-node .opencode/oh-my-opencode.ts set-theme dark
```

## Available Plugins

### Core Plugin (v1.0.0) ✅
Essential commands and rules for MA Malnu Kananga project:
- `/test` - Run tests
- `/typecheck` - TypeScript type checking
- `/lint` - Run linting
- `/full-check` - Run all quality checks
- `/build-verify` - Build and verify
- `/deploy` - Deploy to production

**Rules**: Git workflow, TypeScript strict mode, Naming conventions

### Performance Plugin (v1.0.0) ✅
Performance optimization tools:
- `/optimize-performance` - Optimize component/service performance
- `/analyze-bundle` - Analyze bundle size

**Tools**: `find-large-files`, `analyze-imports`
**Rules**: Performance optimization, Bundle size awareness

### Testing Plugin (v1.0.0) ✅
Testing and code coverage tools:
- `/test-generate` - Generate tests for existing code
- `/debug-test` - Debug failing tests

**Tools**: `check-missing-tests`
**Rules**: Component testing, Service testing, Test coverage

### Security Plugin (v1.0.0) ❌
Security analysis and vulnerability detection:
- `/security-check` - Run security audit
- `/security-audit` - Comprehensive security review

**Tools**: `find-security-issues`
**Rules**: Security, Secret management, Input validation

## Available Themes

### Default Theme ✅
Standard OpenCode theme with balanced colors

### Dark Theme
Dark theme optimized for low-light environments

### Minimal Theme
Minimal theme with subtle, professional colors

## Creating Custom Plugins

Create a new plugin in `.opencode/plugins/your-plugin/plugin.json`:

```json
{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "Your plugin description",
  "enabled": false,
  "commands": [
    {
      "name": "your-command",
      "description": "Command description",
      "prompt": "What the command does..."
    }
  ],
  "tools": [
    {
      "name": "your-tool",
      "description": "Tool description"
    }
  ],
  "rules": [
    {
      "name": "Your Rule",
      "description": "Rule description",
      "pattern": "The pattern or rule...",
      "priority": "high"
    }
  ]
}
```

## Creating Custom Themes

Create a new theme in `.opencode/themes/your-theme.json`:

```json
{
  "name": "your-theme",
  "description": "Your theme description",
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#6b7280",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#06b6d4"
  }
}
```

## Configuration

Configuration is stored in `.opencode/config.json`:

```json
{
  "enabledPlugins": ["core", "performance", "testing"],
  "activeTheme": "default",
  "customCommands": [],
  "customRules": []
}
```

## Integration with OpenCode

Oh My OpenCode plugins automatically integrate with the main OpenCode configuration. When you enable a plugin:

1. **Commands** are added to `commands.json`
2. **Tools** are available as analysis tools
3. **Rules** are added to `rules.json`

## Best Practices

1. **Start with Core Plugin**: Always keep the core plugin enabled for essential commands
2. **Enable Plugins as Needed**: Enable plugins based on your current task (testing, security, performance)
3. **Create Custom Plugins**: Create custom plugins for project-specific workflows
4. **Share Plugins**: Share your plugins with the team by committing to the repository
5. **Regular Updates**: Keep plugins updated with new commands and rules

## Troubleshooting

### Plugin not showing up
- Check that the plugin.json file exists in the correct directory
- Verify the JSON format is valid
- Run `list-plugins` to see all available plugins

### Commands not available
- Ensure the plugin is enabled
- Restart OpenCode after enabling a new plugin
- Check commands.json to verify integration

### Theme not applying
- Verify the theme name matches a file in themes/ directory
- Check the JSON format is valid
- Restart OpenCode after changing themes

## Contributing

To contribute to Oh My OpenCode:

1. Create a new plugin in the `plugins/` directory
2. Add comprehensive documentation
3. Test the plugin thoroughly
4. Update this README
5. Share with the team

## License

Part of MA Malnu Kananga project. See project LICENSE for details.

## Support

For issues or questions about Oh My OpenCode:
- Check the main OpenCode documentation
- Review plugin-specific documentation
- Contact the development team

---

**Enjoy coding with Oh My OpenCode! 🚀**
