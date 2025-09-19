# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Starting the Development Server
```powershell
# Install dependencies (first time setup)
npm install

# Start development server with live reload
npm run dev

# Alternative: Start simple server without live reload
npm start
```

### Testing and Validation
```powershell
# Validate HTML structure
Get-Content index.html | Select-String "<.*?>" | Measure-Object

# Check JavaScript syntax
node -c js/script.js
node -c js/products.js

# Validate CSS
# Use browser dev tools or online CSS validators
```

## Architecture Overview

### Project Structure
This is a **client-side only e-commerce website** for Mimoo Store - no backend server or database required.

**Key Components:**
- `index.html` - Single-page application with all sections
- `js/products.js` - Product database and management functions
- `js/script.js` - Main application logic and DOM interactions
- `css/styles.css` - Complete styling with CSS custom properties

### Application Architecture

**State Management:**
- Shopping cart state stored in `localStorage` as JSON
- Current filter state maintained in JavaScript variables
- No external state management library used

**Data Flow:**
1. `ProductManager` object provides product data access methods
2. `script.js` handles all UI interactions and state changes
3. Cart operations persist to localStorage automatically
4. DOM updates happen through direct manipulation

**Core Modules:**
- **ProductManager** (products.js): Database queries, filtering, search
- **Cart System** (script.js): Add/remove items, persistence, UI updates
- **Filter System** (script.js): Category filtering with smooth animations
- **UI Animations** (script.js): Scroll effects, button interactions, modal handling

### CSS Architecture

**Design System:**
- CSS custom properties define complete color palette
- Gradient definitions for consistent brand colors
- Mobile-first responsive design approach
- Animation keyframes for floating elements and interactions

**Color Palette Categories:**
- Nature inspired: forest-green, leaf-green, coral-pink, etc.
- Pop culture accents: electric-purple, neon-green, cyber-blue
- Gradients: rainbow-gradient, nature-gradient, pop-gradient

### Product Data Structure
Each product contains: id, name, category, price, description, emoji, tags, optional popular flag

**Categories:** keychains, prints, badges, charms

## Development Patterns

### Adding New Products
Add objects to the `products` array in `js/products.js`. The UI will automatically update.

### Styling Conventions
- Use CSS custom properties for all colors
- Follow BEM-like naming for component styles
- Animations should use transform and opacity for performance

### JavaScript Patterns
- Global functions exposed on window object for HTML onclick handlers
- Event delegation not used - direct event listeners on each element
- localStorage used for persistence (key: 'mimoo-cart')

## Important Implementation Details

### Cart Functionality
- Cart data structure: `{ id, name, category, price, emoji, quantity }`
- Functions: `addToCart()`, `removeFromCart()`, `updateCartQuantity()`
- All cart operations call `saveCart()` and `updateCartUI()`

### Product Filtering
- Filter buttons use data-filter attributes
- `ProductManager.getProductsByCategory()` handles all filtering
- "all" category returns complete product list

### Mobile Responsiveness
- Hamburger menu toggles with `.active` class
- CSS Grid with `auto-fit` and `minmax()` for responsive product grid
- Breakpoints handled through CSS Grid and Flexbox

### Performance Considerations
- Intersection Observer API used for scroll animations
- Debounce function available but not currently implemented
- No lazy loading (small dataset and local images via emoji)

## Theme and Branding

The site celebrates vibrant colors and combines nature themes with pop culture elements. All new features should maintain this aesthetic with:
- Bright, cheerful color combinations
- Smooth animations and hover effects
- Emoji usage for visual elements
- Gradient backgrounds for key sections