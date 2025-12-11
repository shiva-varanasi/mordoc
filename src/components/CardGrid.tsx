import React from 'react';

interface CardGridProps {
  cols?: number;
  children: React.ReactNode;
}

export function CardGrid({ cols = 2, children }: CardGridProps) {
  return (
    <div className="card-grid" data-cols={cols}>
      {children}
    </div>
  );
}

export default CardGrid;