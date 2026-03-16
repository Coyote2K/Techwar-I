// kubejs/server_scripts/roles/02_role_base.js
// priority: 0

/**
 * RoleBase : "contrat" (interface) d’un rôle.
 * Ce n’est pas une vraie classe JS obligatoire, mais un modèle de structure commun.
 *
 * Un rôle doit pouvoir :
 * - initialiser ses données (defaults)
 * - monter de rang (grantRank)
 * - exposer des capacités (ex: proba d’interception)
 */
global.RoleBase = {
  id: "base",

  defaults() {
    return {};
  },

  grantRank(player, rank) {
    // à surcharger
  }
};
