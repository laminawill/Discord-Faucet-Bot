/*
* Get the Faucet Address balance of the Passed Network and token. If the token is not passed then the default native-currency is used
! ADMINS ONLY
If you change this, make sure to run `pnpm bot:deletecommands && pnpm bot:addcommands`
*/

import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

import {networks} from "../config/config.json";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("airdrop")
		.setDescription("Access Lamina1 Betanet airdrop")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addSubcommand(subcommand => subcommand
			.setName("balance")
			.setDescription("See all awarded airdrops")
			.addStringOption(option => {
				option.setName("network").setDescription("Select the network").setRequired(true);
	
				networks.forEach(network => {
					option.addChoices({
						name: `${network.name.toUpperCase()}`,
						value: `${network.name.toLowerCase()}`,
					});
				});
				return option;
			})
		)
		.addSubcommand(subcommand => subcommand
			.setName("claim")
			.setDescription("Register an L1 address to receive all your airdrops")
			.addStringOption(option => option
				.setName("address")
				.setDescription("Paste your L1 Hub Address")
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName("withdraw")
			.setDescription("Withdraw all vested tokens from all your airdrops"),
		),
};
