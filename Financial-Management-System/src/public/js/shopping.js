async function loadShoppingSummary() {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch('http://localhost:3000/api/shopping/getShopping', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if (response.status === 401) {
            logout();
            return
        }
        const data = await response.json()
        const shoppingList = data.shopping || []
        if (Array.isArray(shoppingList)) {
            fullOutShoppings(shoppingList)
        }
    }catch(err) {
        console.error("Error loading data:", err)
    }
}

function formatCoin(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function fullOutShoppings(shoppingList) {
    const tbody = document.querySelector('#tblShoppings tbody')
    if (!tbody) return
    tbody.innerHTML = ''
    if (shoppingList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: #888;">Nenhuma compra encontrada.</td></tr>'
        return
    }
    shoppingList.forEach(shopping => {
        const id = shopping.id;
        const description = shopping.description || 'Sem descrição';
        const store = shopping.store || 'Sem loja';
        const dateRaw = shopping.date ? new Date(shopping.date) : new Date();
        const formattedDate = dateRaw.toLocaleDateString('pt-BR');
        const status = shopping.status || 'PENDENTE';
        const value = (shopping.value !== undefined) ? shopping.value : (shopping.amount || 0);
        const formattedValue = formatCoin(value)
        
        let statusClass = 'status'
        if (status.toUpperCase() === 'PAGO') statusClass += ' pago';
        else if (status.toUpperCase() === 'PENDENTE') statusClass += ' pendente';

        tbody.innerHTML += `
        <tr>
          <td><input type="checkbox" class="row-checkbox" data-id="${id}" data-status="${status.toUpperCase()}"></td>
          <td>${description}</td>
          <td>${store}</td>
          <td>${formattedDate}</td>
          <td><span class="${statusClass}">${status}</span></td>
          <td>${formattedValue}</td>
          <td>
            <button class="action-icon edit" onclick="openEditShoppingModal(${JSON.stringify(shopping).replace(/"/g, '&quot;')})" title="Editar">✏️</button>
          </td>
        </tr>
        `
    });
    setupCheckboxListeners();
}

function setupCheckboxListeners() {
    const selectAll = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const btnDelete = document.getElementById('btnDeleteSelected');
    const btnPay = document.getElementById('btnPaySelected');
    
    const updateUI = () => {
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        const checkedCount = checkedBoxes.length;
        
        // Mostrar/Esconder botão de deletar
        if (btnDelete) {
            btnDelete.style.display = checkedCount > 0 ? 'inline-block' : 'none';
            btnDelete.innerText = checkedCount > 1 ? `Deletar (${checkedCount})` : 'Deletar Selecionado';
        }
        
        // Mostrar/Esconder botão de pagar (apenas se houver pendentes selecionados)
        if (btnPay) {
            const pendingSelected = Array.from(checkedBoxes).filter(cb => cb.dataset.status === 'PENDENTE').length;
            btnPay.style.display = pendingSelected > 0 ? 'inline-block' : 'none';
            btnPay.innerText = pendingSelected > 1 ? `Pagar (${pendingSelected})` : 'Pagar Selecionado';
        }
    };
    
    if (selectAll) {
        selectAll.onclick = () => {
            rowCheckboxes.forEach(cb => cb.checked = selectAll.checked);
            updateUI();
        };
    }
    
    rowCheckboxes.forEach(cb => {
        cb.onclick = () => {
            if (!cb.checked) selectAll.checked = false;
            if (document.querySelectorAll('.row-checkbox:checked').length === rowCheckboxes.length) selectAll.checked = true;
            updateUI();
        };
    });
}

function openNewShoppingModal() {
    createStyledModal('Nova Compra', 'formNewShopping', [
        { label: 'Descrição *', type: 'text', id: 'inputDescription', required: true },
        { label: 'Loja', type: 'text', id: 'inputStore' },
        { label: 'Categoria', type: 'text', id: 'inputCategory' },
        { label: 'Valor (R$) *', type: 'number', id: 'inputValue', required: true, step: '0.01' },
        { label: 'Data', type: 'date', id: 'inputDate' }
    ], handleCreateShopping);
}

async function handleCreateShopping() {
    const description = document.getElementById('inputDescription').value;
    const store = document.getElementById('inputStore').value;
    const category = document.getElementById('inputCategory').value;
    const value = document.getElementById('inputValue').value;
    const date = document.getElementById('inputDate').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/shopping/createShopping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description, store, category, value: parseFloat(value), date: date || new Date().toISOString() })
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.error || 'Erro ao criar compra');
            return;
        }
        alert(data.message);
        document.getElementById('dynamicModal').remove();
        loadShoppingSummary();
    } catch (error) {
        console.error('Erro ao criar compra:', error);
        alert('Erro ao criar compra');
    }
}

