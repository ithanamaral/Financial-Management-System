const prisma = require('./src/Data/databaseConnection')
const bcrypt = require('bcryptjs')

class Autenticator {
    
    async authentication(emailInput, passwordInput) {
    
       // Looking for user email in BD  
       const dbUser = await prisma.user.findUnique({ 
           where: { email: emailInput } 
       })
    
       if (!dbUser) 
        console.log("User not found!.")
    
      // Validate password: Verify there's this pass in DB
      const matchPassword = await bcrypt.compare(passwordInput, dbUser.password)
    
       if (!matchPassword) 
        console.log("Incorrect password.")
        
       return dbUser
    }

    emailValidation() {
       const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
       return regex.test(this.email)
    }
}

module.exports = Autenticator;