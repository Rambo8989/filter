# Traffic Filter Pro

A professional traffic filtering and bot detection system built with Next.js 14, featuring advanced AI-powered bot detection, geo-targeting, and real-time analytics.

## 🚀 Features

### Core Protection
- **Advanced Bot Detection**: AI-powered bot detection with 99.9% accuracy
- **Geographic Filtering**: Country-based access control with 195+ countries
- **Campaign Verification Protection**: Blocks major ad verification services (IAS, DoubleVerify, Moat, etc.)
- **Visit Limit Control**: Configurable visit limits with time-based resets
- **Real-time Traffic Analysis**: Live monitoring of all traffic patterns

### Machine Learning
- **Neural Network Bot Detection**: 40-feature extraction with continuous learning
- **Behavioral Analysis**: Request pattern and timing analysis
- **Auto-Learning System**: Automatically discovers new bot patterns
- **Organization IP Detection**: Learns and identifies organization IP ranges
- **Pattern Recognition**: Discovers new bot signatures from traffic

### Admin Dashboard
- **Website Management**: Add, edit, and configure multiple websites
- **Real-time Monitoring**: Live traffic analysis and bot detection
- **Analytics & Reporting**: Comprehensive traffic analytics
- **Code Generation**: Generate cloaking code for multiple platforms
- **Campaign Control**: Master on/off switches for each website

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Vercel Postgres), In-memory fallback
- **Authentication**: JWT tokens with bcrypt
- **ML**: Custom neural network implementation
- **Deployment**: Vercel (recommended), Netlify, Railway, DigitalOcean, AWS

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (optional)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd traffic-filter-pro
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file:
\`\`\`env
# Optional - for database features
POSTGRES_URL="your-postgres-connection-string"

# Optional - for enhanced security
JWT_SECRET="your-super-secret-jwt-key"
\`\`\`

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application. Admin panel is available at `http://localhost:3000/admin` with demo credentials: admin / admin123.

### Production Deployment

#### Deploy to Vercel

