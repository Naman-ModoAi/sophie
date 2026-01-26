import React from 'react';

interface SyncIconProps {
  className?: string;
}

export const SyncIcon: React.FC<SyncIconProps> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.5 2v6h-6" />
      <path d="M2.5 22v-6h6" />
      <path d="M2 11.5a10 10 0 0 1 18.8-4.3" />
      <path d="M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
};
