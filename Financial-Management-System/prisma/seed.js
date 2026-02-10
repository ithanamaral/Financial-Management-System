const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {

  await prisma.shopping.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('Database limpo.')

  // --- USUÁRIO 1: SAMUEL ---
  const samuel = await prisma.user.create({
    data: {
      name: 'Samuel Silva',
      email: 'samuel.silva@exemplo.com',
      password: '123', 
      cpf: '123.456.789-00',
      telefone: '(11) 99999-8888',
      role: 'ADMIN',
      
      wallet: {
        create: { balance: 5000.50 }
      },
      shoppings: {
        create: [
          { description: 'Teclado Mecânico', category: 'Eletrônicos', value: 250.00, date: new Date(), store: 'Kabum', status: 'Concluído' },
          { description: 'Monitor Gamer', category: 'Trabalho', value: 1200.99, date: new Date('2023-12-25'), store: 'Terabyte Shop', status: 'Concluído' },
          { description: 'Almoço Executivo', category: 'Alimentação', value: 45.90, date: new Date(), store: 'Restaurante Silva', status: 'Concluído' }
        ]
      },
      invoices: {
        create: [
          { description: 'Cartão Nubank', amount: 850.75, dueDate: new Date('2024-05-10'), status: 'PENDING' },
          { description: 'Conta de Luz', amount: 120.00, dueDate: new Date('2024-05-15'), status: 'PENDING' }
        ]
      }
    },
    include: { wallet: true, shoppings: true, invoices: true }
  })
  console.log(`Created User: ${samuel.name} (${samuel.role})`)

  // --- USUÁRIO 2: MARIA ---
  const maria = await prisma.user.create({
    data: {
      name: 'Maria Souza',
      email: 'maria.souza@exemplo.com',
      password: '123',
      cpf: '987.654.321-11',
      role: 'USER', 

      wallet: {
        create: { balance: 150.25 }
      },
      shoppings: {
        create: [
          { description: 'Supermercado Mensal', category: 'Casa', value: 600.00, date: new Date('2024-01-10'), store: 'Carrefour', status: 'Concluído' },
          { description: 'Farmácia', category: 'Saúde', value: 85.50, date: new Date('2024-01-15'), store: 'Drogasil', status: 'Concluído' }
        ]
      },
      invoices: {
        create: [
          { description: 'Empréstimo Pessoal', amount: 1500.00, dueDate: new Date('2023-12-01'), status: 'OVERDUE' },
          { description: 'Internet Fibra', amount: 100.00, dueDate: new Date('2024-01-05'), status: 'PAID' }
        ]
      }
    }
  })
  console.log(`Created User: ${maria.name} (${maria.role})`)

  // --- USUÁRIO 3: CARLOS ---
  const carlos = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@exemplo.com',
      password: '123',
      role: 'USER',

      wallet: {
        create: { balance: 25000.00 } 
      },
      shoppings: {
        create: [
          // ADICIONADO: store e status
          { description: 'Macbook Pro', category: 'Trabalho', value: 12000.00, date: new Date('2024-02-01'), store: 'Apple Store', status: 'Concluído' },
          { description: 'Cadeira Herman Miller', category: 'Conforto', value: 8000.00, date: new Date('2024-02-02'), store: 'Herman Miller', status: 'Concluído' },
          { description: 'Spotify Premium', category: 'Assinatura', value: 21.90, date: new Date(), store: 'Spotify', status: 'Concluído' }
        ]
      },
      invoices: {
        create: [
          { description: 'Cartão Black', amount: 5000.00, dueDate: new Date('2024-01-10'), status: 'PAID' },
          { description: 'Seguro do Carro', amount: 3000.00, dueDate: new Date('2024-02-15'), status: 'PENDING' }
        ]
      }
    }
  })
  console.log(`Created User: ${carlos.name} (${carlos.role})`)

  console.log('Seeding was finished!')
}

main()
  .catch(e => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })