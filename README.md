# Fram Food Delivery

A sustainable food delivery webshop built with modern web technologies. This project provides a platform for ordering fresh, locally sourced produce with a focus on sustainability and user experience.

## 🌟 Features

### Core Features
- **Product Catalog**: Browse through a variety of fresh, locally sourced produce
- **Shopping Cart**: Add items to cart with quantity management
- **Checkout System**: Secure checkout process with form validation
- **Nutrition Information**: Detailed nutritional data for products using USDA Food Data Central API
- **Responsive Design**: Mobile-first approach ensuring great experience across all devices
- **Interactive Chatbot**: AI-powered customer support chatbot using OpenAI's GPT model
- **Smart Product Recommendations**: AI-driven product suggestions based on user preferences

### Advanced Features
- **Real-time Cart Updates**: Instant cart synchronization across all pages
- **Persistent Shopping Cart**: Cart data persists across browser sessions
- **Smart Search**: Intelligent product search with category filtering
- **Nutrition Data Caching**: Optimized performance with cached nutrition information
- **Responsive Images**: Optimized image loading for different devices
- **Form Validation**: Client-side validation with user-friendly error messages
- **Order Confirmation**: Detailed order summary with delivery tracking
- **Error Handling**: Graceful error handling with user-friendly messages
- **AI-Powered Nutrition Assistant**: OpenAI chatbot with real-time access to product nutrition data
- **Smart Inventory Awareness**: AI assistant knows current product availability and stock levels

## 🛠️ Technologies Used

### Frontend
- **Vanilla JavaScript (ES6+)**
  - Modern ES6+ features
  - Async/await for API calls
  - Event-driven architecture
  - Module pattern implementation
- **HTML5**
  - Semantic HTML
  - Accessibility features
  - SEO optimization
- **CSS3 with BEM methodology**
  - Responsive design
  - CSS Grid and Flexbox
  - CSS Variables
  - Media queries
- **Local Storage**
  - Cart persistence
  - User preferences
  - Session management

### Backend
- **Node.js**
  - Event-driven architecture
  - Non-blocking I/O
  - Scalable server implementation
- **Express.js**
  - RESTful API endpoints
  - Middleware implementation
  - Route handling
  - Error middleware
- **RESTful API architecture**
  - Resource-based routing
  - HTTP methods implementation
  - Status code handling

### APIs
- **USDA Food Data Central API**
  - Nutrition data retrieval
  - Food item search
  - Nutrient information
  - Real-time data integration with OpenAI
- **OpenAI GPT API**
  - Natural language processing
  - Context-aware responses
  - Conversation management
  - Product inventory awareness
  - Nutrition data integration
  - Smart product recommendations based on nutritional values
- **Custom nutrition data caching system**
  - Local storage implementation
  - Cache invalidation
  - Performance optimization
  - Seamless data sharing with AI assistant

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Clockert/eksamen.git
   cd eksamen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=3000
   USDA_API_KEY=your_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Basic Usage
1. Open your browser and navigate to `http://localhost:3000`
2. Browse the product catalog
3. Add items to your cart
4. Proceed to checkout
5. Fill in delivery details
6. Complete your order

### Advanced Features
- **Chatbot Interaction**
  - Click the chat icon in the bottom right
  - Type your question or request
  - Receive AI-powered responses
  - Get product recommendations
  - Ask about nutritional information
  - Check product availability
  - Get dietary advice based on current inventory

- **Nutrition Information**
  - View detailed nutrition facts on product pages
  - Compare nutritional values
  - Get dietary information
  - AI-powered nutrition recommendations
  - Real-time nutrition data integration
  - Personalized dietary suggestions based on available products

- **Cart Management**
  - Adjust quantities
  - Remove items
  - Save for later
  - View order summary

## 📁 Project Structure

```
├── Script/              # JavaScript source files
│   ├── cart.js         # Shopping cart functionality
│   │   ├── Cart management
│   │   ├── Local storage integration
│   │   └── UI updates
│   ├── checkout.js     # Checkout process
│   │   ├── Form validation
│   │   ├── Order processing
│   │   └── Payment handling
│   ├── Components.js   # Reusable UI components
│   │   ├── Navigation
│   │   ├── Footer
│   │   └── Product cards
│   ├── nutrition-cache.js # Nutrition data caching
│   │   ├── Cache management
│   │   ├── API integration
│   │   └── Data persistence
│   ├── PopularProducts.js # Featured products
│   │   ├── Product filtering
│   │   ├── Display logic
│   │   └── UI components
│   ├── produce.js      # Product listing and details
│   │   ├── Product display
│   │   ├── Search functionality
│   │   └── Category filtering
│   └── chatbot.js      # Customer support chatbot
│       ├── OpenAI integration
│       ├── Conversation management
│       └── Response handling
├── assets/             # Static assets
│   ├── images/        # Product images
│   ├── icons/         # UI icons
│   └── fonts/         # Custom fonts
├── Data/              # JSON data files
│   ├── products.json  # Product catalog
│   └── categories.json # Product categories
├── Styles/            # CSS stylesheets
│   ├── main.css      # Main styles
│   ├── components/   # Component styles
│   └── utilities/    # Utility classes
├── server.js          # Express server
└── package.json       # Project dependencies
```

## 🔧 Development

### Development Commands
- Run development server with hot reload:
  ```bash
  npm run dev
  ```

- Start production server:
  ```bash
  npm start
  ```

### Development Guidelines
1. **Code Style**
   - Follow BEM naming convention for CSS
   - Use ES6+ features
   - Implement proper error handling
   - Write meaningful comments

2. **Performance**
   - Optimize image loading
   - Implement lazy loading
   - Use caching strategies
   - Minimize API calls

3. **Testing**
   - Test all user interactions
   - Verify form validations
   - Check responsive design
   - Test API integrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Write clear commit messages
- Update documentation
- Add tests for new features
- Follow existing code style
- Create detailed PR descriptions

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Charlotte Lockert - [GitHub](https://github.com/Clockert)

## 🙏 Acknowledgments

- USDA Food Data Central for nutrition data
- OpenAI for providing the GPT API
- All contributors who have helped shape this project

## 📞 Support

For support, please:
1. Check the [documentation](https://github.com/Clockert/eksamen/wiki)
2. Search [existing issues](https://github.com/Clockert/eksamen/issues)
3. Create a new issue if needed

## 🔄 Updates

### Latest Updates
- Added OpenAI integration for chatbot
- Implemented nutrition data caching
- Enhanced mobile responsiveness
- Added product recommendations
- Integrated nutrition data with AI assistant
- Added real-time inventory awareness to chatbot
- Enhanced AI recommendations with nutritional data

### Planned Features
- User authentication
- Order history
- Wishlist functionality
- Advanced search filters
- Enhanced AI nutrition analysis
- Personalized meal planning based on inventory
- Dietary restriction filtering 