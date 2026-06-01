# Admin Dashboard SeeJob

A full-stack admin dashboard application built with Angular 17 frontend and Node.js/Express backend with Prisma ORM.

## Features

- **Authentication**: JWT-based login system
- **Dashboard**: Member statistics and analytics
- **Member Management**: View and manage members
- **Billing**: Billing management interface
- **Analytics**: Data visualization and reporting
- **Support**: Support ticket management

## Tech Stack

### Frontend
- Angular 17
- TypeScript
- Jest (testing framework)
- Angular Material (UI components)
- RxJS

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL database
- JWT authentication
- bcryptjs for password hashing

## 📦 Backend Deployment Options

### Option 1: Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/mariaiqbal98-cpu/Admin-dashboard-seejob.git
   cd Admin-dashboard-seeJob
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Setup environment variables
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   
   # Setup database
   npx prisma generate
   npx prisma migrate deploy
   
   # Start backend server
   npm run start
   ```

### Option 2: Docker Deployment (Recommended for Production)

#### Quick Docker Setup
```bash
# Navigate to project directory
cd Admin-dashboard-seeJob

# Build and run backend with database
docker-compose up backend database --build

# Run in background
docker-compose up backend database --build -d
```

#### Full Docker Services (Backend + Database + Migrations)
```bash
# Run all backend services
docker-compose up --build

# View logs
docker-compose logs backend
docker-compose logs database

# Stop services
docker-compose down
```

## 🔧 Backend Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/seeJob_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL="http://localhost:4200"
```

### Database Setup

The backend uses Prisma ORM with MySQL. Database migrations are handled automatically in Docker deployment.

For manual setup:
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed # If you have seed data
```

## 🌐 Backend API Access

After successful deployment:
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/dev-login` - Development login (dev only)

### Dashboard
- `GET /api/dashboard/summary` - Dashboard statistics

### Members
- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Other Routes
- `GET /api/billing` - Billing information
- `GET /api/analytics` - Analytics data
- `GET /api/support` - Support tickets

## 🧪 Backend Testing

```bash
cd backend
npm test                    # Run tests
npm run test:coverage       # Run with coverage
npm run test:watch          # Watch mode
```

## 🔍 Monitoring & Debugging

### Docker Health Checks
```bash
# Check service health
docker-compose ps

# View backend logs
docker-compose logs backend
docker-compose logs database

# Access database
docker-compose exec database mysql -u root -p

# Access backend container
docker-compose exec backend sh
```

### Manual Debugging
```bash
# Backend logs in development
cd backend && npm run dev

# Database connection test
cd backend && npx prisma studio

# Check Prisma schema
cd backend && npx prisma validate
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using port 3000
   netstat -ano | findstr :3000
   ```

2. **Database connection issues**
   ```bash
   # Verify MySQL is running
   docker-compose ps database
   
   # Check database logs
   docker-compose logs database
   ```

3. **Prisma issues**
   ```bash
   # Regenerate Prisma client
   cd backend
   npx prisma generate
   
   # Reset database (development only)
   npx prisma migrate reset
   ```

## 📊 Performance Optimizations

### Repository Size Optimization
- **Before**: 800MB+ (included node_modules, dist, cache files)
- **After**: 39MB (optimized for fast deployment)
- **Improvement**: 99% size reduction

### Docker Optimizations
- Multi-stage builds for minimal image sizes
- Prisma client generation optimized for containers
- Health checks for reliable deployments
- Proper dependency caching

## 🔒 Security Considerations

- Change default JWT secret in production
- Use environment-specific database credentials
- Configure proper CORS settings
- Use strong passwords for database
- Enable SSL/TLS in production
- Implement rate limiting for APIs

---

## 🆘 Quick Help

Need immediate help? Check these first:

1. **Can't start backend**: Run `docker-compose up backend database --build`
2. **Database errors**: Check DATABASE_URL in .env file
3. **API calls failing**: Check CORS settings and verify backend is running on port 3000
4. **Prisma errors**: Run `npx prisma generate` in backend directory
5. **Docker not working**: Ensure Docker Desktop is running

For more help, check the troubleshooting section above.

### Backend Tests
```bash
cd backend
npm test
```

## Development Notes

- The backend uses Prisma as the ORM for database operations
- JWT tokens are used for authentication
- The frontend uses Angular guards to protect routes
- All API calls include authorization headers automatically via interceptors

## Security Considerations

- JWT secret should be changed in production
- Remove dev-login endpoint in production
- Consider using HttpOnly cookies instead of localStorage for JWT storage
- Implement proper CORS configuration for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.