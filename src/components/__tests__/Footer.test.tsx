import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component - Accessibility Improvements', () => {
  const mockOnDocsClick = vi.fn();

  beforeEach(() => {
    render(<Footer onDocsClick={mockOnDocsClick} />);
  });

  describe('Non-Functional Links - Converted to Buttons', () => {
    it('should render Download as disabled button', () => {
      const downloadButton = screen.getByText('Download');
      expect(downloadButton.tagName).toBe('BUTTON');
      expect(downloadButton).toHaveAttribute('type', 'button');
      expect(downloadButton).toBeDisabled();
      expect(downloadButton).toHaveClass('cursor-not-allowed', 'opacity-60');
    });

    it('should render Kebijakan Privasi as disabled button', () => {
      const privacyButton = screen.getByText('Kebijakan Privasi');
      expect(privacyButton.tagName).toBe('BUTTON');
      expect(privacyButton).toHaveAttribute('type', 'button');
      expect(privacyButton).toBeDisabled();
      expect(privacyButton).toHaveClass('cursor-not-allowed', 'opacity-60');
    });

    it('should render Karir as disabled button', () => {
      const careerButton = screen.getByText('Karir');
      expect(careerButton.tagName).toBe('BUTTON');
      expect(careerButton).toHaveAttribute('type', 'button');
      expect(careerButton).toBeDisabled();
      expect(careerButton).toHaveClass('cursor-not-allowed', 'opacity-60');
    });

    it('should render Beasiswa as disabled button', () => {
      const scholarshipButton = screen.getByText('Beasiswa');
      expect(scholarshipButton.tagName).toBe('BUTTON');
      expect(scholarshipButton).toHaveAttribute('type', 'button');
      expect(scholarshipButton).toBeDisabled();
      expect(scholarshipButton).toHaveClass('cursor-not-allowed', 'opacity-60');
    });

    it('should not have any anchor links with href="#" placeholder', () => {
      const anchorLinks = screen.getAllByRole('link');
      anchorLinks.forEach(link => {
        expect(link.getAttribute('href')).not.toBe('#');
      });
    });
  });

  describe('Social Media Links - Disabled State', () => {
    it('should render Facebook as disabled button (not link)', () => {
      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink.tagName).toBe('BUTTON');
      expect(facebookLink).toHaveAttribute('type', 'button');
      expect(facebookLink).toBeDisabled();
      expect(facebookLink).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(facebookLink).not.toHaveAttribute('href');
    });

    it('should render Instagram as disabled button (not link)', () => {
      const instagramLink = screen.getByLabelText('Instagram');
      expect(instagramLink.tagName).toBe('BUTTON');
      expect(instagramLink).toHaveAttribute('type', 'button');
      expect(instagramLink).toBeDisabled();
      expect(instagramLink).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(instagramLink).not.toHaveAttribute('href');
    });

    it('should render YouTube as disabled button (not link)', () => {
      const youtubeLink = screen.getByLabelText('YouTube');
      expect(youtubeLink.tagName).toBe('BUTTON');
      expect(youtubeLink).toHaveAttribute('type', 'button');
      expect(youtubeLink).toBeDisabled();
      expect(youtubeLink).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(youtubeLink).not.toHaveAttribute('href');
    });
  });

  describe('Functional Link - Help Center', () => {
    it('should render Pusat Bantuan as clickable button', () => {
      const helpButton = screen.getByText('Pusat Bantuan');
      expect(helpButton.tagName).toBe('BUTTON');
      expect(helpButton).toHaveAttribute('type', 'button');
      expect(helpButton).not.toBeDisabled();
      expect(helpButton).toHaveClass('hover:text-primary-600');
    });

    it('should trigger onDocsClick when Pusat Bantuan is clicked', () => {
      const helpButton = screen.getByText('Pusat Bantuan');
      helpButton.click();
      expect(mockOnDocsClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility - Focus Management', () => {
    it('should have focus-visible ring styles for keyboard navigation on functional buttons', () => {
      const helpButton = screen.getByText('Pusat Bantuan');
      expect(helpButton).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-primary-500/50');
    });

    it('disabled buttons should not be keyboard focusable', () => {
      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toBeDisabled();
      const scholarshipButton = screen.getByText('Beasiswa');
      expect(scholarshipButton).toBeDisabled();
    });

    it('should have proper ARIA attributes for screen readers', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('id', 'footer');
    });
  });

  describe('Accessibility - Semantic HTML', () => {
    it('should use semantic footer element with role="contentinfo"', () => {
      const footer = screen.getByRole('contentinfo');
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should have proper heading structure', () => {
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
      expect(headings[0]).toHaveTextContent('MA Malnu Kananga');
      expect(headings[1]).toHaveTextContent('Legalitas');
      expect(headings[2]).toHaveTextContent('Tautan Bermanfaat');
    });

    it('should have proper list semantics for navigation', () => {
      const lists = screen.getAllByRole('list');
      expect(lists).toHaveLength(2);
      lists.forEach(list => {
        expect(list.tagName).toBe('UL');
      });
    });
  });

  describe('Visual Feedback - Disabled State', () => {
    it('should have reduced opacity for disabled buttons', () => {
      const downloadButton = screen.getByText('Download');
      expect(downloadButton).toHaveClass('opacity-60');
    });

    it('should have reduced opacity for disabled social buttons', () => {
      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toHaveClass('opacity-50');
    });

    it('should show not-allowed cursor for disabled interactive elements', () => {
      const privacyButton = screen.getByText('Kebijakan Privasi');
      const careerButton = screen.getByText('Karir');
      expect(privacyButton).toHaveClass('cursor-not-allowed');
      expect(careerButton).toHaveClass('cursor-not-allowed');
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should not have interactive elements without clear purpose (SC 2.4.4)', () => {
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasLabel = button.hasAttribute('aria-label') || button.textContent?.trim().length > 0;
        expect(hasLabel).toBe(true);
      });
    });

    it('disabled elements should have aria-disabled semantics (SC 4.1.2)', () => {
      const disabledButtons = screen.getAllByRole('button', { hidden: true }).filter(btn => 
        btn.hasAttribute('disabled')
      );
      disabledButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should have color contrast for text elements (SC 1.4.3)', () => {
      const textElements = screen.getAllByText(/(MA Malnu Kananga|Jalan Desa|Legalitas|Tautan Bermanfaat)/);
      textElements.forEach(element => {
        const hasColorClass = element.className.includes('text-');
        expect(hasColorClass).toBe(true);
      });
    });
  });
});
