# Análise de Problemas e Plano de Correções

## Problemas Identificados

### 1. **Compras não são adicionadas ao gasto mensal do mês atual**
**Localização:** `src/controllers/financeController.js` (linhas 22-30)

**Problema:** O cálculo de gastos mensais está correto, mas pode não estar filtrando corretamente as compras do mês atual.

**Análise:**
- O código usa `beginningMonth` e `endMonth` corretamente
- Precisa verificar se as datas das compras estão sendo salvas no formato correto

---

### 2. **Assinaturas não são filtradas corretamente**
**Localização:** `src/controllers/financeController.js` (linhas 42-45)

**Problema Crítico:** O código está contando TODAS as faturas (invoices) como assinaturas, sem filtrar pela categoria.

```javascript
// Código atual (INCORRETO):
prisma.invoice.count({
  where: { userId: userId }
})
```

**Correção necessária:** Filtrar apenas compras (Shopping) com categoria "Assinatura" ou "assinatura".

---

### 3. **Edição de compras não atualiza o saldo da carteira**
**Localização:** `src/controllers/shoppingController.js` (linhas 130-152)

**Problema Crítico:** Quando uma compra é editada e o valor é alterado, o sistema não:
- Estorna o valor antigo para a carteira
- Debita o novo valor da carteira

**Exemplo do problema:**
1. Compra inicial: R$ 300 (debitado da carteira)
2. Edição para R$ 400: Não há ajuste na carteira
3. Resultado: Carteira fica com saldo incorreto

**Correção necessária:**
- Buscar o valor original da compra
- Calcular a diferença (novo valor - valor antigo)
- Atualizar a carteira com a diferença

---

### 4. **Edição de faturas não atualiza o saldo da carteira (se já paga)**
**Localização:** `src/controllers/invoiceController.js` (linhas 104-125)

**Problema Similar:** Se uma fatura já foi paga e o valor é editado, a carteira não é ajustada.

---

### 5. **Arquitetura não segue padrão MVC**
**Problema:** A estrutura atual tem:
- Models (mas são classes, não modelos Prisma)
- Controllers (corretos)
- Routes (corretas)
- Mas falta separação clara de lógica de negócio (Services)

**Estrutura atual:**
```
src/
├── Models/          # Classes que não são usadas pelos controllers
├── controllers/     # Contém lógica de negócio + acesso ao banco
├── Routes/          # Rotas (correto)
└── Data/            # Conexão com banco
```

**Estrutura MVC ideal:**
```
src/
├── models/          # Schemas/tipos (Prisma já faz isso)
├── controllers/     # Apenas recebe requisições e chama services
├── services/        # Lógica de negócio
├── routes/          # Rotas
├── middlewares/     # Middlewares
└── config/          # Configurações (database, etc)
```

---

## Plano de Correções

### Fase 1: Reorganizar para MVC
1. Criar pasta `services/`
2. Mover lógica de negócio dos controllers para services
3. Renomear/reorganizar pastas seguindo convenção
4. Atualizar imports

### Fase 2: Implementar Correções Funcionais

#### 2.1 Corrigir contagem de assinaturas
- Modificar `financeController.js` para contar apenas Shopping com categoria "Assinatura"

#### 2.2 Implementar atualização de carteira na edição de compras
- Adicionar lógica em `shoppingController.js` para:
  1. Buscar valor original
  2. Calcular diferença
  3. Atualizar carteira

#### 2.3 Implementar atualização de carteira na edição de faturas
- Adicionar lógica similar em `invoiceController.js`

#### 2.4 Validar cálculo de gastos mensais
- Garantir que datas estão no formato correto
- Adicionar logs para debug

### Fase 3: Testes
- Testar criação de compras
- Testar edição de compras com diferentes valores
- Testar contagem de assinaturas
- Testar cálculo de gastos mensais

---

## Detalhamento das Correções

### Correção 1: Assinaturas
```javascript
// ANTES (INCORRETO):
prisma.invoice.count({
  where: { userId: userId }
})

// DEPOIS (CORRETO):
prisma.shopping.count({
  where: { 
    userId: userId,
    category: {
      in: ['Assinatura', 'assinatura']
    }
  }
})
```

### Correção 2: Edição de Compras
```javascript
// Adicionar ao updateShopping:
const originalShopping = await prisma.shopping.findUnique({
  where: { id: Number(id) }
});

if (value && value !== originalShopping.value) {
  const difference = parseFloat(value) - Number(originalShopping.value);
  
  const wallet = await prisma.wallet.findUnique({
    where: { userId: userId }
  });
  
  if (difference > 0 && wallet.balance < difference) {
    return res.status(400).json({ error: 'Saldo insuficiente' });
  }
  
  await prisma.wallet.update({
    where: { userId: userId },
    data: {
      balance: wallet.balance - difference
    }
  });
}
```

### Correção 3: Edição de Faturas (se já paga)
```javascript
// Similar à correção de compras, mas apenas se status for PAID
const originalInvoice = await prisma.invoice.findUnique({
  where: { id: Number(id) }
});

if (originalInvoice.status === 'PAID' && amount && amount !== originalInvoice.amount) {
  // Ajustar carteira
}
```
