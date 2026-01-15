# Internationalization (i18n) Guide

This guide covers the internationalization (i18n) implementation for MA Malnu Kananga.

## Overview

The application supports multiple languages using the `i18next` library and `react-i18next` for React integration. Currently, the application supports:

- **Bahasa Indonesia** (id) - Default language
- **English** (en) - Secondary language

## Installation

The i18n dependencies are already installed:

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

## Configuration

### i18n Configuration

The i18n configuration is located in `src/i18n/config.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import idTranslations from './locales/id.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      id: { translation: idTranslations },
    },
    fallbackLng: 'id',
    defaultNS: 'translation',
    lng: 'id',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });
```

### Translation Files

Translation files are located in `src/i18n/locales/`:

- `en.json` - English translations
- `id.json` - Indonesian translations

## Usage

### Using the `useTranslation` Hook

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('dashboard.welcome', { name: 'John' })}</p>
    </div>
  );
}
```

### Using the `useLanguage` Hook

For more advanced language management, use the custom `useLanguage` hook:

```typescript
import { useLanguage } from '../hooks/useLanguage';

function LanguageControl() {
  const {
    currentLanguage,
    languages,
    changeLanguage,
    getLanguageInfo,
  } = useLanguage();

  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### Using the LanguageSwitcher Component

The `LanguageSwitcher` component provides a dropdown for language selection:

```typescript
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyComponent() {
  return (
    <div>
      <LanguageSwitcher showLabel showFlag />
    </div>
  );
}
```

**Props:**

- `className?: string` - Additional CSS classes
- `showLabel?: boolean` - Show language label (default: true)
- `showFlag?: boolean` - Show country flags (default: true)

## Translation Key Structure

Translation keys are organized by feature:

```json
{
  "app": { "title": "...", "description": "..." },
  "common": { "save": "...", "cancel": "..." },
  "navigation": { "home": "...", "dashboard": "..." },
  "auth": { "login": "...", "logout": "..." },
  "dashboard": { "welcome": "...", "overview": "..." },
  "users": { "user": "...", "users": "..." },
  "attendance": { "attendance": "...", "present": "..." },
  "grades": { "grades": "...", "score": "..." },
  "materials": { "materials": "...", "upload": "..." },
  "notifications": { "notifications": "...", "markAsRead": "..." },
  "settings": { "settings": "...", "general": "..." },
  "language": { "selectLanguage": "...", "indonesian": "..." },
  "errors": { "unexpectedError": "...", "networkError": "..." },
  "messages": { "noResults": "...", "actionSuccess": "..." },
  "forms": { "requiredField": "...", "invalidFormat": "..." },
  "ppdb": { "title": "...", "registration": "..." },
  "ai": { "title": "...", "generate": "..." },
  "voice": { "voiceCommands": "...", "listening": "..." },
  "accessibility": { "skipToContent": "...", "alert": "..." },
  "offline": { "offline": "...", "online": "..." },
  "export": { "exportToPDF": "...", "exporting": "..." },
  "time": { "today": "...", "yesterday": "..." },
  "validation": { "required": "...", "email": "..." }
}
```

## Interpolation

Dynamic values can be inserted into translations using interpolation:

```json
{
  "dashboard": {
    "welcome": "Welcome back, {{name}}!"
  },
  "validation": {
    "minLength": "{{field}} must be at least {{min}} characters"
  }
}
```

Usage:

```typescript
t('dashboard.welcome', { name: 'John' }); // "Welcome back, John!"
t('validation.minLength', { field: 'Password', min: 8 }); // "Password must be at least 8 characters"
```

## Adding New Translations

### 1. Add Translation Key to Both Languages

Edit both `src/i18n/locales/en.json` and `src/i18n/locales/id.json`:

**English (`en.json`):**

```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is a new feature"
  }
}
```

**Indonesian (`id.json`):**

```json
{
  "myFeature": {
    "title": "Fitur Saya",
    "description": "Ini adalah fitur baru"
  }
}
```

### 2. Use in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyFeature() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('myFeature.title')}</h2>
      <p>{t('myFeature.description')}</p>
    </div>
  );
}
```

## Language Persistence

The selected language is persisted in `localStorage` using the key `malnu_language` (defined in `STORAGE_KEYS.LANGUAGE`).

The language is detected in this order:
1. `localStorage` (saved preference)
2. Browser's `navigator.language`

## Adding New Languages

### 1. Create Translation File

Create a new file in `src/i18n/locales/`:

```typescript
// src/i18n/locales/ja.json
{
  "app": {
    "title": "MA Malnu Kananga",
    "description": "現代的な学校管理システム"
  },
  // ... other translations
}
```

### 2. Update Configuration

Update `src/i18n/config.ts`:

```typescript
import jaTranslations from './locales/ja.json';

const resources = {
  en: { translation: enTranslations },
  id: { translation: idTranslations },
  ja: { translation: jaTranslations }, // Add new language
};
```

### 3. Update Language Hook

Update `src/hooks/useLanguage.ts`:

```typescript
const LANGUAGES = [
  { code: 'id', name: 'id', flag: '🇮🇩' },
  { code: 'en', name: 'en', flag: '🇺🇸' },
  { code: 'ja', name: 'ja', flag: '🇯🇵' }, // Add new language
] as const;
```

## Testing

### Run Tests

```bash
# Run all i18n tests
npm test -- src/i18n/__tests__

# Run useLanguage hook tests
npm test -- src/hooks/__tests__/useLanguage.test.ts

# Run LanguageSwitcher component tests
npm test -- src/components/__tests__/LanguageSwitcher.test.tsx
```

### Test Coverage

- i18n configuration tests
- `useLanguage` hook tests
- `LanguageSwitcher` component tests

## Accessibility

The `LanguageSwitcher` component includes proper ARIA attributes:

- `role="group"` for the container
- `aria-label` for the select element
- `for` attribute on the label linked to the select

## Best Practices

### 1. Keep Translation Keys Consistent

Use lowercase, dot notation for nested keys:
- ✅ `auth.login`
- ❌ `Auth.Login` or `AUTH_LOGIN`

### 2. Group Related Keys

Organize translations by feature:
```json
{
  "auth": { "login": "...", "logout": "..." },
  "dashboard": { "overview": "...", "statistics": "..." }
}
```

### 3. Use Descriptive Keys

- ✅ `user.emailRequired` 
- ❌ `error1` or `msg`

### 4. Provide Context When Needed

```json
{
  "common": { "save": "Save" },
  "auth": { "save": "Save changes to your account" }
}
```

### 5. Test All Languages

Always verify translations in both languages after adding new features.

## Troubleshooting

### Translation Not Showing

1. Check that the translation key exists in both language files
2. Verify the key spelling matches exactly (case-sensitive)
3. Check console for i18n errors

### Language Not Persisting

1. Verify `localStorage` is enabled
2. Check browser settings for localStorage access
3. Ensure the `STORAGE_KEYS.LANGUAGE` constant is correct

### Missing Translations

If a translation key is missing in the current language, i18n will:
1. Look for the key in the fallback language (id)
2. Return the key name if not found

## Storage Keys

Language preference is stored in:

```typescript
STORAGE_KEYS.LANGUAGE = 'malnu_language'
```

This is defined in `src/constants.ts` and used by the `useLanguage` hook.

## References

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)

## Support

For questions or issues with internationalization, please:
1. Check this guide
2. Review the implementation in `src/i18n/`
3. Contact the development team

---

**Last Updated**: 2026-01-15
**Version**: 1.0.0
