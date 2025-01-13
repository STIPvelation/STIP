/**
 * tag-cloud-service.js
 * 태그 클라우드 기능 관리를 위한 서비스
 */
class TagCloudService {
  static instance = null;

  constructor() {
    if (TagCloudService.instance) {
      return TagCloudService.instance;
    }
    TagCloudService.instance = this;

    // 태그 클라우드 인스턴스
    this.tagCloud = null;
    this.initialized = false;

    // DOM 요소는 초기화 시점에 설정
    this.cloudContainer = null;
    this.circleWrapper = null;
    this.swiperWrapper = null;
    this.singleSwiperWrapper = null;

    // 설정값
    this.radius = Math.max(170, Math.min(280, window.innerWidth - window.innerWidth * 0.95));

    // 이미지 데이터
    this.tagCloudImages = this.initializeImageData();

    // DOM이 준비된 후 초기화
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  // 이미지 엘리먼트 래핑
  wrappingImgElement(src) {
    return `<img width='120px' src='assets/images/logo/${src}' alt='' />`;
  }

  // 이미지 데이터 초기화
  initializeImageData() {
    return {
      "Movie Drama Comics": [
        this.wrappingImgElement("Movie/Group 5005.png"),
        this.wrappingImgElement("Movie/Group.png"),
        this.wrappingImgElement("Movie/Group-1.png"),
        this.wrappingImgElement("Movie/Group-2.png"),
        this.wrappingImgElement("Movie/Group-3.png"),
        this.wrappingImgElement("Movie/Group-4.png")
      ],
      "Music": [
        this.wrappingImgElement("Music/Clip path group.png"),
        this.wrappingImgElement("Music/Group.png"),
        this.wrappingImgElement("Music/Group-1.png"),
        this.wrappingImgElement("Music/Group-2.png"),
        this.wrappingImgElement("Music/Group-3.png"),
        this.wrappingImgElement("Music/Group-4.png"),
        this.wrappingImgElement("Music/Group-5.png"),
        this.wrappingImgElement("Music/Group-6.png"),
        this.wrappingImgElement("Music/Group-7.png"),
        this.wrappingImgElement("Music/Group-8.png")
      ],
      "Dance": [
        this.wrappingImgElement("Dance/Group 5006.png"),
        this.wrappingImgElement("Dance/Group 5012.png"),
        this.wrappingImgElement("Dance/Group-1.png"),
        this.wrappingImgElement("Dance/Group-2.png"),
        this.wrappingImgElement("Dance/Group-3.png"),
        this.wrappingImgElement("Dance/Group-4.png"),
        this.wrappingImgElement("Dance/Group-5.png"),
        this.wrappingImgElement("Dance/Group-6.png")
      ],
      "Franchise": [
        this.wrappingImgElement("Franchise/Group.png"),
        this.wrappingImgElement("Franchise/Group-1.png"),
        this.wrappingImgElement("Franchise/Group-2.png"),
        this.wrappingImgElement("Franchise/Group-3.png"),
        this.wrappingImgElement("Franchise/Group-4.png"),
        this.wrappingImgElement("Franchise/Group-5.png"),
        this.wrappingImgElement("Franchise/Group-6.png"),
        this.wrappingImgElement("Franchise/Group-7.png")
      ],
      "Trademark": [
        this.wrappingImgElement("Trademark/Group 5007.png"),
        this.wrappingImgElement("Trademark/Group.png"),
        this.wrappingImgElement("Trademark/Group-1.png"),
        this.wrappingImgElement("Trademark/Group-2.png"),
        this.wrappingImgElement("Trademark/Group-3.png")
      ],
      "Character": [
        this.wrappingImgElement("Character/Group 5008.png"),
        this.wrappingImgElement("Character/Group 5009.png"),
        this.wrappingImgElement("Character/Group.png"),
        this.wrappingImgElement("Character/Group-1.png"),
        this.wrappingImgElement("Character/Group-2.png"),
        this.wrappingImgElement("Character/Group-3.png"),
        this.wrappingImgElement("Character/Group-4.png"),
        this.wrappingImgElement("Character/Group-5.png"),
        this.wrappingImgElement("Character/Group-6.png")
      ]
    };
  }

  // 초기화
  init() {
    try {
      // DOM 요소 초기화
      this.cloudContainer = document.querySelector(".Sphere");
      this.circleWrapper = document.querySelector('.circle-wrapper');
      this.swiperWrapper = document.getElementById("swiperWrapper");
      this.singleSwiperWrapper = document.getElementById("singleSwiperWrapper");

      if (!this.cloudContainer) {
        console.warn('Cloud container not found');
        return;
      }

      this.setupEventListeners();
      
      if (typeof TagCloud === 'undefined') {
        console.warn('TagCloud library not loaded');
        return;
      }

      this.initializeTagCloud();
      this.initialized = true;
      
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  // 태그 클라우드 초기화
  initializeTagCloud() {
    try {
      if (!this.cloudContainer || !this.tagCloudImages['Movie Drama Comics']) {
        throw new Error('Required elements or data not found');
      }

      // 기존 인스턴스가 있다면 제거
      if (this.tagCloud) {
        this.tagCloud.pause();
        this.tagCloud = null;
      }

      // 새로운 TagCloud 인스턴스 생성
      this.tagCloud = TagCloud(this.cloudContainer, this.tagCloudImages['Movie Drama Comics'], {
        radius: this.radius,
        maxSpeed: "normal",
        initSpeed: "normal",
        direction: 205,
        keep: true,
        useHTML: true
      });
      
      this.tagCloud.pause(); // 초기에는 일시정지 상태
      console.log('TagCloud initialized successfully');
      
    } catch (error) {
      console.error('TagCloud initialization error:', error);
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.updateResponsiveLayout();
    });
  }

  // 카테고리 업데이트
  updateCategory(category) {
    if (!this.initialized) {
      console.warn('TagCloud service not initialized');
      return;
    }

    const frameBox = document.querySelector('.frame');
    if (!frameBox) return;

    if (category === "Patent") {
      this.handlePatentCategory(frameBox);
    } else {
      this.handleOtherCategory(category, frameBox);
    }

    const listingBtn = document.querySelector('.listing-btn');
    if (listingBtn) {
      listingBtn.textContent = category;
    }
  }

  // 특허 카테고리 처리
  handlePatentCategory(frameBox) {
    if (this.swiperWrapper) this.swiperWrapper.style.display = "block";
    if (this.singleSwiperWrapper) this.singleSwiperWrapper.style.display = "block";
    if (this.circleWrapper) this.circleWrapper.style.display = "none";

    if (this.tagCloud) this.tagCloud.pause();

    if (window.innerWidth < 768) {
      frameBox.style.height = "204px";
    }
  }

  // 다른 카테고리 처리
  handleOtherCategory(category, frameBox) {
    if (!this.tagCloud) {
      this.initializeTagCloud();
    }

    if (this.swiperWrapper) this.swiperWrapper.style.display = "none";
    if (this.singleSwiperWrapper) this.singleSwiperWrapper.style.display = "none";
    if (this.circleWrapper) this.circleWrapper.style.display = "flex";

    const squareBox = document.querySelector('.Sphere');
    if (window.innerWidth < 768 && squareBox) {
      const padding = 64;
      frameBox.style.height = squareBox.clientHeight + padding + "px";
    }

    if (this.tagCloud && this.tagCloudImages[category]) {
      this.tagCloud.resume();
      this.tagCloud.update(this.tagCloudImages[category]);
    }
  }

  // 반응형 레이아웃 업데이트
  updateResponsiveLayout() {
    if (window.innerWidth < 768) {
      const frameBox = document.querySelector('.frame');
      const squareBox = document.querySelector('.Sphere');
      if (frameBox && squareBox) {
        const padding = 64;
        frameBox.style.height = squareBox.clientHeight + padding + "px";
      }
    }
  }

  // 태그 클라우드 상태 제어
  pause() {
    if (this.tagCloud) {
      this.tagCloud.pause();
    }
  }

  resume() {
    if (this.tagCloud) {
      this.tagCloud.resume();
    }
  }

  // 자원 정리
  dispose() {
    if (this.tagCloud) {
      this.tagCloud.pause();
      this.tagCloud = null;
    }
  }
}

// 전역 인스턴스 생성 및 노출
window.tagCloudService = new TagCloudService();