const prisma = require('../config/database');

class InvoiceService {
  /**
   * Busca todas as faturas do usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<Array>} Lista de faturas
   */
  async getInvoices(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error("ID do usuário inválido");
    }

    const invoiceItems = await prisma.invoice.findMany({
      where: { 
        userId: userId 
      },
      select: {
        description: true,
        dueDate: true,
        status: true,
        amount: true,
        id: true 
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    const formattedInvoices = invoiceItems.map(inv => ({
      ...inv,
      value: Number(inv.amount)
    }));

    return formattedInvoices;
  }

  /**
   * Cria uma nova fatura
   * @param {number} userId - ID do usuário
   * @param {Object} data - Dados da fatura
   * @returns {Promise<Object>} Fatura criada
   */
  async createInvoice(userId, data) {
    const { description, amount, dueDate, status } = data;

    if (!description || !amount || isNaN(amount) || amount <= 0) {
      throw new Error('Dados inválidos');
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        userId: userId,
        description: description,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        status: status || 'PENDING'
      }
    });

    return {
      invoice: newInvoice,
      message: 'Fatura criada com sucesso'
    };
  }

  /**
   * Atualiza uma fatura existente e ajusta a carteira se já foi paga e o valor mudou
   * @param {number} invoiceId - ID da fatura
   * @param {number} userId - ID do usuário
   * @param {Object} data - Dados atualizados
   * @returns {Promise<Object>} Fatura atualizada
   */
  async updateInvoice(invoiceId, userId, data) {
    const { description, amount, dueDate, status } = data;

    // Busca a fatura original
    const originalInvoice = await prisma.invoice.findFirst({
      where: { 
        id: Number(invoiceId),
        userId: userId 
      }
    });

    if (!originalInvoice) {
      throw new Error('Fatura não encontrada');
    }

    // Verifica se o valor foi alterado e a fatura já estava paga
    const valueChanged = amount && parseFloat(amount) !== Number(originalInvoice.amount);
    const wasPaid = originalInvoice.status === 'PAID' || originalInvoice.status === 'OVERDUE';
    let walletAdjustment = 0;

    if (valueChanged && wasPaid) {
      const newAmount = parseFloat(amount);
      const oldAmount = Number(originalInvoice.amount);
      walletAdjustment = newAmount - oldAmount;

      // Se o novo valor é maior, precisa debitar mais da carteira
      if (walletAdjustment > 0) {
        const wallet = await prisma.wallet.findUnique({
          where: { userId: userId }
        });

        if (!wallet || Number(wallet.balance) < walletAdjustment) {
          throw new Error('Saldo insuficiente para o novo valor');
        }
      }
    }

    // Atualiza a fatura e a carteira em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualiza a fatura
      const updatedInvoice = await tx.invoice.update({
        where: { id: Number(invoiceId) },
        data: {
          description: description || originalInvoice.description,
          amount: amount ? parseFloat(amount) : originalInvoice.amount,
          dueDate: dueDate ? new Date(dueDate) : originalInvoice.dueDate,
          status: status || originalInvoice.status
        }
      });

      // Se o valor mudou e a fatura estava paga, ajusta a carteira
      if (valueChanged && wasPaid) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: userId }
        });

        await tx.wallet.update({
          where: { userId: userId },
          data: {
            balance: Number(wallet.balance) - walletAdjustment
          }
        });
      }

      return updatedInvoice;
    });

    return {
      invoice: result,
      message: (valueChanged && wasPaid)
        ? 'Fatura atualizada e carteira ajustada' 
        : 'Fatura atualizada com sucesso'
    };
  }

  /**
   * Paga múltiplas faturas
   * @param {Array<number>} ids - IDs das faturas
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Resultado do pagamento
   */
  async payInvoices(ids, userId) {
    if (!ids || !Array.isArray(ids)) {
      throw new Error('IDs não fornecidos');
    }

    const invoices = await prisma.invoice.findMany({
      where: { 
        id: { in: ids.map(id => Number(id)) }, 
        userId: userId 
      }
    });

    const totalToPay = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < totalToPay) {
      throw new Error('Saldo insuficiente na carteira');
    }

    const today = new Date();

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: totalToPay } }
      }),
      ...invoices.map(inv => {
        const isLate = today > new Date(inv.dueDate);
        return prisma.invoice.update({
          where: { id: inv.id },
          data: { status: isLate ? 'OVERDUE' : 'PAID' }
        });
      })
    ]);

    return {
      message: 'Faturas pagas com sucesso e valor debitado da carteira',
      totalPaid: totalToPay
    };
  }

  /**
   * Deleta múltiplas faturas e devolve o valor para a carteira se já foram pagas
   * @param {Array<number>} ids - IDs das faturas
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteMultipleInvoices(ids, userId) {
    if (!ids || !Array.isArray(ids)) {
      throw new Error('IDs não fornecidos corretamente');
    }

    const numericIds = ids.map(id => Number(id));

    // Busca as faturas para somar os valores das que foram pagas
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: numericIds },
        userId: userId
      }
    });

    const totalToRefund = invoices
      .filter(inv => inv.status === 'PAID' || inv.status === 'OVERDUE')
      .reduce((acc, inv) => acc + Number(inv.amount), 0);

    // Deleta as faturas e devolve o valor para a carteira em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Deleta as faturas
      const deleteResult = await tx.invoice.deleteMany({
        where: {
          id: { in: numericIds },
          userId: userId 
        }
      });

      // Devolve o valor para a carteira (apenas faturas pagas)
      if (totalToRefund > 0) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: userId }
        });

        if (wallet) {
          await tx.wallet.update({
            where: { userId: userId },
            data: {
              balance: Number(wallet.balance) + totalToRefund
            }
          });
        }
      }

      return deleteResult;
    });

    return {
      count: result.count,
      message: totalToRefund > 0 
        ? `${result.count} faturas excluídas e R$ ${totalToRefund.toFixed(2)} devolvido à carteira`
        : `${result.count} faturas excluídas com sucesso`
    };
  }
}

module.exports = new InvoiceService();
