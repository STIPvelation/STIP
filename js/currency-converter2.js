class CurrencyConverter {
  constructor() {
    this.cachedRates = null;
    this.lastUpdateTime = null;
  }

  async getExchangeRates() {
    try {
      if (this.cachedRates && this.lastUpdateTime &&
        (Date.now() - this.lastUpdateTime) < CONFIG.CACHE_DURATION) {
        return this.cachedRates;
      }

      const response = await fetch(
        `${CONFIG.API_BASE_URL}${CONFIG.EXCHANGE_API_KEY}/latest/KRW`
      );
      const data = await response.json();

      this.cachedRates = data.conversion_rates;
      this.lastUpdateTime = Date.now();

      return this.cachedRates;
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      return this.getDefaultRates();
    }
  }

  getDefaultRates() {
    return {
      USD: 0.00076,
      JPY: 0.11,
      CNY: 0.0055,
      KRW: 1
    };
  }

  async convertAmount(amount, fromCurrency, toCurrency) {
    const rates = await this.getExchangeRates();
    const amountInKRW = parseFloat(amount.toString().replace(/[^0-9.-]+/g, ""));
    return amountInKRW * rates[toCurrency];
  }
}