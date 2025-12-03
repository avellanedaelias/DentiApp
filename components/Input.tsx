import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="input-icon">
            {icon}
          </div>
        )}
        <input
          className={`input-base ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};