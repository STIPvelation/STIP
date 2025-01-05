document.addEventListener('DOMContentLoaded', () => {
  // PHP에서 반환한 데이터 가져오기
  fetch('location.php') // PHP 파일 경로
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
      } else {
        // 위치 정보를 HTML에 출력
        const info = `
                    <p>IP: ${data.query}</p>
                    <p>국가: ${data.country}</p>
                    <p>지역: ${data.region}</p>
                    <p>도시: ${data.city}</p>
                    <p>위도: ${data.lat}</p>
                    <p>경도: ${data.lon}</p>
                `;
        document.getElementById('location-info').innerHTML = info;
      }
    })
    .catch(error => console.error('에러 발생:', error));
});
