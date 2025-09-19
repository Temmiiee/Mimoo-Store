// Mimoo Store Main JavaScript
// E-commerce functionality and interactive features

// Shopping Cart State
let cart = JSON.parse(localStorage.getItem('mimoo-cart')) || [];
let currentFilter = 'all';

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
  cartBtn.addEventListener('click', () => {
    cartModal.style.display = 'block';
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = 'none';
    }
  });

  // Mobile menu toggle
  hamburger.addEventListener('click', toggleMobileMenu);

  // Contact form submission
  const contactForm = document.querySelector('.contact-form');
  contactForm.addEventListener('submit', handleContactForm);

  // Checkout button
  document.querySelector('.checkout-btn').addEventListener('click', handleCheckout);
}

// Product Rendering
function renderProducts(productsToRender = null) {
  const products = productsToRender || ProductManager.getProductsByCategory(currentFilter);
  
  productGrid.innerHTML = '';

  if (products.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray);">
        <p style="font-size: 1.2rem;">No products found in this category! 😔</p>
        <p>Check back soon for more amazing goodies! ✨</p>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const productCard = createProductCard(product);
    productGrid.appendChild(productCard);
  });
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = product.category;
  
  card.innerHTML = `
    <div class="product-image">
      ${product.emoji}
    </div>
    <h3 class="product-title">${product.name}</h3>
    <p class="product-description">${product.description}</p>
    <div class="product-price">$${product.price.toFixed(2)}</div>
    <button class="add-to-cart" data-id="${product.id}">
      Add to Cart 🛒
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

// Filter Handling
function handleFilterClick(e) {
  const filterValue = e.target.dataset.filter;
  
  // Update active button
  filterButtons.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  // Update current filter and render products
  currentFilter = filterValue;
  renderProducts();

  // Smooth scroll to products section
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
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

// Checkout Handling
function handleCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty! Add some goodies first! 🛍️');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const confirmed = confirm(`Complete your purchase of $${total.toFixed(2)}? 💳\n\nThis is a demo - no real payment will be processed! 😊`);
  
  if (confirmed) {
    // Simulate checkout process
    cart = [];
    saveCart();
    updateCartUI();
    cartModal.style.display = 'none';
    
    // Show success message
    showCheckoutSuccess();
  }
}

function showCheckoutSuccess() {
  const successMessage = document.createElement('div');
  successMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--pop-gradient);
    color: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    z-index: 3000;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: bounce 0.6s ease;
  `;
  
  successMessage.innerHTML = `
    <h3 style="margin: 0 0 1rem 0;">Order Confirmed! 🎉</h3>
    <p style="margin: 0;">Thank you for shopping at Mimoo Store!</p>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">Your goodies will be magically delivered! ✨</p>
  `;
  
  document.body.appendChild(successMessage);
  
  setTimeout(() => {
    document.body.removeChild(successMessage);
  }, 3000);
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

// Utility Functions
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function getRandomEmoji() {
  const emojis = ['🌟', '✨', '🦋', '🌸', '🌈', '💖', '🎨', '🌺'];
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