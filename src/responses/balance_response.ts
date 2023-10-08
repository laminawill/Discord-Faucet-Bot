//* Returns the balance of the Faucet Account in native Currency or the token passed

import {type ChatInputCommandInteraction, type TextChannel} from "discord.js";

import {channels,primary} from "../config/config.json";
import getBalance from "../utils/getBalance";
import getContract from "../utils/getContract";
import getProvider from "../utils/getProvider";

export type UserFacingSchedule = {
	total: string;
	address: string;
	unlocked: string;
	locked: string;
	withdrawn: string;
	lockupStart: string;
	lockupEnd: string;
};

export default async (
	interaction: ChatInputCommandInteraction,
): Promise<void> => {
	// Initial Response to client
	await interaction.reply({content: "👩‍💻 Calculating....", ephemeral: true, fetchReply: true});

	try {
		// Get the Discord User ID and network name from the command
		const discordId = interaction.user.id;
		const networkOption = interaction.options.get("network");
		let networkName = networkOption?.value as string || primary;
		if (!networkName) {
			networkName = primary;
		}
		// Get the Provider based on the primary network
		const provider = await getProvider(networkName);
		const contract = await getContract(networkName);

		// Get all awarded airdrops
		const airdrops = await getBalance(provider, contract, discordId);
		if (airdrops.length === 0) {
			await interaction.editReply("❌ No airdrop found for your Discord handle");
			return;
		}
		let response = "";
		for (let i = 0; i < airdrops.length; i++) {
			response += "Airdrop " + i;
			response += "Total tokens: " + airdrops[i].total;
			response += "Address: " + airdrops[i].address;
			response += "Withdrawable tokens: " + airdrops[i].unlocked;
			response += "Withdrawn tokens: " + airdrops[i].withdrawn;
			response += "Vesting tokens: " + airdrops[i].locked;
			response += "Vest start: " + airdrops[i].lockupStart;
			response += "Vest end: " + airdrops[i].lockupEnd;
			if (i < airdrops.length) {
				response += "\n";
			}
		}

		// Printing the value out
		await interaction.editReply(response);
	} catch (error) {
		console.error(`Error [RESPONSE - BALANCE] : ${error}`);
		const errorchannel = interaction.client.channels.cache
			.get(channels.error) as TextChannel;
		await errorchannel.send(
			`[ERROR]\n${new Date(Date.now()).toUTCString()}\nGetting Balance\n${error}`,
		);
		await interaction.editReply("🙇‍♂️ Error, please try again later");
	}
};
