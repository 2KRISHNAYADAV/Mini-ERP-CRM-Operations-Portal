import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner = ({ text = 'Loading...', fullPage = false }: LoadingSpinnerProps) => {
  if (fullPage) {
    return (
      <div className="loading-full">
        <div className="spinner" />
        <span className="loading-text">{text}</span>
      </div>
    );
  }
  return (
    <div className="loading-inline">
      <div className="spinner spinner-sm" />
      <span className="loading-text">{text}</span>
    </div>
  );
};
