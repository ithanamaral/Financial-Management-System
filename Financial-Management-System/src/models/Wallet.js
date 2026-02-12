class Wallet {
    constructor(userId, balance = 0) {
        this.userId = userId
        this.balance = balance
        this.transactions = []
    }
}

module.exports = Wallet;