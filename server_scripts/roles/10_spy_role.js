// kubejs/server_scripts/roles/10_spy_role.js

var SPY_ROLE_ID = "spy";

function spyDefaults() {
  return { rank: 0, bugUntil: 0 };
}

global.SpyRole = {
  id: SPY_ROLE_ID,

  getData: function (player) {
    return global.RoleStorage.ensureRoleData(player, SPY_ROLE_ID, spyDefaults());
  },

  getRank: function (player) {
    var d = global.RoleStorage.getRoleData(player, SPY_ROLE_ID);
    try { global.PlayerRegistry.updateForPlayer(player); } catch (e) {}
    return d && d.rank ? d.rank : 0;
  },

  grantRank: function (player, rank) {
    var d = this.getData(player);
    d.rank = Math.max(d.rank || 0, rank);
    global.RoleStorage.setRoleData(player, SPY_ROLE_ID, d);

    try { player.addTag("Espion"); } catch (e) {}

    player.tell("§6[ESPION]§r Rôle attribué : Espion (Niveau " + d.rank + ").");
  },

  activateBug: function (player) {
    var d = this.getData(player);
    if ((d.rank || 0) < 1) {
      player.tell("§c[ESPION]§r Vous devez être Espion (Niveau 1) avant d’activer un mouchard.");
      return;
    }

    d.bugUntil = global.RoleManager.nowMs() + global.ROLE_CONFIG.spy.bugDurationMs;
    global.RoleStorage.setRoleData(player, SPY_ROLE_ID, d);

    player.tell("§a[ESPION]§r Mouchard activé pour 3 jours (temps réel).");
  },

  hasActiveBug: function (player) {
    var d = global.RoleStorage.getRoleData(player, SPY_ROLE_ID);
    return !!(d && (d.bugUntil || 0) > global.RoleManager.nowMs());
  },

  getInterceptChance: function (player) {
    var rank = this.getRank(player);
    var m = global.ROLE_CONFIG.spy.interceptChanceByRank;
    return (m[rank] != null) ? m[rank] : 0.0;
  },

  canInterceptMsg: function (player) {
    return this.getRank(player) >= global.ROLE_CONFIG.spy.minRankToInterceptMsg;
  }
};

// Enregistrement du rôle (en référencant bien global.RoleManager)
global.RoleManager.register(global.SpyRole);
