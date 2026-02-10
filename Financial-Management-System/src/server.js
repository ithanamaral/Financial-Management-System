const cors = require('cors')
require('dotenv').config();
const express = require('express') 
const path = require('path')

const app = express() 

app.use(cors())

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const financeRoutes = require('./routes/financeRoutes')
const shoppingRoutes = require('./routes/shoppingRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')

// MIDDLEWARES
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public'), { index: false }))

// ROTAS DA API
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes) 
app.use('/api/finance', financeRoutes) 
app.use('/api/shopping', shoppingRoutes)
app.use('/api/invoice', invoiceRoutes)

// ROTA INICIAL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})