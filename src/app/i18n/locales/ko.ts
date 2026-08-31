import type { UiStrings } from '../types.js';

/** Korean chrome strings — tier-1 built-in catalog. */
export const ko: UiStrings = {
  search: {
    placeholder: '검색...',
    modalAriaLabel: '검색',
    inputAriaLabel: '검색',
    modalPlaceholder: '문서 검색…',
    modalPlaceholderDev: '개발 모드에서는 검색을 사용할 수 없습니다',
    closeAriaLabel: '검색 닫기',
    buildRequiredNotice: '사이트를 빌드하면 검색을 사용할 수 있습니다.',
    loading: '검색 색인을 불러오는 중…',
    noResults: '“{query}”에 대한 결과가 없습니다',
  },

  nav: {
    sideNavigationLabel: '사이드 내비게이션',
    topNavigationLabel: '상단 내비게이션',
    openMenu: '메뉴 열기',
    closeMenu: '메뉴 닫기',
    moreLinksLabel: '더 보기',
    selectLanguageLabel: '언어 선택',
    languageTriggerLabel: '언어: {language}',
  },

  toc: {
    onThisPage: '이 페이지의 목차',
  },

  breadcrumb: {
    ariaLabel: '이동 경로',
    home: '홈',
  },

  heading: {
    copyLinkLabel: '이 섹션 링크 복사',
    copiedTooltip: '복사됨',
  },

  codeBlock: {
    copyLabel: '코드 복사',
  },

  diagram: {
    previewAriaLabel: '다이어그램 미리보기',
    closePreviewLabel: '다이어그램 미리보기 닫기',
    zoomOutLabel: '축소',
    zoomInLabel: '확대',
  },

  image: {
    previewFallbackLabel: '이미지 미리보기',
    closePreviewLabel: '이미지 미리보기 닫기',
  },

  notFound: {
    title: '페이지를 찾을 수 없습니다',
    description: '{path}에 해당하는 페이지가 없습니다.',
    goHomeButton: '홈으로 이동',
  },

  loading: {
    pageAriaLabel: '페이지를 불러오는 중',
  },

  article: {
    readTime: '{count}분 분량',
  },
};
