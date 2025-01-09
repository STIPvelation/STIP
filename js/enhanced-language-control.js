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
// 이전의 모든 코드를 유지하고, 다음 기능들을 추가/수정합니다
async function loadTranslations() {
    try {
        const response = await fetch("js/translations.json");
        translations = await response.json();

        // 현재 페이지 감지
        const currentPage = getCurrentPage();

        // 저장된 언어 확인 또는 브라우저 언어 사용
        const savedLang = localStorage.getItem("preferredLanguage");
        const browserLang = navigator.language.split("-")[0];
        const defaultLang = savedLang ||
            (["ko", "en", "ja", "zh"].includes(browserLang) ? browserLang : "ko");

        setLanguage(defaultLang);
    } catch (error) {
        console.error("Translation loading failed:", error);
    }
}


// 디바이스 타입 감지
const deviceType = {
    isMobile: window.matchMedia("(max-width: 768px)").matches,
    isTablet: window.matchMedia("(min-width: 769px) and (max-width: 1024px)").matches,
    isDesktop: window.matchMedia("(min-width: 1025px)").matches
};

// 터치 이벤트 관리
class TouchEventManager {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.swipeThreshold = 50;
    }

    init() {
        const sideBar = document.querySelector('.side-bar-container');
        if (!sideBar) return;

        this.addTouchEvents(sideBar);
        this.addMobileMenuBehavior();
    }

    addTouchEvents(element) {
        element.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const deltaX = this.touchStartX - this.touchEndX;
        const deltaY = Math.abs(this.touchStartY - this.touchEndY);

        // 수평 스와이프가 수직 움직임보다 큰 경우에만 처리
        if (deltaX > this.swipeThreshold && deltaX > deltaY) {
            handleBurgerMenuClose();
        }
    }

    addMobileMenuBehavior() {
        // 모바일 메뉴 아이템 클릭 시 자동 닫기
        const menuItems = document.querySelectorAll('.side-bar-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (deviceType.isMobile) {
                    handleBurgerMenuClose();
                }
            });
        });
    }
}

// 화면 크기 변경 감지 및 대응
class ResponsiveManager {
    constructor() {
        this.previousDeviceType = this.getCurrentDeviceType();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    getCurrentDeviceType() {
        if (window.matchMedia("(max-width: 768px)").matches) return 'mobile';
        if (window.matchMedia("(max-width: 1024px)").matches) return 'tablet';
        return 'desktop';
    }

    handleResize() {
        const currentDeviceType = this.getCurrentDeviceType();
        
        if (this.previousDeviceType !== currentDeviceType) {
            this.previousDeviceType = currentDeviceType;
            this.adjustLayoutForDeviceType(currentDeviceType);
        }
    }

    adjustLayoutForDeviceType(deviceType) {
        const sideBar = document.querySelector('.side-bar-container');
        if (sideBar && deviceType !== 'mobile') {
            sideBar.classList.remove('active');
        }

        // 디바이스 타입에 따른 추가적인 레이아웃 조정
        document.body.setAttribute('data-device', deviceType);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 접근성 향상
class AccessibilityManager {
    init() {
        this.setupAriaAttributes();
        this.setupKeyboardNavigation();
    }

    setupAriaAttributes() {
        // 언어 선택 버튼
        const langButton = document.getElementById('dropdownMenuButton1');
        if (langButton) {
            langButton.setAttribute('aria-label', '언어 선택');
            langButton.setAttribute('aria-expanded', 'false');
        }

        // 모바일 메뉴 버튼
        const burgerMenu = document.querySelector('.burger-menu');
        if (burgerMenu) {
            burgerMenu.setAttribute('aria-label', '메뉴 열기');
            burgerMenu.setAttribute('role', 'button');
            burgerMenu.setAttribute('tabindex', '0');
        }
    }

    setupKeyboardNavigation() {
        // 모바일 메뉴 키보드 접근성
        const burgerMenu = document.querySelector('.burger-menu');
        if (burgerMenu) {
            burgerMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBurgerMenu();
                }
            });
        }

        // 언어 선택 메뉴 키보드 접근성
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }
}

// 성능 최적화
class PerformanceOptimizer {
    constructor() {
        this.resizeObserver = null;
        this.intersectionObserver = null;
    }

    init() {
        this.setupResizeObserver();
        this.setupIntersectionObserver();
        this.optimizeEventListeners();
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(this.debounce(entries => {
            for (const entry of entries) {
                if (entry.target.classList.contains('side-bar-container')) {
                    this.handleSidebarResize(entry);
                }
            }
        }, 250));

        const sidebar = document.querySelector('.side-bar-container');
        if (sidebar) {
            this.resizeObserver.observe(sidebar);
        }
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        // 애니메이션이 필요한 요소들 관찰
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    optimizeEventListeners() {
        // 이벤트 위임 사용
        document.addEventListener('click', (e) => {
            // 언어 선택 처리
            if (e.target.classList.contains('dropdown-item')) {
                const lang = e.target.getAttribute('data-lang');
                if (lang) handleLangChange(lang);
            }

            // 모바일 메뉴 아이템 처리
            if (e.target.classList.contains('side-bar-item')) {
                if (deviceType.isMobile) {
                    handleBurgerMenuClose();
                }
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleSidebarResize(entry) {
        // 사이드바 크기 변경에 따른 처리
        const sidebar = entry.target;
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
}

// 초기화 함수 수정
document.addEventListener('DOMContentLoaded', () => {
    // 기존 초기화 코드
    loadTranslations();

    // 새로운 기능 초기화
    const touchManager = new TouchEventManager();
    const responsiveManager = new ResponsiveManager();
    const accessibilityManager = new AccessibilityManager();
    const performanceOptimizer = new PerformanceOptimizer();

    touchManager.init();
    responsiveManager.init();
    accessibilityManager.init();
    performanceOptimizer.init();

    // 사이드바 배경 클릭 시 닫기 이벤트
    const sidebarBackground = document.querySelector('.sidebar-background');
    if (sidebarBackground) {
        sidebarBackground.addEventListener('click', handleBurgerMenuClose);
    }
});
