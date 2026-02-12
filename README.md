# Sistema de Gestão Financeira 

1. **Arquitetura MVC**: Código reorganizado seguindo o padrão Model-View-Controller com camada de Services.
---

##  Arquitetura

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

## Instalação

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm 

### Passos

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**
   
   Edite o arquivo `.env` com suas credenciais do banco:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
   JWT_SECRET="sua_chave_secreta_aqui"
   ```

3. **Executar migrações do banco**
   ```bash
   npx prisma migrate dev
   ```

4. **Gerar Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **(Opcional) Popular banco com dados de teste**
   ```bash
   npx prisma db seed
   ```

6. **Iniciar o servidor**
   ```bash
   npm start / npm run dev 
   ```

7. **Acessar o sistema**
   
   Abra o navegador em: `http://localhost:3000`

---

## Documentação

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
```
## Endpoints da API

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

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Frontend**: HTML, CSS, JavaScript

---

## Notas Importantes

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
