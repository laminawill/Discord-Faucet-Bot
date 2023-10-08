//* Handles Rate Limiting

// Returns undefined if there is no limit, returns an integer in seconds if there is a limit being applied
import { stats } from "../config/config.json";

const { bypassRoles } = require("../config/config.json");

// Helper function to check for bypass roles
const hasBypassRole = interaction => bypassRoles.some(role => !interaction.member.roles.cache.has(role));

// Keyv Implementation
const handleKeyv = async (interaction, network, nonce, keyv, isSetting) => {
  const key = nonce ? `${network}` : `${interaction.user.id}:${network}`;
  const lastReqTime = await keyv.get(key);
  const limit = nonce ? stats.globalCoolDown : stats.coolDownTime;
  
  if (!isSetting && lastReqTime && Date.now() - lastReqTime < limit) {
    return lastReqTime;
  }
  
  if (isSetting) keyv.set(key, Date.now());
};

export const getTimer = async (interaction, network, nonce = false, keyv) => {
  if (!hasBypassRole(interaction)) {
    if (stats.database.toLowerCase() === "keyv") {
      return await handleKeyv(interaction, network, nonce, keyv, false);
    }
  }
};

export const setTimer = async (interaction, network, nonce = false, keyv) => {
  if (!hasBypassRole(interaction)) {
    if (stats.database.toLowerCase() === "keyv") {
      handleKeyv(interaction, network, nonce, keyv, true);
    }
  }
};
