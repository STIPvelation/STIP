// exchange-rate-service.js
class ExchangeRateService {
  constructor() {
    this.baseUrl =
      'https://v6.exchangerate-api.com/v6/90809c4e6dde58e47c6544bb/latest/USD';
    this.rates = null;
    this.lastUpdate = null;
    this.updateInterval = 1000 * 60 * 60; // 1시간마다 업데이트
    this.basePriceKRW = 99000; // 기준 가격 (KRW)
    // 언어별 통화 설정
    this.currencyConfig = {
      ko: { currency: 'KRW', locale: 'ko-KR', minDigits: 0, maxDigits: 0 },
      en: { currency: 'USD', locale: 'en-US', minDigits: 2, maxDigits: 2 },
      ja: { currency: 'JPY', locale: 'ja-JP', minDigits: 0, maxDigits: 0 },
      zh: { currency: 'CNY', locale: 'zh-CN', minDigits: 2, maxDigits: 2 },
    };
  }

  async initialize() {
    try {
      await this.updateRates();
      // 주기적 업데이트 설정
      setInterval(() => this.updateRates(), this.updateInterval);
    } catch (error) {
      console.error('Failed to initialize exchange rates:', error);
      // 기본 환율 설정
      this.setDefaultRates();
    }
  }

  async updateRates() {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();

      if (data.result === 'success') {
        // USD 기준 환율을 KRW 기준으로 변환
        //   this.rates = {
        //       KRW: 1,
        //       USD: 1 / usdToKrw,
        //       JPY: data.conversion_rates.JPY / usdToKrw,
        //       CNY: data.conversion_rates.CNY / usdToKrw
        //   };
        // USD 기준 환율 설정 (USD = 1)
        this.rates = {
          USD: 1,
          KRW: data.conversion_rates.KRW,
          JPY: data.conversion_rates.JPY,
          CNY: data.conversion_rates.CNY,
        };

        this.lastUpdate = new Date();
        this.saveRatesToLocalStorage();

        console.log('Exchange rates updated: ', this.rates);
      } else {
        throw new Error('API response was not successful');
      }
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      // API 호출 실패 시 localStorage의 마지막 저장 값 사용
      this.loadRatesFromLocalStorage();
    }
  }

  setDefaultRates() {
    // 기본 환율 설정 (실제 환율과 다를 수 있음)
    this.rates = {
      USD: 1,
      KRW: 1457.39,
      JPY: 156.18,
      CNY: 7.33,
    };
    this.lastUpdate = new Date();
  }

  // 가격 변환 함수 (결제 시스템용)
  convertPriceForPayment(amount, fromCurrency, toCurrency) {
    if (!this.rates) {
      this.setDefaultRates();
    }

    // 먼저 USD로 변환
    const usdAmount =
      fromCurrency === 'USD' ? amount : amount / this.rates[fromCurrency];

    // USD에서 목표 통화로 변환
    const convertedAmount = usdAmount * this.rates[toCurrency];

    // 통화별 반올림 규칙 적용
    switch (toCurrency) {
      case 'JPY':
      case 'KRW':
        return Math.round(convertedAmount);
      default:
        return Math.round(convertedAmount * 100) / 100;
    }
  }

  // 표시용 가격 포맷팅
  formatPriceDisplay(amount, lang) {
    const config = this.currencyConfig[lang] || this.currencyConfig.ko;
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: config.minDigits,
      maximumFractionDigits: config.maxDigits,
    });

    // KRW 기준 가격을 해당 통화로 변환
    const convertedAmount = this.convertPriceForPayment(
      amount,
      'KRW',
      config.currency
    );

    return formatter.format(convertedAmount);
  }

  // 결제 시스템용 숫자 가격 반환
  getPaymentAmount(lang) {
    const config = this.currencyConfig[lang] || this.currencyConfig.ko;
    return this.convertPriceForPayment(
      this.basePriceKRW,
      'KRW',
      config.currency
    );
  }

  saveRatesToLocalStorage() {
    try {
      localStorage.setItem(
        'exchangeRates',
        JSON.stringify({
          rates: this.rates,
          lastUpdate: this.lastUpdate.toISOString(),
        })
      );
    } catch (error) {
      console.error('Error saving rates to localStorage:', error);
    }
  }

  loadRatesFromLocalStorage() {
    try {
      const saved = localStorage.getItem('exchangeRates');
      if (saved) {
        const data = JSON.parse(saved);
        this.rates = data.rates;
        this.lastUpdate = new Date(data.lastUpdate);

        // 24시간 이상 지난 데이터는 기본값 사용
        if (new Date() - this.lastUpdate > 24 * 60 * 60 * 1000) {
          this.setDefaultRates();
        }
      } else {
        this.setDefaultRates();
      }
    } catch (error) {
      console.error('Error loading rates from localStorage:', error);
      this.setDefaultRates();
    }
  }

  convertPrice(currency) {
    if (!this.rates) {
      this.setDefaultRates();
    }

    const rate = this.rates[currency];
    if (!rate) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const convertedPrice = this.basePriceKRW * rate;
    return this.formatPrice(convertedPrice, currency);
  }

  formatPrice(amount, currency) {
    const currencyConfig = {
      KRW: { minDigits: 2, maxDigits: 2 },
      USD: { minDigits: 0, maxDigits: 0 },
      JPY: { minDigits: 2, maxDigits: 2 },
      CNY: { minDigits: 2, maxDigits: 2 },
    };

    const config = currencyConfig[currency] || { minDigits: 2, maxDigits: 2 };

    const formatter = new Intl.NumberFormat(this.getLocale(currency), {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: config.minDigits,
      maximumFractionDigits: config.maxDigits,
    });

    return formatter.format(amount);
  }

  getLocale(currency) {
    const localeMap = {
      KRW: 'ko-KR',
      USD: 'en-US',
      JPY: 'ja-JP',
      CNY: 'zh-CN',
    };
    return localeMap[currency] || 'en-US';
  }

  getCurrentPrice(currency = 'KRW') {
    try {
      return this.convertPrice(currency);
    } catch (error) {
      console.error('Error getting current price:', error);
      return this.formatPrice(this.basePriceKRW, 'KRW');
    }
  }

  // exchange-rate-service.js의 ExchangeRateService 클래스에 메서드 추가
  // 순수 숫자 가격 반환 (기존 기능 유지)
  getNumericPrice(currency) {
    if (!this.rates) {
      this.setDefaultRates();
    }

    const rate = this.rates[currency];
    if (!rate) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // KRW 기준 가격을 해당 통화로 변환
    const convertedPrice = this.convertPriceForPayment(
      this.basePriceKRW,
      'KRW',
      currency
    );

    return convertedPrice;
  }

  calculateRateDifference(currency) {
    if (!this.rates) {
      this.setDefaultRates();
    }

    const rate = this.rates[currency];
    if (!rate) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // USD 기준 환율과의 차이 계산
    const baseRate = this.rates[currency]; // 현재 환율
    const expectedRate = this.getExpectedRate(currency); // 기대 환율 (기준 환율)
    const difference = baseRate - expectedRate;

    return {
      currentRate: baseRate,
      expectedRate: expectedRate,
      difference: difference,
    };
  }

  // 기준 환율 반환 (예시 값)
  getExpectedRate(currency) {
    const expectedRates = {
      USD: 1,
      KRW: 1458.19, // 예시 기준 환율
      JPY: 156.13, // 예시 기준 환율
      CNY: 7.33, // 예시 기준 환율
    };
    return expectedRates[currency] || 0;
  }

  calculateExchangeRate(currency) {
    if (!this.rates) {
      this.setDefaultRates();
    }

    // USD가 기준 통화(1)일 때의 각 통화 환율
    const baseRates = {
      USD: 1, // 기준 통화
      KRW: 1300, // 1 USD = 1300 KRW
      JPY: 150, // 1 USD = 150 JPY
      CNY: 7.2, // 1 USD = 7.2 CNY
    };

    // 현재 환율
    const currentRate = this.rates[currency];

    // 기준 환율 계산 (상대국통화/기준통화)
    const standardRate = baseRates[currency];

    // 환율 차이 계산
    const rateDifference = currentRate - standardRate;

    // 원화 기준 가격 (99,000원)
    const basePrice = 99000;

    // 통화별 변환 가격 계산
    let convertedPrice;
    switch (currency) {
      case 'USD':
        // KRW -> USD
        convertedPrice = basePrice / this.rates['KRW'];
        break;
      case 'JPY':
        // KRW -> JPY
        convertedPrice = basePrice * (this.rates['JPY'] / this.rates['KRW']);
        break;
      case 'CNY':
        // KRW -> CNY
        convertedPrice = basePrice * (this.rates['CNY'] / this.rates['KRW']);
        break;
      case 'KRW':
      default:
        convertedPrice = basePrice;
        break;
    }

    return {
      currentRate: currentRate,
      standardRate: standardRate,
      exchangeRate: rateDifference,
      convertedPrice: convertedPrice,
    };
  }
}

// 서비스 인스턴스 생성 및 초기화
window.exchangeRateService = new ExchangeRateService();
window.exchangeRateService.initialize();
