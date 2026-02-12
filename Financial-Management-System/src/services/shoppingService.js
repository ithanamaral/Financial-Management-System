const prisma = require('../config/database');

class ShoppingService {

  async getShoppingItems(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error("ID do usuário inválido");
    }

    return await prisma.shopping.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' }
    })
  }

  async createShopping(userId, data) {
    const { description, store, date, category, value } = data;

    if (!description || !value || isNaN(value) || value <= 0) {
      throw new Error('Dados inválidos');
    }

    const newShopping = await prisma.shopping.create({
      data: {
        userId: userId,
        description: description,
        store: store || 'N/A',
        date: date ? new Date(date) : new Date(),
        category: category || 'Geral',
        value: parseFloat(value),
        status: 'PENDENTE' 
      }
    })

    return {
      shopping: newShopping,
      message: 'Compra adicionada como PENDENTE'
    }
  }

  async updateShopping(shoppingId, userId, data) {
    const { description, store, date, category, value, status } = data;

    return await prisma.$transaction(async (tx) => {

      const originalShopping = await tx.shopping.findFirst({
        where: { id: Number(shoppingId), userId: userId }
      })

      if (!originalShopping) throw new Error('Compra não encontrada')

      const oldStatus = originalShopping.status.toUpperCase()
      const newStatus = (status || originalShopping.status).toUpperCase()
      const oldValue = Number(originalShopping.value)
      const newValue = value ? parseFloat(value) : oldValue

      let wallet = await tx.wallet.findUnique({ where: { userId: userId } })
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, balance: 0 } })
      }

      let currentBalance = Number(wallet.balance);
      let message = 'Compra atualizada com sucesso';
      
      // Mudança de PENDENTE para PAGO - precisamos debitar
      if (oldStatus === 'PENDENTE' && newStatus === 'PAGO') {
        if (currentBalance < newValue) throw new Error('Saldo insuficiente na carteira');
        currentBalance -= newValue;
        message = 'Status alterado para PAGO e valor debitado da carteira';
      }
      
      //  Mudança de PAGO para PENDENTE - precisamos estornar
      else if (oldStatus === 'PAGO' && newStatus === 'PENDENTE') {
        currentBalance += oldValue;
        message = 'Status alterado para PENDENTE e valor estornado para a carteira';
      }
      
      // CContinua PAGO, mas o valor mudou
      else if (oldStatus === 'PAGO' && newStatus === 'PAGO') {
        const diff = newValue - oldValue;
        if (diff > 0) { // Valor aumentou, debitamos a diferença
          if (currentBalance < diff) throw new Error('Saldo insuficiente para o ajuste de valor')
          currentBalance -= diff
        } else if (diff < 0) { // Valor diminuiu, estornamos a diferença
          currentBalance += Math.abs(diff);
        }
        if (diff !== 0) message = 'Valor da compra atualizado e carteira ajustada'
      }

      // Atualizar Carteira
      await tx.wallet.update({
        where: { userId: userId },
        data: { balance: currentBalance }
      })

      // Atualizar Compra
      const updatedShopping = await tx.shopping.update({
        where: { id: Number(shoppingId) },
        data: {
          description: description || originalShopping.description,
          store: store !== undefined ? store : originalShopping.store,
          date: date ? new Date(date) : originalShopping.date,
          category: category !== undefined ? category : originalShopping.category,
          value: newValue,
          status: newStatus
        }
      })

      return { shopping: updatedShopping, message }
    })
  }

  /**
   * Paga múltiplas compras
   * @param {Array<number>} ids - IDs das compras
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Resultado do pagamento
   */
  async payShoppings(ids, userId) {
    if (!ids || !Array.isArray(ids)) {
      throw new Error('IDs não fornecidos');
    }

    const numericIds = ids.map(id => Number(id));

    const shoppings = await prisma.shopping.findMany({
      where: {
        id: { in: numericIds },
        userId: userId,
        status: 'PENDENTE'
      }
    })

    if (shoppings.length === 0) {
      throw new Error('Nenhuma compra pendente selecionada para pagamento')
    }

    const totalToPay = shoppings.reduce((acc, shop) => acc + Number(shop.value), 0)

    const wallet = await prisma.wallet.findUnique({
      where: { userId: userId }
    })

    if (!wallet || Number(wallet.balance) < totalToPay) {
      throw new Error('Saldo insuficiente na carteira')
    }

    await prisma.$transaction([
      // Debita o valor total da carteira
      prisma.wallet.update({
        where: { userId: userId },
        data: {
          balance: { decrement: totalToPay }
        }
      }),

      // Atualiza o status de todas as compras selecionadas para 'PAGO'
      prisma.shopping.updateMany({
        where: {
          id: { in: shoppings.map(s => s.id) },
          userId: userId
        },
        data: {
          status: 'PAGO'
        }
      })
    ])

    return {
      message: 'Compras pagas com sucesso e valor debitado da carteira',
      totalPaid: totalToPay,
      count: shoppings.length
    }
  }

  async deleteMultipleShopping(ids, userId) {
    if (!ids || !Array.isArray(ids)) throw new Error('IDs não fornecidos corretamente')

    const numericIds = ids.map(id => Number(id));

    return await prisma.$transaction(async (tx) => {
      const shoppings = await tx.shopping.findMany({
        where: { id: { in: numericIds }, userId: userId }
      })

      // Somar apenas o valor das compras que estão como 'PAGO' para estornar
      const totalToRefund = shoppings.reduce((acc, shopping) => {
        return shopping.status.toUpperCase() === 'PAGO' ? acc + Number(shopping.value) : acc
      }, 0)

      const deleteResult = await tx.shopping.deleteMany({
        where: { id: { in: numericIds }, userId: userId }
      })

      if (totalToRefund > 0) {
        await tx.wallet.update({
          where: { userId: userId },
          data: { balance: { increment: totalToRefund } }
        })
      }

      return {
        count: deleteResult.count,
        message: `${deleteResult.count} compras excluídas. Estorno de R$ ${totalToRefund.toFixed(2)} realizado.`
      }
    })
  }
}

module.exports = new ShoppingService();
