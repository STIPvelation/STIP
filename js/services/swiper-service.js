/**
 * swiper-service.js
 * Swiper 슬라이더 관리를 위한 서비스
 * 
 * 주요 기능:
 * - 그리드 스와이퍼 초기화
 * - 싱글 스와이퍼 초기화
 * - 반응형 처리
 * - 스와이퍼 이벤트 관리
 * 
 * 사용되는 곳:
 * - listing.html의 이미지 슬라이더
 * - 모바일/데스크톱 대응 슬라이더
 */

class SwiperService {
  constructor() {
    // Swiper 라이브러리 존재 확인
    if (typeof Swiper === 'undefined') {
      console.error('Swiper library is not loaded!');
      return;
    }
    // Swiper 인스턴스 저장
    this.gridSwiperInstance = null;
    this.singleSwiperInstance = null;

    // DOM 요소
    this.swiperContainer = document.getElementById("swiperContainer");
    this.swiperWrapper = document.getElementById("swiperWrapper");
    this.singleSwiperWrapper = document.getElementById("singleSwiperWrapper");

    // 설정값
    this.isMobile = window.matchMedia("(max-width: 1000px)").matches;

    // 초기화
    this.initialize();
    this.setupEventListeners();
  }

  // 초기화
  initialize() {
    if (this.isMobile) {
      this.initializeSingleSwiper();
    } else {
      this.initializeGridSwiper();
    }
  }

  // 그리드 스와이퍼 초기화
  initializeGridSwiper() {
    if (this.gridSwiperInstance) return;

    this.gridSwiperInstance = new Swiper(".grid-swiper", {
      slidesPerView: 1,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      speed: 1000,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      }
    });

    console.log("Grid Swiper initialized");
  }

  // 싱글 스와이퍼 초기화
  initializeSingleSwiper() {
    if (this.singleSwiperInstance) return;

    this.singleSwiperInstance = new Swiper(".single-swiper", {
      slidesPerView: 3,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        700: {
          slidesPerView: 4,
          spaceBetween: 10,
        }
      },
      spaceBetween: 10,
      speed: 1000
    });

    console.log("Single Swiper initialized");
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 리사이즈 이벤트
    window.addEventListener("resize", () => {
      const newIsMobile = window.matchMedia("(max-width: 1000px)").matches;

      if (newIsMobile !== this.isMobile) {
        this.isMobile = newIsMobile;
        this.handleModeChange();
      }
    });

    // Swiper 컨테이너 표시/숨김 처리
    if (this.swiperWrapper && this.singleSwiperWrapper) {
      this.updateSwiperVisibility();
    }
  }

  // 모드 변경 처리
  handleModeChange() {
    if (this.isMobile) {
      this.destroyGridSwiper();
      this.initializeSingleSwiper();
    } else {
      this.destroySingleSwiper();
      this.initializeGridSwiper();
    }

    this.updateSwiperVisibility();
  }

  // 스와이퍼 표시 상태 업데이트
  updateSwiperVisibility() {
    if (this.isMobile) {
      if (this.swiperWrapper) this.swiperWrapper.style.display = "none";
      if (this.singleSwiperWrapper) this.singleSwiperWrapper.style.display = "block";
    } else {
      if (this.swiperWrapper) this.swiperWrapper.style.display = "block";
      if (this.singleSwiperWrapper) this.singleSwiperWrapper.style.display = "none";
    }
  }

  // 그리드 스와이퍼 제거
  destroyGridSwiper() {
    if (this.gridSwiperInstance) {
      this.gridSwiperInstance.destroy();
      this.gridSwiperInstance = null;
      console.log("Grid Swiper destroyed");
    }
  }

  // 싱글 스와이퍼 제거
  destroySingleSwiper() {
    if (this.singleSwiperInstance) {
      this.singleSwiperInstance.destroy();
      this.singleSwiperInstance = null;
      console.log("Single Swiper destroyed");
    }
  }

  // 자원 정리
  dispose() {
    this.destroyGridSwiper();
    this.destroySingleSwiper();
    window.removeEventListener("resize", this.handleModeChange);
  }

  // 현재 상태 로깅
  logStatus() {
    console.log({
      isMobile: this.isMobile,
      gridSwiperActive: !!this.gridSwiperInstance,
      singleSwiperActive: !!this.singleSwiperInstance
    });
  }
}

// 전역 인스턴스 생성
const swiperService = new SwiperService();

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  swiperService.logStatus();
});