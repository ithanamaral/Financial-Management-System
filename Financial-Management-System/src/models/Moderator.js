const prisma = require('./src/Data/databaseConnection')

class Moderator{

    async addUser(name, email, password){
        //Verify there's already an email
        const userExist = await prisma.user.findUnique({ where: email })

        if(userExist)
            console.log("This email has already been registeresd")

        // Encrypting password in database
        let passwordHash = await bcrypt.hash(password, 10)

        try{
            const newUser = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: passwordHash, // Save hash, not password directly
                    role: Role.USER, // Define como user padrão
                    wallet: {
                        create: { balance: 0 } // Já cria uma carteira vazia junto
                    }
                }
            })
            console.log(`User ${newUser.name} with ID ${newUser.id} has been created successfully!`)

        }catch (error) {
            console.error("Error creating user:", error);
            return false;
        }
        
    }

    async deleteUser(id){
        // Check if the user exists
        const userExist = await prisma.user.findUnique({ where: id })

        if(!userExist)
            console.log("This user ID does not exist")

        try {
            const deletedUser = await prisma.user.delete({ where: id })

            console.log(`User ${deletedUser.name} - ID ${deletedUser.id} has been deleted successfully!`)

        } catch (error) {
            // The error code P2025 means "Record not found"
            if (error.code === 'P2025') {
                console.log("Error: This user does not exist, impossible to delete.")
            }
        }
    }

    async editUser(id){
        // Check if the user exists
        const userExist = await prisma.user.findUnique({ where: id })

        if(!userExist){
            console.log("This user ID does not exist")
        }

        try {
            const editedUser = await prisma.user.update({ 
                data: {
                    name:  this.name,
                    email: this.email,
                    cel:   this.cel
                }
            })

            console.log(`User ${editedUser.name} - ID ${editedUser.id} has been edited successfully!`)

            return editedUser

        } catch (error) {
            // The error code P2025 means "Record not found"
            if (error.code === 'P2025') {
                console.log("Error: This user does not exist, impossible to edit.")
            }
        }
    }
}

module.exports = Moderator;