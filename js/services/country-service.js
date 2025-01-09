/**
 * country-service.js
 * 국가 정보 관리 및 처리를 위한 서비스
 * 
 * 주요 기능:
 * - 국가 목록 조회
 * - 국가별 정보 관리
 * - 국가 선택 처리
 * 
 * 사용되는 곳:
 * - contactForm의 국가 선택
 * - 배송 국가 선택
 * - 통화 설정
 */

class CountryService {
  constructor() {
    this.countries = new Map();
    this.selectedCountry = null;
    this.currentLang = localStorage.getItem('preferredLanguage') || 'en';

    // 에러 메시지 정의
    this.errorMessages = {
      ko: {
        fetch_countries_failed: '국가 목록을 불러오는데 실패했습니다.',
        invalid_country: '유효하지 않은 국가 코드입니다.',
        api_error: 'API 호출 중 오류가 발생했습니다.'
      },
      en: {
        fetch_countries_failed: 'Failed to load country list.',
        invalid_country: 'Invalid country code.',
        api_error: 'API call failed.'
      },
      ja: {
        fetch_countries_failed: '国リストの読み込みに失敗しました。',
        invalid_country: '無効な国コードです。',
        api_error: 'APIコールに失敗しました。'
      },
      zh: {
        fetch_countries_failed: '加载国家列表失败。',
        invalid_country: '无效的国家代码。',
        api_error: 'API调用失败。'
      }
    };
  }

  // 국가 목록 조회
  async fetchCountries(lang = this.currentLang) {
    try {
      const response = await fetch(`api/country.php?lang=${lang}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(this.getErrorMessage('fetch_countries_failed', lang));
      }

      // 국가 데이터 저장
      this.countries.clear();
      data.data.forEach(country => {
        this.countries.set(country.country_code, {
          code: country.country_code,
          name: country.country_name,
          currency: country.currency_code,
          phoneCode: country.phone_code
        });
      });

      return this.countries;

    } catch (error) {
      console.error('Error fetching countries:', error);
      throw new Error(this.getErrorMessage('api_error', lang));
    }
  }

  // 국가 선택 처리
  async selectCountry(countryCode) {
    if (!this.countries.has(countryCode)) {
      await this.fetchCountries();
      if (!this.countries.has(countryCode)) {
        throw new Error(this.getErrorMessage('invalid_country', this.currentLang));
      }
    }

    this.selectedCountry = this.countries.get(countryCode);
    this.updateCountrySelection();
    return this.selectedCountry;
  }

  // 선택된 국가 정보 업데이트
  updateCountrySelection() {
    if (!this.selectedCountry) return;

    // 국가 선택 이벤트 발생
    window.dispatchEvent(new CustomEvent('countryChanged', {
      detail: {
        country: this.selectedCountry
      }
    }));

    // Select 요소 업데이트
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
      countrySelect.value = this.selectedCountry.code;
    }
  }

  // Select 요소 초기화
  initializeCountrySelect(selectElement, defaultCountry = null) {
    if (!selectElement) return;

    // 기존 옵션 제거 (첫 번째 옵션 제외)
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    // 국가 옵션 추가
    this.countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.code;
      option.textContent = country.name;
      selectElement.appendChild(option);
    });

    // 기본 국가 설정
    if (defaultCountry && this.countries.has(defaultCountry)) {
      selectElement.value = defaultCountry;
      this.selectCountry(defaultCountry);
    }
  }

  // 에러 메시지 조회
  getErrorMessage(key, lang = this.currentLang) {
    return this.errorMessages[lang]?.[key] || this.errorMessages['en'][key];
  }

  // 국가 코드 검증
  validateCountryCode(countryCode) {
    return this.countries.has(countryCode);
  }
}

// 전역 인스턴스 생성
const countryService = new CountryService();

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 국가 목록 로드
    await countryService.fetchCountries();

    // 국가 선택 UI 초기화
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
      countryService.initializeCountrySelect(countrySelect);

      // 국가 선택 이벤트 리스너
      countrySelect.addEventListener('change', (e) => {
        countryService.selectCountry(e.target.value);
      });
    }

  } catch (error) {
    console.error('Country service initialization failed:', error);
  }
});