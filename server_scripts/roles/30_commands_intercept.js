// kubejs/server_scripts/roles/30_commands_intercept.js
// priority: 0

/**
 * Interception des commandes privées.
 *
 * CommandEvent (cancellable) : déclenché quand une commande est exécutée. :contentReference[oaicite:7]{index=7}
 * Ici, on lit event.input (texte brut tapé).
 *
 * IMPORTANT : tu as indiqué que tout le monde a "consenti" à l’écoute /msg,
 * donc on ne gère pas la partie légale/éthique : on applique juste la logique de jeu.
 */

function notifySpiesAboutMsg(event, fromPlayer, toName, message) {
  const server = event.server;
  if (!server) return;

  // Liste des espions en ligne
  const spiesOnline = server.players.filter(spy =>
    SpyRole.hasActiveBug(spy) && SpyRole.canInterceptMsg(spy)
  );

  for (const spy of spiesOnline) {
    // Filtre "ennemi" : à ce stade, on compare équipe de l’espion vs équipe de l’émetteur.
    // (Tu peux raffiner : comparer aussi équipe du destinataire si tu résous toName -> player)
    if (!TeamUtils.areEnemies(spy, fromPlayer)) continue;

    const chance = SpyRole.getInterceptChance(spy);
    if (!RoleManager.roll(chance)) continue;

    spy.tell(
      ROLE_CONFIG.intelPrefix +
      `Interception /msg : §e${fromPlayer.username}§r -> §e${toName}§r : "${message}"`
    );
  }
}

// /msg <joueur> <message...>
ServerEvents.command("msg", (event) => {
  const p = event.player;
  if (!p) return;

  const input = String(event.input || "").trim(); // ex: "msg Bob salut"
  const parts = input.split(/\s+/);
  if (parts.length < 3) return;

  const toName = parts[1];
  const message = parts.slice(2).join(" ");

  notifySpiesAboutMsg(event, p, toName, message);
});

// /tell <joueur> <message...>
ServerEvents.command("tell", (event) => {
  const p = event.player;
  if (!p) return;

  const input = String(event.input || "").trim();
  const parts = input.split(/\s+/);
  if (parts.length < 3) return;

  const toName = parts[1];
  const message = parts.slice(2).join(" ");

  notifySpiesAboutMsg(event, p, toName, message);
});

// /w <joueur> <message...>
ServerEvents.command("w", (event) => {
  const p = event.player;
  if (!p) return;

  const input = String(event.input || "").trim();
  const parts = input.split(/\s+/);
  if (parts.length < 3) return;

  const toName = parts[1];
  const message = parts.slice(2).join(" ");

  notifySpiesAboutMsg(event, p, toName, message);
});
