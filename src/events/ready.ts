// Log Printing and setting Discord Presence when the BOT wakes

import {ActivityType, type TextChannel} from "discord.js";

import {type ExtendedClient} from "../classes/ExtendedClient";
import {channels} from "../config/config.json";

module.exports = {
	name: "ready",
	once: true,
	async execute(client: ExtendedClient) {
		try {
			// Check if client.user is not null
			if (client.user) {
				// Setting Status of Bot
				client.user.setActivity("Building the metaverse", {
					type: ActivityType.Watching,
				});
				client.user.setStatus("online");
	
				// Morning Print of Waking Up
				const logchannel = client.channels.cache.get(channels.log) as TextChannel;
				logchannel.send(
					`[LOGIN/RESTART]\n${new Date(Date.now()).toUTCString()}\nFaucet Bot Woken`,
				);
	
				console.log(`Ready! Logged in as ${client.user.tag}`);
			} else {
				console.error("client.user is null");
			}
		} catch (error) {
			console.error(`Error Starting BOT in ready : ${error}`);
			const errorchannel = client.channels.cache.get(channels.error) as TextChannel;
			errorchannel.send(
				`[ERROR]\n${new Date(Date.now()).toUTCString()}\nWaking BOT\n${error}`,
			);
		}
	},
};
