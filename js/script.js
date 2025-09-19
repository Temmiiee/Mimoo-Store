// Mimoo Store Main JavaScript
// E-commerce functionality and interactive features

// Shopping Cart State
let cart = JSON.parse(localStorage.getItem('mimoo-cart')) || [];
let currentFilter = 'all';

// Pagination State
let currentPage = 1;
let itemsPerPage = 4;
let totalProducts = 0;

// DOM Elements
const productGrid = document.getElementById('products-grid');
const cartModal = document.getElementById('cart-modal');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const filterButtons = document.querySelectorAll('.filter-btn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const closeModal = document.querySelector('.close');

// Pagination Elements
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const itemsPerPageSelect = document.getElementById('items-per-page');

// Payment Elements
const proceedCheckoutBtn = document.getElementById('proceed-checkout');
const paymentForm = document.getElementById('payment-form');
const backToCartBtn = document.getElementById('back-to-cart');
const checkoutForm = document.getElementById('checkout-form');
const finalTotal = document.getElementById('final-total');

// Language Elements
const langToggleBtn = document.getElementById('lang-toggle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// App Initialization
function initializeApp() {
  renderProducts();
  updateCartUI();
  setupEventListeners();
  setupSmoothScrolling();
  setupAnimations();
}

// Event Listeners Setup
function setupEventListeners() {
  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
  });

  // Cart button
  cartBtn.addEventListener('click', openModal);

  // Close modal
  closeModal.addEventListener('click', closeCartModal);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      closeCartModal();
    }
  });

  // Mobile menu toggle
  hamburger.addEventListener('click', toggleMobileMenu);

  // Contact form submission
  const contactForm = document.querySelector('.contact-form');
  contactForm.addEventListener('submit', handleContactForm);

  // Pagination buttons
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
      updatePaginationUI();
      scrollToProductsSection();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
      updatePaginationUI();
      scrollToProductsSection();
    }
  });
  
  // Items per page selector
  itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderProducts();
    updatePaginationUI();
  });
  
  // Payment flow
  proceedCheckoutBtn.addEventListener('click', showPaymentForm);
  backToCartBtn.addEventListener('click', showCartView);
  checkoutForm.addEventListener('submit', handlePayment);
  
  // Language toggle
  langToggleBtn.addEventListener('click', () => {
    if (window.languageManager) {
      window.languageManager.toggleLanguage();
      // Re-render products to update button text
      renderProducts();
      // Update cart UI to reflect language change
      updateCartUI();
    }
  });
  
  // Payment form input formatting
  document.getElementById('card-number').addEventListener('input', (e) => formatCardNumber(e.target));
  document.getElementById('expiry').addEventListener('input', (e) => formatExpiry(e.target));
  document.getElementById('cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
  });
}

