// kubejs/server_scripts/roles/00_config.js

global.ROLE_CONFIG = {
  spy: {
    bugDurationMs: 3 * 24 * 60 * 60 * 1000,
    interceptChanceByRank: {
      1: 0.25,
      2: 0.45,
      3: 0.70
    },
    minRankToInterceptMsg: 2
  },
  intelPrefix: "§c[INTEL]§r "
};
