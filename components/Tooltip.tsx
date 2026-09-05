"use client";

import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({ text, children, className = '' }: TooltipProps) {
  return (
    <span className={`tooltip-anchor ${className}`} tabIndex={0} aria-label={text}>
      {children}
      <span className="tooltip-content" role="tooltip">{text}</span>
    </span>
  );
}
