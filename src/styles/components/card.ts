/**
 * Card component styles
 * Card and CardGrid components for showcasing content
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, mediaQuery } from '../utils';

interface CardVariables {
  // Customizable only
  cardBorderColor: string;
  cardBorderColorDark: string;
  cardBackgroundColor: string;
  cardBackgroundColorDark: string;
  cardBorderRadius: string;
  cardTitleColor: string;
  cardTitleColorDark: string;
  cardDescriptionColor: string;
  cardDescriptionColorDark: string;
  cardHoverShadow: string;
  cardHoverShadowDark: string;
  cardArrowColor: string;
  cardArrowColorDark: string;
}

export class CardStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: CardVariables = {
      cardBorderColor: '#E6E6E6',
      cardBorderColorDark: '#262626',
      cardBackgroundColor: '#FFFFFF',
      cardBackgroundColorDark: '#171717',
      cardBorderRadius: '8px',
      cardTitleColor: '#171717',
      cardTitleColorDark: '#FAFAFA',
      cardDescriptionColor: '#1C1C1C',
      cardDescriptionColorDark: '#D9D9D9',
      cardHoverShadow: '0 10px 15px -3px rgba(23, 23, 23, 0.05)',
      cardHoverShadowDark: '0 10px 15px -3px rgba(250, 250, 250, 0.05)',
      cardArrowColor: '#525252',
      cardArrowColorDark: '#B3B3B3',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'cardBorderColor', 'cardBorderColorDark', 'cardBackgroundColor', 'cardBackgroundColorDark',
        'cardBorderRadius', 'cardTitleColor', 'cardTitleColorDark', 'cardDescriptionColor', 
        'cardDescriptionColorDark', 'cardHoverShadow', 'cardHoverShadowDark', 'cardArrowColor',
        'cardArrowColorDark'
      ]
    );
    
    return `/* Card Component */
.card-grid {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.card-grid[data-cols="2"] {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
}

.card-grid[data-cols="3"] {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.card-grid[data-cols="4"] {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border: 1px solid ${vars.cardBorderColor};
  border-radius: ${vars.cardBorderRadius};
  background-color: ${vars.cardBackgroundColor};
  transition: all 300ms ease;
  position: relative;
}

.card-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
  height: 100%;
}

.card-link:hover .card {
  box-shadow: ${vars.cardHoverShadow};
  transform: translateY(-4px);
  border-color: rgba(82, 82, 82, 0.5);
}

.card-link:hover .card-title {
  color: #000000;
}

.card-link:hover .card-arrow {
  transform: translateX(4px);
  color: ${vars.cardTitleColor};
}

.card-link:active .card {
  transform: translateY(-2px);
}

.card-icon {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card-icon-img {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
  flex-shrink: 0;
  margin: 0 0 1rem 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: ${this.globalVars.fontWeightSemibold};
  line-height: 1.5;
  color: ${vars.cardTitleColor};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  transition: color 300ms ease;
}

.card-arrow {
  flex-shrink: 0;
  margin-top: 0.25rem;
  color: ${vars.cardArrowColor};
  transition: all 300ms ease;
  width: 1.25rem;
  height: 1.25rem;
}

.card-description {
  margin: 0;
  color: ${vars.cardDescriptionColor};
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: inherit;
}

.card-description p:not(:last-child) {
  margin-bottom: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  .card {
    background-color: ${vars.cardBackgroundColorDark};
    border-color: ${vars.cardBorderColorDark};
  }
  
  .card-title {
    color: ${vars.cardTitleColorDark};
  }
  
  .card-description {
    color: ${vars.cardDescriptionColorDark};
  }
  
  .card-description p {
    color: inherit;
  }
  
  .card-arrow {
    color: ${vars.cardArrowColorDark};
  }
  
  .card-link:hover .card {
    box-shadow: ${vars.cardHoverShadowDark};
    border-color: rgba(179, 179, 179, 0.5);
  }
  
  .card-link:hover .card-title {
    color: #FFFFFF;
  }
  
  .card-link:hover .card-arrow {
    color: ${vars.cardTitleColorDark};
  }
}`;
  }
}