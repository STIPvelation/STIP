// payment-validator.js 파일 생성

const PaymentValidator = {
    validatePaymentAmount: function(productCode, amount, lang) {
        try {
            const currencyMap = {
                ko: 'KRW',
                en: 'USD',
                ja: 'JPY',
                zh: 'CNY'
            };
            const currency = currencyMap[lang];

            // exchangeRateService에서 해당 통화의 예상 가격 가져오기
            if (window.exchangeRateService) {
                const expectedAmount = window.exchangeRateService.getNumericPrice(currency);
                
                // 금액 비교 시 약간의 오차 허용 (0.5% 이내)
                const normalizedExpected = Math.round(expectedAmount * 100) / 100;
                const normalizedActual = Math.round(parseFloat(amount) * 100) / 100;
                
                // 허용 오차 범위 설정 (0.5%)
                const tolerance = normalizedExpected * 0.005;
                const difference = Math.abs(normalizedExpected - normalizedActual);

                console.log('Price Validation Details:', {
                    currency,
                    expectedAmount: normalizedExpected,
                    actualAmount: normalizedActual,
                    difference,
                    tolerance,
                    isValid: difference <= tolerance
                });

                return difference <= tolerance;
            }
            return true; // exchangeRateService가 없는 경우 검증 통과

        } catch (error) {
            console.error('Price validation error:', error);
            return false;
        }
    }
};

// window 객체에 추가
window.PaymentValidator = PaymentValidator;