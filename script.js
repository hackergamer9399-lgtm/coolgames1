/* ============================================================
   COOL GAMES AND STUFF — app logic
   Reads GAMES / CATEGORIES from games-data.js
   ============================================================ */
(function(){
  "use strict";

  const grid          = document.getElementById("gameGrid");
  const emptyState    = document.getElementById("emptyState");
  const categoryNav   = document.getElementById("categoryNav");
  const searchInput   = document.getElementById("searchInput");
  const sectionTitle  = document.getElementById("sectionTitle");
  const resultCount   = document.getElementById("resultCount");
  const statCount     = document.getElementById("statCount");
  const menuToggle    = document.getElementById("menuToggle");

  const modal          = document.getElementById("playerModal");
  const playerStage     = document.getElementById("playerStage");
  const gameFrame       = document.getElementById("gameFrame");
  const builtinHost     = document.getElementById("builtinGameHost");
  const playerLoading   = document.getElementById("playerLoading");
  const blockedNotice   = document.getElementById("playerBlockedNotice");
  const blockedOpenBtn  = document.getElementById("blockedOpenBtn");
  const playerGameTitle = document.getElementById("playerGameTitle");
  const playerIcon      = document.getElementById("playerIcon");
  const openExternalBtn = document.getElementById("openExternalBtn");
  const fullscreenBtn   = document.getElementById("fullscreenBtn");
  const closePlayerBtn  = document.getElementById("closePlayerBtn");
  const restartBtn      = document.getElementById("restartBtn");

  let activeCategory = "All";
  let activeGame = null;
  let loadTimer = null;
  let activeBuiltinCleanup = null;

  /* ---------------- render category chips ---------------- */
  function renderCategories(){
    categoryNav.innerHTML = "";
    CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "chip" + (cat === activeCategory ? " active" : "");
      btn.textContent = cat;
      btn.setAttribute("role", "tab");
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderCategories();
        renderGrid();
      });
      categoryNav.appendChild(btn);
    });
  }

  /* ---------------- render game grid ---------------- */
  function renderGrid(){
    const query = searchInput.value.trim().toLowerCase();
    const filtered = GAMES.filter(g => {
      const matchesCategory = activeCategory === "All" || g.category === activeCategory;
      const matchesQuery = !query || g.title.toLowerCase().includes(query) || g.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    grid.innerHTML = "";
    filtered.forEach(g => grid.appendChild(buildCard(g)));

    emptyState.hidden = filtered.length !== 0;
    sectionTitle.textContent = activeCategory === "All" ? "All Games" : activeCategory;
    resultCount.textContent = filtered.length + (filtered.length === 1 ? " game" : " games");
  }

  function buildCard(g){
    const card = document.createElement("article");
    card.className = "cabinet";
    card.tabIndex = 0;
    card.style.setProperty("--g1", g.gradient[0]);
    card.style.setProperty("--g2", g.gradient[1]);
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Play " + g.title);

    card.innerHTML = `
      <div class="cabinet-marquee"></div>
      <div class="cabinet-screen">
        <span class="cabinet-emoji">${g.emoji}</span>
        <div class="cabinet-play-overlay"><span class="play-pill">▶ PLAY</span></div>
      </div>
      <div class="cabinet-body">
        <h3 class="cabinet-title">${g.title}</h3>
        <p class="cabinet-desc">${g.description}</p>
        <span class="cabinet-tag">${g.category}</span>
      </div>
    `;

    const open = () => openGame(g);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }
    });

    return card;
  }

  /* ---------------- player modal ---------------- */
  function openGame(g){
    activeGame = g;
    playerGameTitle.textContent = g.title;
    playerIcon.textContent = g.emoji;
    modal.hidden = false;
    modal.focus();
    document.body.style.overflow = "hidden";

    blockedNotice.hidden = true;
    playerLoading.hidden = false;
    gameFrame.hidden = true;
    builtinHost.hidden = true;
    builtinHost.innerHTML = "";

    if (g.type === "builtin"){
      openExternalBtn.style.display = "none";
      restartBtn.style.display = "";
      playerLoading.hidden = true;
      builtinHost.hidden = false;
      launchBuiltin(g.builtinKey);
    } else {
      openExternalBtn.style.display = "";
      openExternalBtn.href = g.url;
      restartBtn.style.display = "";
      loadIframe(g.url);
    }
  }

  function loadIframe(url){
    clearTimeout(loadTimer);
    playerLoading.hidden = false;
    blockedNotice.hidden = true;
    gameFrame.hidden = false;
    gameFrame.src = url;

    gameFrame.onload = () => {
      playerLoading.hidden = true;
    };

    // Best-effort: if the source blocks framing, load often never
    // fires (or fires but renders nothing we can detect, since
    // cross-origin content can't be inspected). Fall back to a
    // manual "open elsewhere" prompt after a few seconds.
    loadTimer = setTimeout(() => {
      if (!playerLoading.hidden){
        playerLoading.hidden = true;
        blockedNotice.hidden = false;
        blockedOpenBtn.href = url;
        gameFrame.hidden = true;
      }
    }, 6000);
  }

  function closeModal(){
    modal.hidden = true;
    document.body.style.overflow = "";
    clearTimeout(loadTimer);
    gameFrame.src = "about:blank";
    if (typeof activeBuiltinCleanup === "function"){
      activeBuiltinCleanup();
      activeBuiltinCleanup = null;
    }
    if (document.fullscreenElement) document.exitFullscreen?.();
    activeGame = null;
  }

  closePlayerBtn.addEventListener("click", closeModal);
  modal.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  restartBtn.addEventListener("click", () => {
    if (!activeGame) return;
    if (activeGame.type === "builtin"){
      launchBuiltin(activeGame.builtinKey);
    } else {
      loadIframe(activeGame.url);
    }
  });

  /* ---------------- fullscreen (cross-browser + iOS fallback) ---------------- */
  fullscreenBtn.addEventListener("click", () => {
    const el = playerStage;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;

    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs && request){
      request.call(el).catch(() => { /* iOS Safari has no Fullscreen API for arbitrary elements */ });
    } else if (isFs && exit){
      exit.call(document);
    } else {
      // iOS Safari fallback: simulate fullscreen with a fixed-position class
      el.classList.toggle("ios-fullscreen-fallback");
    }
  });

  /* ---------------- search + menu ---------------- */
  searchInput.addEventListener("input", renderGrid);
  menuToggle.addEventListener("click", () => categoryNav.classList.toggle("open"));

  /* ============================================================
     BUILT-IN GAMES
     These run entirely in this site's own JS — nothing embedded,
     so they always work, on any device.
     ============================================================ */
  const BuiltinGames = {
    snake: initSnake,
    memory: initMemory
  };

  function launchBuiltin(key){
    if (typeof activeBuiltinCleanup === "function") activeBuiltinCleanup();
    builtinHost.innerHTML = "";
    activeBuiltinCleanup = BuiltinGames[key](builtinHost);
  }

  /* ---- Snake ---- */
  function initSnake(host){
    host.innerHTML = `
      <div class="sg-wrap">
        <div class="sg-hud"><span>SCORE <b id="sgScore">0</b></span><span id="sgMsg">Swipe or use arrow keys</span></div>
        <canvas id="sgCanvas" width="360" height="360"></canvas>
      </div>
      <style>
        .sg-wrap{ display:flex; flex-direction:column; align-items:center; gap:10px; font-family:'JetBrains Mono',monospace; color:#eef0fb; }
        .sg-hud{ display:flex; gap:20px; font-size:13px; color:#8890b5; }
        .sg-hud b{ color:#22d3ee; }
        #sgCanvas{ background:#0a0b14; border:2px solid rgba(139,92,246,0.4); border-radius:10px; touch-action:none; max-width:90vw; max-height:70vh; }
      </style>
    `;
    const canvas = host.querySelector("#sgCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = host.querySelector("#sgScore");
    const msgEl = host.querySelector("#sgMsg");
    const cell = 18, cols = canvas.width / cell, rows = canvas.height / cell;

    let snake, dir, nextDir, food, score, alive, loopId;

    function reset(){
      snake = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
      dir = {x:1,y:0}; nextDir = dir;
      score = 0; alive = true;
      scoreEl.textContent = "0";
      msgEl.textContent = "Swipe or use arrow keys";
      placeFood();
    }
    function placeFood(){
      food = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
      if (snake.some(s => s.x===food.x && s.y===food.y)) placeFood();
    }
    function tick(){
      if (!alive) return;
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x<0||head.y<0||head.x>=cols||head.y>=rows||snake.some(s=>s.x===head.x&&s.y===head.y)){
        alive = false; msgEl.textContent = "Game over — tap Restart";
        return draw();
      }
      snake.unshift(head);
      if (head.x===food.x && head.y===food.y){ score++; scoreEl.textContent = score; placeFood(); }
      else snake.pop();
      draw();
    }
    function draw(){
      ctx.fillStyle = "#0a0b14"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(food.x*cell+2, food.y*cell+2, cell-4, cell-4);
      snake.forEach((s,i) => {
        ctx.fillStyle = i===0 ? "#22d3ee" : "#8b5cf6";
        ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
      });
    }
    function setDir(x,y){
      if (dir.x === -x && dir.y === -y) return; // no 180 turns
      nextDir = {x,y};
    }
    function onKey(e){
      const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0], w:[0,-1], s:[0,1], a:[-1,0], d:[1,0] };
      if (map[e.key]){ e.preventDefault(); setDir(...map[e.key]); }
    }
    let touchStart = null;
    function onTouchStart(e){ touchStart = e.touches[0]; }
    function onTouchEnd(e){
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.clientX;
      const dy = e.changedTouches[0].clientY - touchStart.clientY;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx>0?1:-1, 0);
      else setDir(0, dy>0?1:-1);
      touchStart = null;
    }

    document.addEventListener("keydown", onKey);
    canvas.addEventListener("touchstart", onTouchStart, {passive:true});
    canvas.addEventListener("touchend", onTouchEnd, {passive:true});

    reset(); draw();
    loopId = setInterval(tick, 110);

    return function cleanup(){
      clearInterval(loopId);
      document.removeEventListener("keydown", onKey);
    };
  }

  /* ---- Memory Match ---- */
  function initMemory(host){
    const ICONS = ["🍕","🚀","🐙","🎧","🌵","⚡","🍀","🎲"];
    let deck = [...ICONS, ...ICONS].sort(() => Math.random()-0.5);
    let flipped = [], matched = new Set(), moves = 0, lock = false;

    host.innerHTML = `
      <div class="mm-wrap">
        <div class="mm-hud"><span>MOVES <b id="mmMoves">0</b></span><span id="mmMsg">Find every pair</span></div>
        <div class="mm-grid" id="mmGrid"></div>
      </div>
      <style>
        .mm-wrap{ display:flex; flex-direction:column; align-items:center; gap:14px; font-family:'JetBrains Mono',monospace; color:#eef0fb; }
        .mm-hud{ display:flex; gap:20px; font-size:13px; color:#8890b5; }
        .mm-hud b{ color:#22d3ee; }
        .mm-grid{ display:grid; grid-template-columns:repeat(4,64px); gap:8px; }
        .mm-card{ width:64px; height:64px; border-radius:10px; background:#1a1d2e; border:1px solid rgba(139,92,246,0.3);
          display:flex; align-items:center; justify-content:center; font-size:28px; cursor:pointer; user-select:none;
          transition: transform .15s; }
        .mm-card.flipped, .mm-card.matched{ background:#20243a; border-color:#22d3ee; }
        .mm-card.matched{ opacity:0.5; cursor:default; }
        .mm-card:not(.flipped):not(.matched) span{ visibility:hidden; }
        @media (max-width:480px){ .mm-grid{ grid-template-columns:repeat(4,56px);} .mm-card{width:56px;height:56px;font-size:24px;} }
      </style>
    `;
    const gridEl = host.querySelector("#mmGrid");
    const movesEl = host.querySelector("#mmMoves");
    const msgEl = host.querySelector("#mmMsg");

    deck.forEach((icon, i) => {
      const card = document.createElement("div");
      card.className = "mm-card";
      card.dataset.icon = icon;
      card.dataset.index = i;
      card.innerHTML = `<span>${icon}</span>`;
      card.addEventListener("click", () => flip(card));
      gridEl.appendChild(card);
    });

    function flip(card){
      if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
      card.classList.add("flipped");
      flipped.push(card);
      if (flipped.length === 2){
        moves++; movesEl.textContent = moves;
        lock = true;
        const [a,b] = flipped;
        if (a.dataset.icon === b.dataset.icon){
          a.classList.add("matched"); b.classList.add("matched");
          matched.add(a.dataset.index); matched.add(b.dataset.index);
          flipped = []; lock = false;
          if (matched.size === deck.length) msgEl.textContent = `Solved in ${moves} moves! 🎉`;
        } else {
          setTimeout(() => {
            a.classList.remove("flipped"); b.classList.remove("flipped");
            flipped = []; lock = false;
          }, 700);
        }
      }
    }

    return function cleanup(){ /* nothing to tear down */ };
  }

  /* ---------------- init ---------------- */
  statCount.textContent = GAMES.length;
  renderCategories();
  renderGrid();
})();
