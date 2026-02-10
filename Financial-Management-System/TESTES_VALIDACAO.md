# Guia de Testes e Validação

Este documento contém testes manuais para validar todas as correções implementadas no sistema.

---

## Pré-requisitos

1. Banco de dados configurado e rodando
2. Servidor iniciado: `npm start` ou `node src/server.js`
3. Usuário criado e autenticado no sistema

---

## Teste 1: Compras Adicionadas ao Gasto Mensal ✅

### Objetivo
Verificar se compras criadas no mês atual são contabilizadas no "Gasto do Mês".

### Passos
1. **Anotar saldo inicial**
   - Acesse o dashboard
   - Anote o valor atual em "Gasto do Mês"

2. **Criar uma compra no mês atual**
   - Acesse a página de compras
   - Clique em "Nova Compra"
   - Preencha:
     - Descrição: "Teste Gasto Mensal"
     - Valor: R$ 150,00
     - Data: (data de hoje)
     - Categoria: "Alimentação"
   - Salve a compra

3. **Verificar atualização**
   - Volte ao dashboard
   - O valor em "Gasto do Mês" deve ter aumentado em R$ 150,00

### Resultado Esperado
✅ Gasto do Mês = Valor Anterior + R$ 150,00

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 2: Assinaturas Filtradas Corretamente ✅

### Objetivo
Verificar se apenas compras com categoria "Assinatura" são contadas.

### Passos
1. **Anotar contagem inicial**
   - Acesse o dashboard
   - Anote o número atual em "Assinaturas"

2. **Criar compra com categoria "Assinatura"**
   - Acesse a página de compras
   - Clique em "Nova Compra"
   - Preencha:
     - Descrição: "Netflix"
     - Valor: R$ 50,00
     - Data: (data de hoje)
     - Categoria: "Assinatura" (exatamente assim)
   - Salve a compra

3. **Criar compra com outra categoria**
   - Clique em "Nova Compra"
   - Preencha:
     - Descrição: "Supermercado"
     - Valor: R$ 200,00
     - Data: (data de hoje)
     - Categoria: "Alimentação"
   - Salve a compra

4. **Verificar contagem**
   - Volte ao dashboard
   - O número em "Assinaturas" deve ter aumentado em 1 (apenas a Netflix)

### Resultado Esperado
✅ Assinaturas = Valor Anterior + 1
✅ Compra "Supermercado" NÃO é contada como assinatura

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 3: Edição de Compra - Aumento de Valor ✅

### Objetivo
Verificar se ao aumentar o valor de uma compra, a carteira é debitada corretamente.

### Passos
1. **Criar compra inicial**
   - Acesse a página de compras
   - Crie uma compra:
     - Descrição: "Teste Edição"
     - Valor: R$ 300,00
     - Categoria: "Teste"
   - Anote o saldo da carteira após a criação

2. **Editar a compra (aumentar valor)**
   - Clique em editar na compra "Teste Edição"
   - Altere o valor para: R$ 400,00
   - Salve

3. **Verificar carteira**
   - O saldo da carteira deve ter diminuído em R$ 100,00 (diferença)

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior - R$ 100,00

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 4: Edição de Compra - Redução de Valor ✅

### Objetivo
Verificar se ao reduzir o valor de uma compra, a carteira é creditada corretamente.

### Passos
1. **Usar a compra do teste anterior**
   - Compra "Teste Edição" com valor R$ 400,00
   - Anote o saldo atual da carteira

2. **Editar a compra (reduzir valor)**
   - Clique em editar na compra "Teste Edição"
   - Altere o valor para: R$ 200,00
   - Salve

3. **Verificar carteira**
   - O saldo da carteira deve ter aumentado em R$ 200,00 (diferença)

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior + R$ 200,00

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 5: Edição de Compra - Sem Mudança de Valor ✅

### Objetivo
Verificar se ao editar outros campos (sem mudar o valor), a carteira não é afetada.

