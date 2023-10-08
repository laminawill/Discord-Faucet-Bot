//* Returns a string of the balance.
// If passed tokenName and networkName, then the interaction is considered as an ERC20, else it's considered native.

import {ethers} from "ethers";

import {type UserFacingSchedule} from "../responses/balance_response";
import {type TokenVesting} from "../types/ethers-contracts/TokenVesting.js";

const getBalance = async (
	provider: ethers.providers.JsonRpcProvider,
	contract: TokenVesting,
	discordId: string,
): Promise<UserFacingSchedule[]> => {
	const discordIdBn: ethers.BigNumber = ethers.BigNumber.from(discordId);
	const address = await contract.getAddressByDiscord(discordIdBn);
	const currentBlock = await provider.getBlockNumber();
	const blockTimestamp = (await provider.getBlock(currentBlock)).timestamp;

	// Get number of vesting schedules user has
	const airdropCount: ethers.BigNumber
		= await contract.getSchedulesCountByDiscord(discordIdBn);

	// Loop through all schedules
	const schedules: Array<Promise<TokenVesting.ScheduleStruct>> = [];
	for (let i = 0; i < airdropCount.toNumber(); i++) {
		// Get scheduleID
		schedules.push(contract.getScheduleByDiscordAndIndex(discordIdBn, i));
	}

	const allSchedules: TokenVesting.ScheduleStruct[] = await Promise.all(schedules);

	// Convert to string
	const userSchedules: UserFacingSchedule[] = [];
	for (let i = 0; i < airdropCount.toNumber(); i++) {
		userSchedules.push(formatVestingScheduleForUser(address, blockTimestamp, allSchedules[i]));
	}

	return userSchedules;
};

export default getBalance;

function formatVestingScheduleForUser(
	beneficiary: string,
	timestamp: number,
	schedule: TokenVesting.ScheduleStruct): UserFacingSchedule {
	const total = ethers.utils.formatEther(schedule.vesting.amountTotal);
	let address = "Unclaimed";
	if (schedule.vesting.revoked) {
		address = "Revoked";
	} else if (beneficiary !== "0x0000000000000000000000000000000000000000") {
		address = beneficiary;
	}

	let unlockedAmount: ethers.BigNumber;
	const currentTime = ethers.BigNumber.from(timestamp);
	if ((currentTime.lt(schedule.airdrop.cliff)) || schedule.vesting.revocable) {
		unlockedAmount = ethers.BigNumber.from(0);
	} else if (currentTime
		.gte(ethers.BigNumber.from(schedule.airdrop.start).add(schedule.airdrop.duration))) {
		unlockedAmount = ethers.BigNumber.from(schedule.vesting.amountTotal)
			.sub(schedule.vesting.released);
	} else {
		// Compute the number of full vesting periods that have elapsed.
		const timeFromStart = currentTime.sub(schedule.airdrop.start);
		const vestedSlicePeriods = timeFromStart.div(schedule.airdrop.slicePeriodSeconds);
		const vestedSeconds = vestedSlicePeriods.mul(schedule.airdrop.slicePeriodSeconds);
		// Compute the amount of tokens that are vested.
		const vestedAmount = ethers.BigNumber.from(schedule.vesting.amountTotal)
			.mul(vestedSeconds)
			.div(schedule.airdrop.duration);
		// Subtract the amount already released and return.
		unlockedAmount = vestedAmount.sub(schedule.vesting.released);
	}

	const unlocked = ethers.utils.formatEther(unlockedAmount);
	const lockedAmount = ethers.utils.formatEther((schedule.vesting.amountTotal as ethers.BigNumber).sub(schedule.vesting.released));
	const withdrawn = ethers.utils.formatEther(schedule.vesting.released);
	const lockupStart = new Date((schedule.airdrop.start as ethers.BigNumber)
		.mul(1000).toLocaleString())
		.toLocaleString();
	const lockupEnd = new Date((schedule.airdrop.start as ethers.BigNumber)
		.add(schedule.airdrop.duration)
		.mul(1000).toLocaleString())
		.toLocaleString();

	return {
		total: `${total} L1`,
		address,
		unlocked: `${unlocked} L1`,
		locked: `${lockedAmount} L1`,
		withdrawn: `${withdrawn} L1`,
		lockupStart,
		lockupEnd,
	};
}
