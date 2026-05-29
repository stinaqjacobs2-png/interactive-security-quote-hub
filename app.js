const state = {
  taxRate: 0.15,
  selectedCompanyId: "",
  selectedApprovalId: "",
  selectedLibraryId: "",
  selectedSalesRequestId: "",
  focusRejectionReason: false,
  auditReportRows: [],
  markupPercent: 20,
  supplierQuote: null,
  supplierQuotes: [],
  supplierQuoteFiles: [],
  revisingQuoteId: "",
  revisionNumber: 0,
  supplierImport: null,
  supplierImportErrors: [],
  salesRequestFiles: [],
  revisionSourceId: "",
  activeSalesRequestId: "",
  selectedRequestSalesRepId: "",
  items: [{ stockCode: "", description: "", quantity: 1, supplierCost: 0 }],
  costing: { stockCost: 0, consumablesCost: 0, labourCost: 0 },
};

const fixedScopeText = "We will provide a structured delivery of the requested services with progress updates and a final handover once the agreed scope has been completed.";

const quoteSequencePrefix = "quotePilotSequence";
const approvalsStorageKey = "quotePilotApprovalQueue";
const auditStorageKey = "quotePilotAuditTrail";
const sessionStorageKey = "quotePilotSignedInUser";
const sharedSessionStorageKey = "interactiveSecuritySignedInUser";
const sharedSessionDetailsKey = "interactiveSecuritySession";
const membersStorageKey = "quotePilotMembers";
const salesRepsStorageKey = "quotePilotSalesReps";
const supplierPricesStorageKey = "quotePilotSupplierPrices";
const clientsStorageKey = "quotePilotClients";
const hubsStorageKey = "interactiveSecurityHubs";
const hubPermissionsStorageKey = "interactiveSecurityHubPermissions";
const userHubAccessStorageKey = "interactiveSecurityUserHubAccess";
const hubActivitySummaryStorageKey = "interactiveSecurityHubActivitySummary";
const userPermissionsStorageKey = "interactiveSecurityUserPermissions";
const quotationSettingsStorageKey = "interactiveSecurityQuotationSettings";
const salesRequestsStorageKey = "interactiveSecuritySalesQuotationRequests";
const requestSequencePrefix = "interactiveSecuritySalesRequestSequence";
const supplierQuoteDbName = "quotePilotSupplierQuotations";
const supplierQuoteStoreName = "files";
const libraryDocumentStoreName = "libraryDocuments";

let salesReps = {
  "elzeri-wright": {
    name: "Elzeri Wright",
    email: "elzeri@interactivesecurity.co.za",
    phone: "076 633 3737",
  },
  "renier-de-meyer": {
    name: "Renier de Meyer",
    email: "renier@interactivesecurity.co.za",
    phone: "083 357 2066",
  },
  "rene-viljoen": {
    name: "Rene Viljoen",
    email: "rene@interactivesecurity.co.za",
    phone: "082 859 2536",
  },
  "darryn-cock": {
    name: "Darryn Cock",
    email: "darryn@interactivesecurity.co.za",
    phone: "083 288 1884",
  },
  "gordon-van-aswegen": {
    name: "Gordon Van Aswegen",
    email: "gordon@interactivesecurity.co.za",
    phone: "081 520 2011",
  },
  "dean-de-kok": {
    name: "Dean de Kok",
    email: "dean@interactivesecurity.co.za",
    phone: "082 555 2515",
  },
  "adriaan-van-deventer": {
    name: "Adriaan van Deventer",
    email: "adriaan@interactivesecurity.co.za",
    phone: "082 393 3006",
  },
  "jethro-muleya": {
    name: "Jethro Muleya",
    email: "jethrointeractive1@gmail.com",
    phone: "082 362 3163",
  },
};

const companies = {
  "isc-sa": {
    name: "Interactive Security Consultants SA CC",
    umbrella: "Interactive Security",
    registration: "1995/008708/23",
    vat: "4540148170",
    address: "24 Van Zyl Road, Steynsvlei, Muldersdrift",
    phone: "0861 070 007",
    email: "finance@interactivesecurity.co.za",
    website: "www.interactivesecurity.co.za",
    bankName: "Nedbank",
    accountHolder: "Nedbank Current Account",
    accountType: "Current Account",
    accountNumber: "102 618 9853",
    branchCode: "198 765",
  },
  "isc-limpopo": {
    name: "Interactive Security Consultants Limpopo (Pty) Ltd",
    umbrella: "Interactive Security",
    registration: "2012/066427/07",
    vat: "4020290708",
    address: "24 Van Zyl Road, Steynsvlei, Muldersdrift",
    phone: "0861 070 007",
    email: "christien@interactivesecurity.co.za",
    website: "www.interactivesecurity.co.za",
    bankName: "Nedbank",
    accountHolder: "Nedbank Current Account",
    accountType: "Current Account",
    accountNumber: "1119215153",
    branchCode: "198 765",
  },
  "isc-24": {
    name: "Interactive Security Consultants 24 (Pty) Ltd",
    umbrella: "Interactive Security",
    registration: "2020/667311/07",
    vat: "4030319513",
    address: "24 Van Zyl Road, Steynsvlei, Muldersdrift",
    phone: "0861 070 007",
    email: "christien@interactivesecurity.co.za",
    website: "www.interactivesecurity.co.za",
    bankName: "ABSA",
    accountHolder: "ABSA",
    accountType: "Current Account",
    accountNumber: "41 1448 0346",
    branchCode: "632 005",
  },
  "isc-converted": {
    name: "Interactive Security Consultants (Pty) Ltd",
    umbrella: "Interactive Security",
    registration: "2012/031076/07",
    vat: "4430272155",
    address: "24 Van Zyl Road, Steynsvlei, Muldersdrift",
    phone: "0861 070 007",
    email: "angelique@interactivesecurity.co.za, chane@interactivesecurity.co.za",
    website: "www.interactivesecurity.co.za",
    bankName: "Nedbank",
    accountHolder: "Nedbank Current Account",
    accountType: "Current Account",
    accountNumber: "1119190142",
    branchCode: "198 765",
  },
};

const money = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

const fields = {
  selectedCompany: document.querySelector("#selectedCompany"),
  clientName: document.querySelector("#clientName"),
  clientAddress: document.querySelector("#clientAddress"),
  contactPerson: document.querySelector("#contactPerson"),
  contactEmail: document.querySelector("#contactEmail"),
  contactNumber: document.querySelector("#contactNumber"),
  quoteNumber: document.querySelector("#quoteNumber"),
  salesRep: document.querySelector("#salesRep"),
  quoteDate: document.querySelector("#quoteDate"),
  validityDays: document.querySelector("#validityDays"),
  validUntil: document.querySelector("#validUntil"),
  markupPercent: document.querySelector("#markupPercent"),
  aiInstruction: document.querySelector("#aiInstruction"),
  projectSummary: document.querySelector("#projectSummary"),
  termsText: document.querySelector("#termsText"),
};

const itemsBody = document.querySelector("#itemsBody");
const previewItems = document.querySelector("#previewItems");
const validationSummary = document.querySelector("#validationSummary");
const supplierQuoteUpload = document.querySelector("#supplierQuoteUpload");
const supplierQuoteName = document.querySelector("#supplierQuoteName");
const costingStockCost = document.querySelector("#costingStockCost");
const costingConsumablesCost = document.querySelector("#costingConsumablesCost");
const costingLabourCost = document.querySelector("#costingLabourCost");
const costingStockMarkup = document.querySelector("#costingStockMarkup");
const costingStockTotal = document.querySelector("#costingStockTotal");
const costingConsumablesMarkup = document.querySelector("#costingConsumablesMarkup");
const costingConsumablesTotal = document.querySelector("#costingConsumablesTotal");
const costingLabourMarkup = document.querySelector("#costingLabourMarkup");
const costingLabourTotal = document.querySelector("#costingLabourTotal");
const costingRawTotal = document.querySelector("#costingRawTotal");
const costingGrandTotal = document.querySelector("#costingGrandTotal");
const costingTotalMarkup = document.querySelector("#costingTotalMarkup");
const costingLabourAmount = document.querySelector("#costingLabourAmount");
const costingMarkupLabourTotal = document.querySelector("#costingMarkupLabourTotal");
const costingDeduction16 = document.querySelector("#costingDeduction16");
const costingProfit = document.querySelector("#costingProfit");
const costingCommission4 = document.querySelector("#costingCommission4");
const costingTotalQuotationProfit = document.querySelector("#costingTotalQuotationProfit");
const costingBalanceNote = document.querySelector("#costingBalanceNote");
const approvalList = document.querySelector("#approvalList");
const approvalDetail = document.querySelector("#approvalDetail");
const approvalCount = document.querySelector("#approvalCount");
const quoteLibraryList = document.querySelector("#quoteLibraryList");
const quoteLibraryDetail = document.querySelector("#quoteLibraryDetail");
const auditList = document.querySelector("#auditList");
const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const sectionEyebrow = document.querySelector("#sectionEyebrow");
const sectionTitle = document.querySelector("#sectionTitle");
const sectionStatus = document.querySelector("#sectionStatus");
const memberForm = document.querySelector("#memberForm");
const memberName = document.querySelector("#memberName");
const memberEmail = document.querySelector("#memberEmail");
const memberAccess = document.querySelector("#memberAccess");
const memberPermissionChecklist = document.querySelector("#memberPermissionChecklist");
const memberInviteStatus = document.querySelector("#memberInviteStatus");
const memberTempPassword = document.querySelector("#memberTempPassword");
const generateTempPassword = document.querySelector("#generateTempPassword");
const memberList = document.querySelector("#memberList");
const salesRepForm = document.querySelector("#salesRepForm");
const setupSalesRepName = document.querySelector("#setupSalesRepName");
const setupSalesRepEmail = document.querySelector("#setupSalesRepEmail");
const setupSalesRepPhone = document.querySelector("#setupSalesRepPhone");
const setupSalesRepList = document.querySelector("#setupSalesRepList");
const supplierPriceForm = document.querySelector("#supplierPriceForm");
const supplierNameField = document.querySelector("#supplierName");
const supplierStockCode = document.querySelector("#supplierStockCode");
const supplierDescription = document.querySelector("#supplierDescription");
const supplierCategory = document.querySelector("#supplierCategory");
const supplierCostField = document.querySelector("#supplierCost");
const supplierPriceList = document.querySelector("#supplierPriceList");
const supplierImportFile = document.querySelector("#supplierImportFile");
const supplierImportMode = document.querySelector("#supplierImportMode");
const supplierImportMapping = document.querySelector("#supplierImportMapping");
const supplierImportPreview = document.querySelector("#supplierImportPreview");
const confirmSupplierImport = document.querySelector("#confirmSupplierImport");
const downloadSupplierImportErrors = document.querySelector("#downloadSupplierImportErrors");
const supplierImportSummary = document.querySelector("#supplierImportSummary");
const clientForm = document.querySelector("#clientForm");
const setupClientName = document.querySelector("#setupClientName");
const setupClientAddress = document.querySelector("#setupClientAddress");
const setupClientContact = document.querySelector("#setupClientContact");
const setupClientEmail = document.querySelector("#setupClientEmail");
const setupClientPhone = document.querySelector("#setupClientPhone");
const clientList = document.querySelector("#clientList");
const auditMemberFilter = document.querySelector("#auditMemberFilter");
const auditSingleDate = document.querySelector("#auditSingleDate");
const auditFromDate = document.querySelector("#auditFromDate");
const auditToDate = document.querySelector("#auditToDate");
const generateAuditReport = document.querySelector("#generateAuditReport");
const exportAuditReport = document.querySelector("#exportAuditReport");
const dashboardMonth = document.querySelector("#dashboardMonth");
const dashboardFromDate = document.querySelector("#dashboardFromDate");
const dashboardToDate = document.querySelector("#dashboardToDate");
const dashboardPrevMonth = document.querySelector("#dashboardPrevMonth");
const dashboardNextMonth = document.querySelector("#dashboardNextMonth");
const dashboardApplyFilters = document.querySelector("#dashboardApplyFilters");
const dashboardExportCsv = document.querySelector("#dashboardExportCsv");
const dashboardExportSalesCsv = document.querySelector("#dashboardExportSalesCsv");
const dashboardExportOutstandingCsv = document.querySelector("#dashboardExportOutstandingCsv");
const dashboardPrintReport = document.querySelector("#dashboardPrintReport");
const dashboardSummary = document.querySelector("#dashboardSummary");
const approvedAcceptedChart = document.querySelector("#approvedAcceptedChart");
const salesRepQuoteChart = document.querySelector("#salesRepQuoteChart");
const salesRepValueChart = document.querySelector("#salesRepValueChart");
const salesRepTotalsTable = document.querySelector("#salesRepTotalsTable");
const outstandingClientTable = document.querySelector("#outstandingClientTable");
const portalHubGrid = document.querySelector("#portalHubGrid");
const portalSummaryTitle = document.querySelector("#portalSummaryTitle");
const portalSummaryGrid = document.querySelector("#portalSummaryGrid");
const portalMonthlyChart = document.querySelector("#portalMonthlyChart");
const portalSalesRepTable = document.querySelector("#portalSalesRepTable");
const quotationSettingsForm = document.querySelector("#quotationSettingsForm");
const profitDeductionPercent = document.querySelector("#profitDeductionPercent");
const commissionPercent = document.querySelector("#commissionPercent");
const salesRequestForm = document.querySelector("#salesRequestForm");
const salesRequestList = document.querySelector("#salesRequestList");
const requestFiles = document.querySelector("#requestFiles");
const requestFileList = document.querySelector("#requestFileList");
const requestSalesRepName = document.querySelector("#requestSalesRepName");
const requestSalesRepEmail = document.querySelector("#requestSalesRepEmail");
const requestSalesRepPhone = document.querySelector("#requestSalesRepPhone");
const requestSalesRepOptions = document.querySelector("#requestSalesRepOptions");
const salesRequestDocumentsPanel = document.querySelector("#salesRequestDocumentsPanel");
const salesRequestDocumentsList = document.querySelector("#salesRequestDocumentsList");
const salesRequestSummaryPanel = document.querySelector("#salesRequestSummaryPanel");
const salesRequestSummary = document.querySelector("#salesRequestSummary");

const permissionDefinitions = [
  { key: "dashboard", label: "Dashboard", section: "dashboard" },
  { key: "build_quotation", label: "Build Quotation", section: "builder" },
  { key: "quote_library", label: "Quote Library", section: "library" },
  { key: "approval", label: "Approval", section: "approvals" },
  { key: "reports", label: "Reports", section: "dashboard" },
  { key: "audit_trail", label: "Audit Trail", section: "audit" },
  { key: "setup", label: "Setup", section: "settings" },
  { key: "supplier_prices", label: "Supplier Prices", section: "settings" },
  { key: "member_access_management", label: "Member Access Management", section: "settings" },
  { key: "quotation_hub", label: "Quotation Hub", hubSlug: "quotation-hub" },
  { key: "sales_quotation_requests", label: "Sales Quotation Requests", section: "salesRequests" },
];

const roleDefaultPermissions = {
  "Super Admin": permissionDefinitions.map((permission) => permission.key),
  Admin: permissionDefinitions.map((permission) => permission.key),
  "Full Access Member": ["dashboard", "reports", "build_quotation", "quote_library", "approval", "quotation_hub", "sales_quotation_requests"],
  "Quotation Builder Only": ["build_quotation", "quotation_hub", "sales_quotation_requests"],
};

const sectionHeadings = {
  portal: {
    eyebrow: "Company portal",
    title: "Central dashboard",
    status: "Portal",
  },
  dashboard: {
    eyebrow: "Reporting",
    title: "Dashboard",
    status: "Reports",
  },
  builder: {
    eyebrow: "AI quotation workspace",
    title: "Build a professional quotation",
    status: "Draft",
  },
  approvals: {
    eyebrow: "Approval workspace",
    title: "Approve submitted quotations",
    status: "Approval",
  },
  salesRequests: {
    eyebrow: "Sales requests",
    title: "Sales Quotation Requests",
    status: "Requests",
  },
  library: {
    eyebrow: "Quotation records",
    title: "Quote Library",
    status: "Library",
  },
  settings: {
    eyebrow: "Platform setup",
    title: "Setup",
    status: "Setup",
  },
  audit: {
    eyebrow: "Activity records",
    title: "Audit Trail",
    status: "Audit",
  },
};

function itemTotal(item) {
  return Number(item.quantity || 0) * markedUpUnitPrice(item);
}

function markupMultiplier() {
  return 1 + Number(fields.markupPercent.value || state.markupPercent) / 100;
}

function itemUsesNoMarkup(item) {
  const description = String(item.description || "").trim().toLowerCase();
  return (
    description === "consumables" ||
    description === "labour" ||
    description.includes("consumables") ||
    description.includes("labour")
  );
}

function markedUpUnitPrice(item) {
  const selectedMarkupRate = Number(fields.markupPercent.value || state.markupPercent || 0);
  const markupRate = itemUsesNoMarkup(item) ? 0 : selectedMarkupRate;
  return supplierCost(item) * (1 + markupRate / 100);
}

function supplierCost(item) {
  return Number(item.supplierCost ?? item.price ?? 0);
}

function quoteMarkupMultiplier(quote) {
  return 1 + Number(quote.markupPercent || 20) / 100;
}

function quoteUnitPrice(quote, item) {
  const selectedMarkupRate = Number(quote.markupPercent || 20);
  const markupRate = itemUsesNoMarkup(item) ? 0 : selectedMarkupRate;
  return supplierCost(item) * (1 + markupRate / 100);
}

function quoteItemTotal(quote, item) {
  return Number(item.quantity || 0) * quoteUnitPrice(quote, item);
}

function quoteSubtotal(quote) {
  return (quote.items || []).reduce((sum, item) => sum + quoteItemTotal(quote, item), 0);
}

function quoteSupplierSubtotal(quote) {
  return (quote.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * supplierCost(item), 0);
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function quotationSettings() {
  const defaults = { profitDeductionPercent: 16.08, commissionPercent: 4 };
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(quotationSettingsStorageKey) || "{}")) };
  } catch {
    localStorage.removeItem(quotationSettingsStorageKey);
    return defaults;
  }
}

function quoteCostingSubtotal() {
  return roundCurrency(state.items.reduce((sum, item) => sum + itemTotal(item), 0));
}

function costingValues(costing = state.costing, markup = Number(fields.markupPercent.value || 0)) {
  const settings = quotationSettings();
  const stockCost = roundCurrency(costing.stockCost);
  const consumablesCost = roundCurrency(costing.consumablesCost);
  const labourCost = roundCurrency(costing.labourCost);
  const stockMarkup = roundCurrency(stockCost * (markup / 100));
  const stockTotal = roundCurrency(stockCost + stockMarkup);
  const consumablesMarkup = 0;
  const labourMarkup = 0;
  const consumablesTotal = consumablesCost;
  const labourTotal = labourCost;
  const costingTotal = roundCurrency(stockTotal + consumablesTotal + labourTotal);
  const totalCostValue = roundCurrency(stockCost + consumablesCost + labourCost);
  const totalMarkup = stockMarkup;
  const markupAndLabourTotal = roundCurrency(totalMarkup + labourCost);
  const deduction16 = roundCurrency(markupAndLabourTotal * (Number(settings.profitDeductionPercent || 0) / 100));
  const profit = roundCurrency(markupAndLabourTotal - deduction16);
  const commission4 = roundCurrency(markupAndLabourTotal * (Number(settings.commissionPercent || 0) / 100));
  const totalQuotationProfit = roundCurrency(profit - commission4);
  const quoteSubtotalValue = quoteCostingSubtotal();
  const totalQuotationProfitPercentage = quoteSubtotalValue
    ? roundCurrency((totalQuotationProfit / quoteSubtotalValue) * 100)
    : 0;
  return {
    stockCost,
    consumablesCost,
    labourCost,
    stockMarkup,
    stockTotal,
    consumablesMarkup,
    consumablesTotal,
    labourMarkup,
    labourTotal,
    costingTotal,
    totalCostValue,
    totalMarkup,
    markupAndLabourTotal,
    deduction16,
    profit,
    commission4,
    totalQuotationProfit,
    totalQuotationProfitPercentage,
  };
}

function quoteCostingValues(quote) {
  const settings = quotationSettings();
  const costing = quote.costing || { stockCost: 0, consumablesCost: 0, labourCost: 0 };
  const stockCost = roundCurrency(costing.stockCost);
  const consumablesCost = roundCurrency(costing.consumablesCost);
  const labourCost = roundCurrency(costing.labourCost);
  const markup = Number(quote.markupPercent || 0);
  const stockMarkup = roundCurrency(stockCost * (markup / 100));
  const stockTotal = roundCurrency(stockCost + stockMarkup);
  const consumablesTotal = consumablesCost;
  const labourTotal = labourCost;
  const costingTotal = roundCurrency(stockTotal + consumablesTotal + labourTotal);
  const quoteSubtotalValue = roundCurrency(quoteSubtotal(quote));
  const totalMarkup = stockMarkup;
  const markupAndLabourTotal = roundCurrency(totalMarkup + labourCost);
  const deduction16 = roundCurrency(markupAndLabourTotal * (Number(settings.profitDeductionPercent || 0) / 100));
  const profit = roundCurrency(markupAndLabourTotal - deduction16);
  const commission4 = roundCurrency(markupAndLabourTotal * (Number(settings.commissionPercent || 0) / 100));
  const totalQuotationProfit = roundCurrency(profit - commission4);
  const totalQuotationProfitPercentage = quoteSubtotalValue
    ? roundCurrency((totalQuotationProfit / quoteSubtotalValue) * 100)
    : 0;
  return {
    stockCost,
    stockMarkup,
    stockTotal,
    consumablesCost,
    consumablesTotal,
    labourCost,
    labourTotal,
    costingTotal,
    quoteSubtotalValue,
    totalMarkup,
    markupAndLabourTotal,
    deduction16,
    profit,
    commission4,
    totalQuotationProfit,
    totalQuotationProfitPercentage,
    profitable: totalQuotationProfit > 0,
  };
}

function profitPercentageClass(percentage) {
  if (percentage > 15) return "profit-percent-good";
  if (percentage >= 5) return "profit-percent-warning";
  return "profit-percent-danger";
}

