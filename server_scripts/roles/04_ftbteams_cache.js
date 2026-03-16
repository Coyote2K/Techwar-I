// kubejs/server_scripts/roles/04_ftbteams_cache.js
// Objectif : mémoriser l'équipe FTB Teams dans persistentData pour l'utiliser partout (même si minecraftPlayer=null).

function setTeamCache(player, teamObj) {
  try {
    var pd = player.persistentData;

    // On stocke un identifiant stable + un nom lisible
    // Selon versions, l'objet team expose souvent .id et .name
    var id = null;
    var name = null;

    try { if (teamObj && teamObj.id) id = String(teamObj.id); } catch (e1) {}
    try { if (teamObj && teamObj.name) name = String(teamObj.name); } catch (e2) {}

    // Fallback : si pas d'id, on stocke au moins le nom
    if (!id && name) id = name;

    pd.ftb_team_id = id ? id : null;
    pd.ftb_team_name = name ? name : null;
  } catch (e) {
    // pas de throw : on veut éviter de casser les scripts
  }
}

// Déclenché quand un joueur rejoint une party
FTBTeamsEvents.playerJoinedParty(function (event) {
  setTeamCache(event.player, event.currentTeam);

  // Debug optionnel
  try {
    event.player.tell("§7[DEBUG] Team cache set: " + (event.player.persistentData.ftb_team_id || "null"));
  } catch (e) {}
});

// Déclenché quand un joueur quitte une party
FTBTeamsEvents.playerLeftParty(function (event) {
  // Après un leave, currentTeam peut être la team perso ; on stocke quand même ce que l'event fournit
  setTeamCache(event.player, event.currentTeam);

  try {
    event.player.tell("§7[DEBUG] Team cache set: " + (event.player.persistentData.ftb_team_id || "null"));
  } catch (e) {}
});
