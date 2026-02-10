const { Role } = require('@prisma/client')

class User {

    constructor(id, cpf, name, email, password, telefone, role, shopping, wallet, invoices) {
        this.id = id
        this.cpf = cpf
        this.name = name
        this.email = email
        this.password = password
        this.telefone = telefone
        this.role = role  
        this.shopping = shopping || [];
        this.wallet = wallet || { balance: 0, currency: 'BRL' };
        this.invoices = invoices  

        Object.assign(this, authenticatable)
    }

    isAdmin() {
        return this.role === Role.ADMIN
    }

    getUser(){
        
    }

}