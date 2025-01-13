/**
 * country-service.js
 * 국가 정보 관리 및 처리를 위한 서비스
 */
class CountryService {
  static instance = null;

  constructor() {
    if (CountryService.instance) {
      return CountryService.instance;
    }
    CountryService.instance = this;
    
    // 국가 이름 현지화 데이터
    this.localizedCountryNames = {
      KR: {
        ko: '대한민국',
        en: 'South Korea',
        ja: '韓国',
        zh: '韩国'
      },
      US: {
        ko: '미국',
        en: 'United States',
        ja: 'アメリカ',
        zh: '美国'
      },
      JP: {
        ko: '일본',
        en: 'Japan',
        ja: '日本',
        zh: '日本'
      },
      CN: {
        ko: '중국',
        en: 'China',
        ja: '中国',
        zh: '中国'
      }
    };

    this.countries = new Map();
    this.selectedCountry = null;
    this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
    this.initialized = false;

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

  /**
   * 국가 목록 조회
   * @param {string} lang - 언어 코드
   * @returns {Promise<Map>} - 국가 데이터 Map
   */
  async fetchCountries(lang = this.currentLang) {
    try {
      // API 응답이 실패할 경우를 대비한 기본 데이터
      const fallbackCountries = [
        { country_code: 'KR', country_name: 'Korea, Republic of' },
        { country_code: 'US', country_name: 'United States' },
        { country_code: 'JP', country_name: 'Japan' },
        { country_code: 'CN', country_name: 'China' }
      ];

      let data;
      try {
        const response = await fetch(`country.php?lang=${lang}`);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok || !contentType?.includes('application/json')) {
          throw new Error('Invalid response format or status');
        }
        
        const responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('Failed to parse JSON response:', responseText);
          throw new Error('Invalid JSON response');
        }
      } catch (error) {
        console.warn('Using fallback data due to API error:', error.message);
        data = { 
          success: true, 
          data: fallbackCountries.map(country => ({
            ...country,
            country_name: this.getLocalizedCountryName(country.country_code, lang)
          }))
        };
      }

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(this.getErrorMessage('fetch_countries_failed', lang));
      }

      // 국가 데이터 저장
      this.countries.clear();
      data.data.forEach(country => {
        if (country.country_code && country.country_name) {
          this.countries.set(country.country_code, {
            code: country.country_code,
            name: country.country_name
          });
        }
      });

      this.initialized = true;
      return this.countries;

    } catch (error) {
      console.error('Error in fetchCountries:', error);
      throw new Error(this.getErrorMessage('api_error', lang));
    }
  }

  /**
   * 국가 선택 처리
   * @param {string} countryCode - 국가 코드
   * @returns {Promise<Object>} - 선택된 국가 정보
   */
  async selectCountry(countryCode) {
    if (!this.initialized) {
      await this.fetchCountries();
    }

    if (!countryCode || !this.countries.has(countryCode)) {
      throw new Error(this.getErrorMessage('invalid_country', this.currentLang));
    }

    this.selectedCountry = this.countries.get(countryCode);
    this.updateCountrySelection();
    return this.selectedCountry;
  }

  /**
   * 선택된 국가 정보 업데이트
   */
  updateCountrySelection() {
    if (!this.selectedCountry) return;

    // 국가 선택 이벤트 발생
    const event = new CustomEvent('countryChanged', {
      detail: {
        country: this.selectedCountry
      }
    });
    window.dispatchEvent(event);

    // Select 요소 업데이트
    const countrySelect = document.getElementById('country');
    if (countrySelect && countrySelect.value !== this.selectedCountry.code) {
      countrySelect.value = this.selectedCountry.code;
    }
  }

  /**
   * Select 요소 초기화
   * @param {HTMLSelectElement} selectElement - select DOM 요소
   * @param {string} defaultCountry - 기본 선택 국가 코드
   */
  initializeCountrySelect(selectElement, defaultCountry = null) {
    if (!selectElement || !this.initialized) return;

    // 기존 옵션 제거 (첫 번째 옵션 제외)
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    // 국가 옵션 추가
    Array.from(this.countries.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        selectElement.appendChild(option);
      });

    // 기본 국가 설정
    if (defaultCountry && this.countries.has(defaultCountry)) {
      selectElement.value = defaultCountry;
      this.selectCountry(defaultCountry).catch(console.error);
    }
  }

  /**
   * 에러 메시지 조회
   * @param {string} key - 에러 메시지 키
   * @param {string} lang - 언어 코드
   * @returns {string} - 에러 메시지
   */
  getErrorMessage(key, lang = this.currentLang) {
    return this.errorMessages[lang]?.[key] || this.errorMessages['en'][key];
  }

  /**
   * 국가 코드 검증
   * @param {string} countryCode - 국가 코드
   * @returns {boolean} - 유효성 여부
   */
  validateCountryCode(countryCode) {
    return Boolean(countryCode && this.countries.has(countryCode));
  }

  /**
   * 국가 이름 현지화
   * @param {string} countryCode - 국가 코드
   * @param {string} lang - 언어 코드
   * @returns {string} - 현지화된 국가 이름
   */
  getLocalizedCountryName(countryCode, lang) {
    return this.localizedCountryNames[countryCode]?.[lang] 
      || this.localizedCountryNames[countryCode]?.['en'] 
      || countryCode;
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
        if (e.target.value) {
          countryService.selectCountry(e.target.value).catch(error => {
            console.error('Failed to select country:', error);
          });
        }
      });
    }
  } catch (error) {
    console.error('Country service initialization failed:', error);
  }
});

// 전역 객체로 노출
window.countryService = countryService;