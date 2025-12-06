# Calendar Component Setup

## Installation Required

To use the new Calendar component, you need to install the `react-calendar` package:

```bash
cd malasackit-frontend
npm install react-calendar
```

## Features Implemented

### 📅 React Calendar Integration
- **Full calendar view** with month/year navigation
- **Event indicators** - dates with events show red dots
- **Interactive date selection** - click dates to view events
- **Responsive design** - works on desktop and mobile

### 🎯 Event Management
- **Event types**: Pickup, Event, Registration, Training
- **Color-coded events** with different themes
- **Event details** including time, location, participants
- **Monthly overview** showing all events for the current month

### 🎨 Dashboard Integration
- **Admin Dashboard**: System-wide calendar for administrative events
- **Staff Dashboard**: Work schedule and task calendar
- **Donor Dashboard**: Donation events and pickup schedules

### 📱 Responsive Layout
- **2-column layout** on large screens (calendar + sidebar)
- **Single column** on mobile devices
- **Event sidebar** shows selected date events and monthly overview

### 🎨 Consistent Styling
- **Red theme** matching the application design
- **Custom CSS** for calendar styling
- **Hover effects** and interactive elements
- **Accessibility** support with proper contrast

## Event Types

1. **🚚 Pickup Events** (Green) - Donation collection and pickup
2. **👥 Community Events** (Blue) - Public events and drives  
3. **📋 Registration** (Purple) - Beneficiary registration sessions
4. **🎓 Training** (Yellow) - Volunteer training and orientation

## Usage in Dashboards

The calendar is now available in all three dashboard types:

- **Admin**: Navigate to "Calendar" in the sidebar
- **Staff**: Navigate to "Calendar" in the sidebar  
- **Donor**: Navigate to "Calendar" in the sidebar

Each dashboard shows the same calendar but can be customized per role if needed.

## Next Steps

After installing `react-calendar`, the calendar will be fully functional with:
- ✅ Interactive date selection
- ✅ Event visualization
- ✅ Responsive design
- ✅ Event management features