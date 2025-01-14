// 페이지별 setLanguage 처리 스크립트
let translations = {}; // 공통 번역 데이터를 담을 객체
let currentPage = 'home'; // 기본 페이지를 'home'으로 설정
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

// 언어 라벨 설정
const langLabel = {
  ko: "한국어",
  en: "English", 
  ja: "日本語",
  zh: "中文"
};

// 페이지별 업데이트 함수 매핑
const pageUpdaters = {
  home: updateHomePage,
  listing: updateListingPage,
  about: updateAboutPage,
  product: updateProductPage,
  contact: updateContactPage,
  contact_contact: updateContactSubPage,
  contact_community: updateContactComPage
};

// 번역 데이터를 로드하는 함수
async function loadTranslations() {
  try {
    const response = await fetch("js/translations.json");
    translations = await response.json();

    // 현재 페이지 확인
    const pathName = window.location.pathname;
    currentPage = pathName.split('/').pop().replace('.html', '') || 'index';

    console.log('loadTranslations: => '+currentPage);

    if (currentPage == 'index')
    {
      currentPage = 'home';
    }
    if (currentPage == 'contact-contact')
    {
      currentPage = 'contact_contact';
    }
    if (currentPage == 'contact-community') {
      currentPage = 'contact_community';
    }
    
    // 기본 언어 설정: 저장된 언어 또는 브라우저 언어
    const browserLang = navigator.language.split("-")[0];
    const savedLang = localStorage.getItem("preferredLanguage");
    const defaultLang = savedLang || (["ko", "en", "ja", "zh"].includes(browserLang) ? browserLang : "en");

    setLanguage(defaultLang);
  } catch (error) {
    console.error("번역 데이터를 로드하는 데 실패했습니다.", error);
  }
}

// 국가 목록을 가져오는 함수


// 현재 언어 설정을 가져오는 함수
function getCurrentLanguage() {
  // 로컬 스토리지에서 저장된 언어 설정을 가져옴
  let currentLang = localStorage.getItem('preferredLanguage');

  // 저장된 설정이 없으면 기본값으로 'ko' 사용
  if (!currentLang) {
    // 브라우저의 언어 설정 확인
    const browserLang = navigator.language.slice(0, 2);
    // 지원하는 언어인지 확인
    currentLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'ko';
    // 설정을 로컬 스토리지에 저장
    localStorage.setItem('preferredLanguage', currentLang);
  }

  return currentLang;
}

// language-control.js 파일에 추가
function handlePageNavigation(filename) {
  // 현재 선택된 언어 가져오기
  const currentLang = localStorage.getItem('preferredLanguage') || 'en';
  let pageReName = '';

  // 파일명에서 확장자 제거
  const pageName = filename.replace('.html', '');

  if (pageName === "contact-contact")
  {
    pageReName = "contact_contact";
  }
  if (pageName === "contact-community") {
    pageReName = "contact_community";
  }  

  // 페이지 정보 저장
  localStorage.setItem('currentPage', pageReName);

  // 현재 언어와 페이지 정보 유지
  handlePageSelection(pageReName);
}


// 페이지 선택 시 호출되는 함수
function handlePageSelection(page) {
  currentPage = page;
  const currentLang = localStorage.getItem("preferredLanguage") || 'en';
  setLanguage(currentLang); // 페이지 변경 시 현재 언어로 콘텐츠 업데이트
}

