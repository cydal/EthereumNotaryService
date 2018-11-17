const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 


    const name = "Awesome Star!";
    const story = "Test Story";
    const ra = "ra_000.555";
    const dec = "dec_111.666";
    const mag = "mag_222.777";


    const user1 = accounts[1];
    const user2 = accounts[2];

    let newStar;

    beforeEach(async function() { 
        const tokenId = 1;
        this.contract = await StarNotary.new({from: accounts[0]});

        newStar = (tokenId, user) => {
            this.contract.createStar(name, story, ra, dec, mag, tokenId, {from: user});
        };
    });

    describe('createStar / tokenIdToStarInfo', () => { 
        it('Can create a star', async function () { 
            
            const tokenId = 1;
            await newStar(tokenId, accounts[0]);
            
            it('it can get its data', async function() { 
                const tokenIdStar = await this.contract.tokenIdToStarInfo(tokenId);

                assert.equal(tokenIdStar[0].toString(), name);
                assert.equal(tokenIdStar[1].toString(), story);
                assert.equal(tokenIdStar[2].toString(), ra);
                assert.equal(tokenIdStar[3].toString(), dec);
                assert.equal(tokenIdStar[4].toString(), mag);
            });
        })

        it('Does not create duplicate star', async function () {
            const tokenId = 1;
            const otherTokenId = 2;

            await newStar(tokenId, accounts[0]);

            try {
                await newStar(otherTokenId, accounts[0]);
            } catch(err) {
                assert.ok(err);
            }
        })
    });

    describe('Check Star Exists', () => {
        const tokenId = 1;
        it('Star exists', async function () {
            await newStar(tokenId, accounts[0]);

            assert.equal(await this.contract.checkIfStarExist(ra, dec, mag), true);
        })
    });

    describe('Mint test', () => {

        let tx;
        const tokenId = 1;

        beforeEach(async function() {
            tx = await this.contract.mint(tokenId, {from: accounts[0]});
        })
        it('Token printed belongs to the right owner', async function () {
            var owner = await this.contract.ownerOf(tokenId, {from: accounts[0]});
            assert.equal(owner, accounts[0]);
        })
        it('emits event for transfer', () => {
            assert.equal(tx.logs[0].event, 'Transfer');
        })
    });


    describe('Check Owner Of', () => {
        const tokenId = 1;
        it('star has right owner', async function () {
            await newStar(tokenId, accounts[0]);
            const owner = await this.contract.ownerOf(tokenId, {from: accounts[0]});

            assert.equal(owner, accounts[0]);
        })
    });

    describe('putStarUpForSale / buyStar / starsForSale', () => { 

        const price = web3.toWei(.01, "ether");
        const tokenId = 1;

        beforeEach(async function () { 
            await newStar(tokenId, user1);
        })

        it('Account1 can put up star for sale', async function () { 
            await this.contract.putStarUpForSale(tokenId, price, {from: user1});

            assert.equal(await this.contract.ownerOf(tokenId), user1);
            assert.equal(await this.contract.starsForSale(tokenId), price);
        })

        describe('Account2 can purchase star put up for sale', () => { 

            const tokenId = 1;
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(tokenId, price, {from: user1});
            })

            it('Account2 owns bought star', async function() { 
                await this.contract.buyStar(tokenId, {from: user2, value: price, gasPrice: 0});
                assert.equal(await this.contract.ownerOf(tokenId), user2);
            })

            it('Account2 balance changes appropriately', async function () { 
                const overpaidAmount = web3.toWei(.05, 'ether');
                const balanceBeforeTransaction = web3.eth.getBalance(user2);
                await this.contract.buyStar(tokenId, {from: user2, value: overpaidAmount, gasPrice: 0});
                const balanceAfterTransaction = web3.eth.getBalance(user2);

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), price);
            })
        })
    });

    describe('approve / getApproved / check', () => {
        const tokenId = 1;
        let tx;

        beforeEach(async function() {
            await newStar(tokenId, accounts[0]);
            tx = await this.contract.approve(user1, tokenId, {from: accounts[0]});
        })

        it('account is approved', async function() {
            assert.equal(await this.contract.getApproved(tokenId, {from: accounts[0]}), accounts[1]);
        })

        it('emits Approval event', async function() {
            assert.equal(tx.logs[0].event, 'Approval');
        })
    });
    
    describe('SetApprovalForAll / isApprovedForAll', () => {
        const tokenId = 1;
        let approved = true;
        let tx

        beforeEach(async function() {
            await newStar(tokenId, accounts[0]);
            tx = await this.contract.setApprovalForAll(accounts[1], tokenId);
        })

        it('Operator approved', async function() {
            assert.equal(await this.contract.isApprovedForAll(accounts[0], accounts[1], {from: accounts[0]}), approved);
        })

        it('Emits ApprovalForAll', async function() {
            assert.equal(tx.logs[0].event, 'ApprovalForAll');
        })
    });

    describe('SafeTransfer check', () => {
        let tx;
        const tokenId = 1;

        beforeEach(async function() {
            await newStar(tokenId, accounts[0]);
            tx = await this.contract.safeTransferFrom(accounts[0], accounts[1], tokenId);
        })

        it('Is owner of the token', async function() {
            assert.equal(await this.contract.ownerOf(tokenId, {from: accounts[0]}), accounts[1]);
        })

        it('Not the owner of the token', async function() {
            assert.notEqual(await this.contract.ownerOf(tokenId, {from: accounts[0]}), accounts[0]);
        })

        it('Emits the Transfer event', async function() {
            assert.equal(tx.logs[0].event, 'Transfer');
        })
    })
});