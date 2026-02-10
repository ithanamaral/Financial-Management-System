class Invoice { // Fatura
    constructor(id, userId, description, amount, dueDate, status = 'pending') {
        this.id = id;
        this.userId = userId;
        this.description = description;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
        this.createdAt = new Date();
    }

    getDetails() {
        return {
            id: this.id,
            description: this.description,
            amount: this.amount,
            dueDate: this.dueDate,
            status: this.status,
            createdAt: this.createdAt
        };
    }

    updateStatus(newStatus) {
        this.status = newStatus;
    }
}

module.exports = Invoice;