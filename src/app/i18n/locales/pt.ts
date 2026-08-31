import type { UiStrings } from '../types.js';

/** Portuguese chrome strings — tier-1 built-in catalog. */
export const pt: UiStrings = {
  search: {
    placeholder: 'Pesquisar...',
    modalAriaLabel: 'Pesquisar',
    inputAriaLabel: 'Pesquisar',
    modalPlaceholder: 'Pesquisar na documentação…',
    modalPlaceholderDev: 'Pesquisa indisponível no modo de desenvolvimento',
    closeAriaLabel: 'Fechar pesquisa',
    buildRequiredNotice: 'Compile seu site para ativar a pesquisa.',
    loading: 'Carregando índice de busca…',
    noResults: 'Nenhum resultado para “{query}”',
  },

  nav: {
    sideNavigationLabel: 'Navegação lateral',
    topNavigationLabel: 'Navegação superior',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    moreLinksLabel: 'Mais links',
    selectLanguageLabel: 'Selecionar idioma',
    languageTriggerLabel: 'Idioma: {language}',
  },

  toc: {
    onThisPage: 'Nesta página',
  },

  breadcrumb: {
    ariaLabel: 'Trilha de navegação',
    home: 'Início',
  },

  heading: {
    copyLinkLabel: 'Copiar link para esta seção',
    copiedTooltip: 'Copiado',
  },

  codeBlock: {
    copyLabel: 'Copiar código',
  },

  diagram: {
    previewAriaLabel: 'Pré-visualização do diagrama',
    closePreviewLabel: 'Fechar pré-visualização do diagrama',
    zoomOutLabel: 'Diminuir zoom',
    zoomInLabel: 'Aumentar zoom',
  },

  image: {
    previewFallbackLabel: 'Pré-visualização da imagem',
    closePreviewLabel: 'Fechar pré-visualização da imagem',
  },

  notFound: {
    title: 'Página não encontrada',
    description: 'Não existe nenhuma página em {path}.',
    goHomeButton: 'Ir para o início',
  },

  loading: {
    pageAriaLabel: 'Carregando página',
  },

  article: {
    readTime: '{count} MIN DE LEITURA',
  },
};
