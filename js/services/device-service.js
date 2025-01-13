/**
 * device-service.js
 * 디바이스 정보 및 화면 크기 관련 서비스
 * 
 * 주요 기능:
 * - 디바이스 타입 감지 (모바일/데스크톱)
 * - 화면 크기 변경 감지
 * - 디바이스별 최적화 처리
 * 
 * 사용되는 곳:
 * - 반응형 레이아웃 처리
 * - 디바이스별 기능 최적화
 */

class DeviceService {
  static #instance;

  constructor() {
    if (DeviceService.#instance) {
      return DeviceService.#instance;
    }
    DeviceService.#instance = this;
  }

  /**
   * 현재 디바이스가 모바일인지 확인
   * @returns {boolean} 모바일 여부
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * 브라우저 정보 확인
   * @returns {string} 브라우저 이름
   */
  getBrowser() {
    const ua = navigator.userAgent;
    let browser = "Unknown";

    if (ua.match(/chrome|chromium|crios/i)) {
      browser = "Chrome";
    } else if (ua.match(/firefox|fxios/i)) {
      browser = "Firefox";
    } else if (ua.match(/safari/i)) {
      browser = "Safari";
    } else if (ua.match(/opr\//i)) {
      browser = "Opera";
    } else if (ua.match(/edg/i)) {
      browser = "Edge";
    }

    return browser;
  }

  /**
   * Debounce 함수 - 연속된 함수 호출을 제어합니다
   * @param {Function} func - 실행할 함수
   * @param {number} wait - 대기 시간(밀리초)
   * @returns {Function} - debounce된 함수
   */
  debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// 전역 인스턴스 생성
window.deviceService = new DeviceService();