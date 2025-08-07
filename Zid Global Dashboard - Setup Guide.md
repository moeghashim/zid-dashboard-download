# Zid Global Dashboard - Setup Guide

## 📋 System Requirements

- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (comes with Node.js) or pnpm
- **Operating System**: Windows, macOS, or Linux
- **Browser**: Chrome, Firefox, Safari, or Edge (modern versions)

## 🛠️ Installation Steps

### Step 1: Install Node.js

**Windows/macOS:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Verify installation: `node --version`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Extract and Navigate

1. Extract the downloaded dashboard files
2. Open terminal/command prompt
3. Navigate to the project folder:
   ```bash
   cd path/to/zid-dashboard
   ```

### Step 3: Install Dependencies

**Using npm:**
```bash
npm install
```

**Using pnpm (faster, optional):**
```bash
npm install -g pnpm
pnpm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

The dashboard will be available at: `http://localhost:5173`

## 🔧 Development Workflow

### Making Changes

1. **Edit files** in the `src/` directory
2. **Save changes** - the browser will automatically reload
3. **Test functionality** in the browser
4. **Build for production** when ready: `npm run build`

### Key Files to Modify

**Brand Data:**
- `src/contexts/BrandContext.jsx` - Default brand information

**Styling:**
- `src/App.css` - Global styles and theme colors
- Individual component files for specific styling

**Calculations:**
- `src/utils/revenueCalculations.js` - Revenue projection logic

**Authentication:**
- `src/contexts/AuthContext.jsx` - Login credentials and user management

## 🚀 Production Deployment

### Option 1: Static File Hosting

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder** to your web hosting service:
   - Netlify: Drag and drop the `dist/` folder
   - Vercel: Connect your Git repository
   - GitHub Pages: Upload to `gh-pages` branch
   - Any web server: Copy `dist/` contents to web root

### Option 2: Custom Server

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Serve with any web server:**
   ```bash
   # Using Python (if installed)
   cd dist
   python -m http.server 8000
   
   # Using Node.js serve package
   npm install -g serve
   serve -s dist
   ```

## 🔐 Security Configuration

### Changing Default Credentials

**Edit `src/contexts/AuthContext.jsx`:**

```javascript
const login = (username, password) => {
  let userData = null
  if (username === 'your-admin-username' && password === 'your-secure-password') {
    userData = { username: 'your-admin-username', role: 'admin', name: 'Administrator' }
  } else if (username === 'guest' && password === 'guest123') {
    userData = { username: 'guest', role: 'guest', name: 'Guest User' }
  }
  // ... rest of the function
}
```

### Production Security Notes

- Change default admin credentials before deployment
- Consider implementing server-side authentication for production use
- Use HTTPS for production deployments
- Regularly update dependencies for security patches

## 📊 Data Customization

### Adding Default Brands

**Edit `src/contexts/BrandContext.jsx`:**

```javascript
const defaultBrands = [
  {
    id: 1,
    name: 'Your Brand Name',
    category: 'Your Category',
    startingSales: 50000,
    monthlyGrowthRate: 10.5,
    startingMonth: 'Oct 2025'
  },
  // Add more brands...
]
```

### Modifying Commission Rate

**Edit `src/pages/Dashboard.jsx`:**

```javascript
const [commissionRate, setCommissionRate] = useState(5) // Change default rate here
```

## 🎨 Visual Customization

### Changing Colors

**Edit `src/App.css`:**

```css
:root {
  --primary: 220 14.3% 95.9%;        /* Background color */
  --primary-foreground: 220.9 39.3% 11%;  /* Text color */
  --accent: 220 14.3% 95.9%;         /* Accent color */
  /* Modify other CSS variables as needed */
}
```

### Updating Charts

**Chart colors in component files:**

```javascript
// In chart components, modify the color arrays:
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
```

## 🔍 Troubleshooting

### Common Issues

**"npm: command not found"**
- Install Node.js from nodejs.org
- Restart terminal after installation

**"Permission denied" errors (macOS/Linux)**
```bash
sudo npm install -g npm@latest
```

**Port 5173 already in use**
```bash
npm run dev -- --port 3000
```

**Charts not displaying**
- Clear browser cache
- Check browser console for errors
- Ensure all dependencies installed correctly

**Build fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Getting Help

1. **Check browser console** for error messages
2. **Verify Node.js version**: `node --version` (should be 18+)
3. **Check package installation**: `npm list` to see installed packages
4. **Try clean install**: Delete `node_modules` and run `npm install` again

## 📱 Mobile Optimization

The dashboard is responsive and works on mobile devices. For best mobile experience:

1. **Test on actual devices** during development
2. **Use browser dev tools** to simulate mobile screens
3. **Check touch interactions** on charts and buttons

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### Backup Recommendations

1. **Version control**: Use Git to track changes
2. **Regular backups**: Save your customized version
3. **Document changes**: Keep notes of modifications made

---

**Need Help?** Check the browser console for error messages and ensure all prerequisites are met.

