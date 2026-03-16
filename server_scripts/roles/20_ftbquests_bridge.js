// kubejs/server_scripts/roles/20_ftbquests_bridge.js
// priority: 0

/**
 * Renseigne ici les IDs des quêtes FTB Quests.
 * Dans l’éditeur FTB Quests : clic droit sur la quête → "Copy ID". :contentReference[oaicite:4]{index=4}
 */
const QUEST_BECOME_SPY = "120F27DF6FBD475F";   // devenir espion (payer 200 œufs)
const QUEST_BUG_3_DAYS  = "666D74F259140414";  // activer mouchard 3 jours (payer 100 œufs)
const QUEST_SPY_RANK2   = "49AC2B1309B9597D";  // upgrade rang 2 (optionnel)
const QUEST_SPY_RANK3   = "0028D7F19FB05FC7";  // upgrade rang 3 (optionnel)

/**
 * Quand une quête précise est complétée, on déclenche la logique.
 * API : FTBQuestsEvents.completed('quest_id', event => {...}) :contentReference[oaicite:5]{index=5}
 */
FTBQuestsEvents.completed(QUEST_BECOME_SPY, (event) => {
  const p = event.player;
  p.tell("p pour spy 1");
  player.tell("player pour spy 1 ");
  if (!p) return;
  SpyRole.grantRank(p, 1);
});

FTBQuestsEvents.completed(event => {
  log("event" + event)
  log("On est rentrée dans lequette bug")
  const obj = event.getObject()
  log("On est rentrée dans lequette bug" + obj)
  if(obj == QUEST_BUG_3_DAYS){
    log("On est rentrée dans lequette bug" + QUEST_BUG_3_DAYS)
    return null
  }
  log("On est rentrée dans lequette bug")
  const p = event.player;
  if (!p) return;
  p.tell("§b HEHEHE Vous avez activé un Bug pour 3 jours")
  SpyRole.activateBug(p);
});

FTBQuestsEvents.completed(QUEST_SPY_RANK2, (event) => {
  const p = event.player;
  if (!p) return;
  SpyRole.grantRank(p, 2);
});

FTBQuestsEvents.completed(QUEST_SPY_RANK3, (event) => {
  const p = event.player;
  if (!p) return;
  SpyRole.grantRank(p, 3);
});
