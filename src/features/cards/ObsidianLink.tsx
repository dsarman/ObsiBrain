import * as React from 'react';

interface Props {
  label: string;
  filePath: string;
  className?: string;
}

export const ObsidianLink = ({ label, filePath, className }: Props) => (
  <a
    aria-label={filePath}
    data-href={filePath}
    href={filePath}
    target="_blank"
    rel="noopener"
    className={`internal-link${className ? ` ${className}` : ''}`}
  >
    {label}
  </a>
);
