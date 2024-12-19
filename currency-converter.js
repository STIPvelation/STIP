//currency - converter.js
// 환율 관련 설정
const EXCHANGE_API_KEY = '90809c4e6dde58e47c6544bb'; // 실제 API 키로 교체 필요
const BASE_AMOUNT = 99000; // 기본 금액 (KRW)
let cachedExchangeRates = null;
let lastUpdateTime = null;

// 실시간 환율 가져오기
async function getExchangeRates() {
  try {
    // 캐시된 환율이 있고 1시간 이내라면 재사용
    if (cachedExchangeRates && lastUpdateTime &&
      (Date.now() - lastUpdateTime) < 3600000) {
      return cachedExchangeRates;
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/KRW`
    );
    const data = await response.json();

    // 환율 데이터 캐싱
    cachedExchangeRates = data.conversion_rates;
    lastUpdateTime = Date.now();

    return data.conversion_rates;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    // 기본 환율 반환 (오류 시 대비)
    return {
      USD: 0.00076,
      JPY: 0.11,
      CNY: 0.0055
    };
  }
}

// 통화 변환 함수 수정
async function convertCurrency(amount, fromCurrency, toCurrency) {
  const rates = await getExchangeRates();
  const amountInKRW = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
  const convertedAmount = amountInKRW * rates[toCurrency];

  return formatAmount(convertedAmount, toCurrency);
}

// 금액 포맷팅 함수
function formatAmount(amount, currency) {
  const formatOptions = {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: getCurrencyDecimals(currency)
  };

  return new Intl.NumberFormat(getCurrencyLocale(currency), formatOptions)
    .format(amount);
}

// 통화별 소수점 자릿수
function getCurrencyDecimals(currency) {
  const decimalsMap = {
    KRW: 0,
    JPY: 0,
    USD: 2,
    CNY: 2
  };
  return decimalsMap[currency] || 2;
}

// 실시간 금액 업데이트 함수
async function updateAmount(lang) {
  const amountInput = document.getElementById('amount');
  const currencySpan = document.querySelector('.currency');

  if (!amountInput || !currencySpan) return;

  const currency = currencyFormats[lang].currency;
  const convertedAmount = await convertCurrency(
    BASE_AMOUNT.toString(),
    'KRW',
    currency
  );

  amountInput.value = convertedAmount;
  currencySpan.textContent = translations[lang].payment.currency;
}

// 통화 변경 이벤트 핸들러
async function handleCurrencyChange(lang) {
  await updateAmount(lang);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function () {
  // 기존 이벤트 리스너들...

  // 초기 금액 설정
  await updateAmount(currentLang);

  // 환율 모니터링 (5분마다 업데이트)
  setInterval(async () => {
    await updateAmount(currentLang);
  }, 300000);

  // 환율 정보 표시 (선택적)
  const rateInfo = document.createElement('div');
  rateInfo.className = 'rate-info';
  document.querySelector('.amount-wrapper').appendChild(rateInfo);

  updateRateInfo(currentLang);
});

// 환율 정보 표시 함수 (선택적)
async function updateRateInfo(lang) {
  const rates = await getExchangeRates();
  const currency = currencyFormats[lang].currency;
  const rateInfo = document.querySelector('.rate-info');

  if (rateInfo && currency !== 'KRW') {
    rateInfo.textContent = `1 ${currency} = ${Math.round(1 / rates[currency] * 100) / 100
      } KRW`;
  }
}

// CSS 추가
const styles = `
    .rate-info {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
        text-align: right;
    }

    .amount-wrapper {
        position: relative;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);