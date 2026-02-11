/**
 * Enhanced Skeleton Loading System
 * Provides beautiful, accessible skeleton screens for better perceived performance
 */

export const SKELETON_LOADING = `
/* Base Skeleton Animation */
@keyframes skeletonShimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes skeletonPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Skeleton Base Styles */
.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%,
    #f3f4f6 100%
  );
  background-size: 200px 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
  border-radius: 0.375rem;
  position: relative;
  overflow: hidden;
}

.skeleton.pulse {
  animation: skeletonPulse 2s ease-in-out infinite;
  background: #e5e7eb;
}

/* Skeleton Text Variants */
.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
}

.skeleton-text-xs {
  height: 0.75rem;
  width: 60%;
}

.skeleton-text-sm {
  height: 0.875rem;
  width: 80%;
}

.skeleton-text-base {
  height: 1rem;
  width: 100%;
}

.skeleton-text-lg {
  height: 1.125rem;
  width: 90%;
}

.skeleton-text-xl {
  height: 1.25rem;
  width: 85%;
}

.skeleton-text-2xl {
  height: 1.5rem;
  width: 75%;
}

/* Skeleton Title Variants */
.skeleton-title {
  height: 1.5rem;
  width: 70%;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
}

.skeleton-title-sm {
  height: 1.25rem;
  width: 60%;
}

.skeleton-title-lg {
  height: 1.75rem;
  width: 80%;
}

.skeleton-title-xl {
  height: 2rem;
  width: 75%;
}

/* Skeleton Avatar */
.skeleton-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%,
    #f3f4f6 100%
  );
  background-size: 200px 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}

.skeleton-avatar-xs {
  width: 1.5rem;
  height: 1.5rem;
}

.skeleton-avatar-sm {
  width: 2rem;
  height: 2rem;
}

.skeleton-avatar-lg {
  width: 3rem;
  height: 3rem;
}

.skeleton-avatar-xl {
  width: 4rem;
  height: 4rem;
}

/* Skeleton Button */
.skeleton-button {
  height: 2.5rem;
  width: 6rem;
  border-radius: 0.5rem;
}

.skeleton-button-sm {
  height: 2rem;
  width: 5rem;
}

.skeleton-button-lg {
  height: 3rem;
  width: 8rem;
}

/* Skeleton Input */
.skeleton-input {
  height: 2.5rem;
  width: 100%;
  border-radius: 0.5rem;
}

.skeleton-input-sm {
  height: 2rem;
}

.skeleton-input-lg {
  height: 3rem;
}

/* Skeleton Card */
.skeleton-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #f3f4f6;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.skeleton-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

/* Skeleton List */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #f3f4f6;
}

.skeleton-list-item-avatar {
  flex-shrink: 0;
}

.skeleton-list-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skeleton-list-item-action {
  flex-shrink: 0;
}

/* Skeleton Table */
.skeleton-table {
  width: 100%;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

.skeleton-table-header {
  display: flex;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  gap: 1rem;
}

.skeleton-table-row {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  gap: 1rem;
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-table-cell {
  flex: 1;
}

/* Skeleton Grid */
.skeleton-grid {
  display: grid;
  gap: 1rem;
}

.skeleton-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.skeleton-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.skeleton-grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .skeleton-grid-2,
  .skeleton-grid-3,
  .skeleton-grid-4 {
    grid-template-columns: 1fr;
  }
}

/* Skeleton Chart */
.skeleton-chart {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #f3f4f6;
  min-height: 300px;
}

.skeleton-chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  margin-top: 1rem;
  gap: 0.5rem;
}

.skeleton-chart-bar {
  flex: 1;
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%,
    #f3f4f6 100%
  );
  background-size: 200px 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
  border-radius: 0.25rem 0.25rem 0 0;
}

/* Skeleton Sidebar */
.skeleton-sidebar {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #f3f4f6;
  min-height: 400px;
}

.skeleton-sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
}

/* Skeleton Form */
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-form-label {
  height: 1rem;
  width: 30%;
}

.skeleton-form-field {
  height: 2.5rem;
  width: 100%;
}

.skeleton-form-help {
  height: 0.875rem;
  width: 60%;
}

/* Skeleton Modal */
.skeleton-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #f3f4f6;
  max-width: 500px;
  width: 100%;
}

.skeleton-modal-header {
  margin-bottom: 1.5rem;
}

.skeleton-modal-body {
  margin-bottom: 1.5rem;
}

.skeleton-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Skeleton Tabs */
.skeleton-tabs {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.skeleton-tab {
  height: 2.5rem;
  width: 6rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

/* Skeleton Badge */
.skeleton-badge {
  height: 1.25rem;
  width: 3rem;
  border-radius: 9999px;
}

.skeleton-badge-sm {
  height: 1rem;
  width: 2.5rem;
}

.skeleton-badge-lg {
  height: 1.5rem;
  width: 3.5rem;
}

/* Skeleton Progress */
.skeleton-progress {
  height: 0.5rem;
  width: 100%;
  border-radius: 9999px;
  background: #f3f4f6;
}

.skeleton-progress-bar {
  height: 100%;
  width: 60%;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%,
    #f3f4f6 100%
  );
  background-size: 200px 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}

/* Responsive Skeleton Adjustments */
@media (max-width: 768px) {
  .skeleton-card {
    padding: 1rem;
  }
  
  .skeleton-modal {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .skeleton-chart {
    padding: 1rem;
    min-height: 250px;
  }
}

/* Accessibility */
.skeleton[aria-hidden="true"] {
  visibility: hidden;
}

.skeleton[aria-busy="true"] {
  animation: skeletonPulse 2s ease-in-out infinite;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background: linear-gradient(
      90deg,
      #374151 0%,
      #4b5563 25%,
      #374151 50%,
      #4b5563 75%,
      #374151 100%
    );
  }
  
  .skeleton-card,
  .skeleton-table,
  .skeleton-chart,
  .skeleton-sidebar,
  .skeleton-modal {
    background: #1f2937;
    border-color: #374151;
  }
  
  .skeleton-table-header {
    background: #374151;
    border-color: #4b5563;
  }
  
  .skeleton-table-row {
    border-color: #374151;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: #e5e7eb;
  }
  
  @media (prefers-color-scheme: dark) {
    .skeleton {
      background: #4b5563;
    }
  }
}
`;

