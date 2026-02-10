const financeService = require('../services/financeService');

/**
 * Controller de Finanças
 * Responsável por receber requisições HTTP e delegar para o service
 */

exports.summary = async (req, res) => {
  try {
    const userId = req.userId;
    const summary = await financeService.getFinancialSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(500).json({ error: error.message || "Error loading financial summary" });
  }
};

exports.addToWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;
    
    const result = await financeService.addToWallet(userId, amount);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao adicionar valor à carteira:', error);
    res.status(400).json({ error: error.message || "Erro ao adicionar valor à carteira" });
  }
};

exports.removeFromWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;
    
    const result = await financeService.removeFromWallet(userId, amount);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao remover valor da carteira:', error);
    res.status(400).json({ error: error.message || "Erro ao remover valor da carteira" });
  }
};
