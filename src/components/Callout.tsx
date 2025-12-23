import React from 'react';

interface CalloutProps {
  type: 'note' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const InfoIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="callout-icon"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4"></path>
      <path d="M12 8h.01"></path>
    </svg>
  );

  const WarningIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="callout-icon"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  );

  const DangerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="callout-icon"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="m15 9-6 6"></path>
      <path d="m9 9 6 6"></path>
    </svg>
  );

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <WarningIcon />;
      case 'danger':
        return <DangerIcon />;
      case 'note':
      default:
        return <InfoIcon />;
    }
  };

  const calloutClass = `callout callout-${type}`;

  return (
    <div className={calloutClass}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {getIcon()}
        <div style={{ flex: 1 }}>
          {title && <div className="callout-title">{title}</div>}
          <div className="callout-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Callout;

