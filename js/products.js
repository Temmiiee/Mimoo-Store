// Mimoo Store Products Database
// Nature & Pop Culture themed goodies

const products = [
  // Keychains
  {
    id: 1,
    name: "Cherry Blossom Keychain",
    category: "keychains",
    price: 12.99,
    description: "Delicate pink cherry blossom design with holographic details. Perfect spring accessory!",
    emoji: "🌸",
    tags: ["nature", "spring", "pink", "holographic"],
    popular: true
  },
  {
    id: 2,
    name: "Studio Ghibli Forest Spirit",
    category: "keychains",
    price: 15.99,
    description: "Mystical forest spirit inspired by beloved anime films. Glow-in-the-dark features!",
    emoji: "🌲",
    tags: ["pop-culture", "anime", "glow", "mystical"],
    popular: true
  },
  {
    id: 3,
    name: "Rainbow Butterfly Keychain",
    category: "keychains",
    price: 11.99,
    description: "Vibrant rainbow butterfly with shimmering wings that catch the light beautifully.",
    emoji: "🦋",
    tags: ["nature", "rainbow", "butterfly", "shimmer"]
  },
  {
    id: 4,
    name: "Retro Gaming Controller",
    category: "keychains",
    price: 13.99,
    description: "Nostalgic gaming controller in neon colors. A must-have for gamers!",
    emoji: "🎮",
    tags: ["pop-culture", "gaming", "retro", "neon"]
  },

  // Prints
  {
    id: 5,
    name: "Moonlit Forest Print",
    category: "prints",
    price: 24.99,
    description: "A4 art print featuring a magical forest under starlight. Premium matte finish.",
    emoji: "🌙",
    tags: ["nature", "forest", "moon", "magical"],
    popular: true
  },
  {
    id: 6,
    name: "Anime Cityscape Sunset",
    category: "prints",
    price: 27.99,
    description: "Vibrant anime-style cityscape with warm sunset colors. Perfect for your wall!",
    emoji: "🌆",
    tags: ["pop-culture", "anime", "city", "sunset"],
    popular: true
  },
  {
    id: 7,
    name: "Tropical Paradise Print",
    category: "prints",
    price: 22.99,
    description: "Lush tropical scene with exotic birds and flowers in bright, cheerful colors.",
    emoji: "🌺",
    tags: ["nature", "tropical", "birds", "colorful"]
  },
  {
    id: 8,
    name: "Kawaii Cat Cafe Print",
    category: "prints",
    price: 26.99,
    description: "Adorable kawaii-style cats in a cozy cafe setting. Too cute to resist!",
    emoji: "🐱",
    tags: ["pop-culture", "kawaii", "cats", "cute"]
  },

  // Badges
  {
    id: 9,
    name: "Wildflower Power Badge",
    category: "badges",
    price: 8.99,
    description: "Embroidered wildflower design with 'Girl Power' message. Iron-on backing.",
    emoji: "🌼",
    tags: ["nature", "flowers", "empowerment", "embroidered"],
    popular: true
  },
  {
    id: 10,
    name: "Pixel Heart Badge Set",
    category: "badges",
    price: 16.99,
    description: "Set of 4 pixel art heart badges in different neon colors. Perfect for jackets!",
    emoji: "💖",
    tags: ["pop-culture", "pixel", "hearts", "neon"],
    popular: true
  },
  {
    id: 11,
    name: "Mountain Adventure Badge",
    category: "badges",
    price: 9.99,
    description: "Scenic mountain landscape with 'Adventure Awaits' text. For nature lovers!",
    emoji: "⛰️",
    tags: ["nature", "mountains", "adventure", "hiking"]
  },
  {
    id: 12,
    name: "Retro Cassette Badge",
    category: "badges",
    price: 7.99,
    description: "Nostalgic cassette tape design in holographic finish. Music lover essential!",
    emoji: "📼",
    tags: ["pop-culture", "music", "retro", "holographic"]
  },

  // Charms
  {
    id: 13,
    name: "Succulent Garden Charm",
    category: "charms",
    price: 14.99,
    description: "Tiny polymer clay succulent in a miniature pot. Adorable bag accessory!",
    emoji: "🌱",
    tags: ["nature", "plants", "miniature", "polymer-clay"],
    popular: true
  },
  {
    id: 14,
    name: "Magical Girl Wand Charm",
    category: "charms",
    price: 18.99,
    description: "Sparkling magical girl wand with star details and pastel colors.",
    emoji: "⭐",
    tags: ["pop-culture", "magical-girl", "sparkle", "pastel"],
    popular: true
  },
  {
    id: 15,
    name: "Ocean Wave Charm",
    category: "charms",
    price: 13.99,
    description: "Resin wave charm with glitter and tiny sea shells embedded inside.",
    emoji: "🌊",
    tags: ["nature", "ocean", "resin", "glitter"]
  },
  {
    id: 16,
    name: "Kawaii Food Charm Set",
    category: "charms",
    price: 21.99,
    description: "Set of 3 kawaii food charms: ramen, sushi, and boba tea. Too cute!",
    emoji: "🍜",
    tags: ["pop-culture", "kawaii", "food", "set"]
  },
  {
    id: 17,
    name: "Celestial Moon Phases",
    category: "charms",
    price: 16.99,
    description: "Elegant moon phases charm in rose gold with tiny crystals.",
    emoji: "🌙",
    tags: ["nature", "celestial", "moon", "crystals"]
  },
  {
    id: 18,
    name: "Retro Arcade Token",
    category: "charms",
    price: 12.99,
    description: "Vintage-style arcade token with neon glow accents. Gamer approved!",
    emoji: "🪙",
    tags: ["pop-culture", "arcade", "retro", "glow"]
  }
];

// Helper functions for product management
const ProductManager = {
  // Get all products
  getAllProducts: () => products,

  // Get products by category
  getProductsByCategory: (category) => {
    if (category === 'all') return products;
    return products.filter(product => product.category === category);
  },

  // Get popular products
  getPopularProducts: () => products.filter(product => product.popular),

  // Get product by ID
  getProductById: (id) => products.find(product => product.id === parseInt(id)),

  // Search products by name or tags
  searchProducts: (query) => {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  // Get products by price range
  getProductsByPriceRange: (min, max) => {
    return products.filter(product => product.price >= min && product.price <= max);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, ProductManager };
}