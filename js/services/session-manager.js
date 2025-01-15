// session-manager.js 파일 생성
class PaymentSessionManager {
    constructor() {
        this.SESSION_KEYS = {
            ORDER_DATA: 'orderFormData',
            PAYMENT_INFO: 'paymentInfo',
            TRANSACTION_ID: 'transactionId'
        };
    }

    // 주문 데이터 저장
    saveOrderData(orderData) {
        try {
            sessionStorage.setItem(
                this.SESSION_KEYS.ORDER_DATA, 
                JSON.stringify(orderData)
            );
        } catch (error) {
            console.error('Error saving order data:', error);
            throw new Error('주문 정보 저장에 실패했습니다.');
        }
    }

    // 주문 데이터 불러오기
    getOrderData() {
        try {
            const data = sessionStorage.getItem(this.SESSION_KEYS.ORDER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading order data:', error);
            return null;
        }
    }

    // 결제 정보 저장
    savePaymentInfo(paymentInfo) {
        try {
            sessionStorage.setItem(
                this.SESSION_KEYS.PAYMENT_INFO, 
                JSON.stringify(paymentInfo)
            );
            // 결제 세션 만료 시간 설정 (30분)
            this.setSessionExpiry(30);
        } catch (error) {
            console.error('Error saving payment info:', error);
            throw new Error('결제 정보 저장에 실패했습니다.');
        }
    }

    // 결제 정보 불러오기
    getPaymentInfo() {
        try {
            if (this.isSessionExpired()) {
                this.clearSession();
                return null;
            }
            const data = sessionStorage.getItem(this.SESSION_KEYS.PAYMENT_INFO);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading payment info:', error);
            return null;
        }
    }

    // 세션 만료 시간 설정
    setSessionExpiry(minutes) {
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
        sessionStorage.setItem('sessionExpiry', expiryTime.getTime());
    }

    // 세션 만료 여부 확인
    isSessionExpired() {
        const expiry = sessionStorage.getItem('sessionExpiry');
        if (!expiry) return true;
        return new Date().getTime() > parseInt(expiry);
    }

    // 세션 데이터 초기화
    clearSession() {
        Object.values(this.SESSION_KEYS).forEach(key => {
            sessionStorage.removeItem(key);
        });
        sessionStorage.removeItem('sessionExpiry');
    }
}

// window 객체에 추가
window.paymentSessionManager = new PaymentSessionManager();