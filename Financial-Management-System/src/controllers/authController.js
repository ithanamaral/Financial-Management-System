// authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Essa linha garante que o .env foi lido

const prisma = new PrismaClient();

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
        invoices: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch =
      user.password === password ||
      (await bcrypt.compare(password, user.password));

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, // JWT_SECRET está no .env
      { expiresIn: '1d' } 
    );

    // Retorna os dados e o token
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      invoices: user.invoices,
      token: token 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging' });
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        wallet: {
          create: { balance: 0 }
        }
      }
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!', id: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

module.exports = {
  login,
  register
};