import type { UiStrings } from '../types.js';

/** Simplified Chinese chrome strings — tier-1 built-in catalog. */
export const zh: UiStrings = {
  search: {
    placeholder: '搜索...',
    modalAriaLabel: '搜索',
    inputAriaLabel: '搜索',
    modalPlaceholder: '搜索文档…',
    modalPlaceholderDev: '开发模式下无法使用搜索',
    closeAriaLabel: '关闭搜索',
    buildRequiredNotice: '构建你的站点以启用搜索。',
    loading: '正在加载搜索索引…',
    noResults: '未找到与“{query}”相关的结果',
  },

  nav: {
    sideNavigationLabel: '侧边导航',
    topNavigationLabel: '顶部导航',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    moreLinksLabel: '更多链接',
    selectLanguageLabel: '选择语言',
    languageTriggerLabel: '语言：{language}',
  },

  toc: {
    onThisPage: '本页内容',
  },

  breadcrumb: {
    ariaLabel: '面包屑导航',
    home: '首页',
  },

  heading: {
    copyLinkLabel: '复制本节链接',
    copiedTooltip: '已复制',
  },

  codeBlock: {
    copyLabel: '复制代码',
  },

  diagram: {
    previewAriaLabel: '图表预览',
    closePreviewLabel: '关闭图表预览',
    zoomOutLabel: '缩小',
    zoomInLabel: '放大',
  },

  image: {
    previewFallbackLabel: '图片预览',
    closePreviewLabel: '关闭图片预览',
  },

  notFound: {
    title: '页面未找到',
    description: '{path} 不存在任何页面。',
    goHomeButton: '返回首页',
  },

  loading: {
    pageAriaLabel: '正在加载页面',
  },

  article: {
    readTime: '{count} 分钟阅读',
  },
};
