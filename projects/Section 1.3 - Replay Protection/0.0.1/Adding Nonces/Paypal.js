import EthCrypto from 'eth-crypto'
import Client from './Client.js'

class Paypal extends Client {
    constructor() {
        super()
        this.state = {
            [this.wallet.address]: {
                balance: 0,
                nonce: 0
            }
        }
        this.transactions = []
    }

    applyTransaction(tx) {
        // verify the signature
        const validSig = this.verify(
            tx.sig,
            this.toHash(tx.contents),
            tx.contents.from
        )
        if (!validSig) {
            throw new Error('Invalid signature!')
        }
        // Check that the nonce is correct for replay protection
        if (tx.contents.nonce !== this.state[tx.contents.from].nonce) {
            return
        }
        // If we don't have a record for this address, create one
        if (!(tx.contents.to in this.state)) {
            this.state[tx.contents.to] = {
                balance: 0,
                nonce: 0
            }
        }
        // Mint coins **only if identity is PayPal**
        if (tx.contents.type === 'mint') {
            if (tx.contents.from !== this.wallet.address) {
                throw new Error('Non-Paypal Clients can\'t mint!')
            }
            this.state[tx.contents.to].balance += tx.contents.amount
        } else if (tx.contents.type === 'send') { // Send coins
            if (this.state[tx.contents.from].balance - tx.contents.amount < 0) {
                throw new Error('Not enough money!')
            }
            this.state[tx.contents.from].balance -= tx.contents.amount
            this.state[tx.contents.to].balance += tx.contents.amount
        }
        this.state[tx.contents.from].nonce++       
    }
}

export default Paypal;