const { PrismaClient } = require('@prisma/client')

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const globalForPrisma = global

// Se já existir uma instância no global, usa-se ela. Se não, cria uma nova.
const prisma = globalForPrisma.prisma || prismaClientSingleton()

module.exports = prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}