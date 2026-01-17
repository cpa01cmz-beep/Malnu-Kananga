import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '../useLanguage';
import i18n from '../../i18n/config';
import { STORAGE_KEYS } from '../../constants';

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage('id');
    }
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with Indonesian as default language', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.currentLanguage).toBe('id');
  });

  it('should change language', async () => {
    const { result } = renderHook(() => useLanguage());
    
    await act(async () => {
      await result.current.changeLanguage('en');
    });

    expect(result.current.currentLanguage).toBe('en');
  });

  it('should save language preference to localStorage', async () => {
    const { result } = renderHook(() => useLanguage());
    
    await act(async () => {
      await result.current.changeLanguage('en');
    });

    expect(localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe('en');
  });

  it('should load language preference from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'en');
    
    const { result } = renderHook(() => useLanguage());
    expect(result.current.currentLanguage).toBe('en');
  });

  it('should provide language info for supported languages', () => {
    const { result } = renderHook(() => useLanguage());
    
    const idInfo = result.current.getLanguageInfo('id');
    expect(idInfo).toEqual({ code: 'id', name: 'id', flag: '🇮🇩' });

    const enInfo = result.current.getLanguageInfo('en');
    expect(enInfo).toEqual({ code: 'en', name: 'en', flag: '🇺🇸' });
  });

  it('should return undefined for unsupported language', () => {
    const { result } = renderHook(() => useLanguage());
    
    const info = result.current.getLanguageInfo('fr' as any);
    expect(info).toBeUndefined();
  });

  it('should check if language is supported', () => {
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.isLanguageSupported('id')).toBe(true);
    expect(result.current.isLanguageSupported('en')).toBe(true);
    expect(result.current.isLanguageSupported('fr')).toBe(false);
  });

  it('should return list of supported languages', () => {
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.languages).toHaveLength(2);
    expect(result.current.languages[0].code).toBe('id');
    expect(result.current.languages[1].code).toBe('en');
  });
});
