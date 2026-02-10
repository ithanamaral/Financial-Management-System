class Wallet {
    constructor(userId, balance = 0) {
        this.userId = userId;
        this.balance = balance;
        this.transactions = [];
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.balance += transaction.amount;
    }

    getBalance() {
        return this.balance;
    }

    getTransactions() {
        return this.transactions;
    }
}

module.exports = Wallet;