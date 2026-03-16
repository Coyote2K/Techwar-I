// kubejs/server_scripts/roles/96_player_registry.js
// Registre persistant des joueurs (UUID -> infos) dans kubejs/data/player_registry.json
// Rhino-compatible, sans dépendre d’API "offline player".

// Chemin relatif à la racine du serveur/instance
var REG_PATH = "kubejs/data/player_registry.json";

function nowMs() {
  return Date.now();
}

function safeString(x) {
  try { return String(x); } catch (e) { return ""; }
}

function readFileText(path) {
  // Lecture fichier via Java NIO
  var Files = Java.type("java.nio.file.Files");
  var Paths = Java.type("java.nio.file.Paths");
  var StandardCharsets = Java.type("java.nio.charset.StandardCharsets");

  var p = Paths.get(path);
  if (!Files.exists(p)) return null;
  var bytes = Files.readAllBytes(p);
  return new java.lang.String(bytes, StandardCharsets.UTF_8);
}

function writeFileTextAtomic(path, text) {
  // Écriture atomique: write temp -> move
  var Files = Java.type("java.nio.file.Files");
  var Paths = Java.type("java.nio.file.Paths");
  var StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
  var StandardCopyOption = Java.type("java.nio.file.StandardCopyOption");

  // Assure le dossier kubejs/data
  var parentDir = Paths.get("kubejs/data");
  if (!Files.exists(parentDir)) Files.createDirectories(parentDir);

  var tmp = Paths.get(path + ".tmp");
  var dest = Paths.get(path);

  Files.write(tmp, text.getBytes(StandardCharsets.UTF_8));
  Files.move(tmp, dest, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
}

function loadRegistry() {
  var txt = null;
  try { txt = readFileText(REG_PATH); } catch (e1) { txt = null; }

  if (!txt || txt.trim().length === 0) {
    return { version: 1, players: {} };
  }

  try {
    var obj = JSON.parse(txt);
    if (!obj || typeof obj !== "object") return { version: 1, players: {} };
    if (!obj.players || typeof obj.players !== "object") obj.players = {};
    if (!obj.version) obj.version = 1;
    return obj;
  } catch (e2) {
    // Si JSON corrompu, on repart propre (tu peux garder une copie manuelle si besoin)
    return { version: 1, players: {} };
  }
}

function saveRegistry(reg) {
  var txt = JSON.stringify(reg, null, 2);
  writeFileTextAtomic(REG_PATH, txt);
}

function snapshotRoles(player) {
  // Snapshot minimal : espion
  var roles = {};

  try {
    var spy = global.RoleStorage.getRoleData(player, "spy");
    if (spy && (spy.rank || 0) > 0) {
      roles.spy = {
        rank: Number(spy.rank || 0),
        bugUntil: Number(spy.bugUntil || 0)
      };
    }
  } catch (e1) {}

  return roles;
}

function getTeamSnapshot(player) {
  // On s’appuie sur ton cache FTB Teams dans persistentData
  var teamId = null;
  var teamName = null;

  try {
    var pd = player.persistentData;
    // Selon ta version, le cache est stocké en string
    // On lit avec accès direct ; si tu as utilisé putString, ça marche aussi (KubeJS wrap).
    teamId = pd.ftb_team_id ? safeString(pd.ftb_team_id) : null;
    teamName = pd.ftb_team_name ? safeString(pd.ftb_team_name) : null;
  } catch (e1) {}

  // Fallback: TeamUtils (si jamais)
  if (!teamId) {
    try { teamId = safeString(global.TeamUtils.getTeamId(player)); } catch (e2) {}
  }

  return { teamId: teamId, teamName: teamName };
}

global.PlayerRegistry = {
  updateForPlayer: function (player) {
    if (!player) return;

    var uuid = null;
    try { uuid = safeString(player.uuid); } catch (e0) { uuid = null; }
    if (!uuid || uuid.length === 0) return;

    var reg = loadRegistry();

    var entry = reg.players[uuid];
    if (!entry || typeof entry !== "object") entry = {};

    entry.uuid = uuid;
    entry.name = safeString(player.username);

    var team = getTeamSnapshot(player);
    entry.teamId = team.teamId ? team.teamId : null;
    entry.teamName = team.teamName ? team.teamName : null;

    entry.roles = snapshotRoles(player);
    entry.lastSeen = nowMs();

    reg.players[uuid] = entry;

    saveRegistry(reg);
  },

  load: function () {
    return loadRegistry();
  }
};

// Mise à jour automatique à la connexion/déconnexion
PlayerEvents.loggedIn(function (event) {
  try { global.PlayerRegistry.updateForPlayer(event.player); } catch (e) {}
});

PlayerEvents.loggedOut(function (event) {
  try { global.PlayerRegistry.updateForPlayer(event.player); } catch (e) {}
});
