import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'Try adding a new entry or adjusting filters.',
}: EmptyStateProps) => (
  <div className="empty-state">
    {Icon && <Icon size={40} className="empty-state-icon" />}
    <p className="empty-state-title">{title}</p>
    <p className="empty-state-desc">{description}</p>
  </div>
);
