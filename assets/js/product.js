// AREA DE DESCRIÇÃO
let descButton = document.querySelector('[data-role="desc-toggle"]');
let descBody = document.querySelector('[data-role="desc-body"]');
const API_URL = 'https://backend-loja-psi.vercel.app/api';
let currentProduct = null;

if (descButton && descBody) {
    descButton.addEventListener('click', () => {
        descBody.classList.toggle('hidden');
    });
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showMessage(text, type = 'error') {
    const message = document.getElementById('product-message');
    if (!message) return;

    message.textContent = text;
    message.className = `mt-5 rounded border px-5 py-4 text-sm ${type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`;
}

function getProductImage(product) {
    return product.image || product.image_url || 'assets/images/products/camiseta-css.png';
}

function getProductFromList(data, productId) {
    if (Array.isArray(data)) return data.find(product => String(product.id || product.uuid) === String(productId));
    if (data?.product) return data.product;
    if (data?.data && !Array.isArray(data.data)) return data.data;
    if (Array.isArray(data?.data)) return data.data.find(product => String(product.id || product.uuid) === String(productId));
    if (Array.isArray(data?.products)) return data.products.find(product => String(product.id || product.uuid) === String(productId));
    return data;
}

async function fetchProduct(productId) {
    let response = await fetch(`${API_URL}/products/${encodeURIComponent(productId)}`);
    let text = await response.text();
    let data = text ? JSON.parse(text) : null;

    if (response.ok) {
        return getProductFromList(data, productId);
    }

    response = await fetch(`${API_URL}/products`);
    text = await response.text();
    data = text ? JSON.parse(text) : [];

    if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Erro ao carregar produto.');
    }

    const product = getProductFromList(data, productId);
    if (!product) throw new Error('Produto não encontrado.');
    return product;
}

function renderProduct(product) {
    currentProduct = product;

    document.getElementById('product-code').textContent = product.id || product.uuid || '---';
    document.getElementById('product-name').textContent = product.name || 'Produto sem nome';
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-description').textContent = product.description || 'Produto sem descrição.';
    document.getElementById('product-breadcrumb').textContent = `Home > ${product.category || 'Produtos'} > ${product.name || 'Produto'}`;

    const image = document.getElementById('product-image');
    image.src = getProductImage(product);
    image.alt = product.name || 'Produto';
}

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        showMessage('Produto sem código. Volte para a página de produtos e selecione um item.');
        return;
    }

    try {
        const product = await fetchProduct(productId);
        renderProduct(product);
    } catch (error) {
        showMessage(error.message);
    }
}

function addToCart() {
    if (!currentProduct) {
        showMessage('Produto ainda não carregado.');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const id = currentProduct.id || currentProduct.uuid;
    const item = cart.find(product => String(product.id) === String(id));

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({
            id,
            name: currentProduct.name,
            price: Number(currentProduct.price || 0),
            image: getProductImage(currentProduct),
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    showMessage('Produto adicionado à sacola.', 'success');
}

document.getElementById('add-to-cart')?.addEventListener('click', addToCart);
loadProduct();
