/**
 * MIMOO STORE - ORDER CONFIRMATION MANAGER
 * Gestion de la page de confirmation de commande
 */

class OrderConfirmationManager {
    constructor() {
        this.orderData = null;
        this.orderId = null;
        
        // Configuration des délais de livraison
        this.deliveryTimes = {
            standard: '3-5 jours ouvrés',
            express: '24-48 heures',
            pickup: '2-4 jours ouvrés'
        };
        
        // Configuration des méthodes de livraison
        this.deliveryMethods = {
            standard: '📦 Livraison standard',
            express: '⚡ Livraison express',
            pickup: '🏪 Retrait en point relais'
        };
    }
    
    /**
     * Initialisation de la page de confirmation
     */
    async init() {
        try {
            console.log('🎉 Initialisation de la confirmation de commande...');
            
            // Récupérer l'ID de commande depuis l'URL
            this.orderId = this.getOrderIdFromUrl();
            
            // Charger les données de commande
            await this.loadOrderData();
            
            // Afficher les détails de la commande
            this.renderOrderDetails();
            
            // Configurer les actions de la page
            this.setupPageActions();
            
            // Mettre à jour le structured data
            this.updateStructuredData();
            
            // Envoyer les événements analytics (si configuré)
            this.trackOrderConfirmation();
            
            console.log('✅ Page de confirmation initialisée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.handleError(error);
        }
    }
    
    /**
     * Récupération de l'ID de commande depuis l'URL
     */
    getOrderIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order');
        
        if (!orderId) {
            throw new Error('Aucun ID de commande trouvé dans l\'URL');
        }
        
        return orderId;
    }
    
    /**
     * Chargement des données de commande
     */
    async loadOrderData() {
        // Essayer de charger depuis localStorage (pour les commandes récentes)
        const savedOrder = localStorage.getItem('mimoo_last_order');
        
        if (savedOrder) {
            try {
                const orderData = JSON.parse(savedOrder);
                if (orderData.orderId === this.orderId) {
                    this.orderData = orderData;
                    console.log('📦 Données de commande chargées depuis localStorage');
                    return;
                }
            } catch (error) {
                console.warn('⚠️ Erreur lors du chargement depuis localStorage:', error);
            }
        }
        
        // En production, ici vous feriez un appel API pour récupérer les données
        // const response = await fetch(`/api/orders/${this.orderId}`);
        // this.orderData = await response.json();
        
        // Pour la démo, utiliser des données factices si aucune donnée sauvegardée
        if (!this.orderData) {
            this.orderData = this.generateDemoOrderData();
            console.log('🎭 Utilisation de données de démonstration');
        }
    }
    
