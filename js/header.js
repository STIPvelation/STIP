// header.js
document.addEventListener("DOMContentLoaded", () => {
  const headerElement = document.querySelector("header");

  if (headerElement) {
    fetch("js/header.html")
      .then((response) => {
        if (!response.ok) throw new Error("Header 파일을 불러올 수 없습니다.");
        return response.text();
      })
      .then((html) => {
        headerElement.innerHTML = html;
      })
      .catch((error) => console.error(error));
  }
});
