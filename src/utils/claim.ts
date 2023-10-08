//* Returns a transaction object which can be used to claim an airdrop to the passed address
// Pass the network name if you don't want to use the 

import * as dotenv from "dotenv";
import {ethers} from "ethers";

import { TokenVesting } from "../types/ethers-contracts";
dotenv.config();

const claim = async (
	contract: TokenVesting,
	usrAddress: string,
	discordId: string
): Promise<ethers.providers.TransactionResponse> => {
	// Create Transaction object
	return (await contract.claimDiscord(
		discordId,
		usrAddress
	)) as ethers.providers.TransactionResponse;
};

export default claim;