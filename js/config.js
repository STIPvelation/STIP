// config.js
// Your API Key: 90809c4e6dde58e47c6544bb
// Example Request: https://v6.exchangerate-api.com/v6/90809c4e6dde58e47c6544bb/latest/USD
// export const EXCHANGE_API_KEY = '90809c4e6dde58e47c6544bb';
// 환경 설정 및 API 키
const CONFIG = {
  EXCHANGE_API_KEY: '90809c4e6dde58e47c6544bb',
  BASE_AMOUNT: 99000,
  DEFAULT_CURRENCY: 'KRW',
  DEFAULT_LANGUAGE: 'ko',
  API_BASE_URL: 'https://v6.exchangerate-api.com/v6/',
  CACHE_DURATION: 3600000, // 1시간
  UPDATE_INTERVAL: 300000   // 5분
};

window.CONFIG = CONFIG;