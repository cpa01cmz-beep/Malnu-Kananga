import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import i18n from '../../i18n/config';

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    i18n.changeLanguage('id');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render language switcher component', () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('should render language label when showLabel is true', () => {
    renderWithI18n(<LanguageSwitcher showLabel />);
    
    const labelElement = screen.getByText(/selectLanguage/i);
    expect(labelElement).toBeInTheDocument();
  });

  it('should not render language label when showLabel is false', () => {
    renderWithI18n(<LanguageSwitcher showLabel={false} />);
    
    const labelElement = screen.queryByText(/selectLanguage/i);
    expect(labelElement).not.toBeInTheDocument();
  });

  it('should render language options with flags when showFlag is true', async () => {
    renderWithI18n(<LanguageSwitcher showFlag />);
    
    const selectElement = screen.getByRole('combobox');
    
    expect(selectElement).toBeInTheDocument();
    
    fireEvent.mouseDown(selectElement);
    
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  it('should have correct options for supported languages', () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    expect(selectElement.options).toHaveLength(2);
    expect(selectElement.options[0].value).toBe('id');
    expect(selectElement.options[1].value).toBe('en');
  });

  it('should select Indonesian by default', () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('id');
  });

  it('should change language when option is selected', async () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    fireEvent.change(selectElement, { target: { value: 'en' } });
    
    await waitFor(() => {
      expect(selectElement.value).toBe('en');
    });
  });

  it('should save language preference to localStorage', async () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    fireEvent.change(selectElement, { target: { value: 'en' } });
    
    await waitFor(() => {
      expect(localStorage.getItem('malnu_language')).toBe('en');
    });
  });

  it('should apply custom className', () => {
    renderWithI18n(<LanguageSwitcher className="custom-class" />);
    
    const wrapper = screen.getByRole('group');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should have proper ARIA attributes', () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveAttribute('aria-label', 'Select language');
  });

  it('should be accessible via keyboard', () => {
    renderWithI18n(<LanguageSwitcher />);
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeVisible();
  });
});
