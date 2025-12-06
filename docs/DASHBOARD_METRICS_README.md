# Dashboard Metrics Implementation

## Overview
This document outlines the implementation of real-time dashboard metrics for both Staff and Admin dashboards in the Malasackit Portal system.

## Features Implemented

### Staff Dashboard KPI Cards
- **Total Worth of Response**: Sum of all approved donation amounts from the database
- **Donors Engaged**: Count of unique donors who have made approved donations
- **Beneficiaries Served**: Count of executed distribution plans

### Admin Dashboard User Statistics
- **Active Staff**: Staff members who logged in within the last 30 days
- **Active Donors**: Donors who made donations within the last 30 days
- **Total Staff**: All staff members (including admins)
- **Total Donors**: All registered donors
- **Registered Donors**: Approved donors
- **Pending Approval**: Donors awaiting admin approval

## Backend Implementation

### New Files Created
1. **dashboardControllers.js** - Controllers for dashboard API endpoints
2. **dashboardRoutes.js** - Routes for dashboard endpoints
3. **dashboardService.js** - Frontend service for API calls

### API Endpoints
- `GET /api/dashboard/staff/kpi` - Staff KPI metrics
- `GET /api/dashboard/admin/users` - Admin user statistics
- `GET /api/dashboard/donations/analytics` - Donation analytics (for future use)
- `GET /api/dashboard/distributions/analytics` - Distribution analytics (for future use)

### Database Queries
The implementation uses optimized SQL queries:

#### Staff KPI Metrics
```sql
-- Total Worth of Response
SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total_worth
FROM donations 
WHERE donation_status = 'approved'

-- Donors Engaged
SELECT COUNT(DISTINCT user_id) as donors_engaged
FROM donations 
WHERE donation_status = 'approved'

-- Beneficiaries Served
SELECT COUNT(*) as beneficiaries_served
FROM distribution_plans 
WHERE plan_status = 'executed'
```

#### Admin User Statistics
```sql
-- Active Staff (last 30 days)
SELECT COUNT(*) as active_staff
FROM users 
WHERE user_type IN ('staff', 'admin') 
AND last_login >= NOW() - INTERVAL '30 days'

-- Active Donors (last 30 days)
SELECT COUNT(DISTINCT u.user_id) as active_donors
FROM users u
INNER JOIN donations d ON u.user_id = d.user_id
WHERE u.user_type = 'donor' 
AND d.created_at >= NOW() - INTERVAL '30 days'
```

## Frontend Implementation

### Updated Components
1. **StaffKPICards.jsx** - Now fetches real data from API
2. **UserKPICards.jsx** - Now displays real user statistics

### Features Added
- **Loading States**: Skeleton loading animations while fetching data
- **Error Handling**: Graceful error handling with fallback values
- **Number Formatting**: Proper currency and number formatting
- **Real-time Updates**: Data refreshes on component mount
- **Progress Bars**: Visual representation of active vs total users

### Service Layer
- **dashboardService.js**: Centralized API calls with proper error handling
- **formatCurrency()**: PHP currency formatting
- **formatNumber()**: Number formatting with commas

## Error Handling

### Backend
- Comprehensive try-catch blocks
- Proper HTTP status codes
- Detailed error messages
- Fallback to zero values on database errors

### Frontend
- Loading states with skeleton UI
- Error notifications with fallback data
- Network error handling
- Token-based authentication

## Security
- JWT token authentication required for all endpoints
- CORS configuration for secure frontend-backend communication
- Input validation and sanitization

## Performance Optimizations
- Efficient SQL queries with proper indexing considerations
- Single API calls per dashboard component
- Memoized data formatting functions
- Optimized re-rendering with useEffect dependencies

## Testing
1. **API Testing**: Test all dashboard endpoints with Postman or curl
2. **Frontend Testing**: Verify loading states, error handling, and data display
3. **Database Testing**: Ensure queries return accurate results

## Future Enhancements
1. **Caching**: Implement Redis caching for frequently accessed metrics
2. **Real-time Updates**: WebSocket integration for live updates
3. **Date Range Filters**: Allow users to select custom date ranges
4. **Export Functionality**: Export dashboard data to PDF/Excel
5. **Mobile Responsive**: Enhanced mobile dashboard experience

## Usage

### For Development
1. Ensure backend server is running with dashboard routes
2. Frontend will automatically fetch real data on dashboard load
3. Check browser console for any API errors

### For Production
1. Verify database connections and user permissions
2. Test all API endpoints with production data
3. Monitor performance with real user loads

## Dependencies
- **Backend**: Express.js, PostgreSQL, JWT
- **Frontend**: React, Tailwind CSS, React Icons
- **Database**: PostgreSQL with proper table relationships

## Troubleshooting

### Common Issues
1. **"Cannot fetch data" error**: Check backend server and database connection
2. **Token expired**: Ensure proper authentication flow
3. **Zero values displayed**: Check database table names and column names
4. **Loading indefinitely**: Verify API endpoint URLs and CORS settings

### Debug Steps
1. Check browser network tab for API call failures
2. Verify backend logs for database connection issues
3. Test API endpoints directly with curl or Postman
4. Check database query results in PostgreSQL console

## Configuration
Ensure the following environment variables are set:
- Database connection parameters
- JWT secret key
- CORS allowed origins
- API base URL in frontend service