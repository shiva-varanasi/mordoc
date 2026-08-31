import type { UiStrings } from '../types.js';

/** Spanish chrome strings — tier-1 built-in catalog. */
export const es: UiStrings = {
  search: {
    placeholder: 'Buscar...',
    modalAriaLabel: 'Buscar',
    inputAriaLabel: 'Buscar',
    modalPlaceholder: 'Buscar en la documentación…',
    modalPlaceholderDev: 'Búsqueda no disponible en modo desarrollo',
    closeAriaLabel: 'Cerrar búsqueda',
    buildRequiredNotice: 'Compila tu sitio para habilitar la búsqueda.',
    loading: 'Cargando índice de búsqueda…',
    noResults: 'No se encontraron resultados para «{query}»',
  },

  nav: {
    sideNavigationLabel: 'Navegación lateral',
    topNavigationLabel: 'Navegación superior',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    moreLinksLabel: 'Más enlaces',
    selectLanguageLabel: 'Seleccionar idioma',
    languageTriggerLabel: 'Idioma: {language}',
  },

  toc: {
    onThisPage: 'En esta página',
  },

  breadcrumb: {
    ariaLabel: 'Ruta de navegación',
    home: 'Inicio',
  },

  heading: {
    copyLinkLabel: 'Copiar enlace a esta sección',
    copiedTooltip: 'Copiado',
  },

  codeBlock: {
    copyLabel: 'Copiar código',
  },

  diagram: {
    previewAriaLabel: 'Vista previa del diagrama',
    closePreviewLabel: 'Cerrar vista previa del diagrama',
    zoomOutLabel: 'Alejar',
    zoomInLabel: 'Acercar',
  },

  image: {
    previewFallbackLabel: 'Vista previa de la imagen',
    closePreviewLabel: 'Cerrar vista previa de la imagen',
  },

  notFound: {
    title: 'Página no encontrada',
    description: 'No existe ninguna página en {path}.',
    goHomeButton: 'Ir al inicio',
  },

  loading: {
    pageAriaLabel: 'Cargando página',
  },

  article: {
    readTime: '{count} MIN DE LECTURA',
  },
};
