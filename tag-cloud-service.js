/**
 * tag-cloud-service.js
 * 태그 클라우드 기능 관리를 위한 서비스
 * 
 * 주요 기능:
 * - 태그 클라우드 초기화 및 관리
 * - 이미지 데이터 관리
 * - 카테고리별 태그 클라우드 업데이트
 * 
 * 사용되는 곳:
 * - listing.html의 카테고리별 이미지 표시
 * - 반응형 태그 클라우드 처리
 */

class TagCloudService {
  constructor() {
    // 태그 클라우드 인스턴스
    this.tagCloud = null;

    // DOM 요소
    this.cloudContainer = document.querySelector(".Sphere");
    this.circleWrapper = document.querySelector('.circle-wrapper');

    // 설정값
    this.radius = Math.max(170, Math.min(280, window.innerWidth - window.innerWidth * 0.95));

    // 이미지 데이터
    this.tagCloudImages = {
      "Movie Drama Comics": [
        this.wrappingImgElement("Movie/Group 5005.png"),
        this.wrappingImgElement("Movie/Group.png"),
        this.wrappingImgElement("Movie/Group-1.png"),
        this.wrappingImgElement("Movie/Group-2.png"),
        this.wrappingImgElement("Movie/Group-3.png"),
        this.wrappingImgElement("Movie/Group-4.png"),
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
        this.wrappingImgElement("Music/Group-8.png"),
      ],
      // ... 다른 카테고리들의 이미지 데이터
    };

    this.initialize();
    this.setupEventListeners();
  }

  // 이미지 엘리먼트 래핑
  wrappingImgElement(src) {
    return `<img width='120px' src='assets/images/logo/${src}' alt='' />`;
  }

  // 초기화
  initialize() {
    if (!this.cloudContainer) {
      console.error('Cloud container not found');
      return;
    }

    this.initializeTagCloud();
    this.updateResponsiveLayout();
  }

  // 태그 클라우드 초기화
  initializeTagCloud() {
    const options = {
      radius: this.radius,
      maxSpeed: "normal",
      initSpeed: "normal",
      direction: 205,
      keep: true,
      useHTML: true,
    };

    this.tagCloud = TagCloud(".Sphere", this.tagCloudImages['Movie Drama Comics'], options);
    this.tagCloud.pause(); // 초기에는 일시정지 상태
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    const dropdownSelect = document.querySelector('.dropdown-select');
    if (dropdownSelect) {
      dropdownSelect.addEventListener('click', (event) => {
        this.handleCategorySelect(event);
      });
    }

    // 반응형 처리를 위한 리사이즈 이벤트
    window.addEventListener('resize', () => {
      this.updateResponsiveLayout();
    });
  }

  // 카테고리 선택 처리
  handleCategorySelect(event) {
    const liElement = event.target.closest('li');
    if (!liElement) return;

    const divElement = liElement.querySelector('div');
    if (!divElement) return;

    const category = divElement.textContent.trim();
    this.updateCategory(category);
  }

  // 카테고리 업데이트
  updateCategory(category) {
    const listingBtn = document.querySelector('.listing-btn');
    if (!listingBtn) return;

    const frameBox = document.querySelector('.frame');
    const squareBox = document.querySelector('.Sphere');
    const swiperWrapper = document.getElementById('swiperWrapper');
    const singleSwiperWrapper = document.getElementById('singleSwiperWrapper');

    if (category === "Patent") {
      // 특허 카테고리 처리
      this.handlePatentCategory(swiperWrapper, singleSwiperWrapper, frameBox);
    } else {
      // 다른 카테고리 처리
      this.handleOtherCategory(category, swiperWrapper, singleSwiperWrapper, frameBox, squareBox);
    }

    listingBtn.textContent = category;
  }

  // 특허 카테고리 처리
  handlePatentCategory(swiperWrapper, singleSwiperWrapper, frameBox) {
    swiperWrapper.style.display = "block";
    singleSwiperWrapper.style.display = "block";
    this.circleWrapper.style.display = "none";

    if (this.tagCloud) this.tagCloud.pause();

    if (window.innerWidth < 768) {
      frameBox.style.height = "204px";
    }
  }

  // 다른 카테고리 처리
  handleOtherCategory(category, swiperWrapper, singleSwiperWrapper, frameBox, squareBox) {
    if (!this.tagCloud) {
      this.initializeTagCloud();
    }

    singleSwiperWrapper.style.display = "none";
    swiperWrapper.style.display = "none";
    this.circleWrapper.style.display = "flex";

    if (window.innerWidth < 768) {
      const padding = 64;
      frameBox.style.height = squareBox.clientHeight + padding + "px";
    }

    this.tagCloud.resume();
    this.tagCloud.update(this.tagCloudImages[category]);
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

// 전역 인스턴스 생성
const tagCloudService = new TagCloudService();

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 초기 상태 로깅
  console.log('Tag Cloud Service initialized');
});