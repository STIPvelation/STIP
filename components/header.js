const langLabel = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};
const handleBurgerMenu = () => {
  const nav = document.querySelector(".side-bar-container");
  nav.classList.add("open");
  nav.classList.remove("close");
};

const handleBurgerMenuClose = () => {
  const nav = document.querySelector(".side-bar-container");
  nav.classList.remove("open");
  nav.classList.add("close");
};

const handleLangChange = (lang, isSidebar = false) => {
  const prevLang = localStorage.getItem("lang");
  localStorage.setItem("lang", lang);
  if (!isSidebar) {
    document.querySelector(".btn-secondary").innerHTML = langLabel[lang];
    return;
  }
  const sideBarList = document.querySelector(".side-bar-list.lang");
  const langDom = sideBarList.querySelector(`.${lang}`);
  const prevLangDom = sideBarList.querySelector(`.${prevLang}`);
  langDom.classList.toggle("active");
  prevLangDom.classList.toggle("active");
};

document.addEventListener("readystatechange", function () {
  const lang = localStorage.getItem("lang");
  if (lang) {
    document.querySelector(".btn-secondary").innerHTML = langLabel[lang];
    const sideBarList = document.querySelector(".side-bar-list.lang");
    const langDom = sideBarList.querySelector(`.${lang}`);
    langDom.classList.toggle("active");
  }

  const currentPath = window.location.pathname;
  const navigateDom=document.querySelectorAll("a.navigate")
  navigateDom.forEach((dom)=>{
      if(currentPath.replace(".html","").includes(dom.getAttribute("href").replace(".html",""))){
      dom.classList.add("active")
    }
  });
});
