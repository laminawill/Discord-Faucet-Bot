//* Returns the Provider or throws an Error if not found
import { ethers } from 'ethers';
import { networks } from '../config/config.json';

// Define a cache object to store the provider instances
const providerCache = new Map<string, ethers.providers.JsonRpcProvider>();

const getProvider = async (networkName: string): Promise<ethers.providers.JsonRpcProvider> => {
	// Check if the provider is already in the cache
	if (providerCache.has(networkName)) {
		return providerCache.get(networkName)!;
	}

	let networkRpc: string | undefined;

	// Loop Over Every Network until the correct network is found
	for (const network of networks) {
		if (network.name === networkName) {
			networkRpc = network.RPC_URL;
			break;
		}
	}

	if (!networkRpc) {
		throw new Error('Network RPC Not Setup!');
	}

	// If not in cache, create a new provider instance and store it in the cache
	const provider = new ethers.providers.JsonRpcProvider(networkRpc);
	await provider.ready;

	// Store the provider in the cache
	providerCache.set(networkName, provider);
	return provider;
};

export default getProvider;
