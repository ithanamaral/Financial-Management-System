const shoppingService = require('../services/shoppingService');

/**
 * Controller de Compras
 * Responsável por receber requisições HTTP e delegar para o service
 */

exports.getShopping = async (req, res) => {
  try {
    const userId = parseInt(req.userId);
    console.log("Buscando compras para o User ID:", userId);
    
    const shoppingItems = await shoppingService.getShoppingItems(userId);
    res.json({ shopping: shoppingItems });
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    res.status(500).json({ error: error.message || "Error loading shopping items" });
  }
};

exports.createShopping = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const result = await shoppingService.createShopping(userId, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    res.status(400).json({ error: error.message || 'Erro ao criar compra' });
  }
};

exports.updateShopping = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(req.userId);
    const result = await shoppingService.updateShopping(id, userId, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao atualizar compra:', error);
    res.status(400).json({ error: error.message || 'Erro ao atualizar compra' });
  }
};

exports.deleteMultipleShopp = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = Number(req.userId);
    const result = await shoppingService.deleteMultipleShopping(ids, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao excluir compras:', error);
    res.status(500).json({ message: error.message || 'Erro interno ao processar a exclusão.' });
  }
};
