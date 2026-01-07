import React, { useState, useEffect } from "react";
import { 
  HiSearch, 
  HiDownload, 
  HiEye, 
  HiCalendar,
  HiRefresh,
  HiCheckCircle,
  HiPlay,
  HiX,
  HiDocumentText
} from "react-icons/hi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import distributionService from "../services/distributionService";
import SuccessModal from "./common/SuccessModal";
import { useSuccessModal } from "../hooks/useSuccessModal";
import PaginationComponent from "./common/PaginationComponent";

function DistributionLogs({ userRole = 'staff' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    status: "",
    sortBy: "planned_date",
    sortOrder: "DESC"
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  
  const { isOpen: isSuccessOpen, modalData: successData, showSuccess, hideSuccess } = useSuccessModal();

  // Load distribution plans
  const loadDistributionLogs = async (page = 1, searchTerm = '', filterObj = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        ...filterObj,
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await distributionService.getAllDistributionPlans(params);
      
      if (response.success) {
        setLogs(response.data || []);
        setPagination({
          currentPage: response.pagination?.currentPage || page,
          pages: response.pagination?.pages || 1,
          total: response.pagination?.total || 0,
          limit: pagination.limit
        });
      } else {
        setError(response.message || "Failed to load distribution plans");
      }
    } catch (err) {
      console.error("Error loading distribution logs:", err);
      setError("Failed to load distribution logs");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    loadDistributionLogs(1, search, filters);
  }, [filters.year, filters.month, filters.status, filters.sortBy, filters.sortOrder]);

  // Trigger search when search state changes
  useEffect(() => {
    loadDistributionLogs(1, search, filters);
  }, [search]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearch(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const refreshLogs = () => {
    loadDistributionLogs(pagination.currentPage, search, filters);
  };

  const handlePageChange = (page) => {
    loadDistributionLogs(page, search, filters);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportLogs = async () => {
    try {
      setReportLoading(true);
      
      // Fetch summary statistics from backend
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.year) params.year = filters.year;
      if (filters.month) params.month = filters.month;
      if (search) params.search = search;

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/distribution/summary?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch distribution summary for report');
      }

      const result = await response.json();
      const summary = result.data || {};
      
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribution Plans Summary Report', 14, 20);

      // Report metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${currentDate}`, 14, 28);
      
      // Filters applied
      let filterText = 'Filters: ';
      if (filters.year) filterText += `Year: ${filters.year} `;
      if (filters.month) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        filterText += `Month: ${monthNames[parseInt(filters.month) - 1]} `;
      }
      if (filters.status) filterText += `Status: ${filters.status} `;
      if (search) filterText += `Search: "${search}" `;
      if (filterText === 'Filters: ') filterText = 'Filters: None';
      
      doc.text(filterText, 14, 34);

      // Summary Statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics:', 14, 48);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 58;
      
      // Plan Status Breakdown
      doc.setFont('helvetica', 'bold');
      doc.text('Distribution Plans:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      
      doc.text(`Total Plans: ${summary.totalPlans || 0}`, 20, yPos);
      yPos += 5;
      doc.text(`Draft: ${summary.draftCount || 0}`, 20, yPos);
      yPos += 5;
      doc.text(`Approved: ${summary.approvedCount || 0}`, 20, yPos);
      yPos += 5;
      doc.text(`Completed: ${summary.completedCount || 0}`, 20, yPos);
      yPos += 5;
      doc.text(`Cancelled: ${summary.cancelledCount || 0}`, 20, yPos);
      yPos += 10;
      
      // Items and Value
      doc.setFont('helvetica', 'bold');
      doc.text('Distribution Details:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      
      const totalItems = parseInt(summary.totalItems || 0);
      doc.text(`Total Items Distributed: ${totalItems.toLocaleString()}`, 20, yPos);
      yPos += 5;
      
      const totalValue = parseFloat(summary.totalValue || 0);
      doc.text(`Total Value: PHP ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPos);
      yPos += 10;
      
      // Beneficiaries
      doc.setFont('helvetica', 'bold');
      doc.text('Beneficiaries:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      
      const individualsServed = parseInt(summary.totalIndividualsServed || 0);
      doc.text(`Total Individuals Served: ${individualsServed.toLocaleString()}`, 20, yPos);
      yPos += 5;
      
      const uniqueBeneficiaries = parseInt(summary.uniqueBeneficiaries || 0);
      doc.text(`Unique Beneficiaries: ${uniqueBeneficiaries.toLocaleString()}`, 20, yPos);
      yPos += 15;
      
      // Add a visual summary box
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.rect(14, yPos, 180, 40);
      
      doc.setFillColor(255, 245, 245);
      doc.rect(14, yPos, 180, 40, 'F');
      
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('Key Highlights', 105, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      const avgValue = totalValue / (summary.totalPlans || 1);
      doc.text(`Average Value per Plan: PHP ${avgValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPos);
      yPos += 6;
      
      const avgItemsPerPlan = totalItems / (summary.totalPlans || 1);
      doc.text(`Average Items per Plan: ${avgItemsPerPlan.toFixed(1)}`, 20, yPos);
      yPos += 6;
      
      const avgIndividualsPerPlan = individualsServed / (summary.totalPlans || 1);
      doc.text(`Average Individuals per Plan: ${avgIndividualsPerPlan.toFixed(1)}`, 20, yPos);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        'Page 1 of 1',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      // Generate filename
      let filename = 'distribution-summary';
      if (filters.year && filters.month) {
        filename = `distribution-summary-${filters.year}-${filters.month}`;
      } else if (filters.year) {
        filename = `distribution-summary-${filters.year}`;
      }
      filename += `.pdf`;

      // Save PDF
      doc.save(filename);
      
      setReportLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report: ' + error.message);
      setReportLoading(false);
    }
  };

  const approvePlan = async (planId, plan = null) => {
    try {
      const response = await distributionService.approveDistributionPlan(planId, 'Approved by admin');
      if (response.success) {
        // Find plan data if not provided
        const planData = plan || logs.find(log => log.plan_id === planId);
        
        showSuccess({
          title: '✅ Plan Approved Successfully!',
          message: `Distribution Plan #${planId} has been approved and is now ready for execution.`,
          details: planData ? {
            beneficiary: planData.beneficiary_name || 'N/A',
            status: 'Approved',
            total_items: planData.total_items || 0,
            total_value: planData.total_allocated_value || 0
          } : null,
          icon: 'checkCircle'
        });
        refreshLogs();
      } else {
        alert('Failed to approve plan: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving plan:', error);
      alert('Failed to approve plan: ' + (error.response?.data?.message || error.message || 'Network error'));
    }
  };

  const generateReceipt = async (planId) => {
    try {
      // Fetch full plan details with items
      const response = await distributionService.getDistributionPlanById(planId);
      if (!response.success || !response.data) {
        alert('Failed to load plan details for receipt generation');
        return;
      }

      const plan = response.data;

      // Generate PDF using jsPDF
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
        return y + (lines.length * fontSize * 0.353);
      };
      
      // Compact header with organization info
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 32, 'F');
      
      // Organization name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const orgName = 'La Salle Alumni Social Action Center (LASAC)';
      const orgNameLines = pdf.splitTextToSize(orgName, pageWidth - (margin * 2));
      pdf.text(orgNameLines, margin, 14);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const addressY = 14 + (orgNameLines.length * 5);
      const orgAddress = 'De La Salle University, 2401 Taft Avenue, Manila, Philippines';
      const addressLines = pdf.splitTextToSize(orgAddress, pageWidth - (margin * 2));
      pdf.text(addressLines, margin, addressY);
      pdf.text('Phone: (02) 8524-4611 | Email: lasac@dlsu.edu.ph', margin, addressY + (addressLines.length * 3) + 1);
      
      yPosition = 40;
      
      // Document title
      pdf.setTextColor(...darkColor);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DISTRIBUTION PLAN RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 12;
      
      // Receipt information box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 20, 'F');
      pdf.setDrawColor(...grayColor);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...darkColor);
      
      // Receipt details in two columns
      const leftCol = margin + 3;
      const rightCol = pageWidth / 2 + 5;
      const receiptY = yPosition + 6;
      
      pdf.text(`Plan ID: #${plan.plan_id}`, leftCol, receiptY);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, rightCol, receiptY);
      
      pdf.text(`Status: ${plan.status}`, leftCol, receiptY + 6);
      pdf.text(`Planned Date: ${formatDate(plan.planned_date)}`, rightCol, receiptY + 6);
      
      yPosition += 28;
      
      // Two-column layout for beneficiary and distribution info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.text('BENEFICIARY INFORMATION', margin, yPosition);
      pdf.text('DISTRIBUTION DETAILS', pageWidth / 2 + 5, yPosition);
      
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...darkColor);
      
      // Left column - Beneficiary info
      const beneficiaryInfo = [
        ['Name:', plan.beneficiary_name || 'N/A'],
        ['Type:', plan.beneficiary_type || 'N/A'],
        ['Contact:', plan.contact_person || 'N/A'],
        ['Phone:', plan.beneficiary_phone || 'N/A']
      ];
      
      // Right column - Distribution info
      const distributionInfo = [
        ['Purpose:', plan.purpose || 'N/A'],
        ['Urgency:', plan.urgency || 'N/A'],
        ['Created By:', plan.created_by_name || 'Unknown'],
        ['Approved By:', plan.approved_by_name || 'Pending']
      ];
      
      // Display info in two columns
      let maxRows = Math.max(beneficiaryInfo.length, distributionInfo.length);
      for (let i = 0; i < maxRows; i++) {
        const currentY = yPosition + (i * 5);
        
        // Left column
        if (i < beneficiaryInfo.length && beneficiaryInfo[i][0]) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(beneficiaryInfo[i][0], margin, currentY);
          pdf.setFont('helvetica', 'normal');
          const beneficiaryText = pdf.splitTextToSize(beneficiaryInfo[i][1], 65);
          pdf.text(beneficiaryText, margin + 25, currentY);
        }
        
        // Right column
        if (i < distributionInfo.length && distributionInfo[i][0]) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(distributionInfo[i][0], pageWidth / 2 + 5, currentY);
          pdf.setFont('helvetica', 'normal');
          const distText = pdf.splitTextToSize(distributionInfo[i][1], 65);
          pdf.text(distText, pageWidth / 2 + 30, currentY);
        }
      }
      
      yPosition += (maxRows * 5) + 5;
      
      if (plan.remarks) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text('REMARKS:', margin, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...darkColor);
        yPosition = addWrappedText(plan.remarks, margin + 5, yPosition, pageWidth - margin - 10, 8);
        yPosition += 3;
      }
      
      yPosition += 10;
      
      // Distributed Items Table
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.text('ITEMS DISTRIBUTED', margin, yPosition);
      
      yPosition += 3;
      
      if (plan.items && plan.items.length > 0) {
        // Prepare table data
        const tableHeaders = ['Item Type', 'Category', 'Items Stored In', 'Quantity', 'Unit Value', 'Total Value'];
        const tableData = plan.items.map(item => {
          const quantity = parseFloat(item.quantity || 0);
          const totalValue = parseFloat(item.allocated_value || 0);
          const unitValue = quantity > 0 ? totalValue / quantity : 0;
          
          return [
            item.itemtype_name || 'N/A',
            item.category_name || 'N/A',
            item.location || 'N/A',
            quantity.toString(),
            'PHP ' + unitValue.toFixed(2),
            'PHP ' + totalValue.toFixed(2)
          ];
        });
        
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
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto', halign: 'center' },
            4: { cellWidth: 'auto', halign: 'right' },
            5: { cellWidth: 'auto', halign: 'right' }
          },
          margin: { left: margin, right: margin },
          tableWidth: 'wrap'
        });
        
        yPosition = pdf.lastAutoTable.finalY + 10;
        
        // Summary Section
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
        const totalItems = plan.items.length;
        const totalQuantity = plan.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        const totalValue = parseFloat(plan.total_allocated_value || 0);
        
        pdf.text(`Items: ${totalItems}`, pageWidth - 67, summaryY + 5);
        pdf.text(`Qty: ${totalQuantity}`, pageWidth - 67, summaryY + 9);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Total: PHP ${totalValue.toFixed(2)}`, pageWidth - 67, summaryY + 15);
        
        yPosition += 30;
      } else {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...grayColor);
        pdf.text('No items found for this distribution plan.', margin, yPosition);
        yPosition += 10;
      }
      
      // Footer
      const footerY = pdf.internal.pageSize.height - 30;
      pdf.setDrawColor(...grayColor);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...grayColor);
      pdf.text('Thank you for your partnership with LASAC!', pageWidth / 2, footerY, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()} | Plan ID: #${plan.plan_id}`, pageWidth / 2, footerY + 4, { align: 'center' });
      pdf.text('Computer-generated document. No signature required.', pageWidth / 2, footerY + 7, { align: 'center' });
      
      // Save/Open PDF
      const filename = `LASAC-Distribution-Receipt-${plan.plan_id}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt');
    }
  };

  const executePlan = async (planId) => {
    try {
      const response = await distributionService.executeDistributionPlan(planId, {
        distribution_date: new Date().toISOString(),
        execution_notes: 'Executed by admin from Distribution Logs'
      });
      if (response.success) {
        showSuccess({
          title: '🎉 Distribution Completed Successfully!',
          message: `Distribution Plan #${planId} has been executed and completed.`,
          details: response.data ? {
            beneficiary: response.data.beneficiary_name,
            status: response.data.status,
            total_items: response.data.total_items,
            total_value: response.data.total_allocated_value
          } : null,
          icon: 'trophy',
          buttonText: 'Great!'
        });
        refreshLogs();
      } else {
        alert('Failed to execute plan: ' + response.message);
      }
    } catch (error) {
      console.error('Error executing plan:', error);
      alert('Failed to execute plan');
    }
  };

  const viewPlanDetails = async (planId) => {
    try {
      const response = await distributionService.getDistributionPlanById(planId);
      if (response.success) {
        setSelectedPlan(response.data);
        setShowDetailsModal(true);
      } else {
        alert('Failed to load plan details: ' + response.message);
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
      alert('Failed to load plan details');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800' },
      'Ongoing': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Completed': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig['Draft'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 mt-1">Track and manage distribution plans and execution</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search plans..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            {/* Month Filter */}
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Sort By */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
              <option value="distribution_date-DESC">Latest First</option>
              <option value="distribution_date-ASC">Oldest First</option>
              <option value="beneficiary_name-ASC">Beneficiary A-Z</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={refreshLogs}
              disabled={loading}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Button */}
            <button
              onClick={exportLogs}
              disabled={reportLoading}
              className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiDownload className={`w-4 h-4 mr-2 ${reportLoading ? 'animate-spin' : ''}`} />
              {reportLoading ? 'Generating...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HiX className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={refreshLogs}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden">
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full">
              <thead className="bg-red-600 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Plan ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Planned Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                      {search ? "No plans match your search criteria." : "No distribution plans found."}
                    </td>
                  </tr>
                ) : (
                  logs.map((plan) => (
                    <tr key={plan.plan_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">#{plan.plan_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {plan.beneficiary_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'B'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{plan.beneficiary_name}</div>
                            {plan.beneficiary_type && (
                              <div className="text-sm text-gray-500">{plan.beneficiary_type}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">{plan.purpose}</div>
                        {plan.urgency && (
                          <div className="text-xs text-gray-500 mt-1">{plan.urgency} urgency</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(plan.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(plan.planned_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{plan.created_by_name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => viewPlanDetails(plan.plan_id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        {plan.status === 'Draft' && userRole === 'admin' && (
                          <button
                            onClick={() => approvePlan(plan.plan_id, plan)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve Plan"
                          >
                            <HiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {plan.status === 'Approved' && userRole === 'admin' && (
                          <button
                            onClick={() => executePlan(plan.plan_id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Execute Plan"
                          >
                            <HiPlay className="w-4 h-4" />
                          </button>
                        )}
                        {(plan.status === 'Approved' || plan.status === 'Completed') && (
                          <button
                            onClick={() => generateReceipt(plan.plan_id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Generate Receipt"
                          >
                            <HiDocumentText className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <PaginationComponent
              pagination={pagination}
              onPageChange={handlePageChange}
              itemName="plans"
            />
          </div>
        )}
      </div>

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => setShowDetailsModal(false)}
          onApprove={approvePlan}
          onExecute={executePlan}
          onGenerateReceipt={generateReceipt}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          userRole={userRole}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        buttonText={successData.buttonText}
        icon={successData.icon}
      />
    </div>
  );
}

// Plan Details Modal Component
function PlanDetailsModal({ plan, onClose, onApprove, onExecute, onGenerateReceipt, formatDate, getStatusBadge, userRole = 'staff' }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
              <h3 className="text-xl font-bold text-gray-900">
                Distribution Plan Details - #{plan.plan_id}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Plan Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Beneficiary Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium text-gray-900">{plan.beneficiary_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium text-gray-900">{plan.beneficiary_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contact:</span>
                      <span className="text-sm font-medium text-gray-900">{plan.contact_person || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Plan Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(plan.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Urgency:</span>
                      <span className="text-sm font-medium text-gray-900">{plan.urgency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Planned Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(plan.planned_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created By:</span>
                      <span className="text-sm font-medium text-gray-900">{plan.created_by_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Purpose</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{plan.purpose}</p>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Items to Distribute</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plan.items && plan.items.length > 0 ? (
                        plan.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.itemtype_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{parseFloat(item.allocated_value || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.location}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              {plan.items && plan.items.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Items:</span>
                      <span className="ml-2 font-semibold text-red-800">{plan.total_items || plan.items.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Value:</span>
                      <span className="ml-2 font-semibold text-red-800">₱{parseFloat(plan.total_allocated_value || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium"
              >
                Close
              </button>
              {plan.status === 'Draft' && userRole === 'admin' && (
                <button
                  onClick={() => {
                    onApprove(plan.plan_id, plan);
                    onClose();
                  }}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  Approve Plan
                </button>
              )}
              {plan.status === 'Approved' && userRole === 'admin' && (
                <button
                  onClick={() => {
                    onExecute(plan.plan_id);
                    onClose();
                  }}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <HiPlay className="w-4 h-4 mr-2" />
                  Execute Plan
                </button>
              )}
              {(plan.status === 'Approved' || plan.status === 'Completed') && (
                <button
                  onClick={() => {
                    onGenerateReceipt(plan.plan_id);
                  }}
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  <HiDocumentText className="w-4 h-4 mr-2" />
                  Generate Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistributionLogs;
