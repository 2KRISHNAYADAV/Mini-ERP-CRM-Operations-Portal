import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);
