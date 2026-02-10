const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')

//router.put('/:id', userController.updateUser)

router.get('/getUser', authMiddleware, userController.getUser);
router.put('/updateUser', authMiddleware, userController.updateUser);

module.exports = router
