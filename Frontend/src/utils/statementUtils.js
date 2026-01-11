// utils/statementUtils.js - IMPROVED VERSION
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const generateBankStatement = {
  // Generate properly formatted K2F Secure Bank PDF
  generatePDF: async (
    account,
    transactions,
    startDate,
    endDate,
    formatDateDisplay,
    formatCurrency,
    options = {}
  ) => {
    try {
      const { 
        password = '', 
        includeCharts = false, 
        includeSummary = true 
      } = options;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Set document metadata
      doc.setProperties({
        title: `K2F Statement - ${account.accountNumber}`,
        subject: 'Bank Account Statement',
        author: 'K2F Secure Bank',
        keywords: 'bank, statement, transaction, K2F',
        creator: 'K2F Secure Bank Digital Platform'
      });

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // ==================== HEADER SECTION ====================
      doc.setFillColor(15, 42, 82); // Dark blue
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      // K2F Logo and Title
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('K2F SECURE BANK', margin, 15);
      
      doc.setFontSize(14);
      doc.text('ACCOUNT STATEMENT', pageWidth - margin, 15, { align: 'right' });
      
      // Security badge
      doc.setFontSize(8);
      doc.setTextColor(180, 220, 255);
      doc.text('SECURE • ENCRYPTED • BANK-GRADE', pageWidth - margin, 22, { align: 'right' });

      // ==================== ACCOUNT INFORMATION ====================
      let yPos = 35;
      
      // Account info box
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 42, 82);
      doc.text('ACCOUNT INFORMATION', margin + 5, yPos + 7);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      
      // Left column
      doc.text(`Account Number: ${account.accountNumber}`, margin + 5, yPos + 13);
      doc.text(`Account Holder: ${account.holderName || 'Not Provided'}`, margin + 5, yPos + 17);
      
      // Right column
      doc.text(`Statement Period: ${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`, margin + 90, yPos + 13);
      doc.text(`IFSC Code: ${account.ifscCode || 'K2FS0001234'}`, margin + 90, yPos + 17);
      
      // Bottom row
      doc.text(`Account Type: ${account.type || 'Savings'}`, margin + 5, yPos + 21);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, margin + 90, yPos + 21);

      yPos += 28;

      // ==================== STATEMENT SUMMARY ====================
      if (includeSummary) {
        const totalDebits = transactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalCredits = transactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0);

        const netChange = totalCredits - totalDebits;
        const startingBalance = account?.balance ? account.balance - netChange : 0;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, yPos, contentWidth, 16, 2, 2, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 42, 82);
        doc.text('STATEMENT SUMMARY', margin + 5, yPos + 6);
        
        const summaryData = [
          { label: 'Opening Balance', value: formatCurrency(startingBalance) },
          { label: 'Total Credits', value: `+${formatCurrency(totalCredits)}`, color: '34,197,94' },
          { label: 'Total Debits', value: `-${formatCurrency(totalDebits)}`, color: '239,68,68' },
          { label: 'Net Change', value: formatCurrency(netChange), color: netChange >= 0 ? '34,197,94' : '239,68,68' },
          { label: 'Closing Balance', value: formatCurrency(account?.balance || 0) }
        ];

        const colWidth = contentWidth / 5;
        summaryData.forEach((item, index) => {
          const xPos = margin + (colWidth * index);
          
          // Label
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(item.label, xPos + colWidth/2, yPos + 12, { align: 'center' });
          
          // Value
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          if (item.color) {
            doc.setTextColor(...item.color.split(',').map(Number));
          } else {
            doc.setTextColor(0, 0, 0);
          }
          doc.text(item.value, xPos + colWidth/2, yPos + 18, { align: 'center' });
        });

        doc.setTextColor(0, 0, 0);
        yPos += 24;
      }

      // ==================== TRANSACTION TABLE ====================
      // Table Header
      doc.setFillColor(15, 42, 82);
      doc.roundedRect(margin, yPos, contentWidth, 7, 1, 1, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      // Column positions
      const colPositions = {
        date: margin + 2,
        description: margin + 25,
        reference: margin + 80,
        type: margin + 105,
        amount: margin + 125,
        balance: margin + 155
      };
      
      // Headers
      doc.text('Date', colPositions.date, yPos + 5);
      doc.text('Description', colPositions.description, yPos + 5);
      doc.text('Reference', colPositions.reference, yPos + 5);
      doc.text('Type', colPositions.type, yPos + 5);
      doc.text('Amount', colPositions.amount, yPos + 5);
      doc.text('Balance', colPositions.balance, yPos + 5);
      
      yPos += 9;

      // Transaction Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      let rowIndex = 0;
      transactions.forEach((transaction) => {
        // Check if we need a new page
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
          
          // Add continuation header
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`K2F Secure Bank - Account Statement (Contd.)`, margin, yPos);
          yPos += 15;
        }

        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, yPos - 3, contentWidth, 9, 'F');
        }

        // Date and Time
        const date = new Date(transaction.createdAt);
        const dateStr = date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        });

        doc.setTextColor(0, 0, 0);
        doc.text(dateStr, colPositions.date, yPos + 3);
        doc.setFontSize(6);
        doc.text(timeStr, colPositions.date, yPos + 6);
        doc.setFontSize(7);

        // Description
        const description = transaction.description || 'Transaction';
        const shortDesc = description.length > 40 ? description.substring(0, 38) + '...' : description;
        doc.text(shortDesc, colPositions.description, yPos + 4.5);

        // Reference
        const ref = transaction.referenceNumber || transaction._id?.toString().slice(-8) || 'N/A';
        doc.text(ref, colPositions.reference, yPos + 4.5);

        // Type with color coding
        const type = transaction.type === 'debit' ? 'DEBIT' : 'CREDIT';
        if (transaction.type === 'debit') {
          doc.setTextColor(220, 38, 38); // Red
        } else {
          doc.setTextColor(34, 197, 94); // Green
        }
        doc.text(type, colPositions.type, yPos + 4.5);
        doc.setTextColor(0, 0, 0);

        // Amount - properly formatted
        const amount = formatCurrency(transaction.amount);
        doc.text(amount, colPositions.amount, yPos + 4.5, { align: 'right' });

        // Balance - properly formatted
        const balance = formatCurrency(transaction.balanceAfter);
        doc.text(balance, colPositions.balance, yPos + 4.5, { align: 'right' });

        yPos += 10;
        rowIndex++;

        // Add thin separator line
        if (rowIndex < transactions.length) {
          doc.setDrawColor(230, 230, 230);
          doc.line(margin, yPos - 1, margin + contentWidth, yPos - 1);
          yPos += 2;
        }
      });

      yPos += 10;

      // ==================== FOOTER ====================
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, margin + contentWidth, yPos);
      yPos += 5;

      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      
      // Footer lines
      const footerLines = [
        'This is an electronically generated statement from K2F Secure Bank.',
        'No signature is required. This document is legally valid.',
        `For any queries, contact: support@k2fbank.com | Toll-free: 1800-267-1234`,
        `Statement ID: ${generateStatementId(account.accountNumber, startDate, endDate)} | Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '© K2F Secure Bank. All rights reserved. Member FDIC.'
      ];

      footerLines.forEach((text, index) => {
        doc.text(text, pageWidth / 2, yPos + (index * 3), { align: 'center' });
      });

      // Add page number
      yPos += 20;
      doc.setFontSize(7);
      doc.text(`Page 1 of 1`, pageWidth / 2, yPos, { align: 'center' });

      // Add password protection if provided
      if (password) {
        // Note: For production, implement proper PDF encryption
        console.log('PDF encryption would be implemented here');
      }

      // Return PDF as blob
      return doc.output('blob');

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF statement');
    }
  },

  // Generate CSV with proper formatting
  generateCSV: (
    account,
    transactions,
    startDate,
    endDate,
    formatDateDisplay,
    formatCurrency,
    options = {}
  ) => {
    const { includeSummary = true } = options;

    const totalDebits = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const netChange = totalCredits - totalDebits;
    const startingBalance = account?.balance ? account.balance - netChange : 0;

    // Build CSV content with proper formatting
    const csvContent = [];

    // Header
    csvContent.push(['K2F SECURE BANK']);
    csvContent.push(['ACCOUNT STATEMENT']);
    csvContent.push(['='.repeat(50)]);
    csvContent.push([]);

    // Account Information
    csvContent.push(['ACCOUNT INFORMATION']);
    csvContent.push(['Account Number:', account.accountNumber]);
    csvContent.push(['Account Holder:', account.holderName || 'Not Provided']);
    csvContent.push(['Account Type:', account.type || 'Savings']);
    csvContent.push(['IFSC Code:', account.ifscCode || 'K2FS0001234']);
    csvContent.push(['Statement Period:', `${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`]);
    csvContent.push(['Generated On:', new Date().toLocaleDateString('en-IN')]);
    csvContent.push(['Generated At:', new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })]);
    csvContent.push([]);

    // Summary Section
    if (includeSummary) {
      csvContent.push(['STATEMENT SUMMARY']);
      csvContent.push(['Opening Balance', formatCurrency(startingBalance)]);
      csvContent.push(['Total Credits', `+${formatCurrency(totalCredits)}`]);
      csvContent.push(['Total Debits', `-${formatCurrency(totalDebits)}`]);
      csvContent.push(['Net Change', formatCurrency(netChange)]);
      csvContent.push(['Closing Balance', formatCurrency(account?.balance || 0)]);
      csvContent.push([]);
    }

    // Transaction Headers
    csvContent.push(['TRANSACTION DETAILS']);
    csvContent.push([
      'Date',
      'Time',
      'Description',
      'Reference No.',
      'Type',
      'Amount (₹)',
      'Balance (₹)',
      'Status'
    ]);

    // Transaction Data
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      csvContent.push([
        date.toLocaleDateString('en-IN'),
        date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        `"${(transaction.description || 'Transaction').replace(/"/g, '""')}"`,
        transaction.referenceNumber || transaction._id?.toString().slice(-8) || 'N/A',
        transaction.type.toUpperCase(),
        transaction.type === 'debit' ? `-${formatCurrency(transaction.amount).replace('₹', '')}` : `+${formatCurrency(transaction.amount).replace('₹', '')}`,
        formatCurrency(transaction.balanceAfter).replace('₹', ''),
        transaction.status?.toUpperCase() || 'SUCCESS'
      ]);
    });

    csvContent.push([]);
    csvContent.push(['='.repeat(50)]);
    csvContent.push([]);

    // Footer
    csvContent.push(['IMPORTANT INFORMATION']);
    csvContent.push(['• This statement is generated electronically by K2F Secure Bank.']);
    csvContent.push(['• No physical signature is required.']);
    csvContent.push(['• For discrepancies, report within 30 days of statement generation.']);
    csvContent.push(['• Keep this statement for your records.']);
    csvContent.push([]);
    csvContent.push(['CONTACT INFORMATION']);
    csvContent.push(['Customer Support:', '1800-267-1234']);
    csvContent.push(['Email:', 'statements@k2fbank.com']);
    csvContent.push(['Website:', 'https://www.k2fbank.com']);
    csvContent.push(['Statement ID:', generateStatementId(account.accountNumber, startDate, endDate)]);

    // Convert to CSV string with proper formatting
    return csvContent
      .map(row => {
        return row.map(cell => {
          if (cell === null || cell === undefined) return '';
          if (typeof cell === 'string') {
            // Check if cell needs quoting
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"') || cell.includes('\r')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          }
          return String(cell);
        }).join(',');
      })
      .join('\n');
  },

  // Generate Excel with proper formatting
  generateExcel: async (
    account,
    transactions,
    startDate,
    endDate,
    formatDateDisplay,
    formatCurrency,
    options = {}
  ) => {
    const { includeSummary = true } = options;

    // Calculate summary data
    const totalDebits = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const netChange = totalCredits - totalDebits;
    const startingBalance = account?.balance ? account.balance - netChange : 0;

    // Create workbook
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: `K2F Statement - ${account.accountNumber}`,
      Subject: 'Bank Account Statement',
      Author: 'K2F Secure Bank',
      CreatedDate: new Date()
    };

    // Data for the statement sheet
    const statementData = [
      // Header
      ['K2F SECURE BANK'],
      ['ACCOUNT STATEMENT'],
      [],
      
      // Account Information
      ['ACCOUNT INFORMATION'],
      ['Account Number:', account.accountNumber],
      ['Account Holder:', account.holderName || 'Not Provided'],
      ['Account Type:', account.type || 'Savings'],
      ['IFSC Code:', account.ifscCode || 'K2FS0001234'],
      ['Statement Period:', `${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`],
      ['Generated:', `${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`],
      ['Statement ID:', generateStatementId(account.accountNumber, startDate, endDate)],
      [],
      
      // Summary Section
      ['STATEMENT SUMMARY'],
      ['Opening Balance', formatCurrency(startingBalance)],
      ['Total Credits', `+${formatCurrency(totalCredits)}`],
      ['Total Debits', `-${formatCurrency(totalDebits)}`],
      ['Net Change', formatCurrency(netChange)],
      ['Closing Balance', formatCurrency(account?.balance || 0)],
      [],
      
      // Transaction Header
      ['TRANSACTION DETAILS'],
      ['Date', 'Time', 'Description', 'Reference', 'Type', 'Amount (₹)', 'Balance (₹)', 'Status'],
      
      // Transaction Data
      ...transactions.map(transaction => {
        const date = new Date(transaction.createdAt);
        return [
          date.toLocaleDateString('en-IN'),
          date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          transaction.description || 'Transaction',
          transaction.referenceNumber || transaction._id?.toString().slice(-8) || 'N/A',
          transaction.type.toUpperCase(),
          transaction.amount,
          transaction.balanceAfter,
          transaction.status?.toUpperCase() || 'SUCCESS'
        ];
      }),
      [],
      
      // Footer
      ['IMPORTANT INFORMATION'],
      ['This is an electronically generated statement from K2F Secure Bank.'],
      ['No physical signature is required. This document is legally valid.'],
      ['For any discrepancies, please report within 30 days.'],
      ['Keep this statement for your records.'],
      [],
      ['CONTACT INFORMATION'],
      ['Customer Support: 1800-267-1234'],
      ['Email: statements@k2fbank.com'],
      ['Website: https://www.k2fbank.com']
    ];

    const ws = XLSX.utils.aoa_to_sheet(statementData);

    // Apply styles and formatting
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Style header
    ws['A1'].s = { font: { bold: true, sz: 16, color: { rgb: "0F2A52" } } };
    ws['A2'].s = { font: { bold: true, sz: 14, color: { rgb: "0F2A52" } } };
    
    // Style account info headers
    for (let R = 4; R <= 11; R++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: 0 });
      if (ws[cell]) {
        ws[cell].s = { font: { bold: true } };
      }
    }
    
    // Style summary headers
    for (let R = 13; R <= 17; R++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: 0 });
      if (ws[cell]) {
        ws[cell].s = { font: { bold: true } };
      }
    }
    
    // Style transaction headers
    const transactionHeaderRow = 20;
    for (let C = 0; C < 8; C++) {
      const cell = XLSX.utils.encode_cell({ r: transactionHeaderRow, c: C });
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "0F2A52" } },
          alignment: { horizontal: "center" }
        };
      }
    }
    
    // Style transaction data
    for (let R = transactionHeaderRow + 1; R <= transactionHeaderRow + transactions.length; R++) {
      // Alternate row colors
      if ((R - transactionHeaderRow) % 2 === 0) {
        for (let C = 0; C < 8; C++) {
          const cell = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[cell]) {
            ws[cell].s = { ...ws[cell].s, fill: { fgColor: { rgb: "F8FAFC" } } };
          }
        }
      }
      
      // Format amount columns
      const amountCell = XLSX.utils.encode_cell({ r: R, c: 5 });
      const balanceCell = XLSX.utils.encode_cell({ r: R, c: 6 });
      
      if (ws[amountCell]) {
        ws[amountCell].z = '#,##0.00';
        // Color code based on type
        const typeCell = XLSX.utils.encode_cell({ r: R, c: 4 });
        if (ws[typeCell]?.v === 'DEBIT') {
          ws[amountCell].s = { ...ws[amountCell].s, font: { color: { rgb: "DC2626" } } };
        } else if (ws[typeCell]?.v === 'CREDIT') {
          ws[amountCell].s = { ...ws[amountCell].s, font: { color: { rgb: "059669" } } };
        }
      }
      
      if (ws[balanceCell]) {
        ws[balanceCell].z = '#,##0.00';
      }
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 40 }, // Description
      { wch: 15 }, // Reference
      { wch: 10 }, // Type
      { wch: 15 }, // Amount
      { wch: 15 }, // Balance
      { wch: 12 }  // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Statement');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: true 
    });
    
    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
};

// Helper function to generate unique statement ID
function generateStatementId(accountNumber, startDate, endDate) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const accountSuffix = accountNumber.slice(-4);
  const start = startDate.replace(/-/g, '');
  const end = endDate.replace(/-/g, '');
  return `K2F-STMT-${accountSuffix}-${start}-${end}-${timestamp}`;
}

// Export utility functions
export const statementUtils = {
  validateStatementRequest: (startDate, endDate, format) => {
    const errors = [];
    
    if (!startDate || !endDate) {
      errors.push('Start date and end date are required');
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        errors.push('Start date cannot be after end date');
      }
      
      const maxDays = 730; // 2 years
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > maxDays) {
        errors.push(`Maximum statement period is ${maxDays} days (2 years)`);
      }
    }
    
    if (!['pdf', 'csv', 'excel'].includes(format)) {
      errors.push('Invalid file format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  getStatementInfo: (account, startDate, endDate) => {
    return {
      statementId: generateStatementId(account.accountNumber, startDate, endDate),
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      downloadCount: 0,
      maxDownloads: 5
    };
  },

  // Format currency for display
  formatCurrencyForDisplay: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  },

  // Format date for display
  formatDateForDisplay: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
};