async function loadSidebar() {
  try {
    const response = await fetch('./sidebar.html');
    const html = await response.text()
    document.getElementById('sidebar-container').innerHTML = html
    highlightCurrentLink()
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }
  } catch (error) {
    console.error('Error loading sidebar:', error)
  }
}

function highlightCurrentLink() {
  // Remove active de todos primeiro
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

  const currentPage = window.location.pathname.split('/').pop()
  let linkId = ''
  if (currentPage === 'overview.html' || currentPage === 'index.html' || currentPage === '') {
    linkId = 'link-overview'
  } else if (currentPage === 'shopping.html') {
    linkId = 'link-shopping'
  } else if (currentPage === 'invoice.html') {
    linkId = 'link-invoice'
  } else if (currentPage === 'profile.html') {
    linkId = 'link-profile'
  }
  
  if (linkId) {
    const linkAtivo = document.getElementById(linkId)
    if (linkAtivo) linkAtivo.classList.add('active')
  }
}

loadSidebar()

function formatCoin(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function loadFinancialSummary() {
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = 'login.html'
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/finance/summary', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 401) {
            logout();
            return;
        }
        const data = await response.json()
        const elGasto = document.getElementById('spenseValue')
        if (elGasto) elGasto.innerText = formatCoin(data.expenses || 0)
        const elPend = document.getElementById('pendingStatus')
        if (elPend) elPend.innerText = formatCoin(data.pending || 0)
        const elAssin = document.getElementById('sigStatus')
        if (elAssin) elAssin.innerText = data.subscriptions || "0"
        const elWallet = document.getElementById('walletValue')
        if (elWallet) {
            elWallet.innerText = formatCoin(data.balance || 0)
            updateWalletEmoji(data.balance || 0)
        }
        const transactionList = data.transactions || []
        if (Array.isArray(transactionList)) {
            fullOutRecents(transactionList)
        }
    } catch (err) {
        console.error("Error loading data:", err)
    }
}

async function getUserChip() {
    try {
        const token = localStorage.getItem('token')
        if (!token) return;
        const response = await fetch('http://localhost:3000/api/user/getUser', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      })
      if(!response.ok) return;
      const data = await response.json()
      const elNome = document.getElementById('chipUser')
      if(elNome) elNome.innerText = `👤 - ${data.name}`
      const nameInput = document.getElementById('Name');
      if (nameInput && !nameInput.value) loadUserProfile();
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
}
getUserChip()

function fullOutRecents(shoppingList) {
  const tbody = document.querySelector('#tblRecents tbody')
  if (!tbody) return
  tbody.innerHTML = ''; 
  if (shoppingList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #888;">Nenhuma transação recente.</td></tr>'
  }
  shoppingList.forEach(shopping => {
    const description = shopping.description || 'Sem descrição'
    const dataRaw = shopping.date || new Date()
    const category = shopping.category || 'Geral'
    const value = shopping.value || shopping.amount || 0
    const formattedDate = new Date(dataRaw).toLocaleDateString('pt-BR')
    const formattedValue = formatCoin(value)
    tbody.innerHTML += `
      <tr>
        <td>${description}</td>
        <td>${formattedDate}</td>
        <td><span class="chip">${category}</span></td>
        <td>${formattedValue}</td>
      </tr>
    `
  });
}

function updateWalletEmoji(balance) {
    const emojiEl = document.getElementById('wallet-character');
    if (!emojiEl) return;
    if (balance < 100) emojiEl.innerText = '😢';
    else if (balance < 500) emojiEl.innerText = '😟';
    else if (balance < 1000) emojiEl.innerText = '😐';
    else if (balance < 5000) emojiEl.innerText = '🙂';
    else emojiEl.innerText = '😎';
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function handleTransaction(type) {
    const isAdd = type === 'add';
    const title = isAdd ? 'Depositar Valor' : 'Sacar Valor';
    createStyledModal(title, 'walletForm', [
        { label: 'Valor (R$)', type: 'number', id: 'transactionAmount', required: true, step: '0.01' }
    ], async () => {
        const amount = document.getElementById('transactionAmount').value;
        const token = localStorage.getItem('token');
        const endpoint = isAdd ? '/api/finance/wallet/add' : '/api/finance/wallet/remove';
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Erro ao processar transação');
                return;
            }
            alert(data.message);
            document.getElementById('dynamicModal').remove();
            loadFinancialSummary();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao processar transação');
        }
    });
}

async function loadUserProfile() {
    const nameInput = document.getElementById('Name');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('Cpf');
    const phoneInput = document.getElementById('Phone');
    if (!nameInput) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/user/getUser', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            nameInput.value = user.name || '';
            emailInput.value = user.email || '';
            cpfInput.value = user.cpf || '';
            phoneInput.value = user.telefone || '';
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

async function saveUserProfile() {
    const name = document.getElementById('Name').value;
    const email = document.getElementById('email').value;
    const cpf = document.getElementById('Cpf').value;
    const telefone = document.getElementById('Phone').value;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/user/updateUser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, cpf, telefone })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Perfil atualizado com sucesso!');
            getUserChip();
        } else {
            alert(data.message || 'Erro ao atualizar perfil');
        }
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        alert('Erro ao salvar perfil');
    }
}

function createStyledModal(title, formId, fields, submitCallback) {
    const modalId = 'dynamicModal';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();
    const fieldsHTML = fields.map(field => `
        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; color: var(--sub); font-size: 0.9rem;">${field.label}</label>
            <input type="${field.type}" id="${field.id}" ${field.required ? 'required' : ''} 
                step="${field.step || 'any'}" 
                value="${field.value || ''}"
                style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text); outline: none;">
        </div>
    `).join('');
    const modalHTML = `
        <div id="${modalId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
            <div class="card" style="padding: 28px; width: 90%; max-width: 450px; background: var(--panel); border: 1px solid var(--border);">
                <h3 style="margin-top: 0; margin-bottom: 20px; color: var(--text);">${title}</h3>
                <form id="${formId}">
                    ${fieldsHTML}
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                        <button type="button" onclick="document.getElementById('${modalId}').remove()" class="btn ghost" style="padding: 10px 20px;">Cancelar</button>
                        <button type="submit" class="btn" style="padding: 10px 20px;">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById(formId).addEventListener('submit', (e) => {
        e.preventDefault();
        submitCallback();
    });
}

function setupFilters(tableId, searchInputId, statusSelectId) {
    const searchInput = document.getElementById(searchInputId);
    const statusSelect = document.getElementById(statusSelectId);
    const filterTable = () => {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusTerm = statusSelect ? statusSelect.value.toLowerCase() : '';
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const statusCell = row.querySelector('.status, .chip, .success');
            const status = statusCell ? statusCell.innerText.toLowerCase() : '';
            const matchesSearch = text.includes(searchTerm);
            const matchesStatus = statusTerm === '' || status.includes(statusTerm);
            if (matchesSearch && matchesStatus) row.classList.remove('hidden');
            else row.classList.add('hidden');
        });
    };
    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (statusSelect) statusSelect.addEventListener('change', filterTable);
}

window.addEventListener('DOMContentLoaded', () => {
    loadFinancialSummary();
    loadUserProfile();
    const btnSave = document.getElementById('btnSaveProfile');
    if (btnSave) btnSave.addEventListener('click', saveUserProfile);
    setupFilters('tblShoppings', 'searchShopping', 'filterStatus');
    setupFilters('tblInvoices', 'searchInvoice', 'filterStatus');
});