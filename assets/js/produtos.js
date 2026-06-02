let infoShown = '';
let infoButtons = document.querySelectorAll('[data-role="top-button"]');
let orderArea = document.querySelector('[data-role="order-area"]');
let filtersArea = document.querySelector('[data-role="filters-area"]');
const API_URL = 'https://backend-loja-psi.vercel.app/api';

infoButtons.forEach((item) => {
    item.addEventListener('click', () => {
        let name = item.getAttribute('data-name');
        if (name === infoShown) {
            infoShown = '';
        } else {
            infoShown = name;
        }
        renderInfo();
    });
})

function renderInfo() {
    orderArea.classList.add('hidden');
    filtersArea.classList.add('hidden');

    switch (infoShown) {
        case 'order':
            orderArea.classList.remove('hidden');
            break;
        case 'filter':
            filtersArea.classList.remove('hidden');
            break;
    }
}

// AREA DO FILTRO
let filterIcons = document.querySelectorAll('[data-role="filter-icon"]');
filterIcons.forEach(item => {
    item.addEventListener('click', () => {
        let body = item.closest('[data-role="filter"]').querySelector('[data-role="filter-body"]');
        body.classList.toggle('hidden');
    });
});

function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
}

function getProductList(data) {
    if (Array.isArray(data)) return data;
    return data?.products || data?.data || [];
}

async function loadProducts() {
    const grid = document.getElementById('products-grid');
    const counter = document.getElementById('products-count');

    if (!grid || !counter) return;

    grid.innerHTML = '<div class="rounded-xl border border-[#D9D9D9] bg-white p-8 text-center text-[#7F7F7F] lg:col-span-3">Carregando produtos...</div>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];

        if (!response.ok) {
            throw new Error(data?.error || data?.message || 'Erro ao carregar produtos.');
        }

        const products = getProductList(data);
        counter.textContent = products.length;

        if (products.length === 0) {
            grid.innerHTML = '<div class="rounded-xl border border-[#D9D9D9] bg-white p-8 text-center text-[#7F7F7F] lg:col-span-3">Nenhum produto cadastrado.</div>';
            return;
        }

        grid.innerHTML = products.map(product => {
            const id = product.id || product.uuid || '';
            const name = product.name || 'Produto sem nome';
            const image = product.image || product.image_url || 'assets/images/products/camiseta-css.png';

            return `
                <div class="relative rounded-xl border border-[#D9D9D9] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg lg:p-5">
                    <a class="block" href="product.html${id ? `?id=${encodeURIComponent(id)}` : ''}">
                        <img class="h-64 w-full object-contain" src="${escapeHtml(image)}" alt="${escapeHtml(name)}" />
                        <div class="pt-10 text-lg font-bold">${escapeHtml(name)}</div>
                        <div class="my-2 text-2xl font-bold text-brand">${formatPrice(product.price)}</div>
                        <div class="text-lg text-[#7F7F7F]">Pagamento via PIX</div>
                    </a>
                    <button class="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded border border-[#B7B7B7] bg-white"><img class="h-6 w-6" src="assets/images/ui/heart-3-line.png" alt="" /></button>
                </div>
            `;
        }).join('');
    } catch (error) {
        counter.textContent = '0';
        grid.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700 lg:col-span-3">${escapeHtml(error.message)}</div>`;
    }
}

loadProducts();
