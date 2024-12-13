// 전역 변수 설정
let translations = {};

// 언어 라벨 설정
const langLabel = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文"
};

// 페이지 매핑
const pageMapping = {
    'index.html': 'main',
    'listing.html': 'listing',
    'about.html': 'about',
    'product.html': 'product',
    'contact.html': 'contact',
    'main': 'main'
};

// 번역 데이터 로드
async function loadTranslations() {
    try {
        const response = await fetch("/js/translations.json");
        translations = await response.json();
        
        // 저장된 언어 또는 브라우저 언어로 초기화
        const savedLang = localStorage.getItem("preferredLanguage");
        const browserLang = navigator.language.split("-")[0];
        const defaultLang = savedLang || 
                          (["ko", "en", "ja", "zh"].includes(browserLang) ? browserLang : "ko");
        
        setLanguage(defaultLang);
    } catch (error) {
        console.error("Translation loading failed:", error);
    }
}

// 현재 페이지 감지
function getCurrentPage() {
    const pathname = window.location.pathname;
    const htmlFile = pathname.split('/').pop() || 'index.html';
    return pageMapping[htmlFile] || 'main';
}

// 페이지 선택 처리
function handlePageSelection(page) {
    const currentLang = localStorage.getItem("preferredLanguage") || "ko";
    // 페이지 전환 전에 현재 언어 저장
    localStorage.setItem("preferredLanguage", currentLang);
}

// 언어 변경 처리
function handleLangChange(lang, fromSidebar = false) {
    setLanguage(lang);
    if (fromSidebar) {
        handleBurgerMenuClose();
    }
}

// 언어 설정 및 페이지 업데이트
function setLanguage(lang) {
    if (!translations[lang]) {
        console.error(`No translations found for language: ${lang}`);
        return;
    }

    // 네비게이션 메뉴 업데이트
    updateNavigationMenu(lang);
    
    // 현재 페이지 콘텐츠 업데이트
    const currentPage = getCurrentPage();
    updatePageContent(lang, currentPage);
    
    // 푸터 업데이트
    updateFooter(lang);
    
    // 언어 선택 UI 업데이트
    updateLanguageUI(lang);

    // 언어 설정 저장
    localStorage.setItem("preferredLanguage", lang);
}

// 네비게이션 메뉴 업데이트
function updateNavigationMenu(lang) {
    const navData = translations[lang].nav;
    
    // 메인 네비게이션
    document.querySelectorAll('.nav-item.navigate').forEach(item => {
        const page = item.getAttribute('data-page');
        if (navData[page]) {
            item.textContent = navData[page];
        }
    });
    
    // 사이드바 네비게이션
    document.querySelectorAll('.side-bar-item.navigate').forEach(item => {
        const page = item.getAttribute('data-page');
        if (navData[page]) {
            item.textContent = navData[page];
        }
    });
}

// 언어 선택 UI 업데이트
function updateLanguageUI(lang) {
    // 드롭다운 버튼 텍스트
    const dropdownButton = document.getElementById('dropdownMenuButton1');
    if (dropdownButton) {
        dropdownButton.textContent = langLabel[lang];
    }
    
    // 활성 언어 표시
    document.querySelectorAll('.side-bar-item, .dropdown-item').forEach(el => {
        el.classList.remove('active');
        if (el.textContent.trim() === langLabel[lang]) {
            el.classList.add('active');
        }
    });
}

// 페이지 콘텐츠 업데이트
function updatePageContent(lang, currentPage) {
    const pageData = translations[lang][currentPage];
    if (!pageData) return;

    switch(currentPage) {
        case 'main':
            updateMainPage(lang);
            break;
        case 'listing':
            updateListingPage(lang);
            break;
        case 'about':
            updateAboutPage(lang);
            break;
        case 'product':
            updateProductPage(lang);
            break;
        case 'contact':
            updateContactPage(lang);
            break;
    }
}

// 푸터 업데이트
function updateFooter(lang) {
    const footerData = translations[lang].footer;
    if (!footerData) return;

    // 슬로건
    const slogan = document.querySelector('.footer-logo span');
    if (slogan) slogan.textContent = footerData.slogan;

    // 회사명
    const companyName = document.querySelector('.company-name');
    if (companyName) companyName.textContent = footerData.company_name;

    // 회사 정보
    const companyInfo = document.querySelector('.company-info-grid');
    if (companyInfo && footerData.company_info) {
        const info = footerData.company_info;
        companyInfo.innerHTML = `
            <span>${info.ceo}</span>
            <span>${info.address}</span>
            <span>${info.phone}</span>
            <span>${info.email}</span>
            <span>${info.business_number}</span>
        `;
    }
}

// 사이드바 제어
function handleBurgerMenu() {
    const sideBar = document.querySelector('.side-bar-container');
    if (sideBar) sideBar.classList.add('active');
}

function handleBurgerMenuClose() {
    const sideBar = document.querySelector('.side-bar-container');
    if (sideBar) sideBar.classList.remove('active');
}

// 페이지별 업데이트 함수들은 기존 코드와 동일하게 유지...

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();

    // 사이드바 배경 클릭 시 닫기
    const sidebarBackground = document.querySelector('.sidebar-background');
    if (sidebarBackground) {
        sidebarBackground.addEventListener('click', handleBurgerMenuClose);
    }

    // 드롭다운 메뉴 클릭 이벤트
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            handleLangChange(lang);
        });
    });
});
