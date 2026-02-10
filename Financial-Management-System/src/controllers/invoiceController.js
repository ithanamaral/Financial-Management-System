const invoiceService = require('../services/invoiceService');

/**
 * Controller de Faturas
 * Responsável por receber requisições HTTP e delegar para o service
 */

exports.getInvoice = async (req, res) => {
  try {
    const userId = parseInt(req.userId);
    console.log("Buscando faturas para o User ID:", userId);
    
    const invoices = await invoiceService.getInvoices(userId);
    res.json({ invoices: invoices });
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    res.status(500).json({ error: error.message || "Error loading invoice summary" });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const result = await invoiceService.createInvoice(userId, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao criar fatura:', error);
    res.status(400).json({ error: error.message || 'Erro ao criar fatura' });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(req.userId);
    const result = await invoiceService.updateInvoice(id, userId, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao atualizar fatura:', error);
    res.status(400).json({ error: error.message || 'Erro ao atualizar fatura' });
  }
};

exports.payInvoices = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const { ids } = req.body;
    const result = await invoiceService.payInvoices(ids, userId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao pagar faturas:', error);
    res.status(400).json({ error: error.message || 'Erro ao processar pagamento' });
  }
};

exports.deleteMultipleInvoices = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = Number(req.userId);
    const result = await invoiceService.deleteMultipleInvoices(ids, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao excluir faturas:', error);
    res.status(500).json({ message: error.message || 'Erro interno ao processar a exclusão.' });
  }
}