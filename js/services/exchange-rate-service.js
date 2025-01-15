// exchange-rate-service.js
class ExchangeRateService {

  constructor() {
      this.baseUrl = 'https://v6.exchangerate-api.com/v6/90809c4e6dde58e47c6544bb/latest/USD';
      this.rates = null;
      this.lastUpdate = null;
      this.updateInterval = 1000 * 60 * 60; // 1시간마다 업데이트
      this.basePriceKRW = 99000; // 기준 가격 (KRW)
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
          
          if (data.result === "success") {
              // USD 기준 환율을 KRW 기준으로 변환
              const usdToKrw = data.conversion_rates.KRW;
              this.rates = {
                  KRW: 1,
                  USD: 1 / usdToKrw,
                  JPY: data.conversion_rates.JPY / usdToKrw,
                  CNY: data.conversion_rates.CNY / usdToKrw
              };
              
              this.lastUpdate = new Date();
              this.saveRatesToLocalStorage();
              
              console.log('Exchange rates updated:', this.rates);
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
          KRW: 1,
          USD: 0.00075,
          JPY: 0.11,
          CNY: 0.0049
      };
      this.lastUpdate = new Date();
  }

  saveRatesToLocalStorage() {
      try {
          localStorage.setItem('exchangeRates', JSON.stringify({
              rates: this.rates,
              lastUpdate: this.lastUpdate.toISOString()
          }));
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
              if ((new Date() - this.lastUpdate) > 24 * 60 * 60 * 1000) {
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
          KRW: { minDigits: 0, maxDigits: 0 },
          USD: { minDigits: 2, maxDigits: 2 },
          JPY: { minDigits: 0, maxDigits: 0 },
          CNY: { minDigits: 2, maxDigits: 2 }
      };

      const config = currencyConfig[currency] || { minDigits: 2, maxDigits: 2 };
      
      const formatter = new Intl.NumberFormat(this.getLocale(currency), {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: config.minDigits,
          maximumFractionDigits: config.maxDigits
      });
      
      return formatter.format(amount);
  }

  getLocale(currency) {
      const localeMap = {
          KRW: 'ko-KR',
          USD: 'en-US',
          JPY: 'ja-JP',
          CNY: 'zh-CN'
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
  getNumericPrice(currency) {
    if (!this.rates) {
        this.setDefaultRates();
    }

    const rate = this.rates[currency];
    if (!rate) {
        throw new Error(`Unsupported currency: ${currency}`);
    }

    const convertedPrice = this.basePriceKRW * rate;
    // 소수점 2자리까지 반올림
    // return Math.round(convertedPrice * 100) / 100;
    // 통화별 반올림 규칙 적용
    switch(currency) {
        case 'JPY':
            return Math.round(convertedPrice); // JPY는 소수점 없음
        case 'KRW':
            return Math.round(convertedPrice); // KRW도 소수점 없음
        default:
            // USD, CNY 등은 소수점 2자리까지
            return Math.round(convertedPrice * 100) / 100;
    }
  }
}

// 서비스 인스턴스 생성 및 초기화
window.exchangeRateService = new ExchangeRateService();
window.exchangeRateService.initialize();