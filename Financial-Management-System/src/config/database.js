const { PrismaClient } = require('@prisma/client');

// Instância única do Prisma Client (Singleton)
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

module.exports = prisma;
