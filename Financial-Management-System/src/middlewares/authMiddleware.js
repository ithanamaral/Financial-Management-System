const jwt = require('jsonwebtoken');
require('dotenv').config(); // Garante que o .env foi lido

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;
  
  // Verificar se o header chegou
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  console.log('Header recebido:', authHeader);

  // Tentar separar o "Bearer" do token
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ erro: 'Erro no formato do token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: 'Token mal formatado' });
  }

  // Verificar o Segredo e a Validade
  try {
    console.log('Tentando validar com JWT_SECRET:', process.env.JWT_SECRET); 
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definido no .env');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; 

    return next();

  } catch (err) {
    console.log('ERRO FATAL NA VERIFICAÇÃO:', err.message);
    
    if (err.message === 'jwt expired') {
        return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
    }
    
    return res.status(401).json({ erro: 'Token inválido' });
  }
};