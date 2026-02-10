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

    const [wallet, monthExpenses, pendingInvoice, subscriptionsCount, lastShopping] = await Promise.all([
      
      // Saldo da Carteira
      prisma.wallet.findUnique({
        where: { userId: userId }
      }),

      // Gastos do Mês (todas as compras do mês atual)
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

      // Faturas Pendentes
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

    return {
      balance: wallet ? Number(wallet.balance) : 0,
      expenses: monthExpenses._sum.value ? Number(monthExpenses._sum.value) : 0,
      pending: pendingInvoice._sum.amount ? Number(pendingInvoice._sum.amount) : 0,
      subscriptions: subscriptionsCount, 
      transactions: lastShopping 
    };
  }

  /**
   * Adiciona valor à carteira do usuário
   * @param {number} userId - ID do usuário
   * @param {number} amount - Valor a ser adicionado
   * @returns {Promise<Object>} Carteira atualizada
   */
  async addToWallet(userId, amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Valor inválido");
    }

    // Busca ou cria a carteira do usuário
    let wallet = await prisma.wallet.findUnique({
      where: { userId: userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: userId,
          balance: 0
        }
      });
    }

    // Atualiza o saldo
    const updatedWallet = await prisma.wallet.update({
      where: { userId: userId },
      data: {
        balance: wallet.balance + parseFloat(amount)
      }
    });

    return {
      balance: Number(updatedWallet.balance),
      message: "Depósito realizado com sucesso"
    };
  }

  /**
   * Remove valor da carteira do usuário
   * @param {number} userId - ID do usuário
   * @param {number} amount - Valor a ser removido
   * @returns {Promise<Object>} Carteira atualizada
   */
  async removeFromWallet(userId, amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Valor inválido");
    }

    // Busca a carteira do usuário
    let wallet = await prisma.wallet.findUnique({
      where: { userId: userId }
    });

    if (!wallet) {
      throw new Error("Carteira não encontrada");
    }

    // Verifica se há saldo suficiente
    if (wallet.balance < parseFloat(amount)) {
      throw new Error("Saldo insuficiente");
    }

    // Atualiza o saldo
    const updatedWallet = await prisma.wallet.update({
      where: { userId: userId },
      data: {
        balance: wallet.balance - parseFloat(amount)
      }
    });

    return {
      balance: Number(updatedWallet.balance),
      message: "Saque realizado com sucesso"
    };
  }
}

module.exports = new FinanceService();
