// 번역 데이터 로드
let translations = {};

const LANG_MAP = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

// 번역 데이터 fetch
async function loadTranslations() {
  try {
    const response = await fetch('js/translations.json');
    translations = await response.json();

    // 브라우저 언어 설정 또는 기본값 설정
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'en';
    const preferredLang = localStorage.getItem('preferredLanguage') || defaultLang;

    setLanguage(preferredLang);
  } catch (error) {
    console.error('번역 데이터를 불러오는데 실패했습니다:', error);
    translations = {}; // 기본값 설정
  }
}

// 사이드바 닫기 함수
function closeSideBar() {
  const sideBarContainer = document.querySelector('.side-bar-container');
  const burgerMenu = document.querySelector('.burger-menu');

  if (sideBarContainer) {
    sideBarContainer.classList.remove("open");
    sideBarContainer.classList.add("close");
  }

  if (burgerMenu) {
    burgerMenu.setAttribute('onclick', 'handleBurgerMenu()');
  }
}

// 언어 설정 함수
function setLanguage(lang) {
  
  if (!translations[lang]) {
    console.error(`${lang} 언어에 대한 번역 데이터가 없습니다.`);
    return;
  }

  // 네비게이션 텍스트 업데이트
  document.querySelectorAll('.nav-item, .side-bar-item').forEach(el => {
    const key = el.getAttribute('data-page');
    if (key) {
      el.textContent = translations[lang].nav[key];
    }
  });

  // 드롭다운 버튼 텍스트 업데이트
  const dropdownButton = document.getElementById('dropdownMenuButton1');
  if (dropdownButton) {
    dropdownButton.textContent = LANG_MAP[lang];
  };

  console.log(lang);



  // 메인 콘텐츠 업데이트
  const contentWrapper = document.querySelector('.content-wrapper');
  if (contentWrapper) {
    const logoWrapper = contentWrapper.querySelector('.logo-wrapper p');
    if (logoWrapper) {
      logoWrapper.innerHTML = translations[lang].main.logo_text;
    }

    const letterTitles = contentWrapper.querySelectorAll('.letter-title');
    letterTitles.forEach((el, index) => {
      if (el.querySelector('.strong')) {
        el.querySelector('span:not(.strong)').textContent = translations[lang].main.letter_titles[index];
      }
    });

    const contentBottomText = contentWrapper.querySelectorAll('.content-bottom .text p');
    contentBottomText.forEach((el, index) => {
      el.textContent = translations[lang].main.bottom_text[index];
    });

    const listingButton = contentWrapper.querySelector('.normal-button a');
    if (listingButton) {
      listingButton.textContent = translations[lang].main.buttons.listing;
    }

    const watchVideoSpan = contentWrapper.querySelector('.watch-video-area span');
    if (watchVideoSpan) {
      watchVideoSpan.textContent = translations[lang].main.buttons.watch_video;
    }
  }

  // 푸터 업데이트
  const footerWrapper = document.querySelector('.footer-wrapper');
  if (footerWrapper) {
    const footerLogo = footerWrapper.querySelector('.footer-logo span');
    if (footerLogo) {
      footerLogo.textContent = translations[lang].footer.slogan;
    }

    const companyName = footerWrapper.querySelector('.company-name');
    if (companyName) {
      companyName.textContent = translations[lang].footer.company_name;
    }

    const companyInfoGrid = footerWrapper.querySelector('.company-info-grid');
    if (companyInfoGrid) {
      const companyInfo = translations[lang].footer.company_info;
      companyInfoGrid.innerHTML = `
                <span>${companyInfo.ceo}</span>
                <span>${companyInfo.address}</span>
                <span>${companyInfo.phone}</span>
                <span>${companyInfo.email}</span>
                <span>${companyInfo.business_number}</span>
            `;
    }
  }

  // 드롭다운 및 사이드바 언어 활성화
  document.querySelectorAll('.side-bar-item, .dropdown-item').forEach(el => {
    el.classList.remove('active');
  });

  document.querySelectorAll('.side-bar-item span, .dropdown-item').forEach(el => {
    if (el.textContent.trim() === LANG_MAP[lang]) {
      el.classList.add('active');
    }
  });

  // 언어 설정 저장
  localStorage.setItem('preferredLanguage', lang);

  // 사이드바 닫기
  closeSideBar();
};

// 햄버거 메뉴 열기/닫기 함수
const handleBurgerMenu = () => {
  const nav = document.querySelector(".side-bar-container");
  if (nav) {
    nav.classList.add("open");
    nav.classList.remove("close");
  }
};

const handleBurgerMenuClose = () => {
  const nav = document.querySelector(".side-bar-container");
  if (nav) {
    nav.classList.remove("open");
    nav.classList.add("close");
  }
};

// 언어 변경 핸들러
function handleLangChange(lang) {
  setLanguage(lang);
};

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();

  // 네비게이션 항목에 data-page 속성 추가
  document.querySelectorAll('.nav-item, .side-bar-item').forEach(el => {
    const href = el.getAttribute('href') || el.textContent.toLowerCase();
    const page = href.replace('.html', '').replace('/', '');
    el.setAttribute('data-page', page);
  });

  // 드롭다운 및 사이드바 언어 항목 클릭 이벤트
  document.querySelectorAll('.dropdown-item, .side-bar-item').forEach(el => {
    el.addEventListener('click', (event) => {
      const langText = event.target.textContent.trim();
      const langMap = {
        '한국어': 'ko',
        'English': 'en',
        '日本語': 'ja',
        '中文': 'zh'
      };
      setLanguage(langMap[langText]);
    });
  });

  // 배경 클릭 시 사이드바 닫기
  const sidebarBackground = document.querySelector('.sidebar-background');
  if (sidebarBackground) {
    sidebarBackground.addEventListener('click', handleBurgerMenuClose);
  }
});
