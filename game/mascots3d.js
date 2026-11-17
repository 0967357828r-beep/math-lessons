/* Тімолінго — низькополігональні 3D-маскоти на стежці (Three.js r149). */
(function () {
  "use strict";
  var T = window.THREE;
  var path = document.getElementById("path");
  if (!T || !path) { return; }

  var canvas = document.createElement("canvas");
  canvas.id = "mascots3d";
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:5";
  document.body.appendChild(canvas);

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  var scene = new T.Scene();
  var camera = new T.OrthographicCamera(-innerWidth / 2, innerWidth / 2, innerHeight / 2, -innerHeight / 2, 0.1, 1000);
  camera.position.z = 500;
  scene.add(new T.HemisphereLight(0xffffff, 0x2b3f66, 1.25));
  var sun = new T.DirectionalLight(0xffffff, 1.0);
  sun.position.set(-220, 320, 420);
  scene.add(sun);
  var rim = new T.DirectionalLight(0xffc98a, 0.55);
  rim.position.set(260, -120, -300);
  scene.add(rim);

  var ramp = new Uint8Array([90, 150, 205, 255]);
  var grad = new T.DataTexture(ramp, ramp.length, 1, T.RedFormat);
  grad.minFilter = T.NearestFilter;
  grad.magFilter = T.NearestFilter;
  grad.needsUpdate = true;
  function toon(c) { return new T.MeshToonMaterial({ color: c, gradientMap: grad }); }
  function outline(mesh, k) {
    var o = new T.Mesh(mesh.geometry, new T.MeshBasicMaterial({ color: 0x1b120d, side: T.BackSide }));
    o.scale.setScalar(k || 1.07);
    mesh.add(o);
    return o;
  }
  function ball(parent, r, color, pos, detail) {
    var m = new T.Mesh(new T.IcosahedronGeometry(r, detail || 1), toon(color));
    m.position.set(pos[0], pos[1], pos[2]);
    parent.add(m);
    outline(m);
    return m;
  }

  function makeFrog() {
    var g = new T.Group();
    var body = ball(g, 26, 0x54d46c, [0, -2, 0], 2);
    body.scale.set(1, 0.95, 0.92);
    ball(g, 18, 0x9af0a8, [0, -6, 20], 1).scale.set(1, 0.7, 0.35);
    var head = ball(g, 21, 0x6ee08a, [0, 20, 5], 2);
    var eyes = [];
    [-1, 1].forEach(function (s) {
      var w = ball(g, 8, 0xffffff, [s * 10, 31, 19], 2);
      w.scale.z = 0.65;
      var pupil = ball(w, 4.2, 0x12213d, [0, 0, 6], 1);
      pupil.scale.z = 0.55;
      eyes.push(pupil);
      ball(g, 7, 0x46b862, [s * 10, 38, 12], 1).scale.set(1, 0.45, 0.5);
    });
    var smile = new T.Mesh(new T.TorusGeometry(7.5, 1.5, 5, 14, Math.PI), new T.MeshBasicMaterial({ color: 0x245b33 }));
    smile.position.set(0, 13, 24);
    smile.rotation.z = Math.PI;
    g.add(smile);
    [-1, 1].forEach(function (s) {
      var arm = ball(g, 7, 0x6ee08a, [s * 25, 3, 8], 1);
      arm.scale.set(0.7, 1.5, 0.7);
      arm.rotation.z = s * 0.55;
      ball(g, 6, 0x9af0a8, [s * 31, 13, 11], 1);
      var leg = ball(g, 9, 0x49c760, [s * 15, -25, 5], 1);
      leg.scale.set(1, 0.7, 1.35);
    });
    g.userData = { kind: "frog", eyes: eyes, head: head, phase: 0 };
    return g;
  }

  function makeBird() {
    var g = new T.Group();
    var body = ball(g, 24, 0xffc95c, [0, 0, 0], 2);
    body.scale.set(1, 1.12, 0.9);
    var head = ball(g, 16, 0xffdc82, [0, 25, 5], 2);
    var beak = new T.Mesh(new T.ConeGeometry(6, 14, 4), toon(0xff8f45));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 22, 23);
    g.add(beak); outline(beak, 1.1);
    var eyes = [];
    [-1, 1].forEach(function (s) {
      var w = ball(g, 6, 0xffffff, [s * 8, 29, 17], 2);
      var pupil = ball(w, 3, 0x12213d, [0, 0, 4], 1);
      eyes.push(pupil);
    });
    var wings = [];
    [-1, 1].forEach(function (s) {
      var w = ball(g, 12, 0xf4a945, [s * 25, 1, 0], 1);
      w.scale.set(0.45, 1.2, 0.8);
      w.rotation.z = s * 0.35;
      wings.push(w);
    });
    var tail = new T.Mesh(new T.ConeGeometry(11, 26, 4), toon(0xffa04b));
    tail.rotation.x = -Math.PI / 2.3;
    tail.position.set(0, 3, -25);
    g.add(tail); outline(tail, 1.08);
    ball(g, 6, 0xff5f62, [0, 41, 3], 1).scale.set(1, 0.7, 0.5);
    g.userData = { kind: "bird", eyes: eyes, head: head, wings: wings, phase: 1.9 };
    return g;
  }

  var frog = makeFrog(), bird = makeBird();
  frog.scale.setScalar(1.0);
  bird.scale.setScalar(0.95);
  scene.add(frog); scene.add(bird);

  var actors = [frog, bird];
  var targets = { frog: null, bird: null };
  var current = { frog: { init: false, x: 0, y: 0 }, bird: { init: false, x: 0, y: 0 } };

  function activeIndex(list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].classList.contains("open")) { return i; }
    }
    for (var j = 0; j < list.length; j++) {
      if (!list[j].classList.contains("done")) { return j; }
    }
    return 0;
  }
  function refresh() {
    var list = [].slice.call(path.querySelectorAll(".lvl"));
    if (!list.length) { return; }
    var at = activeIndex(list);
    [["frog", Math.max(0, at - 1), -66], ["bird", Math.min(list.length - 1, at + 3), 66]].forEach(function (cfg) {
      var r = list[cfg[1]].getBoundingClientRect();
      if (!r.width) { return; }
      targets[cfg[0]] = {
        x: r.left + r.width / 2 - window.innerWidth / 2 + cfg[2],
        y: window.innerHeight / 2 - (r.top + r.height / 2) - 26
      };
    });
  }
  refresh();
  window.addEventListener("scroll", refresh, { passive: true });
  window.addEventListener("resize", function () {
    camera.left = -innerWidth / 2; camera.right = innerWidth / 2;
    camera.top = innerHeight / 2; camera.bottom = -innerHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    refresh();
  });
  if (window.MutationObserver) {
    new MutationObserver(refresh).observe(path, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = performance.now();
  function tick(now) {
    var t = reduce ? 0 : (now - t0) / 1000;
    actors.forEach(function (m) {
      var k = m.userData.kind, tgt = targets[k], c = current[k];
      if (!tgt) { return; }
      if (!c.init) { c.x = tgt.x; c.y = tgt.y; c.init = true; }
      var dx = tgt.x - c.x, dy = tgt.y - c.y;
      var walking = Math.abs(dx) + Math.abs(dy) > 2;
      c.x += dx * 0.055;
      c.y += dy * 0.055;
      var hop = walking && !reduce ? Math.abs(Math.sin(t * 9)) * 9 : 0;
      m.position.set(c.x, c.y + hop + (reduce ? 0 : Math.sin(t * 2 + m.userData.phase) * 2.5), 0);
      m.rotation.z = walking && !reduce ? Math.sin(t * 9) * 0.09 : 0;
      m.scale.y = (m.userData.kind === "frog" ? 1 : 0.95) + (reduce ? 0 : Math.sin(t * 2.4 + m.userData.phase) * 0.035);
      var blink = (!reduce && (t % 4.4) < 0.14) ? 0.12 : 1;
      m.userData.eyes.forEach(function (e) { e.scale.y = blink; });
      if (m.userData.wings && !reduce) {
        m.userData.wings.forEach(function (w, i) { w.rotation.x = Math.sin(t * 3 + i) * 0.18; });
      }
      if (m.userData.head && !reduce) { m.userData.head.rotation.y = Math.sin(t * 0.8 + m.userData.phase) * 0.22; }
    });
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