// 언어 변경 핸들러
async function handleLangChange(lang, fromSidebar = false) {
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang);
  
  // localStorage.setItem('preferredLanguage', lang);
  // updateCurrencyDisplay(lang);

  // // 환율 업데이트
  // currencyService.updatePriceDisplay(lang);
  
  // // 페이지의 다국어 요소 업데이트
  // document.querySelectorAll('[data-lang-' + lang + ']').forEach(element => {
  //   element.textContent = element.getAttribute('data-lang-' + lang);

  //   if (element.hasAttribute('data-placeholder-' + lang)) {
  //     element.placeholder = element.getAttribute('data-placeholder-' + lang);
  //   }
  // });
  // // 국가 목록 다시 로드
  // // fetchCountries(lang);

  // setLanguage(lang);
  // if (fromSidebar) {
  //   handleBurgerMenuClose(); // 사이드바에서 언어 변경 시 사이드바 닫기
  // }
  // 24-12-27 update by lee d.h
  
  try {
    // 로딩 시작
    window.loadingService?.show();

    // 언어 변경 전에 현재 스크롤 위치 저장
    const scrollPosition = window.scrollY;

    // 언어 데이터 로드 및 적용
    await updateLanguageContent(lang);

    // 기존 코드 유지
    document.querySelectorAll('[data-lang-' + lang + ']').forEach(element => {
      element.textContent = element.getAttribute('data-lang-' + lang);
      if (element.hasAttribute('data-placeholder-' + lang)) {
        element.placeholder = element.getAttribute('data-placeholder-' + lang);
      }
    });

    // 기존 다국어 처리
    document.querySelectorAll('[data-lang-' + lang + ']').forEach(element => {
        if (element.tagName.toLowerCase() === 'input') {
            if (element.type === 'text' || element.type === 'number') {
                updateInputValue(element, lang);
            }
        } else {
            element.textContent = element.getAttribute('data-lang-' + lang);
        }
    });

    // 현재 페이지가 listing인 경우 updateListingPage 호출
    if (currentPage === 'listing') {
        await updateListingPage(lang);
    }


    // 드롭다운 버튼 텍스트 업데이트
    const dropdownButton = document.getElementById('dropdownMenuButton1');
    if (dropdownButton && langLabel[lang]) {
      dropdownButton.textContent = langLabel[lang];
    }

    localStorage.setItem('preferredLanguage', lang);

    if (fromSidebar) {
      handleBurgerMenuClose();
    }

    // 사이드바 언어 항목 active 상태 업데이트
    updateSidebarLanguageState(lang);

    // 저장된 스크롤 위치로 복원
    window.scrollTo(0, scrollPosition);

    // 언어 변경 이벤트 발생
    window.dispatchEvent(new Event('languageChanged'));

    

    // 가격 표시 업데이트 추가
    // const priceDisplay = document.getElementById('previewPrice');
    // if (priceDisplay && window.currencyService) {
    //   const formattedPrice = await window.currencyService.updatePriceDisplay(lang);
    //   priceDisplay.value = formattedPrice;
    // }    

    // 페이지 언어 업데이트 추가
    updatePageLanguage(lang);

    setLanguage(lang);

    // 로컬 스토리지에 언어 설정 저장
    localStorage.setItem('preferredLanguage', lang);

    if (fromSidebar) {
      handleBurgerMenuClose();
    }

  } catch (error) {
    console.error('Error updating language and currency:', error);
  } finally {
    // 로딩 종료
    await window.loadingService?.hide();
  }
}

// 사이드바 언어 상태 업데이트 함수
function updateSidebarLanguageState(lang) {
  document.querySelectorAll('.side-bar-list.lang .side-bar-item').forEach(item => {
    item.classList.remove('active');
    if (item.textContent === langLabel[lang]) {
      item.classList.add('active');
    }
  });
}

// 사이드바 언어 선택 이벤트 리스너 설정
function initializeLanguageSelection() {
  // 현재 선택된 언어로 드롭다운 버튼 텍스트 설정
  const currentLang = getCurrentLanguage();
  const dropdownButton = document.getElementById('dropdownMenuButton1');
  if (dropdownButton && langLabel[currentLang]) {
    dropdownButton.textContent = langLabel[currentLang];
  }

  // 사이드바 언어 선택 상태 초기화
  updateSidebarLanguageState(currentLang);
}

// 언어 컨텐츠 업데이트 함수
async function updateLanguageContent(lang) {
  // 실제 업데이트가 필요한 경우 지연 시간 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300));

  // 여기에 실제 언어 데이터 업데이트 로직 구현
  if (translations[lang]) {
    currentLang = lang;
    updatePageLanguage(lang);
  } else {
    throw new Error(`Translation not found for language: ${lang}`);
  }
}
// 폼 언어 업데이트 함수
function updateFormLanguage(form, lang) {
  // 일반 텍스트 요소 업데이트
  form.querySelectorAll(`[data-lang-${lang}]`).forEach(element => {
    element.textContent = element.getAttribute(`data-lang-${lang}`);
  });

  // placeholder 업데이트
  form.querySelectorAll(`[data-lang-${lang}-placeholder]`).forEach(element => {
    element.placeholder = element.getAttribute(`data-lang-${lang}-placeholder`);
  });

  // 금액 표시 업데이트
  const amountElements = form.querySelectorAll('[data-amount]');
  amountElements.forEach(element => {
    const amount = parseInt(element.getAttribute('data-amount'));
    const formattedAmount = formatCurrencyByLang(amount, lang);
    element.textContent = formattedAmount;
  });  

}

// 언어별 통화 포맷 함수
function formatCurrencyByLang(amount, lang) {
  const currencyFormats = {
    ko: { currency: 'KRW', locale: 'ko-KR' },
    en: { currency: 'USD', rate: 0.00075 },
    ja: { currency: 'JPY', rate: 0.11 },
    zh: { currency: 'CNY', rate: 0.0049 }
  };

  const format = currencyFormats[lang];
  const convertedAmount = format.rate ? amount * format.rate : amount;

  return new Intl.NumberFormat(format.locale || lang, {
    style: 'currency',
    currency: format.currency
  }).format(convertedAmount);
}

