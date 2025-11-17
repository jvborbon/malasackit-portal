import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate donation acknowledgment receipt PDF using jsPDF
 * @param {Object} receiptData - Receipt data from backend
 * @returns {Object} PDF document and metadata
 */
export const generateReceiptPDF = (receiptData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 12;
    let yPosition = margin;
    
    // Colors
    const primaryColor = [220, 38, 38]; // Red theme
    const grayColor = [107, 114, 128];
    const darkColor = [17, 24, 39];
    
    // Helper function to add text with auto-wrap
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.353); // Return new Y position
    };
    
    // Compact header with organization info
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 32, 'F');
    
    // Organization name - more compact
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const orgNameLines = pdf.splitTextToSize(receiptData.organization.name, pageWidth - (margin * 2));
    pdf.text(orgNameLines, margin, 14);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const addressY = 14 + (orgNameLines.length * 5);
    const addressLines = pdf.splitTextToSize(receiptData.organization.address, pageWidth - (margin * 2));
    pdf.text(addressLines, margin, addressY);
    pdf.text(`${receiptData.organization.phone} | ${receiptData.organization.email}`, margin, addressY + (addressLines.length * 3) + 1);
    
    yPosition = 40;
    
    // Document title - more compact
    pdf.setTextColor(...darkColor);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DONATION ACKNOWLEDGMENT RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    // Receipt information box - more compact
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 20, 'F');
    pdf.setDrawColor(...grayColor);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkColor);
    
    // Receipt details in two columns - more compact
    const leftCol = margin + 3;
    const rightCol = pageWidth / 2 + 5;
    const receiptY = yPosition + 6;
    
    pdf.text(`Receipt No: ${receiptData.receiptNumber}`, leftCol, receiptY);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, rightCol, receiptY);
    
    pdf.text(`Donation ID: ${receiptData.donationId}`, leftCol, receiptY + 6);
    pdf.text(`Tax-Exempt: ${receiptData.taxInformation?.taxExempt ? 'Yes' : 'No'}`, rightCol, receiptY + 6);
    
    yPosition += 28;
    
    // Two-column layout for donor and donation info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('DONOR INFORMATION', margin, yPosition);
    pdf.text('DONATION DETAILS', pageWidth / 2 + 5, yPosition);
    
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkColor);
    
    // Left column - Donor info
    const donorInfo = [
        ['Name:', receiptData.donor.name],
        ['Email:', receiptData.donor.email || 'Not provided'],
        ['Phone:', receiptData.donor.phone || 'Not provided'],
        ['Type:', receiptData.donor.accountType || 'Individual']
    ];
    
    // Right column - Donation info
    const donationInfo = [
        ['Request:', new Date(receiptData.donation.requestDate).toLocaleDateString()],
        ['Method:', receiptData.donation.deliveryMethod === 'pickup' ? 'Pickup' : 'Drop-off'],
        ['Status:', receiptData.donation.status],
        ['', ''] // placeholder for alignment
    ];
    
    if (receiptData.donation.appointmentDate) {
        donationInfo[3] = [
            'Appointment:', 
            `${new Date(receiptData.donation.appointmentDate).toLocaleDateString()} at ${receiptData.donation.appointmentTime || 'TBD'}`
        ];
    }
    
    // Display info in two columns
    let maxRows = Math.max(donorInfo.length, donationInfo.length);
    for (let i = 0; i < maxRows; i++) {
        const currentY = yPosition + (i * 5);
        
        // Left column - Donor info
        if (i < donorInfo.length && donorInfo[i][0]) {
            pdf.setFont('helvetica', 'bold');
            pdf.text(donorInfo[i][0], margin, currentY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(donorInfo[i][1], margin + 25, currentY);
        }
        
        // Right column - Donation info
        if (i < donationInfo.length && donationInfo[i][0]) {
            pdf.setFont('helvetica', 'bold');
            pdf.text(donationInfo[i][0], pageWidth / 2 + 5, currentY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(donationInfo[i][1], pageWidth / 2 + 30, currentY);
        }
    }
    
    yPosition += (maxRows * 5) + 5;
    
    if (receiptData.donation.notes) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text('NOTES:', margin, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...darkColor);
        yPosition = addWrappedText(receiptData.donation.notes, margin + 5, yPosition, pageWidth - margin - 10, 8);
        yPosition += 3;
    }
    
    yPosition += 10;
    
    // Donated Items Table - compact header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('DONATED ITEMS', margin, yPosition);
    
    yPosition += 3;
    
    // Prepare table data
    const tableHeaders = ['Item', 'Category', 'Condition', 'Quantity', 'Declared Value', 'Total Value'];
    const tableData = receiptData.items.map(item => [
        item.itemtype_name || 'N/A',
        item.category_name || 'N/A',
        item.condition || 'Good',
        item.quantity.toString(),
        `PHP ${parseFloat(item.declared_value || 0).toFixed(2)}`,
        `PHP ${(parseFloat(item.declared_value || 0) * item.quantity).toFixed(2)}`
    ]);
    
    // Add table
    autoTable(pdf, {
        startY: yPosition,
        head: [tableHeaders],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            cellPadding: 2
        },
        bodyStyles: {
            fontSize: 8,
            textColor: darkColor,
            cellPadding: 2
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Item
            1: { cellWidth: 'auto' }, // Category
            2: { cellWidth: 'auto' }, // Condition
            3: { cellWidth: 'auto', halign: 'center' }, // Quantity
            4: { cellWidth: 'auto', halign: 'right' }, // Declared Value
            5: { cellWidth: 'auto', halign: 'right' } // Total Value
        },
        margin: { left: margin, right: margin },
        tableWidth: 'wrap'
    });
    
    yPosition = pdf.lastAutoTable.finalY + 10;
    
    // Summary Section - more compact
    pdf.setFillColor(248, 250, 252);
    pdf.rect(pageWidth - 70, yPosition, 55, 24, 'F');
    pdf.setDrawColor(...grayColor);
    pdf.rect(pageWidth - 70, yPosition, 55, 24);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkColor);
    
    const summaryY = yPosition + 6;
    pdf.text('SUMMARY:', pageWidth - 67, summaryY);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Items: ${receiptData.summary.totalItems}`, pageWidth - 67, summaryY + 5);
    pdf.text(`Qty: ${receiptData.summary.totalQuantity}`, pageWidth - 67, summaryY + 9);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total: PHP ${parseFloat(receiptData.summary.totalValue).toFixed(2)}`, pageWidth - 67, summaryY + 15);
    
    yPosition += 30;
    
    // Tax Information
    if (receiptData.taxInformation?.taxExempt) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...grayColor);
        const taxText = 'This organization is tax-exempt under Section 501(c)(3). This receipt serves as acknowledgment of your donation and may be used for tax deduction purposes. Please consult your tax advisor for specific deduction eligibility.';
        yPosition = addWrappedText(taxText, margin, yPosition, pageWidth - (margin * 2), 9);
        yPosition += 5;
    }
    
    // Footer
    const footerY = pdf.internal.pageSize.height - 30;
    pdf.setDrawColor(...grayColor);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...grayColor);
    pdf.text(`Thank you for your donation to ${receiptData.organization.name}!`, pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleDateString()} | Receipt: ${receiptData.receiptNumber}`, pageWidth / 2, footerY + 4, { align: 'center' });
    pdf.text('Computer-generated document. No signature required.', pageWidth / 2, footerY + 7, { align: 'center' });
    
    return {
        pdf,
        filename: `LASAC-Donation-Receipt-${receiptData.donationId}.pdf`,
        title: `Donation Receipt #${receiptData.donationId}`
    };
};

