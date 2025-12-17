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
  cardBorderRadius: string;
  cardTitleColor: string;
  cardDescriptionColor: string;
  cardHoverShadow: string;
  cardArrowColor: string;
}

export class CardStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: CardVariables = {
      cardBorderColor: this.globalVars.borderColorLight,
      cardBorderColorDark: this.globalVars.borderColorDark,
      cardBackgroundColor: this.globalVars.surfaceColorLight,
      cardBorderRadius: '8px',
      cardTitleColor: this.globalVars.textPrimaryLight,
      cardDescriptionColor: '#666666',
      cardHoverShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      cardArrowColor: '#999999',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'cardBorderColor', 'cardBorderColorDark', 'cardBackgroundColor',
        'cardBorderRadius', 'cardTitleColor', 'cardDescriptionColor', 'cardHoverShadow',
        'cardArrowColor'
      ]
    );
    
    return `/* Card Component */
.card-grid {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid[data-cols="2"] {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-grid[data-cols="3"] {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .card-grid[data-cols="4"] {
    grid-template-columns: repeat(4, 1fr);
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 1px solid ${vars.cardBorderColor};
  border-radius: ${vars.cardBorderRadius};
  background-color: ${vars.cardBackgroundColor};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
  border-color: ${vars.cardBorderColor};
}

.card-link:hover .card-arrow {
  transform: translateX(4px);
  opacity: 1;
}

.card-link:active .card {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 40px;
}

.card-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
  margin: ${this.globalVars.spacingXs} 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: ${this.globalVars.fontWeightSemibold};
  line-height: ${this.globalVars.lineHeightTight};
  color: ${vars.cardTitleColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${this.globalVars.spacingSm};
}

.card-arrow {
  flex-shrink: 0;
  opacity: 0.6;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${vars.cardArrowColor};
}

.card-description {
  margin: 0;
  color: ${vars.cardDescriptionColor};
  font-size: ${this.globalVars.fontSizeBase};
  line-height: ${this.globalVars.lineHeightRelaxed};
}

.card-description p {
  margin: 0;
}

.card-description p:not(:last-child) {
  margin-bottom: 0.5rem;
}

${mediaQuery('sm', `  .card {
    padding: 1.25rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-description {
    font-size: ${this.globalVars.fontSizeSm};
  }`)}`;
  }
}