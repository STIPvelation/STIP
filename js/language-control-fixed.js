// 전역 상태 관리
const state = {
    translations: null,
    currentLang: null,
    currentPage: null
};

// 언어 레이블 설정
const LANG_LABELS = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文"
};

// 유틸리티 함수: 요소 선택 및 에러 처리
function selectElement(selector, parent = document) {
    const element = parent.querySelector(selector);
    if (!element && process.env.NODE_ENV !== 'production') {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

// 유틸리티 함수: 다중 요소 선택 및 에러 처리
function selectElements(selector, parent = document) {
    const elements = parent.querySelectorAll(selector);
    if (elements.length === 0 && process.env.NODE_ENV !== 'production') {
        console.warn(`No elements found: ${selector}`);
    }
    return elements;
}

/**
 * 번역 데이터 로드
 * @returns {Promise<void>}
 */
async function loadTranslations() {
    try {
        const response = await fetch('/js/translations.json');
        if (!response.ok) {
            throw new Error('Failed to load translations');
        }
        state.translations = await response.json();
        
        // 초기 언어 설정
        initializeLanguage();
    } catch (error) {
        console.error('Translation loading error:', error);
        // 기본 영어 번역으로 폴백
        state.translations = { en: {} };
    }
}

/**
 * 초기 언어 설정
 */
function initializeLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = savedLang || 
                       (["ko", "en", "ja", "zh"].includes(browserLang) ? browserLang : "ko");
    
    state.currentLang = defaultLang;
    state.currentPage = getCurrentPage();
    
    setLanguage(defaultLang);
}

/**
 * 현재 페이지 감지
 * @returns {string}
 */
function getCurrentPage() {
    const pathname = window.location.pathname;
    const htmlFile = pathname.split('/').pop() || 'index.html';
    return htmlFile.replace('.html', '') || 'main';
}

/**
 * 언어 변경 처리
 * @param {string} lang 
 * @param {boolean} fromSidebar 
 */
function handleLangChange(lang, fromSidebar = false) {
    if (!state.translations[lang]) {
        console.error(`Language not supported: ${lang}`);
        return;
    }
    
    setLanguage(lang);
    if (fromSidebar) {
        handleBurgerMenuClose();
    }
}

/**
 * 페이지 선택 처리
 * @param {string} page 
 */
function handlePageSelection(page) {
    state.currentPage = page;
    localStorage.setItem('currentPage', page);
}

/**
 * 언어 설정 및 페이지 업데이트
 * @param {string} lang 
 */
function setLanguage(lang) {
    if (!state.translations[lang]) {
        console.error(`Translation not found for language: ${lang}`);
        return;
    }

    state.currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);

    updateNavigationMenu();
    updatePageContent();
    updateLanguageUI();
    updateFooter();
}

/**
 * 네비게이션 메뉴 업데이트
 */
function updateNavigationMenu() {
    const { nav } = state.translations[state.currentLang];
    
    // 데스크톱 메뉴 업데이트
    selectElements('.nav-item.navigate').forEach(item => {
        const page = item.getAttribute('data-page');
        if (page && nav[page]) {
            item.textContent = nav[page];
        }
    });

    // 모바일 메뉴 업데이트
    selectElements('.side-bar-item.navigate').forEach(item => {
        const page = item.getAttribute('data-page');
        if (page && nav[page]) {
            item.textContent = nav[page];
        }
    });
}

/**
 * 페이지 콘텐츠 업데이트
 */
function updatePageContent() {
    const content = state.translations[state.currentLang][state.currentPage];
    if (!content) return;

    if (state.currentPage === 'main') {
        updateMainContent();
    }
}

/**
 * 메인 페이지 콘텐츠 업데이트
 */
function updateMainContent() {
    const { main } = state.translations[state.currentLang];
    if (!main) return;

    // 로고 텍스트
    const logoText = selectElement('.logo-wrapper p');
    if (logoText) logoText.innerHTML = main.logo;

    // STIP 설명
    const stipLetters = selectElements('.letter-title');
    const stipKeys = ['s', 't', 'i', 'p'];
    stipLetters.forEach((letter, index) => {
        const text = main.stip[stipKeys[index]];
        const textSpan = selectElement('span:not(.strong)', letter);
        if (textSpan && text) {
            textSpan.textContent = text;
        }
    });

    // 하단 텍스트
    const bottomTexts = selectElements('.content-bottom .text p');
    if (bottomTexts[0]) bottomTexts[0].textContent = main.bottom.text1;
    if (bottomTexts[1]) bottomTexts[1].textContent = main.bottom.text2;

    // 버튼 텍스트
    const listingButton = selectElement('.normal-button a');
    const watchVideo = selectElement('.watch-video-area span');
    
    if (listingButton) listingButton.textContent = main.buttons.listing;
    if (watchVideo) watchVideo.textContent = main.buttons.watch_video;
}

/**
 * 언어 선택 UI 업데이트
 */
function updateLanguageUI() {
    // 드롭다운 버튼 텍스트
    const dropdownButton = selectElement('#dropdownMenuButton1');
    if (dropdownButton) {
        dropdownButton.textContent = LANG_LABELS[state.currentLang];
    }

    // 활성 언어 표시
    const languageItems = selectElements('.side-bar-list.lang span, .dropdown-item');
    languageItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent.trim() === LANG_LABELS[state.currentLang]) {
            item.classList.add('active');
        }
    });
}

/**
 * 푸터 업데이트
 */
function updateFooter() {
    const { footer } = state.translations[state.currentLang];
    if (!footer) return;

    // 슬로건
    const slogan = selectElement('.footer-logo span');
    if (slogan) slogan.textContent = footer.slogan;

    // 회사명
    const companyName = selectElement('.company-name');
    if (companyName) companyName.textContent = footer.company_name;

    // 회사 정보
    const companyInfo = selectElement('.company-info-grid');
    if (companyInfo && footer.info) {
        const info = footer.info;
        companyInfo.innerHTML = `
            <span>${info.ceo}</span>
            <span>${info.address}</span>
            <span>${info.phone}</span>
            <span>${info.email}</span>
            <span>${info.business_number}</span>
        `;
    }
}

/**
 * 모바일 메뉴 제어
 */
function handleBurgerMenu() {
    const sideBar = selectElement('.side-bar-container');
    if (sideBar) {
        sideBar.classList.add('active');
    }
}

function handleBurgerMenuClose() {
    const sideBar = selectElement('.side-bar-container');
    if (sideBar) {
        sideBar.classList.remove('active');
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();

    // 사이드바 배경 클릭 시 닫기
    const sidebarBackground = selectElement('.sidebar-background');
    if (sidebarBackground) {
        sidebarBackground.addEventListener('click', handleBurgerMenuClose);
    }
});
