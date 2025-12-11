import React from 'react';

interface CardProps {
  title: string;
  href?: string;
  icon?: string;
  children: React.ReactNode;
}

export function Card({ title, href, icon, children }: CardProps) {
  const content = (
    <>
      {icon && (
        <div className="card-icon">
          <img 
            src={icon} 
            alt="" 
            className="card-icon-img"
            loading="lazy"
          />
        </div>
      )}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="card-description">{children}</div>
      </div>
    </>
  );
  
  if (href) {
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    return (
      <a 
        href={href} 
        className="card card-link"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }
  
  return <div className="card">{content}</div>;
}

export default Card;