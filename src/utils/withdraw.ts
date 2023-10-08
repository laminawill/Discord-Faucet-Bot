//* Returns a transaction object which can be used to claim an airdrop to the passed address
// Pass the network name if you don't want to use the 

import * as dotenv from "dotenv";
import {ethers} from "ethers";

import { TokenVesting } from "../types/ethers-contracts";
dotenv.config();

const withdraw = async (
	contract: TokenVesting,
	discordId: string
): Promise<ethers.providers.TransactionResponse> => {
	// Create Transaction object
	return (await contract.releaseAllDiscord(
		discordId
	)) as ethers.providers.TransactionResponse;
};

export default withdraw;
