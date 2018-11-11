//https://ethereum.stackexchange.com/questions/729/how-to-concatenate-strings-in-solidity

const StarNotary = artifacts.require('StarNotary');


const newStar = (tokenId, user) => {
    await this.contract.createStar(
        'Awesome Star!', 
        "dec_140.899",
        "mag_122.333",
        "ra_002.309",
        "Story_test",
        tokenId, 
        {from: user}
    );
}


contract('StarNotary', accounts => { 

    beforeEach(async () => { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    describe('can create a star', () => { 
        it('can create a star and get its name', async () => { 
            const tokenId = 1;

            newStar(tokenId, accounts[0]);

            this.contract.tokenIdToStarInfo(tokenId).then(result => {
            assert.equal(result[0], "Awesome Star!");
            assert.equal(result[1], "dec_140.899");
            assert.equal(result[2], "mag_122.333");
            assert.equal(result[3], "ra_002.309");
            assert.equal(result[4], "Story_test");
            })  

        })

        it('Check for duplicate star creation', async () => {
           const tokenId = 1;

           newStar(tokenId, accounts[0]).then(result => {
               console.log("Created: " + result[1] + " " + result[2]);

               newStar(2, accounts[0]).catch(err => {
                   console.log("Duplicate Error");
                   assert.ok(err);
               });
           }).catch(err => { console.log(err) })
           
        })
    })

    describe('buying and selling stars', () => { 

        let user1 = accounts[1]
        let user2 = accounts[2]

        let starId = 1;
        let starPrice = web3.toWei(.01, "ether");

        beforeEach(async function () {
            newStar(starId, user1);
        })

        describe('user1 can sell a star', () => { 
            it('user1 can put up their star for sale', async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1});
            
                assert.equal(await this.contract.starsForSale(starId), starPrice);
            })

            it('user1 gets the funds after selling a star', async function () { 
                let starPrice = web3.toWei(.05, 'ether')
                
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

                let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
                await this.contract.buyStar(starId, {from: user2, value: starPrice})
                let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)

                assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), 
                            balanceOfUser1AfterTransaction.toNumber())
            })
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function () { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice})

                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 correctly has their balance changed', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')

                const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice:0})
                const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)

                assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice)
            })
        })

        describe("Test for if starexists", async () => {

            it("Returns true if star exists", () => {
               newStar(2, accounts[0]);

               const tx = await this.contract.checkStarExists("dec_140.899", "mag_122.333");
               assert.equal(tx.logs[0].event, "StarExists");
               assert.equal(tx.logs[0].args._status, true);
            })

            it("Returns false otherwise", () => {
                newStar(2, accounts[0]);
 
                const tx = await this.contract.checkStarExists("dec_111.000", "mag_222.111");
                assert.equal(tx.logs[0].event, "StarExists");
                assert.equal(tx.logs[0].args._status, false);
             })
        })
    })
})