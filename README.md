# **Proposta de Trabalho Final**

# **Discente: Samuel Patrick Lopes de Oliveira - 23.1.8115**

# Sistema de Gestão Financeira 

Este trabalho consistiu no aprimoramento de um **Sistema de Gestão Financeira**, focando na centralização da visibilidade de dados e na automação do histórico de transações. O contexto do projeto é oferecer uma visão geral das finanças do usuário, integrando faturas, compras e operações de carteira em uma interface única e intuitiva.

## 1. Tema
O trabalho final tem como tema o desenvolvimento de um **Sistema de Gestão Financeira Pessoal**, com foco na consolidação de movimentações financeiras de diferentes origens (faturas, compras e depósitos/saques) em um fluxo de caixa unificado para melhor controle de gastos e receitas.

## 2. Escopo
Este projeto terá as seguintes funcionalidades:
*   **Painel de Resumo Financeiro**: Visualização de saldo em carteira, gastos mensais, faturas pendentes e assinaturas ativas.
*   **Movimentações Recentes Integradas**: Exibição unificada de compras realizadas, faturas (pagas e pendentes) e registros de depósitos ou retiradas.
*   **Gestão de Carteira**: Funcionalidade para adicionar ou retirar valores, com geração automática de histórico na categoria "saque/depósito".
*   **Gestão de Faturas e Compras**: Módulos específicos para cadastro e acompanhamento de contas a pagar e despesas variáveis.
*   **Filtros Avançados**: Sistema de busca e filtragem por status e descrição em todas as tabelas do sistema.

## 3. Restrições
Neste trabalho não serão considerados:
*   **Integração Bancária Real**: O sistema opera com dados inseridos manualmente ou simulados, sem conexão direta com APIs de instituições financeiras.
*   **Suporte Multi-moeda**: Todas as transações são processadas exclusivamente em Real.
*   **Geração de Relatórios em PDF/Excel**: O escopo atual foca na visualização em tempo real via navegador.

## 4. Protótipo
Protótipos para as páginas de **Dashboard (Overview), Gestão de Faturas, Lista de Compras e Perfil do Usuário** foram elaborados e implementados utilizando HTML, CSS, JS, podendo ser encontrados na pasta `src/public` do projeto, com a lógica de navegação centralizada no arquivo `dashboard.js`.

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
│   ├── services/           # Lógica de negócio
│   ├── controllers/        # Controllers
│   ├── routes/             # Rotas da API
│   ├── middlewares/        # Middlewares
│   ├── models/             # Modelos de domínio
│   └── public/             # Frontend
├── prisma/                 # Schema e migrações
├── package.json            # Dependências
├── .env                    # Variáveis de ambiente
├── README.md               
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
