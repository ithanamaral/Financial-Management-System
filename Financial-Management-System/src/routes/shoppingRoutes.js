const express = require('express')
const router = express.Router()

const shoppingController = require('../controllers/shoppingController')
const authMiddleware = require('../middlewares/authMiddleware')

//router.VERBO('caminho', middleware, controller)
router.get('/getShopping', authMiddleware, shoppingController.getShopping)
router.post('/createShopping', authMiddleware, shoppingController.createShopping)
router.put('/updateShopping/:id', authMiddleware, shoppingController.updateShopping)
router.delete('/shopping/deleteMultipleShopp', authMiddleware, shoppingController.deleteMultipleShopp)

module.exports = router