// updatePageLanguage 함수 정의
function updatePageLanguage(lang) {
  // 페이지의 모든 다국어 요소 업데이트
  document.querySelectorAll(`[data-lang-${lang}]`).forEach(element => {
    element.textContent = element.getAttribute(`data-lang-${lang}`);
  });


  // productPreviewForm이 있는 경우에만 처리
  const productPreviewForm = document.getElementById('productPreviewForm');
  if (productPreviewForm) {
    // 상품 미리보기 폼 텍스트 업데이트
    const formTitle = productPreviewForm.querySelector('.form-title');
    const labels = productPreviewForm.querySelectorAll('.label-text');
    const submitButton = productPreviewForm.querySelector('button[type="submit"]');

    // 가격 업데이트
    const priceInput = document.getElementById('previewPrice');
    // if (priceInput && window.currencyService) {
    //   window.currencyService.updatePriceDisplay(lang).then(formattedPrice => {
    //     priceInput.value = formattedPrice;
    //   });
    // }
  }

  // orderForm 업데이트
  const orderForm = document.getElementById('orderForm');
  if (orderForm && orderForm.style.display !== 'none') {
    updateFormLanguage(orderForm, lang);
  }
}

// 언어 설정 함수
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`${lang} 언어에 대한 번역 데이터가 없습니다.`);
    return;
  }

  // 공통 요소 업데이트
  updateCommonElements(lang);

  // 현재 페이지에 맞는 업데이트 함수 호출
  const updateFunc = pageUpdaters[currentPage];
  if (updateFunc) {
    updateFunc(lang);
  } else {
    console.warn(`${currentPage} 페이지에 대한 업데이트 함수가 없습니다.`);
  }

  // 언어 선택 UI 업데이트
  updateLanguageUI(lang);

  // 선택한 언어를 로컬 저장소에 저장
  localStorage.setItem("preferredLanguage", lang);

  // closeSideBar();
}

// 언어 선택 UI 업데이트
function updateLanguageUI(lang) {
  // 드롭다운 버튼 텍스트 업데이트
  const dropdownButton = document.getElementById("dropdownMenuButton1");
  if (dropdownButton) {
    dropdownButton.textContent = langLabel[lang];
  }

  // 사이드바 및 드롭다운의 언어 항목 active 클래스 업데이트
  document.querySelectorAll('.side-bar-item.lang span, .dropdown-item').forEach(el => {
    el.classList.remove('active');
    if (el.textContent.trim() === langLabel[lang]) {
      el.classList.add('active');
    }
  });
}

// 공통 요소 업데이트 함수
function updateCommonElements(lang) {
  // 네비게이션 메뉴 업데이트
  document.querySelectorAll('[data-page]').forEach(el => {
    const key = el.getAttribute('data-page');
    if (key && translations[lang].nav[key]) {
      el.textContent = translations[lang].nav[key];
    }
  });

  // 푸터 업데이트
  const footerWrapper = document.querySelector(".footer-wrapper");
  if (footerWrapper) {
    const footerLogo = footerWrapper.querySelector(".footer-logo span");
    const companyName = footerWrapper.querySelector(".company-name");
    const companyInfoGrid = footerWrapper.querySelector(".company-info-grid");

    if (footerLogo) footerLogo.textContent = translations[lang].footer.slogan;
    if (companyName) companyName.textContent = translations[lang].footer.company_name;
    if (companyInfoGrid && translations[lang].footer.company_info) {
      const info = translations[lang].footer.company_info;
      companyInfoGrid.innerHTML = `
        <span>${info.ceo}</span>
        <span>${info.address}</span>
        <span>${info.phone}</span>
        <span>${info.email}</span>
        <span>${info.business_number}</span>
      `;
    }
  }
}

