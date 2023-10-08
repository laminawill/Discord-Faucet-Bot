//* Transfers the set dailyEth value to the requested user.

import {type ChatInputCommandInteraction, EmbedBuilder, type TextChannel} from "discord.js";
import {ethers} from "ethers";
import type Keyv from "keyv";

import {channels,primary, stats} from "../config/config.json";
import getContract from "../utils/getContract";
//import getProvider from "../utils/getProvider";
import withdraw from "../utils/withdraw";

const getTxName = require("../utils/getTxName");
const {getTimer, setTimer} = require("../utils/handleRateLimiting");

module.exports = async (
	keyv: Keyv, 
	interaction: ChatInputCommandInteraction
): Promise<void> => {
	// Initial Response to client
	await interaction.reply({content: "🤖 Connecting....", 
		fetchReply: true, ephemeral: true});

	try {
		// Setup the log channel
		const logchannel = interaction.client.channels.cache
			.get(channels.log) as TextChannel;

		// Get the Network and address from user input
		const userAddress = interaction.options.getString("address");
		let networkName = interaction.options.getString("network");

		if (userAddress) {
			if (!networkName) {
				networkName = primary;
			}
			const contract = await getContract(networkName);
			// Check whether address is valid
			if (!ethers.utils.isAddress(userAddress)) {
				await interaction.editReply("😤 Please enter a valid Lamina1 Hub address");
				return;
			}

			// Get the Provider based on the network
			//const provider = await getProvider(networkName);

			// Rate Limiting for nonce
			const nonceLimit = await getTimer(interaction, networkName, true, keyv) as
				| number
				| undefined;
			if (nonceLimit) {
				const timeLeft = Math.floor(
					(stats.globalCoolDown - (Date.now() - nonceLimit)) / 1000,
				);
				await interaction.editReply(
					`🔥 Bot receiving heavy traffic, please wait ${timeLeft} seconds before requesting`,
				);
				return;
			}

			// Rate Limiting for non Admins
			const limit = (await getTimer(interaction, networkName, false, keyv)) as
				| number
				| undefined;
			if (limit) {
				const timeLeft = Math.floor((stats.coolDownTime - (Date.now() - limit)) / 1000);
				await interaction.editReply(`⏳ Please wait ${timeLeft} seconds before using bot`);
				return;
			}

			await setTimer(interaction, networkName, true, keyv);

			// Transaction
			const tx = await withdraw(contract, interaction.user.id) ;
			const string = await getTxName(networkName);
			const embed = new EmbedBuilder()
				.setColor("#3BA55C")
				.setDescription(`[View Transaction](${string}${tx.hash})`);
			await interaction.editReply({
				content: "👨‍🏭 Working Hard, please wait...",
				embeds: [embed],
			});
			await tx.wait();
			await setTimer(interaction, networkName, false, keyv);
			

			logchannel.send(
				`[WITHDRAW]\n${new Date(
					Date.now(),
				).toUTCString()}\nNetwork : ${networkName.toUpperCase()}\nBy : ${
					interaction.user.username
				}\nTo : ${userAddress}`,
			);
		} else {
			console.error(`Error [RESPONSE - WITHDRAW] : No address provided`);
			const errorchannel = interaction.client.channels.cache
				.get(channels.error) as TextChannel;
			await errorchannel.send(
				`[ERROR]\n${new Date(Date.now()).toUTCString()}\nWithdraw - No address provided\n`,
			);
			await interaction.editReply("🙇‍♂️ Error, please try again later");
		}
		

		await interaction.editReply("🙌 Withdrawal Successful!");
	} catch (error) {
		console.error(`Error Withdrawing : ${error}`);
		const errorchannel = interaction.client.channels.cache.get(channels.error) as TextChannel;
		errorchannel.send(`[ERROR]\n${new Date(Date.now()).toUTCString()}\nWithdrawing\n${error}`);
		await interaction.editReply("🙇‍♂️ Error : Please try again in few minutes");
	}
};
