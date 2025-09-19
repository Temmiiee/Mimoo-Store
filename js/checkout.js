/**
 * MIMOO STORE - CHECKOUT MANAGER
 * Gestion complète du processus de commande avec Stripe
 */

class CheckoutManager {
    constructor() {
        // Configuration Stripe (remplacez par vos vraies clés)
        this.stripePublicKey = 'pk_test_51234567890abcdef...'; // Remplacez par votre clé publique Stripe
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.paymentIntent = null;
        
        // État du checkout
        this.cart = [];
        this.totals = {
            subtotal: 0,
            shipping: 4.90,
            tax: 0,
            discount: 0,
            total: 0
        };
        
        // Configuration
        this.config = {
            taxRate: 0.20, // TVA 20%
            shippingRates: {
                standard: 4.90,
                express: 8.90,
                pickup: 2.90
            },
            promoCodes: {
                'WELCOME10': { type: 'percent', value: 10, description: '10% de réduction' },
                'MIMOO20': { type: 'percent', value: 20, description: '20% de réduction' },
                'FREESHIP': { type: 'fixed', value: 4.90, description: 'Livraison gratuite' },
                'ANIME5': { type: 'fixed', value: 5, description: '5€ de réduction' }
            }
        };
        
        // Initialisation des écouteurs d'événements
        this.initEventListeners();
    }
    
    /**
     * Initialisation du checkout
     */
    async init() {
        try {
            console.log('🚀 Initialisation du checkout...');
            
            // Charger le panier depuis localStorage
            this.loadCartFromStorage();
            
            // Initialiser Stripe
            await this.initStripe();
            
            // Afficher les articles du panier
            this.renderCartItems();
            
            // Calculer et afficher les totaux
            this.calculateTotals();
            
            // Remplir automatiquement les champs si données utilisateur disponibles
            this.loadUserData();
            
            console.log('✅ Checkout initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur de chargement. Veuillez actualiser la page.');
        }
    }
    