function canSeeInternalCosting() {
  return hasPermission("approval") || hasPermission("reports") || ["Admin", "Super Admin"].includes(currentMember().access);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatFileSize(bytes = 0) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function updateSupplierQuoteDisplay() {
  const files = state.supplierQuotes || [];
  supplierQuoteName.innerHTML = files.length
    ? files.map((file) => `
      <span class="upload-file-pill">
        ${escapeHtml(file.name)} (${escapeHtml(formatFileSize(file.size))})
        <button type="button" class="danger-btn mini-btn" data-remove-pending-supplier="${escapeHtml(file.fileId)}">Remove</button>
      </span>
    `).join("")
    : "No supplier quotation uploaded.";
}

function openSupplierQuoteDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(supplierQuoteDbName, 2);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(supplierQuoteStoreName)) {
        request.result.createObjectStore(supplierQuoteStoreName, { keyPath: "quoteId" });
      }
      if (!request.result.objectStoreNames.contains(libraryDocumentStoreName)) {
        request.result.createObjectStore(libraryDocumentStoreName, { keyPath: "fileId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSupplierQuoteFile(quoteId) {
  if (!state.supplierQuoteFiles.length) return;

  const db = await openSupplierQuoteDb();
  const existingRecord = await loadSupplierQuoteFile(quoteId).catch(() => null);
  const existingFiles = existingRecord?.files || (existingRecord?.file ? [{ metadata: existingRecord.metadata, file: existingRecord.file }] : []);
  const newFiles = state.supplierQuoteFiles.map((file, index) => ({
    metadata: state.supplierQuotes[index],
    file,
  }));
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(supplierQuoteStoreName, "readwrite");
    const store = transaction.objectStore(supplierQuoteStoreName);
    store.put({
      quoteId,
      files: [...existingFiles, ...newFiles],
      savedAt: new Date().toISOString(),
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function loadSupplierQuoteFile(quoteId) {
  const db = await openSupplierQuoteDb();
  const record = await new Promise((resolve, reject) => {
    const transaction = db.transaction(supplierQuoteStoreName, "readonly");
    const request = transaction.objectStore(supplierQuoteStoreName).get(quoteId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record;
}

async function openSupplierQuote(quoteId, fileId = "", mode = "view") {
  try {
    const record = await loadSupplierQuoteFile(quoteId);
    const files = record?.files || (record?.file ? [{ metadata: record.metadata, file: record.file }] : []);
    if (!files.length) {
      alert("The supplier quotation file could not be found in this local browser.");
      return;
    }

    const selected = fileId ? files.find((entry) => entry.metadata?.fileId === fileId) : files[0];
    if (!selected?.file) {
      alert("The selected supplier quotation file could not be found in this local browser.");
      return;
    }
    if (mode === "download") downloadBlobFile(selected.file, selected.file.name);
    else openBlobFile(selected.file, selected.file.name);
  } catch {
    alert("The supplier quotation could not be opened.");
  }
}

function renderSupplierDocumentAccess(quote) {
  const files = supplierQuoteList(quote);
  if (!files.length) return "Not uploaded";
  return files.map((file) => `<span>${escapeHtml(file.name)}</span>`).join("");
}

function renderSupplierDocumentButtons(quote) {
  const files = supplierQuoteList(quote);
  if (!files.length) return `<p class="empty-state">No supplier quotations uploaded.</p>`;
  return `
    <div class="document-access-row">
      ${files.map((file) => `
        <span>${escapeHtml(file.name)} <small>${escapeHtml(formatFileSize(file.size))}</small></span>
        <div>
          <button class="secondary-btn" type="button" data-open-supplier="${escapeHtml(quote.id)}" data-supplier-file="${escapeHtml(file.fileId || "")}">View</button>
          <button class="secondary-btn" type="button" data-download-supplier="${escapeHtml(quote.id)}" data-supplier-file="${escapeHtml(file.fileId || "")}">Download</button>
          <button class="danger-btn" type="button" data-remove-supplier-doc="${escapeHtml(quote.id)}" data-supplier-file="${escapeHtml(file.fileId || "")}">Remove</button>
        </div>
      `).join("")}
    </div>
  `;
}

function supplierQuoteList(quote) {
  const files = Array.isArray(quote?.supplierQuotes)
    ? quote.supplierQuotes
    : (quote?.supplierQuotes ? [quote.supplierQuotes] : []);
  const legacyFiles = quote?.supplierQuote ? [quote.supplierQuote] : [];
  const unique = new Map();
  [...files, ...legacyFiles].filter(Boolean).forEach((file, index) => {
    const key = file.fileId || `${file.name || "file"}-${file.size || 0}-${file.lastModified || index}`;
    if (!unique.has(key)) unique.set(key, file);
  });
  return Array.from(unique.values());
}

function quoteAuditSummary(quote) {
  const quoteNumber = quote.quoteNumber || quote.id;
  return loadAudit()
    .filter((entry) => [entry.reference, entry.detail, entry.notes].filter(Boolean).join(" ").includes(quoteNumber))
    .slice(0, 8);
}

function renderInternalCostingPanel(quote) {
  if (!canSeeInternalCosting()) return "";
  const values = quoteCostingValues(quote);
  const profitClass = values.profitable ? "status-badge status-complete" : "status-badge status-rejected";
  return `
    <div class="internal-costing-panel">
      <div class="panel-heading compact-heading">
        <div>
          <p class="eyebrow">Internal only</p>
          <h3>Costing and profit</h3>
        </div>
        <span class="${profitClass}">${values.profitable ? "Profitable" : "Not profitable"}</span>
      </div>
      <div class="internal-costing-grid">
        <div><small>Stock cost</small><strong>${money.format(values.stockCost)}</strong></div>
        <div><small>Stock markup %</small><strong>${escapeHtml(quote.markupPercent || 0)}%</strong></div>
        <div><small>Stock markup value</small><strong>${money.format(values.stockMarkup)}</strong></div>
        <div><small>Stock total</small><strong>${money.format(values.stockTotal)}</strong></div>
        <div><small>Consumables cost</small><strong>${money.format(values.consumablesCost)}</strong></div>
        <div><small>Labour cost</small><strong>${money.format(values.labourCost)}</strong></div>
        <div><small>Total costing</small><strong>${money.format(values.costingTotal)}</strong></div>
        <div><small>Total quotation excl. VAT</small><strong>${money.format(values.quoteSubtotalValue)}</strong></div>
        <div><small>Markup + Labour total</small><strong>${money.format(values.markupAndLabourTotal)}</strong></div>
        <div><small>16.08% deduction</small><strong>${money.format(values.deduction16)}</strong></div>
        <div><small>Profit</small><strong>${money.format(values.profit)}</strong></div>
        <div><small>4% calculation</small><strong>${money.format(values.commission4)}</strong></div>
        <div><small>Total quotation profit</small><strong>${money.format(values.totalQuotationProfit)}</strong></div>
        <div><small>Total quotation profit %</small><strong class="${profitPercentageClass(values.totalQuotationProfitPercentage)}">${values.totalQuotationProfitPercentage.toFixed(2)}%</strong></div>
      </div>
    </div>
  `;
}

function processedQuotationHtml(quote) {
  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  const values = quoteCostingValues(quote);
  const auditRows = quoteAuditSummary(quote);
  const documents = quoteDocuments(quote);
  const supplierDocs = supplierQuoteList(quote);
  const lineRows = (quote.items || []).map((item) => `
    <tr>
      <td>${escapeHtml(item.stockCode || "")}</td>
      <td>${escapeHtml(item.description || "")}</td>
      <td>${escapeHtml(item.quantity || 0)}</td>
      <td>${money.format(quoteUnitPrice(quote, item))}</td>
      <td>${money.format(quoteItemTotal(quote, item))}</td>
    </tr>
  `).join("");
  const uploadedDocs = [
    ...supplierDocs.map((doc) => `Supplier quotation: ${doc.name}`),
    ...documents.supplierPop.map((doc) => `Supplier POP: ${doc.name}`),
    ...documents.clientInvoice.map((doc) => `Client invoice: ${doc.name}`),
    ...documents.jobCards.map((doc) => `Job card: ${doc.name}`),
  ];
  return `
    <!doctype html>
    <html>
      <head>
        <title>Processed ${escapeHtml(quote.quoteNumber)}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #17212b; margin: 24px; }
          h1, h2, h3 { margin-bottom: 8px; }
          .logo { width: 190px; display: block; margin: 0 auto 14px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
          .box { border: 1px solid #dce3ea; padding: 8px; border-radius: 6px; }
          .box small { display: block; color: #687585; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #17212b; padding: 7px; text-align: left; }
          th { background: #17212b; color: #fff; }
          .right { text-align: right; }
          .status { display: inline-block; padding: 5px 9px; border-radius: 999px; font-weight: 700; background: ${values.profitable ? "#dff8e9" : "#ffe0dc"}; color: ${values.profitable ? "#0c6b36" : "#9d1c13"}; }
          .profit-percent-good { color: #0c6b36; }
          .profit-percent-warning { color: #b26b00; }
          .profit-percent-danger { color: #9d1c13; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print / Save as PDF</button>
        <img class="logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <h1>Internal Processed Quotation</h1>
        <h2>${escapeHtml(quote.quoteNumber)}</h2>
        <div class="grid">
          <div class="box"><small>Company</small><strong>${escapeHtml(company?.name || "-")}</strong></div>
          <div class="box"><small>Client</small><strong>${escapeHtml(quote.clientName || "-")}</strong></div>
          <div class="box"><small>Sales rep</small><strong>${escapeHtml(salesRep?.name || "-")}</strong></div>
          <div class="box"><small>Approval status</small><strong>${escapeHtml(quote.status || "-")}</strong></div>
          <div class="box"><small>Approved/rejected by</small><strong>${escapeHtml(quote.approvedByName || quote.rejectedByName || quote.decidedByName || "-")}</strong></div>
          <div class="box"><small>Approval date</small><strong>${escapeHtml((quote.approvedDate || quote.decidedAt || "").slice(0, 10) || "-")}</strong></div>
          <div class="box"><small>Client contact</small><strong>${escapeHtml([quote.contactPerson, quote.contactEmail, quote.contactNumber].filter(Boolean).join(" / ") || "-")}</strong></div>
          <div class="box"><small>Profit status</small><strong class="status">${values.profitable ? "Profitable" : "Not profitable"}</strong></div>
        </div>
        <h3>Line items</h3>
        <table>
          <thead><tr><th>Stock Code</th><th>Description</th><th>Qty</th><th>Cost excl. VAT</th><th>Total excl. VAT</th></tr></thead>
          <tbody>${lineRows}</tbody>
          <tfoot><tr><td colspan="4" class="right"><strong>Total excl. VAT</strong></td><td><strong>${money.format(quoteSubtotal(quote))}</strong></td></tr></tfoot>
        </table>
        <h3>Internal costing</h3>
        <div class="grid">
          <div class="box"><small>Stock cost</small><strong>${money.format(values.stockCost)}</strong></div>
          <div class="box"><small>Stock markup %</small><strong>${escapeHtml(quote.markupPercent || 0)}%</strong></div>
          <div class="box"><small>Stock markup value</small><strong>${money.format(values.stockMarkup)}</strong></div>
          <div class="box"><small>Stock total</small><strong>${money.format(values.stockTotal)}</strong></div>
          <div class="box"><small>Consumables cost</small><strong>${money.format(values.consumablesCost)}</strong></div>
          <div class="box"><small>Labour cost</small><strong>${money.format(values.labourCost)}</strong></div>
          <div class="box"><small>Total costing</small><strong>${money.format(values.costingTotal)}</strong></div>
          <div class="box"><small>Total quotation profit</small><strong>${money.format(values.totalQuotationProfit)}</strong></div>
          <div class="box"><small>Total quotation profit %</small><strong class="${profitPercentageClass(values.totalQuotationProfitPercentage)}">${values.totalQuotationProfitPercentage.toFixed(2)}%</strong></div>
          <div class="box"><small>Markup + Labour total</small><strong>${money.format(values.markupAndLabourTotal)}</strong></div>
          <div class="box"><small>16.08% deduction</small><strong>${money.format(values.deduction16)}</strong></div>
          <div class="box"><small>Profit</small><strong>${money.format(values.profit)}</strong></div>
          <div class="box"><small>4% calculation</small><strong>${money.format(values.commission4)}</strong></div>
        </div>
        <h3>Uploaded documents</h3>
        <ul>${uploadedDocs.length ? uploadedDocs.map((doc) => `<li>${escapeHtml(doc)}</li>`).join("") : "<li>No uploaded documents</li>"}</ul>
        <h3>Audit trail summary</h3>
        <ul>${auditRows.length ? auditRows.map((entry) => `<li>${escapeHtml(new Date(entry.timestamp).toLocaleString("en-ZA"))} - ${escapeHtml(entry.userName || entry.user || "-")} - ${escapeHtml(entry.action)} - ${escapeHtml(entry.notes || entry.detail || "")}</li>`).join("") : "<li>No audit activity found for this quotation.</li>"}</ul>
      </body>
    </html>
  `;
}

function clientQuotationHtml(quote) {
  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  const subtotal = quoteSubtotal(quote);
  const vat = subtotal * state.taxRate;
  const total = subtotal + vat;
  const rows = (quote.items || []).map((item) => `
    <tr>
      <td>${escapeHtml(item.stockCode || "")}</td>
      <td>${escapeHtml(item.description || "")}</td>
      <td class="right">${money.format(quoteUnitPrice(quote, item))}</td>
      <td class="right">${escapeHtml(item.quantity || 0)}</td>
      <td class="right">${money.format(quoteItemTotal(quote, item))}</td>
    </tr>
  `).join("");
  return `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(quote.quoteNumber)} Client Quotation</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #17212b; margin: 22px; font-size: 11px; }
          .logo { width: 190px; display: block; margin: 0 auto 8px; }
          .brand, .contact { text-align: center; }
          .rule { border-top: 2px solid #17212b; margin: 10px 0; }
          .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
          .box { border: 1px solid #dce3ea; background: #f3f7f8; padding: 8px; border-radius: 6px; white-space: pre-line; }
          .box small { display: block; font-weight: 800; color: #5d6a78; }
          h1 { text-transform: uppercase; font-size: 18px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #17212b; padding: 7px; }
          th { background: #17212b; color: #fff; text-align: left; }
          .right { text-align: right; }
          .totals { margin-left: auto; width: 280px; }
          .totals div { display: flex; justify-content: space-between; border: 1px solid #17212b; border-top: 0; padding: 7px; }
          .section-title { background: #17212b; color: #fff; padding: 7px; font-weight: 800; }
          .yellow { background: #fff2a8; padding: 3px 6px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print / Save as PDF</button>
        <img class="logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <div class="brand"><strong>${escapeHtml(company?.name || "Interactive Security")}</strong><br><span class="yellow">Reg no: ${escapeHtml(company?.registration || "-")} | VAT No: ${escapeHtml(company?.vat || "-")}</span></div>
        <div class="rule"></div>
        <div class="contact">${escapeHtml(company?.address || "-")}<br>Tel: ${escapeHtml(company?.phone || "-")} / Email: ${escapeHtml(company?.email || "-")} / Website: ${escapeHtml(company?.website || "-")}</div>
        <h1>Quotation</h1>
        <h2>${escapeHtml(quote.quoteNumber)}</h2>
        <div class="meta">
          <div class="box"><small>Client Detail</small><strong>${escapeHtml([quote.clientName, quote.clientAddress].filter(Boolean).join("\n") || "-")}</strong></div>
          <div class="box"><small>Contact Detail</small><strong>${escapeHtml([quote.contactPerson, quote.contactEmail, quote.contactNumber].filter(Boolean).join("\n") || "-")}</strong></div>
          <div class="box"><small>Sales Rep</small><strong>${escapeHtml([salesRep?.name, salesRep?.email, salesRep?.phone].filter(Boolean).join("\n") || "-")}</strong></div>
          <div class="box"><small>Date</small><strong>${escapeHtml(formatDate(quote.quoteDate))}</strong></div>
        </div>
        <div class="section-title">Scope of Work</div>
        <p>${escapeHtml(quote.projectSummary || fixedScopeText)}</p>
        <table>
          <thead><tr><th>Stock Code</th><th>Description</th><th>Cost Per Unit Excl. VAT</th><th>Quantity</th><th>Total Cost Excl. VAT</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5">No line items</td></tr>`}</tbody>
        </table>
        <div class="totals">
          <div><span>Subtotal</span><strong>${money.format(subtotal)}</strong></div>
          <div><span>VAT 15%</span><strong>${money.format(vat)}</strong></div>
          <div><span>Total</span><strong>${money.format(total)}</strong></div>
        </div>
        <h3>Terms</h3>
        <p>${escapeHtml(quote.termsText || "")}</p>
        <h3>Banking Details</h3>
        <p><strong>Bank:</strong> ${escapeHtml(company?.bankName || "-")}<br><strong>Account Holder:</strong> ${escapeHtml(company?.name || "-")}<br><strong>Account Type:</strong> ${escapeHtml(company?.accountType || "-")}<br><strong>Account Number:</strong> ${escapeHtml(company?.accountNumber || "-")}<br><strong>Branch Code:</strong> ${escapeHtml(company?.branchCode || "-")}</p>
        <p><strong>Please use quotation number ${escapeHtml(quote.quoteNumber)} as your reference.</strong></p>
      </body>
    </html>
  `;
}

function openClientQuotation(quoteId) {
  const quote = loadApprovals().find((item) => item.id === quoteId);
  if (!quote) return;
  const win = window.open("", "_blank");
  if (!win) {
    alert("The client quotation could not be opened. Please allow pop-ups.");
    return;
  }
  win.document.write(clientQuotationHtml(quote));
  win.document.close();
  writeAudit("Opened client quotation", quote.quoteNumber, "Client Quotation", quote.quoteNumber, "Client-facing print/download view");
}

function openProcessedQuotation(quoteId) {
  if (!canSeeInternalCosting()) {
    alert("You do not have access to internal processed quotations.");
    return;
  }
  const quote = loadApprovals().find((item) => item.id === quoteId);
  if (!quote) return;
  const win = window.open("", "_blank");
  if (!win) {
    alert("The processed quotation could not be opened. Please allow pop-ups for this local file.");
    return;
  }
  win.document.write(processedQuotationHtml(quote));
  win.document.close();
  writeAudit("Opened internal processed quotation", quote.quoteNumber, "Internal Processed Quotation", quote.quoteNumber, "Print/download view");
}

function openBlobFile(file, downloadName = "") {
  const fileUrl = URL.createObjectURL(file);
  const opened = window.open(fileUrl, "_blank", "noopener");
  if (!opened && downloadName) {
    downloadBlobFile(file, downloadName);
  }
}

function downloadBlobFile(file, downloadName) {
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = downloadName || "document";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
}

async function saveLibraryDocumentFile(fileId, file) {
  const db = await openSupplierQuoteDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(libraryDocumentStoreName, "readwrite");
    transaction.objectStore(libraryDocumentStoreName).put({
      fileId,
      file,
      savedAt: new Date().toISOString(),
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function loadLibraryDocumentFile(fileId) {
  const db = await openSupplierQuoteDb();
  const record = await new Promise((resolve, reject) => {
    const transaction = db.transaction(libraryDocumentStoreName, "readonly");
    const request = transaction.objectStore(libraryDocumentStoreName).get(fileId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record;
}

async function openLibraryDocument(fileId, mode) {
  try {
    const record = await loadLibraryDocumentFile(fileId);
    if (!record?.file) {
      alert("This uploaded document could not be found in this local browser.");
      return;
    }

    if (mode === "download") {
      downloadBlobFile(record.file, record.file.name);
    } else {
      openBlobFile(record.file, record.file.name);
    }
  } catch {
    alert("This uploaded document could not be opened.");
  }
}

function scopeText() {
  return [fixedScopeText, fields.projectSummary.value.trim()].filter(Boolean).join("\n\n");
}

function addDays(dateValue, days) {
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(dateValue) {
  if (!dateValue) return "Set date";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatDateObject(date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function todayInputValue() {
  const date = new Date();
  return dateInputValue(date);
}

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function quoteYear(dateValue) {
  return (dateValue || todayInputValue()).slice(0, 4);
}

function reserveQuoteNumber(dateValue) {
  const year = quoteYear(dateValue);
  const key = `${quoteSequencePrefix}-${year}`;
  const nextSequence = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(nextSequence));
  return `Q-${year}-${String(nextSequence).padStart(4, "0")}`;
}

function resetQuoteForm() {
  state.revisingQuoteId = "";
  state.revisionSourceId = "";
  state.activeSalesRequestId = "";
  state.revisionNumber = 0;
  fields.selectedCompany.value = "";
  fields.clientName.value = "";
  fields.clientAddress.value = "";
  fields.contactPerson.value = "";
  fields.contactEmail.value = "";
  fields.contactNumber.value = "";
  fields.quoteDate.value = todayInputValue();
  fields.validityDays.value = "30";
  fields.validUntil.value = dateInputValue(addDays(fields.quoteDate.value, 30));
  fields.quoteNumber.value = reserveQuoteNumber(fields.quoteDate.value);
  fields.projectSummary.value = "";
  fields.termsText.value = "";
  fields.salesRep.value = "";
  fields.markupPercent.value = "20";
  supplierQuoteUpload.value = "";
  state.supplierQuote = null;
  state.supplierQuotes = [];
  state.supplierQuoteFiles = [];
  state.costing = { stockCost: 0, consumablesCost: 0, labourCost: 0 };
  state.items = [{ stockCode: "", description: "", quantity: 1, supplierCost: 0 }];
  refreshAutoTerms();
  updateSupplierQuoteDisplay();
  renderSalesRequestDocuments(null);
  renderSalesRequestSummary(null);
  renderAll();
}

function buildTerms() {
  const client = fields.clientName.value || "the client";
  const days = Math.max(1, Number(fields.validityDays.value || 30));
  fields.validUntil.value = dateInputValue(addDays(fields.quoteDate.value, days));
  const validUntil = formatDate(fields.validUntil.value);
  const instruction = fields.aiInstruction.value.trim();
  const instructionText = instruction ? ` Additional focus: ${instruction}` : "";

  return `This quotation is valid until ${validUntil}. A 70% deposit is required before work can be done. Pricing excludes work outside the agreed scope unless approved in writing by ${client}. Final delivery depends on timely access to required information and approvals.${instructionText}`;
}

function isAutoTerms(value = "") {
  return (
    !value.trim() ||
    value.includes("This quotation is valid for 7 days") ||
    value.includes("This quotation is valid until") ||
    value.includes("A 70% deposit is required") ||
    value.includes("Pricing excludes work outside the agreed scope")
  );
}

function refreshAutoTerms() {
  if (isAutoTerms(fields.termsText.value)) {
    fields.termsText.value = buildTerms();
  }
}

function clearValidation() {
  document.querySelectorAll(".field-error").forEach((element) => {
    element.classList.remove("field-error");
    element.removeAttribute("aria-invalid");
  });
  validationSummary.hidden = true;
  validationSummary.textContent = "";
}

function currentSession() {
  try {
    return JSON.parse(localStorage.getItem(sharedSessionDetailsKey) || "null");
  } catch {
    localStorage.removeItem(sharedSessionDetailsKey);
    return null;
  }
}

function currentUser() {
  return (
    currentSession()?.email ||
    localStorage.getItem(sharedSessionStorageKey) ||
    sessionStorage.getItem(sessionStorageKey) ||
    ""
  );
}

function isSignedIn() {
  return Boolean(currentUser());
}

function saveSharedSession(member, email) {
  const normalizedEmail = normalizeEmail(email || member?.email || "");
  const session = {
    userId: member?.id || slugify(normalizedEmail),
    email: normalizedEmail,
    name: member?.name || displayNameFromUser(normalizedEmail),
    role: member?.access || "Admin",
    permissions: member?.permissions || Array.from(memberPermissions(member || { email: normalizedEmail, access: "Admin", id: slugify(normalizedEmail) })),
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(sharedSessionStorageKey, normalizedEmail);
  localStorage.setItem(sharedSessionDetailsKey, JSON.stringify(session));
  sessionStorage.setItem(sessionStorageKey, normalizedEmail);
  return session;
}

function saveSharedSessionObject(session) {
  if (!session?.email) return null;
  const normalizedEmail = normalizeEmail(session.email);
  const normalizedSession = {
    userId: session.userId || slugify(normalizedEmail),
    email: normalizedEmail,
    name: session.name || displayNameFromUser(normalizedEmail),
    role: session.role || session.access || "Admin",
    permissions: session.permissions || [],
    signedInAt: session.signedInAt || new Date().toISOString(),
  };
  localStorage.setItem(sharedSessionStorageKey, normalizedEmail);
  localStorage.setItem(sharedSessionDetailsKey, JSON.stringify(normalizedSession));
  sessionStorage.setItem(sessionStorageKey, normalizedEmail);
  return normalizedSession;
}

function encodeSessionForHub() {
  const session = currentSession();
  if (!session?.email) return "";
  return btoa(unescape(encodeURIComponent(JSON.stringify(session))));
}

function decodeSessionFromHub(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
}

function urlWithSso(url) {
  const token = encodeSessionForHub();
  if (!token) return url;
  const hashIndex = url.indexOf("#");
  const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const separator = beforeHash.includes("?") ? "&" : "?";
  return `${beforeHash}${separator}sso=${encodeURIComponent(token)}${hash}`;
}

function hydrateSharedSessionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("sso");
  if (token) {
    const session = decodeSessionFromHub(token);
    if (session?.email) {
      saveSharedSessionObject(session);
    }
    params.delete("sso");
    const query = params.toString();
    const cleanedUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanedUrl);
    return;
  }

  const legacyUser = sessionStorage.getItem(sessionStorageKey);
  if (legacyUser && !currentSession()) {
    const member = memberByEmail(legacyUser);
    saveSharedSession(member, legacyUser);
  }
}

function isQuotationHubSsoRoute() {
  return window.location.pathname === "/hubs/quotation-hub/sso-login";
}

async function consumeHubSsoTokenIfPresent() {
  if (!isQuotationHubSsoRoute()) return false;
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  console.log("Token received by Quote Hub", { token });
  if (!token) {
    showSsoExpiredMessage("token not found");
    return true;
  }
  try {
    const response = await fetch("/api/sso/consume-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ hubSlug: "quotation-hub", token }),
    });
    const data = await response.json().catch(() => ({}));
    console.log("SSO token validation result", { ok: response.ok, data });
    if (!response.ok || !data.user) {
      showSsoExpiredMessage(data.error || "token validation failed");
      return true;
    }
    saveSharedSessionObject({
      userId: data.user.userId,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
    });
    console.log("Quote Hub session created", data.user);
    window.location.replace("/hubs/quotation-hub#dashboard");
    return true;
  } catch (error) {
    console.warn("SSO token validation failed", error);
    showSsoExpiredMessage("token validation failed");
    return true;
  }
}

function showSsoExpiredMessage(reason) {
  console.warn("SSO failed", reason);
  loginScreen.hidden = false;
  loginForm.innerHTML = `
    <div class="brand login-brand">
      <img class="brand-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
      <div>
        <strong>Interactive Security Portal</strong>
        <small>Secure hub login</small>
      </div>
    </div>
    <h1>Hub login expired</h1>
    <p>Your secure hub login link has expired. Please return to the Main Interactive Hub and open the hub again.</p>
    <p class="login-note">Debug reason: ${escapeHtml(reason || "unknown")}</p>
    <button class="primary-btn" type="button" onclick="window.location.href='/'">Return to Main Interactive Hub</button>
  `;
}

function clearSharedSession() {
  localStorage.removeItem(sharedSessionStorageKey);
  localStorage.removeItem(sharedSessionDetailsKey);
  sessionStorage.removeItem(sessionStorageKey);
}

async function syncBackendLogin(session) {
  if (!session?.email || window.location.protocol === "file:") return null;
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(session),
    });
    if (!response.ok) throw new Error(`Auth sync failed: ${response.status}`);
    const data = await response.json();
    console.log("Backend session created", data.user);
    return data.user;
  } catch (error) {
    console.warn("Backend session could not be created", error);
    return null;
  }
}

function currentUserName() {
  const user = currentUser();
  const member = storageList(membersStorageKey).find((item) => normalizeEmail(item.email) === normalizeEmail(user));
  return member?.name || displayNameFromUser(user);
}

function displayNameFromUser(user = "") {
  if (!user.includes("@")) return user || "staff member";

  return user
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function internalRejectionLabel(quote) {
  const rejectedBy = quote.rejectedByName || quote.decidedByName || displayNameFromUser(quote.decidedBy || quote.rejectedByUserId);
  return `Rejected by ${rejectedBy}`;
}

function internalApprovalLabel(quote) {
  const approvedBy = quote.approvedByName || quote.decidedByName || displayNameFromUser(quote.decidedBy || quote.approvedByUserId);
  return `Approved by ${approvedBy}`;
}

function storageList(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveStorageList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function seedPortalTables() {
  const existingHubs = storageList(hubsStorageKey);
  if (!existingHubs.some((hub) => hub.slug === "quotation-hub")) {
    saveStorageList(hubsStorageKey, [
      ...existingHubs,
      {
        id: "quotation-hub",
        name: "Interactive Security Quote Hub",
        slug: "quotation-hub",
        description: "Create, manage, approve and track quotations",
        url: `${window.location.href.split("#")[0]}#dashboard`,
        icon: "./interactive-security-logo.jpg",
        status: "active",
        opensInNewTab: true,
        sortOrder: 1,
      },
    ]);
  }

  if (!localStorage.getItem(hubPermissionsStorageKey)) {
    saveStorageList(hubPermissionsStorageKey, [
      { hubSlug: "quotation-hub", accessLevel: "Admin" },
      { hubSlug: "quotation-hub", accessLevel: "Full Access Member" },
      { hubSlug: "quotation-hub", accessLevel: "Quotation Builder Only" },
    ]);
  }

  if (!localStorage.getItem(userHubAccessStorageKey)) {
    saveStorageList(userHubAccessStorageKey, []);
  }

  if (!localStorage.getItem(hubActivitySummaryStorageKey)) {
    saveStorageList(hubActivitySummaryStorageKey, []);
  }
  if (!localStorage.getItem(userPermissionsStorageKey)) {
    saveStorageList(userPermissionsStorageKey, []);
  }
  if (!localStorage.getItem(quotationSettingsStorageKey)) {
    localStorage.setItem(quotationSettingsStorageKey, JSON.stringify({ profitDeductionPercent: 16.08, commissionPercent: 4 }));
  }
  if (window.location.protocol !== "file:") {
    const hubs = storageList(hubsStorageKey);
    const quoteHub = hubs.find((hub) => hub.slug === "quotation-hub");
    if (quoteHub) {
      quoteHub.url = `${window.location.origin}/hubs/quotation-hub`;
      saveStorageList(hubsStorageKey, hubs);
    }
  }
}

function renderPermissionChecklist(selectedKeys = []) {
  const selected = new Set(selectedKeys);
  memberPermissionChecklist.innerHTML = `<legend>Allowed tabs/pages</legend>` + permissionDefinitions.map((permission) => `
    <label class="permission-option">
      <input type="checkbox" value="${escapeHtml(permission.key)}" ${selected.has(permission.key) ? "checked" : ""} />
      ${escapeHtml(permission.label)}
    </label>
  `).join("");
}

function selectedPermissionKeys() {
  return Array.from(memberPermissionChecklist.querySelectorAll("input[type='checkbox']:checked")).map((input) => input.value);
}

function saveUserPermissions(member) {
  const selected = new Set(member.permissions || []);
  const existing = storageList(userPermissionsStorageKey).filter((permission) => permission.user_id !== member.id);
  const timestamp = new Date().toISOString();
  const records = permissionDefinitions.map((permission) => ({
    id: `${member.id}-${permission.key}`,
    user_id: member.id,
    user_email: member.email,
    permission_key: permission.key,
    can_access: selected.has(permission.key),
    created_at: timestamp,
    updated_at: timestamp,
  }));
  saveStorageList(userPermissionsStorageKey, [...existing, ...records]);
}

function objectToList(object) {
  return Object.entries(object).map(([id, value]) => ({ id, ...value }));
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
}

function normalizeEmail(value = "") {
  return value.trim().toLowerCase();
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((byte) => alphabet[byte % alphabet.length]).join("");
}

function memberByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return storageList(membersStorageKey).find((member) => normalizeEmail(member.email) === normalizedEmail);
}

function loginLink() {
  return `${window.location.href.split("#")[0]}#builder`;
}

function sendInviteEmail(member, temporaryPassword, isResend = false) {
  const subject = `${isResend ? "Resent invite" : "Invite"}: Interactive Security Quote Hub`;
  const body = [
    `Hello ${member.name},`,
    "",
    "You have been invited to sign in to Interactive Security Quote Hub.",
    "",
    `Login link: ${loginLink()}`,
    `Email address: ${member.email}`,
    `Temporary password: ${temporaryPassword}`,
    "",
    "Please sign in using the details above. You will be asked to change your temporary password on first login.",
    "",
    "Interactive Security",
  ].join("\n");
  const mailto = `mailto:${encodeURIComponent(member.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function saveMemberRecord(member) {
  const members = storageList(membersStorageKey);
  const index = members.findIndex((item) => item.id === member.id);
  if (index >= 0) members[index] = member;
  else members.push(member);
  saveStorageList(membersStorageKey, members);
}

function loadSalesRepsFromStorage() {
  const saved = storageList(salesRepsStorageKey, objectToList(salesReps));
  salesReps = saved.reduce((acc, rep) => {
    acc[rep.id] = { name: rep.name, email: rep.email, phone: rep.phone };
    return acc;
  }, {});
}

function salesRepsList() {
  return objectToList(salesReps);
}

function renderSalesRepOptions() {
  fields.salesRep.innerHTML = `<option value="">Select sales rep</option>`;
  salesRepsList().forEach((rep) => {
    const option = document.createElement("option");
    option.value = rep.id;
    option.textContent = rep.name;
    fields.salesRep.appendChild(option);
  });
}

function currentMember() {
  const email = normalizeEmail(currentUser());
  if (!email) {
    return {
      id: "",
      name: "",
      email: "",
      access: "Guest",
    };
  }
  const members = storageList(membersStorageKey);
  const member = members.find((item) => normalizeEmail(item.email) === email);
  return member || {
    id: slugify(email),
    name: currentUserName(),
    email,
    access: "Admin",
  };
}

function permissionKeyForSection(section) {
  return {
    portal: "quotation_hub",
    dashboard: "dashboard",
    builder: "build_quotation",
    approvals: "approval",
    approval: "approval",
    library: "quote_library",
    settings: "setup",
    audit: "audit_trail",
    salesRequests: "sales_quotation_requests",
  }[section] || section;
}

function memberPermissions(member = currentMember()) {
  const defaults = roleDefaultPermissions[member.access] || ["build_quotation", "quotation_hub"];
  const explicit = Array.isArray(member.permissions) ? member.permissions : null;
  const stored = storageList(userPermissionsStorageKey)
    .filter((permission) => permission.user_id === member.id || normalizeEmail(permission.user_email) === normalizeEmail(member.email))
    .filter((permission) => permission.can_access)
    .map((permission) => permission.permission_key);
  return new Set(explicit || (stored.length ? stored : defaults));
}

function hasPermission(permissionKey, member = currentMember()) {
  if (!isSignedIn()) return false;
  if (["Super Admin"].includes(member.access)) return true;
  return memberPermissions(member).has(permissionKey);
}

function canAccess(section) {
  if (!isSignedIn()) return false;
  if (section === "portal") return hasPermission("quotation_hub");
  if (section === "settings") return ["setup", "supplier_prices", "member_access_management"].some((permission) => hasPermission(permission));
  const permissionKey = permissionKeyForSection(section);
  return hasPermission(permissionKey);
}

function enforceAccess(section) {
  if (canAccess(section)) return true;
  alert(isSignedIn() ? "Access denied" : "Please sign in to continue.");
  if (isSignedIn()) showSection("portal");
  else loginScreen.hidden = false;
  return false;
}

function applyPermissions() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    const allowed = canAccess(button.dataset.section);
    button.hidden = !allowed;
    button.disabled = !allowed;
  });
  document.body.classList.toggle("has-quotation-hub-access", hasPermission("quotation_hub"));
}

function loadAudit() {
  try {
    return JSON.parse(localStorage.getItem(auditStorageKey) || "[]");
  } catch {
    localStorage.removeItem(auditStorageKey);
    return [];
  }
}

function moduleFromAction(action = "") {
  const normalized = action.toLowerCase();
  if (normalized.includes("sign")) return "Authentication";
  if (normalized.includes("approval") || normalized === "approved" || normalized === "rejected") return "Approval";
  if (normalized.includes("library") || normalized.includes("client approved") || normalized.includes("client rejected") || normalized.includes("document")) return "Quote Library";
  if (normalized.includes("member")) return "Setup - Member access";
  if (normalized.includes("sales rep")) return "Setup - Sales reps";
  if (normalized.includes("supplier")) return "Setup - Supplier prices";
  if (normalized.includes("client")) return "Setup - Client information";
  if (normalized.includes("quotation")) return "Build Quotation";
  return "System";
}

function writeAudit(action, detail, module = moduleFromAction(action), reference = detail, notes = "") {
  const audit = loadAudit();
  audit.unshift({
    action,
    detail,
    module,
    reference,
    notes,
    user: currentUser(),
    userName: currentUserName(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(auditStorageKey, JSON.stringify(audit.slice(0, 200)));
  if (document.body.dataset.activeSection === "audit") renderAudit();
}

function auditMemberOptions() {
  const members = storageList(membersStorageKey);
  const auditUsers = loadAudit().map((entry) => ({
    email: entry.user,
    name: entry.userName || displayNameFromUser(entry.user),
  }));
  const unique = new Map();
  [...members, ...auditUsers].forEach((member) => {
    if (!member.email) return;
    unique.set(member.email.toLowerCase(), {
      email: member.email,
      name: member.name || displayNameFromUser(member.email),
    });
  });
  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function renderAuditMemberFilter() {
  const currentValue = auditMemberFilter.value;
  auditMemberFilter.innerHTML = `<option value="">All members</option>`;
  auditMemberOptions().forEach((member) => {
    const option = document.createElement("option");
    option.value = member.email;
    option.textContent = member.name;
    auditMemberFilter.appendChild(option);
  });
  auditMemberFilter.value = currentValue;
}

function filteredAuditRows() {
  const selectedMember = auditMemberFilter.value.toLowerCase();
  const singleDate = auditSingleDate.value;
  const fromDate = auditFromDate.value;
  const toDate = auditToDate.value;

  return loadAudit().filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    const entryDateValue = entryDate.toISOString().slice(0, 10);
    const memberMatch = !selectedMember || entry.user?.toLowerCase() === selectedMember;
    const singleDateMatch = !singleDate || entryDateValue === singleDate;
    const fromDateMatch = singleDate || !fromDate || entryDateValue >= fromDate;
    const toDateMatch = singleDate || !toDate || entryDateValue <= toDate;
    return memberMatch && singleDateMatch && fromDateMatch && toDateMatch;
  });
}

function renderAudit(rows = null) {
  if (!canAccess("audit")) return;
  renderAuditMemberFilter();
  const audit = rows || (state.auditReportRows.length ? state.auditReportRows : loadAudit());
  state.auditReportRows = audit;
  auditList.innerHTML = "";
  if (!audit.length) {
    auditList.innerHTML = `<p class="empty-state">No audit activity matches the selected filters.</p>`;
    return;
  }

  auditList.innerHTML = `
    <div class="audit-table">
      <div class="audit-table-header">
        <span>Date and time</span>
        <span>Member name</span>
        <span>Action performed</span>
        <span>Module/tab affected</span>
        <span>Reference</span>
        <span>Details/notes</span>
      </div>
      <div id="auditRows"></div>
    </div>
  `;
  const auditRows = auditList.querySelector("#auditRows");
  audit.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "audit-table-row";
    row.innerHTML = `
      <span>${escapeHtml(new Date(entry.timestamp).toLocaleString("en-ZA"))}</span>
      <span>${escapeHtml(entry.userName || displayNameFromUser(entry.user))}</span>
      <span>${escapeHtml(entry.action)}</span>
      <span>${escapeHtml(entry.module || moduleFromAction(entry.action))}</span>
      <span>${escapeHtml(entry.reference || entry.detail || "-")}</span>
      <span>${escapeHtml(entry.notes || entry.detail || "-")}</span>
    `;
    auditRows.appendChild(row);
  });
}

function csvEscape(value = "") {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportAuditCsv() {
  if (!enforceAccess("audit")) return;
  const rows = state.auditReportRows.length ? state.auditReportRows : filteredAuditRows();
  const headers = ["Date and time", "Member name", "Action performed", "Module/tab affected", "Reference", "Details/notes"];
  const csvRows = rows.map((entry) => [
    new Date(entry.timestamp).toLocaleString("en-ZA"),
    entry.userName || displayNameFromUser(entry.user),
    entry.action,
    entry.module || moduleFromAction(entry.action),
    entry.reference || entry.detail || "-",
    entry.notes || entry.detail || "-",
  ].map(csvEscape).join(","));
  const csv = [headers.map(csvEscape).join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlobFile(blob, `audit-report-${todayInputValue()}.csv`);
  writeAudit("Exported audit report", `${rows.length} rows`, "Audit Trail", "Audit report", "CSV export");
}

function monthInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthDateRange(monthValue = monthInputValue()) {
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    from: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
    to: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
  };
}

function dashboardRange() {
  const monthRange = monthDateRange(dashboardMonth.value || monthInputValue());
  return {
    from: dashboardFromDate.value || monthRange.from,
    to: dashboardToDate.value || monthRange.to,
  };
}

function quoteReportDate(quote) {
  return (quote.quoteDate || quote.submittedAt || quote.decidedAt || quote.approvedDate || "").slice(0, 10);
}

function quoteTotalValue(quote) {
  return quoteSubtotal(quote) * (1 + state.taxRate);
}

function dashboardQuotes() {
  const { from, to } = dashboardRange();
  return loadApprovals().filter((quote) => {
    const date = quoteReportDate(quote);
    return date && date >= from && date <= to;
  });
}

function isInternallyApproved(quote) {
  return ["approved", "sent_to_client", "client_accepted", "client_declined"].includes(normalizedStatus(quote.status));
}

function isClientAccepted(quote) {
  return normalizedStatus(quote.status) === "client_accepted" || quote.clientOutcome === "Approved by client";
}

function isOutstandingClientApproval(quote) {
  return isInternallyApproved(quote) && !["client_accepted", "client_declined"].includes(normalizedStatus(quote.status)) && !["Approved by client", "Rejected by client"].includes(quote.clientOutcome);
}

function salesRepNameForQuote(quote) {
  return salesReps[quote.salesRep]?.name || "Unknown";
}

function dashboardData() {
  const quotes = dashboardQuotes();
  const approved = quotes.filter(isInternallyApproved);
  const accepted = quotes.filter(isClientAccepted);
  const outstanding = quotes.filter(isOutstandingClientApproval);
  const bySalesRep = new Map();

  quotes.forEach((quote) => {
    const rep = salesRepNameForQuote(quote);
    const current = bySalesRep.get(rep) || {
      salesRep: rep,
      quotationCount: 0,
      totalValue: 0,
      acceptedCount: 0,
      acceptedValue: 0,
    };
    current.quotationCount += 1;
    current.totalValue += quoteTotalValue(quote);
    if (isClientAccepted(quote)) {
      current.acceptedCount += 1;
      current.acceptedValue += quoteTotalValue(quote);
    }
    bySalesRep.set(rep, current);
  });

  return {
    quotes,
    approved,
    accepted,
    outstanding,
    bySalesRep: Array.from(bySalesRep.values()).sort((a, b) => a.salesRep.localeCompare(b.salesRep)),
    totalValue: quotes.reduce((sum, quote) => sum + quoteTotalValue(quote), 0),
    acceptedValue: accepted.reduce((sum, quote) => sum + quoteTotalValue(quote), 0),
  };
}

function renderSummaryCard(label, value) {
  return `<article class="dashboard-summary-card"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></article>`;
}

function renderBarChart(target, rows, valueKey, labelKey, formatter = (value) => value) {
  target.innerHTML = "";
  if (!rows.length) {
    target.innerHTML = `<p class="empty-state">No data for selected range.</p>`;
    return;
  }
  const max = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);
  rows.forEach((row) => {
    const value = Number(row[valueKey] || 0);
    const bar = document.createElement("div");
    bar.className = "dashboard-bar-row";
    bar.innerHTML = `
      <span>${escapeHtml(row[labelKey])}</span>
      <div><i style="width:${Math.max((value / max) * 100, value ? 4 : 0)}%"></i></div>
      <strong>${escapeHtml(formatter(value))}</strong>
    `;
    target.appendChild(bar);
  });
}

function tableHtml(headers, rows) {
  if (!rows.length) return `<p class="empty-state">No data for selected range.</p>`;
  return `
    <div class="dashboard-data-table">
      <div class="dashboard-data-header" style="grid-template-columns: repeat(${headers.length}, minmax(0, 1fr));">
        ${headers.map((header) => `<span>${escapeHtml(header)}</span>`).join("")}
      </div>
      ${rows.map((row) => `
        <div class="dashboard-data-row" style="grid-template-columns: repeat(${headers.length}, minmax(0, 1fr));">
          ${row.map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderDashboard() {
  if (!canAccess("dashboard")) return;
  if (!dashboardMonth.value) dashboardMonth.value = monthInputValue();
  const data = dashboardData();
  dashboardSummary.innerHTML = [
    renderSummaryCard("Total quotations created", String(data.quotes.length)),
    renderSummaryCard("Approved internally", String(data.approved.length)),
    renderSummaryCard("Accepted by clients", String(data.accepted.length)),
    renderSummaryCard("Outstanding client approval", String(data.outstanding.length)),
    renderSummaryCard("Total quoted value", money.format(data.totalValue)),
    renderSummaryCard("Accepted income/value", money.format(data.acceptedValue)),
  ].join("");

  renderBarChart(approvedAcceptedChart, [
    { label: "Approved internally", value: data.approved.length },
    { label: "Accepted by clients", value: data.accepted.length },
  ], "value", "label", String);
  renderBarChart(salesRepQuoteChart, data.bySalesRep, "quotationCount", "salesRep", String);
  renderBarChart(salesRepValueChart, data.bySalesRep, "totalValue", "salesRep", (value) => money.format(value));

  salesRepTotalsTable.innerHTML = tableHtml(
    ["Sales rep", "Quotations", "Total value", "Accepted value"],
    data.bySalesRep.map((row) => [row.salesRep, String(row.quotationCount), money.format(row.totalValue), money.format(row.acceptedValue)])
  );
  outstandingClientTable.innerHTML = tableHtml(
    ["Quote", "Client", "Sales rep", "Value", "Date"],
    data.outstanding.map((quote) => [quote.quoteNumber, quote.clientName || "-", salesRepNameForQuote(quote), money.format(quoteTotalValue(quote)), formatDate(quote.quoteDate)])
  );
}

function isManagementPortalUser() {
  return ["Admin", "Super Admin"].includes(currentMember().access) || hasPermission("reports");
}

function hasHubAccess(hub) {
  if (!isSignedIn()) return false;
  if (!hub || hub.status !== "active") return false;
  const member = currentMember();
  if ((member.inviteStatus || "") === "Disabled") return false;

  const explicitAccess = storageList(userHubAccessStorageKey).find((access) => (
    access.hubSlug === hub.slug && normalizeEmail(access.email) === normalizeEmail(member.email)
  ));
  if (explicitAccess) return explicitAccess.status === "active";

  if (hub.slug === "quotation-hub") return hasPermission("quotation_hub", member);
  if (hub.slug === "cost-hub") return hasPermission("cost_hub", member);
  return storageList(hubPermissionsStorageKey).some((permission) => (
    permission.hubSlug === hub.slug && permission.accessLevel === member.access
  ));
}

function portalQuotes() {
  const quotes = loadApprovals();
  if (isManagementPortalUser()) return quotes;
  const email = normalizeEmail(currentUser());
  const memberName = currentUserName();
  return quotes.filter((quote) => {
    const rep = salesReps[quote.salesRep];
    return normalizeEmail(rep?.email || "") === email || quote.createdBy === email || quote.submittedBy === email || quote.decidedBy === email || salesRepNameForQuote(quote) === memberName;
  });
}

function portalData() {
  const quotes = portalQuotes();
  const pending = quotes.filter(isApprovalPendingQuote);
  const approved = quotes.filter(isInternallyApproved);
  const rejected = quotes.filter((quote) => normalizedStatus(quote.status) === "rejected");
  const accepted = quotes.filter(isClientAccepted);
  const byMonth = new Map();
  const bySalesRep = new Map();

  quotes.forEach((quote) => {
    const month = (quoteReportDate(quote) || todayInputValue()).slice(0, 7);
    const monthRow = byMonth.get(month) || { month, count: 0, value: 0 };
    monthRow.count += 1;
    monthRow.value += quoteTotalValue(quote);
    byMonth.set(month, monthRow);

    const rep = salesRepNameForQuote(quote);
    const repRow = bySalesRep.get(rep) || { salesRep: rep, total: 0, pending: 0, approved: 0, rejected: 0, accepted: 0, value: 0 };
    repRow.total += 1;
    repRow.pending += pending.includes(quote) ? 1 : 0;
    repRow.approved += approved.includes(quote) ? 1 : 0;
    repRow.rejected += rejected.includes(quote) ? 1 : 0;
    repRow.accepted += accepted.includes(quote) ? 1 : 0;
    repRow.value += quoteTotalValue(quote);
    bySalesRep.set(rep, repRow);
  });

  return {
    quotes,
    pending,
    approved,
    rejected,
    accepted,
    totalValue: quotes.reduce((sum, quote) => sum + quoteTotalValue(quote), 0),
    acceptedValue: accepted.reduce((sum, quote) => sum + quoteTotalValue(quote), 0),
    byMonth: Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6),
    bySalesRep: Array.from(bySalesRep.values()).sort((a, b) => a.salesRep.localeCompare(b.salesRep)),
  };
}

function renderPortal() {
  const hubs = storageList(hubsStorageKey)
    .filter((hub) => hub.status === "active")
    .sort((a, b) => Number(a.sortOrder || 99) - Number(b.sortOrder || 99));
  const accessibleHubs = hubs.filter(hasHubAccess);
  const data = portalData();

  portalHubGrid.innerHTML = accessibleHubs.length
    ? accessibleHubs.map((hub) => `
      <article class="hub-card">
        <img src="${escapeHtml(hub.icon || "./interactive-security-logo.jpg")}" alt="${escapeHtml(hub.name)}" />
        <div>
          <strong>${escapeHtml(hub.name)}</strong>
          <p>${escapeHtml(hub.description)}</p>
          <span class="status-badge status-complete">Active</span>
        </div>
        <button class="primary-btn" type="button" data-open-hub="${escapeHtml(hub.slug)}">Open hub</button>
      </article>
    `).join("")
    : `<p class="empty-state">No hubs are available for your access level yet.</p>`;

  portalSummaryTitle.textContent = isManagementPortalUser() ? "Management overview" : "My quotation activity";
  portalSummaryGrid.innerHTML = [
    renderSummaryCard("Total quotations", String(data.quotes.length)),
    renderSummaryCard("Pending quotations", String(data.pending.length)),
    renderSummaryCard("Approved quotations", String(data.approved.length)),
    renderSummaryCard("Rejected quotations", String(data.rejected.length)),
    renderSummaryCard("Accepted by clients", String(data.accepted.length)),
    renderSummaryCard("Income totals", money.format(data.acceptedValue)),
  ].join("");

  renderBarChart(portalMonthlyChart, data.byMonth, "value", "month", (value) => money.format(value));
  portalSalesRepTable.innerHTML = tableHtml(
    ["Sales rep", "Total", "Pending", "Approved", "Rejected", "Accepted", "Value"],
    data.bySalesRep.map((row) => [row.salesRep, String(row.total), String(row.pending), String(row.approved), String(row.rejected), String(row.accepted), money.format(row.value)])
  );

  saveStorageList(hubActivitySummaryStorageKey, [{
    hubSlug: "quotation-hub",
    generatedAt: new Date().toISOString(),
    generatedFor: currentUser(),
    scope: isManagementPortalUser() ? "management" : "member",
    totalQuotations: data.quotes.length,
    pendingQuotations: data.pending.length,
    approvedQuotations: data.approved.length,
    rejectedQuotations: data.rejected.length,
    acceptedByClient: data.accepted.length,
    incomeTotal: data.acceptedValue,
  }]);
}

function exportDashboardCsv(type = "all") {
  if (!enforceAccess("dashboard")) return;
  const data = dashboardData();
  let headers = [];
  let rows = [];
  let filename = "dashboard-report";

  if (type === "sales") {
    filename = "sales-rep-dashboard-report";
    headers = ["Sales rep", "Total quotations", "Total quotation value", "Accepted quotation value"];
    rows = data.bySalesRep.map((row) => [row.salesRep, row.quotationCount, row.totalValue, row.acceptedValue]);
  } else if (type === "outstanding") {
    filename = "outstanding-client-approval-report";
    headers = ["Quote number", "Client", "Sales rep", "Value", "Date"];
    rows = data.outstanding.map((quote) => [quote.quoteNumber, quote.clientName || "", salesRepNameForQuote(quote), quoteTotalValue(quote), quoteReportDate(quote)]);
  } else {
    filename = "dashboard-report";
    headers = ["Metric", "Value"];
    rows = [
      ["Total quotations created", data.quotes.length],
      ["Total quotations approved internally", data.approved.length],
      ["Total quotations accepted by clients", data.accepted.length],
      ["Total quotations outstanding for client approval", data.outstanding.length],
      ["Total quoted value", data.totalValue],
      ["Total accepted income/value", data.acceptedValue],
      [],
      ["Sales rep", "Total quotations", "Total quotation value", "Accepted quotation value"],
      ...data.bySalesRep.map((row) => [row.salesRep, row.quotationCount, row.totalValue, row.acceptedValue]),
      [],
      ["Outstanding quote", "Client", "Sales rep", "Value", "Date"],
      ...data.outstanding.map((quote) => [quote.quoteNumber, quote.clientName || "", salesRepNameForQuote(quote), quoteTotalValue(quote), quoteReportDate(quote)]),
    ];
  }

  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
  downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${filename}-${todayInputValue()}.csv`);
  writeAudit("Exported dashboard report", type, "Dashboard", filename, "CSV export");
}

function setupRow(title, detail, id, type) {
  const row = document.createElement("article");
  row.className = "setup-row";
  row.innerHTML = `
    <div>
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(detail)}</small>
    </div>
    <div class="setup-actions">
      <button class="secondary-btn" type="button" data-edit-${type}="${escapeHtml(id)}">Edit</button>
      <button class="danger-btn" type="button" data-delete-${type}="${escapeHtml(id)}">Delete</button>
    </div>
  `;
  return row;
}

function renderMembers() {
  const members = storageList(membersStorageKey);
  memberList.innerHTML = "";
  if (!members.length) {
    memberList.innerHTML = `<p class="empty-state">No members saved yet. Unknown sign-ins use Admin access in this local prototype.</p>`;
    return;
  }

  members.forEach((member) => {
    const row = document.createElement("article");
    const inviteStatus = member.inviteStatus || (member.hasLoggedIn ? "Active" : "Pending");
    row.className = "setup-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <small>${escapeHtml(member.email)} | ${escapeHtml(member.access)} | ${escapeHtml(inviteStatus)}</small>
        <small>Permissions: ${escapeHtml(Array.from(memberPermissions(member)).map((key) => permissionDefinitions.find((permission) => permission.key === key)?.label || key).join(", ") || "None selected")}</small>
        <small>${member.inviteSentAt ? `Invite sent: ${escapeHtml(formatDate(member.inviteSentAt.slice(0, 10)))}` : "Invite not sent yet"}</small>
      </div>
      <div class="setup-actions">
        <button class="secondary-btn" type="button" data-edit-member="${escapeHtml(member.id)}">Edit</button>
        ${inviteStatus !== "Active" && inviteStatus !== "Disabled" ? `<button class="secondary-btn" type="button" data-resend-member="${escapeHtml(member.id)}">Resend invite</button>` : ""}
        <button class="secondary-btn" type="button" data-toggle-member="${escapeHtml(member.id)}">${inviteStatus === "Disabled" ? "Enable" : "Disable"}</button>
        <button class="danger-btn" type="button" data-delete-member="${escapeHtml(member.id)}">Delete</button>
      </div>
    `;
    memberList.appendChild(row);
  });
}

function renderSetupSalesReps() {
  setupSalesRepList.innerHTML = "";
  const reps = salesRepsList();
  if (!reps.length) {
    setupSalesRepList.innerHTML = `<p class="empty-state">No sales reps saved.</p>`;
    return;
  }

  reps.forEach((rep) => {
    setupSalesRepList.appendChild(setupRow(rep.name, `${rep.email} | ${rep.phone || "-"}`, rep.id, "sales-rep"));
  });
}

function renderSupplierPrices() {
  const prices = storageList(supplierPricesStorageKey);
  supplierPriceList.innerHTML = "";
  if (!prices.length) {
    supplierPriceList.innerHTML = `<p class="empty-state">No supplier prices saved.</p>`;
    return;
  }

  prices.forEach((item) => {
    const code = item.stockCode || item.productCode || "-";
    const supplier = item.supplierName || "Supplier not set";
    const category = item.category ? ` | ${item.category}` : "";
    supplierPriceList.appendChild(setupRow(code, `${supplier} | ${item.description}${category} | ${money.format(Number(item.cost || item.unitCost || 0))}`, item.id, "supplier"));
  });
}

function renderClients() {
  const clients = storageList(clientsStorageKey);
  clientList.innerHTML = "";
  if (!clients.length) {
    clientList.innerHTML = `<p class="empty-state">No clients saved.</p>`;
    return;
  }

  clients.forEach((client) => {
    clientList.appendChild(setupRow(client.name, `${client.contact || "-"} | ${client.email || "-"} | ${client.phone || "-"}`, client.id, "client"));
  });
}

function renderSetup() {
  if (!canAccess("settings")) return;
  const settings = quotationSettings();
  profitDeductionPercent.value = settings.profitDeductionPercent;
  commissionPercent.value = settings.commissionPercent;
  if (!memberPermissionChecklist.children.length) {
    renderPermissionChecklist(roleDefaultPermissions[memberAccess.value] || []);
  }
  renderMembers();
  renderSetupSalesReps();
  renderSupplierPrices();
  renderClients();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function guessImportColumn(headers, keywords) {
  const normalizedHeaders = headers.map((header) => header.toLowerCase());
  const index = normalizedHeaders.findIndex((header) => keywords.some((keyword) => header.includes(keyword)));
  return index >= 0 ? headers[index] : "";
}

function importMappingDefaults(headers) {
  return {
    supplierName: guessImportColumn(headers, ["supplier", "vendor"]),
    productCode: guessImportColumn(headers, ["stock", "sku", "code", "product"]),
    description: guessImportColumn(headers, ["description", "item", "product name"]),
    category: guessImportColumn(headers, ["category", "group"]),
    unitCost: guessImportColumn(headers, ["cost", "price", "unit"]),
  };
}

function renderSupplierImportMapping() {
  if (!state.supplierImport) return;
  const headers = state.supplierImport.headers;
  const mapping = state.supplierImport.mapping;
  const fieldLabels = {
    supplierName: "Supplier name",
    productCode: "Product code / SKU",
    description: "Product description",
    category: "Category",
    unitCost: "Unit cost",
  };
  const options = (selected) => [`<option value="">Not mapped</option>`, ...headers.map((header) => `<option value="${escapeHtml(header)}" ${header === selected ? "selected" : ""}>${escapeHtml(header)}</option>`)].join("");
  supplierImportMapping.hidden = false;
  supplierImportMapping.innerHTML = Object.entries(fieldLabels)
    .map(([field, label]) => `
      <label>
        ${label}
        <select data-import-map="${field}">
          ${options(mapping[field] || "")}
        </select>
      </label>
    `)
    .join("");
}

function renderSupplierImportPreview() {
  if (!state.supplierImport) return;
  const rows = state.supplierImport.rows.slice(0, 8);
  supplierImportPreview.hidden = false;
  supplierImportPreview.innerHTML = `
    <div class="import-table">
      <div class="import-table-row import-table-header" style="grid-template-columns: repeat(${state.supplierImport.headers.length}, minmax(140px, 1fr));">
        ${state.supplierImport.headers.map((header) => `<span>${escapeHtml(header)}</span>`).join("")}
      </div>
      ${rows.map((row) => `
        <div class="import-table-row" style="grid-template-columns: repeat(${state.supplierImport.headers.length}, minmax(140px, 1fr));">
          ${state.supplierImport.headers.map((_, index) => `<span>${escapeHtml(row[index] || "")}</span>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function mappedImportValue(row, field) {
  const header = state.supplierImport?.mapping?.[field];
  const index = state.supplierImport?.headers.indexOf(header);
  return index >= 0 ? String(row[index] || "").trim() : "";
}

function supplierDuplicateKey(item) {
  return `${(item.supplierName || "").trim().toLowerCase()}::${(item.productCode || item.stockCode || "").trim().toLowerCase()}`;
}

function normalizeSupplierImportRows() {
  const existing = storageList(supplierPricesStorageKey);
  const existingKeys = new Map(existing.map((item, index) => [supplierDuplicateKey(item), index]));
  const seenKeys = new Set();
  const errors = [];
  const valid = [];

  state.supplierImport.rows.forEach((row, index) => {
    const supplierName = mappedImportValue(row, "supplierName");
    const productCode = mappedImportValue(row, "productCode");
    const description = mappedImportValue(row, "description");
    const category = mappedImportValue(row, "category");
    const rawCost = mappedImportValue(row, "unitCost").replace(/\s/g, "").replace("R", "").replace(",", ".");
    const cost = Number(rawCost);
    const item = {
      supplierName,
      productCode,
      stockCode: productCode,
      description,
      category,
      cost,
    };
    const key = supplierDuplicateKey(item);
    const rowNumber = index + 2;

    if (!supplierName) errors.push({ rowNumber, reason: "Missing supplier name", row });
    else if (!description) errors.push({ rowNumber, reason: "Missing product description", row });
    else if (!Number.isFinite(cost) || cost < 0) errors.push({ rowNumber, reason: "Invalid price value", row });
    else if (productCode && seenKeys.has(key)) errors.push({ rowNumber, reason: "Duplicate product code in uploaded file for same supplier", row });
    else {
      seenKeys.add(key);
      valid.push({
        item,
        existingIndex: productCode ? existingKeys.get(key) : undefined,
      });
    }
  });

  return { existing, errors, valid };
}

function confirmSupplierPriceImport() {
  if (!enforceAccess("settings") || !state.supplierImport) return;
  const mode = supplierImportMode.value;
  const { existing, errors, valid } = normalizeSupplierImportRows();
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  valid.forEach(({ item, existingIndex }) => {
    const hasExisting = existingIndex !== undefined;
    if (hasExisting && mode === "add") {
      skipped += 1;
      return;
    }
    if (!hasExisting && mode === "update") {
      skipped += 1;
      return;
    }

    const payload = {
      id: hasExisting ? existing[existingIndex].id : slugify(`${item.supplierName}-${item.productCode || item.description}`),
      ...item,
    };

    if (hasExisting) {
      existing[existingIndex] = { ...existing[existingIndex], ...payload };
      updated += 1;
    } else {
      existing.push(payload);
      imported += 1;
    }
  });

  state.supplierImportErrors = errors;
  saveStorageList(supplierPricesStorageKey, existing);
  renderSupplierPrices();
  supplierImportSummary.innerHTML = `
    <strong>Import summary</strong>
    <span>Total rows imported: ${imported}</span>
    <span>Rows skipped: ${skipped}</span>
    <span>Rows updated: ${updated}</span>
    <span>Rows with errors: ${errors.length}</span>
  `;
  downloadSupplierImportErrors.disabled = !errors.length;
  writeAudit("Supplier price list imported", `${imported} imported, ${updated} updated, ${skipped} skipped, ${errors.length} errors`, "Setup - Supplier prices", state.supplierImport.fileName, supplierImportMode.options[supplierImportMode.selectedIndex].textContent);
  if (updated) {
    writeAudit("Supplier prices updated through import", `${updated} rows updated`, "Setup - Supplier prices", state.supplierImport.fileName, "Existing supplier price records were updated");
  }
}

function exportSupplierImportErrors() {
  if (!state.supplierImportErrors.length) return;
  const headers = ["Row", "Reason", ...(state.supplierImport?.headers || [])];
  const rows = state.supplierImportErrors.map((error) => [error.rowNumber, error.reason, ...error.row]);
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
  downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `supplier-import-errors-${todayInputValue()}.csv`);
  writeAudit("Exported supplier import errors", `${state.supplierImportErrors.length} rows`, "Setup - Supplier prices", "Supplier import errors", "CSV export");
}

function loadApprovals() {
  try {
    return JSON.parse(localStorage.getItem(approvalsStorageKey) || "[]");
  } catch {
    localStorage.removeItem(approvalsStorageKey);
    return [];
  }
}

function saveApprovals(approvals) {
  localStorage.setItem(approvalsStorageKey, JSON.stringify(approvals));
}

function normalizedStatus(status = "") {
  return String(status)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function approvalStatusCandidates(quote = {}) {
  return [
    quote.status,
    quote.internalStatus,
    quote.approvalStatus,
    quote.workflowStatus,
  ].filter((status) => status !== undefined && status !== null && String(status).trim());
}

function isApprovalPendingQuote(quote) {
  const submittedStatuses = new Set([
    "pending",
    "pending_approval",
    "awaiting_approval",
    "submitted_for_approval",
  ]);
  const candidates = approvalStatusCandidates(quote);
  return candidates.some((status) => submittedStatuses.has(normalizedStatus(status)));
}

function debugApprovalFlow(allQuotes, pendingQuotes, filteredOut) {
  const member = currentMember();
  console.group("Approval tab debug");
  console.log("Current user", currentUser());
  console.log("Current user role", member.access);
  console.log("Can access approvals", canAccess("approvals"));
  console.log("API/localStorage response", allQuotes);
  console.log("Quotation statuses returned", allQuotes.map((quote) => ({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    internalStatus: quote.internalStatus,
    approvalStatus: quote.approvalStatus,
    workflowStatus: quote.workflowStatus,
    normalizedCandidates: approvalStatusCandidates(quote).map(normalizedStatus),
  })));
  console.log("Approval quotations rendered", pendingQuotes);
  console.log("Filtered out quotations", filteredOut);
  console.groupEnd();
}

function approvalDebugPanel(allQuotes, renderedQuotes, filterLabel) {
  if (!canSeeInternalCosting()) return "";
  const statuses = Array.from(new Set(allQuotes.flatMap((quote) => approvalStatusCandidates(quote).map((status) => String(status).trim() || "-"))));
  return `
    <div class="approval-debug-panel">
      <strong>Approval debug</strong>
      <span>Logged-in user role: ${escapeHtml(currentMember().access)}</span>
      <span>Quotations returned from API/localStorage: ${allQuotes.length}</span>
      <span>Quotations currently displayed: ${renderedQuotes.length}</span>
      <span>Unique statuses found: ${escapeHtml(statuses.join(", ") || "No status values found")}</span>
      <span>Current filter: ${escapeHtml(filterLabel)}</span>
      <span>Source table/key: ${escapeHtml(approvalsStorageKey)}</span>
    </div>
  `;
}

function submittedQuotes() {
  const allQuotes = loadApprovals();
  const pending = allQuotes.filter(isApprovalPendingQuote)
    .sort((a, b) => new Date(b.submittedAt || b.updatedAt || 0) - new Date(a.submittedAt || a.updatedAt || 0));
  const filteredOut = allQuotes
    .filter((quote) => !isApprovalPendingQuote(quote))
    .map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      normalizedCandidates: approvalStatusCandidates(quote).map(normalizedStatus),
      reason: `No pending approval status match. Checked: ${approvalStatusCandidates(quote).join(", ") || "no status fields"}`,
    }));
  debugApprovalFlow(allQuotes, pending, filteredOut);
  return pending;
}

function libraryQuotes() {
  const finalizedStatuses = new Set(["approved", "rejected", "sent_to_client", "client_accepted", "client_declined"]);
  return loadApprovals().filter((quote) => finalizedStatuses.has(normalizedStatus(quote.status)));
}

function loadSalesRequests() {
  return storageList(salesRequestsStorageKey);
}

function saveSalesRequests(requests) {
  saveStorageList(salesRequestsStorageKey, requests);
}

function salesRequestStatusLabel(status = "") {
  const normalized = normalizedStatus(status);
  if (normalized === "approved") return "Approved";
  if (normalized === "submitted_for_approval" || normalized === "pending_approval" || normalized === "awaiting_approval" || normalized === "completed") {
    return "Submitted for Approval";
  }
  return "Accepted for Processing";
}

function salesRequestStatusClass(status = "") {
  const label = salesRequestStatusLabel(status);
  if (label === "Approved") return "status-badge status-complete";
  if (label === "Submitted for Approval") return "status-badge status-info";
  return "status-badge status-warning";
}

function migrateSalesRequestStatuses() {
  const requests = loadSalesRequests();
  let changed = false;
  const migrated = requests.map((request) => {
    const mappedStatus = salesRequestStatusLabel(request.status);
    if (request.status === mappedStatus) return request;
    changed = true;
    return {
      ...request,
      legacy_status: request.legacy_status || request.status || "",
      status: mappedStatus,
      updated_at: request.updated_at || new Date().toISOString(),
    };
  });
  if (changed) saveSalesRequests(migrated);
}

function reserveRequestNumber() {
  const year = quoteYear(todayInputValue());
  const key = `${requestSequencePrefix}-${year}`;
  const nextSequence = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(nextSequence));
  return `SQR-${year}-${String(nextSequence).padStart(4, "0")}`;
}

const supportedRequestDocumentTypes = new Map([
  ["application/pdf", [".pdf"]],
  ["application/msword", [".doc"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
  ["application/vnd.ms-excel", [".xls"]],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", [".xlsx"]],
  ["text/csv", [".csv"]],
  ["image/png", [".png"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
]);

function requestDocumentMimeType(file) {
  const extension = `.${(file.name.split(".").pop() || "").toLowerCase()}`;
  if (file.type && supportedRequestDocumentTypes.has(file.type)) return file.type;
  for (const [mimeType, extensions] of supportedRequestDocumentTypes.entries()) {
    if (extensions.includes(extension)) return mimeType;
  }
  return file.type || "";
}

function isSupportedRequestDocument(file) {
  const mimeType = requestDocumentMimeType(file);
  return supportedRequestDocumentTypes.has(mimeType);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      resolve(dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function requestFileMetadata(file) {
  const mimeType = requestDocumentMimeType(file);
  return {
    id: `request-file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file_name: file.name,
    file_url: "",
    file_type: mimeType || "Unknown file type",
    mime_type: mimeType || file.type || "application/octet-stream",
    file_size: file.size,
    file_data_base64: await fileToBase64(file),
    uploaded_by_user_id: currentUser(),
    uploaded_at: new Date().toISOString(),
  };
}

function salesRepSearchRecords(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const members = storageList(membersStorageKey)
    .filter((member) => (member.inviteStatus || (member.hasLoggedIn ? "Active" : "Pending")) !== "Disabled")
    .map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      branch: member.branch || "",
      department: member.department || "",
      source: "member",
    }));
  const reps = salesRepsList().map((rep) => ({
    id: rep.id,
    name: rep.name,
    email: rep.email,
    phone: rep.phone || "",
    branch: rep.branch || "",
    department: rep.department || "",
    source: "sales-rep",
  }));
  const unique = new Map();
  [...members, ...reps].forEach((rep) => {
    const key = normalizeEmail(rep.email) || rep.id;
    if (!unique.has(key)) unique.set(key, rep);
  });
  return Array.from(unique.values())
    .filter((rep) => !normalizedQuery || [rep.name, rep.email, rep.phone, rep.branch, rep.department].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderRequestSalesRepOptions(query = "") {
  const reps = salesRepSearchRecords(query);
  requestSalesRepOptions.innerHTML = reps.map((rep) => `
    <option value="${escapeHtml(rep.name)}" data-id="${escapeHtml(rep.id)}" data-email="${escapeHtml(rep.email)}">${escapeHtml(rep.email)}${rep.phone ? ` | ${escapeHtml(rep.phone)}` : ""}</option>
  `).join("");
  if (window.location.protocol !== "file:") {
    fetch(`/api/members/search?query=${encodeURIComponent(query)}`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : { members: [] }))
      .then((data) => {
        const localEmails = new Set(reps.map((rep) => normalizeEmail(rep.email)));
        const backendReps = (data.members || []).filter((rep) => !localEmails.has(normalizeEmail(rep.email)));
        if (!backendReps.length) return;
        requestSalesRepOptions.innerHTML += backendReps.map((rep) => `
          <option value="${escapeHtml(rep.name)}" data-id="${escapeHtml(rep.id)}" data-email="${escapeHtml(rep.email)}">${escapeHtml(rep.email)}${rep.phone ? ` | ${escapeHtml(rep.phone)}` : ""}</option>
        `).join("");
      })
      .catch(() => {});
  }
}

function selectedRequestSalesRep() {
  const typedName = requestSalesRepName.value.trim().toLowerCase();
  const typedEmail = normalizeEmail(requestSalesRepEmail.value);
  return salesRepSearchRecords().find((rep) => (
    rep.id === state.selectedRequestSalesRepId ||
    rep.name.toLowerCase() === typedName ||
    normalizeEmail(rep.email) === typedEmail
  ));
}

function currentUserSalesRep() {
  const email = normalizeEmail(currentUser());
  const name = currentUserName().toLowerCase();
  return salesRepSearchRecords().find((rep) => (
    normalizeEmail(rep.email) === email ||
    rep.name.toLowerCase() === name
  ));
}

function autoPopulateRequestSalesRep(force = false) {
  if (!force && (requestSalesRepName.value.trim() || requestSalesRepEmail.value.trim())) return;
  const rep = currentUserSalesRep();
  if (rep) applyRequestSalesRep(rep);
}

function applyRequestSalesRep(rep) {
  if (!rep) return;
  state.selectedRequestSalesRepId = rep.id;
  requestSalesRepName.value = rep.name || "";
  requestSalesRepEmail.value = rep.email || "";
  requestSalesRepPhone.value = rep.phone || "";
}

function renderRequestFileList() {
  requestFileList.innerHTML = state.salesRequestFiles.length
    ? state.salesRequestFiles.map((file) => `<span class="upload-file-pill">${escapeHtml(file.file_name)} (${escapeHtml(formatFileSize(file.file_size))})</span>`).join("")
    : "No request documents uploaded.";
}

function renderSalesRequestDocuments(request) {
  const files = request?.files || [];
  state.activeSalesRequestId = request?.id || "";
  salesRequestDocumentsPanel.hidden = !request || !files.length;
  if (!request || !files.length) {
    salesRequestDocumentsList.innerHTML = "";
    return;
  }
  salesRequestDocumentsList.innerHTML = files.map((file) => `
    <span>
      <strong>${escapeHtml(file.file_name || file.name || "Document")}</strong>
      <small>${escapeHtml(file.file_type || file.mime_type || file.type || "Unknown file type")} | ${escapeHtml(formatFileSize(file.file_size || file.size || 0))} | Uploaded ${escapeHtml(file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString("en-ZA") : "-")}</small>
    </span>
    <div>
      <button class="secondary-btn" type="button" data-view-request-file="${escapeHtml(file.id || file.fileId || "")}">View</button>
      <button class="secondary-btn" type="button" data-download-request-file="${escapeHtml(file.id || file.fileId || "")}">Download</button>
    </div>
  `).join("");
}

function renderSalesRequestSummary(request) {
  salesRequestSummaryPanel.hidden = !request;
  if (!request) {
    salesRequestSummary.innerHTML = "";
    return;
  }
  salesRequestSummary.innerHTML = `
    <div class="internal-costing-grid request-summary-grid">
      <div><small>Request number</small><strong>${escapeHtml(request.request_number || "-")}</strong></div>
      <div><small>Client</small><strong>${escapeHtml(request.client_name || "-")}</strong></div>
      <div><small>Contact</small><strong>${escapeHtml([request.client_contact_person, request.client_email, request.client_phone].filter(Boolean).join(" / ") || "-")}</strong></div>
      <div><small>Site / project</small><strong>${escapeHtml(request.site_project_name || "-")}</strong></div>
      <div><small>Site address</small><strong>${escapeHtml(request.site_address || "-")}</strong></div>
      <div><small>Sales rep</small><strong>${escapeHtml([request.sales_rep_name, request.sales_rep_email, request.sales_rep_phone].filter(Boolean).join(" / ") || "-")}</strong></div>
      <div><small>Due date</small><strong>${escapeHtml(formatDate(request.required_due_date))}</strong></div>
      <div><small>Status</small><strong>${escapeHtml(salesRequestStatusLabel(request.status))}</strong></div>
      <div><small>Description of work</small><strong>${escapeHtml(request.description_of_work || "-")}</strong></div>
      <div><small>Notes to quotation builder</small><strong>${escapeHtml(request.notes_for_builder || "-")}</strong></div>
    </div>
  `;
}

function openRequestDocument(fileId, mode = "view") {
  const request = loadSalesRequests().find((item) => item.id === state.activeSalesRequestId);
  const file = (request?.files || []).find((item) => (item.id || item.fileId) === fileId);
  if (!file) return;
  if (file.file_url) {
    if (mode === "download") {
      const anchor = document.createElement("a");
      anchor.href = file.file_url;
      anchor.download = file.file_name || file.name || "sales-request-document";
      anchor.click();
    } else {
      window.open(file.file_url, "_blank", "noopener,noreferrer");
    }
    return;
  }
  const encoded = file.file_data_base64 || file.base64 || "";
  if (!encoded) {
    alert("The original uploaded file data is not available for this older request document. Please upload the document again.");
    return;
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const mimeType = file.mime_type || file.file_type || file.type || "application/pdf";
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const filename = file.file_name || file.name || "sales-request-document";
  if (mode === "download") {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function canProcessSalesRequest(request) {
  if (!hasPermission("build_quotation") && !hasPermission("approval")) return false;
  if (salesRequestStatusLabel(request.status) !== "Accepted for Processing") return false;
  return !request.accepted_by_user_id || request.accepted_by_user_id === currentUser() || ["Admin", "Super Admin"].includes(currentMember().access);
}

function salesRequestsForCurrentUser() {
  const requests = loadSalesRequests();
  if (hasPermission("approval") || hasPermission("build_quotation") || ["Admin", "Super Admin"].includes(currentMember().access)) return requests;
  const email = normalizeEmail(currentUser());
  return requests.filter((request) => normalizeEmail(request.sales_rep_email) === email || normalizeEmail(request.submitted_by_user_id) === email);
}

function renderSalesRequests() {
  if (!canAccess("salesRequests")) return;
  autoPopulateRequestSalesRep();
  const requests = salesRequestsForCurrentUser().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  salesRequestList.innerHTML = "";
  if (!requests.length) {
    salesRequestList.innerHTML = `<p class="empty-state">No sales quotation requests have been submitted yet.</p>`;
    return;
  }

  salesRequestList.innerHTML = `
    <div class="approval-table request-table" role="table" aria-label="Sales quotation requests">
      <div class="approval-table-header" role="row">
        <span>Request number</span>
        <span>Client name</span>
        <span>Site/project</span>
        <span>Sales rep</span>
        <span>Status</span>
        <span>Accepted by</span>
        <span>Submitted</span>
        <span>Due date</span>
        <span>Actions</span>
      </div>
      ${requests.map((request) => `
        <div class="approval-table-row" role="row">
          <span><strong>${escapeHtml(request.request_number)}</strong><small>${escapeHtml(request.supplier_name || "-")}</small></span>
          <span>${escapeHtml(request.client_name)}</span>
          <span>${escapeHtml(request.site_project_name || "-")}</span>
          <span><strong>${escapeHtml(request.sales_rep_name)}</strong><small>${escapeHtml([request.sales_rep_email, request.sales_rep_phone].filter(Boolean).join(" | "))}</small></span>
          <span><mark class="${salesRequestStatusClass(request.status)}">${escapeHtml(salesRequestStatusLabel(request.status))}</mark></span>
          <span>${escapeHtml(request.accepted_by_name || "-")}</span>
          <span>${escapeHtml(formatDate((request.created_at || "").slice(0, 10)))}</span>
          <span>${escapeHtml(formatDate(request.required_due_date))}</span>
          <span class="approval-row-actions">
            ${canProcessSalesRequest(request) && !request.accepted_by_user_id ? `<button class="primary-btn" type="button" data-accept-request="${escapeHtml(request.id)}">Accept Request</button>` : ""}
            ${salesRequestStatusLabel(request.status) === "Accepted for Processing" && request.accepted_by_user_id === currentUser() ? `<button class="secondary-btn" type="button" data-create-quote-request="${escapeHtml(request.id)}">Create Quotation from Request</button>` : ""}
            <button class="secondary-btn" type="button" data-view-request-docs="${escapeHtml(request.id)}">Docs (${(request.files || []).length})</button>
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

function updateSalesRequest(id, updates) {
  let updatedRequest = null;
  const requests = loadSalesRequests().map((request) => {
    if (request.id !== id) return request;
    const previousStatus = salesRequestStatusLabel(request.status);
    const nextStatus = updates.status ? salesRequestStatusLabel(updates.status) : previousStatus;
    updatedRequest = {
      ...request,
      ...updates,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    if (updates.status && previousStatus !== nextStatus) {
      writeAudit(
        "Sales request status changed",
        updatedRequest.request_number,
        "Sales Quotation Requests",
        updatedRequest.request_number,
        `Changed by ${currentUserName()} on ${new Date().toLocaleString("en-ZA")}. Previous status: ${previousStatus}. New status: ${nextStatus}`
      );
    }
    return updatedRequest;
  });
  saveSalesRequests(requests);
  return updatedRequest || requests.find((request) => request.id === id);
}

function createQuotationFromRequest(id) {
  const request = loadSalesRequests().find((item) => item.id === id);
  if (!request) return;
  resetQuoteForm();
  state.activeSalesRequestId = request.id;
  fields.clientName.value = request.client_name || "";
  fields.clientAddress.value = request.site_address || "";
  fields.contactPerson.value = request.client_contact_person || "";
  fields.contactEmail.value = request.client_email || "";
  fields.contactNumber.value = request.client_phone || "";
  fields.projectSummary.value = request.description_of_work || "";
  if (request.required_due_date) {
    const quoteDate = new Date(`${fields.quoteDate.value}T00:00:00`);
    const dueDate = new Date(`${request.required_due_date}T00:00:00`);
    const diffDays = Math.max(1, Math.ceil((dueDate - quoteDate) / 86400000));
    fields.validityDays.value = String(diffDays);
    fields.validUntil.value = request.required_due_date;
  }
  const rep = salesRepsList().find((item) => normalizeEmail(item.email) === normalizeEmail(request.sales_rep_email));
  if (rep) fields.salesRep.value = rep.id;
  state.supplierQuotes = (request.files || []).map((file) => ({
    fileId: file.id,
    name: file.file_name,
    size: file.file_size,
    type: file.file_type,
  }));
  state.supplierQuote = state.supplierQuotes[0] || null;
  updateSupplierQuoteDisplay();
  renderSalesRequestDocuments(request);
  renderSalesRequestSummary(request);
  updateSalesRequest(id, { linked_quotation_id: fields.quoteNumber.value });
  writeAudit("Quotation created from request", request.request_number, "Sales Quotation Requests", request.request_number, fields.quoteNumber.value);
  writeAudit("User redirected to quotation builder", request.request_number, "Sales Quotation Requests", request.request_number, currentUserName());
  showSection("builder");
  const params = new URLSearchParams(window.location.search);
  params.set("salesRequestId", id);
  window.history.pushState({}, document.title, `${window.location.pathname}?${params.toString()}#builder`);
  renderAll();
}

function loadSalesRequestFromUrl() {
  const requestId = new URLSearchParams(window.location.search).get("salesRequestId");
  if (!requestId) return false;
  const request = loadSalesRequests().find((item) => item.id === requestId);
  if (!request) return false;
  createQuotationFromRequest(requestId);
  return true;
}

function updateStoredQuote(id, updates) {
  const approvals = loadApprovals().map((quote) => (
    quote.id === id ? { ...quote, ...updates, updatedAt: new Date().toISOString() } : quote
  ));
  saveApprovals(approvals);
  return approvals.find((quote) => quote.id === id);
}

function canReviseQuote(quote) {
  if (!canAccess("builder")) return false;
  if (!quote || normalizedStatus(quote.status) !== "rejected") return false;
  if (quote.rejectionSource === "client") return false;
  if (quote.clientOutcome === "Approved by client" || quote.convertedAt) return false;
  return true;
}

function revisionHistory(quote) {
  return Array.isArray(quote.revisionHistory) ? quote.revisionHistory : [];
}

function renderRevisionHistory(quote) {
  const history = revisionHistory(quote);
  const fallbackHistory = !history.length && normalizedStatus(quote.status) === "rejected"
    ? [{
        action: "Rejected internally",
        timestamp: quote.decidedAt,
        details: `Rejected by ${quote.rejectedByName || displayNameFromUser(quote.rejectedByUserId || "")}: ${quote.rejectionReason || "No reason captured"}`,
      }]
    : history;
  if (!fallbackHistory.length) {
    return `<p class="empty-state">No revision history captured yet.</p>`;
  }

  return `
    <div class="revision-history-list">
      ${fallbackHistory.map((entry) => `
        <article>
          <strong>${escapeHtml(entry.action || "Revision event")}</strong>
          <small>${escapeHtml(entry.timestamp ? new Date(entry.timestamp).toLocaleString("en-ZA") : "-")}</small>
          <p>${escapeHtml(entry.details || "")}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function loadQuoteIntoBuilder(quote) {
  state.revisingQuoteId = quote.id;
  state.revisionSourceId = quote.id;
  state.revisionNumber = Number(quote.revisionNumber || 0) + 1;
  fields.selectedCompany.value = companies[quote.selectedCompany] ? quote.selectedCompany : "";
  fields.clientName.value = quote.clientName || "";
  fields.clientAddress.value = quote.clientAddress || "";
  fields.contactPerson.value = quote.contactPerson || "";
  fields.contactEmail.value = quote.contactEmail || "";
  fields.contactNumber.value = quote.contactNumber || "";
  fields.quoteNumber.value = quote.quoteNumber || reserveQuoteNumber(todayInputValue());
  fields.salesRep.value = salesReps[quote.salesRep] ? quote.salesRep : "";
  fields.quoteDate.value = todayInputValue();
  fields.validityDays.value = quote.validityDays || 30;
  fields.validUntil.value = quote.validUntil || dateInputValue(addDays(fields.quoteDate.value, Number(fields.validityDays.value || 30)));
  fields.projectSummary.value = quote.additionalScope || "";
  fields.aiInstruction.value = quote.aiInstruction || "";
  fields.termsText.value = quote.termsText || buildTerms();
  fields.markupPercent.value = String(quote.markupPercent || 20);
  state.markupPercent = Number(fields.markupPercent.value);
  state.supplierQuotes = supplierQuoteList(quote);
  state.supplierQuote = state.supplierQuotes[0] || null;
  state.supplierQuoteFiles = [];
  state.costing = quote.costing || { stockCost: 0, consumablesCost: 0, labourCost: 0 };
  state.items = quote.items?.length ? quote.items.map((item) => ({ ...item })) : [{ stockCode: "", description: "", quantity: 1, supplierCost: 0 }];
  supplierQuoteUpload.value = "";
  updateSupplierQuoteDisplay();
  clearValidation();
  renderAll();
}

function reviseRejectedQuote(id) {
  const quote = loadApprovals().find((item) => item.id === id);
  if (!quote) return;
  if (!canReviseQuote(quote)) {
    alert("This quotation cannot be edited because it has already moved into a final client or converted status.");
    return;
  }

  loadQuoteIntoBuilder(quote);
  writeAudit("Rejected quotation opened for revision", quote.quoteNumber, "Build Quotation", quote.quoteNumber, `Revision ${state.revisionNumber}`);
  state.selectedLibraryId = "";
  state.selectedApprovalId = "";
  showSection("builder");
  window.location.hash = "builder";
}

function quoteDocuments(quote) {
  return {
    supplierPop: Array.isArray(quote.documents?.supplierPop) ? quote.documents.supplierPop : (quote.documents?.supplierPop ? [quote.documents.supplierPop] : []),
    clientInvoice: Array.isArray(quote.documents?.clientInvoice) ? quote.documents.clientInvoice : (quote.documents?.clientInvoice ? [quote.documents.clientInvoice] : []),
    jobCards: quote.documents?.jobCards || [],
  };
}

function missingDocumentLabels(quote) {
  if (normalizedStatus(quote.status) !== "client_accepted" && quote.clientOutcome !== "Approved by client") return [];

  const documents = quoteDocuments(quote);
  return [
    !documents.supplierPop.length ? "Missing POP" : "",
    !documents.clientInvoice.length ? "Missing invoice" : "",
    !documents.jobCards.length ? "Missing job cards" : "",
  ].filter(Boolean);
}

function libraryDocumentStatus(quote) {
  if (normalizedStatus(quote.status) === "rejected" && quote.rejectionSource !== "client") {
    return quote.rejectionReason ? `${internalRejectionLabel(quote)}: reason captured` : internalRejectionLabel(quote);
  }
  if (quote.clientOutcome === "Rejected by client") {
    return quote.clientRejectionReason ? "Client rejected: reason captured" : "Client rejection reason required";
  }
  if (quote.clientOutcome !== "Approved by client") return "Client outcome pending";

  const missing = missingDocumentLabels(quote);
  return missing.length ? `Documents outstanding: ${missing.join(", ")}` : "Documents complete";
}

function libraryClientOutcomeLabel(quote) {
  if (normalizedStatus(quote.status) === "rejected" && quote.rejectionSource !== "client") return "-";
  if (normalizedStatus(quote.status) === "sent_to_client") return "Sent to client";
  if (normalizedStatus(quote.status) === "client_accepted") return "Approved by client";
  if (normalizedStatus(quote.status) === "client_declined") return "Rejected by client";
  if (quote.clientOutcome === "Approved by client") return "Approved by client";
  if (quote.clientOutcome === "Rejected by client") return "Rejected by client";
  return "Awaiting client outcome";
}

function internalStatusBadge(quote) {
  if (["approved", "sent_to_client", "client_accepted", "client_declined"].includes(normalizedStatus(quote.status))) {
    return {
      label: internalApprovalLabel(quote),
      className: "status-badge status-internal-approved",
    };
  }

  if (normalizedStatus(quote.status) === "rejected") {
    return {
      label: internalRejectionLabel(quote),
      className: "status-badge status-internal-rejected",
    };
  }

  return {
    label: "Awaiting approval",
    className: "status-badge status-internal-pending",
  };
}

function libraryStatusBadge(quote) {
  if (normalizedStatus(quote.status) === "rejected" && quote.rejectionSource !== "client") {
    return {
      label: internalRejectionLabel(quote),
      className: "status-badge status-rejected",
    };
  }

  if (normalizedStatus(quote.status) === "client_declined" || quote.clientOutcome === "Rejected by client" || quote.rejectionSource === "client") {
    return {
      label: "Rejected by client",
      className: "status-badge status-rejected",
    };
  }

  if (normalizedStatus(quote.status) === "client_accepted" || quote.clientOutcome === "Approved by client") {
    const missing = missingDocumentLabels(quote);
    return missing.length
      ? {
          label: "Approved - documents outstanding",
          className: "status-badge status-warning",
        }
      : {
          label: "Approved - complete",
          className: "status-badge status-complete",
        };
  }

  return {
    label: "Client outcome pending",
    className: "status-badge status-warning",
  };
}

function paymentStatusBadge(quote) {
  if (quote.paidInFull) {
    return {
      label: "Paid in full",
      className: "status-badge status-payment-complete",
    };
  }
  if (quote.depositReceived) {
    return {
      label: "Deposit received",
      className: "status-badge status-payment-started",
    };
  }
  return {
    label: "Payment outstanding",
    className: "status-badge status-payment-outstanding",
  };
}

function fileMetadata(file) {
  return {
    fileId: `${state.selectedLibraryId || "quote"}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: file.name,
    size: file.size,
    type: file.type || "Unknown file type",
    lastModified: file.lastModified,
    uploadedAt: new Date().toISOString(),
  };
}

function renderDocumentAccess(documentRecord, missingLabel) {
  if (!documentRecord?.fileId) {
    return `<span class="document-status missing">${escapeHtml(missingLabel)}</span>`;
  }

  return `
    <div class="document-access-row">
      <span>${escapeHtml(documentRecord.name)} <small>${escapeHtml(formatFileSize(documentRecord.size))}</small></span>
      <div>
        <button class="secondary-btn" type="button" data-open-library-doc="${escapeHtml(documentRecord.fileId)}">View</button>
        <button class="secondary-btn" type="button" data-download-library-doc="${escapeHtml(documentRecord.fileId)}">Download</button>
        <button class="danger-btn" type="button" data-remove-library-doc="${escapeHtml(documentRecord.fileId)}">Remove</button>
      </div>
    </div>
  `;
}

function currentQuotePayload(status = "Submitted for approval") {
  const revisionSuffix = state.revisingQuoteId ? `-rev-${state.revisionNumber}-${Date.now()}` : "";
  return {
    id: state.revisingQuoteId ? `${state.revisingQuoteId}${revisionSuffix}` : `${fields.quoteNumber.value || "draft"}-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    createdBy: currentUser(),
    createdByName: currentUserName(),
    submittedBy: currentUser(),
    submittedByName: currentUserName(),
    sales_request_id: state.activeSalesRequestId || "",
    status,
    approvalStatus: status,
    workflowStatus: status,
    clientName: fields.clientName.value,
    clientAddress: fields.clientAddress.value,
    contactPerson: fields.contactPerson.value,
    contactEmail: fields.contactEmail.value,
    contactNumber: fields.contactNumber.value,
    quoteNumber: fields.quoteNumber.value,
    salesRep: fields.salesRep.value,
    quoteDate: fields.quoteDate.value,
    validityDays: Number(fields.validityDays.value || 30),
    validUntil: fields.validUntil.value || dateInputValue(addDays(fields.quoteDate.value, Number(fields.validityDays.value || 30))),
    projectSummary: scopeText(),
    additionalScope: fields.projectSummary.value,
    aiInstruction: fields.aiInstruction.value,
    termsText: isAutoTerms(fields.termsText.value) ? buildTerms() : fields.termsText.value,
    markupPercent: fields.markupPercent.value,
    selectedCompany: fields.selectedCompany.value,
    supplierQuote: state.supplierQuotes[0] || null,
    supplierQuotes: state.supplierQuotes,
    costing: { ...state.costing },
    items: state.items,
    subtotal: state.items.reduce((sum, item) => sum + itemTotal(item), 0),
    revisionNumber: state.revisionNumber,
    revisionSourceId: state.revisionSourceId,
  };
}

async function submitCurrentQuoteForApproval() {
  const approvals = loadApprovals();
  const payload = currentQuotePayload();
  const existingIndex = state.revisingQuoteId
    ? -1
    : approvals.findIndex((quote) => quote.id === payload.id || quote.quoteNumber === payload.quoteNumber);

  await saveSupplierQuoteFile(payload.id);

  if (existingIndex >= 0) {
    const existingQuote = approvals[existingIndex];
    const history = revisionHistory(existingQuote);
    const isRevision = Boolean(state.revisingQuoteId);
    const revisedAt = new Date().toISOString();
    approvals[existingIndex] = {
      ...existingQuote,
      ...payload,
      supplierQuote: payload.supplierQuote || existingQuote.supplierQuote,
      rejectionReason: "",
      rejectionSource: "",
      rejectedByUserId: "",
      rejectedByName: "",
      decidedAt: "",
      decidedBy: "",
      decidedByName: "",
      revisedAt: isRevision ? revisedAt : existingQuote.revisedAt,
      revisedByUserId: isRevision ? currentUser() : existingQuote.revisedByUserId,
      revisedByName: isRevision ? currentUserName() : existingQuote.revisedByName,
      revisionHistory: isRevision
        ? [
            ...history,
            {
              action: "Revised quotation saved and resubmitted",
              timestamp: revisedAt,
              details: `Revision ${payload.revisionNumber} saved by ${currentUserName()}`,
            },
          ]
        : history,
    };
  } else {
    const sourceQuote = state.revisionSourceId ? approvals.find((quote) => quote.id === state.revisionSourceId) : null;
    approvals.unshift({
      ...payload,
      revisionHistory: state.revisionSourceId
        ? [
            ...revisionHistory(sourceQuote || {}),
            {
              action: "New revision created",
              timestamp: new Date().toISOString(),
              details: `${payload.quoteNumber} Rev ${payload.revisionNumber} created from rejected quotation by ${currentUserName()}`,
            },
          ]
        : payload.revisionHistory,
    });
  }

  saveApprovals(approvals);
  if (state.activeSalesRequestId) {
    const request = updateSalesRequest(state.activeSalesRequestId, {
      status: "Submitted for Approval",
      linked_quotation_id: payload.id,
      submitted_for_approval_at: new Date().toISOString(),
    });
    writeAudit("Quotation created from sales request", payload.quoteNumber, "Build Quotation", payload.quoteNumber, request?.request_number || state.activeSalesRequestId);
    writeAudit("Sales request submitted for approval", request?.request_number || state.activeSalesRequestId, "Sales Quotation Requests", request?.request_number || state.activeSalesRequestId, payload.quoteNumber);
  }
  if (state.revisingQuoteId) {
    writeAudit("Revised quotation saved", payload.quoteNumber, "Build Quotation", payload.quoteNumber, `Revision ${payload.revisionNumber}`);
    writeAudit("Revised quotation resubmitted for approval", payload.quoteNumber, "Approval", payload.quoteNumber, `Revision ${payload.revisionNumber}`);
  } else {
    writeAudit("Submitted for approval", `${payload.quoteNumber} for ${payload.clientName}`);
  }
  renderApprovals();
}

function decideQuote(id, status, rejectionReason = "") {
  if (normalizedStatus(status) === "approved") {
    const quoteToApprove = loadApprovals().find((quote) => quote.id === id);
    if (quoteToApprove && quoteCostingValues(quoteToApprove).totalQuotationProfit <= 0) {
      alert("This quotation does not make a profit and cannot be approved.");
      return;
    }
  }

  const approvals = loadApprovals().map((quote) => (
    quote.id === id
      ? {
          ...quote,
          status,
          approvalStatus: status,
          workflowStatus: status,
          rejectionReason,
          rejectionSource: normalizedStatus(status) === "rejected" ? "internal" : quote.rejectionSource,
          rejectedByUserId: normalizedStatus(status) === "rejected" ? currentUser() : quote.rejectedByUserId,
          rejectedByName: normalizedStatus(status) === "rejected" ? currentUserName() : quote.rejectedByName,
          approvedByUserId: normalizedStatus(status) === "approved" ? currentUser() : quote.approvedByUserId,
          approvedByName: normalizedStatus(status) === "approved" ? currentUserName() : quote.approvedByName,
          approvedDate: normalizedStatus(status) === "approved" ? new Date().toISOString() : quote.approvedDate,
          decidedAt: new Date().toISOString(),
          decidedBy: currentUser(),
          decidedByName: currentUserName(),
          revisionHistory: normalizedStatus(status) === "rejected"
            ? [
                ...revisionHistory(quote),
                {
                  action: "Rejected internally",
                  timestamp: new Date().toISOString(),
                  details: `Rejected by ${currentUserName()}: ${rejectionReason || "No reason captured"}`,
                },
              ]
            : revisionHistory(quote),
        }
      : quote
  ));
  saveApprovals(approvals);
  const quote = approvals.find((item) => item.id === id);
  if (quote) {
    if (normalizedStatus(status) === "approved" && quote.sales_request_id) {
      updateSalesRequest(quote.sales_request_id, {
        status: "Approved",
        approved_at: new Date().toISOString(),
      });
    }
    writeAudit(
      normalizedStatus(status) === "rejected" ? "Rejected quotation" : "Approved quotation",
      `${quote.quoteNumber} for ${quote.clientName}`,
      normalizedStatus(status) === "rejected" ? "Approval" : "Approval",
      quote.quoteNumber,
      rejectionReason || `Decision by ${currentUserName()}`
    );
    writeAudit("Approval Completed", `${quote.quoteNumber} ${status}`, "Approval", quote.quoteNumber, `Completed by ${currentUserName()}`);
  }
  state.selectedApprovalId = "";
  renderApprovals();
  renderQuoteLibrary();
}

function sendQuoteToClient(id) {
  const quote = loadApprovals().find((item) => item.id === id);
  if (!quote || !["approved", "sent_to_client"].includes(normalizedStatus(quote.status))) return;
  updateStoredQuote(id, {
    status: "Sent to Client",
    approvalStatus: "Sent to Client",
    workflowStatus: "Sent to Client",
    clientOutcome: "Awaiting client outcome",
    sentToClientAt: new Date().toISOString(),
    emailLogs: [
      ...(quote.emailLogs || []),
      {
        id: `email-${Date.now()}`,
        to: quote.contactEmail,
        subject: `Quotation ${quote.quoteNumber}`,
        sentAt: new Date().toISOString(),
        notes: "Client quotation PDF generated for email delivery in local prototype.",
      },
    ],
  });
  writeAudit("Sent quotation to client", quote.quoteNumber, "Quote Library", quote.quoteNumber, `Email logged for ${quote.contactEmail || "client email not set"}`);
  openClientQuotation(id);
}

function renderApprovalDetail(quote) {
  if (!quote) {
    approvalDetail.innerHTML = `<p class="empty-state">Select a quotation to view the full approval details.</p>`;
    return;
  }

  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  const supplierSubtotal = quoteSupplierSubtotal(quote);
  const subtotal = quoteSubtotal(quote);
  const tax = subtotal * state.taxRate;
  const total = subtotal + tax;
  const grossProfit = subtotal - supplierSubtotal;
  const canViewInternal = canSeeInternalCosting();
  const items = (quote.items || []).map((item) => `
    <div class="quotation-table-row">
      <span>${escapeHtml(item.stockCode || "")}</span>
      <span>${escapeHtml(item.description || "")}</span>
      <span>${money.format(quoteUnitPrice(quote, item))}</span>
      <span>${escapeHtml(item.quantity || 0)}</span>
      <strong>${money.format(quoteItemTotal(quote, item))}</strong>
    </div>
  `).join("");

  approvalDetail.innerHTML = `
    <div class="approval-detail-header">
      <div>
        <p class="eyebrow">Submitted quotation</p>
        <h3>${escapeHtml(quote.quoteNumber)}</h3>
      </div>
      <span>${escapeHtml(quote.status)}</span>
    </div>

    <div class="approval-review-metrics">
      <div>
        <small>Markup used</small>
        <strong>${escapeHtml(quote.markupPercent || 20)}%</strong>
      </div>
      <div>
        <small>Supplier cost excl. VAT</small>
        <strong>${money.format(supplierSubtotal)}</strong>
      </div>
      <div>
        <small>Client subtotal excl. VAT</small>
        <strong>${money.format(subtotal)}</strong>
      </div>
      <div>
        <small>Gross profit excl. VAT</small>
        <strong>${money.format(grossProfit)}</strong>
      </div>
      <div>
        <small>Supplier quotation</small>
        <strong>${renderSupplierDocumentAccess(quote)}</strong>
      </div>
    </div>

    ${renderInternalCostingPanel(quote)}

    <div class="quote-preview approval-quote">
      <div class="company-strip quotation-brand">
        <img class="quotation-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <div>
          <h2>${escapeHtml(company?.name || "No company selected")}</h2>
          <p>Reg no: ${escapeHtml(company?.registration || "-")} | VAT No: ${escapeHtml(company?.vat || "-")}</p>
        </div>
      </div>
      <div class="quotation-contact">
        <p>${escapeHtml(company?.address || "-")}</p>
        <p>Tel: ${escapeHtml(company?.phone || "-")} / Email: ${escapeHtml(company?.email || "-")} / Website: ${escapeHtml(company?.website || "-")}</p>
      </div>
      <div class="preview-meta">
        <div><small>Client Detail</small><strong>${escapeHtml([quote.clientName, quote.clientAddress].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Contact Detail</small><strong>${escapeHtml([quote.contactPerson, quote.contactEmail, quote.contactNumber].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Sales Rep</small><strong>${escapeHtml([salesRep?.name, salesRep?.email, salesRep?.phone].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Date</small><strong>${escapeHtml(formatDate(quote.quoteDate))}</strong></div>
      </div>
      <div class="equipment-description">
        <h3>Scope of Work</h3>
        <p>${escapeHtml(quote.projectSummary || fixedScopeText)}</p>
      </div>
      <div class="quotation-table">
        <div class="quotation-table-header">
          <span>Stock Code</span>
          <span>Description</span>
          <span>Cost Per Unit Excl. VAT</span>
          <span>Quantity</span>
          <span>Total Cost Excl. VAT</span>
        </div>
        ${items || `<div class="quotation-table-row"><span>-</span><span>No line items</span><span>-</span><span>-</span><strong>-</strong></div>`}
      </div>
      <div class="totals">
        <div><span>Subtotal</span><strong>${money.format(subtotal)}</strong></div>
        <div><span>VAT 15%</span><strong>${money.format(tax)}</strong></div>
        <div class="grand-total"><span>Total</span><strong>${money.format(total)}</strong></div>
      </div>
      <div class="preview-copy">
        <h3>Terms</h3>
        <p>${escapeHtml(quote.termsText || "")}</p>
      </div>
      <div class="banking-block">
        <h3>Banking Details</h3>
        <div class="banking-grid">
          <span>Bank:</span><strong>${escapeHtml(company?.bankName || "-")}</strong>
          <span>Account Holder:</span><strong>${escapeHtml(company?.name || "-")}</strong>
          <span>Account Type:</span><strong>${escapeHtml(company?.accountType || "-")}</strong>
          <span>Account Number:</span><strong>${escapeHtml(company?.accountNumber || "-")}</strong>
          <span>Branch Code:</span><strong>${escapeHtml(company?.branchCode || "-")}</strong>
        </div>
        <p class="reference-note">Please use quotation number <strong>${escapeHtml(quote.quoteNumber)}</strong> as your reference.</p>
      </div>
    </div>

    <div class="approval-detail-actions">
      <button class="secondary-btn" type="button" data-back-approvals="true">Back to approval list</button>
      <button class="secondary-btn" type="button" data-open-supplier="${quote.id}">Open supplier quotation</button>
      ${canViewInternal ? `<button class="secondary-btn" type="button" data-processed-print="${quote.id}">Print processed quotation</button>` : ""}
      ${canViewInternal ? `<button class="secondary-btn" type="button" data-processed-download="${quote.id}">Download processed quotation PDF</button>` : ""}
      <button class="primary-btn" type="button" data-approve="${quote.id}">Approve</button>
    </div>
    <div class="library-documents-panel">
      <h3>Supplier quotation uploads</h3>
      ${renderSupplierDocumentButtons(quote)}
    </div>

    <div class="rejection-panel">
        <label>
          Reason for rejection
        <textarea id="rejectionReason" rows="3" placeholder="Add the reason before rejecting this quotation..." spellcheck="false"></textarea>
      </label>
      <button class="danger-btn" type="button" data-reject="${quote.id}">Reject quotation</button>
    </div>
  `;

  if (state.focusRejectionReason) {
    state.focusRejectionReason = false;
    setTimeout(() => document.querySelector("#rejectionReason")?.focus(), 0);
  }
}

function renderApprovals() {
  const allApprovalQuotes = loadApprovals()
    .sort((a, b) => new Date(b.submittedAt || b.updatedAt || b.quoteDate || 0) - new Date(a.submittedAt || a.updatedAt || a.quoteDate || 0));
  const pending = submittedQuotes();
  const filterLabel = "Pending approval statuses only";
  debugApprovalFlow(allApprovalQuotes, pending, allApprovalQuotes.filter((quote) => !pending.some((item) => item.id === quote.id)));
  approvalCount.textContent = String(pending.length);

  approvalList.innerHTML = "";
  approvalDetail.innerHTML = "";

  if (state.selectedApprovalId) {
    const selectedQuote = pending.find((quote) => quote.id === state.selectedApprovalId);
    if (selectedQuote) {
      approvalList.hidden = true;
      approvalDetail.hidden = false;
      renderApprovalDetail(selectedQuote);
      return;
    }
    state.selectedApprovalId = "";
  }

  approvalList.hidden = false;
  approvalDetail.hidden = true;

  if (!pending.length) {
    approvalList.innerHTML = `
      ${approvalDebugPanel(allApprovalQuotes, pending, filterLabel)}
      <p class="empty-state">No quotations are currently waiting for approval.</p>
    `;
    return;
  }

  approvalList.innerHTML = `
    ${approvalDebugPanel(allApprovalQuotes, pending, filterLabel)}
    <div class="approval-filterbar">
      <label>
        Filters
        <select id="approvalStatusFilter">
          <option value="Submitted for approval">Submitted / Pending approval</option>
        </select>
      </label>
      <label>
        Search
        <input id="approvalSearch" type="search" placeholder="Search by client, quote number, requester..." />
      </label>
    </div>
    <div class="approval-table" role="table" aria-label="Quotations submitted for approval">
      <div class="approval-table-header" role="row">
        <span>Quotation number</span>
        <span>Client name</span>
        <span>Created by</span>
        <span>Status</span>
        <span>Created date</span>
        <span>Submitted date</span>
        <span>Actions</span>
      </div>
      <div id="approvalRows"></div>
    </div>
  `;

  const approvalRows = approvalList.querySelector("#approvalRows");
  const renderRows = (quotes) => {
    approvalRows.innerHTML = "";
    if (!quotes.length) {
      approvalRows.innerHTML = `<p class="empty-state approval-table-empty">No submitted quotations match this search.</p>`;
      return;
    }

    quotes.forEach((quote) => {
    const submittedDate = quote.submittedAt ? new Date(quote.submittedAt).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) : "-";
    const createdDate = (quote.createdAt || quote.quoteDate || quote.submittedAt)
      ? new Date(`${(quote.createdAt || quote.quoteDate || quote.submittedAt).slice(0, 10)}T00:00:00`).toLocaleDateString("en-ZA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";
    const canDecide = isApprovalPendingQuote(quote);
    const pendingDays = Math.max(0, Math.floor((Date.now() - new Date(quote.submittedAt || quote.createdAt || Date.now()).getTime()) / 86400000));
    const overdueBadge = pendingDays > 3 ? `<small><mark class="status-badge status-rejected">Overdue ${pendingDays} days</mark></small>` : `<small>Pending ${pendingDays} days</small>`;
    const row = document.createElement("div");
    row.className = "approval-table-row";
    row.dataset.viewApproval = quote.id;
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(quote.quoteNumber || quote.id)}</strong>
        <small>${escapeHtml(companies[quote.selectedCompany]?.name || "No company selected")}</small>
      </span>
      <span>
        <strong>${escapeHtml(quote.clientName || "-")}</strong>
        <small>${escapeHtml(quote.clientAddress || "")}</small>
      </span>
      <span>
        <strong>${escapeHtml(quote.createdByName || quote.submittedByName || quote.decidedByName || "Unknown")}</strong>
        <small>${escapeHtml(quote.createdBy || quote.submittedBy || quote.decidedBy || "-")}</small>
      </span>
      <span><mark>${escapeHtml(quote.status)}</mark>${overdueBadge}</span>
      <span>${escapeHtml(createdDate)}</span>
      <span>${escapeHtml(submittedDate)}</span>
      <span class="approval-row-actions">
        <button class="secondary-btn" type="button" data-view-approval="${quote.id}">View</button>
        ${canDecide ? `<button class="primary-btn" type="button" data-approve="${quote.id}">Approve</button>` : ""}
        ${canDecide ? `<button class="danger-btn" type="button" data-start-reject="${quote.id}">Reject</button>` : ""}
      </span>
    `;
    approvalRows.appendChild(row);
  });
  };

  renderRows(pending);

  approvalList.querySelector("#approvalSearch").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = pending.filter((quote) => {
      const salesRep = salesReps[quote.salesRep];
      return [
        quote.clientName,
        quote.quoteNumber,
        companies[quote.selectedCompany]?.name,
        salesRep?.name,
        salesRep?.email,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
    });
    renderRows(filtered);
  });
}

function renderQuoteLibraryDetail(quote) {
  if (!quote) {
    quoteLibraryDetail.innerHTML = `<p class="empty-state">Select a quotation to view library details.</p>`;
    return;
  }

  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  const subtotal = quoteSubtotal(quote);
  const total = subtotal * (1 + state.taxRate);
  const documents = quoteDocuments(quote);
  const missing = missingDocumentLabels(quote);
  const isInternalApproved = ["approved", "sent_to_client", "client_accepted", "client_declined"].includes(normalizedStatus(quote.status));
  const canRevise = canReviseQuote(quote);
  const isClientApproved = normalizedStatus(quote.status) === "client_accepted" || quote.clientOutcome === "Approved by client";
  const isClientRejected = quote.clientOutcome === "Rejected by client";
  const clientOutcomeLabel = libraryClientOutcomeLabel(quote);
  const statusBadge = libraryStatusBadge(quote);
  const internalBadge = internalStatusBadge(quote);
  const paymentBadge = paymentStatusBadge(quote);
  const canViewInternal = canSeeInternalCosting();
  const items = (quote.items || []).map((item) => `
    <div class="quotation-table-row">
      <span>${escapeHtml(item.stockCode || "")}</span>
      <span>${escapeHtml(item.description || "")}</span>
      <span>${money.format(quoteUnitPrice(quote, item))}</span>
      <span>${escapeHtml(item.quantity || 0)}</span>
      <strong>${money.format(quoteItemTotal(quote, item))}</strong>
    </div>
  `).join("");

  quoteLibraryDetail.innerHTML = `
    <div class="approval-detail-header">
      <div>
        <p class="eyebrow">Quote Library</p>
        <h3>${escapeHtml(quote.quoteNumber)}</h3>
      </div>
      <span class="${internalBadge.className}">${escapeHtml(internalBadge.label)}</span>
    </div>

    <div class="approval-review-metrics">
      <div><small>Client outcome</small><strong>${escapeHtml(clientOutcomeLabel)}</strong></div>
      <div><small>Internal status</small><strong><span class="${internalBadge.className}">${escapeHtml(internalBadge.label)}</span></strong></div>
      <div><small>Library status</small><strong><span class="${statusBadge.className}">${escapeHtml(statusBadge.label)}</span></strong></div>
      ${isInternalApproved && isClientApproved ? `<div><small>Payment status</small><strong><span class="${paymentBadge.className}">${escapeHtml(paymentBadge.label)}</span></strong></div>` : ""}
      <div><small>Total incl. VAT</small><strong>${money.format(total)}</strong></div>
      <div><small>Supplier quotation</small><strong>${renderSupplierDocumentAccess(quote)}</strong></div>
      <div><small>Decision date</small><strong>${escapeHtml((quote.approvedDate || quote.decidedAt) ? new Date(quote.approvedDate || quote.decidedAt).toLocaleDateString("en-ZA") : "-")}</strong></div>
    </div>

    ${renderInternalCostingPanel(quote)}

    <div class="library-outcome-panel">
      <h3>Client outcome</h3>
      ${isInternalApproved ? `
        <div class="approval-detail-actions">
          <button class="primary-btn" type="button" data-send-client="${quote.id}">Send to Client</button>
          <button class="secondary-btn" type="button" data-client-print="${quote.id}">Print Client Quotation</button>
          <button class="secondary-btn" type="button" data-client-download="${quote.id}">Download Client PDF</button>
          <button class="primary-btn" type="button" data-client-approved="${quote.id}">Mark as Accepted</button>
          <button class="danger-btn" type="button" data-client-rejected="${quote.id}">Mark as Declined</button>
        </div>
        <label class="${isClientRejected && !quote.clientRejectionReason ? "field-error-wrap" : ""}">
          Client rejection reason
          <textarea id="clientRejectionReason" rows="3" placeholder="Required when rejected by client..." spellcheck="false">${escapeHtml(quote.clientRejectionReason || "")}</textarea>
        </label>
      ` : `
        <p class="empty-state">This quotation was rejected internally.</p>
        <p><strong>Internal rejection reason:</strong> ${escapeHtml(quote.rejectionReason || "No reason captured")}</p>
      `}
    </div>

    <div class="revision-history-panel">
      <h3>Revision history</h3>
      ${renderRevisionHistory(quote)}
    </div>

    ${isInternalApproved && isClientApproved ? `
      <div class="payment-tracking-panel">
        <h3>Payment tracking</h3>
        <div class="payment-checkboxes">
          <label>
            <input type="checkbox" data-payment-field="depositReceived" ${quote.depositReceived ? "checked" : ""} />
            Deposit received
          </label>
          <label>
            <input type="checkbox" data-payment-field="paidInFull" ${quote.paidInFull ? "checked" : ""} ${quote.depositReceived ? "" : "disabled"} />
            Paid in full
          </label>
        </div>
        <p class="payment-note">${quote.depositReceived ? "Payment has started." : "Deposit has not been marked as received yet."}</p>
      </div>

      <div class="library-documents-panel">
        <h3>Required documents</h3>
        ${missing.length ? `<p class="document-warning">Documents outstanding: ${escapeHtml(missing.join(", "))}</p>` : `<p class="document-complete">Documents complete.</p>`}
        <div class="document-upload-grid">
          <label>
            Supplier POP / proof of payment
            <input type="file" multiple data-library-doc="supplierPop" />
            ${documents.supplierPop.length
              ? documents.supplierPop.map((document) => renderDocumentAccess(document, "Missing POP")).join("")
              : renderDocumentAccess(null, "Missing POP")}
          </label>
          <label>
            Invoice issued to client
            <input type="file" multiple data-library-doc="clientInvoice" />
            ${documents.clientInvoice.length
              ? documents.clientInvoice.map((document) => renderDocumentAccess(document, "Missing invoice")).join("")
              : renderDocumentAccess(null, "Missing invoice")}
          </label>
          <label>
            Job card/s
            <input type="file" multiple data-library-doc="jobCards" />
            ${documents.jobCards.length
              ? documents.jobCards.map((jobCard) => renderDocumentAccess(jobCard, "Missing job cards")).join("")
              : renderDocumentAccess(null, "Missing job cards")}
          </label>
        </div>
      </div>
    ` : ""}

    <div class="quote-preview approval-quote">
      <div class="company-strip quotation-brand">
        <img class="quotation-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <div>
          <h2>${escapeHtml(company?.name || "No company selected")}</h2>
          <p>Reg no: ${escapeHtml(company?.registration || "-")} | VAT No: ${escapeHtml(company?.vat || "-")}</p>
        </div>
      </div>
      <div class="preview-meta">
        <div><small>Client Detail</small><strong>${escapeHtml([quote.clientName, quote.clientAddress].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Contact Detail</small><strong>${escapeHtml([quote.contactPerson, quote.contactEmail, quote.contactNumber].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Sales Rep</small><strong>${escapeHtml([salesRep?.name, salesRep?.email, salesRep?.phone].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Date</small><strong>${escapeHtml(formatDate(quote.quoteDate))}</strong></div>
      </div>
      <div class="equipment-description">
        <h3>Scope of Work</h3>
        <p>${escapeHtml(quote.projectSummary || fixedScopeText)}</p>
      </div>
      <div class="quotation-table">
        <div class="quotation-table-header">
          <span>Stock Code</span>
          <span>Description</span>
          <span>Cost Per Unit Excl. VAT</span>
          <span>Quantity</span>
          <span>Total Cost Excl. VAT</span>
        </div>
        ${items || `<div class="quotation-table-row"><span>-</span><span>No line items</span><span>-</span><span>-</span><strong>-</strong></div>`}
      </div>
    </div>

    <div class="approval-detail-actions">
      <button class="secondary-btn" type="button" data-back-library="true">Back to quote library</button>
      <button class="secondary-btn" type="button" data-open-supplier="${quote.id}">Open supplier quotation</button>
      ${canViewInternal ? `<button class="secondary-btn" type="button" data-processed-print="${quote.id}">Print Costing</button>` : ""}
      ${canViewInternal ? `<button class="secondary-btn" type="button" data-processed-download="${quote.id}">Download Costing PDF</button>` : ""}
      ${canRevise ? `<button class="primary-btn" type="button" data-revise-quote="${quote.id}">Edit / Revise Quotation</button>` : ""}
    </div>
    <div class="library-documents-panel">
      <h3>Supplier quotation uploads</h3>
      ${renderSupplierDocumentButtons(quote)}
    </div>
  `;
}

function renderQuoteLibrary() {
  const quotes = libraryQuotes();
  quoteLibraryList.innerHTML = "";
  quoteLibraryDetail.innerHTML = "";

  if (state.selectedLibraryId) {
    const selectedQuote = quotes.find((quote) => quote.id === state.selectedLibraryId);
    if (selectedQuote) {
      quoteLibraryList.hidden = true;
      quoteLibraryDetail.hidden = false;
      renderQuoteLibraryDetail(selectedQuote);
      return;
    }
    state.selectedLibraryId = "";
  }

  quoteLibraryList.hidden = false;
  quoteLibraryDetail.hidden = true;

  if (!quotes.length) {
    quoteLibraryList.innerHTML = `<p class="empty-state">No quotations have been submitted yet.</p>`;
    return;
  }

  quoteLibraryList.innerHTML = `
    <div class="approval-filterbar">
      <label>
        Internal status
        <select id="libraryInternalStatusFilter">
          <option value="">All</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Sent to Client">Sent to Client</option>
          <option value="Client Accepted">Client Accepted</option>
          <option value="Client Declined">Client Declined</option>
        </select>
      </label>
      <label>
        Client outcome
        <select id="libraryClientOutcomeFilter">
          <option value="">All</option>
          <option value="awaiting">Awaiting client outcome</option>
          <option value="Approved by client">Approved by client</option>
          <option value="Rejected by client">Rejected by client</option>
        </select>
      </label>
      <label>
        Search
        <input id="librarySearch" type="search" placeholder="Search by client, quote number, requester..." />
      </label>
      <label>
        Quote number
        <input id="libraryQuoteNumberFilter" type="search" placeholder="Q-2026-0001" />
      </label>
      <label>
        Client name
        <input id="libraryClientFilter" type="search" placeholder="Client name" />
      </label>
      <label>
        Sales rep/member
        <input id="librarySalesRepFilter" type="search" placeholder="Sales rep" />
      </label>
      <label>
        Date from
        <input id="libraryDateFromFilter" type="date" />
      </label>
      <label>
        Date to
        <input id="libraryDateToFilter" type="date" />
      </label>
      <label>
        Minimum total
        <input id="libraryMinTotalFilter" type="number" min="0" step="0.01" />
      </label>
      <label>
        Maximum total
        <input id="libraryMaxTotalFilter" type="number" min="0" step="0.01" />
      </label>
      <div class="filter-actions">
        <button class="secondary-btn" type="button" id="libraryClearFilters">Clear filters</button>
        <button class="secondary-btn" type="button" id="libraryExportFiltered">Export filtered results</button>
      </div>
    </div>
    <div class="approval-table library-table" role="table" aria-label="Quote library">
      <div class="approval-table-header" role="row">
        <span>Description</span>
        <span>Requester</span>
        <span>Amount</span>
        <span>Internal Status</span>
        <span>Client Outcome</span>
        <span>Payment</span>
        <span>Documents</span>
        <span>Actions</span>
      </div>
      <div id="libraryRows"></div>
    </div>
  `;

  const libraryRows = quoteLibraryList.querySelector("#libraryRows");
  const renderRows = (rows) => {
    libraryRows.innerHTML = "";
    if (!rows.length) {
      libraryRows.innerHTML = `<p class="empty-state approval-table-empty">No library quotations match this filter.</p>`;
      return;
    }

    rows.forEach((quote) => {
      const salesRep = salesReps[quote.salesRep];
      const statusBadge = libraryStatusBadge(quote);
      const internalBadge = internalStatusBadge(quote);
      const paymentBadge = paymentStatusBadge(quote);
      const showPayment = ["approved", "sent_to_client", "client_accepted"].includes(normalizedStatus(quote.status)) && libraryClientOutcomeLabel(quote) === "Approved by client";
      const row = document.createElement("div");
      row.className = `approval-table-row ${["approved", "sent_to_client", "client_accepted", "client_declined"].includes(normalizedStatus(quote.status)) ? "row-internal-approved" : "row-internal-rejected"}`;
      row.dataset.viewLibrary = quote.id;
      row.innerHTML = `
        <span>
          <strong>${escapeHtml(quote.clientName || quote.quoteNumber)}</strong>
          <small>${escapeHtml(quote.quoteNumber)} | ${escapeHtml(companies[quote.selectedCompany]?.name || "No company selected")}</small>
        </span>
        <span>
          <strong>${escapeHtml(salesRep?.name || "Unknown")}</strong>
          <small>${escapeHtml(salesRep?.email || currentUser())}</small>
        </span>
        <span>${money.format(quoteSubtotal(quote) * (1 + state.taxRate))}</span>
        <span><mark class="${internalBadge.className}">${escapeHtml(internalBadge.label)}</mark></span>
        <span><mark class="${statusBadge.className}">${escapeHtml(libraryClientOutcomeLabel(quote))}</mark></span>
        <span>${showPayment ? `<mark class="${paymentBadge.className}">${escapeHtml(paymentBadge.label)}</mark>` : "-"}</span>
        <span>${escapeHtml(libraryDocumentStatus(quote))}</span>
        <span class="approval-row-actions">
          <button class="secondary-btn" type="button" data-view-library="${quote.id}">View</button>
          <button class="secondary-btn" type="button" data-open-supplier="${quote.id}">Supplier quote</button>
          ${canReviseQuote(quote) ? `<button class="primary-btn" type="button" data-revise-quote="${quote.id}">Revise</button>` : ""}
        </span>
      `;
      libraryRows.appendChild(row);
    });
  };

  const applyFilters = () => {
    const internalStatus = quoteLibraryList.querySelector("#libraryInternalStatusFilter").value;
    const clientOutcome = quoteLibraryList.querySelector("#libraryClientOutcomeFilter").value;
    const query = quoteLibraryList.querySelector("#librarySearch").value.trim().toLowerCase();
    const quoteNumberQuery = quoteLibraryList.querySelector("#libraryQuoteNumberFilter").value.trim().toLowerCase();
    const clientQuery = quoteLibraryList.querySelector("#libraryClientFilter").value.trim().toLowerCase();
    const salesRepQuery = quoteLibraryList.querySelector("#librarySalesRepFilter").value.trim().toLowerCase();
    const dateFrom = quoteLibraryList.querySelector("#libraryDateFromFilter").value;
    const dateTo = quoteLibraryList.querySelector("#libraryDateToFilter").value;
    const minTotal = Number(quoteLibraryList.querySelector("#libraryMinTotalFilter").value || 0);
    const maxTotalRaw = quoteLibraryList.querySelector("#libraryMaxTotalFilter").value;
    const maxTotal = maxTotalRaw ? Number(maxTotalRaw) : Infinity;
    const filtered = quotes.filter((quote) => {
      const salesRep = salesReps[quote.salesRep];
      const quoteDate = (quote.quoteDate || quote.submittedAt || "").slice(0, 10);
      const total = quoteSubtotal(quote) * (1 + state.taxRate);
      const internalStatusMatch = !internalStatus || normalizedStatus(quote.status) === normalizedStatus(internalStatus);
      const clientOutcomeLabel = libraryClientOutcomeLabel(quote);
      const clientOutcomeMatch = !clientOutcome || (
        clientOutcome === "awaiting"
          ? clientOutcomeLabel === "Awaiting client outcome"
          : clientOutcomeLabel === clientOutcome
      );
      const searchMatch = [
        quote.clientName,
        quote.quoteNumber,
        companies[quote.selectedCompany]?.name,
        salesRep?.name,
        salesRep?.email,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
      const quoteNumberMatch = !quoteNumberQuery || String(quote.quoteNumber || "").toLowerCase().includes(quoteNumberQuery);
      const clientMatch = !clientQuery || String(quote.clientName || "").toLowerCase().includes(clientQuery);
      const salesRepMatch = !salesRepQuery || [salesRep?.name, salesRep?.email, quote.createdByName, quote.submittedByName].filter(Boolean).join(" ").toLowerCase().includes(salesRepQuery);
      const dateMatch = (!dateFrom || quoteDate >= dateFrom) && (!dateTo || quoteDate <= dateTo);
      const totalMatch = total >= minTotal && total <= maxTotal;
      return internalStatusMatch && clientOutcomeMatch && searchMatch && quoteNumberMatch && clientMatch && salesRepMatch && dateMatch && totalMatch;
    });
    renderRows(filtered);
    quoteLibraryList.dataset.filteredIds = JSON.stringify(filtered.map((quote) => quote.id));
  };

  renderRows(quotes);
  quoteLibraryList.dataset.filteredIds = JSON.stringify(quotes.map((quote) => quote.id));
  quoteLibraryList.querySelector("#libraryInternalStatusFilter").addEventListener("change", applyFilters);
  quoteLibraryList.querySelector("#libraryClientOutcomeFilter").addEventListener("change", applyFilters);
  quoteLibraryList.querySelector("#librarySearch").addEventListener("input", applyFilters);
  ["libraryQuoteNumberFilter", "libraryClientFilter", "librarySalesRepFilter", "libraryDateFromFilter", "libraryDateToFilter", "libraryMinTotalFilter", "libraryMaxTotalFilter"].forEach((id) => {
    quoteLibraryList.querySelector(`#${id}`).addEventListener("input", applyFilters);
  });
  quoteLibraryList.querySelector("#libraryClearFilters").addEventListener("click", () => {
    quoteLibraryList.querySelectorAll("input, select").forEach((input) => { input.value = ""; });
    applyFilters();
  });
  quoteLibraryList.querySelector("#libraryExportFiltered").addEventListener("click", () => {
    const ids = JSON.parse(quoteLibraryList.dataset.filteredIds || "[]");
    const rows = quotes.filter((quote) => ids.includes(quote.id)).map((quote) => [
      quote.quoteNumber,
      quote.clientName,
      salesRepNameForQuote(quote),
      quote.status,
      libraryClientOutcomeLabel(quote),
      quoteSubtotal(quote) * (1 + state.taxRate),
    ]);
    const csv = [["Quote number", "Client", "Sales rep", "Status", "Client outcome", "Total"], ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `quote-library-filtered-${todayInputValue()}.csv`);
  });
}

function markInvalid(element) {
  if (!element) return;
  element.classList.add("field-error");
  element.setAttribute("aria-invalid", "true");
}

function validateQuote() {
  clearValidation();

  const missing = [];
  const requiredFields = [
    [fields.selectedCompany, "Quoting company"],
    [fields.clientName, "Business / client name"],
    [fields.clientAddress, "Business / client address"],
    [fields.contactPerson, "Contact name and surname"],
    [fields.contactEmail, "Contact email"],
    [fields.contactNumber, "Contact number"],
    [fields.salesRep, "Sales rep"],
  ];

  requiredFields.forEach(([field, label]) => {
    if (!field.value.trim()) {
      missing.push(label);
      markInvalid(field);
    }
  });

  if (!state.supplierQuotes.length) {
    missing.push("Supplier quotation upload");
    markInvalid(supplierQuoteUpload);
  }

  if (!state.items.length) {
    missing.push("At least one line item");
  }

  state.items.forEach((item, index) => {
    const row = itemsBody.querySelector(`[data-index="${index}"]`)?.closest(".item-row");
    const rowLabel = `Line item ${index + 1}`;

    if (!item.stockCode?.trim()) {
      missing.push(`${rowLabel} stock code`);
      markInvalid(row?.querySelector('[data-field="stockCode"]'));
    }
    if (!item.description?.trim()) {
      missing.push(`${rowLabel} description`);
      markInvalid(row?.querySelector('[data-field="description"]'));
    }
    if (Number(item.quantity || 0) <= 0) {
      missing.push(`${rowLabel} quantity`);
      markInvalid(row?.querySelector('[data-field="quantity"]'));
    }
    if (supplierCost(item) <= 0) {
      missing.push(`${rowLabel} supplier cost`);
      markInvalid(row?.querySelector('[data-field="supplierCost"]'));
    }
  });

  if (missing.length) {
    validationSummary.hidden = false;
    validationSummary.textContent = `Complete these fields before generating the quotation: ${missing.join(", ")}.`;
    document.querySelector(".field-error")?.focus();
    return false;
  }

  const costing = costingValues();
  const quoteSubtotalValue = quoteCostingSubtotal();
  if (costing.costingTotal !== quoteSubtotalValue) {
    validationSummary.hidden = false;
    validationSummary.textContent = "The costing is not correct. Please check the costing before submitting for approval.";
    [costingStockCost, costingConsumablesCost, costingLabourCost].forEach(markInvalid);
    costingStockCost?.focus();
    return false;
  }

  return true;
}

function renderItems() {
  itemsBody.innerHTML = "";

  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";

    const stockCode = document.createElement("input");
    stockCode.setAttribute("aria-label", "Stock code");
    stockCode.spellcheck = false;
    stockCode.value = item.stockCode || "";
    stockCode.dataset.field = "stockCode";
    stockCode.dataset.index = index;

    const description = document.createElement("input");
    description.setAttribute("aria-label", "Item description");
    description.spellcheck = true;
    description.value = item.description;
    description.dataset.field = "description";
    description.dataset.index = index;

    const quantity = document.createElement("input");
    quantity.setAttribute("aria-label", "Quantity");
    quantity.spellcheck = false;
    quantity.type = "number";
    quantity.min = "0";
    quantity.step = "1";
    quantity.value = item.quantity;
    quantity.dataset.field = "quantity";
    quantity.dataset.index = index;

    const supplierCostInput = document.createElement("input");
    supplierCostInput.setAttribute("aria-label", "Supplier cost excluding VAT");
    supplierCostInput.spellcheck = false;
    supplierCostInput.type = "number";
    supplierCostInput.min = "0";
    supplierCostInput.step = "0.01";
    supplierCostInput.value = supplierCost(item);
    supplierCostInput.dataset.field = "supplierCost";
    supplierCostInput.dataset.index = index;

    const sellingPrice = document.createElement("strong");
    sellingPrice.className = "calculated-cost";
    sellingPrice.textContent = money.format(markedUpUnitPrice(item));

    const total = document.createElement("strong");
    total.className = "item-total";
    total.textContent = money.format(itemTotal(item));

    const remove = document.createElement("button");
    remove.className = "danger-btn";
    remove.type = "button";
    remove.setAttribute("aria-label", "Remove item");
    remove.dataset.remove = index;
    remove.textContent = "x";

    row.append(stockCode, description, quantity, supplierCostInput, sellingPrice, total, remove);
    itemsBody.appendChild(row);
  });
}

function renderPreview() {
  state.markupPercent = Number(fields.markupPercent.value || 20);

  const subtotal = state.items.reduce((sum, item) => sum + itemTotal(item), 0);
  const tax = subtotal * state.taxRate;
  const total = subtotal + tax;
  const company = companies[fields.selectedCompany.value];
  const salesRep = salesReps[fields.salesRep.value];

  document.querySelector("#previewCompanyName").textContent = company?.name || "Select quoting company";
  document.querySelector("#previewCompanyRegVat").textContent = company
    ? `Reg no: ${company.registration} | VAT No: ${company.vat}`
    : "Reg no: - | VAT No: -";
  document.querySelector("#previewCompanyAddress").textContent = company?.address || "Select quoting company";
  document.querySelector("#previewCompanyContact").textContent =
    company ? `Tel: ${company.phone} / Email: ${company.email} / Website: ${company.website}` : "Tel: - / Email: - / Website: -";
  document.querySelector("#previewQuoteNumber").textContent = fields.quoteNumber.value || "Draft quote";
  document.querySelector("#previewStatus").textContent = state.revisingQuoteId ? `Revision ${state.revisionNumber}` : "Draft";
  document.querySelector("#saveQuote").textContent = state.revisingQuoteId ? "Resubmit revision for approval" : "Submit for approval";
  document.querySelector("#previewClient").textContent = [
    fields.clientName.value || "No client yet",
    fields.clientAddress.value,
  ].filter(Boolean).join("\n");
  document.querySelector("#previewContactPerson").textContent = [
    fields.contactPerson.value || "No contact yet",
    fields.contactEmail.value,
    fields.contactNumber.value,
  ].filter(Boolean).join("\n");
  document.querySelector("#previewSalesRep").textContent = [
    salesRep?.name || "No sales rep selected",
    salesRep?.email,
    salesRep?.phone,
  ].filter(Boolean).join("\n");
  document.querySelector("#previewQuoteDate").textContent = formatDate(fields.quoteDate.value);
  document.querySelector("#previewSummary").textContent = scopeText();
  document.querySelector("#previewTerms").textContent = isAutoTerms(fields.termsText.value)
    ? buildTerms()
    : fields.termsText.value;
  document.querySelector("#subtotal").textContent = money.format(subtotal);
  document.querySelector("#tax").textContent = money.format(tax);
  document.querySelector("#grandTotal").textContent = money.format(total);
  document.querySelector("#previewBankName").textContent = company?.bankName || "-";
  document.querySelector("#previewAccountHolder").textContent = company?.name || "-";
  document.querySelector("#previewAccountType").textContent = company?.accountType || "-";
  document.querySelector("#previewAccountNumber").textContent = company?.accountNumber || "-";
  document.querySelector("#previewBranchCode").textContent = company?.branchCode || "-";
  document.querySelector("#referenceQuoteNumber").textContent = fields.quoteNumber.value || "Draft quote";
  renderCosting();

  previewItems.innerHTML = "";
  state.items.forEach((item) => {
    const previewItem = document.createElement("div");
    previewItem.className = "quotation-table-row";

    const stockCode = document.createElement("span");
    stockCode.textContent = item.stockCode || "";

    const description = document.createElement("span");
    description.textContent = item.description || "";

    const price = document.createElement("span");
    price.textContent = money.format(markedUpUnitPrice(item));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity || 0;

    const total = document.createElement("strong");
    total.textContent = money.format(itemTotal(item));

    previewItem.append(stockCode, description, price, quantity, total);
    previewItems.appendChild(previewItem);
  });
}

function renderAll() {
  renderItems();
  renderPreview();
}

function renderCosting() {
  if (!costingStockCost) return;
  costingStockCost.value = state.costing.stockCost || 0;
  costingConsumablesCost.value = state.costing.consumablesCost || 0;
  costingLabourCost.value = state.costing.labourCost || 0;
  const values = costingValues();
  costingStockMarkup.textContent = money.format(values.stockMarkup);
  costingStockTotal.textContent = money.format(values.stockTotal);
  costingConsumablesMarkup.textContent = money.format(values.consumablesMarkup);
  costingConsumablesTotal.textContent = money.format(values.consumablesTotal);
  costingLabourMarkup.textContent = money.format(values.labourMarkup);
  costingLabourTotal.textContent = money.format(values.labourTotal);
  costingRawTotal.textContent = money.format(values.totalCostValue);
  costingGrandTotal.textContent = money.format(values.costingTotal);
  costingTotalMarkup.textContent = money.format(values.totalMarkup);
  costingLabourAmount.textContent = money.format(values.labourCost);
  costingMarkupLabourTotal.textContent = money.format(values.markupAndLabourTotal);
  costingDeduction16.textContent = money.format(values.deduction16);
  costingProfit.textContent = money.format(values.profit);
  costingCommission4.textContent = money.format(values.commission4);
  costingTotalQuotationProfit.textContent = money.format(values.totalQuotationProfit);
  const quoteTotal = quoteCostingSubtotal();
  const balanced = values.costingTotal === quoteTotal;
  costingBalanceNote.textContent = balanced
    ? `Costing balances with quotation total excl. VAT: ${money.format(quoteTotal)}.`
    : `Costing total must match quotation total excluding VAT (${money.format(quoteTotal)}).`;
  costingBalanceNote.classList.toggle("costing-warning", !balanced);
}

async function saveQuote() {
  if (!enforceAccess("builder")) return;
  refreshAutoTerms();
  renderPreview();
  if (!validateQuote()) return;

  try {
    await submitCurrentQuoteForApproval();
    localStorage.removeItem("quotePilotDraft");
    alert("Quotation and supplier quotation submitted for approval.");
    resetQuoteForm();
  } catch {
    alert("The supplier quotation could not be saved. Please try uploading it again before submitting.");
  }
}

function loadSavedQuote() {
  const saved = localStorage.getItem("quotePilotDraft");
  if (!saved) return false;

  let payload;
  try {
    payload = JSON.parse(saved);
  } catch {
    localStorage.removeItem("quotePilotDraft");
    return false;
  }

  Object.keys(fields).forEach((key) => {
    fields[key].value = payload[key] || "";
  });
  fields.projectSummary.value = payload.additionalScope || payload.projectSummary || "";
  fields.salesRep.value = salesReps[payload.salesRep] ? payload.salesRep : "";
  fields.quoteDate.value = todayInputValue();
  fields.validityDays.value = payload.validityDays || 30;
  fields.validUntil.value = payload.validUntil || dateInputValue(addDays(fields.quoteDate.value, Number(fields.validityDays.value || 30)));
  fields.selectedCompany.value = companies[payload.selectedCompany] ? payload.selectedCompany : "";
  fields.markupPercent.value = payload.markupPercent || "20";
  state.supplierQuotes = supplierQuoteList(payload);
  state.supplierQuote = state.supplierQuotes[0] || null;
  state.supplierQuoteFiles = [];
  state.costing = payload.costing || { stockCost: 0, consumablesCost: 0, labourCost: 0 };
  supplierQuoteUpload.value = "";
  updateSupplierQuoteDisplay();
  state.markupPercent = Number(fields.markupPercent.value);
  state.items = payload.items?.length ? payload.items : state.items;
  return true;
}

function generateDraft() {
  fields.termsText.value = buildTerms();
  renderPreview();
}

function fillSample() {
  fields.selectedCompany.value = "isc-limpopo";
  fields.clientName.value = "Mokoena Electrical";
  fields.clientAddress.value = "12 Main Road, Johannesburg";
  fields.contactPerson.value = "Thabo Mokoena";
  fields.contactEmail.value = "thabo@example.co.za";
  fields.contactNumber.value = "082 000 0000";
  fields.salesRep.value = "elzeri-wright";
  fields.quoteDate.value = todayInputValue();
  fields.markupPercent.value = "35";
  fields.projectSummary.value =
    "A local service business needs a professional quotation platform to prepare client quotes faster, calculate totals, and export polished documents.";
  state.items = [
    { stockCode: "Q-DASH", description: "Client and quote dashboard", quantity: 1, supplierCost: 6500 },
    { stockCode: "Q-BUILD", description: "Quotation builder with totals", quantity: 1, supplierCost: 7800 },
    { stockCode: "AI-WORD", description: "AI wording assistant integration", quantity: 1, supplierCost: 5200 },
    { stockCode: "PDF-EXP", description: "PDF export template", quantity: 1, supplierCost: 3400 },
  ];
  generateDraft();
  renderAll();
}

itemsBody.addEventListener("input", (event) => {
  const input = event.target;
  const index = Number(input.dataset.index);
  const field = input.dataset.field;
  if (!field) return;

  state.items[index][field] = ["description", "stockCode"].includes(field) ? input.value : Number(input.value);
  if (input.classList.contains("field-error")) {
    const isTextValid = ["description", "stockCode"].includes(field) && input.value.trim();
    const isNumberValid = !["description", "stockCode"].includes(field) && Number(input.value || 0) > 0;
    if (isTextValid || isNumberValid) {
      input.classList.remove("field-error");
      input.removeAttribute("aria-invalid");
    }
  }
  const row = input.closest(".item-row");
  row.querySelector(".calculated-cost").textContent = money.format(markedUpUnitPrice(state.items[index]));
  row.querySelector(".item-total").textContent = money.format(itemTotal(state.items[index]));
  renderPreview();
});

itemsBody.addEventListener("click", (event) => {
  const removeIndex = event.target.dataset.remove;
  if (removeIndex === undefined) return;
  state.items.splice(Number(removeIndex), 1);
  renderAll();
});

document.querySelector("#addItem").addEventListener("click", () => {
  state.items.push({ stockCode: "", description: "", quantity: 1, supplierCost: 0 });
  renderAll();
});

document.querySelector("#generateAi").addEventListener("click", generateDraft);
document.querySelector("#fillSample").addEventListener("click", fillSample);
document.querySelector("#newQuote").addEventListener("click", resetQuoteForm);
document.querySelector("#saveQuote").addEventListener("click", saveQuote);
approvalList.addEventListener("click", (event) => {
  if (!enforceAccess("approvals")) return;
  const approveId = event.target.dataset.approve;
  const startRejectId = event.target.dataset.startReject;
  const viewButtonId = event.target.dataset.viewApproval;
  const row = event.target.closest(".approval-table-row");
  const viewApprovalId = viewButtonId || row?.dataset.viewApproval;

  if (approveId) {
    event.stopPropagation();
    decideQuote(approveId, "Approved");
    return;
  }

  if (startRejectId) {
    event.stopPropagation();
    state.selectedApprovalId = startRejectId;
    state.focusRejectionReason = true;
    renderApprovals();
    return;
  }

  if (viewApprovalId) {
    state.selectedApprovalId = viewApprovalId;
    renderApprovals();
  }
});

approvalDetail.addEventListener("click", (event) => {
  if (!enforceAccess("approvals")) return;
  const approveId = event.target.dataset.approve;
  const rejectId = event.target.dataset.reject;
  const openSupplierId = event.target.dataset.openSupplier;
  const downloadSupplierId = event.target.dataset.downloadSupplier;
  const removeSupplierDocId = event.target.dataset.removeSupplierDoc;
  const supplierFileId = event.target.dataset.supplierFile || "";
  const processedPrintId = event.target.dataset.processedPrint;
  const processedDownloadId = event.target.dataset.processedDownload;
  const backToList = event.target.dataset.backApprovals;
  if (backToList) {
    state.selectedApprovalId = "";
    renderApprovals();
  }
  if (openSupplierId) openSupplierQuote(openSupplierId, supplierFileId, "view");
  if (downloadSupplierId) openSupplierQuote(downloadSupplierId, supplierFileId, "download");
  if (processedPrintId) openProcessedQuotation(processedPrintId);
  if (processedDownloadId) openProcessedQuotation(processedDownloadId);
  if (removeSupplierDocId) {
    const quote = loadApprovals().find((item) => item.id === removeSupplierDocId);
    const supplierQuotes = supplierQuoteList(quote).filter((file) => file.fileId !== supplierFileId);
    updateStoredQuote(removeSupplierDocId, { supplierQuotes, supplierQuote: supplierQuotes[0] || null });
    writeAudit("Removed supplier quotation document", quote?.quoteNumber || removeSupplierDocId);
    renderApprovals();
  }
  if (approveId) decideQuote(approveId, "Approved");
  if (rejectId) {
    const reasonField = document.querySelector("#rejectionReason");
    const reason = reasonField?.value.trim() || "";
    if (!reason) {
      markInvalid(reasonField);
      reasonField?.focus();
      return;
    }
    decideQuote(rejectId, "Rejected", reason);
  }
});

quoteLibraryList.addEventListener("click", (event) => {
  if (!enforceAccess("library")) return;
  const openSupplierId = event.target.dataset.openSupplier;
  const reviseQuoteId = event.target.dataset.reviseQuote;
  if (reviseQuoteId) {
    event.stopPropagation();
    reviseRejectedQuote(reviseQuoteId);
    return;
  }
  if (openSupplierId) {
    openSupplierQuote(openSupplierId);
    return;
  }

  const row = event.target.closest("[data-view-library]");
  const viewLibraryId = row?.dataset.viewLibrary;
  if (viewLibraryId) {
    state.selectedLibraryId = viewLibraryId;
    renderQuoteLibrary();
  }
});

quoteLibraryDetail.addEventListener("click", (event) => {
  if (!enforceAccess("library")) return;
  const quoteId = state.selectedLibraryId;
  const backToLibrary = event.target.dataset.backLibrary;
  const openSupplierId = event.target.dataset.openSupplier;
  const downloadSupplierId = event.target.dataset.downloadSupplier;
  const removeSupplierDocId = event.target.dataset.removeSupplierDoc;
  const supplierFileId = event.target.dataset.supplierFile || "";
  const processedPrintId = event.target.dataset.processedPrint;
  const processedDownloadId = event.target.dataset.processedDownload;
  const openLibraryDocId = event.target.dataset.openLibraryDoc;
  const downloadLibraryDocId = event.target.dataset.downloadLibraryDoc;
  const removeLibraryDocId = event.target.dataset.removeLibraryDoc;
  const clientApprovedId = event.target.dataset.clientApproved;
  const clientRejectedId = event.target.dataset.clientRejected;
  const sendClientId = event.target.dataset.sendClient;
  const clientPrintId = event.target.dataset.clientPrint;
  const clientDownloadId = event.target.dataset.clientDownload;
  const reviseQuoteId = event.target.dataset.reviseQuote;

  if (backToLibrary) {
    state.selectedLibraryId = "";
    renderQuoteLibrary();
    return;
  }

  if (openSupplierId) openSupplierQuote(openSupplierId, supplierFileId, "view");
  if (downloadSupplierId) openSupplierQuote(downloadSupplierId, supplierFileId, "download");
  if (processedPrintId) openProcessedQuotation(processedPrintId);
  if (processedDownloadId) openProcessedQuotation(processedDownloadId);
  if (sendClientId) {
    sendQuoteToClient(sendClientId);
    renderQuoteLibrary();
    return;
  }
  if (clientPrintId) openClientQuotation(clientPrintId);
  if (clientDownloadId) openClientQuotation(clientDownloadId);
  if (removeSupplierDocId) {
    const quote = loadApprovals().find((item) => item.id === removeSupplierDocId);
    const supplierQuotes = supplierQuoteList(quote).filter((file) => file.fileId !== supplierFileId);
    updateStoredQuote(removeSupplierDocId, { supplierQuotes, supplierQuote: supplierQuotes[0] || null });
    writeAudit("Removed supplier quotation document", quote?.quoteNumber || removeSupplierDocId);
    renderQuoteLibrary();
    return;
  }
  if (openLibraryDocId) openLibraryDocument(openLibraryDocId, "view");
  if (downloadLibraryDocId) openLibraryDocument(downloadLibraryDocId, "download");
  if (removeLibraryDocId && state.selectedLibraryId) {
    const quote = libraryQuotes().find((item) => item.id === state.selectedLibraryId);
    if (!quote) return;
    const documents = quoteDocuments(quote);
    documents.supplierPop = documents.supplierPop.filter((document) => document.fileId !== removeLibraryDocId);
    documents.clientInvoice = documents.clientInvoice.filter((document) => document.fileId !== removeLibraryDocId);
    documents.jobCards = documents.jobCards.filter((document) => document.fileId !== removeLibraryDocId);
    updateStoredQuote(state.selectedLibraryId, { documents });
    writeAudit("Removed uploaded document", quote.quoteNumber, "Quote Library", quote.quoteNumber, removeLibraryDocId);
    renderQuoteLibrary();
    return;
  }
  if (reviseQuoteId) reviseRejectedQuote(reviseQuoteId);

  if (clientApprovedId) {
    updateStoredQuote(clientApprovedId, {
      status: "Client Accepted",
      approvalStatus: "Client Accepted",
      workflowStatus: "Client Accepted",
      clientOutcome: "Approved by client",
      clientRejectionReason: "",
    });
    writeAudit("Client approved quotation", clientApprovedId);
    renderQuoteLibrary();
  }

  if (clientRejectedId) {
    const reasonField = document.querySelector("#clientRejectionReason");
    const reason = reasonField?.value.trim() || "";
    if (!reason) {
      markInvalid(reasonField);
      reasonField?.focus();
      return;
    }
    updateStoredQuote(clientRejectedId, {
      status: "Client Declined",
      approvalStatus: "Client Declined",
      workflowStatus: "Client Declined",
      clientOutcome: "Rejected by client",
      rejectionSource: "client",
      clientRejectionReason: reason,
    });
    writeAudit("Client rejected quotation", clientRejectedId);
    renderQuoteLibrary();
  }
});

quoteLibraryDetail.addEventListener("change", async (event) => {
  if (!enforceAccess("library")) return;
  const paymentField = event.target.dataset.paymentField;
  if (paymentField && state.selectedLibraryId) {
    const quote = libraryQuotes().find((item) => item.id === state.selectedLibraryId);
    if (!quote) return;
    if (!(normalizedStatus(quote.status) === "client_accepted" || quote.clientOutcome === "Approved by client")) return;

    const updates = { [paymentField]: event.target.checked };
    if (paymentField === "depositReceived" && !event.target.checked) {
      updates.paidInFull = false;
    }
    if (paymentField === "paidInFull" && event.target.checked) {
      updates.depositReceived = true;
    }
    updateStoredQuote(state.selectedLibraryId, updates);
    writeAudit("Updated payment tracking", `${quote.quoteNumber} ${paymentField}`, "Quote Library", quote.quoteNumber, event.target.checked ? "Checked" : "Unchecked");
    renderQuoteLibrary();
    return;
  }

  const docType = event.target.dataset.libraryDoc;
  if (!docType || !state.selectedLibraryId) return;

  const quote = libraryQuotes().find((item) => item.id === state.selectedLibraryId);
  if (!quote) return;

  const documents = quoteDocuments(quote);
  const files = Array.from(event.target.files || []);
  const metadata = files.map(fileMetadata);
  documents[docType] = [...(documents[docType] || []), ...metadata];
  await Promise.all(metadata.map((record, index) => saveLibraryDocumentFile(record.fileId, files[index])));

  updateStoredQuote(state.selectedLibraryId, { documents });
  writeAudit("Updated library documents", `${quote.quoteNumber} ${docType}`);
  renderQuoteLibrary();
});

memberForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!enforceAccess("settings")) return;
  if (!memberName.value.trim() || !memberEmail.value.trim()) return;

  const members = storageList(membersStorageKey);
  const email = normalizeEmail(memberEmail.value);
  const duplicate = members.find((member) => normalizeEmail(member.email) === email && member.id !== memberForm.dataset.editId);
  if (duplicate) {
    alert("A member with this email address already exists.");
    markInvalid(memberEmail);
    return;
  }

  const existing = members.find((member) => member.id === memberForm.dataset.editId);
  const temporaryPassword = memberTempPassword.value.trim();
  if (!existing && !temporaryPassword) {
    alert("Please enter or auto-generate a temporary password for the invite.");
    markInvalid(memberTempPassword);
    return;
  }

  const id = memberForm.dataset.editId || slugify(email);
  const payload = {
    ...(existing || {}),
    id,
    name: memberName.value.trim(),
    email,
    access: memberAccess.value,
    permissions: selectedPermissionKeys(),
    inviteStatus: memberInviteStatus.value,
  };
  if (temporaryPassword) {
    payload.passwordHash = await hashPassword(temporaryPassword);
    payload.mustChangePassword = true;
    payload.hasLoggedIn = false;
    payload.inviteStatus = "Invite Sent";
    payload.inviteSentAt = new Date().toISOString();
  }
  const existingIndex = members.findIndex((member) => member.id === id);
  if (existingIndex >= 0) members[existingIndex] = payload;
  else members.push(payload);
  saveStorageList(membersStorageKey, members);
  saveUserPermissions(payload);
  if (temporaryPassword) {
    sendInviteEmail(payload, temporaryPassword, Boolean(existing));
    writeAudit(existing ? "Invite resent" : "Member invite sent", payload.email, "Setup - Member access", payload.email, `Access level: ${payload.access}`);
  }
  memberForm.reset();
  delete memberForm.dataset.editId;
  memberInviteStatus.value = "Pending";
  memberAccess.value = "Admin";
  renderPermissionChecklist(roleDefaultPermissions[memberAccess.value] || []);
  writeAudit("Updated member access", payload.email);
  applyPermissions();
  renderSetup();
});

memberList.addEventListener("click", async (event) => {
  if (!enforceAccess("settings")) return;
  const members = storageList(membersStorageKey);
  const editId = event.target.dataset.editMember;
  const deleteId = event.target.dataset.deleteMember;
  const resendId = event.target.dataset.resendMember;
  const toggleId = event.target.dataset.toggleMember;
  if (editId) {
    const member = members.find((item) => item.id === editId);
    if (!member) return;
    memberForm.dataset.editId = member.id;
    memberName.value = member.name;
    memberEmail.value = member.email;
    memberAccess.value = member.access;
    renderPermissionChecklist(member.permissions || Array.from(memberPermissions(member)));
    memberInviteStatus.value = member.inviteStatus || (member.hasLoggedIn ? "Active" : "Pending");
    memberTempPassword.value = "";
  }
  if (resendId) {
    const member = members.find((item) => item.id === resendId);
    if (!member) return;
    const temporaryPassword = generatePassword();
    const updated = {
      ...member,
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      hasLoggedIn: false,
      inviteStatus: "Invite Sent",
      inviteSentAt: new Date().toISOString(),
    };
    saveMemberRecord(updated);
    sendInviteEmail(updated, temporaryPassword, true);
    writeAudit("Invite resent", updated.email, "Setup - Member access", updated.email, `Access level: ${updated.access}`);
    renderSetup();
  }
  if (toggleId) {
    const member = members.find((item) => item.id === toggleId);
    if (!member) return;
    const disabled = (member.inviteStatus || "") === "Disabled";
    saveMemberRecord({
      ...member,
      inviteStatus: disabled ? (member.hasLoggedIn ? "Active" : "Pending") : "Disabled",
    });
    writeAudit(disabled ? "Enabled member access" : "Disabled member access", member.email);
    applyPermissions();
    renderSetup();
  }
  if (deleteId) {
    saveStorageList(membersStorageKey, members.filter((item) => item.id !== deleteId));
    saveStorageList(userPermissionsStorageKey, storageList(userPermissionsStorageKey).filter((permission) => permission.user_id !== deleteId));
    writeAudit("Deleted member access", deleteId);
    applyPermissions();
    renderSetup();
  }
});

salesRepForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("settings")) return;
  if (!setupSalesRepName.value.trim() || !setupSalesRepEmail.value.trim()) return;

  const reps = salesRepsList();
  const id = salesRepForm.dataset.editId || slugify(setupSalesRepName.value);
  const payload = {
    id,
    name: setupSalesRepName.value.trim(),
    email: setupSalesRepEmail.value.trim(),
    phone: setupSalesRepPhone.value.trim(),
  };
  const existingIndex = reps.findIndex((rep) => rep.id === id);
  if (existingIndex >= 0) reps[existingIndex] = payload;
  else reps.push(payload);
  saveStorageList(salesRepsStorageKey, reps);
  loadSalesRepsFromStorage();
  renderSalesRepOptions();
  salesRepForm.reset();
  delete salesRepForm.dataset.editId;
  writeAudit("Updated sales rep", payload.name);
  renderSetup();
});

setupSalesRepList.addEventListener("click", (event) => {
  if (!enforceAccess("settings")) return;
  const reps = salesRepsList();
  const editId = event.target.dataset.editSalesRep;
  const deleteId = event.target.dataset.deleteSalesRep;
  if (editId) {
    const rep = reps.find((item) => item.id === editId);
    if (!rep) return;
    salesRepForm.dataset.editId = rep.id;
    setupSalesRepName.value = rep.name;
    setupSalesRepEmail.value = rep.email;
    setupSalesRepPhone.value = rep.phone || "";
  }
  if (deleteId) {
    saveStorageList(salesRepsStorageKey, reps.filter((rep) => rep.id !== deleteId));
    loadSalesRepsFromStorage();
    renderSalesRepOptions();
    writeAudit("Deleted sales rep", deleteId);
    renderSetup();
  }
});

supplierPriceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("settings")) return;
  if (!supplierNameField.value.trim() || !supplierStockCode.value.trim() || !supplierDescription.value.trim()) return;

  const prices = storageList(supplierPricesStorageKey);
  const id = supplierPriceForm.dataset.editId || slugify(`${supplierNameField.value}-${supplierStockCode.value}`);
  const payload = {
    id,
    supplierName: supplierNameField.value.trim(),
    productCode: supplierStockCode.value.trim(),
    stockCode: supplierStockCode.value.trim(),
    description: supplierDescription.value.trim(),
    category: supplierCategory.value.trim(),
    cost: Number(supplierCostField.value || 0),
  };
  const existingIndex = prices.findIndex((item) => item.id === id);
  if (existingIndex >= 0) prices[existingIndex] = payload;
  else prices.push(payload);
  saveStorageList(supplierPricesStorageKey, prices);
  supplierPriceForm.reset();
  delete supplierPriceForm.dataset.editId;
  writeAudit("Updated supplier price", payload.stockCode);
  renderSetup();
});

supplierPriceList.addEventListener("click", (event) => {
  if (!enforceAccess("settings")) return;
  const prices = storageList(supplierPricesStorageKey);
  const editId = event.target.dataset.editSupplier;
  const deleteId = event.target.dataset.deleteSupplier;
  if (editId) {
    const item = prices.find((price) => price.id === editId);
    if (!item) return;
    supplierPriceForm.dataset.editId = item.id;
    supplierNameField.value = item.supplierName || "";
    supplierStockCode.value = item.stockCode || item.productCode || "";
    supplierDescription.value = item.description;
    supplierCategory.value = item.category || "";
    supplierCostField.value = item.cost || item.unitCost || 0;
  }
  if (deleteId) {
    saveStorageList(supplierPricesStorageKey, prices.filter((item) => item.id !== deleteId));
    writeAudit("Deleted supplier price", deleteId);
    renderSetup();
  }
});

clientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("settings")) return;
  if (!setupClientName.value.trim()) return;

  const clients = storageList(clientsStorageKey);
  const id = clientForm.dataset.editId || slugify(setupClientName.value);
  const payload = {
    id,
    name: setupClientName.value.trim(),
    address: setupClientAddress.value.trim(),
    contact: setupClientContact.value.trim(),
    email: setupClientEmail.value.trim(),
    phone: setupClientPhone.value.trim(),
  };
  const existingIndex = clients.findIndex((client) => client.id === id);
  if (existingIndex >= 0) clients[existingIndex] = payload;
  else clients.push(payload);
  saveStorageList(clientsStorageKey, clients);
  clientForm.reset();
  delete clientForm.dataset.editId;
  writeAudit("Updated client", payload.name);
  renderSetup();
});

clientList.addEventListener("click", (event) => {
  if (!enforceAccess("settings")) return;
  const clients = storageList(clientsStorageKey);
  const editId = event.target.dataset.editClient;
  const deleteId = event.target.dataset.deleteClient;
  if (editId) {
    const client = clients.find((item) => item.id === editId);
    if (!client) return;
    clientForm.dataset.editId = client.id;
    setupClientName.value = client.name;
    setupClientAddress.value = client.address || "";
    setupClientContact.value = client.contact || "";
    setupClientEmail.value = client.email || "";
    setupClientPhone.value = client.phone || "";
  }
  if (deleteId) {
    saveStorageList(clientsStorageKey, clients.filter((client) => client.id !== deleteId));
    writeAudit("Deleted client", deleteId);
    renderSetup();
  }
});

generateAuditReport.addEventListener("click", () => {
  if (!enforceAccess("audit")) return;
  const rows = filteredAuditRows();
  state.auditReportRows = rows;
  renderAudit(rows);
  writeAudit("Generated audit report", `${rows.length} rows`, "Audit Trail", "Audit report", "Filtered report");
});

exportAuditReport.addEventListener("click", exportAuditCsv);

dashboardApplyFilters.addEventListener("click", renderDashboard);
dashboardMonth.addEventListener("change", () => {
  dashboardFromDate.value = "";
  dashboardToDate.value = "";
  renderDashboard();
});
dashboardFromDate.addEventListener("change", renderDashboard);
dashboardToDate.addEventListener("change", renderDashboard);
dashboardPrevMonth.addEventListener("click", () => {
  const [year, month] = (dashboardMonth.value || monthInputValue()).split("-").map(Number);
  dashboardMonth.value = monthInputValue(new Date(year, month - 2, 1));
  dashboardFromDate.value = "";
  dashboardToDate.value = "";
  renderDashboard();
});
dashboardNextMonth.addEventListener("click", () => {
  const [year, month] = (dashboardMonth.value || monthInputValue()).split("-").map(Number);
  dashboardMonth.value = monthInputValue(new Date(year, month, 1));
  dashboardFromDate.value = "";
  dashboardToDate.value = "";
  renderDashboard();
});
dashboardExportCsv.addEventListener("click", () => exportDashboardCsv("all"));
dashboardExportSalesCsv.addEventListener("click", () => exportDashboardCsv("sales"));
dashboardExportOutstandingCsv.addEventListener("click", () => exportDashboardCsv("outstanding"));
dashboardPrintReport.addEventListener("click", () => {
  if (!enforceAccess("dashboard")) return;
  renderDashboard();
  window.print();
});

requestFiles.addEventListener("change", async () => {
  const files = Array.from(requestFiles.files || []);
  const unsupported = files.filter((file) => !isSupportedRequestDocument(file));
  if (unsupported.length) {
    alert(`Unsupported file type: ${unsupported.map((file) => file.name).join(", ")}. Please upload PDF, Word, Excel, CSV, PNG or JPG documents.`);
  }
  const supported = files.filter(isSupportedRequestDocument);
  try {
    const uploadedFiles = [];
    for (const file of supported) {
      uploadedFiles.push(await requestFileMetadata(file));
    }
    state.salesRequestFiles = [...state.salesRequestFiles, ...uploadedFiles];
  } catch (error) {
    console.error("Request document upload failed", error);
    alert("One or more request documents could not be read. Please try uploading again.");
  }
  requestFiles.value = "";
  renderRequestFileList();
});

requestSalesRepName.addEventListener("input", () => {
  state.selectedRequestSalesRepId = "";
  renderRequestSalesRepOptions(requestSalesRepName.value);
  const rep = salesRepSearchRecords().find((item) => item.name.toLowerCase() === requestSalesRepName.value.trim().toLowerCase());
  if (rep) applyRequestSalesRep(rep);
});

requestSalesRepName.addEventListener("change", () => {
  const rep = selectedRequestSalesRep();
  if (rep) applyRequestSalesRep(rep);
});

salesRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("salesRequests")) return;
  const required = [
    ["requestClientName", "Client name"],
    ["requestContactPerson", "Client contact person"],
    ["requestClientEmail", "Client email"],
    ["requestClientPhone", "Client phone number"],
    ["requestSiteAddress", "Site address"],
    ["requestSalesRepName", "Sales rep name"],
    ["requestSalesRepEmail", "Sales rep email"],
    ["requestDueDate", "Required quotation due date"],
    ["requestDescription", "Description of work required"],
  ];
  const missing = required.filter(([id]) => !document.querySelector(`#${id}`)?.value.trim());
  if (missing.length) {
    alert(`Please complete: ${missing.map(([, label]) => label).join(", ")}`);
    return;
  }
  const request = {
    id: `sqr-${Date.now()}`,
    request_number: reserveRequestNumber(),
    client_name: document.querySelector("#requestClientName").value.trim(),
    client_contact_person: document.querySelector("#requestContactPerson").value.trim(),
    client_email: document.querySelector("#requestClientEmail").value.trim(),
    client_phone: document.querySelector("#requestClientPhone").value.trim(),
    site_project_name: document.querySelector("#requestProjectName").value.trim(),
    site_address: document.querySelector("#requestSiteAddress").value.trim(),
    sales_rep_user_id: state.selectedRequestSalesRepId || selectedRequestSalesRep()?.id || "",
    sales_rep_name: requestSalesRepName.value.trim(),
    sales_rep_email: requestSalesRepEmail.value.trim(),
    sales_rep_phone: requestSalesRepPhone.value.trim(),
    required_due_date: document.querySelector("#requestDueDate").value,
    description_of_work: document.querySelector("#requestDescription").value.trim(),
    notes_for_builder: document.querySelector("#requestNotes").value.trim(),
    status: "Accepted for Processing",
    submitted_by_user_id: currentUser(),
    files: state.salesRequestFiles,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveSalesRequests([request, ...loadSalesRequests()]);
  writeAudit("Request submitted", request.request_number, "Sales Quotation Requests", request.request_number, request.client_name);
  state.salesRequestFiles = [];
  state.selectedRequestSalesRepId = "";
  salesRequestForm.reset();
  renderRequestSalesRepOptions();
  autoPopulateRequestSalesRep(true);
  renderRequestFileList();
  renderSalesRequests();
});

salesRequestList.addEventListener("click", (event) => {
  if (!enforceAccess("salesRequests")) return;
  const acceptId = event.target.dataset.acceptRequest;
  const createId = event.target.dataset.createQuoteRequest;
  const docsId = event.target.dataset.viewRequestDocs;
  if (acceptId) {
    const existingRequest = loadSalesRequests().find((item) => item.id === acceptId);
    if (existingRequest?.accepted_by_user_id && existingRequest.accepted_by_user_id !== currentUser() && !["Admin", "Super Admin"].includes(currentMember().access)) {
      alert(`This request is already being processed by ${existingRequest.accepted_by_name || "another user"}.`);
      return;
    }
    const request = updateSalesRequest(acceptId, {
      status: "Accepted for Processing",
      accepted_by_user_id: currentUser(),
      accepted_by_name: currentUserName(),
      accepted_at: new Date().toISOString(),
    });
    writeAudit("Sales request accepted", request.request_number, "Sales Quotation Requests", request.request_number, `Accepted by ${currentUserName()}`);
    createQuotationFromRequest(acceptId);
    return;
  }
  if (createId) createQuotationFromRequest(createId);
  if (docsId) {
    const request = loadSalesRequests().find((item) => item.id === docsId);
    alert((request?.files || []).map((file) => `${file.file_name} (${formatFileSize(file.file_size)})`).join("\n") || "No documents uploaded.");
  }
});

generateTempPassword.addEventListener("click", () => {
  memberTempPassword.value = generatePassword();
  memberTempPassword.type = "text";
  memberTempPassword.focus();
});

memberAccess.addEventListener("change", () => {
  renderPermissionChecklist(roleDefaultPermissions[memberAccess.value] || []);
});

quotationSettingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("settings")) return;
  localStorage.setItem(quotationSettingsStorageKey, JSON.stringify({
    profitDeductionPercent: Math.max(0, Number(profitDeductionPercent.value || 0)),
    commissionPercent: Math.max(0, Number(commissionPercent.value || 0)),
  }));
  writeAudit("Updated quotation settings", "Profit percentages", "Setup", "Quotation settings", `Deduction ${profitDeductionPercent.value}%, commission ${commissionPercent.value}%`);
  renderCosting();
  renderSetup();
});

supplierImportFile.addEventListener("change", async () => {
  if (!enforceAccess("settings")) return;
  const file = supplierImportFile.files?.[0];
  state.supplierImport = null;
  state.supplierImportErrors = [];
  confirmSupplierImport.disabled = true;
  downloadSupplierImportErrors.disabled = true;
  supplierImportMapping.hidden = true;
  supplierImportPreview.hidden = true;
  supplierImportSummary.textContent = "";
  if (!file) return;

  const extension = file.name.split(".").pop().toLowerCase();
  if (["xlsx", "xls"].includes(extension)) {
    supplierImportSummary.innerHTML = `<span class="import-error">Excel files need a spreadsheet parser in the live backend. For this local prototype, please save the sheet as CSV and upload the CSV.</span>`;
    writeAudit("Supplier price import blocked", file.name, "Setup - Supplier prices", file.name, "Excel parser unavailable in local static prototype");
    return;
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    supplierImportSummary.innerHTML = `<span class="import-error">The uploaded CSV does not contain enough rows to import.</span>`;
    return;
  }

  const headers = rows[0].map((header, index) => header || `Column ${index + 1}`);
  state.supplierImport = {
    fileName: file.name,
    headers,
    rows: rows.slice(1),
    mapping: importMappingDefaults(headers),
  };
  renderSupplierImportMapping();
  renderSupplierImportPreview();
  confirmSupplierImport.disabled = false;
  supplierImportSummary.textContent = `${rows.length - 1} rows ready to preview and import.`;
});

supplierImportMapping.addEventListener("change", (event) => {
  const field = event.target.dataset.importMap;
  if (!field || !state.supplierImport) return;
  state.supplierImport.mapping[field] = event.target.value;
});

confirmSupplierImport.addEventListener("click", confirmSupplierPriceImport);
downloadSupplierImportErrors.addEventListener("click", exportSupplierImportErrors);

supplierQuoteUpload.addEventListener("change", () => {
  const files = Array.from(supplierQuoteUpload.files || []);
  const metadata = files.map(fileMetadata);
  state.supplierQuoteFiles = [...state.supplierQuoteFiles, ...files];
  state.supplierQuotes = [...state.supplierQuotes, ...metadata];
  state.supplierQuote = state.supplierQuotes[0] || null;

  if (state.supplierQuotes.length) {
    supplierQuoteUpload.classList.remove("field-error");
    supplierQuoteUpload.removeAttribute("aria-invalid");
  }

  supplierQuoteUpload.value = "";
  updateSupplierQuoteDisplay();
});

supplierQuoteName.addEventListener("click", (event) => {
  const fileId = event.target.dataset.removePendingSupplier;
  if (!fileId) return;
  const index = state.supplierQuotes.findIndex((file) => file.fileId === fileId);
  if (index < 0) return;
  state.supplierQuotes.splice(index, 1);
  state.supplierQuoteFiles.splice(index, 1);
  state.supplierQuote = state.supplierQuotes[0] || null;
  updateSupplierQuoteDisplay();
});

salesRequestDocumentsList.addEventListener("click", (event) => {
  const viewId = event.target.dataset.viewRequestFile;
  const downloadId = event.target.dataset.downloadRequestFile;
  if (viewId) openRequestDocument(viewId, "view");
  if (downloadId) openRequestDocument(downloadId, "download");
});

[costingStockCost, costingConsumablesCost, costingLabourCost].forEach((input) => {
  input.addEventListener("input", () => {
    state.costing = {
      stockCost: Number(costingStockCost.value || 0),
      consumablesCost: Number(costingConsumablesCost.value || 0),
      labourCost: Number(costingLabourCost.value || 0),
    };
    [costingStockCost, costingConsumablesCost, costingLabourCost].forEach((field) => {
      field.classList.remove("field-error");
      field.removeAttribute("aria-invalid");
    });
    renderCosting();
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!loginEmail.value.trim() || !loginPassword.value.trim()) return;

  const email = normalizeEmail(loginEmail.value);
  const member = memberByEmail(email);
  if (member) {
    if ((member.inviteStatus || "") === "Disabled") {
      alert("This member account has been disabled. Please contact an admin.");
      return;
    }
    if (member.passwordHash) {
      const enteredHash = await hashPassword(loginPassword.value);
      if (enteredHash !== member.passwordHash) {
        alert("The email address or password is incorrect.");
        return;
      }
    }
  }

  if (member?.mustChangePassword) {
    const newPassword = prompt("Please create a new password before continuing.");
    if (!newPassword || newPassword.trim().length < 8) {
      alert("Please use a password of at least 8 characters.");
      clearSharedSession();
      loginScreen.hidden = false;
      return;
    }
    const updatedMember = {
      ...member,
      passwordHash: await hashPassword(newPassword.trim()),
      mustChangePassword: false,
      hasLoggedIn: true,
      inviteStatus: "Active",
      activatedAt: new Date().toISOString(),
    };
    saveMemberRecord(updatedMember);
    const session = saveSharedSession(updatedMember, email);
    await syncBackendLogin(session);
    writeAudit("Changed temporary password", email, "Authentication", email, "First login password change");
  } else if (member && !member.hasLoggedIn) {
    const updatedMember = {
      ...member,
      hasLoggedIn: true,
      inviteStatus: "Active",
      activatedAt: new Date().toISOString(),
    };
    saveMemberRecord(updatedMember);
    const session = saveSharedSession(updatedMember, email);
    await syncBackendLogin(session);
  } else {
    const session = saveSharedSession(member, email);
    await syncBackendLogin(session);
  }
  loginScreen.hidden = true;
  writeAudit("Signed in", email);
  applyPermissions();
  const route = window.location.hash.slice(1) === "approval" ? "approvals" : window.location.hash.slice(1);
  showSection(canAccess(route) ? route || "portal" : "portal");
});

Object.values(fields).forEach((field) => {
  field.addEventListener("input", () => {
    if (field.id === "markupPercent") {
      fields.markupPercent.value = Math.max(0, Number(fields.markupPercent.value || 0));
      renderAll();
      return;
    }
    if (field.id === "validityDays") {
      fields.validityDays.value = Math.max(1, Number(fields.validityDays.value || 30));
      fields.validUntil.value = dateInputValue(addDays(fields.quoteDate.value, Number(fields.validityDays.value || 30)));
    }
    if (["clientName", "quoteDate", "validityDays", "aiInstruction"].includes(field.id)) {
      refreshAutoTerms();
    }
    if (field.classList.contains("field-error") && field.value.trim()) {
      field.classList.remove("field-error");
      field.removeAttribute("aria-invalid");
    }
    renderPreview();
  });
});

function showSection(sectionName) {
  if (isQuotationHubSsoRoute()) return;
  const activeSection = sectionName === "approval" ? "approvals" : sectionName;
  if (!isSignedIn()) {
    loginScreen.hidden = false;
    window.location.hash = "portal";
    return;
  }
  if (!canAccess(activeSection)) {
    alert("Access denied");
    showSection("portal");
    return;
  }
  const heading = sectionHeadings[activeSection] || sectionHeadings.builder;
  sectionEyebrow.textContent = heading.eyebrow;
  sectionTitle.textContent = heading.title;
  sectionStatus.lastChild.textContent = heading.status;
  document.body.dataset.activeSection = activeSection;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === activeSection);
  });

  ["portal", "dashboard", "builder", "salesRequests", "approvals", "library", "settings", "audit"].forEach((section) => {
    const sectionElement = document.querySelector(`#${section}-section`);
    const isActive = section === activeSection;
    sectionElement.hidden = !isActive;
    sectionElement.style.display = isActive ? (section === "builder" ? "grid" : "block") : "none";
    sectionElement.setAttribute("aria-hidden", String(!isActive));
  });

  if (activeSection === "portal") renderPortal();
  if (activeSection === "dashboard") renderDashboard();
  if (activeSection === "salesRequests") renderSalesRequests();
  if (activeSection === "approvals") renderApprovals();
  if (activeSection === "library") renderQuoteLibrary();
  if (activeSection === "settings") renderSetup();
  if (activeSection === "audit" && canAccess("audit")) renderAudit();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
    window.location.hash = button.dataset.section;
  });
});

