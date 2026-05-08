import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative inline-flex items-center w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        border: isDark
          ? '1px solid rgba(148,163,184,0.15)'
          : '1px solid rgba(59,130,246,0.25)',
        boxShadow: isDark
          ? 'inset 0 1px 3px rgba(0,0,0,0.3)'
          : 'inset 0 1px 3px rgba(59,130,246,0.15)',
      }}
    >
      {/* Background icons */}
      <Sun
        size={11}
        className="absolute left-1.5 transition-opacity duration-300"
        style={{
          color: '#f59e0b',
          opacity: isDark ? 0.4 : 0,
        }}
      />
      <Moon
        size={11}
        className="absolute right-1.5 transition-opacity duration-300"
        style={{
          color: '#cbd5e1',
          opacity: isDark ? 0 : 0.5,
        }}
      />

      {/* Sliding knob */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          left: isDark ? 'calc(100% - 1.625rem)' : '0.125rem',
          background: isDark
            ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
          boxShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(99,102,241,0.2)'
            : '0 2px 8px rgba(245,158,11,0.3), 0 0 12px rgba(251,191,36,0.3)',
        }}
      >
        {isDark ? (
          <Moon size={12} style={{ color: '#e0e7ff' }} className="fill-current" />
        ) : (
          <Sun size={12} style={{ color: '#f59e0b' }} className="fill-current" />
        )}
      </span>
    </button>
  );
};