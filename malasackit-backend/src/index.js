import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Add this
import locationRoutes from './routes/locationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import donationRequestRoutes from './routes/donationRequestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import beneficiaryRoutes from './routes/beneficiaryRoutes.js';
import distributionRoutes from './routes/distributionRoutes.js';
import walkInRoutes from './routes/walkInRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { sanitizeMiddleware } from './middleware/sanitization.js';
import { 
    generalApiLimiter, 
    authSecurityLimiter 
} from './middleware/rateLimiter.js';

const app = express();
const port = 3000;

// CORS configuration for cookies
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Your frontend URL
    credentials: true // Allow cookies
}));

app.use(cookieParser()); // Add cookie parser middleware
app.use(express.json());

// Rate limiting middleware (FIRST for security)
app.use('/api', generalApiLimiter); // General API rate limiting
app.use('/api/auth', authSecurityLimiter); // Extra protection for auth endpoints

// Input sanitization middleware (AFTER rate limiting)
app.use(sanitizeMiddleware);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', locationRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donation-requests', donationRequestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/walkin', walkInRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);



// Backend - Add to your server.js
app.post("/api/generate-insights", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: "Missing required field: data",
      });
    }

    console.log('📊 Generating rule-based insights for', data.length, 'items');
    const insights = generateRuleBasedInsights(data);
    res.json({ insights, success: true });

  } catch (error) {
    console.error("Generate Insights Error:", error);
    res.status(500).json({
      error: "Failed to generate insights. Please try again.",
      details: error.message,
    });
  }
});

// Rule-based insights generator
function generateRuleBasedInsights(data) {
  const insights = [];
  
  // Count critical and low stock items
  const criticalItems = data.filter(item => item.status === 'critical');
  const lowItems = data.filter(item => item.status === 'low');
  const okItems = data.filter(item => item.status === 'ok');
  
  // Calculate percentages
  const criticalPercent = Math.round((criticalItems.length / data.length) * 100);
  const lowPercent = Math.round((lowItems.length / data.length) * 100);
  
  // Group by category
  const categoryMap = {};
  data.forEach(item => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { critical: 0, low: 0, total: 0 };
    }
    categoryMap[item.category].total++;
    if (item.status === 'critical') categoryMap[item.category].critical++;
    if (item.status === 'low') categoryMap[item.category].low++;
  });
  
  // Find most affected category
  let worstCategory = null;
  let worstScore = 0;
  Object.entries(categoryMap).forEach(([category, stats]) => {
    const score = (stats.critical * 2) + stats.low;
    if (score > worstScore) {
      worstScore = score;
      worstCategory = category;
    }
  });

  // Generate 4 insights with item names
  if (criticalItems.length > 0) {
    const criticalNames = criticalItems.slice(0, 3).map(item => item.name).join(', ');
    const moreText = criticalItems.length > 3 ? ` and ${criticalItems.length - 3} more` : '';
    insights.push(`1. ${criticalItems.length} items critically low (${criticalPercent}%): ${criticalNames}${moreText} need immediate restocking.`);
  } else {
    insights.push(`1. No critical stock issues detected, inventory levels are stable.`);
  }

  if (lowItems.length > 0) {
    const lowNames = lowItems.slice(0, 3).map(item => item.name).join(', ');
    const moreText = lowItems.length > 3 ? ` and ${lowItems.length - 3} more` : '';
    insights.push(`2. ${lowItems.length} items running low (${lowPercent}%): ${lowNames}${moreText} require attention soon.`);
  } else {
    insights.push(`2. All items maintain healthy stock levels above minimum thresholds.`);
  }

  if (worstCategory && (categoryMap[worstCategory].critical > 0 || categoryMap[worstCategory].low > 0)) {
    const categoryIssues = data.filter(item => 
      item.category === worstCategory && (item.status === 'critical' || item.status === 'low')
    );
    const issueNames = categoryIssues.slice(0, 3).map(item => item.name).join(', ');
    const moreText = categoryIssues.length > 3 ? ` and ${categoryIssues.length - 3} more` : '';
    insights.push(`3. ${worstCategory} category has ${categoryIssues.length} items needing replenishment: ${issueNames}${moreText}.`);
  } else {
    insights.push(`3. Stock distribution across categories is well-balanced and optimal.`);
  }

  if (okItems.length > 0) {
    const okPercent = Math.round((okItems.length / data.length) * 100);
    insights.push(`4. ${okItems.length} items (${okPercent}%) have adequate stock for operations.`);
  } else {
    insights.push(`4. Review all safety thresholds to prevent future stock shortages.`);
  }

  return insights.join('\n');
}


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});