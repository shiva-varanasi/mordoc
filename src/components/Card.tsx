import React from 'react';

interface CardProps {
  title: string;
  href?: string;
  icon?: string;
  children: React.ReactNode;
}

export function Card({ title, href, icon, children }: CardProps) {
  const ArrowIcon = () => (
    <svg
      className="card-arrow"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );

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
          <div className="card-content">
            <h3 className="card-title">
              <span>{title}</span>
              {href && <ArrowIcon />}
            </h3>
            <div className="card-description">{children}</div>
          </div>
        </div>
      )}
      {!icon && (
        <div className="card-content">
          <h3 className="card-title">
            <span>{title}</span>
            {href && <ArrowIcon />}
          </h3>
          <div className="card-description">{children}</div>
        </div>
      )}
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