### Passos
1. **Usar a compra do teste anterior**
   - Compra "Teste Edição" com valor R$ 200,00
   - Anote o saldo atual da carteira

2. **Editar a compra (apenas descrição)**
   - Clique em editar na compra "Teste Edição"
   - Altere a descrição para: "Teste Edição - Modificado"
   - Mantenha o valor em R$ 200,00
   - Salve

3. **Verificar carteira**
   - O saldo da carteira deve permanecer o mesmo

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior (sem mudança)

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 6: Edição de Compra - Saldo Insuficiente ✅

### Objetivo
Verificar se o sistema impede aumentar o valor de uma compra quando não há saldo.

### Passos
1. **Preparar cenário**
   - Certifique-se de que a carteira tem menos de R$ 1000,00
   - Crie uma compra de R$ 100,00

2. **Tentar editar para valor muito alto**
   - Clique em editar na compra
   - Tente alterar o valor para: R$ 10.000,00
   - Tente salvar

3. **Verificar erro**
   - O sistema deve exibir erro: "Saldo insuficiente para o novo valor"
   - A compra não deve ser atualizada

### Resultado Esperado
✅ Erro exibido: "Saldo insuficiente"
✅ Compra permanece com valor original

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 7: Edição de Fatura Paga ✅

### Objetivo
Verificar se ao editar uma fatura já paga, a carteira é ajustada.

### Passos
1. **Criar e pagar fatura**
   - Acesse a página de faturas
   - Crie uma fatura:
     - Descrição: "Teste Fatura"
     - Valor: R$ 500,00
     - Status: "PENDING"
   - Pague a fatura (marque como paga)
   - Anote o saldo da carteira

2. **Editar a fatura paga (aumentar valor)**
   - Clique em editar na fatura "Teste Fatura"
   - Altere o valor para: R$ 600,00
   - Salve

3. **Verificar carteira**
   - O saldo da carteira deve ter diminuído em R$ 100,00

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior - R$ 100,00

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 8: Edição de Fatura Pendente ✅

### Objetivo
Verificar se ao editar uma fatura pendente (não paga), a carteira NÃO é afetada.

### Passos
1. **Criar fatura pendente**
   - Acesse a página de faturas
   - Crie uma fatura:
     - Descrição: "Teste Fatura Pendente"
     - Valor: R$ 300,00
     - Status: "PENDING"
   - Anote o saldo da carteira

2. **Editar a fatura pendente**
   - Clique em editar na fatura
   - Altere o valor para: R$ 500,00
   - Salve

3. **Verificar carteira**
   - O saldo da carteira deve permanecer o mesmo (fatura não foi paga)

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior (sem mudança)

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 9: Exclusão de Compra com Reembolso ✅

### Objetivo
Verificar se ao deletar uma compra, o valor é devolvido à carteira.

### Passos
1. **Criar compra**
   - Acesse a página de compras
   - Crie uma compra:
     - Descrição: "Teste Exclusão"
     - Valor: R$ 250,00
   - Anote o saldo da carteira

2. **Deletar a compra**
   - Selecione a compra "Teste Exclusão"
   - Clique em deletar
   - Confirme a exclusão

3. **Verificar carteira**
   - O saldo da carteira deve ter aumentado em R$ 250,00

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior + R$ 250,00

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 10: Exclusão de Fatura Paga com Reembolso ✅

### Objetivo
Verificar se ao deletar uma fatura paga, o valor é devolvido à carteira.

### Passos
1. **Criar e pagar fatura**
   - Acesse a página de faturas
   - Crie uma fatura:
     - Descrição: "Teste Exclusão Fatura"
     - Valor: R$ 350,00
   - Pague a fatura
   - Anote o saldo da carteira

2. **Deletar a fatura**
   - Selecione a fatura "Teste Exclusão Fatura"
   - Clique em deletar
   - Confirme a exclusão

3. **Verificar carteira**
   - O saldo da carteira deve ter aumentado em R$ 350,00

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior + R$ 350,00

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 11: Exclusão de Fatura Pendente (Sem Reembolso) ✅

