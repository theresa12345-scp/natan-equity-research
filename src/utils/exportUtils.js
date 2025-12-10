/**
 * Export Utilities for Natan Equity Research
 * Provides CSV and Excel export functionality
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Column definitions [{key, label}]
 * @returns {string} CSV formatted string
 */
export function arrayToCSV(data, columns) {
  if (!data || data.length === 0) return '';

  // Header row
  const headers = columns.map(col => `"${col.label}"`).join(',');

  // Data rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];

      // Handle nested properties (e.g., 'natanScore.total')
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], row);
      }

      // Format value
      if (value === null || value === undefined) {
        return '""';
      }
      if (typeof value === 'number') {
        return col.format === 'percent' ? `${(value * 100).toFixed(2)}%` :
               col.format === 'currency' ? value.toFixed(2) :
               col.decimals !== undefined ? value.toFixed(col.decimals) :
               value;
      }
      // Escape quotes in strings
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Name of the file (without extension)
 */
export function downloadCSV(data, columns, filename = 'export') {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download data as Excel-compatible file (using CSV with .xlsx hint)
 * For true Excel format, we use a simple XML-based approach
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Name of the file
 * @param {string} sheetName - Name of the Excel sheet
 */
export function downloadExcel(data, columns, filename = 'export', sheetName = 'Data') {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create Excel XML (SpreadsheetML format - works in all Excel versions)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1e40af" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="Number">
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
    <Style ss:ID="Percent">
      <NumberFormat ss:Format="0.00%"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="$#,##0.00"/>
    </Style>
    <Style ss:ID="Positive">
      <Font ss:Color="#059669"/>
      <NumberFormat ss:Format="+0.00%;-0.00%"/>
    </Style>
    <Style ss:ID="Negative">
      <Font ss:Color="#dc2626"/>
      <NumberFormat ss:Format="+0.00%;-0.00%"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${sheetName}">
    <Table>`;

  // Column widths
  columns.forEach(col => {
    xml += `<Column ss:Width="${col.width || 100}"/>`;
  });

  // Header row
  xml += '<Row ss:StyleID="Header">';
  columns.forEach(col => {
    xml += `<Cell><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>`;
  });
  xml += '</Row>';

  // Data rows
  data.forEach(row => {
    xml += '<Row>';
    columns.forEach(col => {
      let value = row[col.key];

      // Handle nested properties
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], row);
      }

      if (value === null || value === undefined) {
        xml += '<Cell><Data ss:Type="String"></Data></Cell>';
      } else if (typeof value === 'number') {
        const style = col.format === 'percent' ? 'Percent' :
                     col.format === 'currency' ? 'Currency' :
                     value > 0 && col.colorCode ? 'Positive' :
                     value < 0 && col.colorCode ? 'Negative' :
                     'Number';
        xml += `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${value}</Data></Cell>`;
      } else {
        xml += `<Cell><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>`;
      }
    });
    xml += '</Row>';
  });

  xml += '</Table></Worksheet></Workbook>';

  // Download
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Predefined column configurations for different views
 */
export const EXPORT_COLUMNS = {
  screener: [
    { key: 'ticker', label: 'Ticker', width: 80 },
    { key: 'Company Name', label: 'Company Name', width: 200 },
    { key: 'sector', label: 'Sector', width: 120 },
    { key: 'industry', label: 'Industry', width: 150 },
    { key: 'natanScore.total', label: 'MF Score', width: 80, decimals: 1 },
    { key: 'natanScore.technical', label: 'Technical', width: 80, decimals: 1 },
    { key: 'natanScore.valuation', label: 'Valuation', width: 80, decimals: 1 },
    { key: 'natanScore.quality', label: 'Quality', width: 80, decimals: 1 },
    { key: 'natanScore.sentiment', label: 'Sentiment', width: 80, decimals: 1 },
    { key: 'natanScore.growth', label: 'Growth', width: 80, decimals: 1 },
    { key: 'Price', label: 'Price', width: 100, format: 'currency' },
    { key: 'Market Cap', label: 'Market Cap', width: 120 },
    { key: 'P/E', label: 'P/E', width: 80, decimals: 2 },
    { key: 'P/B', label: 'P/B', width: 80, decimals: 2 },
    { key: 'ROE', label: 'ROE', width: 80, decimals: 2, colorCode: true },
    { key: 'ROA', label: 'ROA', width: 80, decimals: 2 },
    { key: 'Company YTD Return', label: 'YTD Return %', width: 100, decimals: 2, colorCode: true },
    { key: 'Dividend Yield', label: 'Div Yield %', width: 80, decimals: 2 },
    { key: 'Beta', label: 'Beta', width: 80, decimals: 2 },
    { key: 'Region', label: 'Region', width: 100 },
  ],

  watchlist: [
    { key: 'ticker', label: 'Ticker', width: 80 },
    { key: 'Company Name', label: 'Company Name', width: 200 },
    { key: 'sector', label: 'Sector', width: 120 },
    { key: 'natanScore.total', label: 'MF Score', width: 80, decimals: 1 },
    { key: 'Price', label: 'Price', width: 100 },
    { key: 'Company YTD Return', label: 'YTD Return %', width: 100, decimals: 2, colorCode: true },
    { key: 'P/E', label: 'P/E', width: 80, decimals: 2 },
    { key: 'ROE', label: 'ROE', width: 80, decimals: 2 },
  ],

  comparison: [
    { key: 'ticker', label: 'Ticker', width: 80 },
    { key: 'Company Name', label: 'Company Name', width: 200 },
    { key: 'sector', label: 'Sector', width: 120 },
    { key: 'natanScore.total', label: 'MF Score', width: 80, decimals: 1 },
    { key: 'Price', label: 'Price', width: 100 },
    { key: 'Market Cap', label: 'Market Cap', width: 120 },
    { key: 'P/E', label: 'P/E', width: 80, decimals: 2 },
    { key: 'P/B', label: 'P/B', width: 80, decimals: 2 },
    { key: 'EV/EBITDA', label: 'EV/EBITDA', width: 80, decimals: 2 },
    { key: 'ROE', label: 'ROE', width: 80, decimals: 2 },
    { key: 'ROA', label: 'ROA', width: 80, decimals: 2 },
    { key: 'Revenue Growth', label: 'Rev Growth %', width: 100, decimals: 2 },
    { key: 'EPS Growth', label: 'EPS Growth %', width: 100, decimals: 2 },
    { key: 'Debt/Equity', label: 'D/E Ratio', width: 80, decimals: 2 },
    { key: 'Company YTD Return', label: 'YTD Return %', width: 100, decimals: 2, colorCode: true },
  ],

  dcf: [
    { key: 'year', label: 'Year', width: 60 },
    { key: 'revenue', label: 'Revenue', width: 120, format: 'currency' },
    { key: 'ebitda', label: 'EBITDA', width: 120, format: 'currency' },
    { key: 'fcf', label: 'Free Cash Flow', width: 120, format: 'currency' },
    { key: 'discountFactor', label: 'Discount Factor', width: 100, decimals: 4 },
    { key: 'pvFcf', label: 'PV of FCF', width: 120, format: 'currency' },
  ],

  heatmap: [
    { key: 'sector', label: 'Sector', width: 150 },
    { key: 'avgYTD', label: 'Avg YTD Return %', width: 120, decimals: 2, colorCode: true },
    { key: 'avgScore', label: 'Avg MF Score', width: 100, decimals: 1 },
    { key: 'count', label: 'Stock Count', width: 80 },
    { key: 'topTicker', label: 'Top Stock', width: 80 },
  ],
};

/**
 * Export with format selection dialog
 */
export function exportWithDialog(data, columns, filename, sheetName) {
  // For now, default to Excel. Could add a modal later.
  downloadExcel(data, columns, filename, sheetName);
}