// Product Rendering with Pagination
function renderProducts(productsToRender = null) {
  const allProducts = productsToRender || ProductManager.getProductsByCategory(currentFilter);
  totalProducts = allProducts.length;
  
  productGrid.innerHTML = '';

  if (allProducts.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray);">
        <p style="font-size: 1.2rem;">Aucun produit trouvé dans cette catégorie! 😔</p>
        <p>Revenez bientôt pour plus d'articles fantastiques! ✨</p>
      </div>
    `;
    updatePaginationUI();
    return;
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = allProducts.slice(startIndex, endIndex);

  productsToShow.forEach(product => {
    const productCard = createProductCard(product);
    productGrid.appendChild(productCard);
  });
  
  updatePaginationUI();
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = product.category;
  
  // Get translated button text
  const addToCartText = window.languageManager ? 
    window.languageManager.t('addToCart') : 'Add to Cart 🛍️';
  
  card.innerHTML = `
    <div class="product-image">
      ${product.emoji}
    </div>
    <h3 class="product-title">${product.name}</h3>
    <p class="product-description">${product.description}</p>
    <div class="product-price">$${product.price.toFixed(2)}</div>
    <button class="add-to-cart" data-id="${product.id}">
      ${addToCartText}
    </button>
  `;

  // Add to cart event listener
  const addToCartBtn = card.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', () => {
    addToCart(product);
    showAddToCartAnimation(addToCartBtn);
  });

  return card;
}

// Scroll to products section
function scrollToProductsSection() {
  const productsSection = document.getElementById('products');
  const headerHeight = document.querySelector('.header').offsetHeight;
  const targetPosition = productsSection.offsetTop - headerHeight - 20;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

// Pagination UI Update
function updatePaginationUI() {
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
  // Update page info with translation
  if (window.languageManager) {
    const pageText = window.languageManager.t('page');
    const ofText = window.languageManager.t('of');
    pageInfo.textContent = `${pageText} ${currentPage} ${ofText} ${totalPages}`;
    
    // Update button text
    prevPageBtn.textContent = window.languageManager.t('previous');
    nextPageBtn.textContent = window.languageManager.t('next');
  } else {
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
  }
  
  // Update button states
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages || totalPages <= 1;
  
  // Hide pagination if only one page
  const paginationContainer = document.querySelector('.pagination-container');
  paginationContainer.style.display = totalPages <= 1 ? 'none' : 'flex';
  
  // Store pagination state globally for translation updates
  window.currentPage = currentPage;
  window.totalProducts = totalProducts;
  window.itemsPerPage = itemsPerPage;
}

// Filter Handling with ARIA updates
function handleFilterClick(e) {
  const filterValue = e.target.dataset.filter;
  
  // Update active button and ARIA states
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-checked', 'false');
  });
  e.target.classList.add('active');
  e.target.setAttribute('aria-checked', 'true');

  // Announce filter change to screen readers
  const filterName = e.target.textContent;
  announceToScreenReader(`Filtre sélectionné: ${filterName}`);

  // Reset to first page when filter changes
  currentPage = 1;
  currentFilter = filterValue;
  renderProducts();

  // Only scroll to products section if we're not already there (for mobile)
  const productsSection = document.getElementById('products');
  const rect = productsSection.getBoundingClientRect();
  if (rect.top < -100 || rect.top > window.innerHeight) {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Shopping Cart Functions
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== parseInt(productId));
  saveCart();
  updateCartUI();
}

function updateCartQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === parseInt(productId));
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      saveCart();
      updateCartUI();
    }
  }
}

function saveCart() {
  localStorage.setItem('mimoo-cart', JSON.stringify(cart));
}

function updateCartUI() {
  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Update cart items display
  renderCartItems();
  
  // Update cart total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = total.toFixed(2);
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty! Start shopping to fill it with amazing goodies! 🌈</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 1.5rem;">${item.emoji}</span>
        <div>
          <div style="font-weight: 600;">${item.name}</div>
          <div style="color: var(--gray); font-size: 0.9rem;">$${item.price.toFixed(2)} each</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" style="background: var(--light-gray); border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">-</button>
          <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
          <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" style="background: var(--spring-green); color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">+</button>
        </div>
        <div style="font-weight: 600; color: var(--electric-purple);">$${(item.price * item.quantity).toFixed(2)}</div>
        <button onclick="removeFromCart(${item.id})" style="background: var(--coral-pink); color: white; border: none; padding: 0.3rem 0.8rem; border-radius: 10px; cursor: pointer;">Remove</button>
      </div>
    </div>
  `).join('');
}

// Add to Cart Animation
function showAddToCartAnimation(button) {
  const originalText = button.textContent;
  button.style.background = 'var(--spring-green)';
  button.textContent = 'Added! ✨';
  button.disabled = true;

  setTimeout(() => {
    button.style.background = '';
    button.textContent = originalText;
    button.disabled = false;
  }, 1500);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}

// Smooth Scrolling for Navigation Links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Close mobile menu if open
      if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });
}

// Contact Form Handling
function handleContactForm(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.target);
  const name = e.target.querySelector('input[type="text"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const message = e.target.querySelector('textarea').value;
  
  // Simulate form submission
  const submitBtn = e.target.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  
  submitBtn.textContent = 'Sending... ✨';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    submitBtn.textContent = 'Message Sent! 💌';
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      e.target.reset();
    }, 2000);
  }, 1500);
}

