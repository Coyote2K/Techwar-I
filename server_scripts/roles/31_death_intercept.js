// kubejs/server_scripts/roles/31_death_intercept.js
// priority: 0

/**
 * Quand un joueur meurt, on peut envoyer une "intel" aux espions (si bug actif + proba).
 * API : EntityEvents.death("player", event => {...}) :contentReference[oaicite:9]{index=9}
 */
EntityEvents.death("player", (event) => {
  const dead = event.player;
  const server = event.server;
  if (!dead || !server) return;

  const spiesOnline = server.players.filter(spy => SpyRole.hasActiveBug(spy));

  for (const spy of spiesOnline) {
    if (!TeamUtils.areEnemies(spy, dead)) continue;

    const chance = SpyRole.getInterceptChance(spy);
    if (!RoleManager.roll(chance)) continue;

    spy.tell(ROLE_CONFIG.intelPrefix + `Décès ennemi détecté : §e${dead.username}§r.`);
  }
});
