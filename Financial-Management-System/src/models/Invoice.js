class Invoice { // Fatura
    constructor(id, userId, description, amount, dueDate, status = 'pending') {
        this.id = id
        this.userId = userId
        this.description = description
        this.amount = amount
        this.dueDate = dueDate
        this.status = status
        this.createdAt = new Date()
    }
}

module.exports = Invoice