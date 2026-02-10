const prisma = require('../config/database');

class ShoppingService {
  /**
   * Busca todas as compras do usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise<Array>} Lista de compras
   */
  async getShoppingItems(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error("ID do usuário inválido");
    }

    const shoppingItems = await prisma.shopping.findMany({
      where: { 
        userId: userId 
      },
      select: {
        description: true,
        store: true,
        date: true,
        category: true,
        value: true,
        id: true 
      },
      orderBy: {
        date: 'desc'
      }
    });

    return shoppingItems;
  }

  /**
   * Cria uma nova compra e debita da carteira
   * @param {number} userId - ID do usuário
   * @param {Object} data - Dados da compra
   * @returns {Promise<Object>} Compra criada
   */
  async createShopping(userId, data) {
    const { description, store, date, category, value } = data;

    if (!description || !value || isNaN(value) || value <= 0) {
      throw new Error('Dados inválidos');
    }

    // Busca a carteira do usuário
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

    // Verifica se há saldo suficiente
    if (wallet.balance < parseFloat(value)) {
      throw new Error('Saldo insuficiente na carteira');
    }

    // Cria a compra e atualiza a carteira em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria a compra
      const newShopping = await tx.shopping.create({
        data: {
          userId: userId,
          description: description,
          store: store || 'N/A',
          date: date ? new Date(date) : new Date(),
          category: category || 'Geral',
          value: parseFloat(value),
          status: 'Pago'
        }
      });

      // Debita o valor da carteira
      await tx.wallet.update({
        where: { userId: userId },
        data: {
          balance: wallet.balance - parseFloat(value)
        }
      });

      return newShopping;
    });

    return {
      shopping: result,
      message: 'Compra adicionada e valor debitado da carteira'
    };
  }

  /**
   * Atualiza uma compra existente e ajusta a carteira se o valor foi alterado
   * @param {number} shoppingId - ID da compra
   * @param {number} userId - ID do usuário
   * @param {Object} data - Dados atualizados
   * @returns {Promise<Object>} Compra atualizada
   */
  async updateShopping(shoppingId, userId, data) {
    const { description, store, date, category, value } = data;

    // Busca a compra original
    const originalShopping = await prisma.shopping.findFirst({
      where: { 
        id: Number(shoppingId),
        userId: userId 
      }
    });

    if (!originalShopping) {
      throw new Error('Compra não encontrada');
    }

    // Verifica se o valor foi alterado
    const valueChanged = value && parseFloat(value) !== Number(originalShopping.value);
    let walletAdjustment = 0;

    if (valueChanged) {
      const newValue = parseFloat(value);
      const oldValue = Number(originalShopping.value);
      walletAdjustment = newValue - oldValue;

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

    // Atualiza a compra e a carteira em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualiza a compra
      const updatedShopping = await tx.shopping.update({
        where: { id: Number(shoppingId) },
        data: {
          description: description || originalShopping.description,
          store: store !== undefined ? store : originalShopping.store,
          date: date ? new Date(date) : originalShopping.date,
          category: category !== undefined ? category : originalShopping.category,
          value: value ? parseFloat(value) : originalShopping.value
        }
      });

      // Se o valor mudou, ajusta a carteira
      if (valueChanged) {
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

      return updatedShopping;
    });

    return {
      shopping: result,
      message: valueChanged 
        ? 'Compra atualizada e carteira ajustada' 
        : 'Compra atualizada com sucesso'
    };
  }

  /**
   * Deleta múltiplas compras e devolve o valor para a carteira
   * @param {Array<number>} ids - IDs das compras
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteMultipleShopping(ids, userId) {
    if (!ids || !Array.isArray(ids)) {
      throw new Error('IDs não fornecidos corretamente');
    }

    const numericIds = ids.map(id => Number(id));

    // Busca as compras para somar os valores
    const shoppings = await prisma.shopping.findMany({
      where: {
        id: { in: numericIds },
        userId: userId
      }
    });

    const totalToRefund = shoppings.reduce((acc, shopping) => acc + Number(shopping.value), 0);

    // Deleta as compras e devolve o valor para a carteira em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Deleta as compras
      const deleteResult = await tx.shopping.deleteMany({
        where: {
          id: { in: numericIds },
          userId: userId 
        }
      });

      // Devolve o valor para a carteira
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
      message: `${result.count} compras excluídas e R$ ${totalToRefund.toFixed(2)} devolvido à carteira`
    };
  }
}

module.exports = new ShoppingService();
