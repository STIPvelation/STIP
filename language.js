// 언어 처리 관련 기능 분리 (language.js)
// language.js
export const langLabel = {
  // ... (이전 답변과 동일)
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文'
};

export function processTextByLanguage(textarea) {
  // ... (이전 답변과 동일)
  const langCodes = ['ko', 'en', 'ja', 'zh'];
  const results = {};

  langCodes.forEach(langCode => {
    const text = textarea.getAttribute(`data-lang-${langCode}`);
    if (text) {
      results[langCode] = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    }
  });

  return results;
}
export function applyLanguageText(textarea) {
  // ... (이전 답변과 동일)
  const currentLang = localStorage.getItem('preferredLanguage') || 'en';
  const processedText = processTextByLanguage(textarea);
  const currentLangLines = processedText[currentLang];

  if (currentLangLines) {
    textarea.value = currentLangLines.join('\n');
  }

  return processedText;
}

export function updatePageLanguage(lang) {
  // ... (이전 답변과 동일)
  const elements = document.querySelectorAll('[data-lang-' + lang + ']');
  elements.forEach(element => {
    element.textContent = element.getAttribute('data-lang-' + lang);
  });
}

export function getCurrentLanguage() {
  // ... (이전 답변과 동일)
  const currentLang = localStorage.getItem('preferredLanguage');
  if (!currentLang) {
    const browserLang = navigator.language.slice(0, 2);
    currentLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'ko';
    localStorage.setItem('preferredLanguage', currentLang);
  }
  return currentLang;
}

// function processTextByLanguage(textarea) {
//   const langCodes = ['ko', 'en', 'ja', 'zh'];
//   const results = {};

//   langCodes.forEach(langCode => {
//     const text = textarea.getAttribute(`data-lang-${langCode}`);
//     if (text) {
//       results[langCode] = text.split('\n').map(line => line.trim()).filter(line => line !== '');
//     }
//   });

//   return results;
// }

// function applyLanguageText(textarea) {
//   const currentLang = localStorage.getItem('preferredLanguage') || 'en';
//   const processedText = processTextByLanguage(textarea);
//   const currentLangLines = processedText[currentLang];

//   if (currentLangLines) {
//     textarea.value = currentLangLines.join('\n');
//   }

//   return processedText;
// }

// function updatePageLanguage(lang) {
//   const elements = document.querySelectorAll('[data-lang-' + lang + ']');
//   elements.forEach(element => {
//     element.textContent = element.getAttribute('data-lang-' + lang);
//   });
// }

// function getCurrentLanguage() {
//   let currentLang = localStorage.getItem('preferredLanguage');
//   if (!currentLang) {
//     const browserLang = navigator.language.slice(0, 2);
//     currentLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'ko';
//     localStorage.setItem('preferredLanguage', currentLang);
//   }
//   return currentLang;
// }
