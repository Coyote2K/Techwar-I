global.TeamUtils = {
getTeamId: function (player) {
  // 0) Cache FTB Teams (fiable et indépendant de minecraftPlayer)
  try {
    var pd = player.persistentData;
    if (pd && pd.ftb_team_id) return String(pd.ftb_team_id);
  } catch (e0) {}

  // 1) Tentatives directes (parfois dispo, parfois non)
  try { if (player.ftbTeam && player.ftbTeam.id) return String(player.ftbTeam.id); } catch (e1) {}
  try { if (player.team && player.team.id) return String(player.team.id); } catch (e2) {}

  // 2) Fallback
  return String(player.username);
}
,

  areEnemies: function (a, b) {
    return this.getTeamId(a) !== this.getTeamId(b);
  }
};
