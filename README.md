
# Spark.deals - Deal Discovery Platform

A modern deal discovery platform built with React, TypeScript, and Supabase. Spark.deals helps users find the best deals and discounts from top retailers, with features for deal browsing, shop exploration, user authentication, and community-driven voting.

## 🚀 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **Routing**: React Router DOM
- **State Management**: TanStack React Query
- **Icons**: Lucide React
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **Development**: ESLint, TypeScript compiler

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── admin/           # Admin dashboard components
│   ├── DealCard*.tsx    # Deal display components
│   ├── Header.tsx       # Main navigation
│   ├── Footer.tsx       # Site footer
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Homepage
│   ├── AllDeals.tsx     # Deal listings
│   ├── Shops.tsx        # Shop directory
│   ├── Categories.tsx   # Category browsing
│   ├── Auth.tsx         # Authentication
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication logic
│   └── useCurrency.tsx  # Currency formatting
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions
└── data/               # Static data and mock data
```

## 🏗️ Major Modules

### 1. Deal Management System
- **DealListings.tsx**: Main component for displaying deals with filtering, sorting, and infinite scroll
- **DealCard variants**: Multiple view modes (grid, full, compact) for deal display
- **ViewSwitcher.tsx**: Toggle between different deal display layouts
- **FilterBar.tsx**: Advanced filtering by category, shop, and sorting options

### 2. Shop Directory
- **Shops.tsx**: Browse all available shops with search and filtering
- **ShopDetail.tsx**: Individual shop pages with their deals and coupons
- Shop logos, descriptions, and deal/coupon counts

### 3. Category System
- **Categories.tsx**: Browse deals by category
- **Category.tsx**: Individual category pages
- Hierarchical category organization

### 4. Authentication & User Management
- **Auth.tsx**: Login/signup forms
- **Profile.tsx**: User profile management
- **useAuth.tsx**: Authentication state management
- Role-based access control (admin, root_admin, user)

### 5. Admin Dashboard
- **RootDashboard.tsx**: Admin panel with comprehensive management tools
- CRUD operations for deals, shops, categories, users, blog posts
- Analytics and dashboard overview
- Bulk operations and data management

### 6. Search & Discovery
- **SearchBar.tsx**: Global search functionality
- **SearchResults.tsx**: Search results page
- Real-time search with query parameter handling

### 7. Content Management
- **Blog.tsx**: Blog post listings
- **BlogPost.tsx**: Individual blog post pages
- **StaticPage.tsx**: Dynamic static page rendering
- Markdown editor integration for content creation

## 🗄️ Database Schema

### Core Tables
- **deals**: Product deals with pricing, descriptions, and metadata
- **shops**: Store information with logos and descriptions
- **categories**: Hierarchical category system
- **users/profiles**: User accounts and profile information
- **deal_votes**: Community voting system for deals
- **coupons**: Coupon codes and promotions

### Content Tables
- **blog_posts**: Blog content management
- **static_pages**: Dynamic static page content
- **tags**: Tagging system for content organization

### Admin Tables
- **user_roles**: Role-based access control
- **subscribers**: Newsletter subscription management

### Key Features
- Row Level Security (RLS) for data protection
- Real-time updates with Supabase subscriptions
- Automatic slug generation for SEO-friendly URLs
- Heat score calculations for deal popularity

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Local Development
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spark-deals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase project URL and anon key
   - Configure any additional environment variables

4. **Database Setup**
   - Run the Supabase migrations in the `supabase/migrations/` directory
   - Set up Row Level Security policies
   - Seed initial data if needed

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:8080
   - Admin panel: http://localhost:8080/root/dashboard

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
1. **Lovable Platform**: Use the built-in publish feature
2. **Netlify/Vercel**: Connect your Git repository for automatic deployments
3. **Traditional Hosting**: Upload the `dist/` folder to your web server

### Environment Variables
Ensure all production environment variables are configured:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- Any additional API keys or configuration

### Database Migration
- Ensure all Supabase migrations are applied to production
- Verify RLS policies are properly configured
- Test authentication and authorization flows

## 🔧 Key Features

### User Features
- Browse deals with multiple view modes
- Search and filter functionality
- User authentication and profiles
- Deal voting and community features
- Newsletter subscription
- Responsive design for all devices

### Admin Features
- Comprehensive admin dashboard
- Content management for deals, shops, categories
- User management and role assignment
- Analytics and reporting
- Blog and static page management
- Bulk operations and data import/export

### Technical Features
- Server-side rendering with SEO optimization
- Real-time updates via Supabase subscriptions
- Infinite scroll pagination
- Image optimization and lazy loading
- Progressive Web App capabilities
- Comprehensive error handling and validation

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Tailwind CSS breakpoints for different screen sizes
- Touch-friendly interfaces for mobile devices
- Optimized layouts for tablets and desktops

## 🔐 Security

- Row Level Security (RLS) policies for data protection
- JWT-based authentication via Supabase Auth
- Role-based access control for admin features
- Input validation and sanitization
- HTTPS enforcement in production

## 🧪 Development Notes

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for consistent styling
- Component-based architecture
- Custom hooks for reusable logic

### Performance Optimizations
- React Query for efficient data fetching and caching
- Infinite scroll for large data sets
- Image lazy loading
- Code splitting with React Router
- Optimized bundle size with Vite

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- CSS Grid and Flexbox layouts

## 📞 Support

For questions or issues:
- Check the documentation in the `/docs` folder
- Review the component examples in `/src/components`
- Open an issue in the project repository
- Contact the development team

---

Built with ❤️ using React, TypeScript, and Supabase.
