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
  constructor() {
    this.currentDevice = this.detectDevice();
    this.setupEventListeners();
  }

  // 디바이스 타입 감지
  detectDevice() {
    const userAgentCheck = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenSizeCheck = window.matchMedia("(max-width: 768px)").matches;

    return {
      isMobile: userAgentCheck || screenSizeCheck,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent: navigator.userAgent,
      orientation: window.orientation || 0
    };
  }

  // 모바일 기기 여부 확인
  isMobileDevice() {
    return this.currentDevice.isMobile;
  }

  // 화면 방향 확인
  isPortrait() {
    return window.matchMedia("(orientation: portrait)").matches;
  }

  // 화면 크기 변경 감지
  setupEventListeners() {
    // 리사이즈 이벤트
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // 방향 변경 이벤트 (모바일)
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });
  }

  // 리사이즈 처리
  handleResize() {
    const newDevice = this.detectDevice();

    if (this.hasDeviceChanged(newDevice)) {
      this.currentDevice = newDevice;
      this.emitDeviceChange();
    }
  }

  // 방향 변경 처리
  handleOrientationChange() {
    // 방향 변경 시 약간의 지연 후 처리
    setTimeout(() => {
      this.currentDevice = this.detectDevice();
      this.emitDeviceChange();
    }, 100);
  }

  // 디바이스 변경 여부 확인
  hasDeviceChanged(newDevice) {
    return (
      this.currentDevice.isMobile !== newDevice.isMobile ||
      this.currentDevice.screenWidth !== newDevice.screenWidth ||
      this.currentDevice.screenHeight !== newDevice.screenHeight
    );
  }

  // 디바이스 변경 이벤트 발생
  emitDeviceChange() {
    window.dispatchEvent(new CustomEvent('deviceChanged', {
      detail: {
        device: this.currentDevice
      }
    }));
  }

  // 디버그 정보 출력
  logDeviceInfo() {
    if (this.isMobileDevice()) {
      console.log("모바일 기기 또는 작은 화면에서 접속 중입니다.");
      console.log("화면 크기:", `${this.currentDevice.screenWidth}x${this.currentDevice.screenHeight}`);
      console.log("방향:", this.isPortrait() ? "세로" : "가로");
    } else {
      console.log("데스크톱 기기에서 접속 중입니다.");
      console.log("화면 크기:", `${this.currentDevice.screenWidth}x${this.currentDevice.screenHeight}`);
    }
  }
}

// 전역 인스턴스 생성
const deviceService = new DeviceService();

// 디바이스 변경 이벤트 리스너 예시
window.addEventListener('deviceChanged', (e) => {
  const device = e.detail.device;
  // 디바이스 변경에 따른 UI 업데이트
  if (device.isMobile) {
    // 모바일용 UI 처리
    document.body.classList.add('mobile');
    document.body.classList.remove('desktop');
  } else {
    // 데스크톱용 UI 처리
    document.body.classList.add('desktop');
    document.body.classList.remove('mobile');
  }
});

// 초기 디바이스 정보 로깅
document.addEventListener('DOMContentLoaded', () => {
  deviceService.logDeviceInfo();
});