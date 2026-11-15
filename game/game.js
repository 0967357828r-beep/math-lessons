/* Спільна логіка гри «Задачі-мультфільми»: профіль, розділи, квести, ліги, досягнення. */
(function () {
  "use strict";

  var KEY = "mathgame_v1";
  var MAX_LIVES = 10;

  function todayStr(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function mondayStr() {
    var d = new Date();
    var wd = (d.getDay() + 6) % 7; // 0 = понеділок
    d.setDate(d.getDate() - wd);
    return todayStr(d);
  }
  function addDays(iso, n) {
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + n);
    return todayStr(d);
  }

  /* ---------- розділи: задачі, схожі за типом ---------- */
  var SECTIONS = [
    { id: "add", emoji: "🍎", title: "Додавання й віднімання", color: "#58cc02",
      sub: "Прості дії: скільки всього, на скільки більше",
      ids: ["am8_pinecones_pc", "am11_pebbles_pb", "am10_wool_wl", "am10_buses_bs2",
            "am10_school_party_sv", "am7_checkers_ck", "am7_tickets_tk", "pies_amphibia_video",
            "am8_cats_kt", "am9_baskets_bk", "am12_classes_cl2", "am12_beach_pb2", "am13_medals_md"] },
    { id: "mul", emoji: "✖️", title: "Множення й ділення", color: "#1cb0f6",
      sub: "У скільки разів більше, порівну на всіх",
      ids: ["am11_potatoes_pt", "am6_turkey_tg", "am2_birds_b2", "am9_starch_st",
            "am8_aquarium_aq", "am8_paper_pp", "am9_notebooks_nb", "am9_polygons_pg",
            "am3_beads_bd", "am3_circus_cc", "am3_juggling_jg", "am9_squirrel_sq", "am12_toys_ty2", "am12_nuts_nt", "am12_bottles_bt", "am13_sweaters_sw2", "am13_trees_tr2", "am13_boats_bn", "am13_buttons_kn"] },
    { id: "money", emoji: "🪙", title: "Гроші та покупки", color: "#ffc800",
      sub: "Ціна, кількість, решта",
      ids: ["am8_candy_cn", "am8_marker_mk", "am8_balloons_bl", "am9_balls_bs",
            "am4_croissants_cr", "am5_sofia_sf", "am10_money_ol", "am2_bun_u2", "am13_sweets_cn2", "am13_stickers_st2", "am13_groceries_mm"] },
    { id: "units", emoji: "⏰", title: "Маса, час, довжина", color: "#ce82ff",
      sub: "Кілограми, години, метри, літри",
      ids: ["am8_heron_hr", "am4_wolf_wf", "am3_kitten_kt", "am10_cat_sleep_cat2",
            "am10_vacation_kh", "am6_cistern_ct", "am6_scooter_sc", "am6_engine_en",
            "am8_polyline_pl", "am6_school_walk_sw", "am12_lviv_lv", "am12_engine_en2", "am13_lesson_ls", "am13_sandwiches_sd"] },
    { id: "compound", emoji: "🧩", title: "Складені задачі", color: "#ff9600",
      sub: "Кілька дій поспіль — як у підручнику",
      ids: ["am11_weavers_wv", "am11_houses_hs", "am11_basket_bk2", "am11_sugar_sg",
            "am11_trains_tr", "am11_pears_pr", "am11_flamingo_fl2", "am11_nails_nl",
            "am8_cakes_ck2", "am10_herbarium_hb", "am10_flowerbed_fl", "am4_sewing_sw",
            "am2_parts_w2", "am6_dumplings_dm", "am12_garden_gr", "am12_concert_cc2", "am12_chestnuts_ch"] },
    { id: "logic", emoji: "💡", title: "Кмітливість і логіка", color: "#ff4b4b",
      sub: "Задачі-жарти й ті, де треба подумати",
      ids: ["am9_hedgehog_hg", "am9_shirts_dr", "am9_haystacks_br", "am9_fruits_fr",
            "am9_numbers_nm", "am3_cheese_ch", "am_school_as", "am_school_as_b",
            "flowers_am_video", "am2_dress_d2", "am2_pencils_p2", "am6_recycle_rc",
            "am10_dogs_dog", "am10_kittens_kt2"] }
  ];

  var SEQ = [];
  SECTIONS.forEach(function (s, si) {
    s.index = si;
    s.ids.forEach(function (id, li) {
      SEQ.push({ id: id, section: si, lesson: li });
    });
  });

  function positionOf(id) {
    for (var i = 0; i < SEQ.length; i++) { if (SEQ[i].id === id) { return SEQ[i]; } }
    return null;
  }
  function taskById(id) {
    var list = window.TASKS || [];
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    return null;
  }
  function nextLessonId(id) {
    var pos = positionOf(id);
    if (!pos) { return null; }
    var idx = SEQ.indexOf(pos);
    return idx + 1 < SEQ.length ? SEQ[idx + 1].id : null;
  }

  /* ---------- прогрес ---------- */
  function load() {
    var p;
    try { p = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { p = {}; }
    p.levels = p.levels || {};
    p.xp = p.xp || 0;
    p.streak = p.streak || 0;
    p.last = p.last || null;
    p.gems = p.gems || 0;
    p.lives = typeof p.lives === "number" ? p.lives : MAX_LIVES;
    p.livesDate = p.livesDate || todayStr();
    p.weekXp = p.weekXp || 0;
    p.weekStart = p.weekStart || mondayStr();
    p.profile = p.profile || {};
    p.profile.name = p.profile.name || "Тімчик";
    p.profile.avatar = p.profile.avatar || "🐸";
    p.profile.joined = p.profile.joined || todayStr();
    p.stats = p.stats || {};
    p.stats.lessons = p.stats.lessons || 0;
    p.stats.perfect = p.stats.perfect || 0;
    p.stats.sec = p.stats.sec || 0;
    p.stats.days = p.stats.days || {};
    p.stats.sectionsDone = p.stats.sectionsDone || {};
    p.quests = p.quests || {};
    p.quests.done = p.quests.done || 0;
    Object.keys(p.levels).forEach(function (k) {
      var l = p.levels[k];
      if (typeof l.gems !== "number") { l.gems = l.stars || 0; }
      delete l.stars;
    });
    if (p.livesDate !== todayStr()) { p.lives = MAX_LIVES; p.livesDate = todayStr(); }
    if (p.weekStart !== mondayStr()) { p.weekXp = 0; p.weekStart = mondayStr(); }
    var t = todayStr();
    if (!p.stats.days[t]) { p.stats.days[t] = { lessons: 0, perfect: 0, sec: 0, xp: 0 }; }
    if (p.quests.date !== t) {
      p.quests.date = t;
      p.quests.points = 0;
      p.quests.lessons = 0;
      p.quests.perfect = 0;
      p.quests.sec = 0;
      p.quests.claimed = {};
    }
    p.quests.points = p.quests.points || 0;
    p.quests.lessons = p.quests.lessons || 0;
    p.quests.perfect = p.quests.perfect || 0;
    p.quests.sec = p.quests.sec || 0;
    p.quests.claimed = p.quests.claimed || {};
    return p;
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  function isDone(p, id) { return !!(p.levels[id] && p.levels[id].done); }
  function isPerfect(p, id) { return (p.levels[id] && p.levels[id].gems) > 0; }
  function gemsOf(p, id) { return (p.levels[id] && p.levels[id].gems) || 0; }

  function sectionProgress(p, s) {
    var done = 0;
    s.ids.forEach(function (id) { if (isDone(p, id)) { done++; } });
    return { done: done, total: s.ids.length, pct: s.ids.length ? done / s.ids.length : 0 };
  }

  /* ---------- нагорода за урок (кристалів мало!) ---------- */
  function awardLesson(id, perfect, seconds) {
    var p = load();
    var prev = p.levels[id] || { done: false, gems: 0 };
    var first = !prev.done;
    var gems = 0;
    if (perfect && !prev.gems) { gems = 1; }          // 1 кристал лише за урок без помилок
    p.levels[id] = { done: true, gems: Math.max(prev.gems || 0, perfect ? 1 : 0) };
    var xp = first ? 10 : 4;                           // повторення дає мало
    p.xp += xp;
    p.weekXp += xp;
    var t = todayStr();
    var d = p.stats.days[t] || { lessons: 0, perfect: 0, sec: 0, xp: 0 };
    d.lessons += 1;
    d.xp += xp;
    d.sec += Math.max(0, Math.min(seconds || 0, 600));
    if (perfect) { d.perfect += 1; }
    p.stats.days[t] = d;
    p.stats.lessons += 1;
    p.stats.sec += Math.max(0, Math.min(seconds || 0, 600));
    if (perfect) { p.stats.perfect += 1; }
    p.quests.lessons += 1;
    p.quests.points += xp;
    p.quests.sec += Math.min(seconds || 0, 600);
    if (perfect) { p.quests.perfect += 1; }
    var pos = positionOf(id);
    if (pos) {
      var s = SECTIONS[pos.section];
      var prog = sectionProgress(p, s);
      if (prog.done === prog.total && !p.stats.sectionsDone[s.id]) {
        p.stats.sectionsDone[s.id] = true;
        p.gems += 3;
        gems += 3;
      }
    }
    p.gems += gems;
    if (p.last !== t) {
      p.streak = p.last === addDays(t, -1) ? p.streak + 1 : 1;
      p.last = t;
    }
    save(p);
    return { gems: gems, xp: xp, first: first };
  }

  function loseLife() {
    var p = load();
    p.lives = Math.max(0, p.lives - 1);
    save(p);
    return p.lives;
  }

  /* ---------- квести дня ---------- */
  function quests(p) {
    var q = p.quests;
    return [
      { id: "points", icon: "⚡", title: "Отримайте 10 балів", now: q.points, goal: 10,
        reward: "💎 +2", gem: 2, life: 0 },
      { id: "time", icon: "⏱️", title: "Позаймайтеся 5 хвилин", now: Math.floor(q.sec / 60), goal: 5,
        reward: "❤️ +2", gem: 0, life: 2 },
      { id: "perfect", icon: "🎯", title: "Пройдіть 2 уроки без помилок", now: q.perfect, goal: 2,
        reward: "💎 +3", gem: 3, life: 0 }
    ];
  }
  function claimQuest(id) {
    var p = load();
    var q = quests(p).filter(function (x) { return x.id === id; })[0];
    if (!q || q.now < q.goal || p.quests.claimed[id]) { return null; }
    p.quests.claimed[id] = true;
    p.quests.done += 1;
    if (q.gem) { p.gems += q.gem; }
    if (q.life) { p.lives = Math.min(MAX_LIVES, p.lives + q.life); }
    save(p);
    return q;
  }

  /* ---------- ліги ---------- */
  var LEAGUES = [
    { name: "Бронзова", emoji: "🥉", color: "#cd7f32", need: 0 },
    { name: "Срібна", emoji: "🥈", color: "#9aa7b8", need: 60 },
    { name: "Золота", emoji: "🥇", color: "#ffc800", need: 140 },
    { name: "Перлинна", emoji: "🦪", color: "#ff86c8", need: 240 },
    { name: "Діамантова", emoji: "💎", color: "#1cb0f6", need: 360 },
    { name: "Рубінова", emoji: "🔴", color: "#ff4b4b", need: 520 }
  ];
  function leagueOf(p) {
    var li = 0;
    for (var i = 0; i < LEAGUES.length; i++) { if (p.weekXp >= LEAGUES[i].need) { li = i; } }
    var cur = LEAGUES[li];
    var next = LEAGUES[li + 1] || null;
    var pct = next ? Math.min(1, (p.weekXp - cur.need) / (next.need - cur.need)) : 1;
    return { index: li, cur: cur, next: next, pct: pct };
  }
  function weekLeaderboard(p) {
    /* суперники стабільні в межах тижня: сіяні від дати понеділка */
    var seed = 0;
    var ws = p.weekStart || mondayStr();
    for (var i = 0; i < ws.length; i++) { seed = (seed * 31 + ws.charCodeAt(i)) % 100000; }
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var names = ["Мурчик", "Жабка Оля", "Персик", "Сонечко", "Квак", "Лапка", "Бурулька",
                 "Ропуха", "Грибчик", "Світлячок", "Комарик", "Тоня", "Бобер", "Черепашка",
                 "Павучок", "Мишка", "Жабеня Тім", "Дощик", "Каченя", "Лисичка",
                 "Їжачок", "Слимак", "Пташка", "Короп", "Кіт Барсик", "Уля", "Джміль", "Равлик", "Пінгвін"];
    /* суперники зіставні з гравцем: трохи слабші й сильніші */
    var base = Math.max(12, p.weekXp || 0);
    var arr = names.map(function (n, i) {
      return { name: n, xp: Math.round(base * (0.15 + rnd() * 1.1)), me: false };
    });
    arr.push({ name: p.profile.name + " (ви)", xp: p.weekXp, me: true });
    arr.sort(function (a, b) { return b.xp - a.xp || (a.me ? -1 : 1); });
    var rank = 1;
    arr.forEach(function (x, i) { if (x.me) { rank = i + 1; } });
    return { list: arr.slice(0, 30), rank: rank, promote: rank <= 10, demote: rank >= 26 };
  }

  /* ---------- досягнення ---------- */
  function achievements(p) {
    var a = [];
    function add(o) { a.push(o); }
    add({ id: "first", icon: "🌟", title: "Перший крок", now: Math.min(p.stats.lessons, 1), goal: 1,
          level: p.stats.lessons >= 1 ? 1 : 0, max: 1, desc: "Пройди перший урок" });
    add({ id: "ten", icon: "📚", title: "Старанний", now: Math.min(p.stats.lessons, 10), goal: 10,
          level: p.stats.lessons >= 10 ? 1 : 0, max: 1, desc: "Пройди 10 уроків" });
    add({ id: "twentyfive", icon: "🏃", title: "Марафонець", now: Math.min(p.stats.lessons, 25), goal: 25,
          level: p.stats.lessons >= 25 ? 1 : 0, max: 1, desc: "Пройди 25 уроків" });
    add({ id: "perfect5", icon: "🎯", title: "Без помилок", now: Math.min(p.stats.perfect, 5), goal: 5,
          level: p.stats.perfect >= 5 ? 1 : 0, max: 1, desc: "5 ідеальних уроків" });
    add({ id: "streak3", icon: "🔥", title: "Серія", now: Math.min(p.streak, 3), goal: 3,
          level: p.streak >= 7 ? 3 : p.streak >= 3 ? 1 : 0, max: 3, desc: "Займайся кілька днів підряд" });
    add({ id: "xp500", icon: "⚡", title: "Мудрий", now: Math.min(p.xp, 500), goal: 500,
          level: p.xp >= 1000 ? 2 : p.xp >= 500 ? 1 : 0, max: 2, desc: "Зароби 500 балів" });
    add({ id: "gems25", icon: "💎", title: "Кристальний", now: Math.min(p.gems, 25), goal: 25,
          level: p.gems >= 50 ? 2 : p.gems >= 25 ? 1 : 0, max: 2, desc: "Збери 25 кристалів" });
    add({ id: "league", icon: "🏆", title: "Чемпіон", now: leagueOf(p).index, goal: 3,
          level: leagueOf(p).index >= 4 ? 2 : leagueOf(p).index >= 3 ? 1 : 0, max: 2,
          desc: "Дійди до Золотої ліги" });
    return a;
  }

  /* ---------- сайдбар ---------- */
  var NAV = [
    { key: "learn", href: "index.html", icon: "🏠", label: "Навчання" },
    { key: "quests", href: "quests.html", icon: "🧰", label: "Квести" },
    { key: "board", href: "leaderboard.html", icon: "🛡️", label: "Дошки пошани" },
    { key: "profile", href: "profile.html", icon: "🐸", label: "Профіль" }
  ];
  function renderSidebar(active) {
    var host = document.getElementById("side");
    if (!host) { return; }
    var p = load();
    var lg = leagueOf(p);
    var html = '<a class="logo" href="index.html">Тімолінго</a>';
    html += '<nav class="nav">';
    NAV.forEach(function (n) {
      var ic = n.key === "profile" ? p.profile.avatar : n.icon;
      html += '<a class="nav-item' + (n.key === active ? " on" : "") + '" href="' + n.href + '">' +
              '<span class="ni">' + ic + '</span>' + n.label + "</a>";
    });
    html += "</nav>";
    html += '<div class="side-foot">' +
            '<a class="nav-item" href="../index.html"><span class="ni">📚</span>Бібліотека</a>' +
            '<div class="mini-league" style="--lc:' + lg.cur.color + '">' +
            '<div class="ml-emoji">' + lg.cur.emoji + '</div><div><b>' + lg.cur.name + ' ліга</b>' +
            '<div class="ml-xp">' + p.weekXp + ' XP за тиждень</div></div></div>' +
            "</div>";
    host.innerHTML = html;
  }

  function hudHTML() {
    var p = load();
    return '<span class="chip lives">❤️ <b id="hud-lives">' + p.lives + '</b></span>' +
           '<span class="chip gems">💎 <b id="hud-gems">' + p.gems + '</b></span>' +
           '<span class="chip xp">⚡ <b id="hud-xp">' + p.xp + '</b></span>' +
           '<span class="chip streak">🔥 <b id="hud-streak">' + p.streak + '</b></span>';
  }
  function syncHud() {
    var p = load();
    var m = { "hud-lives": p.lives, "hud-gems": p.gems, "hud-xp": p.xp, "hud-streak": p.streak };
    Object.keys(m).forEach(function (id) {
      var el = document.getElementById(id); if (el) { el.textContent = m[id]; }
    });
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2300);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
  }

  window.Game = {
    KEY: KEY, MAX_LIVES: MAX_LIVES, SECTIONS: SECTIONS, SEQ: SEQ, LEAGUES: LEAGUES,
    todayStr: todayStr, mondayStr: mondayStr, load: load, save: save,
    isDone: isDone, isPerfect: isPerfect, gemsOf: gemsOf, sectionProgress: sectionProgress,
    awardLesson: awardLesson, loseLife: loseLife,
    quests: quests, claimQuest: claimQuest, leagueOf: leagueOf, weekLeaderboard: weekLeaderboard,
    achievements: achievements, renderSidebar: renderSidebar, hudHTML: hudHTML, syncHud: syncHud,
    toast: toast, esc: esc, positionOf: positionOf, taskById: taskById, nextLessonId: nextLessonId
  };
})();