function openEditShoppingModal(shopping) {
    createStyledModal('Editar Compra', 'formEditShopping', [
        { label: 'Descrição *', type: 'text', id: 'editDescription', required: true, value: shopping.description },
        { label: 'Loja', type: 'text', id: 'editStore', value: shopping.store },
        { label: 'Categoria', type: 'text', id: 'editCategory', value: shopping.category },
        { label: 'Valor (R$) *', type: 'number', id: 'editValue', required: true, step: '0.01', value: shopping.value },
        { label: 'Data', type: 'date', id: 'editDate', value: shopping.date ? shopping.date.split('T')[0] : '' },
        { label: 'Status', type: 'select', id: 'editStatus', options: [
            { value: 'PENDENTE', label: 'Pendente', selected: shopping.status.toUpperCase() === 'PENDENTE' },
            { value: 'PAGO', label: 'Pago', selected: shopping.status.toUpperCase() === 'PAGO' }
        ]}
    ], () => handleUpdateShopping(shopping.id));
}

async function handleUpdateShopping(id) {
    const description = document.getElementById('editDescription').value;
    const store = document.getElementById('editStore').value;
    const category = document.getElementById('editCategory').value;
    const value = document.getElementById('editValue').value;
    const date = document.getElementById('editDate').value;
    const status = document.getElementById('editStatus').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/shopping/updateShopping/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description, store, category, value: parseFloat(value), date, status })
        });
        if (response.ok) {
            alert('Compra atualizada!');
            document.getElementById('dynamicModal').remove();
            loadShoppingSummary();
        } else {
            const data = await response.json();
            alert(data.error || 'Erro ao atualizar');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao atualizar');
    }
}

async function paySelectedShoppings() {
    const selected = Array.from(document.querySelectorAll('.row-checkbox:checked'))
        .filter(cb => cb.dataset.status === 'PENDENTE')
        .map(cb => cb.dataset.id);
        
    if (selected.length === 0) return;
    if (!confirm(`Deseja pagar ${selected.length} compra(s) selecionada(s)? O valor será debitado da sua carteira.`)) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/shopping/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids: selected })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Compras pagas com sucesso!');
            loadShoppingSummary();
        } else {
            alert(data.error || 'Erro ao processar pagamento');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao processar pagamento');
    }
}

async function deleteSelectedShoppings() {
    const selected = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.dataset.id);
    if (selected.length === 0) return;
    if (!confirm(`Deseja excluir ${selected.length} item(ns)?`)) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/shopping', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids: selected })
        });
        if (response.ok) {
            alert('Itens excluídos!');
            loadShoppingSummary();
        } else {
            alert('Erro ao excluir');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadShoppingSummary();
    const btnNew = document.getElementById('btnNewShopping');
    if (btnNew) btnNew.addEventListener('click', openNewShoppingModal);
    
    const btnDel = document.getElementById('btnDeleteSelected');
    if (btnDel) btnDel.addEventListener('click', deleteSelectedShoppings);
    
    const btnPay = document.getElementById('btnPaySelected');
    if (btnPay) btnPay.addEventListener('click', paySelectedShoppings);
});