import React, { forwardRef, ReactNode } from 'react';

export type TableSize = 'sm' | 'md' | 'lg';
export type TableVariant = 'default' | 'striped' | 'bordered' | 'simple';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> { // eslint-disable-line no-undef
  children: ReactNode;
  size?: TableSize;
  variant?: TableVariant;
  caption?: string;
  description?: string;
  ariaLabel?: string;
}

interface TheadProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

interface TbodyProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

interface TfootProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> { // eslint-disable-line no-undef
  children: ReactNode;
  hoverable?: boolean;
  selected?: boolean;
}

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> { // eslint-disable-line no-undef
  children: ReactNode;
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc';
}

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> { // eslint-disable-line no-undef
  children: ReactNode;
}

const sizeClasses: Record<TableSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const variantClasses: Record<TableVariant, string> = {
  default: 'divide-y divide-neutral-200 dark:divide-neutral-700',
  striped: 'divide-y divide-neutral-200 dark:divide-neutral-700',
  bordered: 'divide-y divide-neutral-200 dark:divide-neutral-700 border-x border-neutral-200 dark:border-neutral-700',
  simple: '',
};

const Table = forwardRef<HTMLTableElement, TableProps>( // eslint-disable-line no-undef
  (
    {
      children,
      size = 'md',
      variant = 'default',
      caption,
      description,
      ariaLabel,
      className = '',
      ...props
    },
    ref
  ) => {
    const classes = `
      w-full text-left ${sizeClasses[size]} text-neutral-600 dark:text-neutral-300
      ${variantClasses[variant]}
      ${className}
    `.replace(/\s+/g, ' ').trim();

    const descriptionId = description ? `table-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;

    return (
      <table
        ref={ref}
        className={classes}
        role="table"
        aria-label={ariaLabel || caption}
        aria-describedby={descriptionId}
        {...props}
      >
        {caption && (
          <caption className="sr-only">
            {caption}
            {description && descriptionId && (
              <span id={descriptionId} className="sr-only">
                {description}
              </span>
            )}
          </caption>
        )}
        {children}
      </table>
    );
  }
);

Table.displayName = 'Table';

const Thead: React.FC<TheadProps> = ({ children, className = '', ...props }) => {
  return (
    <thead
      className={`
        bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold
        text-neutral-500 dark:text-neutral-400
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {children}
    </thead>
  );
};

const Tbody: React.FC<TbodyProps> = ({ children, className = '', ...props }) => {
  return (
    <tbody
      className={className}
      role="rowgroup"
      {...props}
    >
      {children}
    </tbody>
  );
};

const Tfoot: React.FC<TfootProps> = ({ children, className = '', ...props }) => {
  return (
    <tfoot
      className={`
        bg-neutral-50 dark:bg-neutral-700 text-xs uppercase font-semibold
        text-neutral-500 dark:text-neutral-400 border-t-2 border-neutral-200 dark:border-neutral-700
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      role="rowgroup"
      {...props}
    >
      {children}
    </tfoot>
  );
};

const Tr: React.FC<TrProps> = ({ children, hoverable = true, selected = false, className = '', ...props }) => {
  const classes = `
    ${hoverable ? 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors' : ''}
    ${selected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <tr
      className={classes}
      role="row"
      aria-selected={selected}
      {...props}
    >
      {children}
    </tr>
  );
};

const Th: React.FC<ThProps> = ({ children, scope = 'col', sortable = false, sortDirection, className = '', ...props }) => {
  const classes = `
    px-6 py-4
    text-left
    ${sortable ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600 select-none' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const sortIcon = sortable && sortDirection ? (
    <svg className="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  ) : null;

  return (
    <th
      className={classes}
      scope={scope}
      aria-sort={sortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined}
      {...props}
    >
      <div className="flex items-center">
        {children}
        {sortIcon}
      </div>
    </th>
  );
};

const Td: React.FC<TdProps> = ({ children, className = '', ...props }) => {
  const classes = `
    px-6 py-4
    text-left
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <td
      className={classes}
      role="cell"
      {...props}
    >
      {children}
    </td>
  );
};

export { Table, Thead, Tbody, Tfoot, Tr, Th, Td };
export default Table;
