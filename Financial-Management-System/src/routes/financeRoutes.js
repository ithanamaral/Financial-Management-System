const express = require('express')
const router = express.Router()

const financeController = require('../controllers/financeController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/summary', authMiddleware, financeController.summary)
router.post('/wallet/add', authMiddleware, financeController.addToWallet)
router.post('/wallet/remove', authMiddleware, financeController.removeFromWallet)

module.exports = router
