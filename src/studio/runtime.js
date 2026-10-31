/* MedFrame Site Studio runtime — plain JS, no dependencies.
   Shared by the editor preview and every exported site.
   window.MFStudio.init(rootEl) wires up: scroll reveal, card tilt,
   mobile menu, tests search, WhatsApp booking forms, open-now badges,
   count-up numbers and the WebGL (three.js) scenes. Returns a cleanup fn. */
(function () {
  if (window.MFStudio) return;
  var reduce = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var fine = function () { return window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches; };

  function init(root) {
    var off = [];
    var on = function (el, ev, fn, opt) { el.addEventListener(ev, fn, opt); off.push(function () { el.removeEventListener(ev, fn, opt); }); };
    var animate = root.classList.contains('st-animate') && !reduce();

    /* reveal */
    if (animate && 'IntersectionObserver' in window) {
      var els = root.querySelectorAll('[data-anim]');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('is-pre'); io.unobserve(e.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { el.classList.add('is-pre'); io.observe(el); });
      off.push(function () { io.disconnect(); });
      // safety net: anything already scrolled past (fast flicks, jumps to #anchors) is shown too
      var queued = false;
      var sweep = function () {
        queued = false;
        var limit = window.innerHeight * 0.96;
        root.querySelectorAll('[data-anim].is-pre').forEach(function (el) { if (el.getBoundingClientRect().top < limit) { el.classList.remove('is-pre'); io.unobserve(el); } });
      };
      var onScroll = function () { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
      window.addEventListener('scroll', onScroll, { passive: true, capture: true });
      off.push(function () { window.removeEventListener('scroll', onScroll, { capture: true }); });
    } else {
      root.querySelectorAll('[data-anim].is-pre').forEach(function (el) { el.classList.remove('is-pre'); });
    }

    /* count-up */
    if (animate && 'IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          var el = e.target, raw = el.getAttribute('data-count') || '', m = raw.match(/([\d.,]+)/);
          if (!m) return;
          var target = parseFloat(m[1].replace(/,/g, '')), pre = raw.slice(0, m.index), post = raw.slice(m.index + m[1].length), t0 = performance.now();
          var step = function (t) {
            var k = Math.min(1, (t - t0) / 1400), v = target * (1 - Math.pow(1 - k, 3));
            el.textContent = pre + (target % 1 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US')) + post;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.4 });
      root.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
      off.push(function () { cio.disconnect(); });
    }

    /* tilt */
    if (fine() && !reduce()) {
      root.querySelectorAll('.st-tilt-on [data-tilt]').forEach(function (el) {
        on(el, 'pointermove', function (e) {
          var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = 'perspective(900px) rotateX(' + (-y * 9).toFixed(2) + 'deg) rotateY(' + (x * 11).toFixed(2) + 'deg) translateY(-4px)';
        });
        on(el, 'pointerleave', function () { el.style.transform = ''; });
      });
    }

    /* mobile menu */
    root.querySelectorAll('[data-burger]').forEach(function (btn) {
      on(btn, 'click', function () {
        var h = btn.closest('.st-header'); if (!h) return;
        var open = h.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    root.querySelectorAll('.st-drawer a').forEach(function (a) {
      on(a, 'click', function () { var h = a.closest('.st-header'); if (h) h.classList.remove('is-open'); });
    });

    /* tests guide */
    root.querySelectorAll('[data-tests]').forEach(function (box) {
      var input = box.querySelector('[data-tests-search]'), cat = 'all';
      var items = box.querySelectorAll('.st-test'), empty = box.querySelector('.st-tests-empty'), ask = box.querySelector('[data-ask]');
      var apply = function () {
        var q = (input && input.value || '').trim().toLowerCase(), n = 0;
        items.forEach(function (li) {
          var ok = (cat === 'all' || li.getAttribute('data-cat') === cat) && (!q || (li.getAttribute('data-q') || '').toLowerCase().indexOf(q) > -1);
          li.hidden = !ok; if (ok) n++;
        });
        if (empty) empty.classList.toggle('is-on', n === 0);
        if (ask) ask.setAttribute('href', (ask.getAttribute('data-base') || '') + encodeURIComponent((ask.getAttribute('data-msg') || '') + ' ' + (input ? input.value : '')));
      };
      if (input) on(input, 'input', apply);
      box.querySelectorAll('[data-cat-btn]').forEach(function (b) {
        on(b, 'click', function () {
          cat = b.getAttribute('data-cat-btn');
          box.querySelectorAll('[data-cat-btn]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          apply();
        });
      });
    });

    /* segmented controls + conditional fields */
    root.querySelectorAll('[data-seg]').forEach(function (seg) {
      var name = seg.getAttribute('data-seg'), form = seg.closest('form'), hidden = form && form.querySelector('input[name="' + name + '"]');
      var sync = function (val) {
        if (hidden) hidden.value = val;
        if (form) form.querySelectorAll('[data-when]').forEach(function (el) {
          var p = el.getAttribute('data-when').split('='); if (p[0] === name) el.hidden = p[1] !== val;
        });
      };
      seg.querySelectorAll('button').forEach(function (b) {
        on(b, 'click', function () {
          seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          sync(b.getAttribute('data-value'));
        });
      });
      var cur = seg.querySelector('button[aria-pressed="true"]'); if (cur) sync(cur.getAttribute('data-value'));
    });

    /* WhatsApp booking forms */
    root.querySelectorAll('form[data-book]').forEach(function (form) {
      on(form, 'submit', function (e) {
        e.preventDefault();
        if (form.reportValidity && !form.reportValidity()) return;
        var lines = [form.getAttribute('data-intro') || ''];
        form.querySelectorAll('[data-label]').forEach(function (f) {
          var wrap = f.closest('[data-when]'); if (wrap && wrap.hidden) return;
          var v = (f.value || '').trim(); if (v) lines.push(f.getAttribute('data-label') + ': ' + v);
        });
        var num = (form.getAttribute('data-wa') || '').replace(/\D/g, '');
        var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(lines.filter(Boolean).join('\n'));
        window.open(url, '_blank', 'noopener');
      });
    });

    /* open-now badges (Cairo time) */
    var tickOpen = function () {
      root.querySelectorAll('[data-hours]').forEach(function (el) {
        var p = (el.getAttribute('data-hours') || '').split('-').map(Number); if (p.length < 2 || isNaN(p[0])) return;
        var h; try { h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: el.getAttribute('data-tz') || 'Africa/Cairo' }).format(new Date())); } catch (e) { h = new Date().getHours(); }
        var open = p[0] < p[1] ? (h >= p[0] && h < p[1]) : (h >= p[0] || h < p[1]);
        el.classList.toggle('is-open', open);
        var t = el.querySelector('[data-open-label]'); if (t) t.textContent = open ? el.getAttribute('data-open') : el.getAttribute('data-closed');
      });
    };
    tickOpen(); var ot = setInterval(tickOpen, 60000); off.push(function () { clearInterval(ot); });

    /* 3D scenes */
    var mounted = [];
    var mount3d = function () {
      var T = window.__MF_THREE; if (!T) return false;
      root.querySelectorAll('[data-3d]').forEach(function (el) {
        if (el.__mf3d) return;
        try { el.__mf3d = scene3d(T, el); mounted.push(el); } catch (err) { console.warn('3D', err); }
      });
      return true;
    };
    if (root.querySelector('[data-3d]') && !mount3d()) {
      var onThree = function () { mount3d(); };
      window.addEventListener('mf-three', onThree); off.push(function () { window.removeEventListener('mf-three', onThree); });
    }
    off.push(function () { mounted.forEach(function (el) { if (el.__mf3d) { el.__mf3d(); el.__mf3d = null; } }); });

    return function () { off.forEach(function (f) { try { f(); } catch (e) { } }); };
  }

  /* ---------------- three.js scenes ---------------- */
  function scene3d(T, el) {
    var kind = el.getAttribute('data-3d'), c1 = new T.Color(el.getAttribute('data-c1') || '#0F7B6C'), c2 = new T.Color(el.getAttribute('data-c2') || '#E8A33D');
    var still = reduce() || el.getAttribute('data-still') === '1';
    var small = el.clientWidth < 520;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.appendChild(renderer.domElement);
    var scene = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    // soft studio environment for glossy materials
    var pmrem = new T.PMREMGenerator(renderer), env = new T.Scene();
    var roomMat = new T.MeshBasicMaterial({ color: 0x9aa0a8, side: T.BackSide });
    env.add(new T.Mesh(new T.BoxGeometry(20, 14, 20), roomMat));
    // light panels: [x, y, z, width, height, depth, intensity]
    [[0, 6.8, 0, 12, 0.2, 8, 2.2], [-9.5, 2, 2, 0.2, 5, 4, 1.6], [9.5, 1, -3, 0.2, 4, 4, 1.2]].forEach(function (p) {
      var m = new T.Mesh(new T.BoxGeometry(p[3], p[4], p[5]), new T.MeshBasicMaterial({ color: new T.Color(p[6], p[6], p[6]) }));
      m.position.set(p[0], p[1], p[2]); env.add(m);
    });
    var envTex = pmrem.fromScene(env, 0.04).texture; scene.environment = envTex;
    var key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(3, 5, 6); scene.add(key);
    var rim = new T.PointLight(c2.getHex(), 16, 22); rim.position.set(-4, -2, 3); scene.add(rim);
    scene.add(new T.HemisphereLight(0xffffff, 0xdde3ff, 0.55));
    var world = new T.Group(); scene.add(world);
    var update = function () { }, disposables = [];
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var keep = function (x) { disposables.push(x); return x; };
    env.traverse(function (o) { if (o.geometry) keep(o.geometry); if (o.material) keep(o.material); });

    if (kind === 'cells') {
      var dropPts = [];
      for (var i = 80; i >= 0; i--) { var t = (i / 80) * Math.PI; dropPts.push(new T.Vector2(Math.sin(t) * (1 - Math.cos(t)) * 0.5, Math.cos(t) * 1.05)); }
      var dropGeo = keep(new T.LatheGeometry(dropPts, 96));
      var dropMat = keep(new T.MeshPhysicalMaterial({ color: c1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 0.4, sheenColor: new T.Color(0xffffff) }));
      var drop = new T.Mesh(dropGeo, dropMat); drop.scale.setScalar(small ? 1.25 : 1.45); world.add(drop);
      var pts = [], half = function (x) { return 0.5 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.207 + 2 * x * x - 1.12 * Math.pow(x, 4)); };
      for (var a = 0; a <= 48; a++) { var q = (a / 48) * Math.PI / 2, x = Math.sin(q); pts.push(new T.Vector2(x, -half(x) - 0.001 * Math.cos(q))); }
      for (var b = 47; b >= 0; b--) { var q2 = (b / 48) * Math.PI / 2, x2 = Math.sin(q2); pts.push(new T.Vector2(x2, half(x2) + 0.001 * Math.cos(q2))); }
      var rbcGeo = keep(new T.LatheGeometry(pts, 64));
      var rbcMat = keep(new T.MeshPhysicalMaterial({ color: c1.clone().multiplyScalar(0.85), roughness: 0.38, clearcoat: 0.5, sheen: 0.6, sheenColor: c1.clone().lerp(new T.Color(1, 1, 1), 0.4) }));
      var cells = [], n = small ? 9 : 14;
      for (var k = 0; k < n; k++) {
        var m = new T.Mesh(rbcGeo, rbcMat); m.scale.setScalar(rand(0.42, 0.7)); m.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
        cells.push({ m: m, r: rand(2.1, small ? 3 : 3.6), a: (k / n) * Math.PI * 2, s: rand(0.08, 0.18) * (Math.random() < 0.5 ? 1 : -1), y: rand(-1.6, 1.6), z: rand(-1.5, 1.2), sp: [rand(-.5, .5), rand(-.6, .6)], ph: rand(0, 6) });
        world.add(m);
      }
      var wMat = keep(new T.MeshPhysicalMaterial({ color: c2, roughness: 0.25, clearcoat: 1 })), wGeo = keep(new T.IcosahedronGeometry(1, 4)), wbcs = [];
      [[-2.6, 1.7, -1], [2.7, -1.6, -0.6], [1.9, 2, -2], [-2.2, -2, 0.4]].slice(0, small ? 2 : 4).forEach(function (p, i) {
        var w = new T.Mesh(wGeo, wMat); w.scale.setScalar(0.28 + i * 0.05); w.position.set(p[0], p[1], p[2]); world.add(w); wbcs.push({ m: w, y: p[1], ph: i * 1.7 });
      });
      update = function (dt, t) {
        drop.rotation.y += dt * 0.35; drop.position.y = Math.sin(t * 1.1) * 0.12;
        cells.forEach(function (c) { c.a += c.s * dt; c.m.position.set(Math.cos(c.a) * c.r, c.y + Math.sin(t * 0.8 + c.ph) * 0.25, c.z + Math.sin(c.a) * 0.9); c.m.rotation.x += c.sp[0] * dt; c.m.rotation.y += c.sp[1] * dt; });
        wbcs.forEach(function (w) { w.m.position.y = w.y + Math.sin(t * 0.9 + w.ph) * 0.2; w.m.rotation.y += dt * 0.3; });
      };
    } else if (kind === 'dna') {
      var sGeo = keep(new T.SphereGeometry(0.2, 24, 24)), rGeo = keep(new T.CylinderGeometry(0.045, 0.045, 1, 10));
      var m1 = keep(new T.MeshPhysicalMaterial({ color: c1, roughness: 0.15, clearcoat: 1 })), m2 = keep(new T.MeshPhysicalMaterial({ color: c2, roughness: 0.15, clearcoat: 1 }));
      var rm = keep(new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, transparent: true, opacity: 0.55 }));
      var helix = new T.Group(), steps = small ? 22 : 30, R = 1.2;
      for (var s = 0; s < steps; s++) {
        var y = (s - steps / 2) * 0.32, ang = s * 0.42;
        var p1 = new T.Vector3(Math.cos(ang) * R, y, Math.sin(ang) * R), p2 = new T.Vector3(Math.cos(ang + Math.PI) * R, y, Math.sin(ang + Math.PI) * R);
        var a1 = new T.Mesh(sGeo, m1); a1.position.copy(p1); helix.add(a1);
        var a2 = new T.Mesh(sGeo, m2); a2.position.copy(p2); helix.add(a2);
        var rung = new T.Mesh(rGeo, rm); rung.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); rung.scale.y = R * 2;
        rung.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), p2.clone().sub(p1).normalize()); helix.add(rung);
      }
      helix.rotation.z = 0.5; world.add(helix);
      update = function (dt, t) { helix.rotation.y += dt * 0.45; helix.position.y = Math.sin(t * 0.8) * 0.15; };
    } else if (kind === 'orbs') {
      var orbs = [], g = keep(new T.SphereGeometry(1, 48, 48)), tg = keep(new T.TorusGeometry(1.9, 0.035, 16, 120));
      var mats = [c1, c2, c1.clone().lerp(new T.Color(1, 1, 1), 0.5)].map(function (c) { return keep(new T.MeshPhysicalMaterial({ color: c, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0.05 })); });
      var cnt = small ? 6 : 9;
      for (var o = 0; o < cnt; o++) {
        var me = new T.Mesh(g, mats[o % 3]); var sc = o === 0 ? 1.15 : rand(0.25, 0.6); me.scale.setScalar(sc);
        var base = o === 0 ? new T.Vector3(0, 0, 0) : new T.Vector3(rand(-3.2, 3.2), rand(-2.2, 2.2), rand(-2, 1));
        me.position.copy(base); world.add(me); orbs.push({ m: me, b: base, ph: rand(0, 6), sp: rand(0.5, 1.1) });
      }
      var ringMat = keep(new T.MeshStandardMaterial({ color: c2, roughness: 0.3, metalness: 0.4 }));
      var ring1 = new T.Mesh(tg, ringMat); ring1.rotation.x = 1.2; world.add(ring1);
      var ring2 = new T.Mesh(tg, ringMat); ring2.scale.setScalar(1.25); ring2.rotation.set(0.4, 0.9, 0); world.add(ring2);
      update = function (dt, t) {
        orbs.forEach(function (o, i) { if (i) { o.m.position.y = o.b.y + Math.sin(t * o.sp + o.ph) * 0.3; o.m.position.x = o.b.x + Math.cos(t * o.sp * 0.7 + o.ph) * 0.15; } });
        ring1.rotation.z += dt * 0.25; ring2.rotation.z -= dt * 0.18;
      };
    } else {
      var N = small ? 700 : 1400, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      for (var pI = 0; pI < N; pI++) {
        var rr = rand(1.5, 5.5), th = rand(0, Math.PI * 2), ph2 = Math.acos(rand(-1, 1));
        pos[pI * 3] = rr * Math.sin(ph2) * Math.cos(th); pos[pI * 3 + 1] = rr * Math.cos(ph2) * 0.7; pos[pI * 3 + 2] = rr * Math.sin(ph2) * Math.sin(th);
        var cc = Math.random() < 0.7 ? c1 : c2; col[pI * 3] = cc.r; col[pI * 3 + 1] = cc.g; col[pI * 3 + 2] = cc.b;
      }
      var pg = keep(new T.BufferGeometry()); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); pg.setAttribute('color', new T.BufferAttribute(col, 3));
      var pm = keep(new T.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
      var cloud = new T.Points(pg, pm); world.add(cloud);
      update = function (dt) { cloud.rotation.y += dt * 0.06; cloud.rotation.x += dt * 0.015; };
    }

    var resize = function () {
      var w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = w / h < 0.9 ? 12.5 : 10.8; camera.updateProjectionMatrix();
    };
    var ro = new ResizeObserver(function () { resize(); if (still) renderer.render(scene, camera); }); ro.observe(el); resize();
    var target = { x: 0, y: 0 };
    var onPointer = function (e) { target.x = (e.clientX / window.innerWidth - 0.5) * 0.6; target.y = (e.clientY / window.innerHeight - 0.5) * 0.4; };
    window.addEventListener('pointermove', onPointer, { passive: true });
    var visible = true, vio = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }); vio.observe(el);
    var clock = new T.Clock(), raf = 0;
    var tick = function () {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) { clock.getDelta(); return; }
      var dt = Math.min(clock.getDelta(), 0.05);
      update(dt, clock.elapsedTime);
      world.rotation.y += (target.x - world.rotation.y) * 0.05; world.rotation.x += (target.y - world.rotation.x) * 0.05;
      renderer.render(scene, camera);
    };
    if (still) { update(0, 0); renderer.render(scene, camera); } else tick();
    return function () {
      cancelAnimationFrame(raf); ro.disconnect(); vio.disconnect(); window.removeEventListener('pointermove', onPointer);
      disposables.forEach(function (d) { d.dispose && d.dispose(); }); envTex.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }

  window.MFStudio = { init: init };
})();
