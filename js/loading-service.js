// loading-service.js
class LoadingService {
  constructor() {
    this.overlay = document.querySelector('.loading-overlay');
    this.minLoadingTime = 500; // 최소 로딩 시간 (ms)
  }

  show() {
    if (this.overlay) {
      this.overlay.classList.add('active');
      this.startTime = Date.now();
    }
  }

  async hide() {
    if (this.overlay) {
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);
      
      // 최소 로딩 시간을 보장
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      this.overlay.classList.remove('active');
    }
  }
}

// 전역 인스턴스 생성
window.loadingService = new LoadingService();