async function openHub(hubSlug) {
  if (!isSignedIn()) {
    loginScreen.hidden = false;
    window.location.hash = "portal";
    return;
  }
  const hub = storageList(hubsStorageKey).find((item) => item.slug === hubSlug);
  if (!hasHubAccess(hub)) {
    alert("Access denied");
    return;
  }

  if (window.location.protocol === "file:") {
    alert("SSO requires the local server. Please open http://localhost:3100 and try again.");
    return;
  }

  const hubWindow = window.open("about:blank", "_blank");
  const targetWindow = hubWindow || window;
  if (hubWindow) {
    hubWindow.document.write("<p style=\"font-family: Arial, sans-serif; padding: 24px;\">Opening secure hub...</p>");
  } else {
    console.warn("Hub popup was blocked; opening secure hub in the current tab instead.");
  }

  try {
    console.log("Requesting SSO token", { userId: currentMember().id, hubSlug });
    const response = await fetch("/api/sso/create-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ hubSlug }),
    });

    if (!response.ok) {
      console.warn("SSO token not created", { hubSlug, status: response.status, response: await response.text().catch(() => "") });
      if (hubWindow) hubWindow.close();
      alert("You do not have access to this hub.");
      return;
    }

    const data = await response.json();
    console.log("SSO redirect URL generated", data.redirectUrl);
    writeAudit("Opened hub", hub.name, "Portal", hub.slug, "Opened from company portal with one-time SSO token");
    targetWindow.location.href = data.redirectUrl;
  } catch (error) {
    console.error("SSO handoff failed", error);
    if (hubWindow) hubWindow.close();
    alert("The secure hub login could not be created. Please try again.");
  }
}

portalHubGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-hub]");
  const slug = button?.dataset.openHub;
  if (!slug) return;
  console.log("Hub card clicked", { hubSlug: slug });
  openHub(slug);
});

seedPortalTables();
migrateSalesRequestStatuses();
renderPermissionChecklist(roleDefaultPermissions[memberAccess.value] || []);
renderRequestSalesRepOptions();
autoPopulateRequestSalesRep(true);
hydrateSharedSessionFromUrl();
loadSalesRepsFromStorage();
renderSalesRepOptions();
const restoredDraft = loadSavedQuote();
fields.selectedCompany.value = "";
fields.salesRep.value = "";
fields.quoteDate.value = todayInputValue();
fields.validityDays.value = fields.validityDays.value || "30";
fields.validUntil.value = dateInputValue(addDays(fields.quoteDate.value, Number(fields.validityDays.value || 30)));
fields.clientName.value = "";
fields.clientAddress.value = "";
fields.contactPerson.value = "";
fields.contactEmail.value = "";
fields.contactNumber.value = "";
fields.projectSummary.value = "";
fields.markupPercent.value = "20";
supplierQuoteUpload.value = "";
state.supplierQuote = null;
state.supplierQuotes = [];
state.supplierQuoteFiles = [];
state.costing = { stockCost: 0, consumablesCost: 0, labourCost: 0 };
state.items = [{ stockCode: "", description: "", quantity: 1, supplierCost: 0 }];
if (!fields.quoteNumber.value) {
  fields.quoteNumber.value = reserveQuoteNumber(fields.quoteDate.value);
}
refreshAutoTerms();
updateSupplierQuoteDisplay();
renderAll();
applyPermissions();
const routeSection = window.location.hash.slice(1) === "approval" ? "approvals" : window.location.hash.slice(1);
const initialSection = ["portal", "dashboard", "builder", "salesRequests", "approvals", "library", "settings", "audit"].includes(routeSection)
  ? routeSection
  : "portal";
consumeHubSsoTokenIfPresent().then((handledSso) => {
  if (handledSso) return;
  if (isSignedIn()) {
    loginScreen.hidden = true;
    applyPermissions();
    if (initialSection === "builder" && loadSalesRequestFromUrl()) return;
    showSection(canAccess(initialSection) ? initialSection : "portal");
  } else {
    loginScreen.hidden = false;
    window.location.hash = "portal";
  }
});
