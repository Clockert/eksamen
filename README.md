# Fram Food Delivery

A modern, sustainable food delivery web application connecting customers directly with local Norwegian farms, built with a focus on user experience, sustainability, and advanced features.

> This project was developed as part of the Frontend Essentials course exam for Oslo Nye Fagskole, Spring 2025.

![Fram Food Delivery](assets/hero_img.webp)

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [AI Chatbot Implementation](#-ai-chatbot-implementation)
- [Nutrition API Integration](#-nutrition-api-integration)
- [Responsive Design](#-responsive-design)
- [Security Considerations](#-security-considerations)
- [Future Improvements](#-future-improvements)
- [Technical Insights](#-technical-insights)
- [AI as a Development Tool](#-ai-as-a-development-tool)
- [Version Control Learnings](#-version-control-learnings)
- [Troubleshooting](#-troubleshooting)
- [Academic Context](#-academic-context)
- [Contributors](#-contributors)
- [Acknowledgments](#-acknowledgments)

## 🌱 Overview

Fram is a circular service that ensures your kitchen is always stocked with fresh, locally sourced produce from partner farms in Norway. This web application provides a seamless shopping experience with features like product browsing, detailed nutrition information, shopping cart functionality, and an AI-powered chatbot for customer assistance.

## ✨ Key Features

### Core Functionality

- **Product Catalog**: Browse through seasonal produce from Norwegian farms
- **Product Details**: View comprehensive product information, including origin and cultivation methods
- **Shopping Cart**: Add and manage items with persistent storage between sessions
- **Checkout Process**: Complete orders with shipping and payment details
- **Responsive Design**: Optimized experience across all device sizes

### Advanced Features

- **AI-Powered Chatbot**: Get immediate answers about products, sustainability practices, and more
- **Nutrition Information**: Access detailed nutritional data for all products via USDA Food Data Central API
- **Farm Mapping**: See partner farm locations through embedded maps
- **Local Storage**: Cart data persists between visits
- **Template-Based Architecture**: Modular HTML template system for consistent component rendering and improved maintainability

## 🛠️ Technologies Used

### Frontend

- **HTML5**: Semantic structure for accessibility and SEO
- **Template System**: Custom template loader for modular component architecture
- **CSS3 with BEM methodology**:
  - Initially started without a structured CSS approach
  - As the project grew, adopted BEM (Block Element Modifier) to:
    - Prevent naming collisions between components
    - Make CSS more predictable and maintainable
    - Clearly identify where changes were needed in the codebase
    - Create self-documenting class names that show relationships between elements
- **JavaScript (ES6+)**: Modern JS with modular architecture and template-based components

### API Integrations

- **OpenAI API**: Powers the customer support chatbot with real-time product knowledge
- **USDA Food Data Central API**: Provides detailed nutrition information for products
- **Google Maps Embed API**: Displays partner farm locations

### Design & Development

- **Responsive Design**: Mobile-first approach with flexbox and CSS grid
- **Modular JavaScript**: Component-based architecture
- **Local Storage**: For cart persistence and nutrition data caching

## 📚 Project Structure

```
fram-food-delivery/
├── assets/               # Images and static resources
│   ├── hero_img.webp     # Hero image for homepage
│   ├── favicon.ico       # Website favicon
│   ├── produce/          # Product images
│   │   ├── apples.webp
│   │   ├── carrots.png
│   │   ├── garlic.webp
│   │   └── ...
│   └── ...               # Other image assets
│
├── Data/                 # JSON data files for products
│   └── products.json     # Product catalog with details
│
├── node_modules/         # NPM dependencies (not tracked in git)
│   ├── express/          # Express.js framework
│   ├── cors/             # CORS middleware
│   ├── dotenv/           # Environment variables management
│   ├── node-fetch/       # Fetch API for Node.js
│   └── ...               # Many other dependencies
│
├── templates/            # HTML template files
│   ├── navbar.html       # Navigation component template
│   ├── footer.html       # Footer component template
│   ├── menu-overlay.html # Mobile menu template
│   ├── cart-overlay.html # Shopping cart overlay template
│   ├── cart-item.html    # Individual cart item template
│   └── product-card.html # Product card component template
│
├── Script/               # JavaScript files
│   ├── cart.js           # Shopping cart functionality
│   ├── chatbot.js        # AI chatbot integration
│   ├── checkout.js       # Checkout process handling
│   ├── Components.js     # Reusable UI components
│   ├── nutrition-cache.js # Caching system for nutrition data
│   ├── PopularProducts.js # Popular products component
│   ├── produce.js        # Product listing and detail functionality
│   └── productRenderer.js # Product display components
│
├── Styles/               # CSS files
│   ├── base.css          # Core styles and variables
│   ├── chatbot.css       # Chatbot interface styles
│   ├── checkout.css      # Checkout page styles
│   ├── footer.css        # Footer component styles
│   ├── index.css         # Homepage specific styles
│   ├── main.css          # Main stylesheet (imports)
│   ├── nav.css           # Navigation component styles
│   ├── popular-produce.css # Popular products section styles
│   ├── product-detail.css # Product detail page styles
│   ├── produce.css       # Product listing page styles
│   └── cartoverlay.css   # Shopping cart overlay styles
│
├── HTML Pages
│   ├── index.html        # Homepage
│   ├── produce.html      # Product listing page
│   ├── product-detail.html # Product detail page
│   ├── checkout.html     # Checkout page
│   └── chatbot.html      # Dedicated chatbot page
│
├── server.js             # Express server for API proxy
├── package.json          # Project dependencies
├── package-lock.json     # Dependency lock file
├── .env                  # Environment variables (not in repo)
├── .gitignore            # Git ignore configuration
└── README.md             # Project documentation
```

This structure reflects a modular, component-based approach to frontend development, with clear separation of concerns between data, functionality, styling, and views.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+) and npm installed
- OpenAI API key for chatbot functionality
- Food Data Central API key for nutrition information

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Clockert/eksamen
   cd eksamen
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   FDC_API_KEY=your_food_data_central_api_key_here
   PORT=3000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Navigate to `http://localhost:3000` in your browser to view the application.

**Note**: The application uses a custom template loading system. Common components (navbar, footer, cart, menu) are automatically loaded from the `templates/` folder when each page initializes.

## 🧠 AI Chatbot Implementation

The Fram chatbot uses OpenAI's GPT model to provide customers with accurate information about:

- Current seasonal produce availability
- Norwegian agriculture and farming practices
- Sustainability initiatives and circular packaging
- Delivery areas and timeframes
- Partner farm information
- Detailed product recommendations

### Architecture

1. **Client-side (chatbot.js)**:

   - Manages the chat interface
   - Handles user inputs and displays responses
   - Sends user messages to the server

2. **Server-side (server.js)**:
   - Acts as a proxy between the client and OpenAI API
   - Secures the API key
   - Adds system prompt to guide the AI's responses
   - **Dynamically updates available products** in the prompt using real-time inventory data
   - Configures model parameters (`max_tokens: 250`, `temperature: 0.7`) for optimal balance of detail and creativity

### Ethical Considerations

I've implemented several measures to ensure ethical AI use:

- Clear labeling of the chatbot as an AI assistant
- Designed system prompt for factual statements about sustainability
- No persistent storage of conversation history
- Graceful degradation with user-friendly error messages
- Transparent recommendations based on actual product availability

## 📊 Nutrition API Integration

The application leverages the USDA Food Data Central API to provide accurate nutrition information for all products:

- **Detailed Nutrient Data**: Shows key nutritional values for each product, including calories, protein, carbohydrates, etc.
- **Advanced Caching System**: I implemented a localStorage-based caching system to minimize API calls and improve performance:
  - Stores API responses with timestamps
  - Automatically expires cache entries after 24 hours
  - Intelligently prunes oldest entries when cache fills
  - Falls back to expired cache data when API is unavailable
- **Error Handling**: Graceful degradation when nutrition data is unavailable
- **Responsive Display**: Nutrition information adapts to different screen sizes

## 📱 Responsive Design

The application is fully responsive and optimized for all device sizes:

- Mobile-first approach
- Flexible layouts using CSS Grid and Flexbox
- Optimized images and assets
- Touch-friendly interfaces for mobile users
- Consistent experience across devices

## 🔒 Security Considerations

- API keys stored securely in environment variables, not in client-side code
- Server-side proxy for external API calls to prevent exposure of credentials
- Input validation for all user-submitted data
- Cross-site scripting (XSS) protection

## 🧪 Future Improvements

- User authentication and account management
- Advanced filtering and search functionality
- Order history and reordering functionality
- Enhanced personalization and recommendations
- Expanded payment options
- Multilingual support (Norwegian/English)

## 💡 Technical Insights

As this project evolved, I learned several valuable lessons that might benefit others:

1. **CSS Architecture Matters**: I didn't start with BEM methodology, but as the project grew in complexity, I found myself struggling to manage CSS changes. Adopting BEM mid-project:

   - Eliminated naming conflicts between components
   - Created a clear, predictable structure
   - Made it easier to locate and modify specific styles
   - Reduced the risk of unintended style changes

   This experience reinforced the importance of adopting a structured CSS methodology early in development, even for seemingly small projects.

2. **Component-Based Architecture**: Drawing from my prior experience with website builders like Elementor, Squarespace, and Divi, I implemented reusable components for navigation, footer, and product displays. This approach:

   - Improved consistency across pages
   - Made the codebase more maintainable
   - Reflected real-world development practices

   While this wasn't explicitly required by the course, it helped create a more professional and scalable application.

3. **JSON for Data Management**: I chose to store product data in a separate JSON file rather than hardcoding it in HTML. Though not as robust as a full database (which was beyond the scope of this project), this approach:

   - Created a clear separation between data and presentation
   - Enabled dynamic rendering of products
   - Centralized product information management
   - Simulated interaction with a backend API

   This structure made the application more maintainable and closer to a production-ready system.

4. **Progressive Enhancement for APIs**: Implementing fallback mechanisms for API calls proved essential. The nutrition data caching system not only improved performance but also provided resilience when:

   - API services were unavailable
   - Rate limits were reached
   - Network connectivity was unstable

   This approach ensured a good user experience even when external dependencies failed.

5. **Modular JavaScript**: Organizing JavaScript into component-based files with clear responsibilities made the codebase significantly more manageable as new features were added.

6. **Ethical AI Implementation**: Designing the chatbot system taught me the importance of establishing clear boundaries for AI responses. The careful design of system prompts was crucial for ensuring accuracy and preventing potential misinformation.

7. **Template-Based Component System**: I implemented a custom template loading system that:

   - **Separates Structure from Logic**: HTML templates are stored in separate files, keeping component structure separate from JavaScript functionality
   - **Enables Component Reusability**: Components like the navbar, footer, and product cards can be easily reused across pages
   - **Improves Maintainability**: Changes to component structure only need to be made in one template file
   - **Supports Dynamic Content**: Templates support placeholder replacement for dynamic data rendering
   - **Enhances Performance**: Templates are cached after first load, reducing repeated fetch requests

   This approach bridges the gap between vanilla JavaScript and modern frameworks, providing structure and reusability without the complexity of a full framework. The `Templates.js` module handles loading, caching, and instantiating templates, while individual component scripts focus purely on functionality.

## 🤖 AI as a Development Tool

Throughout this project, I explored the use of AI not just as a feature (the chatbot) but also as a development tool. This dual approach provided valuable insights into the current state of AI in web development:

### My Experience Using AI During Development

I began the project doing most of the coding myself but gradually incorporated AI assistance as the project's complexity grew. My approach evolved in these stages:

1. **Initial Development**: Started with minimal AI help, building core structures and components independently
2. **Growing Complexity**: As features multiplied, used AI for problem-solving discussions and code suggestions
3. **Integration Challenges**: Sought AI guidance when connecting multiple systems (cart, nutrition API, OpenAI)
4. **Final Refinement**: Required significant manual cleanup of AI-suggested code to ensure quality and consistency

### Benefits Observed

- **Accelerated Problem-Solving**: AI helped identify solutions to complex implementation challenges faster
- **Learning Tool**: Exposed me to alternative approaches and patterns I might not have considered
- **Documentation Assistance**: Improved code comments and documentation with more comprehensive explanations
- **Reduced Development Time**: For some routine tasks, AI suggestions saved significant time

### Limitations and Challenges

- **Code Quality Issues**: AI sometimes produced code that looked functional but contained subtle bugs or inefficiencies
- **Integration Problems**: Suggested code often didn't properly integrate with the existing codebase architecture
- **Inconsistent Styling**: AI-generated code didn't always adhere to the project's established patterns and naming conventions
- **Required Verification**: Every AI suggestion needed careful review and often substantial modification

### Reflection on AI in Professional Development

While this was an academic project, the experience reflects real-world considerations for using AI in professional development. I believe AI tools will become standard in professional environments, but with important caveats:

- AI works best as a collaborative tool rather than a replacement for developer expertise
- Critical review of AI-generated code is essential, not optional
- Understanding fundamentals remains crucial to effectively evaluate and modify AI suggestions
- Team standards for AI use will likely become an important part of development workflows

This experience has prepared me to work in environments where AI assistance is available while maintaining the critical thinking skills needed to use such tools responsibly and effectively.

## 🔄 Version Control Learnings

This project also served as a learning experience with Git and GitHub workflows. As someone relatively new to structured version control practices, I encountered several challenges:

### My Experience with Git and GitHub

1. **Initial Hesitation**: I found Git's branching model and pull request workflow intimidating at first
2. **Fear of Breaking Things**: I was often concerned about potentially damaging the codebase with incorrect merge operations
3. **Learning Through Practice**: Gradually became more comfortable with basic Git operations but still struggled with more complex scenarios
4. **Room for Improvement**: I recognize that my approach to version control during this project wasn't optimal and represents an area for growth

### What Worked

- **Basic Commit Pattern**: Regular commits with descriptive messages helped track changes
- **GitHub as a Backup**: Using GitHub as a remote repository ensured code was safely stored
- **Documentation Access**: GitHub's README display made documentation accessible

### Challenges Faced

- **Branch Management**: I wasn't confident in creating and merging feature branches
- **Resolving Conflicts**: Merge conflicts were particularly stressful to resolve
- **Pull Request Workflow**: The formal pull request process felt overwhelming for a solo project
- **Commit Granularity**: My commits were sometimes too large, encompassing multiple changes that ideally should have been separate

### Future Improvements

For future projects, I plan to:

- Practice with branches in a low-stakes environment to build confidence
- Follow a more structured Git workflow even for solo projects
- Use more targeted, single-purpose commits
- Potentially use Git GUI tools to better visualize the branching structure
- Take advantage of GitHub's project management features

This experience highlighted that effective version control is a skill that requires deliberate practice, and I'm committed to improving this aspect of my development workflow.

## 🔧 Troubleshooting

**API Connection Issues**

- Ensure your `.env` file contains valid API keys
- Check server logs for any API rate limiting or errors

**Chatbot Not Responding**

- Verify your OpenAI API key is valid and has sufficient credits
- Check the server console for any error messages

**Products Not Loading**

- Ensure your server is running properly
- Check the browser console for any network errors

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributors

- Charlotte Lockert - [GitHub Profile](https://github.com/Clockert)

## 🙏 Acknowledgments

- Oslo Nye Fagskole for the course framework and guidance
- OpenAI for providing the GPT API
- USDA for the Food Data Central API
- All contributors who have helped shape this project

## 📚 Academic Context

This project was developed as the final exam submission for the Frontend Essentials course at Oslo Nye Fagskole. The assignment required the creation of a sustainable food delivery web application with specific focus on:

- Implementing responsive design across all devices
- Integrating an AI-powered chatbot using OpenAI's API
- Incorporating a third-party API (USDA Food Data Central)
- Applying modern web development best practices
- Addressing ethical considerations in AI implementation

### Project Expansion Beyond Requirements

While the original assignment provided a Figma design with basic pages, I expanded the project scope to create a more realistic e-commerce experience. I added several key features that weren't in the original design:

- **Shopping Cart System**: A fully functional cart with persistent storage
- **Product Detail Pages**: Comprehensive pages with nutrition information and purchase options
- **Checkout Flow**: A complete checkout experience with form validation and order confirmation

These additions significantly increased the project's complexity but resulted in a more production-ready application that better represents real-world requirements for an e-commerce platform. This approach demonstrates both technical skills and an understanding of essential user experience elements for online shopping.

### Technical Innovations

Beyond the basic requirements, I implemented several technical innovations to enhance the application's performance and user experience:

1. **Nutrition API Integration**: The product detail pages were specifically added to showcase integration with the USDA Food Data Central API, providing real nutritional information for each product.

2. **Smart Caching System**: Implemented an intelligent caching mechanism for nutrition data that:

   - Stores API responses in localStorage to reduce API calls
   - Sets expiration times for cached data to ensure freshness
   - Implements pruning logic to manage cache size
   - Falls back to expired cache data when API calls fail

3. **Optimized OpenAI Integration**: Carefully tuned the chatbot configuration for optimal performance:

   - `max_tokens: 250`: Balances response length with performance, providing detailed but concise answers
   - `temperature: 0.7`: Creates a good balance between creativity and accuracy in responses
   - Dynamic product awareness: The system prompt is updated with the current product inventory, enabling the AI to provide accurate stock information

4. **Thoughtful System Prompt Design**: The prompt was crafted to:
   - Define clear boundaries for the AI's knowledge about Fram
   - Provide accurate information about Norwegian agriculture and sustainability
   - Guide response length and style for a consistent user experience
   - Include instructions for handling common customer service scenarios
