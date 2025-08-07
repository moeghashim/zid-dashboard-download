# Zid Global Dashboard

A comprehensive 12-month revenue projection dashboard with interactive charts, brand management, and commission tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm run build
```

The built files will be in the `dist/` directory.

## 🔐 Authentication

### Default Credentials

**Admin Access (Full Control):**
- Username: `admin`
- Password: `admin123`

**Guest Access (Read Only):**
- Username: `guest`
- Password: `guest123`
- Or use the "Guest Access" quick login button

## 📊 Features

### Dashboard Sections
- **Overview**: Key metrics and revenue trends
- **Monthly Trends**: Month-by-month breakdown
- **Quarterly Analysis**: Quarterly performance data
- **Scenarios**: Projection scenarios
- **Zid Commission**: Commission tracking and management

### Navigation Pages
- **Dashboard**: Main analytics view
- **Projection Plan**: Detailed projection document
- **Brand Performance**: Brand management system

### Brand Management (Admin Only)
- Add new brands with custom categories and growth rates
- Edit existing brand parameters
- Delete brands from portfolio
- Real-time revenue calculations

### Commission Management (Admin Only)
- Adjustable commission rate (0-20%)
- Real-time commission calculations
- Commission vs revenue comparisons

## 🏗️ Technical Stack

- **Frontend**: React 18 + Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context + localStorage
- **Authentication**: Local storage based

## 📁 Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components
├── contexts/
│   ├── AuthContext.jsx  # Authentication management
│   └── BrandContext.jsx # Brand state management
├── pages/
│   ├── Dashboard.jsx    # Main dashboard
│   ├── ProjectionPlan.jsx # Projection document
│   └── BrandPerformance.jsx # Brand management
├── utils/
│   └── revenueCalculations.js # Revenue calculation utilities
├── App.jsx             # Main app component
├── App.css             # Global styles
└── main.jsx            # Entry point
```

## 🔧 Configuration

### Modifying Default Data

**Brand Data**: Edit the default brands in `src/contexts/BrandContext.jsx`

**Commission Rate**: Change default rate in `src/pages/Dashboard.jsx`

**Revenue Projections**: Modify calculations in `src/utils/revenueCalculations.js`

### Customizing UI

**Colors**: Update theme in `src/App.css` and Tailwind config

**Components**: Modify shadcn/ui components in `src/components/ui/`

**Layout**: Adjust layouts in respective page components

## 🚀 Deployment

### Static Hosting (Netlify, Vercel, etc.)
1. Build the project: `npm run build`
2. Deploy the `dist/` folder

### Custom Server
1. Build the project: `npm run build`
2. Serve the `dist/` folder with any web server

### Environment Variables
No environment variables required for basic functionality.

## 📈 Data Management

### Brand Data Storage
- Stored in browser localStorage
- Automatically syncs across tabs
- Persists between sessions

### Revenue Calculations
- Real-time calculations based on compound growth
- Monthly projections from starting sales and growth rates
- Automatic aggregation across all brands

### Commission Tracking
- Dynamic commission calculations
- Adjustable rates with instant updates
- Historical commission projections

## 🎨 Customization

### Adding New Brands
1. Login as admin
2. Navigate to Brand Performance
3. Use "Add Brand" button
4. Fill in brand details and growth parameters

### Modifying Commission Rates
1. Login as admin
2. Go to Zid Commission tab
3. Adjust the commission rate slider
4. View updated calculations instantly

### Changing Visual Themes
1. Edit `src/App.css` for global styles
2. Modify Tailwind classes in components
3. Update color schemes in chart configurations

## 🔍 Troubleshooting

### Common Issues

**Charts not displaying:**
- Ensure Recharts is properly installed
- Check browser console for errors

**Authentication not working:**
- Clear browser localStorage
- Check credentials in AuthContext

**Data not persisting:**
- Verify localStorage is enabled in browser
- Check browser storage limits

### Development Tips

**Hot Reload:**
- Development server automatically reloads on file changes
- Keep dev server running while making changes

**Building:**
- Run `npm run build` to test production build locally
- Check `dist/` folder for generated files

## 📞 Support

For technical issues or customization help:
1. Check browser console for error messages
2. Verify all dependencies are installed correctly
3. Ensure Node.js version compatibility

## 📄 License

This project is provided as-is for your use and modification.

---

**Version**: 3.0 (Stable)
**Last Updated**: August 2025
**Compatible with**: Node.js 18+, Modern browsers

