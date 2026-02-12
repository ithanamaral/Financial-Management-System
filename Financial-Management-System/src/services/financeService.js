const prisma = require('../config/database')

class FinanceService {
  /**
   * Busca o resumo financeiro do usuário
   * @param {number} userId 
   * @returns {Promise<Object>} Resumo financeiro
   */
  async getFinancialSummary(userId) {

    const today = new Date()
    const beginningMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

    const [wallet, monthPaidShopping, monthPaidInvoices, pendingInvoice, subscriptionsCount, lastShopping, lastInvoices] = await Promise.all([
      
      // Saldo da Carteira
      prisma.wallet.findUnique({
        where: { userId: userId }
      }),

      // Compras PAGAS do Mês 
      prisma.shopping.aggregate({
        _sum: { value: true },
        where: {
          userId: userId,
          status: 'PAGO',
          date: {
            gte: beginningMonth,
            lte: endMonth
          }
        }
      }),

      // Faturas PAGAS no Mês 
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          userId: userId,
          status: { in: ['PAID', 'OVERDUE'] },
          dueDate: {
            gte: beginningMonth,
            lte: endMonth
          }
        }
      }),

      // Faturas Pendentes
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          userId: userId,
          status: 'PENDING'
        }
      }),

      // Assinaturas 
      prisma.shopping.count({
        where: { 
          userId: userId,
          category: {
            in: ['Assinatura', 'assinatura']
          }
        }
      }),

      // Movimentações Recentes - Compras
      prisma.shopping.findMany({
        where: { userId: userId },
        orderBy: { date: 'desc' },
        take: 10
      }),

      // Movimentações Recentes - Faturas
      prisma.invoice.findMany({
        where: { userId: userId },
        orderBy: { dueDate: 'desc' },
        take: 10
      })
    ])

    // Soma total: Compras Pagas + Faturas Pagas no mês
    const totalPaidShopping = monthPaidShopping._sum.value ? Number(monthPaidShopping._sum.value) : 0
    const totalPaidInvoices = monthPaidInvoices._sum.amount ? Number(monthPaidInvoices._sum.amount) : 0
    const totalExpenses = totalPaidShopping + totalPaidInvoices

    // Mapear faturas para o formato de transação
    const invoiceTransactions = lastInvoices.map(inv => ({
      description: inv.description,
      date: inv.dueDate,
      category: `Fatura (${inv.status})`,
      value: inv.amount,
      type: 'invoice'
    }))

    const shoppingTransactions = lastShopping.map(shop => ({
      description: shop.description,
      date: shop.date,
      category: shop.category || 'Geral',
      value: shop.value,
      type: 'shopping'
    }))

    // Combinar e ordenar por data decrescente
    const allTransactions = [...invoiceTransactions, ...shoppingTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)

    return {
      balance: wallet ? Number(wallet.balance) : 0,
      expenses: totalExpenses, // 'Gastos do Mês' inclui compras pagas e faturas pagas
      pending: pendingInvoice._sum.amount ? Number(pendingInvoice._sum.amount) : 0,
      subscriptions: subscriptionsCount, 
      transactions: allTransactions 
    }
  }

  async addToWallet(userId, amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Valor inválido")
    }

    let wallet = await prisma.wallet.findUnique({ where: { userId: userId } })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: userId, balance: 0 }
      })
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId: userId },
      data: { balance: { increment: parseFloat(amount) } }
    })

    await prisma.shopping.create({
      data: {
        userId: userId,
        description: 'Depósito',
        value: parseFloat(amount),
        date: new Date(),
        category: 'saque/depósito',
        status: 'PAGO',
        store: 'Carteira'
      }
    })

    return {
      balance: Number(updatedWallet.balance),
      message: "Depósito realizado com sucesso"
    }
  }

  async removeFromWallet(userId, amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Valor inválido")
    }

    let wallet = await prisma.wallet.findUnique({ where: { userId: userId } })

    if (!wallet || Number(wallet.balance) < parseFloat(amount)) {
      throw new Error("Saldo insuficiente")
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId: userId },
      data: { balance: { decrement: parseFloat(amount) } }
    })

    await prisma.shopping.create({
      data: {
        userId: userId,
        description: 'Retirada',
        value: parseFloat(amount),
        date: new Date(),
        category: 'saque/depósito',
        status: 'PAGO',
        store: 'Carteira'
      }
    })

    return {
      balance: Number(updatedWallet.balance),
      message: "Saque realizado com sucesso"
    }
  }
}

module.exports = new FinanceService()
