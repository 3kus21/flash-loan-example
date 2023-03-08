const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens;
const MAX_TOKENS = ether(1000000);

describe('FlashLoan', () => {
    let token, flashLoan, flashLoanReceiver, deployer;

    beforeEach(async () => {
        [deployer] = await ethers.getSigners();

        const FlashLoan = await ethers.getContractFactory('FlashLoan');
        const FlashLoanReceiver = await ethers.getContractFactory('FlashLoanReceiver');
        const Token = await ethers.getContractFactory('Token');

        token = await Token.deploy('Drikkie Coin', 'DCN', '1000000');
        flashLoan = await FlashLoan.deploy(token.address);
        flashLoanReceiver = await FlashLoanReceiver.deploy(flashLoan.address);

        let transaction = await token.connect(deployer).approve(flashLoan.address, MAX_TOKENS)
        await transaction.wait();
        transaction = await flashLoan.connect(deployer).depositTokens(MAX_TOKENS);
        await transaction.wait();
    });

    describe('Deployment', () => {
        it('Set balance to max tokens', async () => {
            expect(await token.balanceOf(flashLoan.address)).to.equal(MAX_TOKENS);
        });
        it('Should fail if you try to deposit 0 tokens', async () => {
            await expect(flashLoan.connect(deployer).depositTokens(ether(0))).to.be.revertedWith("Must deposit at least on token");
        })
    });

    describe('Borrowing funds', async () => {
        it('borrows funds from the pool', async () => {
            let amount = ether(100);
            let transaction = await flashLoanReceiver.connect(deployer).executeFlashLoan(amount);
            await transaction.wait();
            await expect(transaction).to.emit(flashLoanReceiver, 'LoanReceived').withArgs(token.address, amount);
        })
    })
})
