// 통화 관련 기능 분리 (currency.js)
// currency.js
export class CurrencyService {
  constructor() {
    this.exchangeRates = {
      KRW: 1,
      USD: 0.00075,
      JPY: 0.11,
      CNY: 0.0049
    };
  }

  formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    });
    return formatter.format(amount);
  }

  updatePriceDisplay(lang) {
    const basePrice = 99000;
    const currencyMap = {
      'ko': 'KRW',
      'en': 'USD',
      'ja': 'JPY',
      'zh': 'CNY'
    };
    const targetCurrency = currencyMap[lang || 'ko'];

    const allCurrencyElements = document.querySelectorAll('.currency');
    allCurrencyElements.forEach(el => el.style.display = 'none');

    const selectedCurrencyElement = document.querySelector(`.${lang}-price`);
    if (selectedCurrencyElement) {
      selectedCurrencyElement.style.display = 'block';
      selectedCurrencyElement.textContent = this.formatCurrency(basePrice * this.exchangeRates[targetCurrency], targetCurrency);
    }
  }
}

// 언어 처리 관련 기능 분리 (language.js)
// language.js
// const langLabel = {
//   ko: '한국어',
//   en: 'English',
//   ja: '日本語',
//   zh: '中文'
// };
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