    /**
     * Initialisation de Stripe
     */
    async initStripe() {
        if (!this.stripePublicKey || this.stripePublicKey.includes('51234567890')) {
            console.warn('⚠️ Clé Stripe non configurée - Mode démo');
            this.showError('Paiement en mode démo. Configurez vos clés Stripe pour accepter de vrais paiements.');
            return;
        }
        
        try {
            this.stripe = Stripe(this.stripePublicKey);
            
            const appearance = {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#ff6b9d',
                    colorBackground: '#ffffff',
                    colorText: '#495057',
                    colorDanger: '#e74c3c',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px'
                }
            };
            
            this.elements = this.stripe.elements({ appearance });
            
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#495057',
                        '::placeholder': {
                            color: '#6c757d',
                        },
                    },
                },
            });
            
            this.cardElement.mount('#stripe-card-element');
            
            // Gérer les erreurs de carte en temps réel
            this.cardElement.on('change', ({error}) => {
                const displayError = document.getElementById('card-errors');
                if (error) {
                    displayError.textContent = this.translateCardError(error.message);
                } else {
                    displayError.textContent = '';
                }
                this.updatePayButtonState();
            });
            
        } catch (error) {
            console.error('❌ Erreur Stripe:', error);
            throw error;
        }
    }
    
    /**
     * Initialisation des écouteurs d'événements
     */
    initEventListeners() {
        // Changement de mode de livraison
        document.addEventListener('change', (e) => {
            if (e.target.name === 'delivery') {
                this.updateShipping(e.target.value);
            }
        });
        
        // Validation du formulaire de livraison
        document.addEventListener('input', (e) => {
            if (e.target.form && e.target.form.id === 'delivery-form') {
                this.validateDeliveryForm();
            }
        });
        
        // Gestion des checkbox légaux
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && ['terms', 'privacy'].includes(e.target.id)) {
                this.updatePayButtonState();
            }
        });
        
        // Bouton de paiement
        document.addEventListener('click', (e) => {
            if (e.target.id === 'pay-button') {
                e.preventDefault();
                this.handlePayment();
            }
        });
        
        // Code promo
        document.addEventListener('click', (e) => {
            if (e.target.id === 'applyPromo') {
                e.preventDefault();
                this.applyPromoCode();
            }
        });
        
        // Onglets de paiement
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('method-tab')) {
                this.switchPaymentMethod(e.target.dataset.method);
            }
        });
        
        // Validation en temps réel
        this.setupFormValidation();
    }
    
    /**
     * Chargement du panier depuis localStorage
     */
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('mimoo_cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
                console.log(`📦 Panier chargé: ${this.cart.length} articles`);
            } catch (error) {
                console.error('❌ Erreur lors du chargement du panier:', error);
                this.cart = [];
            }
        } else {
            // Données de démonstration si pas de panier
            this.cart = this.getDemoCartItems();
            console.log('📦 Panier de démonstration chargé');
        }
        
        // Redirection si panier vide
        if (this.cart.length === 0) {
            alert('Votre panier est vide. Vous allez être redirigé vers la boutique.');
            window.location.href = 'index.html#products';
        }
    }
    
    /**
     * Données de démonstration pour le panier
     */
    getDemoCartItems() {
        return [
            {
                id: 'demo-1',
                name: 'Porte-clés Totoro Kawaii',
                price: 12.90,
                quantity: 1,
                image: 'https://via.placeholder.com/60x60/ff6b9d/ffffff?text=🌸',
                variant: 'Vert pastel'
            },
            {
                id: 'demo-2',
                name: 'Badge Sailor Moon',
                price: 8.50,
                quantity: 2,
                image: 'https://via.placeholder.com/60x60/4ecdc4/ffffff?text=🦋',
                variant: 'Édition limitée'
            },
            {
                id: 'demo-3',
                name: 'Impression Art Nature',
                price: 24.90,
                quantity: 1,
                image: 'https://via.placeholder.com/60x60/45b7d1/ffffff?text=🌺',
                variant: 'A4 - Mat'
            }
        ];
    }
    
    /**
     * Affichage des articles du panier
     */
    renderCartItems() {
        const container = document.getElementById('checkout-items');
        if (!container) return;
        
        if (this.cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            return;
        }
        
        const itemsHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    ${item.variant ? `<div class="item-variant">${item.variant}</div>` : ''}
                    <div class="item-quantity">Quantité: ${item.quantity}</div>
                </div>
                <div class="item-price">${(item.price * item.quantity).toFixed(2)} €</div>
            </div>
        `).join('');
        
        container.innerHTML = itemsHTML;
        
        // Mettre à jour le compteur d'articles
        const itemsCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('items-count').textContent = itemsCount;
        document.getElementById('items-plural').textContent = itemsCount > 1 ? 's' : '';
    }
    
    /**
     * Calcul des totaux
     */
    calculateTotals() {
        // Sous-total
        this.totals.subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // TVA
        this.totals.tax = this.totals.subtotal * this.config.taxRate;
        
        // Total final
        this.totals.total = this.totals.subtotal + this.totals.shipping + this.totals.tax - this.totals.discount;
        
        // Mise à jour de l'affichage
        this.updateTotalsDisplay();
    }
    
    /**
     * Mise à jour de l'affichage des totaux
     */
    updateTotalsDisplay() {
        document.getElementById('subtotal').textContent = `${this.totals.subtotal.toFixed(2)} €`;
        document.getElementById('shipping-cost').textContent = `${this.totals.shipping.toFixed(2)} €`;
        document.getElementById('tax-amount').textContent = `${this.totals.tax.toFixed(2)} €`;
        document.getElementById('final-total').textContent = `${this.totals.total.toFixed(2)} €`;
        document.getElementById('button-total').textContent = `${this.totals.total.toFixed(2)} €`;
        
        // Affichage de la remise si applicable
        const discountLine = document.getElementById('discount-line');
        if (this.totals.discount > 0) {
            discountLine.style.display = 'flex';
            document.getElementById('discount-amount').textContent = `-${this.totals.discount.toFixed(2)} €`;
        } else {
            discountLine.style.display = 'none';
        }
    }
    
    /**
     * Mise à jour des frais de livraison
     */
    updateShipping(deliveryMethod) {
        this.totals.shipping = this.config.shippingRates[deliveryMethod] || this.config.shippingRates.standard;
        this.calculateTotals();
        console.log(`🚚 Mode de livraison changé: ${deliveryMethod} (${this.totals.shipping}€)`);
    }
    
    /**
     * Application d'un code promo
     */
    applyPromoCode() {
        const codeInput = document.getElementById('promoCode');
        const messageDiv = document.getElementById('promo-message');
        const code = codeInput.value.trim().toUpperCase();
        
        if (!code) {
            this.showPromoMessage('Veuillez entrer un code promo', 'error');
            return;
        }
        
        const promo = this.config.promoCodes[code];
        if (!promo) {
            this.showPromoMessage('Code promo invalide', 'error');
            return;
        }
        
        // Calculer la réduction
        let discountAmount = 0;
        if (promo.type === 'percent') {
            discountAmount = this.totals.subtotal * (promo.value / 100);
        } else if (promo.type === 'fixed') {
            discountAmount = Math.min(promo.value, this.totals.subtotal + this.totals.shipping);
        }
        
        // Appliquer la réduction
        this.totals.discount = discountAmount;
        document.getElementById('discount-code').textContent = `(${code})`;
        
        this.calculateTotals();
        this.showPromoMessage(`✅ ${promo.description} appliquée !`, 'success');
        
        // Désactiver le champ et le bouton
        codeInput.disabled = true;
        document.getElementById('applyPromo').disabled = true;
        document.getElementById('applyPromo').textContent = 'Appliqué';
        
        console.log(`🎫 Code promo appliqué: ${code} (-${discountAmount.toFixed(2)}€)`);
    }
    
    /**
     * Affichage des messages de code promo
     */
    showPromoMessage(message, type) {
        const messageDiv = document.getElementById('promo-message');
        messageDiv.textContent = message;
        messageDiv.className = `promo-message ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'promo-message';
            }, 3000);
        }
    }
    
    /**
     * Changement de méthode de paiement
     */
    switchPaymentMethod(method) {
        // Mise à jour des onglets
        document.querySelectorAll('.method-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        
        // Affichage du formulaire correspondant
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('hidden');
        });
        document.getElementById(`${method}-payment`).classList.remove('hidden');
        
        console.log(`💳 Méthode de paiement changée: ${method}`);
    }
    
    /**
     * Validation du formulaire de livraison
     */
    validateDeliveryForm() {
        const form = document.getElementById('delivery-form');
        const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'postalCode', 'country'];
        let isValid = true;
        
        for (const fieldName of requiredFields) {
            const field = form[fieldName];
            if (!field || !field.value.trim()) {
                isValid = false;
                break;
            }
        }
        
        // Validation email
        const email = form.email;
        if (email && email.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                isValid = false;
            }
        }
        
        this.updatePayButtonState(isValid);
        return isValid;
    }
    
    /**
     * Mise à jour de l'état du bouton de paiement
     */
    updatePayButtonState(formValid = null) {
        const payButton = document.getElementById('pay-button');
        const termsCheck = document.getElementById('terms').checked;
        const privacyCheck = document.getElementById('privacy').checked;
        
        if (formValid === null) {
            formValid = this.validateDeliveryForm();
        }
        
        const canPay = formValid && termsCheck && privacyCheck && this.totals.total > 0;
        
        payButton.disabled = !canPay;
        
        if (canPay) {
            payButton.classList.remove('disabled');
        } else {
            payButton.classList.add('disabled');
        }
    }
    
    /**
     * Configuration de la validation en temps réel
     */
    setupFormValidation() {
        const form = document.getElementById('delivery-form');
        if (!form) return;
        
        // Validation email en temps réel
        const emailField = form.email;
        if (emailField) {
            emailField.addEventListener('blur', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailField.value && !emailRegex.test(emailField.value)) {
                    emailField.style.borderColor = 'var(--checkout-error)';
                    this.showFieldError(emailField, 'Format d\'email invalide');
                } else {
                    emailField.style.borderColor = 'var(--checkout-gray-300)';
                    this.hideFieldError(emailField);
                }
            });
        }
        
        // Validation code postal
        const postalField = form.postalCode;
        if (postalField) {
            postalField.addEventListener('input', (e) => {
                // Format français : 5 chiffres
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value.slice(0, 5);
            });
        }
    }
    
    /**
     * Affichage des erreurs de champ
     */
    showFieldError(field, message) {
        const errorId = `${field.id}-error`;
        let errorDiv = document.getElementById(errorId);
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = errorId;
            errorDiv.className = 'field-error';
            errorDiv.style.color = 'var(--checkout-error)';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }
    
    /**
     * Masquage des erreurs de champ
     */
    hideFieldError(field) {
        const errorId = `${field.id}-error`;
        const errorDiv = document.getElementById(errorId);
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    /**
     * Traitement du paiement
     */
    async handlePayment() {
        if (!this.validateDeliveryForm()) {
            this.showError('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        const payButton = document.getElementById('pay-button');
        const originalContent = payButton.innerHTML;
        
        try {
            // État de chargement
            payButton.disabled = true;
            payButton.innerHTML = `
                <span class="button-content">
                    <span class="button-icon">⏳</span>
                    <span class="button-text">Traitement...</span>
                </span>
            `;
            
            console.log('💳 Démarrage du paiement...');
            
            // Mode démo si Stripe n'est pas configuré
            if (!this.stripe || this.stripePublicKey.includes('51234567890')) {
                await this.simulatePayment();
                return;
            }
            
            // Créer le Payment Intent côté serveur
            const paymentIntent = await this.createPaymentIntent();
            
            // Confirmer le paiement avec Stripe
            const result = await this.stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: this.getBillingDetails()
                }
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            // Paiement réussi
            console.log('✅ Paiement confirmé:', result.paymentIntent);
            await this.handlePaymentSuccess(result.paymentIntent);
            
        } catch (error) {
            console.error('❌ Erreur de paiement:', error);
            this.showError(`Erreur de paiement: ${error.message}`);
            
            // Restaurer le bouton
            payButton.disabled = false;
            payButton.innerHTML = originalContent;
        }
    }
    
    /**
     * Simulation de paiement pour la démo
     */
    async simulatePayment() {
        console.log('🎭 Simulation de paiement...');
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simuler un paiement réussi
        const mockPaymentIntent = {
            id: 'pi_demo_' + Date.now(),
            amount: Math.round(this.totals.total * 100),
            currency: 'eur',
            status: 'succeeded'
        };
        
        await this.handlePaymentSuccess(mockPaymentIntent);
    }
    
    /**
     * Création du Payment Intent (simulation)
     */
    async createPaymentIntent() {
        // En production, ceci serait un appel à votre serveur
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(this.totals.total * 100), // en centimes
                currency: 'eur',
                orderData: this.getOrderData()
            })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la création du paiement');
        }
        
        return await response.json();
    }
    
    /**
     * Récupération des détails de facturation
     */
    getBillingDetails() {
        const form = document.getElementById('delivery-form');
        
        return {
            name: `${form.firstName.value} ${form.lastName.value}`,
            email: form.email.value,
            phone: form.phone.value || undefined,
            address: {
                line1: form.address.value,
                city: form.city.value,
                postal_code: form.postalCode.value,
                country: form.country.value
            }
        };
    }
    
    /**
     * Récupération des données de commande
     */
    getOrderData() {
        const form = document.getElementById('delivery-form');
        
        return {
            customer: this.getBillingDetails(),
            items: this.cart,
            totals: this.totals,
            delivery: {
                method: document.querySelector('input[name="delivery"]:checked').value,
                notes: form.deliveryNotes.value || null
            },
            newsletter: document.getElementById('newsletter').checked,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Gestion du succès de paiement
     */
    async handlePaymentSuccess(paymentIntent) {
        console.log('🎉 Paiement réussi !');
        
        // Sauvegarder les détails de commande
        const orderData = {
            ...this.getOrderData(),
            paymentIntent: paymentIntent,
            orderId: this.generateOrderId()
        };
        
        localStorage.setItem('mimoo_last_order', JSON.stringify(orderData));
        
        // Vider le panier
        localStorage.removeItem('mimoo_cart');
        
        // Redirection vers la page de confirmation
        window.location.href = `order-confirmation.html?order=${orderData.orderId}`;
    }
    
    /**
     * Génération d'un ID de commande
     */
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `MIMOO-${timestamp}-${random.toUpperCase()}`;
    }
    
    /**
     * Chargement des données utilisateur sauvegardées
     */
    loadUserData() {
        const savedData = localStorage.getItem('mimoo_user_data');
        if (savedData) {
            try {
                const userData = JSON.parse(savedData);
                const form = document.getElementById('delivery-form');
                
                Object.keys(userData).forEach(key => {
                    const field = form[key];
                    if (field) {
                        field.value = userData[key];
                    }
                });
                
                console.log('👤 Données utilisateur chargées');
            } catch (error) {
                console.error('❌ Erreur lors du chargement des données utilisateur:', error);
            }
        }
    }
    
    /**
     * Traduction des erreurs de carte Stripe
     */
    translateCardError(message) {
        const translations = {
            'Your card number is incomplete.': 'Numéro de carte incomplet.',
            'Your card\'s expiration date is incomplete.': 'Date d\'expiration incomplète.',
            'Your card\'s security code is incomplete.': 'Code de sécurité incomplet.',
            'Your card number is invalid.': 'Numéro de carte invalide.',
            'Your card\'s expiration date is invalid.': 'Date d\'expiration invalide.',
            'Your card\'s security code is invalid.': 'Code de sécurité invalide.',
            'Your card was declined.': 'Votre carte a été refusée.',
            'Your card has insufficient funds.': 'Fonds insuffisants sur votre carte.',
            'Your card has expired.': 'Votre carte a expiré.',
            'Processing error': 'Erreur de traitement.'
        };
        
        return translations[message] || message;
    }
    
    /**
     * Affichage d'erreurs générales
     */
    showError(message) {
        // Créer ou mettre à jour une alerte d'erreur
        let errorAlert = document.getElementById('checkout-error-alert');
        
        if (!errorAlert) {
            errorAlert = document.createElement('div');
            errorAlert.id = 'checkout-error-alert';
            errorAlert.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--checkout-error);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--checkout-border-radius);
                box-shadow: var(--checkout-shadow);
                z-index: 9999;
                max-width: 300px;
                font-size: 0.9rem;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(errorAlert);
        }
        
        errorAlert.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>⚠️</span>
                <span>${message}</span>
            </div>
        `;
        
        // Auto-masquage après 5 secondes
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.remove();
            }
        }, 5000);
    }
    
    /**
     * Affichage de messages de succès
     */
    showSuccess(message) {
        let successAlert = document.getElementById('checkout-success-alert');
        
        if (!successAlert) {
            successAlert = document.createElement('div');
            successAlert.id = 'checkout-success-alert';
            successAlert.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--checkout-success);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--checkout-border-radius);
                box-shadow: var(--checkout-shadow);
                z-index: 9999;
                max-width: 300px;
                font-size: 0.9rem;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(successAlert);
        }
        
        successAlert.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>✅</span>
                <span>${message}</span>
            </div>
        `;
        
        // Auto-masquage après 3 secondes
        setTimeout(() => {
            if (successAlert.parentNode) {
                successAlert.remove();
            }
        }, 3000);
    }
}

// Initialisation du gestionnaire de checkout
window.checkoutManager = new CheckoutManager();

// Styles CSS pour les alertes (injectés dynamiquement)
const alertStyles = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = alertStyles;
document.head.appendChild(styleSheet);

console.log('🛒 CheckoutManager chargé et prêt');