-- 국가 정보를 저장할 테이블 생성
CREATE TABLE iso_countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code CHAR(2) NOT NULL UNIQUE, -- ISO 3166-1 Alpha-2 코드
    country_name VARCHAR(100) NOT NULL   -- 국가 이름
);

-- ISO 3166-1 국가 데이터 삽입
INSERT INTO iso_countries (country_code, country_name) VALUES
('US', 'United States'),
('KR', 'South Korea'),
('JP', 'Japan'),
('CN', 'China'),
('FR', 'France'),
('DE', 'Germany'),
('IN', 'India'),
('UK', 'United Kingdom'),
('CA', 'Canada'),
('AU', 'Australia'),
('IT', 'Italy'),
('ES', 'Spain'),
('BR', 'Brazil'),
('ZA', 'South Africa');
