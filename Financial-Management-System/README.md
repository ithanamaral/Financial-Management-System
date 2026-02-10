# Sistema de Gestão Financeira - Versão Corrigida

## 📋 Sobre as Correções

Este sistema foi corrigido e refatorado para seguir a arquitetura MVC e implementar as seguintes funcionalidades:

### ✅ Correções Implementadas

1. **Compras adicionadas ao gasto mensal**: Todas as compras do mês atual são contabilizadas corretamente no dashboard.

2. **Assinaturas filtradas corretamente**: Apenas compras com categoria "Assinatura" ou "assinatura" são contadas como assinaturas.

3. **Atualização de carteira ao editar compras**: Quando o valor de uma compra é editado, a carteira é ajustada automaticamente:
   - Aumento de valor → Debita a diferença da carteira
   - Redução de valor → Credita a diferença na carteira
   - Validação de saldo insuficiente

4. **Atualização de carteira ao editar faturas pagas**: Faturas já pagas têm a carteira ajustada quando o valor é editado.

5. **Arquitetura MVC**: Código reorganizado seguindo o padrão Model-View-Controller com camada de Services.

6. **Exclusão com reembolso**: Ao deletar compras ou faturas pagas, o valor é devolvido automaticamente à carteira.

7. **Transações atômicas**: Operações críticas usam transações do Prisma para garantir consistência.

---

## 🏗️ Arquitetura

```
src/
├── config/           # Configurações (database, etc)
├── services/         # Lógica de negócio (NOVO)
├── controllers/      # Controllers (recebem requisições)
├── routes/           # Rotas da API
├── middlewares/      # Middlewares de autenticação
├── models/           # Modelos de domínio
└── public/           # Frontend (HTML, CSS, JS)
```

### Camadas

**Services (Lógica de Negócio)**
- `financeService.js`: Resumo financeiro, depósitos, saques
- `shoppingService.js`: CRUD de compras + ajuste de carteira
- `invoiceService.js`: CRUD de faturas + pagamentos

**Controllers (Requisições HTTP)**
- Recebem requisições
- Validam dados básicos
- Delegam para services
- Retornam respostas

**Config**
- `database.js`: Instância única do Prisma Client

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

### Passos

1. **Extrair o arquivo ZIP**
   ```bash
   unzip Financial-Management-System-Corrigido.zip
   cd Financial-Management-System-Corrigido
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   
   Edite o arquivo `.env` com suas credenciais do banco:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
   JWT_SECRET="sua_chave_secreta_aqui"
   ```

4. **Executar migrações do banco**
   ```bash
   npx prisma migrate deploy
   ```

5. **Gerar Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **(Opcional) Popular banco com dados de teste**
   ```bash
   npx prisma db seed
   ```

7. **Iniciar o servidor**
   ```bash
   npm start
   ```

8. **Acessar o sistema**
   
   Abra o navegador em: `http://localhost:3000`

---

## 📚 Documentação

### Documentos Incluídos

1. **ANALISE_PROBLEMAS.md**: Análise detalhada dos problemas identificados
2. **CORRECOES_IMPLEMENTADAS.md**: Documentação completa de todas as correções
3. **TESTES_VALIDACAO.md**: Guia de testes manuais para validar as correções

### Estrutura de Pastas

```
/
├── src/                    # Código-fonte
│   ├── config/             # Configurações
│   ├── services/           # Lógica de negócio (NOVO)
│   ├── controllers/        # Controllers
│   ├── routes/             # Rotas da API
│   ├── middlewares/        # Middlewares
│   ├── models/             # Modelos de domínio
│   └── public/             # Frontend
├── prisma/                 # Schema e migrações
├── package.json            # Dependências
├── .env                    # Variáveis de ambiente
├── README.md               # Este arquivo
├── ANALISE_PROBLEMAS.md    # Análise dos problemas
├── CORRECOES_IMPLEMENTADAS.md  # Documentação das correções
└── TESTES_VALIDACAO.md     # Guia de testes
```

---

## 🧪 Testes

Para validar as correções, siga o guia completo em **TESTES_VALIDACAO.md**.

### Testes Principais

1. Criar compras no mês atual e verificar "Gasto do Mês"
2. Criar compras com categoria "Assinatura" e verificar contagem
3. Editar valor de compra e verificar ajuste na carteira
4. Editar valor de fatura paga e verificar ajuste na carteira
5. Deletar compras/faturas e verificar reembolso

---

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

### Finanças
- `GET /api/finance/summary` - Resumo financeiro
- `POST /api/finance/wallet/add` - Adicionar saldo
- `POST /api/finance/wallet/remove` - Remover saldo

### Compras
- `GET /api/shopping` - Listar compras
- `POST /api/shopping` - Criar compra
- `PUT /api/shopping/:id` - Editar compra
- `DELETE /api/shopping` - Deletar compras

### Faturas
- `GET /api/invoice` - Listar faturas
- `POST /api/invoice` - Criar fatura
- `PUT /api/invoice/:id` - Editar fatura
- `POST /api/invoice/pay` - Pagar faturas
- `DELETE /api/invoice` - Deletar faturas

---

## 🔧 Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Frontend**: HTML, CSS, JavaScript

---

## 📝 Notas Importantes

### Transações Atômicas

Todas as operações que envolvem múltiplas tabelas usam transações:
- Criação de compras (debita carteira)
- Edição de compras (ajusta carteira)
- Pagamento de faturas (debita carteira)
- Exclusão com reembolso (credita carteira)

### Validações

O sistema valida:
- Saldo suficiente antes de debitar
- Permissões (usuário só edita suas próprias compras/faturas)
- Dados de entrada (valores positivos, campos obrigatórios)

### Segurança

- Autenticação via JWT
- Middleware de autenticação em rotas protegidas
- Isolamento de dados por usuário

---

## 🐛 Reportar Bugs

Se encontrar algum problema, documente:
1. Passos para reproduzir
2. Comportamento esperado
3. Comportamento observado
4. Screenshots (se aplicável)

---

## 📄 Licença

Este projeto é privado e confidencial.

---

## 👥 Suporte

Para dúvidas ou suporte, consulte a documentação completa nos arquivos:
- `ANALISE_PROBLEMAS.md`
- `CORRECOES_IMPLEMENTADAS.md`
- `TESTES_VALIDACAO.md`

---

## 🎯 Próximos Passos Recomendados

1. **Testes Automatizados**: Implementar testes unitários e de integração
2. **Documentação da API**: Adicionar Swagger/OpenAPI
3. **Validação Robusta**: Usar bibliotecas como Joi ou Zod
4. **Cache**: Implementar Redis para melhor performance
5. **Logs**: Adicionar sistema de logs estruturado
6. **Monitoramento**: Implementar APM (Application Performance Monitoring)

---

**Versão**: 2.0 (Corrigida e Refatorada)  
**Data**: Fevereiro 2026  
**Status**: ✅ Pronto para uso