### Objetivo
Verificar se ao deletar uma fatura pendente, a carteira NÃO é afetada.

### Passos
1. **Criar fatura pendente**
   - Acesse a página de faturas
   - Crie uma fatura:
     - Descrição: "Teste Exclusão Pendente"
     - Valor: R$ 400,00
     - Status: "PENDING"
   - Anote o saldo da carteira

2. **Deletar a fatura**
   - Selecione a fatura "Teste Exclusão Pendente"
   - Clique em deletar
   - Confirme a exclusão

3. **Verificar carteira**
   - O saldo da carteira deve permanecer o mesmo

### Resultado Esperado
✅ Saldo da Carteira = Saldo Anterior (sem mudança)

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 12: Transações Atômicas ✅

### Objetivo
Verificar se em caso de erro, nenhuma operação é aplicada (rollback).

### Passos
1. **Simular erro no meio da transação**
   - Este teste requer modificação temporária do código
   - Adicione um `throw new Error('Teste')` no meio de uma transação
   - Tente criar uma compra

2. **Verificar consistência**
   - A compra NÃO deve ser criada
   - A carteira NÃO deve ser debitada
   - Banco de dados deve estar consistente

### Resultado Esperado
✅ Nenhuma mudança aplicada (rollback completo)

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Teste 13: Isolamento de Usuários ✅

### Objetivo
Verificar se um usuário não pode editar/deletar compras de outro usuário.

### Passos
1. **Criar dois usuários**
   - Usuário A
   - Usuário B

2. **Criar compra como Usuário A**
   - Login como Usuário A
   - Crie uma compra
   - Anote o ID da compra

3. **Tentar editar como Usuário B**
   - Logout e login como Usuário B
   - Tente fazer uma requisição para editar a compra do Usuário A
   - (Pode usar Postman ou DevTools)

4. **Verificar erro**
   - O sistema deve retornar erro: "Compra não encontrada"
   - A compra do Usuário A não deve ser modificada

### Resultado Esperado
✅ Erro: "Compra não encontrada"
✅ Usuário B não consegue editar compra do Usuário A

### Resultado Obtido
- [ ] Passou
- [ ] Falhou

---

## Checklist de Validação Final

### Funcionalidades Corrigidas
- [ ] Compras do mês atual são contabilizadas no gasto mensal
- [ ] Apenas compras com categoria "Assinatura" são contadas
- [ ] Edição de compra (aumento de valor) debita da carteira
- [ ] Edição de compra (redução de valor) credita na carteira
- [ ] Edição de compra sem mudança de valor não afeta carteira
- [ ] Edição com saldo insuficiente é bloqueada
- [ ] Edição de fatura paga ajusta a carteira
- [ ] Edição de fatura pendente não afeta carteira
- [ ] Exclusão de compra reembolsa o valor
- [ ] Exclusão de fatura paga reembolsa o valor
- [ ] Exclusão de fatura pendente não afeta carteira

### Arquitetura MVC
- [ ] Estrutura de pastas segue padrão MVC
- [ ] Controllers apenas delegam para services
- [ ] Services contêm lógica de negócio
- [ ] Configurações centralizadas em config/
- [ ] Nomes de pastas em lowercase (convenção)

### Qualidade de Código
- [ ] Uso de transações em operações críticas
- [ ] Tratamento de erros adequado
- [ ] Validações de entrada
- [ ] Mensagens de erro claras
- [ ] Código limpo e organizado
- [ ] Comentários onde necessário

---

## Relatório de Bugs (se encontrados)

### Bug 1
- **Descrição:**
- **Passos para reproduzir:**
- **Comportamento esperado:**
- **Comportamento observado:**

### Bug 2
- **Descrição:**
- **Passos para reproduzir:**
- **Comportamento esperado:**
- **Comportamento observado:**

---

## Conclusão dos Testes

**Data:** ___/___/______  
**Testador:** _________________  
**Resultado Geral:** [ ] Aprovado [ ] Reprovado  

**Observações:**
