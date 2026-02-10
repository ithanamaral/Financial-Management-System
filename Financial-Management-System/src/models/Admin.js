const prisma = require('./src/Data/databaseConnection')
const { authenticatable, moderable } = require('./Behaviors');

class Admin {
    constructor(id, name, email) {
        this.id = id
        this.name = name
        this.email = email
        // Inherits the methods of the behavior class --> Used as interface "Prefer composition over inheritance"
        Object.assign(this, authenticatable, reportable, moderable)
    }
}

module.exports = Admin