export const SKELETON_COMPONENTS = {
  // Text skeletons
  text: 'skeleton skeleton-text',
  textXs: 'skeleton skeleton-text-xs',
  textSm: 'skeleton skeleton-text-sm',
  textBase: 'skeleton skeleton-text-base',
  textLg: 'skeleton skeleton-text-lg',
  textXl: 'skeleton skeleton-text-xl',
  text2xl: 'skeleton skeleton-text-2xl',
  
  // Title skeletons
  title: 'skeleton skeleton-title',
  titleSm: 'skeleton skeleton-title-sm',
  titleLg: 'skeleton skeleton-title-lg',
  titleXl: 'skeleton skeleton-title-xl',
  
  // Avatar skeletons
  avatar: 'skeleton-avatar',
  avatarXs: 'skeleton-avatar-xs',
  avatarSm: 'skeleton-avatar-sm',
  avatarLg: 'skeleton-avatar-lg',
  avatarXl: 'skeleton-avatar-xl',
  
  // Button skeletons
  button: 'skeleton skeleton-button',
  buttonSm: 'skeleton skeleton-button-sm',
  buttonLg: 'skeleton skeleton-button-lg',
  
  // Input skeletons
  input: 'skeleton skeleton-input',
  inputSm: 'skeleton skeleton-input-sm',
  inputLg: 'skeleton skeleton-input-lg',
  
  // Card skeletons
  card: 'skeleton-card',
  cardHeader: 'skeleton-card-header',
  cardContent: 'skeleton-card-content',
  cardFooter: 'skeleton-card-footer',
  
  // List skeletons
  list: 'skeleton-list',
  listItem: 'skeleton-list-item',
  listItemAvatar: 'skeleton-list-item-avatar',
  listItemContent: 'skeleton-list-item-content',
  listItemAction: 'skeleton-list-item-action',
  
  // Table skeletons
  table: 'skeleton-table',
  tableHeader: 'skeleton-table-header',
  tableRow: 'skeleton-table-row',
  tableCell: 'skeleton-table-cell',
  
  // Grid skeletons
  grid: 'skeleton-grid',
  grid2: 'skeleton-grid skeleton-grid-2',
  grid3: 'skeleton-grid skeleton-grid-3',
  grid4: 'skeleton-grid skeleton-grid-4',
  
  // Chart skeletons
  chart: 'skeleton-chart',
  chartBars: 'skeleton-chart-bars',
  chartBar: 'skeleton-chart-bar',
  
  // Form skeletons
  form: 'skeleton-form',
  formGroup: 'skeleton-form-group',
  formLabel: 'skeleton-form-label',
  formField: 'skeleton-form-field',
  formHelp: 'skeleton-form-help',
  
  // Modal skeletons
  modal: 'skeleton-modal',
  modalHeader: 'skeleton-modal-header',
  modalBody: 'skeleton-modal-body',
  modalFooter: 'skeleton-modal-footer',
  
  // Tab skeletons
  tabs: 'skeleton-tabs',
  tab: 'skeleton-tab',
  
  // Badge skeletons
  badge: 'skeleton-badge',
  badgeSm: 'skeleton-badge-sm',
  badgeLg: 'skeleton-badge-lg',
  
  // Progress skeletons
  progress: 'skeleton-progress',
  progressBar: 'skeleton-progress-bar',
} as const;

export const getSkeletonClasses = (type: string) => {
  return SKELETON_COMPONENTS[type as keyof typeof SKELETON_COMPONENTS] || 'skeleton';
};

export default SKELETON_LOADING;