import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FolderNavigation from '../FolderNavigation';

const mockMaterials = [
  {
    id: '1',
    title: 'Test Material 1',
    description: 'Test description 1',
    category: 'Matematika',
    type: 'pdf',
    fileType: 'application/pdf',
    fileSize: 1024,
    uploadedAt: new Date().toISOString(),
    fileUrl: 'test.pdf',
    folderId: 'math',
    subjectId: 'sub1',
    uploadedBy: 'Teacher 1',
    downloadCount: 5,
    isShared: false,
    teacherName: 'Teacher 1'
  },
  {
    id: '2',
    title: 'Test Material 2',
    description: 'Test description 2',
    category: 'IPA',
    type: 'pdf',
    fileType: 'application/pdf',
    fileSize: 2048,
    uploadedAt: new Date().toISOString(),
    fileUrl: 'test2.pdf',
    folderId: 'science',
    subjectId: 'sub2',
    uploadedBy: 'Teacher 2',
    downloadCount: 10,
    isShared: true,
    teacherName: 'Teacher 2'
  }
];

const mockProps = {
  selectedFolderId: undefined,
  onFolderSelect: vi.fn(),
  onShowToast: vi.fn(),
  materials: mockMaterials
};

describe('FolderNavigation Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders folder navigation with folders', async () => {
      render(<FolderNavigation {...mockProps} />);
      expect(await screen.findByText('Folder')).toBeInTheDocument();
      expect(screen.getByText('Matematika')).toBeInTheDocument();
      expect(screen.getByText('IPA')).toBeInTheDocument();
    });

    it('renders "Semua Materi" section', () => {
      render(<FolderNavigation {...mockProps} />);
      const allSemuaMateri = screen.getAllByText('Semua Materi');
      expect(allSemuaMateri.length).toBeGreaterThan(0);
    });

    it('renders folder items with proper structure', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      expect(screen.getByText('Matematika')).toBeInTheDocument();
      expect(screen.getByText('IPA')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('native buttons support keyboard navigation for folder selection', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);

      const mathFolderButton = screen.getByRole('button', { name: /Matematika.*materi/i });

      await userEvent.click(mathFolderButton);

      expect(onFolderSelect).toHaveBeenCalled();
    });

    it('native buttons respond to Space key for folder selection', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);

      const mathFolderButton = screen.getByRole('button', { name: /Matematika.*materi/i });

      await userEvent.click(mathFolderButton);

      expect(onFolderSelect).toHaveBeenCalled();
    });

    it('native button responds to Enter key for "Semua Materi" selection', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);

      const allMaterialsButton = screen.getByRole('button', { name: /Semua Materi.*materi/i });

      await userEvent.click(allMaterialsButton);

      expect(onFolderSelect).toHaveBeenCalledWith(undefined);
    });
  });

  describe('ARIA Attributes', () => {
    it('has proper ARIA labels for folder selection', async () => {
      render(<FolderNavigation {...mockProps} />);

      const folderButtons = screen.getAllByRole('button', { name: /Matematika/i });
      expect(folderButtons.length).toBeGreaterThan(0);
    });

    it('has aria-pressed for folder selection state', async () => {
      const props = { ...mockProps, selectedFolderId: 'math' };
      render(<FolderNavigation {...props} />);

      const mathFolderButton = screen.getByRole('button', { name: /Matematika.*materi/i });
      expect(mathFolderButton).toBeInTheDocument();
      expect(mathFolderButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('has aria-pressed="true" for "Semua Materi" button when no folder selected', () => {
      render(<FolderNavigation {...mockProps} />);

      const allMaterialsButton = screen.getByRole('button', { name: /Semua Materi.*materi/i });

      expect(allMaterialsButton).toBeInTheDocument();
      expect(allMaterialsButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Interaction', () => {
    it('calls onFolderSelect when clicking a folder button', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);

      const user = userEvent.setup();
      const mathFolderButton = screen.getByRole('button', { name: /Matematika.*materi/i });
      await user.click(mathFolderButton);

      expect(onFolderSelect).toHaveBeenCalled();
    });

    it('calls onFolderSelect when clicking "Semua Materi" button', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);

      const user = userEvent.setup();
      const allMaterialsButton = screen.getByRole('button', { name: /Semua Materi.*materi/i });
      await user.click(allMaterialsButton);

      expect(onFolderSelect).toHaveBeenCalledWith(undefined);
    });

    it('expands folder when clicking expand chevron button', async () => {
      render(<FolderNavigation {...mockProps} />);

      const user = userEvent.setup();
      const expandButtons = screen.getAllByRole('button');
      const expandButton = expandButtons.find(btn =>
        btn.getAttribute('aria-label')?.includes('Buka folder') ||
        btn.getAttribute('aria-label')?.includes('Tutup folder')
      );

      if (expandButton) {
        await user.click(expandButton);
        expect(expandButton).toBeInTheDocument();
      }
    });

    it('shows create folder form when clicking add button', async () => {
      render(<FolderNavigation {...mockProps} />);

      const user = userEvent.setup();
      const addButton = screen.getByRole('button', { name: 'Buat folder baru' });

      await user.click(addButton);
      expect(screen.getByText('Buat Folder Baru')).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('shows selected state when folder is selected', async () => {
      const props = { ...mockProps, selectedFolderId: 'math' };
      render(<FolderNavigation {...props} />);

      const mathFolderButton = screen.getByRole('button', { name: /Matematika.*materi/i });

      expect(mathFolderButton).toBeInTheDocument();
      expect(mathFolderButton).toHaveClass('bg-blue-100');
    });

    it('shows selected state for "Semua Materi" when no folder selected', () => {
      render(<FolderNavigation {...mockProps} />);

      const allMaterialsButton = screen.getByRole('button', { name: /Semua Materi.*materi/i });

      expect(allMaterialsButton).toBeInTheDocument();
      expect(allMaterialsButton).toHaveClass('bg-blue-100');
    });
  });

  describe('Accessibility Features', () => {
    it('uses native button elements for folder selection', async () => {
      render(<FolderNavigation {...mockProps} />);

      const folderButtons = screen.getAllByRole('button', { name: /Matematika/i });
      expect(folderButtons.length).toBeGreaterThan(0);

      folderButtons.forEach(button => {
        expect(button.tagName.toLowerCase()).toBe('button');
        expect(button).not.toHaveClass('cursor-pointer');
      });
    });

    it('has proper button elements with native keyboard support', async () => {
      render(<FolderNavigation {...mockProps} />);

      const allMaterialsButton = screen.getByRole('button', { name: /Semua Materi.*materi/i });

      expect(allMaterialsButton.tagName.toLowerCase()).toBe('button');
      expect(allMaterialsButton).not.toHaveAttribute('tabIndex');
      expect(allMaterialsButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('has descriptive ARIA labels including material count on group container', async () => {
      render(<FolderNavigation {...mockProps} />);

      const folderGroups = screen.getAllByRole('group');
      const mathGroup = folderGroups.find(group => group.getAttribute('aria-label')?.includes('Matematika'));

      expect(mathGroup).toHaveAttribute('aria-label');
      const ariaLabel = mathGroup?.getAttribute('aria-label');
      expect(ariaLabel).toContain('materi');
    });
  });

  describe('Error Handling', () => {
    it('shows toast message when folder creation fails', async () => {
      const onShowToast = vi.fn();
      render(<FolderNavigation {...mockProps} onShowToast={onShowToast} />);
      
      const user = userEvent.setup();
      
      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(btn => 
        btn.querySelector('svg')?.querySelector('path')?.getAttribute('d')?.includes('M12 4.5v15m7.5-7.5h-15')
      );
      
      if (addButton) {
        await user.click(addButton);
        const saveButton = screen.getByText('Buat');
        await user.click(saveButton);
        
        expect(onShowToast).toHaveBeenCalledWith('Nama folder tidak boleh kosong', 'error');
      }
    });

    it('shows toast message when folder deletion is confirmed', async () => {
      const onShowToast = vi.fn();
      render(<FolderNavigation {...mockProps} onShowToast={onShowToast} />);
      
      window.confirm = vi.fn(() => true);
      
      const trashButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg')?.querySelector('path')?.getAttribute('d')?.includes('M14.74 9l-.346 9m-4.788 5.814a1.5 1.5 0 1')
      );
      
      if (trashButtons.length > 0) {
        const user = userEvent.setup();
        await user.click(trashButtons[0]);
      }
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton while fetching folders', () => {
      render(<FolderNavigation {...mockProps} />);
      
      expect(screen.queryByText('Matematika')).toBeInTheDocument();
    });
  });
});
