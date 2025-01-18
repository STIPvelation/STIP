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

class CurrencyService {
  constructor() {
    this.basePrice = 99000; // KRW 기준 가격

    // 고정 환율을 exchangeRates로 이름 변경
    this.exchangeRates = {
      KRW: 1,
      USD: 0.00075, // 1 KRW = 0.00075 USD
      JPY: 0.11, // 1 KRW = 0.11 JPY
      CNY: 0.0049, // 1 KRW = 0.0049 CNY
    };

    // 언어별 통화 설정
    this.currencyConfig = {
      ko: {
        currency: 'KRW',
        locale: 'ko-KR',
        format: {
          style: 'currency',
          currency: 'KRW',
          maximumFractionDigits: 0,
        },
      },
      en: {
        currency: 'USD',
        locale: 'en-US',
        format: {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
      ja: {
        currency: 'JPY',
        locale: 'ja-JP',
        format: {
          style: 'currency',
          currency: 'JPY',
          maximumFractionDigits: 0,
        },
      },
      zh: {
        currency: 'CNY',
        locale: 'zh-CN',
        format: {
          style: 'currency',
          currency: 'CNY',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
    };

    this.API_KEY = '90809c4e6dde58e47c6544bb'; // ExchangeRate-API 키
    this.BASE_URL = 'https://v6.exchangerate-api.com/v6/';
    this.basePrice = 99000; // KRW 기준 가격
    this.rates = null;
    this.lastUpdate = null;
    this.updateInterval = 1000 * 60 * 60; // 1시간마다 업데이트
  }

  formatCurrencyByLanguage(amount, lang) {
    const format = this.currencyMapping[lang] || this.currencyMapping.ko;
    const rate = this.fixedRates[format.currency];
    const convertedAmount = amount * rate;

    return new Intl.NumberFormat(format.locale, {
      style: 'currency',
      currency: format.currency,
      minimumFractionDigits: format.currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: format.currency === 'JPY' ? 0 : 2,
    }).format(convertedAmount);
  }

  async updatePriceDisplay(lang) {
    try {
      return this.formatCurrencyByLanguage(this.basePrice, lang);
    } catch (error) {
      console.error('Price update error:', error);
      // 에러 발생 시 KRW로 표시
      return this.formatCurrencyByLanguage(this.basePrice, 'ko');
    }
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

  formatCurrency(amount, lang) {
    return new Promise((resolve, reject) => {
      try {
        const config = this.currencyConfig[lang] || this.currencyConfig.ko;
        const rate = this.exchangeRates[config.currency];
        const convertedAmount = amount * rate;

        const formattedAmount = new Intl.NumberFormat(
          config.locale,
          config.format
        ).format(convertedAmount);
        resolve(formattedAmount);
      } catch (error) {
        console.error('Currency formatting error:', error);
        // 에러 발생 시 한국 원화로 표시
        resolve(
          new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0,
          }).format(amount)
        );
      }
    });
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
    try {
      return this.formatCurrency(this.basePrice, lang);
    } catch (error) {
      console.error('Price update error:', error);
      return this.formatCurrency(this.basePrice, 'ko');
    }
  }
}

// 전역 객체로 내보내기
window.currencyService = new CurrencyService();
