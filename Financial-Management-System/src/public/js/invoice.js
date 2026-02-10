
async function loadInvoiceSummary() {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch('http://localhost:3000/api/invoice/getInvoice', {
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
        const invoiceList = data.invoices || []
        if (Array.isArray(invoiceList)) {
            fullOutInvoices(invoiceList)
        }
    }catch(err) {
        console.error("Error loading data:", err)
    }
}

function formatCoin(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function fullOutInvoices(invoiceList) {
    const tbody = document.querySelector('#tblInvoices tbody')
    if (!tbody) return
    tbody.innerHTML = ''
    if (invoiceList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #888;">Nenhuma fatura encontrada.</td></tr>'
        return
    }
    invoiceList.forEach(invoice => {
        const id = invoice.id;
        const description = invoice.description || 'Sem descrição';
        const dateRaw = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
        const formattedDate = dateRaw.toLocaleDateString('pt-BR');
        const status = invoice.status || 'PENDING';
        const value = (invoice.value !== undefined) ? invoice.value : (invoice.amount || 0);
        const formattedValue = formatCoin(value)
        
        let statusClass = 'status'
        let statusText = status;
        if (status === 'PAID') { statusClass += ' pago'; statusText = 'Pago'; }
        else if (status === 'PENDING') { statusClass += ' pendente'; statusText = 'Pendente'; }
        else if (status === 'OVERDUE') { statusClass += ' atrasado'; statusText = 'Atrasado'; }

        tbody.innerHTML += `
        <tr>
          <td><input type="checkbox" class="row-checkbox" data-id="${id}"></td>
          <td>${description}</td>
          <td>${formattedDate}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>${formattedValue}</td>
          <td>
            <button class="action-icon edit" onclick="openEditInvoiceModal(${JSON.stringify(invoice).replace(/"/g, '&quot;')})" title="Editar">✏️</button>
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
        const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
        if (btnDelete) btnDelete.style.display = checkedCount > 0 ? 'inline-block' : 'none';
        if (btnPay) btnPay.style.display = checkedCount > 0 ? 'inline-block' : 'none';
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

function openNewInvoiceModal() {
    createStyledModal('Nova Fatura', 'formNewInvoice', [
        { label: 'Descrição *', type: 'text', id: 'inputInvDescription', required: true },
        { label: 'Valor (R$) *', type: 'number', id: 'inputInvAmount', required: true, step: '0.01' },
        { label: 'Data de Vencimento *', type: 'date', id: 'inputInvDueDate', required: true }
    ], handleCreateInvoice);
}

async function handleCreateInvoice() {
    const description = document.getElementById('inputInvDescription').value;
    const amount = document.getElementById('inputInvAmount').value;
    const dueDate = document.getElementById('inputInvDueDate').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/invoice/createInvoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ description, amount: parseFloat(amount), dueDate, status: 'PENDING' })
        });
        if (response.ok) {
            alert('Fatura criada!');
            document.getElementById('dynamicModal').remove();
            loadInvoiceSummary();
        } else {
            const data = await response.json();
            alert(data.error || 'Erro ao criar');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao criar');
    }
}

function openEditInvoiceModal(invoice) {
    createStyledModal('Editar Fatura', 'formEditInvoice', [
        { label: 'Descrição *', type: 'text', id: 'editInvDescription', required: true, value: invoice.description },
        { label: 'Valor (R$) *', type: 'number', id: 'editInvAmount', required: true, step: '0.01', value: invoice.amount || invoice.value },
        { label: 'Data de Vencimento *', type: 'date', id: 'editInvDueDate', required: true, value: invoice.dueDate ? invoice.dueDate.split('T')[0] : '' }
    ], () => handleUpdateInvoice(invoice.id));
}

async function handleUpdateInvoice(id) {
    const description = document.getElementById('editInvDescription').value;
    const amount = document.getElementById('editInvAmount').value;
    const dueDate = document.getElementById('editInvDueDate').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/invoice/updateInvoice/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ description, amount: parseFloat(amount), dueDate })
        });
        if (response.ok) {
            alert('Fatura atualizada!');
            document.getElementById('dynamicModal').remove();
            loadInvoiceSummary();
        } else {
            alert('Erro ao atualizar');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao atualizar');
    }
}

async function paySelectedInvoices() {
    const selected = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => Number(cb.dataset.id));
    if (selected.length === 0) return;
    if (!confirm(`Deseja pagar ${selected.length} fatura(s)? O valor será debitado da sua carteira.`)) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/invoice/payInvoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ids: selected })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            loadInvoiceSummary();
        } else {
            alert(data.error || 'Erro ao processar pagamento');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao processar pagamento');
    }
}

async function deleteSelectedInvoices() {
    const selected = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => Number(cb.dataset.id));
    if (selected.length === 0) return;
    if (!confirm(`Deseja excluir ${selected.length} fatura(s)?`)) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/invoice/invoices/deleteMultipleInvoices', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ids: selected })
        });
        if (response.ok) {
            alert('Faturas excluídas!');
            loadInvoiceSummary();
        } else {
            alert('Erro ao excluir');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadInvoiceSummary();
    const btnNew = document.getElementById('addInvoice');
    if (btnNew) btnNew.addEventListener('click', openNewInvoiceModal);
    const btnPay = document.getElementById('btnPaySelected');
    if (btnPay) btnPay.addEventListener('click', paySelectedInvoices);
    const btnDel = document.getElementById('btnDeleteSelected');
    if (btnDel) btnDel.addEventListener('click', deleteSelectedInvoices);
});