    /**
     * Génération de données de commande pour la démonstration
     */
    generateDemoOrderData() {
        return {
            orderId: this.orderId,
            timestamp: new Date().toISOString(),
            customer: {
                name: 'Jean Dupont',
                email: 'jean.dupont@example.com',
                address: {
                    line1: '123 rue de la Paix',
                    city: 'Paris',
                    postal_code: '75001',
                    country: 'FR'
                }
            },
            items: [
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
                }
            ],
            totals: {
                subtotal: 29.90,
                shipping: 4.90,
                tax: 5.98,
                discount: 0,
                total: 40.78
            },
            delivery: {
                method: 'standard',
                notes: null
            },
            paymentIntent: {
                id: 'pi_demo_' + Date.now(),
                status: 'succeeded'
            }
        };
    }
    
    /**
     * Affichage des détails de la commande
     */
    renderOrderDetails() {
        // Numéros de commande
        document.getElementById('display-order-number').textContent = this.orderData.orderId;
        document.getElementById('sidebar-order-number').textContent = this.orderData.orderId;
        
        // Date de commande
        const orderDate = new Date(this.orderData.timestamp);
        const dateString = orderDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('order-date').textContent = dateString;
        
        // Articles de la commande
        this.renderOrderItems();
        
        // Totaux
        this.renderOrderTotals();
        
        // Informations de livraison
        this.renderDeliveryInfo();
        
        // Informations de paiement
        this.renderPaymentInfo();
        
        // Newsletter (si pas déjà inscrit)
        this.renderNewsletterSection();
    }
    
    /**
     * Affichage des articles de la commande
     */
    renderOrderItems() {
        const container = document.getElementById('confirmation-items');
        if (!container || !this.orderData.items) return;
        
        const itemsHTML = this.orderData.items.map(item => `
            <div class="order-item">
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
    }
    
    /**
     * Affichage des totaux de la commande
     */
    renderOrderTotals() {
        const totals = this.orderData.totals;
        
        document.getElementById('conf-subtotal').textContent = `${totals.subtotal.toFixed(2)} €`;
        document.getElementById('conf-shipping').textContent = `${totals.shipping.toFixed(2)} €`;
        document.getElementById('conf-tax').textContent = `${totals.tax.toFixed(2)} €`;
        document.getElementById('conf-total').textContent = `${totals.total.toFixed(2)} €`;
        
        // Affichage de la remise si applicable
        if (totals.discount > 0) {
            document.getElementById('conf-discount-line').style.display = 'flex';
            document.getElementById('conf-discount').textContent = `-${totals.discount.toFixed(2)} €`;
        }
    }
    
    /**
     * Affichage des informations de livraison
     */
    renderDeliveryInfo() {
        // Adresse de livraison
        const address = this.orderData.customer.address;
        const addressHTML = `
            <div class="address-line"><strong>${this.orderData.customer.name}</strong></div>
            <div class="address-line">${address.line1}</div>
            <div class="address-line">${address.postal_code} ${address.city}</div>
            <div class="address-line">${this.getCountryName(address.country)}</div>
        `;
        document.getElementById('delivery-address').innerHTML = addressHTML;
        
        // Mode de livraison
        const deliveryMethod = this.orderData.delivery.method;
        document.getElementById('delivery-method').textContent = this.deliveryMethods[deliveryMethod] || 'Livraison standard';
        
        // Estimation de livraison
        const estimatedDate = this.calculateDeliveryEstimate(deliveryMethod);
        document.getElementById('delivery-estimate').innerHTML = `
            <div class="estimate-text">${this.deliveryTimes[deliveryMethod] || '3-5 jours ouvrés'}</div>
            <div class="estimate-date">Livraison prévue le <strong>${estimatedDate}</strong></div>
        `;
    }
    
    /**
     * Affichage des informations de paiement
     */
    renderPaymentInfo() {
        // ID de transaction
        document.getElementById('payment-id').textContent = this.orderData.paymentIntent.id;
        
        // Date de paiement
        const paymentDate = new Date(this.orderData.timestamp);
        document.getElementById('payment-date').textContent = paymentDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Affichage de la section newsletter
     */
    renderNewsletterSection() {
        const container = document.getElementById('newsletter-signup');
        if (!container) return;
        
        // Vérifier si l'utilisateur est déjà inscrit à la newsletter
        const isSubscribed = this.orderData.newsletter;
        
        if (isSubscribed) {
            container.innerHTML = `
                <div class="newsletter-subscribed">
                    <span class="success-icon">✅</span>
                    <span>Vous êtes déjà inscrit à notre newsletter !</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <form class="newsletter-form" onsubmit="subscribeToNewsletter(event)">
                    <div class="form-group">
                        <input type="email" id="newsletter-email" placeholder="Votre email" value="${this.orderData.customer.email}" required>
                        <button type="submit" class="newsletter-btn">S'inscrire</button>
                    </div>
                </form>
            `;
        }
    }
    
    /**
     * Configuration des actions de la page
     */
    setupPageActions() {
        // Bouton de copie du numéro de commande
        window.copyOrderNumber = () => {
            navigator.clipboard.writeText(this.orderData.orderId).then(() => {
                this.showNotification('Numéro de commande copié !', 'success');
            }).catch(() => {
                this.showNotification('Erreur lors de la copie', 'error');
            });
        };
        
        // Téléchargement PDF
        window.downloadOrderPDF = () => {
            this.generateAndDownloadPDF();
        };
        
        // Demande d'avis
        window.requestReview = () => {
            this.showReviewModal();
        };
        
        // Inscription newsletter
        window.subscribeToNewsletter = (event) => {
            event.preventDefault();
            this.handleNewsletterSubscription();
        };
    }
    
    /**
     * Calcul de l'estimation de livraison
     */
    calculateDeliveryEstimate(deliveryMethod) {
        const now = new Date();
        let daysToAdd = 3; // Par défaut
        
        switch (deliveryMethod) {
            case 'express':
                daysToAdd = 1;
                break;
            case 'pickup':
                daysToAdd = 2;
                break;
            case 'standard':
            default:
                daysToAdd = 3;
                break;
        }
        
        // Ajouter les jours ouvrés (ignorer weekends)
        let deliveryDate = new Date(now);
        let addedDays = 0;
        
        while (addedDays < daysToAdd) {
            deliveryDate.setDate(deliveryDate.getDate() + 1);
            // Ignorer samedi (6) et dimanche (0)
            if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
                addedDays++;
            }
        }
        
        return deliveryDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Conversion du code pays en nom
     */
    getCountryName(countryCode) {
        const countries = {
            'FR': 'France',
            'BE': 'Belgique',
            'CH': 'Suisse',
            'CA': 'Canada',
            'DE': 'Allemagne',
            'ES': 'Espagne',
            'IT': 'Italie',
            'UK': 'Royaume-Uni',
            'US': 'États-Unis',
            'JP': 'Japon'
        };
        
        return countries[countryCode] || countryCode;
    }
    
    /**
     * Génération et téléchargement du PDF de commande
     */
    generateAndDownloadPDF() {
        // En production, ceci générerait un vrai PDF
        // Pour la démo, on simule le téléchargement
        
        this.showNotification('Génération du PDF en cours...', 'info');
        
        setTimeout(() => {
            // Créer un blob avec le contenu de la commande
            const orderDetails = this.generateOrderText();
            const blob = new Blob([orderDetails], { type: 'text/plain' });
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `commande-${this.orderData.orderId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Commande téléchargée !', 'success');
        }, 1000);
    }
    
    /**
     * Génération du texte de la commande
     */
    generateOrderText() {
        const orderDate = new Date(this.orderData.timestamp).toLocaleDateString('fr-FR');
        
        let text = `MIMOO STORE - CONFIRMATION DE COMMANDE\n`;
        text += `=====================================\n\n`;
        text += `Numéro de commande: ${this.orderData.orderId}\n`;
        text += `Date: ${orderDate}\n`;
        text += `Client: ${this.orderData.customer.name}\n`;
        text += `Email: ${this.orderData.customer.email}\n\n`;
        
        text += `ARTICLES COMMANDÉS:\n`;
        text += `-------------------\n`;
        this.orderData.items.forEach(item => {
            text += `${item.name}`;
            if (item.variant) text += ` (${item.variant})`;
            text += ` - Qté: ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}€\n`;
        });
        
        text += `\nTOTAUX:\n`;
        text += `-------\n`;
        text += `Sous-total: ${this.orderData.totals.subtotal.toFixed(2)}€\n`;
        text += `Livraison: ${this.orderData.totals.shipping.toFixed(2)}€\n`;
        text += `TVA (20%): ${this.orderData.totals.tax.toFixed(2)}€\n`;
        if (this.orderData.totals.discount > 0) {
            text += `Remise: -${this.orderData.totals.discount.toFixed(2)}€\n`;
        }
        text += `TOTAL: ${this.orderData.totals.total.toFixed(2)}€\n\n`;
        
        text += `ADRESSE DE LIVRAISON:\n`;
        text += `--------------------\n`;
        const addr = this.orderData.customer.address;
        text += `${this.orderData.customer.name}\n`;
        text += `${addr.line1}\n`;
        text += `${addr.postal_code} ${addr.city}\n`;
        text += `${this.getCountryName(addr.country)}\n\n`;
        
        text += `Merci pour votre commande !\n`;
        text += `L'équipe Mimoo Store 💖`;
        
        return text;
    }
    
    /**
     * Gestion de l'inscription à la newsletter
     */
    handleNewsletterSubscription() {
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value;
        
        if (!email || !this.isValidEmail(email)) {
            this.showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        // Simuler l'inscription
        this.showNotification('Inscription en cours...', 'info');
        
        setTimeout(() => {
            // En production, ici vous feriez un appel API
            this.showNotification('✅ Inscription réussie ! Merci !', 'success');
            
            // Mettre à jour l'affichage
            document.getElementById('newsletter-signup').innerHTML = `
                <div class="newsletter-subscribed">
                    <span class="success-icon">✅</span>
                    <span>Inscription confirmée !</span>
                </div>
            `;
        }, 1500);
    }
    
    /**
     * Affichage du modal d'avis
     */
    showReviewModal() {
        // Créer le modal d'avis
        const modalHTML = `
            <div id="review-modal" class="modal-overlay" onclick="closeReviewModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>⭐ Laissez votre avis</h3>
                        <button onclick="closeReviewModal()" class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Votre avis nous aide à améliorer nos produits et services !</p>
                        <div class="review-options">
                            <a href="https://google.com/maps/place/mimoo-store" target="_blank" class="review-btn google">
                                <span class="review-icon">🌟</span>
                                <span>Avis Google</span>
                            </a>
                            <a href="https://facebook.com/mimoostore" target="_blank" class="review-btn facebook">
                                <span class="review-icon">👍</span>
                                <span>Avis Facebook</span>
                            </a>
                            <a href="https://trustpilot.com/review/mimoo-store.com" target="_blank" class="review-btn trustpilot">
                                <span class="review-icon">⭐</span>
                                <span>Avis Trustpilot</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Fermeture du modal
        window.closeReviewModal = () => {
            const modal = document.getElementById('review-modal');
            if (modal) modal.remove();
        };
        
        // Style du modal
        const modalStyle = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                background: white;
                border-radius: var(--checkout-border-radius);
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.3s ease;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--checkout-gray-200);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--checkout-gray-600);
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .review-options {
                display: grid;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .review-btn {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 2px solid var(--checkout-gray-300);
                border-radius: var(--checkout-border-radius);
                text-decoration: none;
                color: var(--checkout-gray-800);
                transition: var(--checkout-transition);
            }
            
            .review-btn:hover {
                border-color: var(--checkout-primary);
                background: rgba(255, 107, 157, 0.05);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        // Ajouter les styles
        const styleElement = document.createElement('style');
        styleElement.textContent = modalStyle;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Mise à jour du structured data
     */
    updateStructuredData() {
        const schemaScript = document.getElementById('order-schema');
        if (!schemaScript) return;
        
        const orderSchema = {
            "@context": "https://schema.org",
            "@type": "Order",
            "orderNumber": this.orderData.orderId,
            "orderDate": this.orderData.timestamp,
            "orderStatus": "Confirmed",
            "customer": {
                "@type": "Person",
                "name": this.orderData.customer.name,
                "email": this.orderData.customer.email
            },
            "seller": {
                "@type": "Organization",
                "name": "Mimoo Store",
                "url": "https://mimoo-store.com"
            },
            "acceptedOffer": this.orderData.items.map(item => ({
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": item.name,
                    "description": item.variant || ""
                },
                "price": item.price,
                "priceCurrency": "EUR",
                "quantity": item.quantity
            })),
            "totalPrice": this.orderData.totals.total,
            "priceCurrency": "EUR"
        };
        
        schemaScript.textContent = JSON.stringify(orderSchema, null, 2);
    }
    
    /**
     * Tracking analytics de la confirmation de commande
     */
    trackOrderConfirmation() {
        // Google Analytics 4 (si configuré)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: this.orderData.orderId,
                value: this.orderData.totals.total,
                currency: 'EUR',
                items: this.orderData.items.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    item_variant: item.variant,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
        }
        
        // Facebook Pixel (si configuré)
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
                value: this.orderData.totals.total,
                currency: 'EUR',
                content_ids: this.orderData.items.map(item => item.id),
                content_type: 'product',
                num_items: this.orderData.items.reduce((total, item) => total + item.quantity, 0)
            });
        }
        
        console.log('📊 Événements de conversion trackés');
    }
    
    /**
     * Validation d'email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Affichage des notifications
     */
    showNotification(message, type = 'info') {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--checkout-border-radius);
            box-shadow: var(--checkout-shadow);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Auto-suppression
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        // Styles d'animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Icônes pour les notifications
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    /**
     * Couleurs pour les notifications
     */
    getNotificationColor(type) {
        const colors = {
            success: '#45b7d1',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#4ecdc4'
        };
        return colors[type] || '#4ecdc4';
    }
    
    /**
     * Gestion des erreurs
     */
    handleError(error) {
        console.error('❌ Erreur de confirmation:', error);
        
        // Afficher une page d'erreur
        const container = document.querySelector('.confirmation-main .container');
        if (container) {
            container.innerHTML = `
                <div class="error-page">
                    <div class="error-icon">😔</div>
                    <h1>Oops ! Commande introuvable</h1>
                    <p>Nous n'avons pas pu charger les détails de votre commande.</p>
                    <div class="error-actions">
                        <button onclick="window.location.reload()" class="action-btn primary">
                            Actualiser la page
                        </button>
                        <button onclick="window.location.href='index.html'" class="action-btn secondary">
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Style pour la page d'erreur
        const errorStyle = `
            .error-page {
                text-align: center;
                padding: 4rem 2rem;
                max-width: 600px;
                margin: 0 auto;
            }
            .error-icon {
                font-size: 4rem;
                margin-bottom: 2rem;
            }
            .error-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = errorStyle;
        document.head.appendChild(styleElement);
    }
}

// Initialisation du gestionnaire de confirmation
window.orderConfirmation = new OrderConfirmationManager();

console.log('🎉 OrderConfirmationManager chargé et prêt');