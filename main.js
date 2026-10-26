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

  document.querySelectorAll(".filters button").forEach(function (button) {
    button.addEventListener("click", function () {
      const kind = button.dataset.filter;
      document.querySelectorAll(".filters button").forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });
      document.querySelectorAll(".paper").forEach(function (paper) {
        paper.hidden = kind !== "all" && paper.dataset.kind !== kind;
      });
    });
  });

  const canvas = document.getElementById("field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = canvas.closest(".hero");
  let running = true;
  let frameId = 0;
  const pointer = { x: 0.7, y: 0.46, tx: 0.7, ty: 0.46, active: false };

  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const gap = w < 720 ? 16 : 18;
    const cols = Math.ceil(w / gap);
    const rows = Math.ceil(h / gap);
    const t = reduce ? 1.4 : now / 1000;
    const phase = reduce ? 0.82 : (Math.sin(t * 0.45) + 1) / 2;
    if (pointer.active) {
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
    }
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const nx = x / cols;
        const ny = y / rows;
        const dx = nx - pointer.x;
        const dy = ny - pointer.y;
        const blob = Math.exp(-(dx * dx * 7 + dy * dy * 10));
        const ridgeY = 0.3 + 0.16 * Math.sin(nx * 7 + t * 0.35);
        const ridge = Math.exp(-((ny - ridgeY) * 9) ** 2);
        const signal = Math.min(1, blob * 0.85 + ridge);
        const flicker = reduce ? hash(x * 19 + y * 7) : hash(x * 19 + y * 7 + Math.floor(t * 6));
        const value = signal * (0.25 + 0.75 * phase) + flicker * (1 - phase) * 0.7 * (0.25 + signal);
        if (value < 0.08) continue;
        const selected = signal > 0.55 && phase > 0.45;
        ctx.fillStyle = selected
          ? "rgba(216, 132, 108, " + (0.45 + value * 0.55) + ")"
          : "rgba(246, 241, 231, " + (0.12 + value * 0.5) + ")";
        const size = selected ? gap * 0.62 : gap * (0.26 + value * 0.28);
        ctx.fillRect(x * gap, y * gap, size, size);
      }
    }
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    if (!reduce) frameId = window.requestAnimationFrame(loop);
  }

  resize();
  draw(performance.now());
  window.addEventListener("resize", resize);
  hero.addEventListener("pointermove", function (event) {
    const rect = canvas.getBoundingClientRect();
    pointer.tx = (event.clientX - rect.left) / rect.width;
    pointer.ty = (event.clientY - rect.top) / rect.height;
    pointer.active = true;
  });

  if ("IntersectionObserver" in window) {
    const watch = new IntersectionObserver(function (entries) {
      running = entries.some(function (entry) {
        return entry.isIntersecting;
      });
      if (running && !reduce) {
        window.cancelAnimationFrame(frameId);
        frameId = window.requestAnimationFrame(loop);
      }
    });
    watch.observe(hero);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
      return;
    }
    running = true;
    if (!reduce) frameId = window.requestAnimationFrame(loop);
  });

  frameId = window.requestAnimationFrame(loop);
})();
