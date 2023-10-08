//* Handles all kinds of interactions
// Add all new commands build to here

import {type Interaction, type TextChannel} from "discord.js";
import type Keyv from "keyv";

import {type ExtendedClient} from "../classes/ExtendedClient";
import {channels} from "../config/config.json";
import balanceResponse from "../responses/balance_response";

module.exports = {
	name: "interactionCreate",
	async execute(keyv: Keyv, client: ExtendedClient, interaction: Interaction) {
		const formatDate = (): string => new Date(Date.now()).toUTCString();
		const errorChannel = client.channels.cache.get(channels.error) as TextChannel;
		
		try {
			console.log("Command called");
			// Chat Command Interactions
			if (interaction.isChatInputCommand()) {
				if (interaction.commandName === "airdrop") {
					if (interaction.options.getSubcommand() === "balance") {
						console.log("Airdrop Balance called");
						await balanceResponse(interaction);
					}
					
				} else {
					// Invalid Chat command passed
					await interaction.reply({
						content: "👀 This Command does not exist!",
						ephemeral: true,
					});
					await errorChannel.send(
						`[ERROR]\n${formatDate()}\nInvalid Chat Command Passed\nBy: ${interaction.user.username}`,
					);
				}
			} else {
				// Different kind of interaction
				await errorChannel.send(
					`[ERROR]\n${formatDate()}\nInvalid Chat Command Passed\nBy: ${interaction.user.username}`,
				);
			}
		} catch (error) {
			console.error(`Error Handling Interaction: ${error}`);
			await errorChannel.send(
				`[ERROR]\n${formatDate()}\nInteraction Handling\n${error}`,
			);
		}
	},
};
