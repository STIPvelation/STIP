// /js/currency-service.js 파일 생성
class CurrencyService {
  constructor() {
    this.API_KEY = '90809c4e6dde58e47c6544bb'; // ExchangeRate-API 키
    this.BASE_URL = 'https://v6.exchangerate-api.com/v6/';
    this.basePrice = 99000; // KRW 기준 가격
    this.rates = null;
    this.lastUpdate = null;
    this.updateInterval = 1000 * 60 * 60; // 1시간마다 업데이트
    this.exchangeRates = {
      KRW: 1457.32, // 1 USD = 1457.32 KRW
      USD: 1, // 1 USD
      JPY: 156.15, // 1 USD = 156.15 JPY
      CNY: 7.33, // 1 USD = 7.33   CNY
    };
    this.fee = {
      ko: 0,
      en: 5, // Fee for USD
      ja: 10, // Fee for JPY
      zh: 3, // Fee for CNY
    };
    // 각 언어별 통화 설정 추가
    this.currencyConfig = {
      ko: { currency: 'KRW', rate: this.exchangeRates.KRW, fee: 0 },
      en: { currency: 'USD', rate: this.exchangeRates.USD, fee: 5 },
      ja: { currency: 'JPY', rate: this.exchangeRates.JPY, fee: 10 },
      zh: { currency: 'CNY', rate: this.exchangeRates.CNY, fee: 3 },
    };
  }

  async fetchExchangeRates() {
    try {
      const response = await fetch(
        `${this.BASE_URL}${this.API_KEY}/latest/KRW`
      );
      const data = await response.json();

      if (data.result === 'success') {
        this.rates = {
          USD: data.conversion_rates.USD,
          JPY: data.conversion_rates.JPY,
          CNY: data.conversion_rates.CNY,
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
      CNY: 0.0049,
    };
  }

  formatCurrency(amount, currency, locale) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  }

  // formatCurrencyByLanguage 메서드 추가
  formatCurrencyByLanguage(amount, lang) {
    const currencyFormats = {
      ko: { currency: 'KRW', locale: 'ko-KR' },
      en: { currency: 'USD', locale: 'en-US' },
      ja: { currency: 'JPY', locale: 'ja-JP' },
      zh: { currency: 'CNY', locale: 'zh-CN' },
    };

    const format = currencyFormats[lang] || currencyFormats.en;
    return new Intl.NumberFormat(format.locale, {
      style: 'currency',
      currency: format.currency,
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
      zh: { code: 'CNY', rate: rates.CNY },
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

  calculateFees() {
    // Calculate the equivalent amounts
    const usdAmount = this.basePrice * this.exchangeRates.USD;
    const jpyAmount = this.basePrice * this.exchangeRates.JPY;
    const cnyAmount = this.basePrice * this.exchangeRates.CNY;

    // Store the difference in the fee variable
    this.fee.en = usdAmount - this.basePrice * this.exchangeRates.USD; // Difference for USD
    this.fee.ja = jpyAmount - this.basePrice * this.exchangeRates.JPY; // Difference for JPY
    this.fee.zh = cnyAmount - this.basePrice * this.exchangeRates.CNY; // Difference for CNY
  }

  getFreeValue(currency) {
    return this.currencyConfig[currency]?.free || 0; // 기본값은 0
  }
}

// 전역 객체로 내보내기
window.currencyService = new CurrencyService();
currencyService.calculateFees();
