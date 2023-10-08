import { expect } from 'chai';
import { ethers } from 'ethers';
import getProvider from '../utils/getProvider';
import getBalance from '../utils/getBalance';

describe('getBalance function', () => {
    let provider: ethers.providers.JsonRpcProvider;

    beforeEach(async () => {
        // Set up your provider here; for example, using Infura:
        provider = await getProvider('Lamina1 Beta');
    });

    it('should return the balance as a string', async () => {
        const result = await getBalance(provider);

        console.log(`Fetched Balance: ${result} L1`);

        // As we're dealing with real network calls, we need to be more generic in our assertions
        expect(result).to.be.a('string');

        // Convert the result back to a BigNumber and check if it's non-negative
        const balance = ethers.utils.parseEther(result);
        expect(balance.gte(0)).to.be.true;
    });

    // Additional tests can go here
});