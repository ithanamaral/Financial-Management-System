const financeService = require('../services/financeService')

exports.summary = async (req, res) => {
  try {
    const userId = req.userId
    const summary = await financeService.getFinancialSummary(userId)
    res.json(summary)
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error)
    res.status(500).json({ error: error.message || "Error loading financial summary" })
  }
}

exports.addToWallet = async (req, res) => {
  try {
    const userId = req.userId
    const { amount } = req.body
    
    const result = await financeService.addToWallet(userId, amount)
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('Erro ao adicionar valor à carteira:', error)
    res.status(400).json({ error: error.message || "Erro ao adicionar valor à carteira" })
  }
}

exports.removeFromWallet = async (req, res) => {
  try {
    const userId = req.userId
    const { amount } = req.body
    
    const result = await financeService.removeFromWallet(userId, amount)
    res.json({ success: true, ...result })
  } catch (error) {
    console.error('Erro ao remover valor da carteira:', error)
    res.status(400).json({ error: error.message || "Erro ao remover valor da carteira" })
  }
}

exports.clearRecents = async (req, res) => {
  try {
    const userId = req.userId
    const result = await financeService.clearRecents(userId)
    res.json(result)
  } catch (error) {
    console.error('Erro ao limpar movimentações recentes:', error)
    res.status(500).json({ error: error.message || "Erro ao limpar movimentações recentes" })
  }
}
