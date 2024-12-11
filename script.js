document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';

    async function fetchData() {
        try {
            const response = await fetch('produit.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displayData(data);
        } catch (error) {
            console.error('Il y a eu un problème avec la récupération des données:', error);
        }
    }

    function displayData(data) {
        const carousel = document.querySelector('.carrousel');
        carousel.innerHTML = '';

        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('produit');
            div.innerHTML = `
                <img src="${item.image}" alt="${item.nom}" class="produit-image">
                <div class="info-produit">
                    <div class="nom-produit">${item.nom}</div>
                    <div class="details">${item.details}</div>
                    <div class="prix">${item.prix}</div>
                    <div class="avis">${item.avis}</div>
                </div>
            `;
            carousel.appendChild(div);
        });
    }

    await fetchData();

    const filterInput = document.querySelector('input[type="text"]');
    const filterSelect = document.querySelector('select');

    filterInput.value = searchQuery;

    if (filterInput && filterSelect) {
        filterInput.addEventListener('input', filterProducts);
        filterSelect.addEventListener('change', filterProducts);
    } else {
        console.error('Les éléments de filtrage n\'ont pas été trouvés.');
    }

    function filterProducts() {
        const searchTerm = filterInput.value.toLowerCase();
        const selectedCategory = filterSelect.value;
        const productItems = document.querySelectorAll('.produit');

        productItems.forEach(item => {
            const productName = item.querySelector('.nom-produit').textContent.toLowerCase();
            const productCategory = item.getAttribute('data-category');

            const matchesSearch = productName.includes(searchTerm);
            const matchesCategory = selectedCategory === '' || productCategory === selectedCategory;

            item.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
        });
    }
});

// Gestion du carrousel de produits
let productCarousel;

document.addEventListener("DOMContentLoaded", async function() {
    productCarousel = document.getElementById('product-carousel');
    const productsPerPage = 18;
    let currentPage = 1;
    let products = [];
    let selectedCategory = localStorage.getItem('selectedCategory') || '';
    let searchQuery = localStorage.getItem('searchQuery') || '';

    const categoryFilter = document.querySelector('.filter-bar select');
    categoryFilter.value = selectedCategory;

    const searchInput = document.querySelector('.filter-bar input[type="text"]');
    searchInput.value = searchQuery;

    await fetchData();

    function fetchData() {
        return new Promise(async (resolve) => {
            try {
                const response = await fetch('produits2.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                products = await response.json();
                displayProducts();
                setupPagination();
                setupProductClick();
                resolve();
            } catch (error) {
                console.error('Il y a eu un problème avec la récupération des données:', error);
            }
        });
    }
    
    function displayProducts() {
        productCarousel.innerHTML = '';
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
    
        const productsToDisplay = products.filter(product => {
            const matchesCategory = selectedCategory === '' || product.categorie === selectedCategory;
            const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        }).slice(start, end);
    
        if (productsToDisplay.length === 0) {
            const message = document.createElement('div');
            message.classList.add('no-products-message');
            message.innerText = "Aucun produit trouvé.";
            productCarousel.appendChild(message);
        } else {
            productsToDisplay.forEach(product => {
                const div = document.createElement('div');
                div.classList.add('product-item');
                div.innerHTML = `
                    <img src="${product.image}" alt="${product.nom}" class="produit-image">
                    <div class="info-produit">
                        <div class="nom-produit">${product.nom}</div>
                        <div class="prix">${product.prix}</div>
                        <div class="avis">${product.avis}</div>
                    </div>
                `;
                productCarousel.appendChild(div);
            });
        }
    }

    function setupPagination() {
        const totalPages = Math.ceil(products.filter(product => {
            const matchesCategory = selectedCategory === '' || product.categorie === selectedCategory;
            const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        }).length / productsPerPage);
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.addEventListener('click', () => {
                currentPage = i;
                displayProducts();
            });
            paginationContainer.appendChild(button);
        }
    }

    categoryFilter.addEventListener('change', (event) => {
        selectedCategory = event.target.value;
        localStorage.setItem('selectedCategory', selectedCategory);
        currentPage = 1;
        displayProducts();
        setupPagination();
    });

    searchInput.addEventListener('input', (event) => {
        searchQuery = event.target.value;
        localStorage.setItem('searchQuery', searchQuery);
        currentPage = 1;
        displayProducts();
        setupPagination();
    });
});

function setupProductClick() {
    productCarousel.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.product-item');
        if (clickedItem) {
            const productName = clickedItem.querySelector('.nom-produit').innerText;
            const productImage = clickedItem.querySelector('.produit-image').src;
            const productPrice = clickedItem.querySelector('.prix').innerText;
            const productReview = clickedItem.querySelector('.avis').innerText;

            afficherDetailsProduit(productName, productImage, productPrice, productReview);
        }
    });
}

function afficherDetailsProduit(name, image, price, review) {
    const detailsContent = document.getElementById('details-content');
    detailsContent.innerHTML = `
        <h3>${name}</h3>
        <img src="${image}" alt="${name}" class="produit-image">
        <p>Prix: ${price}</p>
        <p>Avis: ${review}</p>
    `;
    document.getElementById('product-details').style.display = 'block';
    document.getElementById('product-carousel').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';

    document.getElementById('add-button').onclick = () => {
        addToCart(name, price);
    };

    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('product-details').style.display = 'none';
        document.getElementById('product-carousel').style.display = 'flex';
        document.getElementById('pagination').style.display = 'flex';
        
        currentPage = 1;
        displayProducts();

        productCarousel.style.display = 'none';
        productCarousel.offsetHeight;
        productCarousel.style.display = 'block';
    });
}

const detailsContent = document.getElementById('details-content');
if (detailsContent) {
    detailsContent.innerHTML = `
        <h3>${name}</h3>
        <img src="${image}" alt="${name}" class="produit-image">
        <p>Prix: ${price}</p>
        <p>Avis: ${review}</p>
    `;
} else {
    console.error('L\'élément details-content n\'existe pas.');
}

function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} a été ajouté au panier.`);
}

function displayCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartSection = document.querySelector('.cart-section');
    cartSection.innerHTML = '<h1 class="cart-title">Mon Panier</h1>'; // Réinitialiser le contenu

    cartItems.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `<p>${item.name}</p><p>${item.price}€</p>`;
        cartSection.appendChild(cartItem);
    });

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const totalDiv = document.createElement('div');
    totalDiv.classList.add('total');
    totalDiv.innerHTML = `<h2>Total : ${total.toFixed(2)}€</h2>`;
    cartSection.appendChild(totalDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    displayCart(); // Afficher le contenu du panier
});