/**
 * Generate and download receipt PDF
 * @param {Object} receiptData - Receipt data from backend
 * @param {boolean} openInNewTab - Whether to open in new tab instead of download
 */
export const downloadReceiptPDF = (receiptData, openInNewTab = false) => {
    try {
        const { pdf, filename } = generateReceiptPDF(receiptData);
        
        if (openInNewTab) {
            // Open PDF in new tab
            const pdfUrl = pdf.output('bloburl');
            window.open(pdfUrl, '_blank');
        } else {
            // Download PDF
            pdf.save(filename);
        }
        
        return {
            success: true,
            message: openInNewTab ? 'Receipt opened in new tab' : 'Receipt downloaded successfully',
            filename
        };
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        throw new Error('Failed to generate receipt PDF: ' + error.message);
    }
};

/**
 * Generate receipt PDF as blob for further processing
 * @param {Object} receiptData - Receipt data from backend
 * @returns {Blob} PDF blob
 */
export const generateReceiptBlob = (receiptData) => {
    try {
        const { pdf } = generateReceiptPDF(receiptData);
        return pdf.output('blob');
    } catch (error) {
        console.error('Error generating receipt blob:', error);
        throw new Error('Failed to generate receipt blob: ' + error.message);
    }
};

/**
 * Preview receipt PDF in browser
 * @param {Object} receiptData - Receipt data from backend
 * @returns {string} Blob URL for PDF preview
 */
export const previewReceiptPDF = (receiptData) => {
    try {
        const blob = generateReceiptBlob(receiptData);
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error creating receipt preview:', error);
        throw new Error('Failed to create receipt preview: ' + error.message);
    }
};

export default {
    generateReceiptPDF,
    downloadReceiptPDF,
    generateReceiptBlob,
    previewReceiptPDF
};