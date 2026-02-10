const express = require('express')
const router = express.Router()

const invoiceController = require('../controllers/invoiceController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/getInvoice', authMiddleware, invoiceController.getInvoice)
router.post('/createInvoice', authMiddleware, invoiceController.createInvoice)
router.put('/updateInvoice/:id', authMiddleware, invoiceController.updateInvoice)
router.post('/payInvoices', authMiddleware, invoiceController.payInvoices)
router.delete('/invoices/deleteMultipleInvoices', authMiddleware, invoiceController.deleteMultipleInvoices)

module.exports = router;