// kubejs/server_scripts/roles/97_team_roles_all_cmd.js
// Commande chat: !team_roles_all
// Affiche tous les joueurs déjà vus (registre JSON) appartenant à l’équipe FTB du joueur qui exécute.

function formatRolesSnapshot(rolesObj) {
  if (!rolesObj || typeof rolesObj !== "object") return "aucun";

  var parts = [];

  try {
    if (rolesObj.spy && (rolesObj.spy.rank || 0) > 0) {
      parts.push("spy:" + rolesObj.spy.rank);
    }
  } catch (e1) {}

  if (parts.length === 0) return "aucun";
  return parts.join(", ");
}

function isOnline(server, uuidStr) {
  try {
    var players = server.players;
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      if (!p) continue;
      try {
        var u = String(p.uuid);
        if (u === uuidStr) return true;
      } catch (e1) {}
    }
  } catch (e2) {}
  return false;
}

PlayerEvents.chat(function (event) {
  var p = event.player;
  if (!p) return;

  var msg = String(event.message || "").trim();
  if (msg !== "!team_roles_all") return;

  try { event.cancel(); } catch (e0) {}

  // On force une mise à jour de l’exécutant avant d’afficher
  try { global.PlayerRegistry.updateForPlayer(p); } catch (eU) {}

  var myTeam = null;
  try { myTeam = String(global.TeamUtils.getTeamId(p)); } catch (e1) { myTeam = null; }

  if (!myTeam || myTeam.length === 0) {
    p.tell("§c[TEAM ROLES]§r Impossible de déterminer ton équipe (teamId vide).");
    return;
  }

  var server = event.server;
  if (!server) {
    p.tell("§c[TEAM ROLES]§r Impossible d’accéder au serveur via l’événement.");
    return;
  }

  var reg = null;
  try { reg = global.PlayerRegistry.load(); } catch (e2) { reg = null; }
  if (!reg || !reg.players) {
    p.tell("§c[TEAM ROLES]§r Registre indisponible ou vide.");
    return;
  }

  p.tell("§6[TEAM ROLES]§r Joueurs connus dans l’équipe=" + myTeam);
  // Affichage explicite de l'exécutant ("toi") même si le registre est incomplet
try {
  var myRolesSnap = null;
  // Snapshot direct depuis persistentData (plus fiable que le registre)
  var spy = global.RoleStorage.getRoleData(p, "spy");
  var parts = [];
  if (spy && (spy.rank || 0) > 0) parts.push("spy:" + spy.rank);
  myRolesSnap = (parts.length > 0) ? parts.join(", ") : "aucun";

  p.tell("§b- TOI (" + p.username + ") §7→ §f" + myRolesSnap);
} catch (eMe) {
  p.tell("§b- TOI (" + p.username + ") §7→ §f(inaccessible)");
}


  var playersMap = reg.players;
  var count = 0;

  for (var uuid in playersMap) {
    var entry = playersMap[uuid];
    if (!entry) continue;

    // Filtre: même équipe que l’exécutant
    if (String(entry.teamId || "") !== String(myTeam)) continue;

    var roles = formatRolesSnapshot(entry.roles);
    var online = isOnline(server, String(uuid));
    var status = online ? "§aEN LIGNE§r" : "§8HORS LIGNE§r";

    var name = entry.name ? entry.name : uuid;
    p.tell("§7- §f" + name + " §7→ " + roles + " §7(" + status + "§7)");
    count++;
  }

  if (count === 0) {
    p.tell("§7Aucun joueur enregistré dans ton équipe (ou registre encore vide).");
    p.tell("§7Astuce : demande à tes coéquipiers de se connecter au moins une fois.");
  }
});
