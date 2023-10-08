//* Returns the contract address or throws an Error if not found
import getProvider from "./getProvider";
import {networks} from "../config/config.json";
import { TokenVesting } from "../types/ethers-contracts";
import {TokenVesting__factory} from "../types/ethers-contracts/factories/TokenVesting__factory";

// Define a cache object to store the contract instances
const contractCache = new Map<string, TokenVesting>();

const getContract = async (
    networkName: string,
): Promise<TokenVesting> => {
    // Check if the contract is already in the cache
    if (contractCache.has(networkName)) {
        return contractCache.get(networkName)!;
    }

    let address: string | undefined;
    for (const network of networks) {
        if (network.name === networkName) {
            address = network.contract;
            break;
        }
    }

    if (!address) {
        throw new Error(`Network contract not found for network name: ${networkName}`);
    }

    // If not in cache, create a new contract instance and store it in the cache
    const provider = await getProvider(networkName);
    const signer = provider.getSigner();
    const contract = new TokenVesting__factory(signer).attach(address);

    // Store the contract in the cache
    contractCache.set(networkName, contract);
    return contract;
};

export default getContract;
