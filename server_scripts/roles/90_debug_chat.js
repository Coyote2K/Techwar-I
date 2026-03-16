// kubejs/server_scripts/roles/90_debug_chat.js

function handleDebugMessage(event, rawMessage, player) {
  if (!player) return;

  var msg = String(rawMessage || "").trim();
  if (msg.length === 0) return;

  // Log console pour être sûr que ça passe quelque part
  console.log("[KJS DEBUG CHAT] reçu: " + msg + " (player=" + player.username + ")");

  if (msg.charAt(0) !== "!") return;

  // On tente d'empêcher l'envoi public (selon version, cancel() peut ne pas exister)
  try { event.cancel(); } catch (e0) {}

  var parts = msg.substring(1).split(/\s+/);
  var cmd = parts[0].toLowerCase();

if (cmd === "team_debug") {
  player.tell("§7[DEBUG] TeamUtils.getTeamId = " + global.TeamUtils.getTeamId(player));

  // ftbTeam / team éventuels
  player.tell("A une FTBTeam :" + global.TeamUtils.getTeamId(player) ? "yes" : "no")
  player.tell("§7[DEBUG] persistentData.ftb_team_id = " + (player.persistentData.ftb_team_id || "null"));
  player.tell("§7[DEBUG] persistentData.ftb_team_name = " + (player.persistentData.ftb_team_name || "null"));
  player.tell("§7[DEBUG] TeamUtils.getTeamId = " + global.TeamUtils.getTeamId(player));
  try { player.tell("§7- player.ftbTeam ? " + (player.ftbTeam ? "yes" : "no")); } catch (e1) {}
  try { player.tell("§7- player.team ? " + (player.team ? "yes" : "no")); } catch (e2) {}
  try { if (player.ftbTeam && player.ftbTeam.id) player.tell("§7- player.ftbTeam.id = " + player.ftbTeam.id); } catch (e3) {}
  try { if (player.team && player.team.id) player.tell("§7- player.team.id = " + player.team.id); } catch (e4) {}

  // scoreboard team vanilla
  try {
    var mp = player.minecraftPlayer;
    if (mp) {
      var t = mp.getTeam();
      player.tell("§7- vanilla scoreboard team ? " + (t ? "yes" : "no"));
      if (t) {
        if (t.getName) player.tell("§7- scoreboard.getName() = " + t.getName());
        if (t.getRegisteredName) player.tell("§7- scoreboard.getRegisteredName() = " + t.getRegisteredName());
      }
    } else {
      player.tell("§7- minecraftPlayer = null");
    }
  } catch (e5) {
    player.tell("§7- scoreboard read error");
  }

  return;
}


  if (cmd === "spy_rank") {
    var rank = Number(parts[1] || "1");
    player.tell("§7 Vous êtes maintenant spy de niveau " + JSON.stringify(rank));
    if (!(rank >= 1 && rank <= 3)) {
      player.tell("Usage: !spy_rank <1|2|3>");
      return;
    }
    global.SpyRole.grantRank(player, rank);
    player.tell("§7 Vous êtes maintenant spy de niveau " + JSON.stringify(rank));
    return;
  }

  if (cmd === "spy_bug") {
    global.SpyRole.activateBug(player);
    player.tell("§7 Bug activé")
    return;
  }

  if (cmd === "spy_info") {
    var d = global.RoleStorage.getRoleData(player, "spy");
    player.tell("§7[DEBUG] spy=" + JSON.stringify(d));
    return;
  }
  else {
  player.tell("§7[DEBUG] Commande inconnue. Ex: !team_debug, !spy_rank 2, !spy_bug, !spy_info");
  }
}

// Variante 1 : PlayerEvents.chat (si dispo)
try {
  PlayerEvents.chat(function (event) {
    handleDebugMessage(event, event.message, event.player);
  });
  console.log("[KJS DEBUG CHAT] Hook PlayerEvents.chat installé");
} catch (eA) {
  console.log("[KJS DEBUG CHAT] PlayerEvents.chat indisponible: " + eA);
}

// Variante 2 : PlayerEvents.message (souvent présent selon versions)
try {
    PlayerEvents.chat(function (event) {
    handleDebugMessage(event, event.message, event.player);
    });
    console.log("[KJS DEBUG CHAT] Hook PlayerEvents.chat installé");
} catch (eB) {
  console.log("[KJS DEBUG CHAT] PlayerEvents.message indisponible: " + eB);
}
