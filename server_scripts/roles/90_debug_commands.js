// kubejs/server_scripts/roles/90_debug_commands.js

ServerEvents.basicCommand("spy_rank", function (event) {
  var p = event.player;
  if (!p) return;

  var args = String(event.input || "").trim().split(/\s+/);
  var rank = Number(args[0] || "1");
  if (!(rank >= 1 && rank <= 3)) {
    p.tell("Usage: /spy_rank <1|2|3>");
    return;
  }
  SpyRole.grantRank(p, rank);
});

ServerEvents.basicCommand("spy_bug", function (event) {
  var p = event.player;
  if (!p) return;
  SpyRole.activateBug(p);
});

ServerEvents.basicCommand("spy_info", function (event) {
  var p = event.player;
  if (!p) return;
  var d = RoleStorage.getRoleData(p, "spy");
  p.tell("§7[DEBUG] spy=" + JSON.stringify(d));
});

ServerEvents.basicCommand("team_debug", function (event) {
  var p = event.player;
  if (!p) return;

  p.tell("§7[DEBUG] TeamUtils.getTeamId = " + TeamUtils.getTeamId(p));

  // Affiche quelques candidats potentiels
  try { p.tell("§7- has player.ftbTeam? " + (p.ftbTeam ? "yes" : "no")); } catch (e1) {}
  try { p.tell("§7- has player.team? " + (p.team ? "yes" : "no")); } catch (e2) {}

  // On essaie d'afficher des ids si disponibles
  try { if (p.ftbTeam && p.ftbTeam.id) p.tell("§7- ftbTeam.id = " + p.ftbTeam.id); } catch (e3) {}
  try { if (p.team && p.team.id) p.tell("§7- team.id = " + p.team.id); } catch (e4) {}
});

ServerEvents.basicCommand("role_debug", function (event) {
var p = event.player;
p.tell("welcome");
try { r = rolesCompound.getCompound(roleId); } catch (e) { r = null; }
try { p.tell("§7- has player.team? " + (r ? "yes" : "no")); } catch (e2) {}
});
