import i18n from '../config';

describe('i18n Configuration', () => {
  beforeEach(() => {
    i18n.changeLanguage('id');
  });

  it('should have default language set to Indonesian', () => {
    expect(i18n.language).toBe('id');
  });

  it('should have fallback language set to Indonesian', () => {
    expect(i18n.options.fallbackLng).toEqual(['id']);
  });

  it('should support English language', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  it('should have translation resources for both languages', () => {
    const resources = i18n.store.data as any;

    expect(resources.en).toBeDefined();
    expect(resources.en.translation).toBeDefined();
    
    expect(resources.id).toBeDefined();
    expect(resources.id.translation).toBeDefined();
  });

  it('should have common translations in English', () => {
    const enTranslation = (i18n.store.data as any).en.translation;
    
    expect(enTranslation.common.save).toBe('Save');
    expect(enTranslation.common.cancel).toBe('Cancel');
    expect(enTranslation.common.loading).toBe('Loading...');
  });

  it('should have common translations in Indonesian', () => {
    const idTranslation = (i18n.store.data as any).id.translation;
    
    expect(idTranslation.common.save).toBe('Simpan');
    expect(idTranslation.common.cancel).toBe('Batal');
    expect(idTranslation.common.loading).toBe('Memuat...');
  });

  it('should have navigation translations in English', () => {
    const enTranslation = (i18n.store.data as any).en.translation;
    
    expect(enTranslation.navigation.home).toBe('Home');
    expect(enTranslation.navigation.dashboard).toBe('Dashboard');
    expect(enTranslation.navigation.profile).toBe('Profile');
  });

  it('should have navigation translations in Indonesian', () => {
    const idTranslation = (i18n.store.data as any).id.translation;
    
    expect(idTranslation.navigation.home).toBe('Beranda');
    expect(idTranslation.navigation.dashboard).toBe('Dasbor');
    expect(idTranslation.navigation.profile).toBe('Profil');
  });

  it('should have auth translations in English', () => {
    const enTranslation = (i18n.store.data as any).en.translation;
    
    expect(enTranslation.auth.login).toBe('Login');
    expect(enTranslation.auth.logout).toBe('Logout');
    expect(enTranslation.auth.email).toBe('Email');
    expect(enTranslation.auth.password).toBe('Password');
  });

  it('should have auth translations in Indonesian', () => {
    const idTranslation = (i18n.store.data as any).id.translation;
    
    expect(idTranslation.auth.login).toBe('Masuk');
    expect(idTranslation.auth.logout).toBe('Keluar');
    expect(idTranslation.auth.email).toBe('Email');
    expect(idTranslation.auth.password).toBe('Kata Sandi');
  });

  it('should support interpolation in translations', () => {
    const enTranslation = (i18n.store.data as any).en.translation;
    
    expect(enTranslation.dashboard.welcome).toContain('{{name}}');
  });

  it('should have comprehensive translation keys', () => {
    const enTranslation = (i18n.store.data as any).en.translation;
    
    expect(Object.keys(enTranslation).length).toBeGreaterThan(10);
    
    expect(enTranslation.app).toBeDefined();
    expect(enTranslation.common).toBeDefined();
    expect(enTranslation.navigation).toBeDefined();
    expect(enTranslation.auth).toBeDefined();
    expect(enTranslation.dashboard).toBeDefined();
    expect(enTranslation.users).toBeDefined();
    expect(enTranslation.attendance).toBeDefined();
    expect(enTranslation.grades).toBeDefined();
    expect(enTranslation.materials).toBeDefined();
    expect(enTranslation.notifications).toBeDefined();
    expect(enTranslation.settings).toBeDefined();
    expect(enTranslation.language).toBeDefined();
    expect(enTranslation.errors).toBeDefined();
    expect(enTranslation.messages).toBeDefined();
    expect(enTranslation.forms).toBeDefined();
    expect(enTranslation.ppdb).toBeDefined();
    expect(enTranslation.ai).toBeDefined();
    expect(enTranslation.voice).toBeDefined();
    expect(enTranslation.accessibility).toBeDefined();
    expect(enTranslation.offline).toBeDefined();
    expect(enTranslation.export).toBeDefined();
    expect(enTranslation.time).toBeDefined();
    expect(enTranslation.validation).toBeDefined();
  });

  it('should change language and update translations', async () => {
    const saveKey = 'common.save';
    
    expect(i18n.t(saveKey)).toBe('Simpan');
    
    await i18n.changeLanguage('en');
    expect(i18n.t(saveKey)).toBe('Save');
  });

  it('should have validation translations', () => {
    const idTranslation = (i18n.store.data as any).id.translation;
    const enTranslation = (i18n.store.data as any).en.translation;
    
    expect(idTranslation.validation.required).toContain('{{field}}');
    expect(enTranslation.validation.required).toContain('{{field}}');
    
    i18n.changeLanguage('en');
    expect(i18n.t('validation.required', { field: 'Email' }))
      .toBe('Email is required');
  });
});
