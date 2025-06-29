
import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function Link({ href, children, className, target, rel }: LinkProps) {
  return (
    <a href={href} className={className} target={target} rel={rel}>
      {children}
    </a>
  );
}
