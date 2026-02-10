
function toggleAuth() {
    const loginForm = document.getElementById('loginForm');
    const loginTitle = document.getElementById('loginTitle');
    const subLogin = document.getElementById('subLogin');
    const isLogin = loginForm.querySelector('h2').innerText === 'Entrar';

    if (isLogin) {
        loginTitle.innerText = 'Crie sua conta agora';
        subLogin.innerText = 'Preencha os dados abaixo para começar a gerenciar suas finanças.';
        loginForm.innerHTML = `
            <h2>Cadastrar</h2>
            <label for="name">Nome Completo</label>
            <input id="name" name="name" type="text" placeholder="Seu nome" required />
            <label for="email">Email</label>
            <input id="email" name="email" type="email" placeholder="seu@email.com" required />
            <label for="password">Senha</label>
            <input id="password" name="password" type="password" placeholder="Sua senha" required />
            <div class="divider"></div>
            <button class="btn" type="submit">Criar Conta</button>
            <p class="muted" style="margin-top:10px; cursor:pointer" onclick="toggleAuth()">Já tem uma conta? <span style="color:var(--brand); font-weight:bold">Entrar</span></p>
        `;
    } else {
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // Adicionar link de cadastro inicialmente
    const pDica = loginForm.querySelector('.muted');
    if (pDica) {
        pDica.innerHTML += ' <span style="color:var(--brand); cursor:pointer; font-weight:bold" onclick="toggleAuth()">Cadastre-se aqui.</span>';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isRegister = loginForm.querySelector('h2').innerText === 'Cadastrar';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = isRegister ? document.getElementById('name').value : null;

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        const body = isRegister ? { name, email, password } : { email, password };
        
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Aguarde...';
        btn.disabled = true;

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (response.ok) {
                if (isRegister) {
                    alert('Conta criada com sucesso! Agora faça login.');
                    window.location.reload();
                } else {
                    localStorage.setItem('token', result.token);
                    window.location.href = 'overview.html';
                }
            } else {
                alert(result.message || 'Erro na operação');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});