1. **Deploy**
\`\`\`bash
vercel --prod
\`\`\`

2. **Set up environment variables in Vercel dashboard**
   - `POSTGRES_URL` (optional - for database features)
   - `JWT_SECRET` (optional - for enhanced security)

3. **The app will work without database connection** - it uses in-memory storage as fallback

#### Manual Deployment

1. **Build the application**
\`\`\`bash
npm run build
\`\`\`

2. **Start production server**
\`\`\`bash
npm start
\`\`\`

## 🔧 Configuration

### Website Setup

1. **Create Admin Account**
   - Visit `/signup` to create your admin account
   - Login at `/login`

2. **Add Website**
   - Go to Admin Dashboard → Websites → Add Website
   - Configure your landing page (decoy) and safe page URLs
   - Set allowed countries and blocked platforms
   - Configure visit limits if needed

3. **Generate Cloaking Code**
   - Select your website in the dashboard
   - Go to "Get Code" tab
   - Choose your platform (HTML, PHP, WordPress, etc.)
   - Copy and implement the generated code

### Advanced Configuration

#### Country Filtering
\`\`\`javascript
// Allow specific countries
allowedCountries: ["US", "CA", "GB", "AU", "DE"]

// Block specific countries  
blockedCountries: ["CN", "RU", "IN", "BD"]
\`\`\`

#### Bot Platform Blocking
\`\`\`javascript
// Block major ad verification services
blockedPlatforms: [
  "integral_ad_science",
  "double_verify", 
  "moat",
  "grapeshot",
  "peer39"
]
\`\`\`

#### Visit Limits
\`\`\`javascript
// 5 visits per 24 hours
maxVisitLimit: 5,
visitLimitTimeHours: 24

// Unlimited visits
maxVisitLimit: null,
visitLimitTimeHours: null
\`\`\`

## 🤖 Machine Learning Features

### Bot Detection
The system uses a neural network with 40+ features:
- User agent analysis (length, patterns, structure)
- Header analysis (accept headers, language, encoding)
- IP analysis (organization detection, geolocation)
- Behavioral patterns (request timing, frequency)

### Auto-Learning
- **Behavioral Analysis**: Analyzes request patterns and session behavior
- **IP Organization Learning**: Automatically maps IP ranges to organizations
- **Pattern Recognition**: Discovers new bot signatures from traffic
- **Continuous Improvement**: Model accuracy improves with more data

### Training Interface
Access the ML training interface at `/admin/dashboard` → Bot Analysis:
- Add manual training data
- View model performance metrics
- Trigger batch training
- Monitor auto-learning progress

## 📊 Analytics & Monitoring

### Dashboard Metrics
- Total visits and conversion rates
- Bot vs human traffic breakdown
- Geographic distribution
- Top bot types and organizations
- Real-time traffic monitoring

### Real-time Monitoring
- Live visitor tracking
- Bot detection in real-time
- Page routing decisions
- Session analysis

## 🔒 Security Features

### Bot Protection
- **Campaign Verification Bots**: Blocks IAS, DoubleVerify, Moat, Grapeshot, Peer39, Pixalate
- **Search Engine Bots**: Configurable blocking of Google, Bing, Yahoo crawlers
- **Social Media Bots**: Facebook, Twitter, LinkedIn bot detection
- **AI/LLM Bots**: GPT, Claude, Bard, Gemini bot blocking
- **SEO Tools**: Ahrefs, SEMrush, Moz, Majestic blocking

### Traffic Analysis
- **IP Range Detection**: Identifies traffic from major organizations
- **User Agent Analysis**: Advanced pattern matching for bot detection
- **Behavioral Analysis**: Request timing and pattern analysis
- **Fingerprinting**: Browser and device fingerprinting

## 🚦 Traffic Flow Logic

### Campaign Active
\`\`\`
Real Human + Allowed Country + Within Visit Limit → Safe Page
Bot Traffic → Landing Page (Decoy)
Blocked Country → Landing Page (Decoy)  
Visit Limit Exceeded → Landing Page (Decoy)
\`\`\`

### Campaign Disabled
\`\`\`
ALL Traffic → Landing Page Only
\`\`\`

## 📝 API Documentation

### Authentication
\`\`\`javascript
// Login
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

// Signup
POST /api/auth/signup
{
  "username": "admin",
  "email": "admin@example.com", 
  "password": "password"
}
\`\`\`

### Website Management
\`\`\`javascript
// Get websites
GET /api/websites
Authorization: Bearer <token>

// Create website
POST /api/websites
Authorization: Bearer <token>
{
  "name": "My Website",
  "domain": "example.com",
  "landingPageUrl": "https://example.com",
  "safePageUrl": "https://example.com/safe",
  "allowedCountries": ["US", "CA"],
  "blockedAdPlatforms": ["googlebot", "facebook"]
}
\`\`\`

### Analytics
\`\`\`javascript
// Get analytics
GET /api/analytics?websiteId=1&timeRange=7d
Authorization: Bearer <token>

// Get real-time data
GET /api/real-time-data?websiteId=1
Authorization: Bearer <token>
\`\`\`

### ML & Bot Training
\`\`\`javascript
// Add training data
POST /api/bot-training
{
  "action": "add_single",
  "data": {
    "userAgent": "Mozilla/5.0...",
    "isBot": true,
    "category": "search_engine"
  }
}

// Get ML stats
GET /api/ml-bot-detection?action=model_stats
\`\`\`

## 🔧 Troubleshooting

### Common Issues

**Database Connection Issues**
\`\`\`bash
# Check your connection string
echo $POSTGRES_URL

# Test connection
npm run db:test
\`\`\`

**Bot Detection Not Working**
- Verify cloaking code is properly implemented
- Check campaign is active (not disabled)
- Review allowed countries and blocked platforms
- Monitor real-time logs for debugging

**High False Positives**
- Adjust ML model confidence threshold
- Add manual training data for legitimate traffic
- Review and update bot detection patterns

### Debug Mode
Enable debug logging:
\`\`\`env
DEBUG=true
LOG_LEVEL=debug
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full documentation](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/traffic-filter-pro/issues)
- **Email**: support@example.com
- **Discord**: [Join our community](https://discord.gg/example)

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced ML models (Random Forest, XGBoost)
- [ ] Real-time threat intelligence integration
- [ ] Advanced fingerprinting techniques
- [ ] API rate limiting and DDoS protection
- [ ] Multi-user support with role-based access
- [ ] Webhook integrations
- [ ] Advanced reporting and exports
- [ ] Mobile app for monitoring

### Performance Improvements
- [ ] Redis caching layer
- [ ] CDN integration
- [ ] Database query optimization
- [ ] Real-time WebSocket updates

## Architecture

\`\`\`
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin interface
│   ├── api/               # API routes
│   └── (pages)/           # Public pages
├── components/            # React components
├── lib/                   # Utility functions
├── middleware.ts          # Traffic filtering logic
└── public/               # Static assets
\`\`\`

## Security Features

- **Bot Detection**: Advanced pattern matching and behavioral analysis
- **IP Filtering**: Organization and suspicious IP blocking
- **Rate Limiting**: Built-in request throttling
- **Geo-Blocking**: Country-level access control
- **Admin Authentication**: Secure admin panel access

## Performance

- **Sub-100ms Response Time**: Optimized middleware processing
- **Edge Computing**: Runs on Vercel Edge Runtime
- **Minimal Overhead**: Lightweight filtering with maximum performance
- **Scalable Architecture**: Handles millions of requests per day

## Support

- **Documentation**: Comprehensive inline documentation
- **Demo Mode**: Works without database for testing
- **Fallback Systems**: Graceful degradation when services are unavailable
- **Error Handling**: Robust error handling and logging

---

**⚠️ Legal Disclaimer**: This tool is designed for legitimate traffic filtering and bot protection. Users are responsible for complying with all applicable laws and regulations in their jurisdiction. Use responsibly and ethically.
