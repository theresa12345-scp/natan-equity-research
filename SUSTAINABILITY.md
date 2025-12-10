# Natan Equity Research - Sustainability & Handover Guide

**Version:** 1.0
**Last Updated:** December 2025
**Author:** Nathaniel Luu, Investment Analyst Intern
**For:** AMFS Investment Team & IT Department

---

## Executive Summary

This document provides a comprehensive sustainability plan for the Natan Equity Research Platform, ensuring the investment team can independently maintain, customize, and operate the dashboard after the original developer's departure.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [User-Facing Customization (No-Code)](#2-user-facing-customization-no-code)
3. [IT Deployment Guide](#3-it-deployment-guide)
4. [Maintenance Procedures](#4-maintenance-procedures)
5. [Troubleshooting](#5-troubleshooting)
6. [Contact & Escalation](#6-contact--escalation)

---

## 1. Platform Overview

### What This Platform Does
- **Equity Screener**: 8-factor scoring model covering 500+ S&P 500 and Indonesian stocks
- **DCF Valuation**: Damodaran/CFA methodology with sensitivity analysis
- **Comparables Analysis**: Peer-based valuation with sector benchmarks
- **News Sentiment**: Real-time news aggregation from financial sources

### Technology Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 19 + Vite | User interface |
| Styling | Tailwind CSS 4 | Responsive design |
| Data | JSON files | Stock data storage |
| Hosting | Vercel/Internal | Web deployment |

### No Server Dependencies
The platform is a **client-side application** - all calculations run in the browser. No backend server or database maintenance required.

---

## 2. User-Facing Customization (No-Code)

### Settings Panel Access
Click the **Settings (gear icon)** button in the top-right corner of the dashboard.

### Factor Weight Customization

The platform uses an 8-factor scoring model. Each factor's weight can be adjusted:

| Factor | Default Weight | Description |
|--------|---------------|-------------|
| Technical | 20 pts | Price momentum, Alpha, Beta |
| Valuation | 15 pts | P/E, P/B, EV/EBITDA |
| Quality | 15 pts | ROE, FCF Conversion, Margins |
| Sentiment | 15 pts | Market sentiment proxy |
| Growth | 10 pts | Revenue, EPS, Net Income growth |
| Financial Health | 10 pts | D/E ratio, Current/Quick ratios |
| Liquidity | 10 pts | Market cap tier, trading activity |
| Analyst Coverage | 5 pts | Coverage breadth proxy |

**Total: 100 points**

### How to Adjust Weights

1. Open Settings Panel
2. Use sliders to adjust each factor (0-30 range)
3. Toggle factors on/off if needed
4. View real-time preview of weight distribution
5. Click "Apply" to update scores
6. Click "Save Preset" to store configuration

### Preset Management

**Built-in Presets:**
- **Default (Balanced)**: Standard 8-factor weights
- **Momentum Focus**: Higher Technical/Sentiment weights
- **Value Investor**: Higher Valuation/Quality weights
- **Growth Investor**: Higher Growth/Quality weights

**Custom Presets:**
1. Adjust weights as desired
2. Click "Save Preset"
3. Enter a name (e.g., "AMFS Quarterly Review")
4. Preset will be available in dropdown

### Export/Import Configuration

**Export:**
1. Click "Export Config" in Settings
2. JSON file downloads with current settings
3. Share with colleagues or backup

**Import:**
1. Click "Import Config" in Settings
2. Select JSON file
3. Settings applied immediately

---

## 3. IT Deployment Guide

### Corporate Environment (AMFS ThinkPad)

#### Option A: Static File Deployment (Recommended)

1. **Build the application:**
```bash
npm run build
```

2. **Output:** Creates `dist/` folder with static files

3. **Deploy to internal web server:**
   - Copy `dist/` contents to any web server
   - Works with IIS, Apache, Nginx, or file share
   - No Node.js required on production server

4. **Access:**
   - `http://[internal-server]/natan-equity-research/`

#### Option B: Vercel Deployment (External)

Already deployed at: `https://natan-equity-research.vercel.app`

**Note:** Requires internet access. May need IT firewall whitelist.

### Firewall/Proxy Considerations

**Required Domains for Full Functionality:**
- `vercel.app` - If using external deployment
- `jsdelivr.net` - CDN for libraries (optional)

**If Domains Are Blocked:**
All dependencies are bundled in the build. The platform works offline once loaded.

### Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 80+ | Fully Supported |
| Edge | 80+ | Fully Supported |
| Firefox | 78+ | Fully Supported |
| Safari | 12+ | Supported (with legacy polyfills) |
| IE 11 | - | Not Supported |

---

## 4. Maintenance Procedures

### Updating Stock Data

Stock data is stored in JSON files in `/public/data/`:

1. **S&P 500 Data:** `sp500_stocks.json`
2. **Indonesia Data:** `idx_stocks.json`
3. **News Data:** `news_*.json`

**To Update:**
1. Replace JSON files with new data (same format)
2. Rebuild: `npm run build`
3. Redeploy `dist/` folder

### Adding New Stocks

JSON format for each stock:
```json
{
  "Ticker": "AAPL",
  "Company": "Apple Inc.",
  "Sector": "Technology",
  "Price": 189.25,
  "Market Cap": 2950000000000,
  "PE": 31.2,
  "PB": 45.8,
  "ROE": 147.25,
  "DE": 195.4,
  ...
}
```

### Scheduled Tasks

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Stock data refresh | Daily/Weekly | Data team |
| Build/deploy | After data update | IT |
| Weight preset review | Quarterly | Investment team |
| Platform health check | Monthly | IT |

---

## 5. Troubleshooting

### Common Issues

#### Blank Screen
- **Cause:** JavaScript error or browser incompatibility
- **Fix:** Clear browser cache, try Chrome/Edge

#### Data Not Loading
- **Cause:** JSON file format issue
- **Fix:** Validate JSON at jsonlint.com

#### Slow Performance
- **Cause:** Too many stocks loading
- **Fix:** Use filters to reduce dataset

#### Settings Not Saving
- **Cause:** localStorage blocked
- **Fix:** Enable browser storage permissions

### Error Codes

| Error | Meaning | Resolution |
|-------|---------|------------|
| DATA_LOAD_FAIL | JSON files missing | Check `/public/data/` |
| CALC_ERROR | Valuation calculation issue | Check stock data fields |
| STORAGE_FULL | localStorage limit | Clear old presets |

---

## 6. Contact & Escalation

### Primary Support

**Developer (Until Internship End):**
- Nathaniel Luu
- [Internal contact info]

### After Handover

**Level 1 - User Issues:**
- Investment Team Lead
- Consult this documentation

**Level 2 - Technical Issues:**
- IT Department
- Reference Section 3 (Deployment) & 5 (Troubleshooting)

**Level 3 - Code Changes:**
- External contractor if needed
- GitHub repository: `github.com/[org]/natan-equity-research`

---

## Appendix A: Quick Reference Card

### Daily Use
1. Go to platform URL
2. Use Screener tab to filter stocks
3. Click stock for Full Analysis
4. Adjust Settings if needed

### Weekly/Monthly
1. Check for data updates
2. Review/adjust factor weights
3. Save new presets as needed

### Common Shortcuts
| Action | How |
|--------|-----|
| Search stock | Type in search bar |
| Filter by sector | Use sector dropdown |
| Change weights | Settings > Sliders |
| Export report | Download button |

---

## Appendix B: Changelog

| Date | Version | Changes |
|------|---------|---------|
| Dec 2025 | 1.0 | Initial sustainability plan |
| Nov 2025 | - | Added S&P 500 coverage |
| Nov 2025 | - | Sensitivity analysis feature |
| Nov 2025 | - | Safari compatibility fix |

---

*This document is designed to ensure platform sustainability beyond the original developer's tenure. Please keep this document updated with any changes to procedures or configurations.*
