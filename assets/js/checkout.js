const API_URL = 'https://backend-loja-psi.vercel.app/api';

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
}

function showMessage(text, type = 'error') {
    const message = document.getElementById('checkout-message');
    if (!message) return;

    message.textContent = text;
    message.className = `mt-4 rounded border px-4 py-3 text-sm ${type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`;
}

function getTotal(cart) {
    return cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0);
}

function renderCart() {
    const cart = getCart();
    const cartItems = document.getElementById('cart-items');
    const count = cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
    const total = getTotal(cart);

    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-subtotal').textContent = formatPrice(total);
    document.getElementById('cart-total').textContent = formatPrice(total);

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="p-8 text-center text-[#7F7F7F]">Sua sacola está vazia.</div>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="flex gap-4 p-6 lg:border-b lg:border-[#D9D9D9]">
            <div class="flex h-24 w-24 items-center justify-center border border-[#D9D9D9] p-4"><img class="w-full" src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name || '')}" /></div>
            <div class="flex-1">
                <div class="text-sm">${escapeHtml(item.name || 'Produto')}</div>
                <div class="mt-4 flex">
                    <button class="flex h-12 w-12 items-center justify-center rounded-l border border-[#D9D9D9] hover:bg-black/5" data-cart-action="decrease" data-id="${escapeHtml(item.id)}">-</button>
                    <div class="flex h-12 w-12 items-center justify-center border-y border-[#D9D9D9] text-lg text-[#7F7F7F]">${String(item.quantity || 1).padStart(2, '0')}</div>
                    <button class="flex h-12 w-12 items-center justify-center rounded-r border border-[#D9D9D9] hover:bg-black/5" data-cart-action="increase" data-id="${escapeHtml(item.id)}">+</button>
                </div>
            </div>
            <div class="flex flex-col items-end"><div class="mb-5 text-lg text-brand">${formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}</div><button class="flex h-12 w-12 items-center justify-center rounded border border-[#D9D9D9] hover:bg-black/5" data-cart-action="remove" data-id="${escapeHtml(item.id)}"><img class="h-6 w-6" src="assets/images/ui/trash.png" alt="" /></button></div>
        </div>
    `).join('');
}

function updateCart(action, id) {
    let cart = getCart();
    const item = cart.find(product => String(product.id) === String(id));

    if (action === 'remove') {
        cart = cart.filter(product => String(product.id) !== String(id));
    } else if (item && action === 'increase') {
        item.quantity += 1;
    } else if (item && action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) cart = cart.filter(product => String(product.id) !== String(id));
    }

    saveCart(cart);
    renderCart();
}

async function finishOrder() {
    const cart = getCart();
    // Pegamos o token, mas ele não será mais obrigatório para bloquear o clique
    const token = localStorage.getItem('token');

    if (cart.length === 0) {
        showMessage('Sua sacola está vazia.');
        return;
    }

    // COMENTAMOS OU REMOVEMOS A TRAVA:
    /*
    if (!token) {
        showMessage('Faça login antes de finalizar o pedido.');
        return;
    }
    */

    const payload = {
        total: getTotal(cart),
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        // Opcional: Adicionar uma marcação de que é convidado se não houver token
        is_guest: !token 
    };

    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Só adiciona o Authorization se o token existir
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            throw new Error(data?.error || data?.message || 'Erro ao finalizar pedido.');
        }

        localStorage.removeItem('cart');
        renderCart();
        showMessage('Pedido criado com sucesso!', 'success');
        
        // Opcional: Redirecionar para uma página de sucesso
        // setTimeout(() => { window.location.href = 'index.html'; }, 2000);

    } catch (error) {
        showMessage(error.message);
    }
}
document.getElementById('cart-items')?.addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    updateCart(button.dataset.cartAction, button.dataset.id);
});

document.getElementById('finish-order')?.addEventListener('click', finishOrder);
renderCart();
