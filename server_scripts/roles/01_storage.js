// kubejs/server_scripts/roles/01_storage.js
// Stockage NBT-compatible (OrderedCompoundTag) pour KubeJS 6 / Rhino

function getOrCreateCompound(parent, key) {
  // parent: CompoundTag
  // key: string
  var c = null;

  try { c = parent.getCompound(key); } catch (e1) { c = null; }

  // Selon impl, getCompound peut renvoyer un compound "vide" même si absent.
  // On force l'existence via putCompound.
  try {
    if (!c) {
      c = parent.putCompound(key);
    } else {
      // si absent, certains renvoient un compound vide mais non attaché
      // on le rattache quand même
      parent.put(key, c);
    }
  } catch (e2) {
    // fallback : essayer putCompound directement
    try { c = parent.putCompound(key); } catch (e3) {}
  }

  return parent.getCompound(key);
}

function ensureRoot(player) {
  var pd = player.persistentData;           // CompoundTag
  var root = getOrCreateCompound(pd, "roleSystem");
  var roles = getOrCreateCompound(root, "roles");
  return { root: root, roles: roles };
}

function readRole(rolesCompound, roleId) {
  var r = null;
  try { r = rolesCompound.getCompound(roleId); } catch (e) { r = null; }
  if (!r) return null;

  var out = {};
  try { out.rank = Number(r.getInt("rank")); } catch (e1) { out.rank = 0; }
  try { out.bugUntil = Number(r.getLong("bugUntil")); } catch (e2) { out.bugUntil = 0; }

  return out;
}

function writeRole(rolesCompound, roleId, data) {
  var r = getOrCreateCompound(rolesCompound, roleId);

  // Sécurités types (NBT veut int/long)
  var rank = (data && data.rank != null) ? Number(data.rank) : 0;
  var bugUntil = (data && data.bugUntil != null) ? Number(data.bugUntil) : 0;

  try { r.putInt("rank", rank | 0); } catch (e1) {}
  // bugUntil peut dépasser int32, donc long
  try { r.putLong("bugUntil", bugUntil); } catch (e2) {}

  // rattacher au parent
  try { rolesCompound.put(roleId, r); } catch (e3) {}
}

global.RoleStorage = {
  getRoleData: function (player, roleId) {
    var env = ensureRoot(player);
    return readRole(env.roles, String(roleId));
  },

  setRoleData: function (player, roleId, data) {
    var env = ensureRoot(player);
    writeRole(env.roles, String(roleId), data);
  },

  ensureRoleData: function (player, roleId, defaults) {
    var id = String(roleId);
    var cur = this.getRoleData(player, id);
    if (cur) return cur;

    // écrire defaults
    var d = {
      rank: defaults && defaults.rank != null ? defaults.rank : 0,
      bugUntil: defaults && defaults.bugUntil != null ? defaults.bugUntil : 0
    };
    this.setRoleData(player, id, d);
    return d;
  }
};
