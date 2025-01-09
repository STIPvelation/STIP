-- 국가 테이블 생성
CREATE TABLE country (
    country_code VARCHAR(2) PRIMARY KEY,
    country_name VARCHAR(255) NOT NULL
);

-- 다국어 지원을 위한 국가명 번역 테이블
CREATE TABLE country_translations (
    country_code VARCHAR(2),
    lang_code VARCHAR(2),
    country_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (country_code, lang_code),
    FOREIGN KEY (country_code) REFERENCES country(country_code)
);

-- 샘플 데이터 삽입
INSERT INTO country (country_code, country_name) VALUES
('KR', 'Korea, Republic of'),
('US', 'United States'),
('JP', 'Japan'),
('CN', 'China');
-- 주요 UN 가입국 데이터 삽입
INSERT INTO country (country_code, country_name) VALUES
-- 아시아
('KR', 'Korea, Republic of'),
('JP', 'Japan'),
('CN', 'China'),
('IN', 'India'),
('ID', 'Indonesia'),
('VN', 'Vietnam'),
('TH', 'Thailand'),
('SG', 'Singapore'),
('MY', 'Malaysia'),
('PH', 'Philippines'),

-- 유럽
('GB', 'United Kingdom'),
('FR', 'France'),
('DE', 'Germany'),
('IT', 'Italy'),
('ES', 'Spain'),
('PT', 'Portugal'),
('NL', 'Netherlands'),
('BE', 'Belgium'),
('CH', 'Switzerland'),
('SE', 'Sweden'),
('NO', 'Norway'),
('DK', 'Denmark'),
('FI', 'Finland'),
('GR', 'Greece'),
('IE', 'Ireland'),
('PL', 'Poland'),
('AT', 'Austria'),

-- 북미
('US', 'United States'),
('CA', 'Canada'),
('MX', 'Mexico'),

-- 중남미
('BR', 'Brazil'),
('AR', 'Argentina'),
('CL', 'Chile'),
('CO', 'Colombia'),
('PE', 'Peru'),

-- 오세아니아
('AU', 'Australia'),
('NZ', 'New Zealand'),

-- 중동
('AE', 'United Arab Emirates'),
('SA', 'Saudi Arabia'),
('IL', 'Israel'),
('TR', 'Turkey'),

-- 아프리카
('ZA', 'South Africa'),
('EG', 'Egypt'),
('NG', 'Nigeria'),
('KE', 'Kenya'),
('MA', 'Morocco');

-- 번역 데이터 삽입
INSERT INTO country_translations (country_code, lang_code, country_name) VALUES
('KR', 'ko', '대한민국'),
('KR', 'en', 'Korea, Republic of'),
('KR', 'ja', '大韓民国'),
('KR', 'zh', '大韩民国'),
('US', 'ko', '미국'),
('US', 'en', 'United States'),
('US', 'ja', 'アメリカ合衆国'),
('US', 'zh', '美国');

-- 번역 데이터 삽입 (주요 국가)
INSERT INTO country_translations (country_code, lang_code, country_name) VALUES
-- 한국
('KR', 'ko', '대한민국'),
('KR', 'en', 'Korea, Republic of'),
('KR', 'ja', '大韓民国'),
('KR', 'zh', '大韩民国'),

-- 일본
('JP', 'ko', '일본'),
('JP', 'en', 'Japan'),
('JP', 'ja', '日本'),
('JP', 'zh', '日本'),

-- 중국
('CN', 'ko', '중국'),
('CN', 'en', 'China'),
('CN', 'ja', '中国'),
('CN', 'zh', '中国'),

-- 미국
('US', 'ko', '미국'),
('US', 'en', 'United States'),
('US', 'ja', 'アメリカ合衆国'),
('US', 'zh', '美国'),

-- 영국
('GB', 'ko', '영국'),
('GB', 'en', 'United Kingdom'),
('GB', 'ja', 'イギリス'),
('GB', 'zh', '英国'),

-- 프랑스
('FR', 'ko', '프랑스'),
('FR', 'en', 'France'),
('FR', 'ja', 'フランス'),
('FR', 'zh', '法国'),

-- 독일
('DE', 'ko', '독일'),
('DE', 'en', 'Germany'),
('DE', 'ja', 'ドイツ'),
('DE', 'zh', '德国'),

-- 이탈리아
('IT', 'ko', '이탈리아'),
('IT', 'en', 'Italy'),
('IT', 'ja', 'イタリア'),
('IT', 'zh', '意大利'),

-- 스페인
('ES', 'ko', '스페인'),
('ES', 'en', 'Spain'),
('ES', 'ja', 'スペイン'),
('ES', 'zh', '西班牙'),

-- 캐나다
('CA', 'ko', '캐나다'),
('CA', 'en', 'Canada'),
('CA', 'ja', 'カナダ'),
('CA', 'zh', '加拿大'),

-- 호주
('AU', 'ko', '호주'),
('AU', 'en', 'Australia'),
('AU', 'ja', 'オーストラリア'),
('AU', 'zh', '澳大利亚');

-- 나머지 국가들은 영어 이름을 기본으로 사용
INSERT INTO country_translations (country_code, lang_code, country_name)
SELECT country_code, 'en', country_name
FROM country
WHERE country_code NOT IN (
    SELECT DISTINCT country_code 
    FROM country_translations
);