/* Спільна логіка гри «Задачі-мультфільми»: профіль, розділи, квести, ліги, досягнення. */
(function () {
  "use strict";

  var KEY = "mathgame_v1";
  var MAX_LIVES = 10;
  var SHOP = [
    { id: "leaf", icon: "art/icon_leaf.webp?v=20261120b", avatar: "art/avatar_leaf.webp?v=20261120b", name: "Листок", cost: 10 },
    { id: "mushroom", icon: "art/shop_mushroom.webp?v=20261120b", avatar: "art/avatar_mushroom.webp?v=20261120b", name: "Мухомор", cost: 15 },
    { id: "scarf", icon: "art/shop_scarf.webp?v=20261120b", avatar: "art/avatar_scarf.webp?v=20261120b", name: "Шарф", cost: 12 },
    { id: "hat", icon: "art/shop_hat.webp?v=20261120b", avatar: "art/avatar_hat.webp?v=20261120b", name: "Капелюх", cost: 18 },
    { id: "glasses", icon: "art/shop_glasses.webp?v=20261120b", avatar: "art/avatar_glasses.webp?v=20261120b", name: "Окуляри", cost: 14 },
    { id: "star", icon: "art/icon_star.webp?v=20261120b", avatar: "art/avatar_star.webp?v=20261120b", name: "Зірка", cost: 20 },
    { id: "lantern", icon: "art/shop_lantern.webp?v=20261120b", avatar: "art/avatar_lantern.webp?v=20261120b", name: "Ліхтарик", cost: 25 },
    { id: "crown", icon: "art/shop_crown.webp?v=20261120b", avatar: "art/avatar_crown.webp?v=20261120b", name: "Корона", cost: 35 }
  ];
  var SHOP_IDS = SHOP.map(function (x) { return x.id; });

  /* ---------- крамниця аватарів ---------- */
  var AVATAR_BASE = [
    "avatars/boy-tymko.webp", "avatars/boy-petryk.webp", "avatars/boy-yarema.webp", "avatars/boy-danylo.webp",
    "avatars/anne-boonchuy.webp", "avatars/sasha-waybright.webp", "avatars/marcy-wu.webp", "avatars/polly-plantar.webp"
  ];
  var AVATAR_PRICE = {
    "avatars/boy-matviy.webp": 200, "avatars/boy-ostap.webp": 200,
    "avatars/girl-halya.webp": 200, "avatars/girl-olesya.webp": 200,
    "avatars/girl-zoryana.webp": 200, "avatars/girl-ivanka.webp": 200,
    "avatars/chuck.webp": 300, "avatars/felicia-sundew.webp": 300,
    "avatars/hop-pop-plantar.webp": 300, "avatars/ivy-sundew.webp": 300,
    "avatars/leif.webp": 300, "avatars/loggle.webp": 300,
    "avatars/maddie-flour.webp": 300, "avatars/mrs-croaker.webp": 300,
    "avatars/sprig-plantar.webp": 300, "avatars/wally-ribbiton.webp": 300,
    "avatars/braddock.webp": 400, "avatars/captain-grime.webp": 400,
    "avatars/general-yunnan.webp": 400, "avatars/king-aldrich.webp": 400,
    "avatars/king-andrias.webp": 400, "avatars/lady-olivia.webp": 400,
    "avatars/mayor-toadstool.webp": 400, "avatars/mr-boonchuy.webp": 400,
    "avatars/percy.webp": 400, "avatars/soggy-joe.webp": 400,
    "avatars/stumpy.webp": 400, "avatars/toadie.webp": 400,
    "avatars/barrel.webp": 500, "avatars/darcy.webp": 500,
    "avatars/mother-olm.webp": 500, "avatars/the-core.webp": 500
  };
  function shopIconHTML(x, size) {
    if (!x) { return ""; }
    if (x.icon && x.icon.indexOf("/") > -1) {
      return '<img src="' + esc(x.icon) + '?v=20261117u" class="shopico" style="width:' + size + 'px;height:' + size + 'px" alt="">';
    }
    return x.icon || "";
  }

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
    { id: "add", emoji: '<img src="art/sec_add.webp?v=20261120b" class="secico" alt="">', title: "Додавання й віднімання", color: "#58cc02",
      sub: "Скільки всього, на скільки більше",
      ids: ["am8_pinecones_pc", "am11_pebbles_pb", "am10_wool_wl", "am10_buses_bs2", "am10_school_party_sv", "am7_checkers_ck", "pies_amphibia_video", "am8_cats_kt", "am9_baskets_bk", "am12_classes_cl2", "am12_beach_pb2", "am14_house_hs2", "gis33_1", "ol1_p6_8"] },
    { id: "mul", emoji: '<img src="art/sec_mul.webp?v=20261120b" class="secico" alt="">', title: "Множення й ділення", color: "#ff7a6b",
      sub: "У скільки разів, по скільки в кожному",
      ids: ["am11_potatoes_pt", "am6_turkey_tg", "am2_birds_b2", "am9_starch_st", "am8_aquarium_aq", "am8_paper_pp", "am9_notebooks_nb", "am9_polygons_pg", "am3_beads_bd", "am3_circus_cc", "am3_juggling_jg", "am9_squirrel_sq", "ol1_p22_111"] },
    { id: "share", emoji: '<img src="art/sec_share.webp?v=20261120b" class="secico" alt="">', title: "Поділ порівну", color: "#ffc800",
      sub: "Розклали порівну, розділили на частини",
      ids: ["am12_toys_ty2", "am12_nuts_nt", "am12_bottles_bt", "am13_sweaters_sw2", "am13_trees_tr2", "am13_boats_bn", "am13_buttons_kn", "am14_onions_on", "am14_raspberry_rs", "am14_milk_ml", "am14_apples_ap2", "am15_currants_cr2", "gis207_1", "ol1_p32_174", "ol1_p32_175", "ol1_p32_178"] },
    { id: "money", emoji: '<img src="art/sec_money.webp?v=20261120b" class="secico" alt="">', title: "Гроші та покупки", color: "#ce82ff",
      sub: "Ціна, кількість, решта",
      ids: ["am8_candy_cn", "am8_marker_mk", "am8_balloons_bl", "am9_balls_bs", "am4_croissants_cr", "am5_sofia_sf", "am10_money_ol", "am2_bun_u2", "am13_sweets_cn2", "am13_stickers_st2", "am13_groceries_mm", "am7_tickets_tk", "gis79_5", "gis205_1", "gis213_6", "gis220_3", "ol1_p42_235", "ol1_p74_430"] },
    { id: "units", emoji: '<img src="art/sec_units.webp?v=20261120b" class="secico" alt="">', title: "Маса, об'єм, довжина", color: "#ff9600",
      sub: "Кілограми, літри, сантиметри",
      ids: ["am8_heron_hr", "am4_wolf_wf", "am3_kitten_kt", "am6_cistern_ct", "am6_engine_en", "am12_engine_en2", "am14_juice_jc", "am14_canteen_ct2", "am15_milking_mk2", "am15_jugs_jg2", "am15_potatoes_pt2", "am8_polyline_pl", "gis140_9", "ol1_p14_56", "ol1_p43_239"] },
    { id: "time", emoji: '<img src="art/sec_time.webp?v=20261120b" class="secico" alt="">', title: "Час і відстань", color: "#ff4b4b",
      sub: "Години, хвилини, доби, швидше-повільніше",
      ids: ["am10_cat_sleep_cat2", "am10_vacation_kh", "am6_school_walk_sw", "am12_lviv_lv", "am13_lesson_ls", "am13_sandwiches_sd", "am15_dolls_dl", "am6_scooter_sc", "am13_medals_md", "am14_bus_bs3", "am15_carousel_cs", "am15_bikes_bk3", "gis96_1", "gis96_2", "gt2_p94_9", "gt2_p102_6", "gt2_p103_3", "gt2_p105_8", "gt2_p99_11", "ls2_p22_201", "ol1_p102_3", "bt1_p39_5", "bt1_p64_3", "bt1_p66_1", "bt1_p66_2", "bt1_p67_5", "bt1_p67_6", "bt1_p68_7", "bt2_p144_2a", "bt2_p144_2b", "bt2_p144_3", "bt2_p145_4", "bt2_p146_a", "bt2_p146_b", "za2_p87_1", "za2_p88_2", "bt1_p53_14", "bt1_p133_10", "bt1_p136_6"] },
    { id: "compound", emoji: '<img src="art/sec_compound.webp?v=20261120b" class="secico" alt="">', title: "Складені задачі", color: "#58cc02",
      sub: "Кілька дій поспіль — як у підручнику",
      ids: ["am11_weavers_wv", "am11_houses_hs", "am11_basket_bk2", "am11_sugar_sg", "am11_trains_tr", "am11_pears_pr", "am11_flamingo_fl2", "am11_nails_nl", "am8_cakes_ck2", "am10_herbarium_hb", "am10_flowerbed_fl", "am4_sewing_sw", "gis22_2", "gis46_2", "gis63_5", "gis67_6", "gis71_6", "gis113_8", "gis166_8", "gis168_6", "gis171_7", "gis172_10", "gis210_3", "gis210_4", "gis228_14", "ol1_p10_31", "ol1_p27_151", "ol1_p34_191"] },
    { id: "multi", emoji: '<img src="art/sec_multi.webp?v=20261120b" class="secico" alt="">', title: "Задачі на кілька дій", color: "#c39cff",
      sub: "Спочатку одне, потім друге",
      ids: ["am2_parts_w2", "am6_dumplings_dm", "am12_garden_gr", "am12_concert_cc2", "am12_chestnuts_ch", "am14_rabbits_rb", "am15_fishermen_fs", "am15_newspapers_np", "am15_garages_gr2", "am9_hedgehog_hg", "am9_shirts_dr", "am9_haystacks_br", "gis61_9", "gis215_4", "ol1_p36_202", "ol1_p46_256", "ol1_p63_364"] },
    { id: "logic", emoji: '<img src="art/sec_logic.webp?v=20261120b" class="secico" alt="">', title: "Логіка й кмітливість", color: "#ffc800",
      sub: "Задачі-жарти й ті, де треба подумати",
      ids: ["am9_fruits_fr", "am9_numbers_nm", "am3_cheese_ch", "am_school_as", "am_school_as_b", "flowers_am_video", "am2_dress_d2", "am2_pencils_p2", "am6_recycle_rc", "am10_dogs_dog", "am10_kittens_kt2", "am14_classes2_cls", "gis215_5", "gis215_6", "gis215_8", "ol1_p67_389"] }

    ,
    { id: "mul2", emoji: '<img src="art/sec_mul2.webp?v=20261120b" class="secico" alt="">', title: "Множення й ділення · 2", color: "#ff9f68",
      sub: "Ділення на частини, кратне порівняння, кілька дій",
      ids: ["am16_garlands_gl", "am16_dresses_dr2", "am16_peas_ps", "am16_stools_st3", "am16_panda_pd",
            "am16_reserve_rv", "am16_entrances_en3", "am16_age_ag", "am16_money2_tm", "am16_sugar2_sg2", "gis226_1", "ol1_p65_1"] }

    ,
    { id: "add2", emoji: '<img src="art/sec_add.webp?v=20261120b" class="secico" alt="">', title: "Додавання й віднімання · 2", color: "#58cc02",
      sub: "Великі числа й кілька дій",
      ids: ["am17_pencils_pn", "am17_asters_as2", "am17_vegetables_vg", "am17_theatre_th", "am17_pumpkins_pk",
            "am17_pastries_pt3", "am17_lindens_ld", "am17_school_sc", "am17_bricks_br", "am17_village_vl", "ol1_p78_457"] }

    ,
    { id: "big3", emoji: '<img src="art/sec_add.webp?v=20261120b" class="secico" alt="">', title: "Великі числа й кілька дій", color: "#ff9f68",
      sub: "Сотні, кілька дій поспіль, непряма форма",
      ids: ["am18_juice2_js", "am18_raspberry_ml", "am18_milk_bd", "am18_dolls_mt", "am18_napkins_sv",
            "am18_bookshop_bk", "am18_drawings_nd", "am18_pines_ps", "am18_cows_kr", "am18_pies_pr", "gis152_8", "gis157_1", "ol1_p66_379", "ol1_p73_422"] }

    ,
    { id: "big4", emoji: '<img src="art/sec_logic.webp?v=20261120b" class="secico" alt="">', title: "Великі числа · 2", color: "#c39cff",
      sub: "Рух, порівняння, кілька дій з трицифровими",
      ids: ["am19_bus_bs", "am19_ships_sh", "am19_fish_fh", "am19_parcels_pc", "am19_rain_rn",
            "am19_birches_br", "am19_strawberry_sb", "am19_linen_ln", "am19_chestnuts_ch", "am19_snowplow_sp", "gis201_10", "gis205_6"] }
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
    if (!p.profile.baseAvatar || String(p.profile.baseAvatar).indexOf("art/avatar_") === 0) {
      p.profile.baseAvatar = String(p.profile.avatar).indexOf("art/avatar_") === 0 ? "🐸" : p.profile.avatar;
    }
    p.profile.joined = p.profile.joined || todayStr();
    p.wardrobe = Array.isArray(p.wardrobe)
      ? p.wardrobe.filter(function (id) { return SHOP_IDS.indexOf(id) > -1; }) : [];
    if (p.profile.accessory && SHOP_IDS.indexOf(p.profile.accessory) < 0) { p.profile.accessory = null; }
    if (String(p.profile.avatar).indexOf("art/avatar_") === 0) {
      p.profile.avatar = AVATAR_BASE[0];
      p.profile.baseAvatar = AVATAR_BASE[0];
      p.profile.accessory = null;
    }
    p.ownedAvatars = Array.isArray(p.ownedAvatars) ? p.ownedAvatars.filter(function (f) {
      return typeof f === "string" && f.indexOf("avatars/") === 0;
    }) : [];
    AVATAR_BASE.forEach(function (f) { if (p.ownedAvatars.indexOf(f) < 0) { p.ownedAvatars.push(f); } });
    if (String(p.profile.avatar).indexOf("avatars/") === 0 && p.ownedAvatars.indexOf(p.profile.avatar) < 0) {
      p.ownedAvatars.push(p.profile.avatar);
    }
    p.stats = p.stats || {};
    p.stats.lessons = p.stats.lessons || 0;
    p.stats.perfect = p.stats.perfect || 0;
    p.stats.sec = p.stats.sec || 0;
    p.stats.days = p.stats.days || {};
    p.stats.sectionsDone = p.stats.sectionsDone || {};
    p.quests = p.quests || {};
    p.quests.done = p.quests.done || 0;
    p.practice = p.practice || {};
    p.practice.rounds = p.practice.rounds || 0;
    p.practice.correct = p.practice.correct || 0;
    p.practice.wrong = p.practice.wrong || 0;
    p.practice.byMode = p.practice.byMode || {};
    p.combo = p.combo || 0;
    p.demotedFor = p.demotedFor || null;
    p.trainAt = p.trainAt || {};
    p.bestCombo = p.bestCombo || 0;
    /* повертаємо комбо x3, якщо воно зникло після оновлення */
    if (p.combo === 0 && p.bestCombo >= 3 && !p.comboRestored) {
      p.combo = Math.min(3, p.bestCombo);
      p.comboRestored = true;
    }
    p.repeat = p.repeat || {};
    p.mistakes = Array.isArray(p.mistakes) ? p.mistakes : [];
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

    /* місячний квест: лічильник окремий від щоденного */
    var monthKey = t.slice(0, 7);
    if (!p.quests.restoredLegacy && (p.quests.done || 0) > 0 &&
        (p.quests.monthDone || 0) < Math.min(30, p.quests.done)) {
      p.quests.monthDone = Math.min(30, p.quests.done);
      p.quests.month = monthKey;
      p.quests.restoredLegacy = true;
    }
    if (typeof p.quests.monthDone !== "number") { p.quests.monthDone = 0; }
    if (p.quests.month !== monthKey) { p.quests.month = monthKey; p.quests.monthDone = 0; }
    p.quests.monthDone = p.quests.monthDone || 0;

    /* пониження ліги: 7 днів без уроків — ліга на одну нижче, XP знімається */
    if (p.last && p.demotedFor !== p.last) {
      var lastD = new Date(p.last + "T00:00:00");
      var nowD = new Date(todayStr() + "T00:00:00");
      var idle = Math.round((nowD - lastD) / 86400000);
      if (idle >= 7) {
        var idx = 0;
        for (var li2 = 0; li2 < LEAGUES.length; li2++) { if ((p.xp || 0) >= LEAGUES[li2].need) { idx = li2; } }
        var oldXp = p.xp || 0;
        if (idx > 0) {
          p.xp = Math.max(0, LEAGUES[idx].need - 1);
        } else {
          p.xp = Math.max(0, oldXp - 50);
        }
        p.weekXp = Math.min(p.weekXp || 0, p.xp);
        p.demotedFor = p.last;
        p.leagueDropNotice = { lost: oldXp - p.xp, days: idle, from: LEAGUES[idx].name,
                               to: LEAGUES[Math.max(0, idx - (idx > 0 ? 1 : 0))].name };
        save(p);
      }
    }
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
    if (perfect && !prev.gems) { gems = 2; }          // 2 кристали за урок без помилок
    p.levels[id] = { done: true, gems: Math.max(prev.gems || 0, perfect ? 2 : 0) };
    delete p.repeat[id];                              // урок пройдено — знімаємо мітку «повторити»
    var combo = perfect ? ((p.combo || 0) + 1) : 0;
    p.combo = combo;
    p.bestCombo = Math.max(p.bestCombo || 0, combo);
    var comboBonus = (perfect && combo >= 3) ? 2 : 0;   // комбо від 3 уроків поспіль — бонус
    var xp = (first ? 10 : 4) + comboBonus;             // повторення дає мало
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
    var trophy = null;
    if (pos) {
      var s = SECTIONS[pos.section];
      var prog = sectionProgress(p, s);
      if (prog.done === prog.total && !p.stats.sectionsDone[s.id]) {
        p.stats.sectionsDone[s.id] = true;
        p.gems += 15;
        gems += 15;
        trophy = { title: s.title, emoji: s.emoji, reward: 15 };
      }
    }
    p.gems += gems;
    if (p.last !== t) {
      p.streak = p.last === addDays(t, -1) ? p.streak + 1 : 1;
      p.last = t;
    }
    save(p);
    return { gems: gems, xp: xp, first: first, trophy: trophy, combo: combo, comboBonus: comboBonus };
  }

  /* ---------- щоденні бонуси ---------- */
  function dayHash(t) {
    var h = 0;
    for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) % 100000; }
    return h;
  }
  function taskOfDay(p) {
    var t = todayStr();
    var rec = p.taskOfDay;
    if (!rec || rec.date !== t) {
      var h = dayHash(t);
      rec = { date: t, id: SEQ[h % SEQ.length].id, done: false };
      p.taskOfDay = rec;
      save(p);
    }
    return rec;
  }
  function claimTaskOfDay(id) {
    var p = load();
    var rec = taskOfDay(p);
    var gain = 0;
    if (rec.id === id && !rec.done) { rec.done = true; p.gems += 5; gain = 5; }
    save(p);
    return gain;
  }
  function dailyChestState(p) {
    var t = todayStr();
    return { available: p.dailyChest !== t };
  }
  function openDailyChest() {
    var p = load();
    var t = todayStr();
    if (p.dailyChest === t) { return null; }
    p.dailyChest = t;
    var r = Math.random(), res;
    if (r < 0.55) { p.gems += 2; res = { type: "gems", n: 2 }; }
    else if (r < 0.85) { p.gems += 3; res = { type: "gems", n: 3 }; }
    else { p.lives = Math.min(MAX_LIVES, p.lives + 2); res = { type: "life", n: 2 }; }
    save(p);
    return res;
  }

  /* тренування: XP за правильні відповіді, життя не знімаються */
  function awardPractice(correct, mode) {
    var p = load();
    var xp = correct ? 2 : 0;
    if (xp) {
      p.xp += xp;
      p.weekXp += xp;
      var t = todayStr();
      var d = p.stats.days[t] || { lessons: 0, perfect: 0, sec: 0, xp: 0 };
      d.xp += xp;
      p.stats.days[t] = d;
      p.quests.points = (p.quests.points || 0) + xp;
    }
    p.practice.correct += correct ? 1 : 0;
    p.practice.wrong += correct ? 0 : 1;
    if (mode) { p.practice.byMode[mode] = (p.practice.byMode[mode] || 0) + (correct ? 1 : 0); }
    save(p);
    return xp;
  }
  function addGems(n) {
    var p = load();
    p.gems += n;
    save(p);
    return p.gems;
  }

  /* ---------- крамниця аватара ---------- */
  function shopItems() {
    var p = load();
    return SHOP.map(function (x) {
      return { id: x.id, icon: x.icon, name: x.name, cost: x.cost,
               owned: p.wardrobe.indexOf(x.id) > -1, equipped: p.profile.accessory === x.id };
    });
  }
  function buyItem(id) {
    var item = SHOP.filter(function (x) { return x.id === id; })[0];
    if (!item) { return null; }
    var p = load();
    if (p.wardrobe.indexOf(id) > -1) { return { error: "already", item: item }; }
    if (p.gems < item.cost) { return { error: "gems", item: item }; }
    p.gems -= item.cost;
    p.wardrobe.push(id);
    save(p);
    return { item: item };
  }
  function equipItem(id) {
    if (SHOP_IDS.indexOf(id) < 0) { return null; }
    var p = load();
    if (p.wardrobe.indexOf(id) < 0) { return { error: "locked" }; }
    var item = SHOP.filter(function (x) { return x.id === id; })[0];
    if (p.profile.accessory === id) {
      p.profile.accessory = null;
      p.profile.avatar = p.profile.baseAvatar || "🐸";
    } else {
      if (!p.profile.baseAvatar) { p.profile.baseAvatar = p.profile.avatar; }
      p.profile.accessory = id;
      if (item && item.avatar) { p.profile.avatar = item.avatar; }
    }
    save(p);
    return { accessory: p.profile.accessory, avatar: p.profile.avatar };
  }

  /* ---------- купівля аватарів ---------- */
  function avatarShop() {
    var p = load();
    return (window.AVATARS || []).map(function (a) {
      var base = AVATAR_BASE.indexOf(a.file) > -1;
      var price = base ? 0 : (AVATAR_PRICE[a.file] || 200);
      return { id: a.id, name: a.name || "", file: a.file, price: price, base: base,
               owned: base || p.ownedAvatars.indexOf(a.file) > -1,
               selected: p.profile.avatar === a.file };
    });
  }
  function buyAvatar(file) {
    var p = load();
    if (AVATAR_BASE.indexOf(file) > -1 || p.ownedAvatars.indexOf(file) > -1) { return { error: "owned" }; }
    var price = AVATAR_PRICE[file] || 200;
    if (p.gems < price) { return { error: "gems", price: price }; }
    p.gems -= price;
    p.ownedAvatars.push(file);
    save(p);
    return { price: price };
  }
  function selectAvatar(file) {
    var p = load();
    if (AVATAR_BASE.indexOf(file) < 0 && p.ownedAvatars.indexOf(file) < 0) { return { error: "locked" }; }
    p.profile.avatar = file;
    p.profile.baseAvatar = file;
    p.profile.accessory = null;
    save(p);
    return { file: file };
  }

  /* ---------- повторення уроків і помилок ---------- */
  function markRepeat(id) {
    var p = load(); p.repeat = p.repeat || {}; p.repeat[id] = todayStr(); save(p); return true;
  }
  function isRepeat(p, id) { return !!(p && p.repeat && p.repeat[id]); }
  function markMistake(mode, item) {
    var p = load();
    if (!item || !item.q) { return; }
    p.mistakes = (p.mistakes || []).filter(function (m) { return m.q !== item.q; });
    p.mistakes.unshift({ mode: mode || "", q: String(item.q).slice(0, 240), a: String(item.a).slice(0, 120) });
    if (p.mistakes.length > 40) { p.mistakes.length = 40; }
    save(p);
  }
  function mistakes(p) { return (p && p.mistakes) || []; }
  function takeMistake(mode) {
    var list = mistakes(load());
    for (var i = 0; i < list.length; i++) { if (list[i].mode === mode) { return list[i]; } }
    return list.length ? list[0] : null;
  }
  function clearMistake(q) {
    var p = load();
    p.mistakes = (p.mistakes || []).filter(function (m) { return m.q !== q; });
    save(p);
  }

  var LESSON_MODE = { add: "add", mul: "mul", share: "div", money: "add", units: "add",
                      time: "add", compound: "chain", multi: "chain", logic: "add", mul2: "div" };
  /* 5 кроків уроку: головна задача → 3 приклади → повторення помилки → підсумок */
  function lessonSteps(task) {
    var pos = positionOf(task.id);
    var mode = pos ? (LESSON_MODE[SECTIONS[pos.section].id] || "add") : "add";
    var all = window.TRAIN_BANK || {};
    var pool = (all[mode] || all.add || []).slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var steps = [{ type: "main" }];
    for (var k = 0; k < 3 && k < pool.length; k++) {
      steps.push({ type: "num", q: String(pool[k].q), a: String(pool[k].a), mode: mode });
    }
    var m = takeMistake(mode);
    if (m) { steps.push({ type: "num", q: m.q, a: m.a, mode: m.mode, again: true }); }
    else if (pool.length > 3) { steps.push({ type: "num", q: String(pool[3].q), a: String(pool[3].a), mode: mode }); }
    steps.push({ type: "finish" });
    return steps;
  }

  /* ---------- безпечний імпорт прогресу ---------- */
  function sanitize(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { return null; }
    var t = todayStr();
    function num(v, d, lo, hi) { v = Number(v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
    function date(v, d) { return (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? v : d; }
    var out = {};
    out.levels = {};
    var src = (raw.levels && typeof raw.levels === "object") ? raw.levels : {};
    Object.keys(src).forEach(function (k) {
      if (!/^[a-z0-9_]{1,60}$/i.test(k) || !src[k] || typeof src[k] !== "object") { return; }
      out.levels[k] = { done: !!src[k].done, gems: Math.round(num(src[k].gems, 0, 0, 2)) };
    });
    out.xp = Math.round(num(raw.xp, 0, 0, 100000));
    out.weekXp = Math.round(num(raw.weekXp, 0, 0, 100000));
    out.streak = Math.round(num(raw.streak, 0, 0, 3650));
    out.last = date(raw.last, null);
    out.gems = Math.round(num(raw.gems, 0, 0, 100000));
    out.lives = Math.round(num(raw.lives, MAX_LIVES, 0, MAX_LIVES));
    out.livesDate = date(raw.livesDate, t);
    out.weekStart = date(raw.weekStart, mondayStr());
    out.combo = Math.round(num(raw.combo, 0, 0, 3650));
    out.bestCombo = Math.round(num(raw.bestCombo, 0, 0, 3650));
    out.comboRestored = !!raw.comboRestored;
    out.profile = {};
    out.profile.name = String((raw.profile && raw.profile.name) || "Тімчик").replace(/<[^>]*>/g, "").slice(0, 20).trim() || "Тімчик";
    var av = String((raw.profile && raw.profile.avatar) || "🐸");
    out.profile.avatar = (av.indexOf("/") > -1 && /^[a-zA-Z0-9_./\-]{1,80}$/.test(av)) ? av
                          : (/^[^<>"'\\]{1,8}$/.test(av) ? av : "🐸");
    var bav = String((raw.profile && raw.profile.baseAvatar) || "🐸");
    out.profile.baseAvatar = (bav.indexOf("/") > -1 && bav.indexOf("art/avatar_") !== 0 &&
                              /^[a-zA-Z0-9_./\-]{1,80}$/.test(bav)) ? bav
                             : (/^[^<>"'\\]{1,8}$/.test(bav) ? bav : "🐸");
    out.profile.joined = date(raw.profile && raw.profile.joined, t);
    out.wardrobe = [];
    (Array.isArray(raw.wardrobe) ? raw.wardrobe : []).forEach(function (id) {
      if (SHOP_IDS.indexOf(id) > -1 && out.wardrobe.indexOf(id) < 0) { out.wardrobe.push(id); }
    });
    out.profile.accessory = (raw.profile && SHOP_IDS.indexOf(raw.profile.accessory) > -1 &&
                             out.wardrobe.indexOf(raw.profile.accessory) > -1) ? raw.profile.accessory : null;
    out.ownedAvatars = [];
    (Array.isArray(raw.ownedAvatars) ? raw.ownedAvatars : []).forEach(function (f) {
      if (typeof f === "string" && f.indexOf("avatars/") === 0 && out.ownedAvatars.indexOf(f) < 0) {
        out.ownedAvatars.push(f);
      }
    });
    AVATAR_BASE.forEach(function (f) { if (out.ownedAvatars.indexOf(f) < 0) { out.ownedAvatars.push(f); } });
    var st = (raw.stats && typeof raw.stats === "object") ? raw.stats : {};
    out.stats = { lessons: Math.round(num(st.lessons, 0, 0, 100000)), perfect: Math.round(num(st.perfect, 0, 0, 100000)),
                  sec: Math.round(num(st.sec, 0, 0, 1e9)), days: {}, sectionsDone: {} };
    var days = (st.days && typeof st.days === "object") ? st.days : {};
    Object.keys(days).forEach(function (k) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !days[k]) { return; }
      out.stats.days[k] = { lessons: Math.round(num(days[k].lessons, 0, 0, 10000)),
                            perfect: Math.round(num(days[k].perfect, 0, 0, 10000)),
                            sec: Math.round(num(days[k].sec, 0, 0, 100000)),
                            xp: Math.round(num(days[k].xp, 0, 0, 100000)) };
    });
    var sd = (st.sectionsDone && typeof st.sectionsDone === "object") ? st.sectionsDone : {};
    SECTIONS.forEach(function (s) { if (sd[s.id]) { out.stats.sectionsDone[s.id] = true; } });
    var q = (raw.quests && typeof raw.quests === "object") ? raw.quests : {};
    out.quests = { date: date(q.date, t), points: Math.round(num(q.points, 0, 0, 100000)),
                   lessons: Math.round(num(q.lessons, 0, 0, 10000)), perfect: Math.round(num(q.perfect, 0, 0, 10000)),
                   sec: Math.round(num(q.sec, 0, 0, 100000)), done: Math.round(num(q.done, 0, 0, 100000)),
                   monthDone: Math.round(num(q.monthDone, Math.min(30, num(q.done, 0, 0, 100000)), 0, 100000)),
                   restoredLegacy: !!q.restoredLegacy, claimed: {} };
    if (!out.quests.restoredLegacy && out.quests.done > 0 && out.quests.monthDone < Math.min(30, out.quests.done)) {
      out.quests.monthDone = Math.min(30, out.quests.done);
      out.quests.restoredLegacy = true;
    }
    var cl = (q.claimed && typeof q.claimed === "object") ? q.claimed : {};
    ["points", "time", "perfect"].forEach(function (k) { if (cl[k]) { out.quests.claimed[k] = true; } });
    var pr = (raw.practice && typeof raw.practice === "object") ? raw.practice : {};
    out.practice = { rounds: Math.round(num(pr.rounds, 0, 0, 100000)), correct: Math.round(num(pr.correct, 0, 0, 1e6)),
                     wrong: Math.round(num(pr.wrong, 0, 0, 1e6)), byMode: {} };
    var bm = (pr.byMode && typeof pr.byMode === "object") ? pr.byMode : {};
    MODES_OK.forEach(function (k) { if (bm[k]) { out.practice.byMode[k] = Math.round(num(bm[k], 0, 0, 1e6)); } });
    out.repeat = {};
    var rp = (raw.repeat && typeof raw.repeat === "object") ? raw.repeat : {};
    Object.keys(rp).forEach(function (k) { if (/^[a-z0-9_]{1,60}$/i.test(k)) { out.repeat[k] = date(rp[k], t); } });
    out.mistakes = [];
    var ms = Array.isArray(raw.mistakes) ? raw.mistakes : [];
    for (var mi = 0; mi < Math.min(ms.length, 40); mi++) {
      if (ms[mi] && ms[mi].q) { out.mistakes.push({ mode: String(ms[mi].mode || "").slice(0, 20),
                                                    q: String(ms[mi].q).slice(0, 240), a: String(ms[mi].a).slice(0, 120) }); }
    }
    out.trainAt = {};
    var ta = (raw.trainAt && typeof raw.trainAt === "object") ? raw.trainAt : {};
    MODES_OK.forEach(function (k) { if (ta[k]) { out.trainAt[k] = num(ta[k], 0, 0, Date.now()); } });
    return out;
  }
  var MODES_OK = ["add", "sub", "mul", "div", "big", "chain", "times", "mix", "cmp"];
  var SECTION_SHADE = { add: "#46a302", mul: "#cc5549", share: "#e6ac00", money: "#a568cc",
                        units: "#cc7800", time: "#cc3c3c", compound: "#46a302", multi: "#9463c9",
                        logic: "#e6ac00", mul2: "#cc7024" };

  /* тренування: один раунд на режим раз на TRAIN_COOLDOWN (5 хв) */
  var TRAIN_COOLDOWN = 5 * 60 * 1000;
  function trainReady(mode) {
    var p = load();
    var t = p.trainAt[mode] || 0;
    return Date.now() - t >= TRAIN_COOLDOWN;
  }
  function trainLeft(mode) {
    var p = load();
    var t = p.trainAt[mode] || 0;
    return Math.max(0, TRAIN_COOLDOWN - (Date.now() - t));
  }
  function trainMark(mode) {
    var p = load();
    p.trainAt[mode] = Date.now();
    save(p);
  }

  function finishPracticeRound(stats) {
    var p = load();
    p.practice.rounds += 1;
    save(p);
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
      { id: "points", icon: '<img src="art/icon_coin.webp?v=20261120b" class="ico" alt="">', title: "Отримайте 10 балів", now: q.points, goal: 10,
        reward: "💎 +2", gem: 2, life: 0 },
      { id: "time", icon: '<img src="art/icon_clock.webp?v=20261120b" class="ico" alt="">', title: "Практикуйтеся 5 хвилин", now: Math.floor(q.sec / 60), goal: 5,
        reward: "❤️ +2", gem: 0, life: 2 },
      { id: "perfect", icon: '<img src="art/icon_star.webp?v=20261120b" class="ico" alt="">', title: "Пройдіть 2 уроки без помилок", now: q.perfect, goal: 2,
        reward: "💎 +3", gem: 3, life: 0 }
    ];
  }
  function claimQuest(id) {
    var p = load();
    var q = quests(p).filter(function (x) { return x.id === id; })[0];
    if (!q || q.now < q.goal || p.quests.claimed[id]) { return null; }
    p.quests.claimed[id] = true;
    p.quests.done += 1;
    p.quests.monthDone = (p.quests.monthDone || 0) + 1;
    if (q.gem) { p.gems += q.gem; }
    if (q.life) { p.lives = Math.min(MAX_LIVES, p.lives + q.life); }
    save(p);
    return q;
  }

  /* ---------- ліги ---------- */
  var LEAGUES = [
    { name: "Бронзова", emoji: "🥉", crest: "art/league_bronze.webp?v=20261120b", city: "art/city_bronze.webp?v=20261120b", color: "#cd7f32", need: 0 },
    { name: "Срібна", emoji: "🥈", crest: "art/league_silver.webp?v=20261120b", city: "art/city_silver.webp?v=20261120b", color: "#9aa7b8", need: 100 },
    { name: "Золота", emoji: "🥇", crest: "art/league_gold.webp?v=20261120b", city: "art/city_gold.webp?v=20261120b", color: "#ffc800", need: 300 },
    { name: "Сапфірова", emoji: "🔷", crest: "art/league_sapphire.webp?v=20261120b", city: "art/city_sapphire.webp?v=20261120b", color: "#2ec4b6", need: 600 },
    { name: "Смарагдова", emoji: "🟢", crest: "art/league_emerald.webp?v=20261120b", city: "art/city_emerald.webp?v=20261120b", color: "#2ecc71", need: 1000 },
    { name: "Рубінова", emoji: "🔺", crest: "art/league_ruby.webp?v=20261120b", city: "art/city_ruby.webp?v=20261120b", color: "#ff4b4b", need: 1500 },
    { name: "Аметистова", emoji: "🟣", crest: "art/league_amethyst.webp?v=20261120b", city: "art/city_amethyst.webp?v=20261120b", color: "#a55eea", need: 2100 },
    { name: "Перлинна", emoji: "🦪", crest: "art/league_pearl.webp?v=20261120b", city: "art/city_pearl.webp?v=20261120b", color: "#ff86c8", need: 2800 },
    { name: "Обсидіанова", emoji: "⚫", crest: "art/league_obsidian.webp?v=20261120b", city: "art/city_obsidian.webp?v=20261120b", color: "#4b4b4b", need: 3600 },
    { name: "Діамантова", emoji: "💎", crest: "art/league_diamond.webp?v=20261120b", city: "art/city_diamond.webp?v=20261120b", color: "#00c2c7", need: 4500 }
  ];
  function leagueOf(p) {
    var li = 0;
    var total = p.xp || 0;
    for (var i = 0; i < LEAGUES.length; i++) { if (total >= LEAGUES[i].need) { li = i; } }
    var cur = LEAGUES[li];
    var next = LEAGUES[li + 1] || null;
    var pct = next ? Math.min(1, (total - cur.need) / (next.need - cur.need)) : 1;
    return { index: li, cur: cur, next: next, pct: pct, total: total };
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
    /* суперники не залежать від гравця: єдина ціль тижня — p.weekXp */
    var base = 40 + leagueOf(p).index * 45 + Math.floor(rnd() * 40);
    var arr = names.map(function (n, i) {
      return { name: n, xp: Math.round(base * (0.55 + rnd() * 0.95)), me: false };
    });
    arr.push({ name: p.profile.name + " (ви)", xp: p.weekXp || 0, me: true });
    arr.sort(function (a, b) { return b.xp - a.xp || (a.me ? -1 : 1); });
    var rank = 1;
    arr.forEach(function (x, i) { if (x.me) { rank = i + 1; } });
    return { list: arr.slice(0, 30), rank: rank, promote: rank <= 10, demote: rank >= 26 };
  }

  /* ---------- досягнення ---------- */
  function achievements(p) {
    var a = [];
    function add(o) { a.push(o); }
    add({ id: "first", icon: '<img src="art/icon_star.webp?v=20261120b" class="ico" alt="">', title: "Перший крок", now: Math.min(p.stats.lessons, 1), goal: 1,
          level: p.stats.lessons >= 1 ? 1 : 0, max: 1, desc: "Пройди перший урок" });
    add({ id: "ten", icon: '<img src="art/ach_books.webp?v=20261120b" class="ico" alt="">', title: "Старанний", now: Math.min(p.stats.lessons, 10), goal: 10,
          level: p.stats.lessons >= 10 ? 1 : 0, max: 1, desc: "Пройди 10 уроків" });
    add({ id: "twentyfive", icon: '<img src="art/ach_boots.webp?v=20261120b" class="ico" alt="">', title: "Марафонець", now: Math.min(p.stats.lessons, 25), goal: 25,
          level: p.stats.lessons >= 25 ? 1 : 0, max: 1, desc: "Пройди 25 уроків" });
    add({ id: "perfect5", icon: '<img src="art/ach_target.webp?v=20261120b" class="ico" alt="">', title: "Без помилок", now: Math.min(p.stats.perfect, 5), goal: 5,
          level: p.stats.perfect >= 5 ? 1 : 0, max: 1, desc: "5 ідеальних уроків" });
    add({ id: "streak3", icon: '<img src="art/ach_fire.webp?v=20261120b" class="ico" alt="">', title: "Серія", now: Math.min(p.streak, 3), goal: 3,
          level: p.streak >= 7 ? 3 : p.streak >= 3 ? 1 : 0, max: 3, desc: "Займайся кілька днів підряд" });
    add({ id: "xp500", icon: '<img src="art/ach_bolt.webp?v=20261120b" class="ico" alt="">', title: "Мудрий", now: Math.min(p.xp, 500), goal: 500,
          level: p.xp >= 1000 ? 2 : p.xp >= 500 ? 1 : 0, max: 2, desc: "Зароби 500 балів" });
    add({ id: "gems25", icon: '<img src="art/icon_gem.webp?v=20261120b" class="ico" alt="">', title: "Кристальний", now: Math.min(p.gems, 25), goal: 25,
          level: p.gems >= 50 ? 2 : p.gems >= 25 ? 1 : 0, max: 2, desc: "Збери 25 кристалів" });
    add({ id: "league", icon: '<img src="art/icon_trophy.webp?v=20261120b" class="ico" alt="">', title: "Чемпіон", now: leagueOf(p).index, goal: 9,
          level: leagueOf(p).index >= 9 ? 2 : leagueOf(p).index >= 5 ? 1 : 0, max: 2,
          desc: "Дійди до Діамантової ліги" });
    return a;
  }

  /* ---------- сайдбар ---------- */
  var NAV = [
    { key: "learn", href: "index.html", icon: '<img src="art/nav_home.webp?v=20261120b" class="navico" alt="">', label: "Навчання" },
    { key: "train", href: "train.html", icon: '<img src="art/nav_train.webp?v=20261120b" class="navico" alt="">', label: "Тренування" },
    { key: "quests", href: "quests.html", icon: '<img src="art/nav_quests.webp?v=20261120b" class="navico" alt="">', label: "Квести" },
    { key: "board", href: "leaderboard.html", icon: '<img src="art/nav_board.webp?v=20261120b" class="navico" alt="">', label: "Дошки пошани" },
    { key: "profile", href: "profile.html", icon: '<img src="art/nav_profile.webp?v=20261120b" class="navico" alt="">', label: "Профіль" }
  ];
  function avatarMarkup(a, size) {
    var p = load();
    var acc = p.profile.accessory ? SHOP.filter(function (x) { return x.id === p.profile.accessory; })[0] : null;
    var base;
    if (a && String(a).indexOf("/") > -1) {
      base = '<img src="' + esc(a) + '?v=20261117u" alt="" style="width:' + size + 'px;height:' + size +
             'px;border-radius:50%;object-fit:cover;display:inline-block;vertical-align:middle">';
    } else {
      base = a || "🐸";
    }
    var showAcc = acc && String(a).indexOf("art/avatar_") !== 0;
    return '<span class="avwrap">' + base + (showAcc ? '<i class="acc">' + shopIconHTML(acc, 18) + '</i>' : '') + '</span>';
  }

  function renderSidebar(active) {
    var host = document.getElementById("side");
    if (!host) { return; }
    var p = load();
    var lg = leagueOf(p);
    var html = '<a class="logo" href="index.html">Тімолінго</a>';
    html += '<nav class="nav">';
    NAV.forEach(function (n) {
      var ic = n.key === "profile" ? avatarMarkup(p.profile.avatar, 26) : n.icon;
      html += '<a class="nav-item' + (n.key === active ? " on" : "") + '" href="' + n.href + '">' +
              '<span class="ni">' + ic + '</span>' + n.label + "</a>";
    });
    html += "</nav>";
    html += '<div class="side-foot">' +
            '<a class="nav-item" href="../index.html"><span class="ni"><img src="art/nav_library.webp?v=20261120b" class="navico" alt=""></span>Бібліотека</a>' +
            '<div class="mini-league" style="--lc:' + lg.cur.color + '">' +
            '<div class="ml-emoji"><img class="league-crest sm" src="' + lg.cur.crest + '?v=20261118e" alt=""></div><div><b>' + lg.cur.name + ' ліга</b>' +
            '<div class="ml-xp">' + p.xp + ' XP усього</div></div></div>' +
            "</div>";
    host.innerHTML = html;
  }

  function hudHTML() {
    var p = load();
    return '<span class="chip lives"><img src="art/icon_heart.webp?v=20261120b" class="ico sm" alt=""> <b id="hud-lives">' + p.lives + '</b></span>' +
           '<span class="chip gems"><img src="art/icon_gem.webp?v=20261120b" class="ico sm" alt=""> <b id="hud-gems">' + p.gems + '</b></span>' +
           '<span class="chip xp"><img src="art/ach_bolt.webp?v=20261120b" class="ico sm" alt=""> <b id="hud-xp">' + p.xp + '</b></span>' +
           '<span class="chip streak"><img src="art/ach_fire.webp?v=20261120b" class="ico sm" alt=""> <b id="hud-streak">' + p.streak + '</b></span>' +
           '<span class="chip combo"><img src="art/icon_star.webp?v=20261120b" class="ico sm" alt=""> <b id="hud-combo">x' + (p.combo || 0) + '</b></span>';
  }
  function syncHud() {
    var p = load();
    var m = { "hud-lives": p.lives, "hud-gems": p.gems, "hud-xp": p.xp, "hud-streak": p.streak,
              "hud-combo": "x" + (p.combo || 0) };
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
    awardLesson: awardLesson, awardPractice: awardPractice, addGems: addGems,
    finishPracticeRound: finishPracticeRound, loseLife: loseLife,
    trainReady: trainReady, trainLeft: trainLeft, trainMark: trainMark,
    quests: quests, claimQuest: claimQuest, leagueOf: leagueOf, weekLeaderboard: weekLeaderboard,
    achievements: achievements, renderSidebar: renderSidebar,
    taskOfDay: taskOfDay, claimTaskOfDay: claimTaskOfDay,
    dailyChestState: dailyChestState, openDailyChest: openDailyChest, hudHTML: hudHTML, syncHud: syncHud,
    toast: toast, esc: esc, positionOf: positionOf, taskById: taskById, nextLessonId: nextLessonId,
    avatarMarkup: avatarMarkup,
    markRepeat: markRepeat, isRepeat: isRepeat, markMistake: markMistake, mistakes: mistakes,
    takeMistake: takeMistake, clearMistake: clearMistake, lessonSteps: lessonSteps,
    sanitize: sanitize, SECTION_SHADE: SECTION_SHADE, LESSON_MODE: LESSON_MODE,
    shopItems: shopItems, buyItem: buyItem, equipItem: equipItem, SHOP: SHOP, shopIconHTML: shopIconHTML,
    avatarShop: avatarShop, buyAvatar: buyAvatar, selectAvatar: selectAvatar
  };
})();
