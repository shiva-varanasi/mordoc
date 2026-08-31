import type { UiStrings } from '../types.js';

/** Russian chrome strings — tier-1 built-in catalog. */
export const ru: UiStrings = {
  search: {
    placeholder: 'Поиск...',
    modalAriaLabel: 'Поиск',
    inputAriaLabel: 'Поиск',
    modalPlaceholder: 'Поиск по документации…',
    modalPlaceholderDev: 'Поиск недоступен в режиме разработки',
    closeAriaLabel: 'Закрыть поиск',
    buildRequiredNotice: 'Соберите сайт, чтобы включить поиск.',
    loading: 'Загрузка индекса поиска…',
    noResults: 'Ничего не найдено по запросу «{query}»',
  },

  nav: {
    sideNavigationLabel: 'Боковая навигация',
    topNavigationLabel: 'Верхняя навигация',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    moreLinksLabel: 'Ещё ссылки',
    selectLanguageLabel: 'Выбрать язык',
    languageTriggerLabel: 'Язык: {language}',
  },

  toc: {
    onThisPage: 'На этой странице',
  },

  breadcrumb: {
    ariaLabel: 'Хлебные крошки',
    home: 'Главная',
  },

  heading: {
    copyLinkLabel: 'Скопировать ссылку на этот раздел',
    copiedTooltip: 'Скопировано',
  },

  codeBlock: {
    copyLabel: 'Скопировать код',
  },

  diagram: {
    previewAriaLabel: 'Просмотр диаграммы',
    closePreviewLabel: 'Закрыть просмотр диаграммы',
    zoomOutLabel: 'Уменьшить',
    zoomInLabel: 'Увеличить',
  },

  image: {
    previewFallbackLabel: 'Просмотр изображения',
    closePreviewLabel: 'Закрыть просмотр изображения',
  },

  notFound: {
    title: 'Страница не найдена',
    description: 'Страница по адресу {path} не существует.',
    goHomeButton: 'На главную',
  },

  loading: {
    pageAriaLabel: 'Загрузка страницы',
  },

  article: {
    readTime: '{count} МИН НА ЧТЕНИЕ',
  },
};
