
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import SkipLink, { SkipTarget } from '../SkipLink';

// Mock Element.scrollIntoView for all tests
const mockScrollIntoView = () => {};

describe('SkipLink', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.Element) {
      Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
        value: mockScrollIntoView,
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    cleanup();
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

   describe('Single Target (Backward Compatibility)', () => {
     beforeEach(() => {
       const mainElement = document.createElement('div');
       mainElement.id = 'main-content';
       mainElement.setAttribute('tabindex', '-1');
       document.body.appendChild(mainElement);
     });

     it('should render skip link with default props', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation', { name: 'Langsung ke konten utama' });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should focus on target element when clicked', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation', { name: 'Langsung ke konten utama' });
      const targetElement = document.getElementById('main-content') as HTMLElement;

      const focusSpy = vi.spyOn(targetElement, 'focus');
      skipLink.click();

      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
    });

    it('should prevent default anchor behavior and use smooth scroll', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation', { name: 'Langsung ke konten utama' });
      const targetElement = document.getElementById('main-content') as HTMLElement;

      const scrollIntoViewSpy = vi.spyOn(targetElement, 'scrollIntoView');
      skipLink.click();

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      scrollIntoViewSpy.mockRestore();
    });

    it('should render with custom target id', () => {
      const customElement = document.createElement('div');
      customElement.id = 'custom-target';
      document.body.appendChild(customElement);

      render(<SkipLink targetId="custom-target" />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveAttribute('href', '#custom-target');
    });

    it('should render with custom label', () => {
      render(<SkipLink label="Skip to content" />);

      const skipLink = screen.getByRole('navigation', { name: 'Skip to content' });
      expect(skipLink).toBeInTheDocument();
    });

    it('should be hidden by default', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('-translate-y-[200%]');
    });

    it('should become visible when focused', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      skipLink.focus();

      expect(skipLink).toHaveClass('focus:translate-y-0');
    });

    it('should apply custom className', () => {
      render(<SkipLink className="custom-class" />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('custom-class');
    });

    it('should have proper ARIA label', () => {
      render(<SkipLink label="Test Label" />);

      const skipLink = screen.getByRole('navigation', { name: 'Test Label' });
      expect(skipLink).toHaveAttribute('aria-label', 'Test Label');
    });

    it('should link to main content element', () => {
      render(<SkipLink targetId="main-content" />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveAttribute('href', '#main-content');

      const mainContent = document.getElementById('main-content');
      expect(mainContent).toBeInTheDocument();
    });
  });

   describe('Multiple Targets', () => {
    beforeEach(() => {
      const navElement = document.createElement('nav');
      navElement.id = 'main-nav';
      navElement.setAttribute('tabindex', '-1');
      document.body.appendChild(navElement);

      const mainElement = document.createElement('div');
      mainElement.id = 'main-content';
      mainElement.setAttribute('tabindex', '-1');
      document.body.appendChild(mainElement);

      const footerElement = document.createElement('footer');
      footerElement.id = 'footer';
      footerElement.setAttribute('tabindex', '-1');
      document.body.appendChild(footerElement);
    });

    it('should render multiple skip links', () => {
      const targets: SkipTarget[] = [
        { id: 'main-nav', label: 'Langsung ke navigasi' },
        { id: 'main-content', label: 'Langsung ke konten utama' },
        { id: 'footer', label: 'Langsung ke footer' },
      ];

      render(<SkipLink targets={targets} />);

      const nav = screen.getByRole('navigation', { name: 'Tautan navigasi cepat' });
      expect(nav).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });

    it('should focus on first target when first skip link is clicked', () => {
      const targets: SkipTarget[] = [
        { id: 'main-nav', label: 'Langsung ke navigasi' },
        { id: 'main-content', label: 'Langsung ke konten utama' },
        { id: 'footer', label: 'Langsung ke footer' },
      ];

      render(<SkipLink targets={targets} />);

      const firstLink = screen.getByRole('link', { name: 'Langsung ke navigasi' });
      const targetElement = document.getElementById('main-nav') as HTMLElement;

      const focusSpy = vi.spyOn(targetElement, 'focus');
      firstLink.click();

      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
    });

    it('should focus on second target when second skip link is clicked', () => {
      const targets: SkipTarget[] = [
        { id: 'main-nav', label: 'Langsung ke navigasi' },
        { id: 'main-content', label: 'Langsung ke konten utama' },
      ];

      render(<SkipLink targets={targets} />);

      const secondLink = screen.getByRole('link', { name: 'Langsung ke konten utama' });
      const targetElement = document.getElementById('main-content') as HTMLElement;

      const focusSpy = vi.spyOn(targetElement, 'focus');
      secondLink.click();

      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
    });

    it('should render each link with correct href', () => {
      const targets: SkipTarget[] = [
        { id: 'main-nav', label: 'Langsung ke navigasi' },
        { id: 'main-content', label: 'Langsung ke konten utama' },
      ];

      render(<SkipLink targets={targets} />);

      const firstLink = screen.getByRole('link', { name: 'Langsung ke navigasi' });
      expect(firstLink).toHaveAttribute('href', '#main-nav');

      const secondLink = screen.getByRole('link', { name: 'Langsung ke konten utama' });
      expect(secondLink).toHaveAttribute('href', '#main-content');
    });

    it('should have proper ARIA labels for each link', () => {
      const targets: SkipTarget[] = [
        { id: 'main-nav', label: 'Navigasi' },
        { id: 'main-content', label: 'Konten' },
      ];

      render(<SkipLink targets={targets} />);

      const firstLink = screen.getByRole('link', { name: 'Navigasi' });
      expect(firstLink).toHaveAttribute('aria-label', 'Navigasi');

      const secondLink = screen.getByRole('link', { name: 'Konten' });
      expect(secondLink).toHaveAttribute('aria-label', 'Konten');
    });

    it('should render in a flex container for multiple targets', () => {
      const targets: SkipTarget[] = [
        { id: 'main-nav', label: 'Navigasi' },
        { id: 'main-content', label: 'Konten' },
      ];

      render(<SkipLink targets={targets} />);

      const navs = screen.getAllByRole('navigation');
      const containerNav = navs.find(n => n.getAttribute('aria-label') === 'Tautan navigasi cepat');
      expect(containerNav).toHaveClass('flex', 'flex-col', 'gap-2');
    });
  });

  describe('Styling', () => {
    beforeEach(() => {
      const mainElement = document.createElement('div');
      mainElement.id = 'main-content';
      document.body.appendChild(mainElement);
    });

    it('should have high z-index for accessibility', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('z-[100]');
    });

    it('should have proper transition classes', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('transition-all', 'duration-200', 'ease-out');
    });

    it('should have proper positioning', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('absolute', 'top-4', 'left-4');
    });

    it('should have proper padding', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('px-4', 'py-3');
    });

    it('should have proper text styling', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('text-base', 'font-semibold');
    });

    it('should have proper rounded corners', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('rounded-lg');
    });

    it('should have focus ring styles', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });

    it('should have dark mode support', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('dark:focus:ring-offset-neutral-900');
    });

    it('should have hover effects', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('hover:bg-primary-700', 'hover:shadow-lg');
    });

    it('should have proper shadow on default', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('shadow-md');
    });

    it('should have proper focus outline removal', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('focus:outline-none');
    });

    it('should have focus-visible ring enhancement', () => {
      render(<SkipLink />);

      const skipLink = screen.getByRole('navigation');
      expect(skipLink).toHaveClass('focus-visible:ring-4', 'focus-visible:ring-primary-500/30');
    });
  });
});
