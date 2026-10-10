(function () {
  "use strict";

  /* ---------- Settings you may want to edit ---------- */
  var EMAIL = "ajabkhan0055@gmail.com";
  var CV_URL = "assets/Ajab-Khan-CV.pdf";
  var TIME_ZONE = "Asia/Karachi"; /* Loralai, Balochistan */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  function $(id) { return document.getElementById(id); }

  /* ---------- Footer year ---------- */
  $("year").textContent = new Date().getFullYear();

  /* ---------- Toast ---------- */
  var toastEl = $("toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = $("themeBtn");
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeLabel() {
    themeBtn.setAttribute("aria-label", "Switch to " + (currentTheme() === "dark" ? "light" : "dark") + " theme");
  }
  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeLabel();
    window.dispatchEvent(new Event("themechange"));
  }
  themeBtn.addEventListener("click", toggleTheme);
  syncThemeLabel();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("menuBtn"), nav = $("nav");
  function closeMenu() {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Current section in nav ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  if ("IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) navIO.observe(s);
    });
  }

  /* ---------- Scroll progress and back to top ---------- */
  var progress = $("progress"), toTop = $("toTop"), ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    toTop.classList.toggle("show", window.scrollY > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Live local time in Loralai ---------- */
  function loralaiTime() {
    try {
      return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE }).format(new Date());
    } catch (e) { return ""; }
  }
  var clockEl = $("clock");
  function tickClock() { clockEl.textContent = loralaiTime(); }
  tickClock();
  setInterval(tickClock, 20000);

  /* ---------- Typed role line ---------- */
  (function () {
    var el = $("typed");
    var roles = ["full stack web apps", "NLP chatbots", "machine learning models", "2D and 3D games", "digital marketing campaigns"];
    if (reduceMotion) return;
    var r = 0, c = 0, deleting = false;
    function step() {
      var word = roles[r];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      var delay = deleting ? 35 : 75;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      setTimeout(step, delay);
    }
    el.textContent = "";
    setTimeout(step, 900);
  })();

  /* ---------- Hero network canvas (tokens linking up, like words in a sentence) ---------- */
  (function () {
    var canvas = $("net"), hero = canvas.parentElement, ctx = canvas.getContext("2d");
    var w = 0, h = 0, nodes = [], mouse = { x: -9999, y: -9999 }, raf = 0, inView = true, rgb = [23, 34, 54];

    function readColor() {
      var v = getComputedStyle(root).getPropertyValue("--ink").trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) { var n = parseInt(v.slice(1), 16); rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(70, (w * h) / 15000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.4 + Math.random() * 1.6, gold: i % 7 === 0 });
      }
      readColor();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
          dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110 && d > 0) { a.x += (dx / d) * 1.2; a.y += (dy / d) * 1.2; }
        }
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + ((1 - d / 130) * 0.16).toFixed(3) + ")";
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170) {
          ctx.strokeStyle = "rgba(179,40,45," + ((1 - d / 170) * 0.5).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = a.gold ? "rgba(224,165,38,.85)" : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",.35)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.gold ? a.r + 1 : a.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function loop() { draw(); raf = requestAnimationFrame(loop); }
    function start() { if (!raf && !reduceMotion && inView && !document.hidden) loop(); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    size(); draw();
    window.addEventListener("resize", function () { size(); draw(); });
    window.addEventListener("themechange", function () { readColor(); draw(); });
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("mouseleave", function () { mouse.x = mouse.y = -9999; });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; inView ? start() : stop(); }).observe(hero);
    }
    start();
  })();

  /* ---------- Portrait 3D tilt ---------- */
  (function () {
    var p = document.querySelector(".portrait");
    if (!p || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    p.addEventListener("mousemove", function (e) {
      var r = p.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      p.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      p.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
    });
    p.addEventListener("mouseleave", function () { p.style.setProperty("--rx", "0deg"); p.style.setProperty("--ry", "0deg"); });
  })();

  /* ---------- Scroll reveal and counters ---------- */
  (function () {
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

    function runCounter(el) {
      var target = parseInt(el.getAttribute("data-count"), 10), start = null, dur = 1200;
      function frame(t) {
        if (start === null) start = t;
        var k = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * eased);
        if (k < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window) || reduceMotion) return;

    counters.forEach(function (c) { c.textContent = "0"; });
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); counterIO.unobserve(en.target); }
      });
    }, { threshold: .6 });
    counters.forEach(function (c) { counterIO.observe(c); });

    var selectors = ".section h2, .prose p, .facts, .stats li, .skill, .project, .timeline li, .cert-list li, .contact-list li, .form, .assistant-intro, .chat, .searchbar, .filters";
    var items = Array.prototype.slice.call(document.querySelectorAll(selectors));
    var seen = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement, n = seen.get(parent) || 0;
      seen.set(parent, n + 1);
      el.style.setProperty("--i", Math.min(n, 6));
      el.classList.add("reveal");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });

    var tl = document.querySelector(".timeline");
    if (tl) {
      new IntersectionObserver(function (en, o) {
        if (en[0].isIntersecting) { tl.classList.add("in"); o.disconnect(); }
      }, { threshold: .1 }).observe(tl);
    }
  })();

  /* ---------- Skill search ---------- */
  (function () {
    var input = $("skillSearch"), count = $("skillCount");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".skill"));
    function total() { return document.querySelectorAll(".skill .tags li").length; }
    function update() {
      var q = input.value.trim().toLowerCase(), matches = 0, shown = 0;
      cards.forEach(function (card) {
        var titleHit = q && card.querySelector("h3").textContent.toLowerCase().indexOf(q) > -1;
        var any = false;
        Array.prototype.forEach.call(card.querySelectorAll(".tags li"), function (li) {
          var hit = !!q && li.textContent.toLowerCase().indexOf(q) > -1;
          li.classList.toggle("hit", hit);
          if (hit) { any = true; matches++; }
        });
        var show = !q || any || titleHit;
        card.hidden = !show;
        if (show) shown++;
      });
      count.textContent = !q ? "" : shown ? matches + " matching " + (matches === 1 ? "skill" : "skills") : "No skill matches \"" + input.value.trim() + "\". Try python, react or spaCy.";
    }
    input.addEventListener("input", update);
  })();

  /* ---------- Project filters ---------- */
  (function () {
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter"));
    var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        projects.forEach(function (p) {
          var show = f === "all" || p.getAttribute("data-cat").split(" ").indexOf(f) > -1;
          p.hidden = !show;
          p.classList.remove("pop");
          if (show) { void p.offsetWidth; p.classList.add("pop"); }
        });
      });
    });
  })();

  /* ---------- Copy email ---------- */
  function copyEmail() {
    function done() { toast("Email address copied"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var t = document.createElement("textarea");
      t.value = EMAIL; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed. Email: " + EMAIL); }
      t.remove();
    }
  }
  $("copyEmail").addEventListener("click", copyEmail);

  /* ---------- Quick menu (Ctrl+K, Cmd+K or /) ---------- */
  (function () {
    var dlg = $("palette"), input = $("paletteInput"), list = $("paletteList"), btn = $("paletteBtn");
    if (typeof dlg.showModal !== "function") { btn.hidden = true; return; }
    function go(hash) { var el = document.querySelector(hash); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
    function open(url) { window.open(url, "_blank", "noopener"); }
    var actions = [
      { label: "Ask my assistant", hint: "Section", run: function () { go("#assistant"); setTimeout(function () { $("chatInput").focus({ preventScroll: true }); }, 500); } },
      { label: "About", hint: "Section", run: function () { go("#about"); } },
      { label: "Skills", hint: "Section", run: function () { go("#skills"); } },
      { label: "Projects", hint: "Section", run: function () { go("#projects"); } },
      { label: "Education and training", hint: "Section", run: function () { go("#journey"); } },
      { label: "Certificates", hint: "Section", run: function () { go("#certificates"); } },
      { label: "Contact", hint: "Section", run: function () { go("#contact"); } },
      { label: "Switch theme", hint: "Action", run: toggleTheme },
      { label: "Download CV", hint: "Action", run: function () { var a = document.createElement("a"); a.href = CV_URL; a.download = ""; document.body.appendChild(a); a.click(); a.remove(); } },
      { label: "Copy email address", hint: "Action", run: copyEmail },
      { label: "Open GitHub", hint: "Link", run: function () { open("https://github.com/ajabkhan123"); } },
      { label: "Open Kaggle", hint: "Link", run: function () { open("https://kaggle.com/ajabkhan21"); } },
      { label: "Show Loralai on the map", hint: "Link", run: function () { open("https://www.google.com/maps/search/?api=1&query=Loralai%2C+Balochistan%2C+Pakistan"); } }
    ];
    var visible = [], sel = 0;

    function render() {
      var q = input.value.trim().toLowerCase();
      visible = actions.filter(function (a) { return !q || a.label.toLowerCase().indexOf(q) > -1 || a.hint.toLowerCase().indexOf(q) > -1; });
      if (sel >= visible.length) sel = 0;
      list.innerHTML = "";
      if (!visible.length) {
        var none = document.createElement("li"); none.textContent = "Nothing found. Try \"skills\" or \"cv\"."; none.setAttribute("role", "presentation"); list.appendChild(none); return;
      }
      visible.forEach(function (a, i) {
        var li = document.createElement("li");
        li.setAttribute("role", "option"); li.id = "pal-" + i;
        li.setAttribute("aria-selected", String(i === sel));
        li.innerHTML = "<span></span><small></small>";
        li.firstChild.textContent = a.label; li.lastChild.textContent = a.hint;
        li.addEventListener("click", function () { choose(i); });
        li.addEventListener("mousemove", function () { if (sel !== i) { sel = i; mark(); } });
        list.appendChild(li);
      });
      input.setAttribute("aria-activedescendant", "pal-" + sel);
    }
    function mark() {
      Array.prototype.forEach.call(list.children, function (li, i) { li.setAttribute("aria-selected", String(i === sel)); });
      input.setAttribute("aria-activedescendant", "pal-" + sel);
      var el = list.children[sel]; if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }
    function choose(i) { var a = visible[i]; if (!a) return; dlg.close(); setTimeout(a.run, 60); }
    function show() { input.value = ""; sel = 0; render(); dlg.showModal(); input.focus(); }

    btn.addEventListener("click", show);
    input.addEventListener("input", function () { sel = 0; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (visible.length) { sel = (sel + 1) % visible.length; mark(); } }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (visible.length) { sel = (sel - 1 + visible.length) % visible.length; mark(); } }
      else if (e.key === "Enter") { e.preventDefault(); choose(sel); }
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName);
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); dlg.open ? dlg.close() : show(); }
      else if (e.key === "/" && !typing && !dlg.open) { e.preventDefault(); show(); }
    });
  })();

  /* ---------- CV assistant (keyword intent matching with follow-up suggestions) ---------- */
  var topics = [
    { id: "hello", words: ["hello", "hi", "hey", "salam", "assalam"], next: ["who", "fyp", "skills", "contact"],
      answer: "Hello! I can tell you about Ajab's projects, skills, education, training, certificates or how to contact him." },
    { id: "who", q: "Who is Ajab?", words: ["who", "yourself", "introduce", "summary", "background", "profile"], next: ["fyp", "skills", "location", "hire"],
      answer: "Ajab Khan is a Computer Science graduate (University of Loralai, 2026) and full stack developer from Loralai, Balochistan. He works with Python, machine learning and natural language processing, and has also trained in digital marketing and freelancing." },
    { id: "fyp", q: "What was your final year project?", words: ["final", "fyp", "chatbot", "thesis"], next: ["skills", "ml", "projects", "contact"],
      answer: "His final year project is an NLP-based online digital assistant chatbot. It uses text preprocessing, tokenization and intent classification (NLTK, spaCy, Hugging Face Transformers), with a Flask backend and a web chat interface. He tested and refined it to improve accuracy and conversation flow." },
    { id: "projects", q: "What projects have you built?", words: ["project", "projects", "built", "build", "made", "portfolio", "game", "games"], next: ["fyp", "ml", "skills", "contact"],
      answer: "Main projects:\n1. NLP-based digital assistant chatbot (final year project)\n2. Machine learning models for classification and regression\n3. 2D and 3D games with PyGame and PyOpenGL\n4. Digital marketing campaigns for real clients on Fiverr and Upwork" },
    { id: "skills", q: "Which technologies do you use?", words: ["skill", "skills", "technology", "technologies", "tech", "stack", "tools", "programming", "language", "languages", "python", "react", "node", "javascript", "java", "c++"], next: ["ml", "projects", "certs", "contact"],
      answer: "Languages: Python, Java, C++, C, JavaScript.\nWeb: HTML, CSS, React.js, Node.js, Express.js, REST APIs, Bootstrap, Tailwind.\nAI and NLP: Scikit-learn, TensorFlow, PyTorch, Keras, NLTK, spaCy, Hugging Face, LangChain, OpenAI API.\nDatabases: MySQL, MongoDB, SQLite, Firebase." },
    { id: "ml", q: "What do you know about machine learning?", words: ["machine", "learning", "ml", "ai", "artificial", "intelligence", "model", "models", "deep", "neural"], next: ["fyp", "certs", "skills", "contact"],
      answer: "In machine learning Ajab has built supervised classification and regression models with Scikit-learn, Pandas and NumPy, visualised results with Matplotlib, and explored neural networks with TensorFlow and PyTorch." },
    { id: "education", q: "Tell me about your education", words: ["education", "degree", "university", "study", "studied", "college", "school", "bscs", "graduate", "marks", "fsc", "matric"], next: ["training", "certs", "fyp", "location"],
      answer: "BS Computer Science, University of Loralai (July 2022 to 2026).\nFSc Pre-Engineering, Government Degree College Boys, Loralai: 839/1100.\nMatriculation (Science), Guideline Public High School, Loralai: 775/1100." },
    { id: "training", q: "Tell me about your training", words: ["experience", "training", "trainee", "internship", "job", "digibizz", "freelance", "freelancing", "marketing", "seo", "fiverr", "upwork"], next: ["certs", "projects", "hire", "contact"],
      answer: "Ajab completed a four-month freelancing and digital marketing program at DigiBizz Center, University of Loralai (14 May to 15 Aug 2024) and was certified as a Successful and Active Freelancer by the Government of Balochistan S&IT Department. In May 2025 he finished a 40-hour digital marketing training with Riphah International University and IP-SEC (PSEB)." },
    { id: "certs", q: "Which certificates do you have?", words: ["certificate", "certificates", "certification", "certifications", "course", "courses", "coursera", "google"], next: ["skills", "training", "education", "contact"],
      answer: "Certificates include Google courses on Coursera (Crash Course on Python, Get Started with Python, The Nuts and Bolts of Machine Learning), Python Basics from the University of Michigan, Get Started with Canva, Cyber Security Fundamentals (MindLuster), and the 40-hour Digital Marketing training." },
    { id: "lang", q: "Which languages do you speak?", words: ["speak", "spoken", "pashto", "urdu", "english"], next: ["location", "who", "contact", "hire"],
      answer: "Ajab speaks Pashto, Urdu and English." },
    { id: "location", q: "Where are you based?", words: ["where", "location", "live", "city", "loralai", "balochistan", "based", "pakistan", "from"], next: ["education", "time", "contact", "hire"],
      answer: "Ajab is based in Loralai, Balochistan, Pakistan. He studied at the University of Loralai and did his freelancing training at the DigiBizz Center there." },
    { id: "time", q: "What time is it there?", words: ["time", "clock", "timezone"], next: ["location", "contact", "hire", "who"],
      answer: function () { return "It is " + loralaiTime() + " in Loralai right now (Pakistan Standard Time)."; } },
    { id: "hire", q: "Are you available for work?", words: ["hire", "available", "availability", "opportunity", "opportunities", "looking", "open", "role", "seeking"], next: ["contact", "cv", "projects", "skills"],
      answer: "Yes. Ajab is looking for a challenging role where he can use his technical depth and creativity. Use the contact form below, or email " + EMAIL + "." },
    { id: "contact", q: "How can I contact you?", words: ["contact", "email", "mail", "phone", "call", "reach", "number", "github", "kaggle", "whatsapp"], next: ["cv", "hire", "location", "projects"],
      answer: "Email: " + EMAIL + "\nPhone: +92 332 2781772\nGitHub: github.com/ajabkhan123\nKaggle: kaggle.com/ajabkhan21" },
    { id: "cv", q: "Where can I get your CV?", words: ["cv", "resume", "download"], next: ["contact", "hire", "projects", "skills"],
      answer: "Use the \"Download CV\" button at the top of this page, or open the quick menu with Ctrl K and choose Download CV." }
  ];
  var byId = {};
  topics.forEach(function (t) { byId[t.id] = t; });
  var defaultNext = ["fyp", "skills", "education", "contact"];
  var fallback = "I don't have an answer for that. I only know what is on Ajab's CV, so try asking about his projects, skills, education, training, certificates or contact details.";

  function tokenize(text) { return text.toLowerCase().replace(/[^a-z0-9+\s]/g, " ").split(/\s+/).filter(Boolean); }
  function findTopic(text) {
    var tokens = tokenize(text), joined = " " + tokens.join(" ") + " ", best = null, bestScore = 0;
    topics.forEach(function (t) {
      var score = 0;
      t.words.forEach(function (w) { if (tokens.indexOf(w) > -1) score += 1; });
      if (t.id === "fyp" && /final|fyp/.test(joined)) score += 2;
      if (t.id === "location" && /where/.test(joined) && /(based|live|from)/.test(joined)) score += 2;
      if (score > bestScore) { best = t; bestScore = score; }
    });
    return best;
  }

  var log = $("chatLog"), input = $("chatInput"), sendBtn = $("chatSend"), chipBox = $("chips"), clearBtn = $("chatClear");
  var busy = false, timers = [];

  function addMsg(text, who, extra) {
    var p = document.createElement("p");
    p.className = "msg " + who + (extra ? " " + extra : "");
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    return p;
  }
  /* Bot replies appear word by word, like a live assistant */
  function stream(text, done) {
    var p = addMsg("", "bot");
    if (reduceMotion) { p.textContent = text; log.scrollTop = log.scrollHeight; done(); return; }
    var words = text.split(/(\s+)/), i = 0;
    (function next() {
      p.textContent += words[i++] || "";
      log.scrollTop = log.scrollHeight;
      if (i < words.length) timers.push(setTimeout(next, 22)); else done();
    })();
  }
  function showChips(ids) {
    chipBox.innerHTML = "";
    ids.forEach(function (id) {
      var t = byId[id]; if (!t || !t.q) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = t.q;
      b.addEventListener("click", function () { ask(t.q); });
      chipBox.appendChild(b);
    });
  }
  function ask(question) {
    var q = question.trim();
    if (!q || busy) return;
    busy = true;
    addMsg(q, "user");
    input.value = "";
    var typing = addMsg("Typing...", "bot", "typing");
    timers.push(setTimeout(function () {
      typing.remove();
      var t = findTopic(q);
      var text = t ? (typeof t.answer === "function" ? t.answer() : t.answer) : fallback;
      stream(text, function () { showChips(t ? t.next : defaultNext); busy = false; });
    }, 450));
  }
  function resetChat() {
    timers.forEach(clearTimeout); timers = []; busy = false;
    log.innerHTML = "";
    addMsg("Hi, I'm Ajab's CV assistant. Ask me about his projects, skills, education or how to get in touch.", "bot");
    showChips(defaultNext);
  }
  sendBtn.addEventListener("click", function () { ask(input.value); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ask(input.value); } });
  clearBtn.addEventListener("click", resetChat);
  resetChat();

  /* ---------- Contact form: opens the visitor's email app ---------- */
  var form = $("contactForm"), note = $("formNote");
  function setError(fieldId, errId, msg) {
    $(errId).textContent = msg;
    $(fieldId).closest(".field").classList.toggle("invalid", !!msg);
    return !msg;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("cName").value.trim(), email = $("cEmail").value.trim(), msg = $("cMsg").value.trim();
    var ok = true;
    ok = setError("cName", "eName", name ? "" : "Enter your name.") && ok;
    ok = setError("cEmail", "eEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address.") && ok;
    ok = setError("cMsg", "eMsg", msg ? "" : "Write a short message.") && ok;
    if (!ok) { note.textContent = ""; return; }
    var subject = "Portfolio message from " + name;
    var body = msg + "\n\nFrom: " + name + " (" + email + ")";
    window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    note.textContent = "Your email app should open with the message ready to send.";
  });
})();
