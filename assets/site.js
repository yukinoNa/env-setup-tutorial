/* ==========================================================================
   环境搭建教程 · 共用脚本
   原则：脚本失效时页面必须完整可读；所有入场动效只做位移，不碰 opacity
   ========================================================================== */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 顶栏滚动阴影 ---------- */
  var topbar = document.getElementById('topbar');
  if (topbar) {
    var heroEl = document.querySelector('.hero');
    var onScroll = function () {
      // 滚出 hero 之后，顶栏才从透明变浅色
      var t = heroEl ? Math.max(heroEl.offsetHeight - 74, 40) : 12;
      topbar.classList.toggle('stuck', window.scrollY > t);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 卡片鼠标跟随光斑 ---------- */
  document.querySelectorAll('.card, .entry').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- 自动生成「下一节」链接（不依赖 GSAP） ---------- */
  (function () {
    var secs = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
    secs.forEach(function (sec, i) {
      var next = secs[i + 1];
      if (!next) return;
      var h = next.querySelector('h2');
      if (!h) return;
      var a = document.createElement('a');
      a.className = 'nextlink';
      a.href = '#' + next.id;
      a.innerHTML = '<span><span class="lab">下一节</span><span class="ttl">' +
        h.textContent.trim() + '</span></span><span class="arw" aria-hidden="true">\u2192</span>';
      sec.appendChild(a);
    });
  })();

  /* ---------- 页脚 rua（无 GSAP 时用 CSS） ---------- */
  var rua = document.getElementById('rua');

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    if (rua) {
      rua.addEventListener('mouseenter', function () {
        rua.style.transform = 'scale(1.07) rotate(-3deg)';
        setTimeout(function () { rua.style.transform = ''; }, 420);
      });
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 首屏入场 ---------- */
  var heroBits = '.hero .eyebrow, .hero h1, .hero .sub, .hero-cta .btn, .kpi, .hero-art';
  if (document.querySelector('.hero h1')) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero .eyebrow', { y: 16, autoAlpha: 0, duration: .55 })
      .from('.hero h1', { y: 24, autoAlpha: 0, duration: .75 }, '-=0.35')
      .from('.hero .sub', { y: 20, autoAlpha: 0, duration: .6 }, '-=0.5')
      .from('.hero-cta .btn', { y: 14, autoAlpha: 0, duration: .45, stagger: .08 }, '-=0.42')
      .from('.kpi', { y: 18, autoAlpha: 0, duration: .6 }, '-=0.32')
      .from('.hero-art', { scale: .6, autoAlpha: 0, duration: .9, ease: 'back.out(1.6)' }, '-=0.75');
  }
  if (document.querySelector('.hero-art img')) {
    gsap.to('.hero-art img', {
      y: -9, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1
    });
  }

  /* ---------- KPI 数字滚动 ---------- */
  document.querySelectorAll('.kpi b[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    var obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.1, delay: .85, ease: 'power2.out',
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });

  /* ---------- 阅读进度 ---------- */
  if (document.getElementById('progress')) {
    gsap.to('#progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 }
    });
  }

  /* ---------- 逐块揭示（只位移） ---------- */
  document.documentElement.classList.add('js-anim');
  if (document.querySelector('.reveal')) {
    gsap.set('.reveal', { y: 22 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 93%', once: true, interval: .08, batchMax: 6,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, duration: .6, stagger: .07, ease: 'power2.out', overwrite: true });
      }
    });
  }

  /* ---------- 兜底：动画卡住也要把位移归零 ---------- */
  setTimeout(function () {
    gsap.killTweensOf('.reveal');
    gsap.killTweensOf(heroBits);
    if (document.querySelector('.reveal')) gsap.set('.reveal', { y: 0 });
    gsap.set(heroBits, { y: 0, opacity: 1, scale: 1, visibility: 'inherit' });
    ScrollTrigger.refresh();
  }, 4200);

  /* ---------- 章节编号弹入 ---------- */
  gsap.utils.toArray('.sec-num, .entry .no').forEach(function (el) {
    gsap.fromTo(el, { scale: .8 }, {
      scale: 1, duration: .5, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });

  /* ---------- ScrollSpy：顶栏 + 左侧目录 ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('#topnav a, #toc a'));
  if (links.length) {
    var setActive = function (id) {
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    };
    gsap.utils.toArray('section[id]').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 28%', end: 'bottom 28%',
        onToggle: function (self) { if (self.isActive) setActive(sec.id); }
      });
    });
  }

  /* ---------- 页脚 rua ---------- */
  if (rua) {
    rua.addEventListener('mouseenter', function () {
      gsap.fromTo(rua, { rotation: 0 }, {
        rotation: 8, duration: .12, repeat: 3, yoyo: true, ease: 'sine.inOut',
        onComplete: function () { gsap.to(rua, { rotation: 0, duration: .2 }); }
      });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
