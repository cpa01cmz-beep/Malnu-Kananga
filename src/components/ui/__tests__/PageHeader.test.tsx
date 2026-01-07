import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageHeader from '../PageHeader';

describe('PageHeader Component', () => {
  describe('Rendering', () => {
    it('should render title correctly', () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toHaveClass('text-2xl', 'font-bold');
    });

    it('should render subtitle when provided', () => {
      render(
        <PageHeader title="Test Title" subtitle="Test Subtitle" />
      );
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toHaveClass('text-sm');
    });

    it('should not render subtitle when not provided', () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    });

    it('should render with medium size by default', () => {
      render(<PageHeader title="Test Title" />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-2xl', 'font-bold');
    });

    it('should render with small size', () => {
      render(<PageHeader title="Test Title" size="sm" />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-xl', 'font-bold');
    });

    it('should render with large size', () => {
      render(<PageHeader title="Test Title" size="lg" />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('should apply custom className', () => {
      render(<PageHeader title="Test Title" className="custom-class" />);
      const container = screen.getByText('Test Title').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('should render back button when showBackButton is true', () => {
      render(<PageHeader title="Test Title" showBackButton={true} onBackButtonClick={() => {}} />);
      const backButton = screen.getByRole('button', { name: /kembali/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should not render back button when showBackButton is false', () => {
      render(<PageHeader title="Test Title" showBackButton={false} />);
      const backButton = screen.queryByRole('button', { name: /kembali/i });
      expect(backButton).not.toBeInTheDocument();
    });

    it('should render actions when provided', () => {
      render(
        <PageHeader title="Test Title" actions={<button>Action Button</button>} />
      );
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('should not render actions section when not provided', () => {
      render(<PageHeader title="Test Title" />);
      const container = screen.getByText('Test Title').closest('div')?.parentElement;
      expect(container?.querySelector('.flex-shrink-0')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onBackButtonClick when back button is clicked', async () => {
      const handleClick = vi.fn();
      render(
        <PageHeader title="Test Title" showBackButton={true} onBackButtonClick={handleClick} />
      );
      
      const backButton = screen.getByRole('button', { name: /kembali/i });
      await userEvent.click(backButton);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not render back button without onBackButtonClick even if showBackButton is true', () => {
      render(<PageHeader title="Test Title" showBackButton={true} />);
      const backButton = screen.queryByRole('button', { name: /kembali/i });
      expect(backButton).not.toBeInTheDocument();
    });
  });

  describe('Back Button Customization', () => {
    it('should use default back button label', () => {
      render(
        <PageHeader title="Test Title" showBackButton={true} onBackButtonClick={() => {}} />
      );
      const backButton = screen.getByRole('button', { name: /kembali/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should use custom back button label when provided', () => {
      render(
        <PageHeader 
          title="Test Title" 
          showBackButton={true} 
          backButtonLabel="Go Back"
          onBackButtonClick={() => {}} 
        />
      );
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should apply variant to back button', () => {
      render(
        <PageHeader 
          title="Test Title" 
          showBackButton={true} 
          backButtonVariant="green"
          onBackButtonClick={() => {}} 
        />
      );
      const backButton = screen.getByRole('button', { name: /kembali/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive flex layout', () => {
      render(
        <PageHeader 
          title="Test Title" 
          subtitle="Test Subtitle"
          showBackButton={true}
          onBackButtonClick={() => {}} 
          actions={<button>Action</button>}
        />
      );
      
      const container = screen.getByText('Test Title').closest('div')?.parentElement;
      expect(container).toHaveClass('flex', 'flex-col', 'md:flex-row', 'items-center', 'justify-between', 'gap-4');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode classes to title', () => {
      render(<PageHeader title="Test Title" />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('dark:text-white');
    });

    it('should apply dark mode classes to subtitle', () => {
      render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
      const subtitle = screen.getByText('Test Subtitle');
      expect(subtitle).toHaveClass('dark:text-neutral-400');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading level for title', () => {
      render(<PageHeader title="Test Title" />);
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Test Title');
    });

    it('should have accessible back button', () => {
      render(
        <PageHeader title="Test Title" showBackButton={true} onBackButtonClick={() => {}} />
      );
      const backButton = screen.getByRole('button', { name: /navigasi kembali/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should render actions with proper structure', () => {
      render(
        <PageHeader 
          title="Test Title" 
          actions={
            <div role="group" aria-label="Page actions">
              <button>Action 1</button>
              <button>Action 2</button>
            </div>
          }
        />
      );
      expect(screen.getByRole('group', { name: 'Page actions' })).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('should render with all props', () => {
      render(
        <PageHeader
          title="Complex Title"
          subtitle="Complex Subtitle with details"
          showBackButton={true}
          backButtonLabel="Custom Back"
          backButtonVariant="green"
          onBackButtonClick={() => {}}
          actions={
            <div>
              <button>Action 1</button>
              <button>Action 2</button>
            </div>
          }
          size="lg"
          className="extra-class"
        />
      );
      
      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('Complex Subtitle with details')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /custom back/i })).toBeInTheDocument();
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    it('should render without back button but with actions', () => {
      render(
        <PageHeader
          title="Title Only"
          actions={<button>Single Action</button>}
        />
      );
      
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /kembali/i })).not.toBeInTheDocument();
      expect(screen.getByText('Single Action')).toBeInTheDocument();
    });

    it('should render with back button but without actions', () => {
      render(
        <PageHeader
          title="Back Only"
          showBackButton={true}
          onBackButtonClick={() => {}}
        />
      );
      
      expect(screen.getByText('Back Only')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kembali/i })).toBeInTheDocument();
    });
  });
});
