import Paypal from '../Paypal.js';
import Client from '../Client.js'
const assert = require('assert');
import EthCrypto from 'eth-crypto';

describe('Apply Transactions', function () {
    let paypal = new Paypal()
    let Alice = new Client()
    let Bob = new Client()
    const mintTx = paypal.generateTx(Alice.wallet.address, 100, 'mint')  
    const sendTx = Alice.generateTx(Bob.wallet.address, 35, 'send')
    const badMintTx = Alice.generateTx(Alice.wallet.address, 100, 'mint')
    const badSigTx = {
        contents: mintTx.contents, 
        sig: Alice.sign(mintTx.contents)
    }
    const badSendTx = Alice.generateTx(Bob.wallet.address, 150, 'send')

    it('should properly apply "mint" transactions', function () {
        paypal.applyTransaction(mintTx)
        assert.deepEqual(paypal.state, {
            [Alice.wallet.address]: {
                balance: 100
            },
            [paypal.wallet.address]: {
                balance: 0
            }
        })
    });
    it('should properly apply "spend" transactions', function () {
        paypal.applyTransaction(sendTx)
        assert.deepEqual(paypal.state, {
            [Alice.wallet.address]: {
                balance: 65
            },
            [Bob.wallet.address]: {
                balance: 35
            },
            [paypal.wallet.address]: {
                balance: 0
            }
        })
    });
    it('should throw Error when trying to mint from non-Paypal address', function () {
        assert.throws(()=>{paypal.applyTransaction(badMintTx)}, Error)
    })
    it('should throw Error for invalid signatures', function () {
        assert.throws(()=>{paypal.applyTransaction(badSigTx)}, Error)
    })
    it('should throw Error for insufficient balance', function () {
        assert.throws(() => { paypal.applyTransaction(badSendTx)}, Error)
    })
})