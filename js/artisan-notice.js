/**
 * MIMOO STORE - ARTISAN NOTICE MANAGER
 * Gestion des notices d'information sur les spécificités artisanales
 */

class ArtisanNoticeManager {
    constructor() {
        this.isNoticeShown = false;
        this.init();
    }

    /**
     * Initialisation du gestionnaire de notices
     */
    init() {
        this.createArtisanBanner();
        this.setupEventListeners();
    }

    /**
     * Création de la bannière d'information artisan
     */
    createArtisanBanner() {
        // Vérifier si la bannière n'a pas déjà été fermée
        const bannerDismissed = localStorage.getItem('mimoo_artisan_banner_dismissed');
        if (bannerDismissed === 'true') {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'artisan-notice-banner';
        banner.className = 'artisan-banner';
        banner.innerHTML = `
            <div class="artisan-banner-content">
                <div class="artisan-banner-icon">🎨</div>
                <div class="artisan-banner-text">
                    <strong>Artiste indépendant en démarrage</strong><br>
                    <small>Pas encore de retours possibles (sauf défaut) - budget et logistique limités. Merci de votre compréhension ! 🙏</small>
                </div>
                <button class="artisan-banner-close" onclick="window.artisanNotice.dismissBanner()" aria-label="Fermer">×</button>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(banner);

        // Styles CSS intégrés
        this.injectStyles();

        // Animation d'apparition
        setTimeout(() => {
            banner.classList.add('show');
        }, 1000);
    }

    /**
     * Injection des styles CSS
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .artisan-banner {
                position: fixed;
                top: 80px;
                right: 20px;
                max-width: 350px;
                background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                border: 2px solid #ffc107;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.5s ease;
                font-family: 'Poppins', sans-serif;
            }

            .artisan-banner.show {
                transform: translateX(0);
            }

            .artisan-banner-content {
                display: flex;
                align-items: flex-start;
                padding: 1rem;
                gap: 0.75rem;
            }

            .artisan-banner-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .artisan-banner-text {
                flex: 1;
                color: #856404;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .artisan-banner-text strong {
                color: #533300;
                font-weight: 600;
            }

            .artisan-banner-text small {
                opacity: 0.9;
                font-size: 0.8rem;
            }

            .artisan-banner-close {
                background: none;
                border: none;
                color: #856404;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.3s ease;
                flex-shrink: 0;
            }

            .artisan-banner-close:hover {
                background-color: rgba(133, 100, 4, 0.1);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .artisan-banner {
                    position: fixed;
                    top: auto;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: none;
                    transform: translateY(100%);
                }

                .artisan-banner.show {
                    transform: translateY(0);
                }

                .artisan-banner-content {
                    padding: 0.75rem;
                }

                .artisan-banner-text {
                    font-size: 0.85rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configuration des écouteurs d'événements
     */
    setupEventListeners() {
        // Afficher la notice lors de l'ajout au panier
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.showArtisanNotice();
            }
        });
    }

    /**
     * Affichage de la notice lors de l'ajout au panier
     */
    showArtisanNotice() {
        if (this.isNoticeShown) return;

        const notice = document.createElement('div');
        notice.className = 'artisan-notice-popup';
        notice.innerHTML = `
            <div class="notice-content">
                <div class="notice-icon">🎨</div>
                <div class="notice-text">
                    <strong>Goodies ajouté au panier !</strong><br>
                    <small>Rappel : artiste débutant, pas de retour possible pour le moment. Merci ! 😊</small>
                </div>
            </div>
        `;

        // Styles inline pour cette popup temporaire
        notice.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            border: 2px solid #28a745;
            border-radius: 12px;
            padding: 1rem;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
            animation: popupShow 0.5s ease forwards;
            max-width: 300px;
            text-align: center;
        `;

        // Animation CSS
        if (!document.getElementById('popup-styles')) {
            const style = document.createElement('style');
            style.id = 'popup-styles';
            style.textContent = `
                @keyframes popupShow {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
                
                .notice-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #155724;
                }
                
                .notice-icon {
                    font-size: 1.5rem;
                }
                
                .notice-text {
                    text-align: left;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                
                .notice-text strong {
                    font-weight: 600;
                }
                
                .notice-text small {
                    opacity: 0.9;
                    font-size: 0.8rem;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notice);

        // Auto-suppression après 4 secondes
        setTimeout(() => {
            if (notice.parentNode) {
                notice.style.animation = 'popupShow 0.3s ease reverse';
                setTimeout(() => notice.remove(), 300);
            }
        }, 4000);

        this.isNoticeShown = true;
    }

    /**
     * Fermeture définitive de la bannière
     */
    dismissBanner() {
        const banner = document.getElementById('artisan-notice-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 500);
        }

        // Sauvegarder le choix de l'utilisateur
        localStorage.setItem('mimoo_artisan_banner_dismissed', 'true');
    }

    /**
     * Réinitialiser la bannière (pour les tests)
     */
    resetBanner() {
        localStorage.removeItem('mimoo_artisan_banner_dismissed');
        const existingBanner = document.getElementById('artisan-notice-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        this.createArtisanBanner();
    }
}

// Initialisation automatique
window.artisanNotice = new ArtisanNoticeManager();

console.log('🎨 ArtisanNoticeManager chargé - Notices d\'information artisan activées');