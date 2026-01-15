
interface BellSlashIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const BellSlashIcon: React.FC<BellSlashIconProps> = ({
  className = '',
  width = 24,
  height = 24,
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.143 17.082a24.255 24.255 0 005.714 0M9.143 17.082a24.255 24.255 0 01-5.714 0M15 5.25a8.987 8.987 0 011.335 6.364M9.348 5.25a8.987 8.987 0 00-1.335 6.364M9.75 5.25a8.967 8.967 0 00-2.312 6.022M15.75 5.25a8.967 8.967 0 012.312 6.022M4.5 19.5h15M4.5 4.5L19.5 19.5"
    />
  </svg>
);