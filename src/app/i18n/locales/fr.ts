import type { UiStrings } from '../types.js';

/** French chrome strings — tier-1 built-in catalog. */
export const fr: UiStrings = {
  search: {
    placeholder: 'Rechercher...',
    modalAriaLabel: 'Recherche',
    inputAriaLabel: 'Recherche',
    modalPlaceholder: 'Rechercher dans la documentation…',
    modalPlaceholderDev: 'Recherche indisponible en mode développement',
    closeAriaLabel: 'Fermer la recherche',
    buildRequiredNotice: 'Compilez votre site pour activer la recherche.',
    loading: 'Chargement de l’index de recherche…',
    noResults: 'Aucun résultat pour « {query} »',
  },

  nav: {
    sideNavigationLabel: 'Navigation latérale',
    topNavigationLabel: 'Navigation supérieure',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    moreLinksLabel: 'Plus de liens',
    selectLanguageLabel: 'Choisir la langue',
    languageTriggerLabel: 'Langue : {language}',
  },

  toc: {
    onThisPage: 'Sur cette page',
  },

  breadcrumb: {
    ariaLabel: 'Fil d’Ariane',
    home: 'Accueil',
  },

  heading: {
    copyLinkLabel: 'Copier le lien de cette section',
    copiedTooltip: 'Copié',
  },

  codeBlock: {
    copyLabel: 'Copier le code',
  },

  diagram: {
    previewAriaLabel: 'Aperçu du diagramme',
    closePreviewLabel: 'Fermer l’aperçu du diagramme',
    zoomOutLabel: 'Zoom arrière',
    zoomInLabel: 'Zoom avant',
  },

  image: {
    previewFallbackLabel: 'Aperçu de l’image',
    closePreviewLabel: 'Fermer l’aperçu de l’image',
  },

  notFound: {
    title: 'Page introuvable',
    description: 'Aucune page n’existe à {path}.',
    goHomeButton: 'Retour à l’accueil',
  },

  loading: {
    pageAriaLabel: 'Chargement de la page',
  },

  article: {
    readTime: '{count} MIN DE LECTURE',
  },
};