// 기존의 페이지별 업데이트 함수들 유지
function updateHomePage(lang) {
  const contentWrapper = document.querySelector(".content-wrapper");  

  if (contentWrapper && translations[lang].main) {
    // ... 기존 홈페이지 업데이트 코드 ...
    const logoWrapper = contentWrapper.querySelector(".logo-wrapper p");
    const letterTitles = contentWrapper.querySelectorAll(".letter-title");
    const contentBottomText = contentWrapper.querySelectorAll(".content-bottom .text p");
    const listingButton = contentWrapper.querySelector(".normal-button a");
    const watchVideoSpan = contentWrapper.querySelector(".watch-video-area span");

    if (logoWrapper) logoWrapper.innerHTML = translations[lang]?.main?.logo_text;
    letterTitles.forEach((el, index) => {
      const strongSpan = el.querySelector("span.strong");
      const spans = el.querySelectorAll("span");
      if (spans.length >= 2) {
          const strongSpan = spans[0];  // 첫 번째 span (S, T, I, P)
          const textSpan = spans[1];    // 두 번째 span (텍스트)
          
          // 아시아 언어(ko, ja, zh)일 때는 첫 번째 span 숨기기
          if (['ko', 'ja', 'zh'].includes(lang)) {
              strongSpan.style.display = 'none';
              // 텍스트 span의 text-transform 제거
              textSpan.style.textTransform = 'none';
          } else {
              // 영어일 때는 보이기
              strongSpan.style.display = 'inline';
              // 영어일 때는 첫 글자 대문자로
              textSpan.style.textTransform = 'none';
          }
      }

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

// br 태그를 줄바꿈으로 변환하는 private 메서드 추가
function convertBrToNewline(text) {
  // 다양한 형태의 br 태그 처리
  return text
      .replace(/<br\s*\/?>/gi, '\n')  // <br>, <br/>, <br /> 등 모든 형태의 br 태그 처리
      .replace(/\\n/g, '\n')          // \n 문자열을 실제 줄바꿈으로 변환
      .replace(/\n\s*\n/g, '\n\n')    // 연속된 줄바꿈 정리
      .replace(/^\s+|\s+$/g, '');    // 앞뒤 공백 제거
}

function adjustTextareaHeight() {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight+2}px`;
}


function updateListingPage(lang) {
  // 제품 정보 데이터 정의
  const productData = {
      ko: {
          productName: '특허뉴스PDF'
      },
      en: {
          productName: 'Patent News PDF'
      },
      ja: {
          productName: '特許ニュースPDF'
      },
      zh: {
          productName: '专利新闻PDF'
      }
  };

  // 제품명 업데이트
  const previewProductName = document.getElementById('previewProductName');
  if (previewProductName && productData[lang]) {
      previewProductName.value = productData[lang].productName;
  }

  // 가격 업데이트
  const previewPrice = document.getElementById('previewPrice');
  if (previewPrice && window.currencyService) {
      // 가격 업데이트를 즉시 실행
      window.currencyService.formatCurrency(99000, lang)
          .then(formattedPrice => {
              previewPrice.value = formattedPrice;
          })
          .catch(error => {
              console.error('Error updating price:', error);
              // 에러 시 기본 한국어 가격 표시
              previewPrice.value = '₩99,000';
          });
  } else {
      // currencyService가 없는 경우 기본 한국어 가격 표시
      if (previewPrice) {
          previewPrice.value = '₩99,000';
      }
  }


  const previewProductEx = document.getElementById('previewProductEx');
  const formData = translations[lang]?.listing?.form;
  if (!formData) return;

  if (previewProductEx) {
    const contentArray = translations[lang].listing.previewProductEx;
    let formattedContent = contentArray.join(', ');
        
    // this.#textarea.value = formattedContent;
    previewProductEx.value = formattedContent;
  }
  
  

  // 라벨 업데이트
  const nameLabel = document.querySelector('label[for="name"]');
  const emailLabel = document.querySelector('label[for="email"]');
  const mobileLabel = document.querySelector('label[for="mobile"]');
  // const uploadfileLabel = document.querySelector('label[for="uploadfile"]');
  // const file_upload_text = document.querySelector('.file-upload-text');
  // const file_delete_text = document.querySelector('.remove-file');
  const smart5Label = document.querySelector('label[for="submit"]');
  // const file_aria_label = document.querySelectorAll('[aria-label]');

  // const input_file = document.querySelector('input[type="file"]');
  // const fileInput = document.getElementById('file'); // input 요소 가져오기
  // const remove_file = document.querySelector('.remove-file')

  if (nameLabel) nameLabel.textContent = formData.labels.name;
  if (emailLabel) emailLabel.textContent = formData.labels.email;
  if (mobileLabel) mobileLabel.textContent = formData.labels.mobile;
  // if (uploadfileLabel) uploadfileLabel.textContent = formData.labels.uploadfile;
  // if (file_upload_text) file_upload_text.textContent = formData.labels.fileUploadTxt;
  // if (file_delete_text) file_delete_text.textContent = formData.labels.fileDeleteTxt;

  // fileInput.setAttribute('aria-label', formData.labels.fileSelectAria);
  // remove_file.setAttribute('aria-label', formData.labels.fileDeleteAria);

  
 

  // SMART5 라벨 특별 처리
  if (smart5Label) {
    const linkText = smart5Label.querySelector('.link-text');
    linkText.setAttribute('aria-label', formData.labels.ariaLabel.smart5Aria);
    if (linkText) {
      linkText.textContent = formData.labels.smart5.link;
    }
    // 기존 텍스트 노드 업데이트
    const textNodes = Array.from(smart5Label.childNodes)
      .filter(node => node.nodeType === 3); // 텍스트 노드만 선택
    if (textNodes.length > 0) {
      textNodes[textNodes.length - 1].textContent = formData.labels.smart5.text;
    }
  }

  // placeholder 업데이트
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const mobileInput = document.getElementById('mobile');

  if (nameInput) nameInput.placeholder = formData.placeholders.name;
  if (emailInput) emailInput.placeholder = formData.placeholders.email;
  if (mobileInput) mobileInput.placeholder = formData.placeholders.mobile;

  // 제출 버튼 업데이트
  const submitButton = document.querySelector('#submit');
  if (submitButton) {
    submitButton.textContent = formData.button;
  }
  const contentWrapper = document.querySelector(".content-wrapper");
  const title_area = document.querySelector(".title-area");
  // const letterTitle = contentWrapper.querySelector(".letter-title h1");
  // const letterTitlep = contentWrapper.querySelectorAll(".letter-title p");
  if (contentWrapper) {
    const letterTitle = title_area.querySelector(".letter-title > span");
    const letterTitlep = title_area.querySelectorAll("p");
    letterTitle.textContent = translations[lang]?.listing?.letter_title || "";
    letterTitlep.forEach((el, index) => {
      const text = translations[lang]?.listing?.letter_title_p[index] || "";
      if (text) {
        const firstLetter = text.charAt(0);
        const restOfText = text.slice(1);
        el.innerHTML = `<span>${firstLetter}</span>${restOfText}`;
      }
    });
  }
}

// function updateListingPage(lang) {
//   // ... 기존 리스팅 페이지 업데이트 코드 ...
//   const contentWrapper = document.querySelector(".content-wrapper");
//   const title_area = document.querySelectorAll(".title-area");
//   const letterTitle = contentWrapper.querySelector(".letter-title h1");
//   const letterTitlep = contentWrapper.querySelectorAll(".letter-title p");
//   const inputBox_labels = document.querySelectorAll(".input-box label");
//   const inputBox_inputs = document.querySelectorAll(".input-box input");
//   const inputBox_button = document.querySelector(".input-box button");

//   if (contentWrapper) {
//     // const letterTitle = contentWrapper.querySelector(".letter-title h1");
//     // const letterTitlep = contentWrapper.querySelectorAll(".letter-title p");
//     const inputBox_labels = document.querySelectorAll(".input-box label");
//     const inputBox_inputs = document.querySelectorAll(".input-box input");
//     // h1 태그의 span 안 텍스트 변경
//     const h1Span = document.querySelector(".letter-title span");
//     if (h1Span) {
//       h1Span.textContent = translations[lang]?.listing?.letter_title || ""; // 새로운 텍스트 설정
//     }

//     const paragraphs = document.querySelectorAll(".title-area p");

//     paragraphs.forEach((p, index) => {
//         // 기존 텍스트에서 span 안의 텍스트 제거 후 변경
//       p.textContent = translations[lang]?.listing?.letter_title_p[index] || "";
//     });

//     inputBox_labels.forEach((lbl, index) => {
//       lbl.textContent = translations[lang]?.listing?.inputbox_labels[index] || '';
//     });

//     inputBox_inputs.forEach((input, index) => {
//       input.placeholder = translations[lang]?.listing?.inputbox_inputs[index] || '';
//     });
    


//     // letterTitle.textContent = translations[lang]?.listing?.letter_title || "";

//     // letterTitlep.forEach((el, index) => {
//     //   el.textContent = translations[lang]?.listing?.letter_titles_p[index] || "";
//     // });
//     // inputBox_labels.forEach((el, index) => {
//     //   el.textContent = translations[lang]?.listing?.inputbox_labels[index] || '';
//     // });
//     // inputBox_inputs.forEach((el, index) => {
//     //   el.placeholder.textContent = translations[lang]?.listing?.inputbox_inputs[index] || '';
//     // });
//     inputBox_button.textContent = translations[lang]?.listing?.inputbox_button || '';
//   }
// }

function updateAboutPage(lang) {
  // ... 기존 어바웃 페이지 업데이트 코드 ...
  const contentWrapper = document.querySelector(".content-wrapper");
  
  if (contentWrapper) {
    // title-area의 h6 텍스트 변경
    const h6Element = document.querySelector(".title-area h6");
    if (h6Element) {
      h6Element.textContent = translations[lang]?.about?.title_area_h6 || "";
    }
    // title-area의 h1 span 텍스트 변경
    const h1Span = document.querySelector(".title-area .letter-title span");
    if (h1Span) {
      h1Span.textContent = translations[lang]?.about?.title_area_h1 || "";
    }
    
    // content-area의 p 태그에서 span 태그 제외 나머지 텍스트 변경
    const contentParagraphs = document.querySelectorAll(".content-area p");
    contentParagraphs.forEach((p, index) => {
      p.innerHTML = translations[lang]?.about?.content_area[index] || "";
    })

    // bottom-area의 p 태그 텍스트 변경
    const bottomParagraphs = document.querySelectorAll(".bottom-area p");
    bottomParagraphs.forEach((btm, index) => {
      btm.textContent = translations[lang]?.about?.bottom_area[index] || "";
    })
  }
}

function updateProductPage(lang) {
  // ... 기존 프로덕트 페이지 업데이트 코드 ...
  const home_visual = document.querySelector('.home-visual .container');
  const productContentArea = document.querySelector(".product-content-area");
  if (productContentArea) {
    const letter_title = document.querySelector(".letter-title");
    letter_title.innerHTML = translations[lang]?.product?.letter_title || "";
  }
  if (home_visual) {
    const text_content = document.querySelector('.text-content h2.main-title');
    text_content.innerHTML = translations[lang]?.product?.letter_title || "";
  }
}

function updateContactPage(lang) {
  // ... 기존 컨택트 페이지 업데이트 코드 ...
  // const contactForm = document.querySelector(".contact-form");
  // if (contactForm) {
  //   const formTitle = contactForm.querySelector(".form-title");
  //   const formFields = contactForm.querySelectorAll(".form-field label");

  //   if (formTitle) formTitle.textContent = translations[lang]?.contact?.title;
  //   formFields.forEach((label, index) => {
  //     label.textContent = translations[lang]?.contact?.fields[index] || "";
  //   });
  // }

  const contactWrapper = document.querySelector(".contact-wrapper");

  if (contactWrapper) {
    // title-wrapper의 h1 span 텍스트 변경
    const h1Span = document.querySelector(".title-wrapper .letter-title span");
    if (h1Span) {
      h1Span.textContent = translations[lang]?.contact?.title_h1 || "";
    }

    // const title_wrapper_h1_span = document.querySelector(".title-wrapper h1 span");

    // title-wrapper의 span 텍스트 변경 (소개 텍스트)
    const introText = document.querySelector(".title-wrapper span:nth-of-type(2)");
    if (introText) {
      introText.innerHTML = translations[lang]?.contact?.intro_text || "";
    }

    // 모든 텍스트 요소 선택
    const contactTitleSpan = document.querySelector('.row-wrapper .radius-box:first-child .title-wrapper h1 span');
    const communityTitleSpan = document.querySelector('.row-wrapper .radius-box:last-child .title-wrapper h1 span');
    const contactSpan = document.querySelector('.row-wrapper .radius-box:first-child .title-wrapper > span:not(h1 span)');
    const communitySpan = document.querySelector('.row-wrapper .radius-box:last-child .title-wrapper > span:not(h1 span)');

    contactTitleSpan.textContent = translations[lang]?.contact?.contact_title || "";
    communityTitleSpan.textContent = translations[lang]?.contact?.community_title || "";

    contactSpan.innerHTML = translations[lang]?.contact?.contact_description || "";
    communitySpan.innerHTML = translations[lang]?.contact?.community_description || "";


    // row-wrapper 내 radius-box 요소 텍스트 변경
    const radiusBoxes = document.querySelectorAll(".row-wrapper .radius-box");
    const boxData = translations[lang]?.contact?.radius_boxes || [];   
    

    radiusBoxes.forEach((box, index) => {
      // const title_wrapper_h1 = box.querySelector(".title-wrapper h1");
      // const title_wrpper_span = box.querySelector(".title-wrapper h1 span span");

      const button = box.querySelector(".normal-button a");

      if (button) {
        button.textContent = boxData[index]?.button_text || "";
        button.href = boxData[index]?.link || "#";
      }
    });
  }
}

function updateContactSubPage(lang) {
  const letter_title = document.querySelector(".letter-title span");
  letter_title.textContent = translations[lang].contact_contact.letter_title;

  const formData = translations[lang].contact_contact.form;
  if (!formData) return;

  // First Name
  const firstNameLabel = document.querySelector('label[for="firstName"]');
  const firstNameInput = document.getElementById('firstName');
  if (firstNameLabel) firstNameLabel.textContent = formData.name.first.label;
  if (firstNameInput) firstNameInput.placeholder = formData.name.first.placeholder;

  // Last Name
  const lastNameLabel = document.querySelector('label[for="lastName"]');
  const lastNameInput = document.getElementById('lastName');
  if (lastNameLabel) lastNameLabel.textContent = formData.name.last.label;
  if (lastNameInput) lastNameInput.placeholder = formData.name.last.placeholder;

  // Company
  const companyLabel = document.querySelector('label[for="company"]');
  const companyInput = document.getElementById('company');
  if (companyLabel) companyLabel.textContent = formData.company.label;
  if (companyInput) companyInput.placeholder = formData.company.placeholder;

  // Job Title
  const jobTitleLabel = document.querySelector('label[for="jobTitle"]');
  const jobTitleInput = document.getElementById('jobTitle');
  if (jobTitleLabel) jobTitleLabel.textContent = formData.job_title.label;
  if (jobTitleInput) jobTitleInput.placeholder = formData.job_title.placeholder;

  // Mobile
  const mobileLabel = document.querySelector('label[for="mobile"]');
  const mobileInput = document.getElementById('mobile');
  if (mobileLabel) mobileLabel.textContent = formData.mobile.label;
  if (mobileInput) mobileInput.placeholder = formData.mobile.placeholder;

  // Country
  const countryLabel = document.querySelector('label[for="country"]');
  const countryInput = document.getElementById('country');
  if (countryLabel) countryLabel.textContent = formData.country.label;
  if (countryInput) countryInput.placeholder = formData.country.placeholder;

  // Email
  const emailLabel = document.querySelector('label[for="email"]');
  const emailInput = document.getElementById('email');
  if (emailLabel) emailLabel.textContent = formData.email.label;
  if (emailInput) emailInput.placeholder = formData.email.placeholder;

  // Subject
  // Subject 부분 수정
  // Subject 라벨
  const subjectLabel = document.querySelector('label[for="subject"]');
  const subjectInput = document.getElementById('subject');
  if (subjectLabel) {
    subjectLabel.textContent = formData.subject.label;
  }

  if (subjectInput) {
    subjectInput.placeholder = formData.subject.selectoption;
  }

  // subjectInput.textContent = formData.subject.placeholder;

  // Subject 선택 박스
  // const selectBox = document.querySelector('.select-box');
  
  
  // if (selectBox) {
  //   // placeholder (기본 선택 텍스트)
  //   // const placeholder = selectBox.querySelector('.selected-item');
  //   // if (placeholder) {
  //   //   placeholder.textContent = formData.subject.placeholder;
  //   // }

  //   // 옵션 목록
  //   // const optionsList = selectBox.querySelectorAll('.select-item');
  //   // if (optionsList.length > 0) {
  //   //   optionsList.forEach(option => {
  //   //     const optionType = option.getAttribute('aria-label')?.toLowerCase().replace(' ', '_');
  //   //     if (optionType && formData.subject.options[optionType]) {
  //   //       option.textContent = formData.subject.options[optionType];
  //   //     }
  //   //   });
  //   // }
  // }

  // Message
  const messageLabel = document.querySelector('label[for="message"]');
  const messageInput = document.getElementById('message');
  if (messageLabel) messageLabel.textContent = formData.message.label;
  if (messageInput) messageInput.placeholder = formData.message.placeholder;

  // Submit Button
  const submitButton = document.querySelector('form .normal-button');
  if (submitButton) submitButton.textContent = formData.submit;
}

function updateContactComPage(lang) {
  const pageData = translations[lang].contact_community;
  if (!pageData) return;

  // 메인 타이틀과 설명 업데이트
  const mainTitle = document.querySelector('.letter-title span');
  const mainDesc = document.querySelector('.title-wrapper > span');

  if (mainTitle) mainTitle.textContent = pageData.main_title;
  if (mainDesc) mainDesc.innerHTML = pageData.main_description.replace('\n', '<br/>');

  // Community support 섹션 업데이트
  const communityBoxes = document.querySelectorAll('.radius-box.community');

  // 첫 번째 박스 (Community support)
  if (communityBoxes[0]) {
    const commTitle = communityBoxes[0].querySelector('h6');
    const commDesc = communityBoxes[0].querySelector('span');

    if (commTitle) commTitle.innerHTML = pageData.community_support.title.replace('\n', '<br/>');
    if (commDesc) commDesc.innerHTML = pageData.community_support.description.replace('\n', '<br/>');
  }

  // 두 번째 박스 (Listing support)
  if (communityBoxes[1]) {
    const listTitle = communityBoxes[1].querySelector('h6');
    const listDesc = communityBoxes[1].querySelector('span');
    const listButton = communityBoxes[1].querySelector('.normal-button span');

    if (listTitle) listTitle.innerHTML = pageData.listing_support.title.replace('\n', '<br/>');
    if (listDesc) listDesc.innerHTML = pageData.listing_support.description.replace('\n', '<br/>');
    if (listButton) listButton.textContent = pageData.listing_support.button;
  }
}

// 결제 폼 언어 업데이트 함수
function updatePaymentForm(lang) {
  const paymentData = translations[lang].payment;
  if (!paymentData) return;

  // 금액 관련 요소 업데이트
  const amountLabel = document.querySelector('.amount label');
  const amountInput = document.querySelector('.amount input');
  const currencySpan = document.querySelector('.amount .currency');

  if (amountLabel) {
    amountLabel.textContent = paymentData.amount;
  }

  if (amountInput) {
    amountInput.value = paymentData.amount_value;
  }

  if (currencySpan) {
    currencySpan.textContent = paymentData.currency;
  }

  // 기타 결제 폼 요소들 업데이트
  document.querySelector('#paymentForm button[type="submit"]').textContent =
    paymentData.process_payment;
}

// 통화 형식 지원
const currencyFormats = {
  ko: { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 },
  en: { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 },
  ja: { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 },
  zh: { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }
};

function formatCurrency(amount, lang) {
  try {
    return new Intl.NumberFormat(lang, currencyFormats[lang]).format(amount);
  } catch (e) {
    console.error('Currency formatting error:', e);
    return amount.toLocaleString() + ' ' + translations[lang].payment.currency;
  }
}

function updateListingPage(lang) {
    // 제품 정보 데이터 정의
    const productData = {
        ko: {
            productName: '특허뉴스PDF'
        },
        en: {
            productName: 'Patent News PDF'
        },
        ja: {
            productName: '特許ニュースPDF'
        },
        zh: {
            productName: '专利新闻PDF'
        }
    };

    // 제품명 업데이트
    const previewProductName = document.getElementById('previewProductName');
    const previewPrice = document.getElementById('previewPrice');

    if (previewProductName && productData[lang]) {
        previewProductName.value = productData[lang].productName;
    }

    // 가격 업데이트
    if (previewPrice && window.currencyService) {
        window.currencyService.updatePriceDisplay(lang).then(formattedPrice => {
            previewPrice.value = formattedPrice;
        });
    }

    // ProductEx textarea 업데이트
    const previewProductEx = document.getElementById('previewProductEx');
    if (previewProductEx) {
        const contentArray = translations[lang].listing.previewProductEx;
        if (contentArray) {
            let formattedContent = contentArray.join('');
            formattedContent = convertBrToNewline(formattedContent);
            previewProductEx.value = formattedContent;
        }
    }
}

// 사이드바 제어 함수들
function handleBurgerMenu() {
  // const sideBarContainer = document.querySelector('.side-bar-container');
  // if (sideBarContainer) {
  //   sideBarContainer.classList.add('open');
  // }
  const nav = document.querySelector(".side-bar-container");
  nav.classList.add("open");
  nav.classList.remove("close");
}

function handleBurgerMenuClose() {
  // const sideBarContainer = document.querySelector('.side-bar-container');
  // if (sideBarContainer) {
  //   sideBarContainer.classList.remove('close');
  // }
  const nav = document.querySelector(".side-bar-container");
  // nav.classList.remove("open");
  // nav.classList.add("close");
  if (nav) {
    nav.classList.remove("open");
    nav.classList.add("close");
  }
}

// Function to close sidebar
function closeSideBar() {
    const sideBarContainer = document.querySelector('.side-bar-container');
    const burgerMenu = document.querySelector('.burger-menu');

    if (sideBarContainer) {
        // sideBarContainer.classList.remove('active');
        sideBarContainer.classList.remove("open");
        sideBarContainer.classList.add("close");
    }

    // Reset burger menu icon if needed
    if (burgerMenu) {
        burgerMenu.setAttribute('onclick', 'handleBurgerMenu()');
    }
}

// 초기화 함수
async function initialize() {
  try {
    await loadTranslations();
    currentLang = getCurrentLanguage();
    await updateLanguageContent(currentLang);

    // 사이드바 초기화
    initializeSidebar();

    // 현재 페이지 업데이트
    const updater = pageUpdaters[currentPage];
    if (updater) {
      await updater(currentLang);
    }

    window.dispatchEvent(new Event('languageChanged'));
  } catch (error) {
    console.error('Initialization error:', error);
    window.toastService?.show('Failed to initialize the page', 'error');
  }
}

// 사이드바 초기화
function initializeSidebar() {
  const sidebarBackground = document.querySelector('.sidebar-background');
  if (sidebarBackground) {
    sidebarBackground.addEventListener('click', handleBurgerMenuClose);
  }
}

// 사이드바 언어 선택 이벤트 리스너 설정
function initializeSidebarLanguageSelection() {
  const sidebarLangItems = document.querySelectorAll('.side-bar-list.lang .side-bar-item');
  
  sidebarLangItems.forEach(item => {
    item.addEventListener('click', (event) => {
      const lang = event.currentTarget.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      
      if (lang) {
        handleLangChange(lang, true); // true는 사이드바에서 호출됨을 나타냄
        
        // 다른 항목의 active 클래스 제거
        sidebarLangItems.forEach(langItem => {
          langItem.classList.remove('open');
        });
        
        // 선택된 항목에 active 클래스 추가
        event.currentTarget.classList.add('open');
      }
    });
  });
}

// DOM 로드 후 초기화
// document.addEventListener("DOMContentLoaded", () => {
//   loadTranslations();
  
//   const currentLang = getCurrentLanguage();

//   updateListingPage(currentLang);
  
//   document.querySelector('.sidebar-background').addEventListener('click', handleBurgerMenuClose);
  
// });

// DOM 로드 후 초기화
// 25-01-11 update 
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 번역 데이터 로드
    await loadTranslations();
    
    // 현재 언어 가져오기
    currentLang = getCurrentLanguage();

    // 언어 초기 설정 적용
    await updateLanguageContent(currentLang);

    // 언어 선택 UI 초기화
    initializeLanguageSelection();

    // 사이드바 이벤트 리스너 설정
    initializeSidebarLanguageSelection();

    // 사이드바 배경 클릭 시 닫기 이벤트 설정
    const sidebarBackground = document.querySelector('.sidebar-background');
    if (sidebarBackground) {
      sidebarBackground.addEventListener('click', handleBurgerMenuClose);
    }

  } catch (error) {
    console.error('Initialization error:', error);
    window.toastService?.show('Failed to initialize the page', 'error');
  }
});
