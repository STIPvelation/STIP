// 페이지별 setLanguage 처리 스크립트
let translations = {}; // 공통 번역 데이터를 담을 객체

let currentPage = null; // 현재 페이지 정보 저장


// 언어 라벨 설정
const langLabel = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

// 번역 데이터를 로드하는 함수
async function loadTranslations() {
  try {
    const response = await fetch("js/translations.json");
    translations = await response.json();

    // 기본 언어 설정: 브라우저 언어 또는 English
    const browserLang = navigator.language.split("-")[0];
    const defaultLang = ["ko", "en", "ja", "zh"].includes(browserLang) ? browserLang : "en";

    // 로컬 저장소에서 저장된 언어 확인
    const savedLang = localStorage.getItem("preferredLanguage") || defaultLang;
    setLanguage(savedLang);
  } catch (error) {
    console.error("번역 데이터를 로드하는 데 실패했습니다.", error);
  }
  handlePageSelection(index);
}

// 페이지 선택 시 호출되는 함수
function handlePageSelection(page) {
  currentPage = page; // 선택된 페이지 정보를 업데이트
  console.log("사용자가 선택한 페이지:", currentPage);
}

// 언어 설정 함수
function setLanguage(lang) {
  let key = '';
  if (!translations[lang]) {
    console.error(`${lang} 언어에 대한 번역 데이터가 없습니다.`);
    return;
  }
  // 네비게이션 텍스트 업데이트
  document.querySelectorAll('.nav-item, .side-bar-item').forEach(el => {
    key = el.getAttribute('data-page');
    if (key) {
      el.textContent = translations[lang].nav[key];
    }
  });
  // 현재 페이지 경로 확인
  // const currentPage = document.body.getAttribute("data-page");

  console.log(currentPage);
  // 공통 요소 업데이트
  updateCommonElements(lang);

  // 페이지별 처리
  switch (currentPage) {
    case "home":
      updateHomePage(lang);
      break;
    case "listing":
      updateListingPage(lang);
      break;
    case "about":
      updateAboutPage(lang);
      break;
    case "product":
      updateAboutPage(lang);
      break;
    case "contact":
      updateContactPage(lang);
      break;
    default:
      console.warn("알 수 없는 페이지입니다.", currentPage);
  }

  // 선택한 언어를 로컬 저장소에 저장
  localStorage.setItem("preferredLanguage", lang);
}

// 공통 요소 업데이트 함수
function updateCommonElements(lang) {
  // 네비게이션 업데이트
  document.querySelectorAll(".nav-item, .side-bar-item.lang").forEach((el) => {
    const key = el.getAttribute("data-page");
    if (key) {
      el.textContent = translations[lang]?.nav[key] || el.textContent;
    }
  });

  // 드롭다운 버튼 텍스트 업데이트
  const dropdownButton = document.getElementById("dropdownMenuButton1");
  if (dropdownButton) {
    dropdownButton.textContent = langLabel[lang];
  }

  // 푸터 업데이트
  const footerWrapper = document.querySelector(".footer-wrapper");
  if (footerWrapper) {
    const footerLogo = footerWrapper.querySelector(".footer-logo span");
    const companyName = footerWrapper.querySelector(".company-name");
    const companyInfoGrid = footerWrapper.querySelector(".company-info-grid");

    if (footerLogo) footerLogo.textContent = translations[lang]?.footer?.slogan;
    if (companyName) companyName.textContent = translations[lang]?.footer?.company_name;
    if (companyInfoGrid) {
      const companyInfo = translations[lang]?.footer?.company_info;
      companyInfoGrid.innerHTML = `
                <span>${companyInfo?.ceo || ""}</span>
                <span>${companyInfo?.address || ""}</span>
                <span>${companyInfo?.phone || ""}</span>
                <span>${companyInfo?.email || ""}</span>
                <span>${companyInfo?.business_number || ""}</span>
            `;
    }
  }
}

// 홈 페이지 업데이트 함수
function updateHomePage(lang) {
  const contentWrapper = document.querySelector(".content-wrapper");
  if (contentWrapper) {
    const logoWrapper = contentWrapper.querySelector(".logo-wrapper p");
    const letterTitles = contentWrapper.querySelectorAll(".letter-title");
    const contentBottomText = contentWrapper.querySelectorAll(".content-bottom .text p");
    const listingButton = contentWrapper.querySelector(".normal-button a");
    const watchVideoSpan = contentWrapper.querySelector(".watch-video-area span");

    if (logoWrapper) logoWrapper.innerHTML = translations[lang]?.main?.logo_text;
    letterTitles.forEach((el, index) => {
      const strongSpan = el.querySelector("span.strong");
      if (strongSpan) {
        el.querySelector("span:not(.strong)").textContent = translations[lang]?.main?.letter_titles[index] || "";
      }
    });
    contentBottomText.forEach((el, index) => {
      el.textContent = translations[lang]?.main?.bottom_text[index] || "";
    });
    if (listingButton) listingButton.textContent = translations[lang]?.main?.buttons?.listing;
    if (watchVideoSpan) watchVideoSpan.textContent = translations[lang]?.main?.buttons?.watch_video;
  }
}

// Listing 페이지 업데이트 함수
function updateListingPage(lang) {
  const contentWrapper = document.querySelector(".content-wrapper");
  const inputBox_label = document.querySelector(".input-box label");
  const inputBox_input = document.querySelector(".input-box input");
  const inputBox_button = document.querySelector(".input-box button");

  if (contentWrapper) {
    const letterTitles = contentWrapper.querySelectorAll(".letter-title");
    letterTitles.forEach((el, index) => {
      el.querySelector("span").textContent = translations[lang]?.listing?.letter_titles[index] || "";
    });
    inputBox_label.forEach((el, index) => {
      el.querySelector("label").textContent = translations[lang]?.listing?.inputbox_label[index] || '';
    });
    inputBox_input.forEach((el, index) => {
      el.querySelector("input").placeholder.textContent = translations[lang]?.listing?.inputbox_input[index] || '';
    });
    inputBox_button.textContent = translations[lang]?.listing?.inputbox_button || '';
  }
}


// About 페이지 업데이트 함수
function updateAboutPage(lang) {
  const aboutSection = document.querySelector(".about-section");
  if (aboutSection) {
    const aboutTitle = aboutSection.querySelector(".about-title");
    const aboutContent = aboutSection.querySelector(".about-content");

    if (aboutTitle) aboutTitle.textContent = translations[lang]?.about?.title;
    if (aboutContent) aboutContent.textContent = translations[lang]?.about?.content;
  }
}

// Product 페이지 업데이트 함수
function updateProductPage(lang) {

}




// Contact 페이지 업데이트 함수
function updateContactPage(lang) {
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    const formTitle = contactForm.querySelector(".form-title");
    const formFields = contactForm.querySelectorAll(".form-field label");

    if (formTitle) formTitle.textContent = translations[lang]?.contact?.title;
    formFields.forEach((label, index) => {
      label.textContent = translations[lang]?.contact?.fields[index] || "";
    });
  }
}

// 언어 변경 핸들러
function handleLangChange(lang) {
  setLanguage(lang);
}


// DOM 로드 후 초기화
document.addEventListener("DOMContentLoaded", () => {
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
