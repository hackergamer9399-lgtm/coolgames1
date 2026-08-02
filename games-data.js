/* ============================================================
   GAMES-DATA.JS
   ------------------------------------------------------------
   This is the ONLY file you need to touch to add, remove, or
   edit games. Each entry is one arcade cabinet on the site.

   TWO KINDS OF ENTRIES:

   1) type: "iframe"  -> embeds a game from another website.
      IMPORTANT: Most big game sites (Poki, CrazyGames, Y8, etc.)
      block being embedded on other domains for anti-theft
      reasons (a header called X-Frame-Options / CSP
      frame-ancestors). If a game you add just shows a spinner
      forever or a blank box, that source blocks embedding —
      swap the url for one that allows it, or leave it and let
      the built-in "Play on original site" fallback handle it.

      Sources that generally DO allow embedding:
        - itch.io games with "embed this game" turned on by the dev
        - GameDistribution.com (html5.gamedistribution.com/<id>/)
          if you've registered as a publisher there
        - Any small dev's personal / GitHub Pages hosted game
        - CrazyGames / Poki ONLY if they've approved you as an
          official publishing partner (their SDK, not a raw iframe)

   2) type: "builtin" -> a game coded directly into this site
      (see script.js -> BuiltinGames). These always work, since
      nothing is being embedded.

   FIELDS:
     id          unique slug, no spaces
     title       display name
     type        "iframe" | "builtin"
     url         (iframe only) the game's embeddable URL
     builtinKey  (builtin only) key into BuiltinGames in script.js
     category    one of the CATEGORIES below (or add your own)
     emoji       icon shown on the cabinet card
     gradient    two hex colors for the card art, e.g. ["#7c5cff","#22d3ee"]
     description short one-liner shown on the card
   ============================================================ */

const CATEGORIES = ["All", "Arcade", "Puzzle", "Action", "Casual"];

const GAMES = [
  {
    id: "snake",
    title: "Neon Snake",
    type: "builtin",
    builtinKey: "snake",
    category: "Arcade",
    emoji: "🐍",
    gradient: ["#22d3ee", "#7c5cff"],
    description: "Built-in — eat, grow, don't hit yourself."
  },
  {
    id: "memory",
    title: "Memory Match",
    type: "builtin",
    builtinKey: "memory",
    category: "Puzzle",
    emoji: "🧠",
    gradient: ["#f43f5e", "#7c5cff"],
    description: "Built-in — flip cards, find every pair."
  },
  {
    id: "2048",
    title: "2048",
    type: "iframe",
    url: "https://gabrielecirulli.github.io/2048/",
    category: "Puzzle",
    emoji: "🔢",
    gradient: ["#f59e0b", "#f43f5e"],
    description: "Slide tiles, merge numbers, chase 2048."
  },
  {
    id: "floppybird",
    title: "Floppy Bird",
    type: "iframe",
    url: "https://nebezb.com/floppybird/",
    category: "Arcade",
    emoji: "🐤",
    gradient: ["#22d3ee", "#f59e0b"],
    description: "Tap to flap. Don't clip a pipe."
  },
  {
    id: "tetris",
    title: "JS Tetris",
    type: "iframe",
    url: "https://jakesgordon.github.io/javascript-tetris/",
    category: "Puzzle",
    emoji: "🧱",
    gradient: ["#7c5cff", "#22d3ee"],
    description: "The classic block-stacker, in your browser."
  },
  {
    id: "trex",
    title: "Dino Runner",
    type: "iframe",
    url: "https://wayou.github.io/t-rex-runner/",
    category: "Action",
    emoji: "🦖",
    gradient: ["#8890b5", "#22d3ee"],
    description: "The offline-Chrome dino, jump the cacti."
  },

   {
  id: "level-devil",
  title: "Level Devil",
  type: "iframe",
  url: "https://games.poki.com/458768/13acae8c-ec6a-4823-b1a2-8ea20cea56e7?tag=pg-9570d7d4e3458f2adaf6bf9360320f36a103deb7&site_id=3&iso_lang=en&country=SG&poki_url=https://poki.com/en/g/level-devil&hoist=yes&nonPersonalized=n&cloudsavegames=n&familyFriendly=n&device=desktop&categories=3,6,7,48,76,103,228,750,885,903,929,1018,1139,1140,1171,1185,1190,1193,1201,1213",
  category: "Action",
  emoji: "😈",
  gradient: ["#f43f5e", "#7c5cff"],
  description: "Avoid traps and beat every level."
},

   

  /* ---- EXAMPLE: how you'd add a Poki / CrazyGames style entry
     once you have a URL that actually allows embedding, or an
     approved publisher/SDK integration. Delete the leading
     slashes to activate it.

  {
    id: "example-game",
    title: "Example Game",
    type: "iframe",
    url: "https://html5.gamedistribution.com/XXXXXXXX/",
    category: "Action",
    emoji: "🎯",
    gradient: ["#7c5cff", "#f43f5e"],
    description: "Replace with your real embeddable game URL."
  },
  ---- */
];
