const prisma = require('../config/database');

class FinanceService {
  /**
   * Busca o resumo financeiro do usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Resumo financeiro
   */
  async getFinancialSummary(userId) {
    // Definir datas para o "Gasto do Mês"
    const today = new Date();
    const beginningMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [wallet, monthShopping, monthPaidInvoices, pendingInvoice, subscriptionsCount, lastShopping] = await Promise.all([
      
      // Saldo da Carteira
      prisma.wallet.findUnique({
        where: { userId: userId }
      }),

      // 1. Compras do Mês (Shopping)
      prisma.shopping.aggregate({
        _sum: { value: true },
        where: {
          userId: userId,
          date: {
            gte: beginningMonth,
            lte: endMonth
          }
        }
      }),

      // 2. Faturas Pagas no Mês (Invoices)
      // Consideramos faturas cujo vencimento ou pagamento (se houvesse data de pagamento) seja no mês atual
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

      // Faturas Pendentes (Total geral pendente)
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          userId: userId,
          status: 'PENDING'
        }
      }),

      // Assinaturas (apenas compras com categoria "Assinatura" ou "assinatura")
      prisma.shopping.count({
        where: { 
          userId: userId,
          category: {
            in: ['Assinatura', 'assinatura']
          }
        }
      }),

      // Movimentações Recentes 
      prisma.shopping.findMany({
        where: { userId: userId },
        orderBy: { date: 'desc' },
        take: 5
      })
    ]);

    // Soma total: Compras + Faturas Pagas no mês
    const totalShopping = monthShopping._sum.value ? Number(monthShopping._sum.value) : 0;
    const totalPaidInvoices = monthPaidInvoices._sum.amount ? Number(monthPaidInvoices._sum.amount) : 0;
    const totalExpenses = totalShopping + totalPaidInvoices;

    return {
      balance: wallet ? Number(wallet.balance) : 0,
      expenses: totalExpenses, // 'Gastos do Mês' agora inclui faturas pagas
      pending: pendingInvoice._sum.amount ? Number(pendingInvoice._sum.amount) : 0,
      subscriptions: subscriptionsCount, 
      transactions: lastShopping 
    };
  }

  /**
   * Adiciona valor à carteira do usuário
   */
  async addToWallet(userId, amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Valor inválido");
    }

    let wallet = await prisma.wallet.findUnique({ where: { userId: userId } });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: userId, balance: 0 }
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId: userId },
      data: { balance: { increment: parseFloat(amount) } }
    });

    return {
      balance: Number(updatedWallet.balance),
      message: "Depósito realizado com sucesso"
    };
  }

  /**
   * Remove valor da carteira do usuário
   */
  async removeFromWallet(userId, amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Valor inválido");
    }

    let wallet = await prisma.wallet.findUnique({ where: { userId: userId } });

    if (!wallet || Number(wallet.balance) < parseFloat(amount)) {
      throw new Error("Saldo insuficiente");
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId: userId },
      data: { balance: { decrement: parseFloat(amount) } }
    });

    return {
      balance: Number(updatedWallet.balance),
      message: "Saque realizado com sucesso"
    };
  }
}

module.exports = new FinanceService();
