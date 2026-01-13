name: OpenCode Integration Guide

# Native GitHub Actions Integration for OpenCode

This document explains how OpenCode is natively integrated with GitHub Actions in this repository.

## Architecture

### Composite Actions

We use GitHub Actions composite actions for reusable OpenCode operations:

1. **`opencode-setup`** - Setup and configure OpenCode CLI
   - Installs OpenCode if not present
   - Caches installation for speed
   - Configures git and validates installation

2. **`opencode-run`** - Execute OpenCode with prompts
   - Reads prompt files
   - Executes with automatic retries
   - Handles errors gracefully

### Workflows

- **`on-push.yml`** - Runs on push events
  - User story generation (when no open issues)
  - UI/UX analysis
  - Repository maintenance

- **`on-pull.yml`** - Runs on pull request events
  - Auto-fix CI failures
  - Code analysis and improvements
  - PR management

## Configuration Files

### `.github/opencode.json`

Main configuration for OpenCode in GitHub Actions:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/glm-4.7-free",
  "tools": { "*": true },
  "permission": {
    "edit": "allow",
    "bash": { "*": "allow" }
  }
}
```

### `.github/prompt/*.md`

Prompt templates used by workflows:
- `user-story.md` - Generate user stories from existing features
- `ui-ux.md` - Analyze UI/UX issues and improvements
- `maintenance.md` - Repository maintenance and auto-fix tasks

## Usage

### In Workflow YAML

```yaml
steps:
  - name: Setup OpenCode
    uses: ./.github/actions/opencode-setup

  - name: Run OpenCode
    uses: ./.github/actions/opencode-run
    with:
      prompt-file: .github/prompt/maintenance.md
      model: opencode/glm-4.7-free
      share: 'false'
      max-retries: '3'
```

### Available Parameters for opencode-run

| Parameter | Required | Default | Description |
|-----------|-----------|----------|-------------|
| `prompt-file` | Yes* | - | Path to prompt file (unless using inline prompt) |
| `prompt` | No | - | Inline prompt string |
| `model` | No | `opencode/glm-4.7-free` | OpenCode model to use |
| `share` | No | `false` | Enable/disable result sharing |
| `max-retries` | No | `2` | Maximum retry attempts |
| `retry-delay` | No | `30` | Delay between retries (seconds) |
| `continue-on-error` | No | `false` | Continue workflow even if OpenCode fails |

## Customization

### Adding New Prompts

1. Create prompt file in `.github/prompt/`:
    ```bash
    touch .github/prompt/my-feature.md
    ```

2. Add content:
   ```markdown
   # Your prompt here
   ```

3. Use in workflow:
    ```yaml
    - uses: ./.github/actions/opencode-run
      with:
        prompt-file: .github/prompt/my-feature.md
    ```

### Modifying OpenCode Model

Change model in `.github/opencode.json` or override in workflow:

```yaml
- uses: ./.github/actions/opencode-run
  with:
    model: opencode/gpt-4-turbo
```

### Custom Retry Logic

Adjust retry behavior:

```yaml
- uses: ./.github/actions/opencode-run
  with:
    max-retries: '5'
    retry-delay: '60'
```

## Troubleshooting

### OpenCode Not Found

If you see "opencode: command not found":
- Check that `opencode-setup` action ran successfully
- Verify cache is not corrupted (delete cache key)

### Prompt File Not Found

Ensure prompt file paths are relative to repository root:
- ✅ `.github/prompt/maintenance.md`
- ❌ `/home/runner/work/repo/.github/prompt/maintenance.md`

### Timeout Issues

Increase timeout in workflow:

```yaml
jobs:
  analyze:
    timeout-minutes: 90
```

## Performance

### Caching

The `opencode-setup` action automatically caches:
- `~/.opencode` - OpenCode installation
- `~/.npm` - npm dependencies

Cache keys:
```
opencode-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-v2
```

### Parallel Execution

Multiple OpenCode runs can execute in parallel:

```yaml
- name: Analysis 1
  uses: ./.github/actions/opencode-run
  with:
    prompt-file: .github/prompt/analysis1.md

- name: Analysis 2
  uses: ./.github/actions/opencode-run
  with:
    prompt-file: .github/prompt/analysis2.md
```

## Security

### Secrets Management

All required secrets are configured in workflow `env`:
- `GH_TOKEN` - GitHub token with repo access
- `GEMINI_API_KEY` - AI/LLM API key
- Other project-specific secrets

### Permissions

Workflows have minimal required permissions:
```yaml
permissions:
  contents: write
  pull-requests: write
  actions: read
  repository-projects: write
```

## Monitoring

### Workflow Runs

View workflow runs at:
`Actions → on-push` or `Actions → on-pull`

### Logs

OpenCode output is automatically logged:
- Check "Run OpenCode" step logs
- Look for "✅ OpenCode execution succeeded"
- Check retry attempts

## Best Practices

1. **Use prompt files** instead of inline prompts for maintainability
2. **Set appropriate timeouts** based on task complexity
3. **Enable retries** for flaky operations
4. **Monitor costs** - OpenCode usage is billed per execution
5. **Use caching** to speed up workflows
6. **Test locally** before pushing changes to workflows
7. **Document custom prompts** in this guide
8. **Review OpenCode output** regularly for quality

## Related Files

- `.github/opencode.json` - OpenCode configuration
- `.github/actions/opencode-setup/` - Setup action
- `.github/actions/opencode-run/` - Run action
- `.github/workflows/on-push.yml` - Push workflow
- `.github/workflows/on-pull.yml` - Pull workflow
- `.github/prompt/` - Prompt templates
- `.opencode/` - Local OpenCode configuration (for development)
