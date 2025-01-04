// /js/currency-service.js 파일 생성
/**
 * currency-service.js
 * 통화 관련 기능을 처리하는 서비스
 * 
 * 주요 기능:
 * - 환율 정보 관리
 * - 통화 포맷팅
 * - 통화 표시 업데이트
 */

// class CurrencyService {
//   constructor() {
//     // 기본 환율 설정
//     this.exchangeRates = {
//       KRW: 1,
//       USD: 0.00075,  // 1 KRW = 0.00075 USD
//       JPY: 0.11,     // 1 KRW = 0.11 JPY
//       CNY: 0.0049    // 1 KRW = 0.0049 CNY
//     };
//   }

//   formatCurrency(amount, currency) {
//     const formatter = new Intl.NumberFormat(undefined, {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: currency === 'JPY' ? 0 : 2,
//       maximumFractionDigits: currency === 'JPY' ? 0 : 2
//     });
//     return formatter.format(amount);
//   }

//   updateCurrencyDisplay() {
//     const basePrice = 99000; // KRW
//     const currencies = document.querySelectorAll('.currency');

//     currencies.forEach(currency => {
//       if (currency.classList.contains('krw')) {
//         currency.textContent = this.formatCurrency(basePrice, 'KRW');
//       } else if (currency.classList.contains('usd')) {
//         currency.textContent = this.formatCurrency(basePrice * this.exchangeRates.USD, 'USD');
//       } else if (currency.classList.contains('jpy')) {
//         currency.textContent = this.formatCurrency(basePrice * this.exchangeRates.JPY, 'JPY');
//       } else if (currency.classList.contains('cny')) {
//         currency.textContent = this.formatCurrency(basePrice * this.exchangeRates.CNY, 'CNY');
//       }
//     });
//   }

//   async updateExchangeRates() {
//     try {
//       // TODO: 실제 환율 API 연동 필요
//       const response = await fetch('90809c4e6dde58e47c6544bb');
//       const data = await response.json();
//       this.exchangeRates = data.rates;
//       console.log('Exchange rates updated');
//     } catch (error) {
//       console.error('Failed to update exchange rates:', error);
//     }
//   }
// }

// // 전역으로 사용할 수 있도록 인스턴스 생성
// const currencyService = new CurrencyService();

// // 1시간마다 환율 업데이트
// setInterval(() => {
//   currencyService.updateExchangeRates();
// }, 1000 * 60 * 60);


class CurrencyService {
  constructor() {
    this.API_KEY = '90809c4e6dde58e47c6544bb'; // ExchangeRate-API 키
    this.BASE_URL = 'https://v6.exchangerate-api.com/v6/';
    this.basePrice = 99000; // KRW 기준 가격
    this.rates = null;
    this.lastUpdate = null;
    this.updateInterval = 1000 * 60 * 60; // 1시간마다 업데이트
  }

  async fetchExchangeRates() {
    try {
      const response = await fetch(`${this.BASE_URL}${this.API_KEY}/latest/KRW`);
      const data = await response.json();

      if (data.result === 'success') {
        this.rates = {
          USD: data.conversion_rates.USD,
          JPY: data.conversion_rates.JPY,
          CNY: data.conversion_rates.CNY
        };
        this.lastUpdate = new Date();
        return this.rates;
      }
      return this.getBackupRates();
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      return this.getBackupRates();
    }
  }

  getBackupRates() {
    return {
      USD: 0.00075,
      JPY: 0.11,
      CNY: 0.0049
    };
  }

  formatCurrency(amount, currency, locale) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(amount);
  }

  // formatCurrencyByLanguage 메서드 추가
  formatCurrencyByLanguage(amount, lang) {
    const currencyFormats = {
      ko: { currency: 'KRW', locale: 'ko-KR' },
      en: { currency: 'USD', locale: 'en-US' },
      ja: { currency: 'JPY', locale: 'ja-JP' },
      zh: { currency: 'CNY', locale: 'zh-CN' }
    };

    const format = currencyFormats[lang] || currencyFormats.en;
    return new Intl.NumberFormat(format.locale, {
      style: 'currency',
      currency: format.currency
    }).format(amount);
  }

  async updatePriceDisplay(lang) {
    const rates = await this.fetchExchangeRates();
    // const localeMap = {
    //   ko: 'ko-KR',
    //   en: 'en-US',
    //   ja: 'ja-JP',
    //   zh: 'zh-CN'
    // };

    const currencyMap = {
      ko: { code: 'KRW', rate: 1 },
      en: { code: 'USD', rate: rates.USD },
      ja: { code: 'JPY', rate: rates.JPY },
      zh: { code: 'CNY', rate: rates.CNY }
    };

    const mapping = currencyMap[lang] || currencyMap.ko;
    const amount = this.basePrice * mapping.rate;
    // const formattedAmount = this.formatCurrency(
    //   amount,
    //   mapping.code,
    //   localeMap[lang] || 'ko-KR'
    // );

    // return formattedAmount;
    return this.formatCurrencyByLanguage(amount, lang);
  }
}

// 전역 객체로 내보내기
window.currencyService = new CurrencyService();

