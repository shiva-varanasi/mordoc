import React from 'react';

interface ImageProps {
  src: string;
  alt?: string;
  [key: string]: any;
}

export function Image({ src, alt, ...rest }: ImageProps) {
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.onclick = () => modal.remove();
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'image-modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => modal.remove();
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.onclick = (e) => e.stopPropagation();
    
    modal.appendChild(closeBtn);
    modal.appendChild(img);
    document.body.appendChild(modal);
  };
  
  return (
    <img
      {...rest}
      src={src}
      alt={alt || ''}
      loading="lazy"
      onClick={handleClick}
    />
  );
}