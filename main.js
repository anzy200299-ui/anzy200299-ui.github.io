(function () {
  const titles = {
    en: "Dylan Yan — Efficient Generative Models",
    zh: "Dylan Yan — 高效生成模型"
  };
  const descriptions = {
    en: "Dylan Yan is a master’s student in Electronics and Information Engineering at Shanghai Jiao Tong University and a research assistant in EPIC Lab, working on efficient generative models.",
    zh: "Dylan Yan，上海交通大学电子信息专业硕士生，EPIC Lab 研究助理，研究高效生成模型。"
  };

  const root = document.documentElement;
  const toggle = document.getElementById("lang-toggle");
  const description = document.querySelector('meta[name="description"]');

  function applyLanguage(lang) {
    root.lang = lang === "zh" ? "zh" : "en";
    document.title = titles[root.lang];
    if (description) description.setAttribute("content", descriptions[root.lang]);
    if (toggle) {
      toggle.setAttribute("aria-label", root.lang === "zh" ? "Switch to English" : "切换到中文");
    }
    try {
      localStorage.setItem("site-lang", root.lang);
    } catch (err) {
      /* ignore private-mode storage failures */
    }
  }

  applyLanguage(root.lang);
  if (toggle) {
    toggle.addEventListener("click", function () {
      applyLanguage(root.lang === "zh" ? "en" : "zh");
    });
  }

  const nav = document.getElementById("nav");
  const menu = document.getElementById("menu-toggle");
  if (menu && nav) {
    menu.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menu.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        nav.classList.remove("is-open");
        menu.setAttribute("aria-expanded", "false");
      }
    });
  }

  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            const current = link.getAttribute("href") === "#" + entry.target.id;
            if (current) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

})();