// Payment Flow Functions
function showPaymentForm() {
  if (cart.length === 0) {
    alert('Votre panier est vide! Ajoutez quelques articles d’abord! 🛍️');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  finalTotal.textContent = total.toFixed(2);
  
  // Hide cart items and show payment form
  cartItems.style.display = 'none';
  document.querySelector('.cart-footer').style.display = 'none';
  paymentForm.style.display = 'block';
}

function showCartView() {
  // Show cart items and hide payment form
  cartItems.style.display = 'block';
  document.querySelector('.cart-footer').style.display = 'block';
  paymentForm.style.display = 'none';
}

function handlePayment(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.target);
  const customerName = document.getElementById('customer-name').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerAddress = document.getElementById('customer-address').value;
  const cardNumber = document.getElementById('card-number').value;
  const expiry = document.getElementById('expiry').value;
  const cvv = document.getElementById('cvv').value;
  
  // Basic validation
  if (!customerName || !customerEmail || !customerAddress || !cardNumber || !expiry || !cvv) {
    alert('Veuillez remplir tous les champs requis!');
    return;
  }
  
  // Simulate payment processing
  const payBtn = e.target.querySelector('.pay-btn');
  const originalText = payBtn.innerHTML;
  
  payBtn.innerHTML = 'Traitement en cours... ⏳';
  payBtn.disabled = true;
  
  setTimeout(() => {
    // Simulate successful payment
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderData = {
      orderNumber: generateOrderNumber(),
      customerName,
      customerEmail,
      items: [...cart],
      total: total.toFixed(2),
      date: new Date().toLocaleDateString('fr-FR')
    };
    
    // Save order to localStorage (simulate order history)
    saveOrder(orderData);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    
    // Close modal and show success
    cartModal.style.display = 'none';
    showPaymentSuccess(orderData);
    
    // Reset form and views
    setTimeout(() => {
      payBtn.innerHTML = originalText;
      payBtn.disabled = false;
      showCartView();
      e.target.reset();
    }, 100);
  }, 2000);
}

// Utility Functions for Payment
function generateOrderNumber() {
  return 'MM' + Date.now().toString().slice(-8);
}

function saveOrder(orderData) {
  const orders = JSON.parse(localStorage.getItem('mimoo-orders')) || [];
  orders.push(orderData);
  localStorage.setItem('mimoo-orders', JSON.stringify(orders));
}

function showPaymentSuccess(orderData) {
  const successMessage = document.createElement('div');
  successMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--nature-gradient);
    color: white;
    padding: 2.5rem;
    border-radius: 20px;
    text-align: center;
    z-index: 3000;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: bounce 0.6s ease;
    max-width: 400px;
    width: 90%;
  `;
  
  successMessage.innerHTML = `
    <h3 style="margin: 0 0 1rem 0;">Paiement réussi! 🎉</h3>
    <p style="margin: 0 0 0.5rem 0;">Commande #${orderData.orderNumber}</p>
    <p style="margin: 0 0 1rem 0;">Merci ${orderData.customerName}!</p>
    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Un email de confirmation a été envoyé à ${orderData.customerEmail}</p>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">Vos articles seront livrés sous peu! ✨</p>
  `;
  
  document.body.appendChild(successMessage);
  
  setTimeout(() => {
    document.body.removeChild(successMessage);
  }, 4000);
}

// Add input formatting for payment form
function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formattedValue;
}

function formatExpiry(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  input.value = value;
}

// Setup Animations
function setupAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Animate product cards on scroll
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Animate about cards on scroll
  document.querySelectorAll('.about-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

// Header Scroll Effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.98)';
    header.style.boxShadow = '0 2px 30px rgba(0,0,0,0.15)';
  } else {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
  }
});

// Search Functionality (bonus feature)
function searchProducts(query) {
  if (query.trim() === '') {
    renderProducts();
    return;
  }
  
  const results = ProductManager.searchProducts(query);
  renderProducts(results);
}

// Accessibility Utility Functions
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      closeCartModal();
    }
  });
}

function openModal() {
  cartModal.style.display = 'block';
  cartModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
  
  // Focus the close button
  const closeButton = cartModal.querySelector('.close');
  closeButton.focus();
  
  // Trap focus within modal
  trapFocus(cartModal);
  
  announceToScreenReader('Modal panier ouvert');
}

function closeCartModal() {
  cartModal.style.display = 'none';
  cartModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Restore scrolling
  
  // Return focus to cart button
  cartBtn.focus();
  
  announceToScreenReader('Modal panier fermé');
}

// Utility Functions
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function getRandomEmoji() {
  const emojis = ['⭐', '✨', '🦋', '🌸', '🌈', '💖', '🎨', '🌺'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Make functions globally available
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;

// Console welcome message
console.log(`
🌸 Welcome to Mimoo Store! 🦋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A vibrant e-commerce experience
built with love for nature and
pop culture enthusiasts! ✨

Happy shopping! 🛍️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Performance optimization: Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}