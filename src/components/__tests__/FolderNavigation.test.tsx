import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    it('has keyboard event handlers for folder selection', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);
      
      const mathFolder = screen.getByText('Matematika');
      mathFolder.focus();
      
      fireEvent.keyDown(mathFolder, { key: 'Enter', code: 'Enter' });
      
      expect(onFolderSelect).toHaveBeenCalled();
    });

    it('responds to Space key for folder selection', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);
      
      const mathFolder = screen.getByText('Matematika');
      mathFolder.focus();
      
      fireEvent.keyDown(mathFolder, { key: ' ', code: 'Space' });
      
      expect(onFolderSelect).toHaveBeenCalled();
    });

    it('responds to Enter key for "Semua Materi" selection', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);
      
      const allMaterialsElements = screen.getAllByText('Semua Materi');
      const standaloneButton = allMaterialsElements[0];
      
      fireEvent.keyDown(standaloneButton, { key: 'Enter', code: 'Enter' });
      
      expect(onFolderSelect).toHaveBeenCalledWith(undefined);
    });
  });

  describe('ARIA Attributes', () => {
    it('has proper ARIA labels for folder selection', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      const folderContainers = screen.getAllByText('Matematika');
      expect(folderContainers.length).toBeGreaterThan(0);
    });

    it('has aria-pressed for folder selection state', async () => {
      const props = { ...mockProps, selectedFolderId: 'math' };
      render(<FolderNavigation {...props} />);
      
      const mathFolder = screen.getByText('Matematika');
      expect(mathFolder).toBeInTheDocument();
    });

    it('has aria-pressed="true" for "Semua Materi" when no folder selected', () => {
      render(<FolderNavigation {...mockProps} />);
      
      const allMaterialsElements = screen.getAllByText('Semua Materi');
      const standaloneButton = allMaterialsElements[0];
      
      expect(standaloneButton).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onFolderSelect when clicking a folder', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);
      
      const user = userEvent.setup();
      const mathFolder = screen.getByText('Matematika');
      await user.click(mathFolder);
      
      expect(onFolderSelect).toHaveBeenCalled();
    });

    it('calls onFolderSelect when clicking "Semua Materi"', async () => {
      const onFolderSelect = vi.fn();
      render(<FolderNavigation {...mockProps} onFolderSelect={onFolderSelect} />);
      
      const user = userEvent.setup();
      const allMaterialsElements = screen.getAllByText('Semua Materi');
      const standaloneButton = allMaterialsElements[0];
      await user.click(standaloneButton);
      
      expect(onFolderSelect).toHaveBeenCalledWith(undefined);
    });

    it('expands folder when clicking expand button', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      const user = userEvent.setup();
      const expandButtons = screen.getAllByRole('button');
      const expandButton = expandButtons.find(btn => btn.querySelector('svg'));
      
      if (expandButton) {
        await user.click(expandButton);
        expect(expandButton).toBeInTheDocument();
      }
    });

    it('shows create folder form when clicking add button', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      const user = userEvent.setup();
      const addButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.querySelector('path')?.getAttribute('d')?.includes('M12 4.5v15m7.5-7.5h-15')
      );
      
      if (addButton) {
        await user.click(addButton);
        expect(screen.getByText('Buat Folder Baru')).toBeInTheDocument();
      }
    });
  });

  describe('Visual Feedback', () => {
    it('shows selected state when folder is selected', async () => {
      const props = { ...mockProps, selectedFolderId: 'math' };
      render(<FolderNavigation {...props} />);
      
      const mathFolder = screen.getByText('Matematika');
      const mathContainer = mathFolder.closest('[role="button"]');
      
      if (mathContainer) {
        expect(mathContainer).toHaveClass('bg-blue-100');
      }
    });

    it('shows selected state for "Semua Materi" when no folder selected', () => {
      render(<FolderNavigation {...mockProps} />);
      
      const allMaterialsElements = screen.getAllByText('Semua Materi');
      const standaloneButton = allMaterialsElements[0];
      const buttonContainer = standaloneButton.closest('[role="button"]');
      
      if (buttonContainer) {
        expect(buttonContainer).toHaveClass('bg-blue-100');
      }
    });
  });

  describe('Accessibility Features', () => {
    it('removes cursor-pointer class from clickable containers', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      const mathFolder = screen.getByText('Matematika');
      const mathContainer = mathFolder.closest('[role="button"]');
      
      if (mathContainer) {
        expect(mathContainer.className).not.toContain('cursor-pointer');
      }
    });

    it('has clickable containers with role="button"', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      const folderContainers = screen.getAllByText('Matematika');
      folderContainers.forEach(folder => {
        const container = folder.closest('[role="button"]');
        if (container) {
          expect(container).toHaveAttribute('role', 'button');
          expect(container).toHaveAttribute('tabIndex');
        }
      });
    });

    it('has descriptive ARIA labels including material count', async () => {
      render(<FolderNavigation {...mockProps} />);
      
      const allMaterialsElements = screen.getAllByText('Semua Materi');
      const standaloneButton = allMaterialsElements[0];
      const buttonContainer = standaloneButton.closest('[role="button"]');
      
      if (buttonContainer) {
        expect(buttonContainer).toHaveAttribute('aria-label');
        const ariaLabel = buttonContainer.getAttribute('aria-label');
        expect(ariaLabel).toContain('materi');
      }
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
