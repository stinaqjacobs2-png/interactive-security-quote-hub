const state = {
  taxRate: 0.15,
  selectedCompanyId: "",
  selectedApprovalId: "",
  selectedLibraryId: "",
  selectedTimelineId: "",
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
  salesRequestFilters: {
    status: "All",
    salesRep: "",
    clientName: "",
    submittedDate: "",
    quotationType: "All",
  },
  lastSalesRequestBadgeCount: null,
  revisionSourceId: "",
  activeSalesRequestId: "",
  selectedRequestSalesRepId: "",
  items: [{ stockCode: "", description: "", quantity: 1, supplierCost: 0 }],
  costing: { stockCost: 0, consumablesCost: 0, labourCost: 0 },
  guarding: {
    activeSalesRequestId: "",
    staffing: [],
    equipment: [],
    additionalCosts: [],
    lineItems: [],
  },
  armed: {
    activeSalesRequestId: "",
    additionalServices: [],
    onceOffCharges: [],
  },
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
const permissionHistoryStorageKey = "interactiveSecurityPermissionHistory";
const quotationSettingsStorageKey = "interactiveSecurityQuotationSettings";
const salesRequestsStorageKey = "interactiveSecuritySalesQuotationRequests";
const projectTimelineStorageKey = "interactiveSecurityProjectTimelines";
const guardingPriceListStorageKey = "interactiveSecurityGuardingPriceList";
const financeStoragePrefix = "interactiveSecurityFinanceHub";
const costStoragePrefix = "interactiveSecurityCostHub";
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
const salesRequestCount = document.querySelector("#salesRequestCount");
const quoteLibraryList = document.querySelector("#quoteLibraryList");
const quoteLibraryDetail = document.querySelector("#quoteLibraryDetail");
const projectTimelineList = document.querySelector("#projectTimelineList");
const projectTimelineDetail = document.querySelector("#projectTimelineDetail");
const auditList = document.querySelector("#auditList");
const loginScreen = document.querySelector("#loginScreen");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const firstSetupButton = document.querySelector("#firstSetupButton");
const forgotPassword = document.querySelector("#forgotPassword");
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
const guardingPriceForm = document.querySelector("#guardingPriceForm");
const guardingPriceItemName = document.querySelector("#guardingPriceItemName");
const guardingPriceShiftType = document.querySelector("#guardingPriceShiftType");
const guardingPriceBillingType = document.querySelector("#guardingPriceBillingType");
const guardingPriceDescription = document.querySelector("#guardingPriceDescription");
const guardingPriceUnitType = document.querySelector("#guardingPriceUnitType");
const guardingPriceCategory = document.querySelector("#guardingPriceCategory");
const guardingPriceServiceType = document.querySelector("#guardingPriceServiceType");
const guardingPriceRate = document.querySelector("#guardingPriceRate");
const guardingPriceActive = document.querySelector("#guardingPriceActive");
const guardingPriceImportFile = document.querySelector("#guardingPriceImportFile");
const guardingPriceImportSummary = document.querySelector("#guardingPriceImportSummary");
const guardingPriceList = document.querySelector("#guardingPriceList");
const exportGuardingPriceList = document.querySelector("#exportGuardingPriceList");
const auditMemberFilter = document.querySelector("#auditMemberFilter");
const auditSingleDate = document.querySelector("#auditSingleDate");
const auditFromDate = document.querySelector("#auditFromDate");
const auditToDate = document.querySelector("#auditToDate");
const generateAuditReport = document.querySelector("#generateAuditReport");
const exportAuditReport = document.querySelector("#exportAuditReport");
const dashboardMonth = document.querySelector("#dashboardMonth");
const dashboardFromDate = document.querySelector("#dashboardFromDate");
const dashboardToDate = document.querySelector("#dashboardToDate");
const dashboardTypeFilter = document.querySelector("#dashboardTypeFilter");
const dashboardSalesRepFilter = document.querySelector("#dashboardSalesRepFilter");
const dashboardPrevMonth = document.querySelector("#dashboardPrevMonth");
const dashboardNextMonth = document.querySelector("#dashboardNextMonth");
const dashboardApplyFilters = document.querySelector("#dashboardApplyFilters");
const dashboardExportCsv = document.querySelector("#dashboardExportCsv");
const dashboardExportSalesCsv = document.querySelector("#dashboardExportSalesCsv");
const dashboardExportOutstandingCsv = document.querySelector("#dashboardExportOutstandingCsv");
const projectionsMonth = document.querySelector("#projectionsMonth");
const projectionsFromDate = document.querySelector("#projectionsFromDate");
const projectionsToDate = document.querySelector("#projectionsToDate");
const projectionsSalesRepFilter = document.querySelector("#projectionsSalesRepFilter");
const projectionsBranchFilter = document.querySelector("#projectionsBranchFilter");
const projectionsQuotationType = document.querySelector("#projectionsQuotationType");
const projectionsPreviousMonth = document.querySelector("#projectionsPreviousMonth");
const projectionsNextMonth = document.querySelector("#projectionsNextMonth");
const projectionsExportExcel = document.querySelector("#projectionsExportExcel");
const projectionsExportPdf = document.querySelector("#projectionsExportPdf");
const projectionsSummary = document.querySelector("#projectionsSummary");
const projectionsActivitySummary = document.querySelector("#projectionsActivitySummary");
const projectionsSubmittedApprovedRejectedBar = document.querySelector("#projectionsSubmittedApprovedRejectedBar");
const projectionsStatusPieChart = document.querySelector("#projectionsStatusPieChart");
const projectionsSubmittedLineChart = document.querySelector("#projectionsSubmittedLineChart");
const projectionsApprovedRepBar = document.querySelector("#projectionsApprovedRepBar");
const projectionsAcceptedRepBar = document.querySelector("#projectionsAcceptedRepBar");
const projectionsValueApprovedAcceptedBar = document.querySelector("#projectionsValueApprovedAcceptedBar");
const projectionsRepProgress = document.querySelector("#projectionsRepProgress");
const projectionsSalesRepBar = document.querySelector("#projectionsSalesRepBar");
const projectionsPieChart = document.querySelector("#projectionsPieChart");
const projectionsLineChart = document.querySelector("#projectionsLineChart");
const projectionsApprovedAcceptedBar = document.querySelector("#projectionsApprovedAcceptedBar");
const projectionsTargetTable = document.querySelector("#projectionsTargetTable");
const dashboardPrintReport = document.querySelector("#dashboardPrintReport");
const dashboardSummary = document.querySelector("#dashboardSummary");
const approvedAcceptedChart = document.querySelector("#approvedAcceptedChart");
const salesRepQuoteChart = document.querySelector("#salesRepQuoteChart");
const salesRepValueChart = document.querySelector("#salesRepValueChart");
const salesRepTotalsTable = document.querySelector("#salesRepTotalsTable");
const outstandingClientTable = document.querySelector("#outstandingClientTable");
const portalHubGrid = document.querySelector("#portalHubGrid");
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
const requestQuotationType = document.querySelector("#requestQuotationType");
const guardingRequestFields = document.querySelector("#guardingRequestFields");
const armedResponseRequestFields = document.querySelector("#armedResponseRequestFields");
const guardingStaffRows = document.querySelector("#guardingStaffRows");
const guardingEquipmentRows = document.querySelector("#guardingEquipmentRows");
const guardingCostRows = document.querySelector("#guardingCostRows");
const guardingLineItemRows = document.querySelector("#guardingLineItemRows");
const guardingRequestDocumentsPanel = document.querySelector("#guardingRequestDocumentsPanel");
const guardingRequestDocumentsList = document.querySelector("#guardingRequestDocumentsList");
const guardingRequestSummaryPanel = document.querySelector("#guardingRequestSummaryPanel");
const guardingRequestSummary = document.querySelector("#guardingRequestSummary");
const armedResponseServiceRows = document.querySelector("#armedResponseServiceRows");
const armedResponseChargeRows = document.querySelector("#armedResponseChargeRows");
const armedResponseRequestDocumentsPanel = document.querySelector("#armedResponseRequestDocumentsPanel");
const armedResponseRequestDocumentsList = document.querySelector("#armedResponseRequestDocumentsList");
const armedResponseRequestSummaryPanel = document.querySelector("#armedResponseRequestSummaryPanel");
const armedResponseRequestSummary = document.querySelector("#armedResponseRequestSummary");

const guardingFields = {
  company: document.querySelector("#guardingCompany"),
  clientName: document.querySelector("#guardingClientName"),
  contactPerson: document.querySelector("#guardingContactPerson"),
  contactNumber: document.querySelector("#guardingContactNumber"),
  email: document.querySelector("#guardingEmail"),
  siteName: document.querySelector("#guardingSiteName"),
  siteAddress: document.querySelector("#guardingSiteAddress"),
  province: document.querySelector("#guardingProvince"),
  industry: document.querySelector("#guardingIndustry"),
  salesRep: document.querySelector("#guardingSalesRep"),
  quoteNumber: document.querySelector("#guardingQuoteNumber"),
  quoteDate: document.querySelector("#guardingQuoteDate"),
  serviceType: document.querySelector("#guardingServiceType"),
  startDate: document.querySelector("#guardingStartDate"),
  duration: document.querySelector("#guardingDuration"),
  dayShift: document.querySelector("#guardingDayShift"),
  nightShift: document.querySelector("#guardingNightShift"),
  guardCount: document.querySelector("#guardingGuardCount"),
  supervisor: document.querySelector("#guardingSupervisor"),
  armed: document.querySelector("#guardingArmed"),
  controlRoom: document.querySelector("#guardingControlRoom"),
  patrols: document.querySelector("#guardingPatrols"),
  equipmentRequired: document.querySelector("#guardingEquipmentRequired"),
  specialInstructions: document.querySelector("#guardingSpecialInstructions"),
  builderNotes: document.querySelector("#guardingBuilderNotes"),
};

const armedResponseFields = {
  company: document.querySelector("#armedResponseCompany"),
  clientName: document.querySelector("#armedResponseClientName"),
  contactPerson: document.querySelector("#armedResponseContactPerson"),
  contactNumber: document.querySelector("#armedResponseContactNumber"),
  email: document.querySelector("#armedResponseEmail"),
  siteName: document.querySelector("#armedResponseSiteName"),
  siteAddress: document.querySelector("#armedResponseSiteAddress"),
  province: document.querySelector("#armedResponseProvince"),
  area: document.querySelector("#armedResponseArea"),
  industry: document.querySelector("#armedResponseIndustry"),
  salesRep: document.querySelector("#armedResponseSalesRep"),
  quoteNumber: document.querySelector("#armedResponseQuoteNumber"),
  quoteDate: document.querySelector("#armedResponseQuoteDate"),
  siteCount: document.querySelector("#armedResponseSiteCount"),
  existingAlarm: document.querySelector("#armedResponseExistingAlarm"),
  alarmMonitoring: document.querySelector("#armedResponseAlarmMonitoring"),
  armedRequired: document.querySelector("#armedResponseArmedRequired"),
  keyHolding: document.querySelector("#armedResponseKeyHolding"),
  openingClosing: document.querySelector("#armedResponseOpeningClosing"),
  patrolService: document.querySelector("#armedResponsePatrolService"),
  panicButton: document.querySelector("#armedResponsePanicButton"),
  medical: document.querySelector("#armedResponseMedical"),
  fire: document.querySelector("#armedResponseFire"),
  startDate: document.querySelector("#armedResponseStartDate"),
  duration: document.querySelector("#armedResponseDuration"),
  specialInstructions: document.querySelector("#armedResponseSpecialInstructions"),
  builderNotes: document.querySelector("#armedResponseBuilderNotes"),
  packageName: document.querySelector("#armedResponsePackageName"),
  packageDescription: document.querySelector("#armedResponsePackageDescription"),
  packageSiteCount: document.querySelector("#armedResponsePackageSiteCount"),
  markupPercent: document.querySelector("#armedResponseMarkupPercent"),
  monthlyPerSite: document.querySelector("#armedResponseMonthlyPerSite"),
};

const permissionDefinitions = [
  { key: "projections", label: "Projections", section: "projections" },
  { key: "dashboard", label: "Dashboard", section: "dashboard" },
  { key: "build_quotation", label: "Building Technical Quotation", section: "builder" },
  { key: "build_guarding_quotation", label: "Building Guarding Quotation", section: "guardingBuilder" },
  { key: "build_armed_response_quotation", label: "Building Monthly Armed Response Quotation", section: "armedResponseBuilder" },
  { key: "quote_library", label: "Quote Library", section: "library" },
  { key: "project_timeline", label: "Project Timeline", section: "projectTimeline" },
  { key: "approval", label: "Approval", section: "approvals" },
  { key: "reports", label: "Reports", section: "dashboard" },
  { key: "audit_trail", label: "Audit Trail", section: "audit" },
  { key: "setup", label: "Setup", section: "settings" },
  { key: "supplier_prices", label: "Supplier Prices", section: "settings" },
  { key: "member_access_management", label: "Member Access Management", section: "settings" },
  { key: "quotation_hub", label: "Quotation Hub", hubSlug: "quotation-hub" },
  { key: "cost_hub", label: "Cost Hub", hubSlug: "cost-hub" },
  { key: "finance_age_analysis", label: "Finance Balances and Age Analysis", hubSlug: "finance-age-analysis" },
  { key: "fleet_hub", label: "Fleet", hubSlug: "fleet" },
  { key: "living_resources", label: "Living Resources", hubSlug: "living-resources" },
  { key: "accounts_sales", label: "Accounts & Sales", hubSlug: "accounts-sales" },
  { key: "hr_hub", label: "HR", hubSlug: "hr" },
  { key: "technical_maintenance", label: "Technical & Maintenance", hubSlug: "technical-maintenance" },
  { key: "payroll_hub", label: "Payroll", hubSlug: "payroll" },
  { key: "overtime_hub", label: "Overtime", hubSlug: "overtime" },
  { key: "control_room_it", label: "Control Room & IT", hubSlug: "control-room-it" },
  { key: "uniforms_stores", label: "Uniforms & Stores", hubSlug: "uniforms-stores" },
  { key: "employee_files", label: "Employee Files", hubSlug: "employee-files" },
  { key: "administration_governance", label: "Administration & Governance", hubSlug: "administration-governance" },
  { key: "sales_quotation_requests", label: "Sales Quotation Requests", section: "salesRequests" },
];

const platformRoles = ["Super Admin", "Admin", "Quotation Builder", "Sales Representative", "Read Only"];
const passwordPolicyMessage = "Password must be at least 5 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";

function normalizeRole(role = "") {
  const value = String(role || "").trim();
  const normalized = value.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const aliases = {
    "Full Access Member": "Admin",
    "Quotation Builder Only": "Quotation Builder",
    Member: "Sales Representative",
    "super admin": "Super Admin",
    administrator: "Admin",
    admin: "Admin",
    "quotation builder": "Quotation Builder",
    "sales representative": "Sales Representative",
    member: "Sales Representative",
    "read only": "Read Only",
  };
  return aliases[value] || aliases[normalized] || (platformRoles.includes(value) ? value : "Read Only");
}

const roleDefaultPermissions = {
  "Super Admin": permissionDefinitions.map((permission) => permission.key),
  Admin: permissionDefinitions.map((permission) => permission.key),
  "Quotation Builder": ["quotation_hub", "build_quotation", "build_guarding_quotation", "build_armed_response_quotation", "sales_quotation_requests", "quote_library", "project_timeline"],
  "Sales Representative": ["quotation_hub", "sales_quotation_requests"],
  "Read Only": ["quotation_hub", "dashboard", "quote_library", "reports"],
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
  projections: {
    eyebrow: "Management projections",
    title: "Projections",
    status: "Targets",
  },
  builder: {
    eyebrow: "AI quotation workspace",
    title: "Building Technical Quotation",
    status: "Draft",
  },
  guardingBuilder: {
    eyebrow: "Guarding quotation workspace",
    title: "Building Guarding Quotation",
    status: "Draft",
  },
  armedResponseBuilder: {
    eyebrow: "Armed response quotation workspace",
    title: "Building Armed Response Quotation",
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
  projectTimeline: {
    eyebrow: "Project delivery",
    title: "Project Timeline",
    status: "Accepted",
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
  if (quote.quotationType === "Guarding Quotation") return Number(quote.guardingPricing?.monthlySelling || quote.monthlyValue || 0);
  if (quote.quotationType === "Monthly Armed Response Quotation") return Number(quote.armedResponsePricing?.monthlySelling || quote.monthlyValue || 0);
  return (quote.items || []).reduce((sum, item) => sum + quoteItemTotal(quote, item), 0);
}

function quoteAnnualValue(quote) {
  if (quote.quotationType === "Guarding Quotation") return Number(quote.guardingPricing?.annualValue || quote.annualValue || quoteSubtotal(quote) * 12);
  if (quote.quotationType === "Monthly Armed Response Quotation") return Number(quote.armedResponsePricing?.annualValue || quote.annualValue || quoteSubtotal(quote) * 12);
  return quoteSubtotal(quote) * (1 + state.taxRate);
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
          .logo { width: 260px; display: block; margin: 0 auto 8px; }
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

function guardingShiftLabel(row = {}) {
  const day = Number(row.dayShiftQuantity || 0);
  const night = Number(row.nightShiftQuantity || 0);
  if (day && night) return `Day ${day} / Night ${night}`;
  if (day) return "Day shift";
  if (night) return "Night shift";
  return "As scheduled";
}

function guardingDaysPerWeek(row = {}) {
  const daysPerMonth = Number(row.daysPerMonth || 0);
  return daysPerMonth ? Math.max(1, Math.round((daysPerMonth / 4.33) * 10) / 10) : "-";
}

function guardingScopeText(quote) {
  const details = quote.guardingDetails || {};
  const selectedItems = guardingDisplayLineItems(quote).map(guardingLineItemLabel).filter(Boolean);
  return [
    selectedItems.length ? `Selected guarding services: ${selectedItems.join(", ")}.` : details.serviceType || "Guarding services",
    `Guarding duties: access control, patrols, visible guarding presence, incident escalation, and client-specific site duties.`,
    `Posting instructions: officers will be posted according to the confirmed site deployment schedule and agreed shift requirements.`,
    `Reporting requirements: incident reporting, shift handover notes, and escalation of irregularities to the client and Interactive Security management.`,
    `Site supervision: ${details.supervisor === "Yes" ? "Supervisor required and included in the deployment planning." : "Site supervision will be coordinated through Interactive Security management unless otherwise agreed."}`,
    `Armed / unarmed status: ${details.armed === "Yes" ? "Armed guarding required." : "Unarmed guarding service."}`,
    details.specialInstructions ? `Special client instructions: ${details.specialInstructions}` : "",
  ].filter(Boolean).join(" ");
}

function guardingQuotationDocumentHtml(quote, options = {}) {
  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  const details = quote.guardingDetails || {};
  const lineItems = guardingDisplayLineItems(quote);
  const pricing = quote.guardingPricing || {};
  const monthlySubtotal = Number(pricing.monthlySelling || quoteSubtotal(quote) || 0);
  const vat = roundCurrency(monthlySubtotal * state.taxRate);
  const monthlyTotal = roundCurrency(monthlySubtotal + vat);
  const quoteDate = formatDate(quote.quoteDate);
  const experience = [
    "Security Officer qualification",
    "Public relations course",
    "Surveillance and patrol procedure",
    "Site induction",
    "Incident reporting",
    "Backup support",
  ];
  const duties = [
    "Access control and visitor management",
    "Patrols and visible guarding presence",
    "Incident reporting and escalation",
    "Shift handover and site occurrence notes",
    details.controlRoom === "Yes" ? "Control room support" : "",
    details.patrols === "Yes" ? "Scheduled patrols" : "",
  ].filter(Boolean);
  const rows = lineItems.length ? lineItems.map((row) => `
    <tr class="${row.shiftType === "Night Shift" ? "guarding-night-row" : ""}">
      <td>
        <strong>${escapeHtml(`${row.quantity || 0} x ${guardingLineItemLabel(row)}`)}</strong>
        ${row.description && row.description !== guardingLineItemLabel(row) ? `<small>${escapeHtml(row.description)}</small>` : ""}
        ${row.notes ? `<small>${escapeHtml(row.notes)}</small>` : ""}
      </td>
      <td>${String(row.experience || "").split(";").filter(Boolean).map((item) => `<div>${escapeHtml(item.trim())}</div>`).join("") || experience.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}</td>
      <td>${String(row.duties || "").split(";").filter(Boolean).map((item) => `<div>${escapeHtml(item.trim())}</div>`).join("") || duties.map((item, index) => `<div>${index + 1}) ${escapeHtml(item)}</div>`).join("")}</td>
      <td>
        ${guardingScheduleText(row, quote).split("\n").map((line, lineIndex) => lineIndex === 0 ? `<strong>${escapeHtml(line)}</strong>` : `<div>${escapeHtml(line)}</div>`).join("")}
        ${row.unitNotes ? `<small>${escapeHtml(row.unitNotes)}</small>` : ""}
        <strong>${money.format(guardingLineItemTotal(row))} Excl. VAT line total</strong>
      </td>
    </tr>
  `).join("") : `
    <tr>
      <td><strong>Security Officer</strong></td>
      <td>${experience.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}</td>
      <td>${duties.map((item, index) => `<div>${index + 1}) ${escapeHtml(item)}</div>`).join("")}</td>
      <td><strong>${escapeHtml(quoteDate || "-")}</strong><div>Schedule to be confirmed</div><strong>${money.format(0)} Excl. VAT</strong></td>
    </tr>
  `;

  return `
    <div class="guarding-document ${options.preview ? "guarding-document-preview" : ""}">
      <header class="guarding-doc-header">
        <div></div>
        <img class="guarding-doc-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <strong class="guarding-doc-number">${escapeHtml(quote.quoteNumber || "Draft")}</strong>
      </header>
      <h1>Quotation</h1>
      <div class="guarding-doc-topline">
        <strong>${escapeHtml([quote.clientName, details.siteName].filter(Boolean).join(" - ") || "Client / Site")}</strong>
        <strong>${escapeHtml(quoteDate || "-")}</strong>
      </div>
      <div class="guarding-info-grid">
        <div>
          <small>Client details</small>
          <strong>${escapeHtml(quote.clientName || "-")}</strong>
          <span>${escapeHtml(quote.clientAddress || "-")}</span>
          <span>${escapeHtml([quote.contactPerson, quote.contactEmail, quote.contactNumber].filter(Boolean).join(" / ") || "-")}</span>
        </div>
        <div>
          <small>Quotation details</small>
          <strong>${escapeHtml(quote.quoteNumber || "-")}</strong>
          <span>Date: ${escapeHtml(quoteDate || "-")}</span>
          <span>Sales representative: ${escapeHtml([salesRep?.name, salesRep?.email].filter(Boolean).join(" / ") || "-")}</span>
        </div>
        <div>
          <small>Deployment details</small>
          <strong>${escapeHtml(`${lineItems.reduce((sum, row) => sum + Number(row.quantity || 0), 0) || details.guardCount || 0} officer(s)`)}</strong>
          <span>Shift: ${escapeHtml(Array.from(new Set(lineItems.map((row) => row.shiftType).filter(Boolean))).join(" / ") || "-")}</span>
          <span>Billing: ${escapeHtml(Array.from(new Set(lineItems.map((row) => row.billingType).filter(Boolean))).join(" / ") || "-")}</span>
        </div>
      </div>
      <table class="guarding-main-table">
        <thead>
          <tr><th colspan="4">Price Quotations and Details</th></tr>
          <tr><th>Description</th><th>Experience</th><th>Equipment and Duties</th><th>Schedule</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table class="guarding-summary-table guarding-total-table">
        <tbody>
          <tr><td>Subtotal excluding VAT</td><td>${money.format(monthlySubtotal)}</td></tr>
          <tr><td>VAT 15%</td><td>${money.format(vat)}</td></tr>
          <tr class="total-row"><td>Total including VAT</td><td>${money.format(monthlyTotal)}</td></tr>
        </tbody>
      </table>
      <section class="guarding-terms-section">
        <h2>Terms and Conditions</h2>
        <p>This quotation is valid for 7 days from quotation date. Service commencement is subject to signed acceptance, site access, final operational confirmation, and payment terms agreed by Interactive Security. Pricing excludes work outside the agreed guarding scope unless approved in writing by the client.</p>
      </section>
      <section class="guarding-signature-section">
        <h2>Acceptance</h2>
        <div><span>Accepted by client</span><span>Signature</span><span>Date</span></div>
      </section>
    </div>
  `;
}

function guardingQuotationFullHtml(quote) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(quote.quoteNumber || "Guarding Quotation")} Client Quotation</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #17212b; margin: 18px; font-size: 10.5px; }
          button { margin-bottom: 12px; padding: 8px 12px; border: 1px solid #dce3ea; background: #fff; border-radius: 6px; cursor: pointer; }
          .guarding-document { max-width: 980px; margin: 0 auto; }
          .guarding-doc-header { display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; gap: 12px; }
          .guarding-doc-logo { width: 430px; max-width: 100%; height: auto; display: block; margin: 0 auto; }
          .guarding-doc-number { justify-self: end; font-size: 18px; }
          h1 { text-align: center; text-transform: uppercase; font-size: 13px; margin: 4px 0 16px; }
          .guarding-doc-topline { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 4px; font-size: 12px; }
          .guarding-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0; }
          .guarding-info-grid div { border: 1px solid #17212b; padding: 7px; min-height: 62px; }
          .guarding-info-grid small { display: block; text-transform: uppercase; color: #5d6a78; font-weight: 700; margin-bottom: 3px; }
          .guarding-info-grid strong, .guarding-info-grid span { display: block; line-height: 1.35; }
          table { width: 100%; border-collapse: collapse; margin: 0 0 10px; }
          th, td { border: 2px solid #000; padding: 6px; vertical-align: top; }
          th { background: #d9d9d9; text-transform: uppercase; text-align: center; font-weight: 800; }
          td small, td div { display: block; line-height: 1.35; }
          .right { text-align: right; }
          .guarding-main-table td:first-child { text-align: center; font-weight: 700; text-transform: uppercase; width: 20%; }
          .guarding-main-table tr.guarding-night-row td { background: #f1f1f1; }
          .guarding-main-table td:nth-child(2) { width: 24%; }
          .guarding-main-table td:nth-child(3) { width: 29%; }
          .guarding-main-table td:nth-child(4) { text-align: center; width: 27%; }
          .guarding-summary-table td:last-child { text-align: right; font-weight: 700; }
          .guarding-summary-table .total-row td { background: #f3f7f8; font-weight: 800; }
          .guarding-total-table { width: 330px; margin-left: auto; }
          .guarding-terms-section, .guarding-signature-section { border: 1px solid #17212b; margin: 10px 0; }
          .guarding-terms-section h2, .guarding-signature-section h2 { margin: 0; padding: 6px 8px; background: #17212b; color: #fff; font-size: 11px; text-transform: uppercase; }
          .guarding-terms-section p { margin: 0; padding: 8px; line-height: 1.45; }
          .guarding-signature-section div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 28px 8px 8px; }
          .guarding-signature-section span { border-top: 1px solid #17212b; padding-top: 5px; min-height: 18px; }
          @media print { button { display: none; } body { margin: 9mm; } .guarding-document { max-width: none; } }
          @media (max-width: 760px) { .guarding-doc-header, .guarding-info-grid { grid-template-columns: 1fr; } .guarding-total-table { width: 100%; } .guarding-doc-number { justify-self: center; } table { font-size: 9px; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print / Save as PDF</button>
        ${guardingQuotationDocumentHtml(quote)}
      </body>
    </html>
  `;
}

function clientQuotationHtml(quote) {
  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  if (quote.quotationType === "Guarding Quotation") return guardingQuotationFullHtml(quote);
  if (quote.quotationType === "Monthly Armed Response Quotation") {
    const pricing = quote.armedResponsePricing || {};
    const services = quote.armedResponseServices || [];
    const charges = quote.armedResponseOnceOffCharges || [];
    return `
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(quote.quoteNumber)} Client Quotation</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #17212b; margin: 22px; font-size: 11px; }
            .logo { width: 260px; display: block; margin: 0 auto 5px; }
            .brand, .contact { text-align: center; }
            .brand strong { font-size: 13px; line-height: 1.15; }
            .rule { border-top: 2px solid #17212b; margin: 10px 0; }
            .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
            .box { border: 1px solid #dce3ea; background: #f3f7f8; padding: 8px; border-radius: 6px; white-space: pre-line; }
            .box small { display: block; font-weight: 800; color: #5d6a78; }
            h1 { text-transform: uppercase; font-size: 18px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #17212b; padding: 7px; }
            th { background: #17212b; color: #fff; text-align: left; }
            .right { text-align: right; }
            .totals { margin-left: auto; width: 310px; }
            .totals div { display: flex; justify-content: space-between; border: 1px solid #17212b; border-top: 0; padding: 7px; }
            .section-title { background: #17212b; color: #fff; padding: 7px; font-weight: 800; }
            .yellow { background: #fff2a8; padding: 2px 6px; font-size: 10.5px; line-height: 1.15; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Print / Save as PDF</button>
          <img class="logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
          <div class="brand"><strong>${escapeHtml(company?.name || "Interactive Security")}</strong><br><span class="yellow">Reg no: ${escapeHtml(company?.registration || "-")} | VAT No: ${escapeHtml(company?.vat || "-")}</span></div>
          <div class="rule"></div>
          <div class="contact">${escapeHtml(company?.address || "-")}<br>Tel: ${escapeHtml(company?.phone || "-")} / Email: ${escapeHtml(company?.email || "-")} / Website: ${escapeHtml(company?.website || "-")}</div>
          <h1>Monthly Armed Response Quotation</h1>
          <h2>${escapeHtml(quote.quoteNumber)}</h2>
          <div class="meta">
            <div class="box"><small>Client Detail</small><strong>${escapeHtml([quote.clientName, quote.clientAddress].filter(Boolean).join("\n") || "-")}</strong></div>
            <div class="box"><small>Contact Detail</small><strong>${escapeHtml([quote.contactPerson, quote.contactEmail, quote.contactNumber].filter(Boolean).join("\n") || "-")}</strong></div>
            <div class="box"><small>Sales Rep</small><strong>${escapeHtml([salesRep?.name, salesRep?.email, salesRep?.phone].filter(Boolean).join("\n") || "-")}</strong></div>
            <div class="box"><small>Date</small><strong>${escapeHtml(formatDate(quote.quoteDate))}</strong></div>
          </div>
          <div class="section-title">Scope of Armed Response Services</div>
          <p>${escapeHtml([quote.armedResponseDetails?.packageDescription, quote.armedResponseDetails?.specialInstructions].filter(Boolean).join(" | ") || "Monthly armed response services as requested.")}</p>
          <table>
            <thead><tr><th>Service</th><th>Quantity</th><th>Monthly Selling</th></tr></thead>
            <tbody>
              <tr><td>${escapeHtml(quote.armedResponseDetails?.packageName || "Monthly armed response package")}</td><td class="right">${escapeHtml(quote.armedResponseDetails?.packageSiteCount || 1)}</td><td class="right">${money.format(Number(quote.armedResponseDetails?.monthlyPerSite || 0) * Number(quote.armedResponseDetails?.packageSiteCount || 1))}</td></tr>
              ${services.map((row) => `<tr><td>${escapeHtml(row.description || "-")}</td><td class="right">${escapeHtml(row.quantity || 0)}</td><td class="right">${money.format(Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0))}</td></tr>`).join("")}
            </tbody>
          </table>
          <table>
            <thead><tr><th>Equipment / Once-off Charges</th><th>Quantity</th><th>Once-off Selling</th></tr></thead>
            <tbody>${charges.map((row) => `<tr><td>${escapeHtml(row.item || "-")}</td><td class="right">${escapeHtml(row.quantity || 0)}</td><td class="right">${money.format(Number(row.quantity || 0) * Number(row.onceOffSellingPrice || 0))}</td></tr>`).join("") || `<tr><td colspan="3">No once-off charges</td></tr>`}</tbody>
          </table>
          <div class="totals">
            <div><span>Monthly selling price</span><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>
            <div><span>Once-off charges</span><strong>${money.format(Number(pricing.onceOffSelling || 0))}</strong></div>
            <div><span>Annual contract value</span><strong>${money.format(Number(pricing.annualValue || 0))}</strong></div>
          </div>
          <h3>Terms</h3>
          <p>This quotation is valid for 7 days from quotation date. Pricing excludes work outside the agreed scope unless approved in writing by the client.</p>
          <p><strong>Please use quotation number ${escapeHtml(quote.quoteNumber)} as your reference.</strong></p>
        </body>
      </html>
    `;
  }
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
          .logo { width: 260px; display: block; margin: 0 auto 5px; }
          .brand, .contact { text-align: center; }
          .brand strong { font-size: 13px; line-height: 1.15; }
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
          .yellow { background: #fff2a8; padding: 2px 6px; font-size: 10.5px; line-height: 1.15; }
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
  const text = String(dateValue);
  const date = new Date(text.includes("T") ? text : `${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

function cssEscapeValue(value = "") {
  if (window.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function selectorForElement(element) {
  if (!element || element === window || element === document) return "";
  if (element.id) return `#${cssEscapeValue(element.id)}`;
  const stableAttributes = [
    "data-section",
    "data-finance-opening-edit",
    "data-finance-opening-date",
    "data-finance-opening-name",
    "data-finance-opening-field",
    "data-governance-filter",
    "data-field",
    "data-request-filter",
    "data-line-index",
    "name",
  ];
  const stableSelector = stableAttributes
    .filter((attribute) => element.hasAttribute?.(attribute))
    .map((attribute) => `[${attribute}="${cssEscapeValue(element.getAttribute(attribute))}"]`)
    .join("");
  if (stableSelector) {
    const tag = element.tagName ? element.tagName.toLowerCase() : "";
    const selector = `${tag}${stableSelector}`;
    if (document.querySelectorAll(selector).length === 1) return selector;
  }
  const path = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body) {
    const tag = node.tagName.toLowerCase();
    const siblings = Array.from(node.parentElement?.children || []).filter((child) => child.tagName === node.tagName);
    const index = siblings.indexOf(node) + 1;
    path.unshift(`${tag}:nth-of-type(${Math.max(index, 1)})`);
    node = node.parentElement;
  }
  return path.length ? `body > ${path.join(" > ")}` : "";
}

function preferredScrollableElements() {
  return Array.from(document.querySelectorAll([
    ".finance-balanse-table-wrap",
    ".finance-table",
    ".governance-matrix-wrap",
    ".approval-table",
    ".items-table",
    ".setup-list",
    ".timeline-table",
    ".library-table",
    ".finance-main",
    ".preview-wrap",
  ].join(",")));
}

function scrollableElements() {
  const preferred = preferredScrollableElements();
  const discovered = Array.from(document.querySelectorAll("body *")).filter((element) => (
    element.scrollLeft || element.scrollTop || element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1
  ));
  return Array.from(new Set([...preferred, ...discovered]));
}

function captureUiPosition() {
  const active = document.activeElement;
  const focus = active && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(active.tagName)
    ? {
      selector: selectorForElement(active),
      start: active.selectionStart,
      end: active.selectionEnd,
      value: "value" in active ? active.value : "",
    }
    : null;
  return {
    windowX: window.scrollX,
    windowY: window.scrollY,
    focus,
    scrolls: scrollableElements()
      .map((element) => ({
        selector: selectorForElement(element),
        left: element.scrollLeft,
        top: element.scrollTop,
        preferred: preferredScrollableElements().includes(element),
      }))
      .filter((item) => item.selector && (item.preferred || item.left || item.top)),
  };
}

function restoreUiPosition(state) {
  if (!state) return;
  const restore = () => {
    state.scrolls.forEach((item) => {
      const element = document.querySelector(item.selector);
      if (!element) return;
      element.scrollLeft = item.left;
      element.scrollTop = item.top;
    });
    window.scrollTo(state.windowX, state.windowY);
    if (state.focus?.selector) {
      const element = document.querySelector(state.focus.selector);
      if (element && document.contains(element)) {
        element.focus({ preventScroll: true });
        if ("selectionStart" in element && state.focus.start !== null && state.focus.start !== undefined) {
          try {
            const end = state.focus.end ?? state.focus.start;
            element.setSelectionRange(state.focus.start, end);
          } catch {}
        }
      }
    }
  };
  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });
}

function preserveUiPosition(fn) {
  const state = captureUiPosition();
  const result = fn();
  restoreUiPosition(state);
  return result;
}

function withUiPositionPreserved(fn) {
  return function preservedRenderer(...args) {
    return preserveUiPosition(() => fn.apply(this, args));
  };
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
  const session = currentSession();
  if (!session?.email) return Boolean(currentUser());
  const lastActivity = new Date(session.lastActivityAt || session.signedInAt || 0).getTime();
  const idleLimit = 30 * 60 * 1000;
  if (Date.now() - lastActivity > idleLimit) {
    clearSharedSession();
    return false;
  }
  session.lastActivityAt = new Date().toISOString();
  localStorage.setItem(sharedSessionDetailsKey, JSON.stringify(session));
  return true;
}

function saveSharedSession(member, email) {
  const normalizedEmail = normalizeEmail(email || member?.email || "");
  const role = normalizeRole(member?.access || member?.role || "Read Only");
  const session = {
    userId: member?.id || slugify(normalizedEmail),
    email: normalizedEmail,
    name: member?.name || displayNameFromUser(normalizedEmail),
    role,
    permissions: member?.permissions || Array.from(memberPermissions(member || { email: normalizedEmail, access: role, id: slugify(normalizedEmail) })),
    signedInAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };
  localStorage.setItem(sharedSessionStorageKey, normalizedEmail);
  localStorage.setItem(sharedSessionDetailsKey, JSON.stringify(session));
  sessionStorage.setItem(sessionStorageKey, normalizedEmail);
  return session;
}

function saveSharedSessionObject(session) {
  if (!session?.email) return null;
  const normalizedEmail = normalizeEmail(session.email);
  const role = normalizeRole(session.role || session.access || "Read Only");
  const normalizedSession = {
    userId: session.userId || slugify(normalizedEmail),
    email: normalizedEmail,
    name: session.name || displayNameFromUser(normalizedEmail),
    role,
    access: role,
    permissions: Array.isArray(session.permissions) ? session.permissions : roleDefaultPermissions[role] || [],
    permissionsExplicit: Boolean(session.permissionsExplicit),
    signedInAt: session.signedInAt || new Date().toISOString(),
    lastActivityAt: session.lastActivityAt || new Date().toISOString(),
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

function hubSlugFromSsoRoute() {
  const match = window.location.pathname.match(/^\/hubs\/([^/]+)\/sso-login$/);
  return match ? match[1] : "";
}

function isHubSsoRoute() {
  return Boolean(hubSlugFromSsoRoute());
}

async function consumeHubSsoTokenIfPresent() {
  const hubSlug = hubSlugFromSsoRoute();
  if (!hubSlug) return false;
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const targetSection = params.get("section") || "dashboard";
  console.log("Token received by hub", { hubSlug, token });
  if (!token) {
    showSsoExpiredMessage("token not found");
    return true;
  }
  try {
    const response = await fetch("/api/sso/consume-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ hubSlug, token }),
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
      permissions: data.user.permissions,
      permissionsExplicit: data.user.permissionsExplicit,
    });
    console.log("Hub session created", { hubSlug, user: data.user });
    if (hubSlug === "quotation-hub") {
      const section = ["projections", "dashboard", "builder", "guardingBuilder", "armedResponseBuilder", "salesRequests", "approvals", "library", "projectTimeline", "settings", "audit"].includes(targetSection)
        ? targetSection
        : "dashboard";
      window.location.replace(`/hubs/quotation-hub#${section}`);
    } else {
      window.location.replace(`/hubs/${hubSlug}`);
    }
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

async function backendLogin(email, password) {
  if (window.location.protocol === "file:") throw new Error("Secure login requires the local server.");
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Login failed: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    console.log("Backend session created", { email: data.user?.email, role: data.user?.role });
    return data.user;
  } catch (error) {
    console.warn("Backend login failed", error);
    throw error;
  }
}

async function refreshBackendSession() {
  if (window.location.protocol === "file:") return false;
  try {
    const response = await fetch("/api/auth/session", { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user?.email) return false;
    saveSharedSessionObject(data.user);
    const member = memberByEmail(data.user.email);
    saveMemberRecord({
      ...(member || {}),
      id: data.user.userId || member?.id || slugify(data.user.email),
      name: data.user.name || member?.name || displayNameFromUser(data.user.email),
      email: data.user.email,
      access: data.user.role,
      role: data.user.role,
      permissions: Array.isArray(data.user.permissions) ? data.user.permissions : member?.permissions || [],
      permissionsExplicit: Boolean(data.user.permissionsExplicit),
      inviteStatus: member?.inviteStatus || "Active",
    });
    console.log("AUTH DEBUG", {
      context: "refreshBackendSession",
      email: data.user.email,
      role: data.user.role,
      isSuperAdmin: isSuperAdminUser({ ...data.user, access: data.user.role }),
      allowedHubs: getAllowedHubs({ ...data.user, id: data.user.userId, access: data.user.role }),
    });
    return true;
  } catch (error) {
    console.warn("Backend session refresh failed", error);
    return false;
  }
}

async function changeBackendPassword(currentPassword, newPassword) {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Password could not be changed.");
  return data;
}

async function refreshFirstSetupAccess() {
  if (!firstSetupButton || window.location.protocol === "file:") return;
  try {
    const response = await fetch("/api/setup/status", { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    firstSetupButton.hidden = !data.setupRequired;
    if (data.setupRequired) {
      firstSetupButton.onclick = () => {
        window.location.href = "/setup";
      };
    }
  } catch {
    firstSetupButton.hidden = true;
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

function hasActiveSuperAdminMember() {
  return storageList(membersStorageKey).some((member) => (
    normalizeRole(member.access || member.role) === "Super Admin"
    && !["disabled", "archived", "deactivated"].includes(String(member.inviteStatus || member.status || "").toLowerCase())
  ));
}

function isBootstrapSuperAdmin() {
  if (!isSignedIn()) return false;
  const email = normalizeEmail(currentUser());
  const signedInMember = storageList(membersStorageKey).find((member) => normalizeEmail(member.email) === email);
  return !signedInMember || !hasActiveSuperAdminMember();
}

const companyHubs = [
  {
    id: "quotation-hub",
    name: "Quotation Hub",
    slug: "quotation-hub",
    description: "Build, approve, send, and track technical, guarding, and armed response quotations.",
    icon: "quoteHub",
    status: "active",
    features: ["Technical", "Guarding", "Approvals"],
  },
  {
    id: "cost-hub",
    name: "Cost Hub",
    slug: "cost-hub",
    description: "Manage suppliers, purchase orders, supplier bills, payments, credits, and cost reporting.",
    icon: "cost",
    status: "active",
    features: ["Suppliers", "Bills", "Payments"],
  },
  {
    id: "finance-age-analysis",
    name: "Finance Balances and Age Analysis",
    slug: "finance-age-analysis",
    description: "Finance hub for debtor age analysis, outstanding balances, and collections oversight.",
    icon: "finance",
    status: "active",
    features: ["Ageing", "Debtors", "Balances"],
  },
  {
    id: "administration-governance",
    name: "Administration & Governance",
    slug: "administration-governance",
    description: "Central management of users, hub access, security monitoring, and full system audit activity.",
    icon: "shield",
    status: "active",
    features: ["Users", "Permissions", "Audit"],
  },
  {
    id: "fleet",
    name: "Fleet",
    slug: "fleet",
    description: "Manage company vehicles, service schedules, fuel records, and fleet compliance.",
    icon: "fleet",
    status: "placeholder",
    features: ["Vehicles", "Services", "Fuel"],
  },
  {
    id: "living-resources",
    name: "Living Resources",
    slug: "living-resources",
    description: "Operational resource hub for living quarters, accommodation, and related resources.",
    icon: "resources",
    status: "placeholder",
    features: ["Resources", "Allocation", "Records"],
  },
  {
    id: "accounts-sales",
    name: "Accounts & Sales",
    slug: "accounts-sales",
    description: "Track sales activity, client accounts, opportunities, and account handovers.",
    icon: "accounts",
    status: "placeholder",
    features: ["Clients", "Sales", "Accounts"],
  },
  {
    id: "hr",
    name: "HR",
    slug: "hr",
    description: "Human resources hub for staff records, HR workflows, and employee administration.",
    icon: "team",
    status: "placeholder",
    features: ["Staff", "HR", "Records"],
  },
  {
    id: "technical-maintenance",
    name: "Technical & Maintenance",
    slug: "technical-maintenance",
    description: "Coordinate technical jobs, maintenance requests, site work, and service follow-ups.",
    icon: "maintenance",
    status: "placeholder",
    features: ["Jobs", "Maintenance", "Sites"],
  },
  {
    id: "payroll",
    name: "Payroll",
    slug: "payroll",
    description: "Payroll hub for salary processing, payroll controls, and pay-related administration.",
    icon: "payroll",
    status: "placeholder",
    features: ["Payroll", "Salaries", "Controls"],
  },
  {
    id: "overtime",
    name: "Overtime",
    slug: "overtime",
    description: "Capture, review, approve, and report overtime across operational teams.",
    icon: "overtime",
    status: "placeholder",
    features: ["Claims", "Approval", "Hours"],
  },
  {
    id: "control-room-it",
    name: "Control Room & IT",
    slug: "control-room-it",
    description: "Manage control room, IT support, monitoring tools, and operational technology tasks.",
    icon: "controlRoom",
    status: "placeholder",
    features: ["Control Room", "IT", "Support"],
  },
  {
    id: "uniforms-stores",
    name: "Uniforms & Stores",
    slug: "uniforms-stores",
    description: "Track uniforms, stock, stores issuing, returns, and inventory movement.",
    icon: "stores",
    status: "placeholder",
    features: ["Uniforms", "Stock", "Stores"],
  },
  {
    id: "employee-files",
    name: "Employee Files",
    slug: "employee-files",
    description: "Secure document hub for employee files, supporting documents, and compliance records.",
    icon: "employeeFiles",
    status: "placeholder",
    features: ["Files", "Documents", "Compliance"],
  },
];

const ALL_HUBS = companyHubs.map((hub) => hub.slug);

function hubPermissionKey(hubId = "") {
  return {
    "quotation-hub": "quotation_hub",
    quotation: "quotation_hub",
    "cost-hub": "cost_hub",
    cost: "cost_hub",
    "finance-age-analysis": "finance_age_analysis",
    "finance-balances": "finance_age_analysis",
    fleet: "fleet_hub",
    "living-resources": "living_resources",
    "accounts-sales": "accounts_sales",
    hr: "hr_hub",
    "technical-maintenance": "technical_maintenance",
    payroll: "payroll_hub",
    overtime: "overtime_hub",
    "control-room-it": "control_room_it",
    "uniforms-stores": "uniforms_stores",
    "employee-files": "employee_files",
    "administration-governance": "administration_governance",
  }[hubId] || "";
}

function getAllowedHubs(user = currentMember()) {
  if (isSuperAdminUser(user)) return [...ALL_HUBS];
  const explicitHubRows = storageList(userHubAccessStorageKey)
    .filter((access) => (access.userId === user.id || normalizeEmail(access.email) === normalizeEmail(user.email)) && access.status === "active")
    .map((access) => access.hubSlug);
  const permissionSet = memberPermissions(user);
  const permissionHubs = ALL_HUBS.filter((hubId) => permissionSet.has(hubPermissionKey(hubId)));
  return Array.from(new Set([
    ...(Array.isArray(user?.allowedHubs) ? user.allowedHubs : []),
    ...explicitHubRows,
    ...permissionHubs,
  ]));
}

function canAccessCompanyHub(user = currentMember(), hubId = "") {
  if (isSuperAdminUser(user)) return true;
  return getAllowedHubs(user).includes(hubId);
}

function logAuthDebug(context = "hub-access", user = currentMember(), hubs = getAllowedHubs(user)) {
  console.log("AUTH DEBUG", {
    context,
    email: user.email,
    role: user.role || user.access,
    isSuperAdmin: isSuperAdminUser(user),
    allowedHubs: hubs,
    permissions: Array.from(memberPermissions(user)),
  });
}

function seedPortalTables() {
  const existingHubs = storageList(hubsStorageKey);
  const mergedHubs = [...existingHubs];
  companyHubs.forEach((hub, index) => {
    const existing = mergedHubs.find((item) => item.slug === hub.slug);
    const url = window.location.protocol === "file:"
      ? `${window.location.href.split("#")[0]}#portal`
      : `${window.location.origin}/hubs/${hub.slug}`;
    const record = {
      ...hub,
      name: hub.name,
      url,
      icon: "./interactive-security-logo.jpg",
      opensInNewTab: true,
      sortOrder: index + 1,
    };
    if (existing) Object.assign(existing, record);
    else mergedHubs.push(record);
  });
  saveStorageList(hubsStorageKey, mergedHubs);

  if (!localStorage.getItem(hubPermissionsStorageKey)) {
    const adminHubPermissions = companyHubs.flatMap((hub) => [
      { hubSlug: hub.slug, accessLevel: "Super Admin" },
      { hubSlug: hub.slug, accessLevel: "Admin" },
    ]);
    saveStorageList(hubPermissionsStorageKey, [
      ...adminHubPermissions,
      { hubSlug: "quotation-hub", accessLevel: "Quotation Builder" },
      { hubSlug: "quotation-hub", accessLevel: "Sales Representative" },
      { hubSlug: "quotation-hub", accessLevel: "Read Only" },
    ]);
  }
  const existingPermissions = storageList(hubPermissionsStorageKey);
  const requiredPermissions = [
    ...companyHubs.flatMap((hub) => [
      { hubSlug: hub.slug, accessLevel: "Super Admin" },
      { hubSlug: hub.slug, accessLevel: "Admin" },
    ]),
    { hubSlug: "quotation-hub", accessLevel: "Quotation Builder" },
    { hubSlug: "quotation-hub", accessLevel: "Sales Representative" },
    { hubSlug: "quotation-hub", accessLevel: "Read Only" },
  ];
  const mergedPermissions = [...existingPermissions];
  requiredPermissions.forEach((permission) => {
    if (!mergedPermissions.some((item) => item.hubSlug === permission.hubSlug && item.accessLevel === permission.accessLevel)) {
      mergedPermissions.push(permission);
    }
  });
  saveStorageList(hubPermissionsStorageKey, mergedPermissions);

  if (!localStorage.getItem(userHubAccessStorageKey)) {
    saveStorageList(userHubAccessStorageKey, []);
  }

  if (!localStorage.getItem(hubActivitySummaryStorageKey)) {
    saveStorageList(hubActivitySummaryStorageKey, []);
  }
  if (!localStorage.getItem(userPermissionsStorageKey)) {
    saveStorageList(userPermissionsStorageKey, []);
  }
  if (!localStorage.getItem(permissionHistoryStorageKey)) {
    saveStorageList(permissionHistoryStorageKey, []);
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
  const setupPermissions = permissionDefinitions.filter((permission) => permission.key === "quotation_hub" || quotationHubPermissionKeys.includes(permission.key));
  memberPermissionChecklist.innerHTML = `<legend>Allowed Quotation Hub access</legend>` + setupPermissions.map((permission) => `
    <label class="permission-option">
      <input type="checkbox" value="${escapeHtml(permission.key)}" ${selected.has(permission.key) ? "checked" : ""} />
      ${escapeHtml(permission.label)}
    </label>
  `).join("");
}

function selectedPermissionKeys() {
  return Array.from(memberPermissionChecklist.querySelectorAll("input[type='checkbox']:checked")).map((input) => input.value);
}

const quotationHubPermissionKeys = [
  "dashboard",
  "sales_quotation_requests",
  "build_quotation",
  "build_guarding_quotation",
  "build_armed_response_quotation",
  "approval",
  "quote_library",
  "project_timeline",
  "setup",
  "audit_trail",
];

function quotationHubPermissionDefinitions() {
  return permissionDefinitions.filter((permission) => quotationHubPermissionKeys.includes(permission.key));
}

function isInactiveMember(member) {
  return ["disabled", "archived", "deactivated"].includes(String(member.inviteStatus || member.status || "").toLowerCase());
}

function setSetupMemberNotice(memberId, message, tone = "success") {
  setupMemberNotice = { memberId, message, tone };
}

function renderSetupMemberNotice(memberId) {
  if (!setupMemberNotice || setupMemberNotice.memberId !== memberId) return "";
  return `<span class="setup-inline-notice ${escapeHtml(setupMemberNotice.tone)}">${escapeHtml(setupMemberNotice.message)}</span>`;
}

function writeQuotationPermissionAudit(member, permission, previousValue, nextValue) {
  const audit = loadAudit();
  audit.unshift({
    action: "Updated Quotation Hub permission",
    detail: `${member.email} - ${permission.label}`,
    module: "Quotation Hub Setup",
    reference: permission.section || permission.key,
    oldValue: previousValue ? "Access granted" : "Access removed",
    newValue: nextValue ? "Access granted" : "Access removed",
    notes: `Changed by ${currentUserName()}`,
    user: currentUser(),
    userName: currentUserName(),
    ipAddress: "Local prototype / browser session",
    device: navigator.userAgent || "Unknown device",
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(auditStorageKey, JSON.stringify(audit));
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

function passwordPolicyErrors(password = "") {
  return [
    [password.length >= 5, "at least 5 characters"],
    [/[A-Z]/.test(password), "at least 1 uppercase letter"],
    [/[a-z]/.test(password), "at least 1 lowercase letter"],
    [/[0-9]/.test(password), "at least 1 number"],
    [/[^A-Za-z0-9]/.test(password), "at least 1 special character"],
  ].filter(([passed]) => !passed).map(([, message]) => message);
}

function isStrongPassword(password = "") {
  return passwordPolicyErrors(password).length === 0;
}

function strongPasswordMessage(password = "") {
  const errors = passwordPolicyErrors(password);
  return errors.length ? passwordPolicyMessage : "";
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const required = ["A", "a", "7", "!"];
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return [...required, ...Array.from(bytes).map((byte) => alphabet[byte % alphabet.length])]
    .sort(() => crypto.getRandomValues(new Uint8Array(1))[0] - 128)
    .join("");
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
  const role = normalizeRole(member.access || member.role || "Read Only");
  const normalizedMember = { ...member, access: role, role };
  const index = members.findIndex((item) => item.id === member.id);
  if (index >= 0) members[index] = normalizedMember;
  else members.push(normalizedMember);
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
  if (guardingFields.salesRep) guardingFields.salesRep.innerHTML = `<option value="">Select sales rep</option>`;
  if (armedResponseFields.salesRep) armedResponseFields.salesRep.innerHTML = `<option value="">Select sales rep</option>`;
  salesRepsList().forEach((rep) => {
    const option = document.createElement("option");
    option.value = rep.id;
    option.textContent = rep.name;
    fields.salesRep.appendChild(option);
    if (guardingFields.salesRep) guardingFields.salesRep.appendChild(option.cloneNode(true));
    if (armedResponseFields.salesRep) armedResponseFields.salesRep.appendChild(option.cloneNode(true));
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
  const session = currentSession();
  if (member) {
    const sessionRole = normalizeRole(session?.role || session?.access || "");
    const role = sessionRole !== "Read Only" ? sessionRole : normalizeRole(member.access || member.role || "Read Only");
    return {
      ...member,
      access: role,
      role,
      permissions: Array.isArray(session?.permissions) ? session.permissions : member.permissions,
      permissionsExplicit: typeof session?.permissionsExplicit === "boolean" ? session.permissionsExplicit : Boolean(member.permissionsExplicit),
    };
  }
  if (isBootstrapSuperAdmin()) {
    return {
      id: session?.userId || slugify(email),
      name: session?.name || displayNameFromUser(email),
      email,
      access: "Super Admin",
      role: "Super Admin",
      inviteStatus: "Bootstrap",
      permissions: permissionDefinitions.map((permission) => permission.key),
    };
  }
  const role = normalizeRole(session?.role || session?.access || "Read Only");
  return {
    id: session?.userId || slugify(email),
    name: session?.name || currentUserName(),
    email,
    access: role,
    role,
    permissions: Array.isArray(session?.permissions) ? session.permissions : [],
  };
}

function isSuperAdminUser(member = currentMember()) {
  const session = currentSession();
  const memberEmail = normalizeEmail(member?.email || "");
  const isCurrentMember = !memberEmail || memberEmail === normalizeEmail(currentUser());
  return normalizeRole(member?.access || member?.role) === "Super Admin"
    || (isCurrentMember && normalizeRole(session?.role || session?.access) === "Super Admin");
}

function permissionKeyForSection(section) {
  return {
    portal: "quotation_hub",
    projections: "projections",
    dashboard: "dashboard",
    builder: "build_quotation",
    guardingBuilder: "build_guarding_quotation",
    armedResponseBuilder: "build_armed_response_quotation",
    approvals: "approval",
    approval: "approval",
    library: "quote_library",
    projectTimeline: "project_timeline",
    settings: "setup",
    audit: "audit_trail",
    salesRequests: "sales_quotation_requests",
  }[section] || section;
}

function memberPermissions(member = currentMember()) {
  const role = normalizeRole(member.access || member.role || "Read Only");
  if (role === "Super Admin" || isSuperAdminUser(member)) return new Set(permissionDefinitions.map((permission) => permission.key));
  const defaults = roleDefaultPermissions[role] || [];
  const explicit = member.permissionsExplicit === true && Array.isArray(member.permissions) ? member.permissions : null;
  const stored = storageList(userPermissionsStorageKey)
    .filter((permission) => permission.user_id === member.id || normalizeEmail(permission.user_email) === normalizeEmail(member.email))
    .filter((permission) => permission.can_access)
    .map((permission) => permission.permission_key);
  return new Set(explicit || (member.permissionsExplicit === true && stored.length ? stored : defaults));
}

function hasPermission(permissionKey, member = currentMember()) {
  if (!isSignedIn()) return false;
  if (isBootstrapSuperAdmin()) return true;
  const role = normalizeRole(member.access || member.role || "Read Only");
  if (role === "Super Admin" || isSuperAdminUser(member)) return true;
  const permissions = memberPermissions(member);
  if (permissionKey === "build_guarding_quotation" && permissions.has("build_quotation")) return true;
  if (permissionKey === "build_armed_response_quotation" && permissions.has("build_quotation")) return true;
  return permissions.has(permissionKey);
}

function canAccess(section) {
  if (!isSignedIn()) return false;
  if (section === "portal") return true;
  if (isInactiveMember(currentMember())) return false;
  if (section === "settings") return ["setup", "supplier_prices", "member_access_management"].some((permission) => hasPermission(permission));
  const permissionKey = permissionKeyForSection(section);
  return hasPermission(permissionKey);
}

function firstAccessibleQuotationSection() {
  return ["projections", "builder", "guardingBuilder", "armedResponseBuilder", "salesRequests", "library", "projectTimeline", "approvals", "settings", "audit"]
    .find((section) => canAccess(section)) || "portal";
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
    const section = button.dataset.section;
    const allowed = canAccess(section) && section !== "portal";
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
  if (normalized.includes("armed response")) return "Building Armed Response Quotation";
  if (normalized.includes("guarding")) return "Building Guarding Quotation";
  if (normalized.includes("quotation")) return "Building Technical Quotation";
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
    ipAddress: "Local prototype / browser session",
    device: navigator.userAgent || "Unknown device",
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(auditStorageKey, JSON.stringify(audit));
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
  if (quote.quotationType === "Guarding Quotation") return quoteAnnualValue(quote);
  if (quote.quotationType === "Monthly Armed Response Quotation") return quoteAnnualValue(quote) + Number(quote.armedResponsePricing?.onceOffSelling || quote.onceOffValue || 0);
  return quoteSubtotal(quote) * (1 + state.taxRate);
}

function dashboardQuotes() {
  const { from, to } = dashboardRange();
  const type = dashboardTypeFilter?.value || "";
  const salesRepQuery = (dashboardSalesRepFilter?.value || "").trim().toLowerCase();
  return loadApprovals().filter((quote) => {
    const date = quoteReportDate(quote);
    const rep = salesRepNameForQuote(quote).toLowerCase();
    const typeMatch = !type || (quote.quotationType || "Technical Quotation") === type;
    const salesRepMatch = !salesRepQuery || rep.includes(salesRepQuery);
    return date && date >= from && date <= to && typeMatch && salesRepMatch;
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
    technical: quotes.filter((quote) => (quote.quotationType || "Technical Quotation") === "Technical Quotation"),
    guarding: quotes.filter((quote) => quote.quotationType === "Guarding Quotation"),
    armedResponse: quotes.filter((quote) => quote.quotationType === "Monthly Armed Response Quotation"),
    lost: quotes.filter((quote) => ["client_declined", "lost"].includes(normalizedStatus(quote.status)) || quote.clientOutcome === "Rejected by client"),
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
    renderSummaryCard("Technical quotations", String(data.technical.length)),
    renderSummaryCard("Guarding quotations", String(data.guarding.length)),
    renderSummaryCard("Armed response quotations", String(data.armedResponse.length)),
    renderSummaryCard("Approved internally", String(data.approved.length)),
    renderSummaryCard("Accepted by clients", String(data.accepted.length)),
    renderSummaryCard("Lost quotations", String(data.lost.length)),
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

const salesRepMonthlyTechnicalTarget = 100000;

function projectionsRange() {
  const monthRange = monthDateRange(projectionsMonth?.value || monthInputValue());
  return {
    from: projectionsFromDate?.value || monthRange.from,
    to: projectionsToDate?.value || monthRange.to,
  };
}

function projectionQuoteDate(quote, preferred = "any") {
  if (preferred === "accepted") return (quote.clientAcceptedAt || quote.acceptedAt || quote.clientOutcomeDate || quote.updatedAt || quote.quoteDate || "").slice(0, 10);
  if (preferred === "approved") return (quote.approvedDate || quote.decidedAt || quote.approvedAt || quote.updatedAt || quote.quoteDate || "").slice(0, 10);
  return (quote.clientAcceptedAt || quote.approvedDate || quote.decidedAt || quote.submittedAt || quote.quoteDate || quote.updatedAt || "").slice(0, 10);
}

function isTechnicalQuote(quote = {}) {
  return (quote.quotationType || "Technical Quotation") === "Technical Quotation";
}

function repRecordForQuote(quote = {}) {
  const byId = salesReps[quote.salesRep];
  const repName = byId?.name || salesRepNameForQuote(quote);
  return salesRepsList().find((rep) => rep.id === quote.salesRep || rep.name === repName) || { id: slugify(repName), name: repName, branch: "", department: "" };
}

function projectionsBaseQuotes() {
  const { from, to } = projectionsRange();
  const selectedType = projectionsQuotationType?.value || "";
  const repQuery = (projectionsSalesRepFilter?.value || "").trim().toLowerCase();
  const branchQuery = (projectionsBranchFilter?.value || "").trim().toLowerCase();
  return loadApprovals().filter((quote) => {
    const rep = repRecordForQuote(quote);
    const typeMatch = !selectedType || (quote.quotationType || "Technical Quotation") === selectedType;
    const repMatch = !repQuery || String(rep.name || "").toLowerCase().includes(repQuery);
    const branchMatch = !branchQuery || String(rep.branch || rep.department || "").toLowerCase().includes(branchQuery);
    const date = projectionQuoteDate(quote);
    return typeMatch && repMatch && branchMatch && date && date >= from && date <= to;
  });
}

function projectionSalesReps() {
  const repQuery = (projectionsSalesRepFilter?.value || "").trim().toLowerCase();
  const branchQuery = (projectionsBranchFilter?.value || "").trim().toLowerCase();
  const reps = new Map();
  salesRepsList().forEach((rep) => {
    const repMatch = !repQuery || String(rep.name || "").toLowerCase().includes(repQuery);
    const branchMatch = !branchQuery || String(rep.branch || rep.department || "").toLowerCase().includes(branchQuery);
    if (repMatch && branchMatch) reps.set(rep.id || slugify(rep.name), rep);
  });
  loadApprovals().forEach((quote) => {
    const rep = repRecordForQuote(quote);
    const repMatch = !repQuery || String(rep.name || "").toLowerCase().includes(repQuery);
    const branchMatch = !branchQuery || String(rep.branch || rep.department || "").toLowerCase().includes(branchQuery);
    if (rep.name && repMatch && branchMatch) reps.set(rep.id || slugify(rep.name), rep);
  });
  return Array.from(reps.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

function projectionsData() {
  const { from, to } = projectionsRange();
  const baseQuotes = projectionsBaseQuotes();
  const repQuery = (projectionsSalesRepFilter?.value || "").trim().toLowerCase();
  const branchQuery = (projectionsBranchFilter?.value || "").trim().toLowerCase();
  const reps = projectionSalesReps();
  const soldTechnical = loadApprovals().filter((quote) => {
    const rep = repRecordForQuote(quote);
    const acceptedDate = projectionQuoteDate(quote, "accepted");
    const repMatch = !repQuery || String(rep.name || "").toLowerCase().includes(repQuery);
    const branchMatch = !branchQuery || String(rep.branch || rep.department || "").toLowerCase().includes(branchQuery);
    return isTechnicalQuote(quote) && isClientAccepted(quote) && acceptedDate && acceptedDate >= from && acceptedDate <= to && repMatch && branchMatch;
  });
  const approved = baseQuotes.filter(isInternallyApproved);
  const accepted = baseQuotes.filter(isClientAccepted);
  const rejectedByClient = baseQuotes.filter((quote) => normalizedStatus(quote.status) === "client_declined" || quote.clientOutcome === "Rejected by client");
  const outstanding = baseQuotes.filter(isOutstandingClientApproval);
  const byRep = reps.map((rep) => {
    const sold = soldTechnical.filter((quote) => {
      const quoteRep = repRecordForQuote(quote);
      return (quoteRep.id && quoteRep.id === rep.id) || quoteRep.name === rep.name;
    });
    const soldValue = roundCurrency(sold.reduce((sum, quote) => sum + quoteSubtotal(quote), 0));
    return {
      salesRep: rep.name || "Unknown",
      branch: rep.branch || rep.department || "-",
      target: salesRepMonthlyTechnicalTarget,
      soldValue,
      achievedPercent: roundCurrency((soldValue / salesRepMonthlyTechnicalTarget) * 100),
      remaining: Math.max(0, roundCurrency(salesRepMonthlyTechnicalTarget - soldValue)),
    };
  });
  const totalTarget = reps.length * salesRepMonthlyTechnicalTarget;
  const totalSold = roundCurrency(soldTechnical.reduce((sum, quote) => sum + quoteSubtotal(quote), 0));
  return {
    from,
    to,
    soldTechnical,
    approved,
    accepted,
    rejectedByClient,
    outstanding,
    byRep,
    totalSold,
    totalTarget,
    achievedPercent: totalTarget ? roundCurrency((totalSold / totalTarget) * 100) : 0,
    outstandingTarget: Math.max(0, roundCurrency(totalTarget - totalSold)),
  };
}

function repRecordForSalesRequest(request = {}) {
  const repName = request.sales_rep_name || "Unknown";
  return salesRepsList().find((rep) => rep.id === request.sales_rep_user_id || normalizeEmail(rep.email) === normalizeEmail(request.sales_rep_email) || rep.name === repName)
    || { id: request.sales_rep_user_id || slugify(repName), name: repName, branch: "", department: "" };
}

function projectionRequestDate(request = {}) {
  return (request.created_at || request.submitted_at || request.updated_at || "").slice(0, 10);
}

function projectionFilterMatchesRecord({ date = "", type = "", rep = {}, repName = "" }) {
  const { from, to } = projectionsRange();
  const selectedType = projectionsQuotationType?.value || "";
  const repQuery = (projectionsSalesRepFilter?.value || "").trim().toLowerCase();
  const branchQuery = (projectionsBranchFilter?.value || "").trim().toLowerCase();
  const typeMatch = !selectedType || (type || "Technical Quotation") === selectedType;
  const resolvedRep = rep?.name ? rep : { name: repName, branch: "", department: "" };
  const repMatch = !repQuery || String(resolvedRep.name || repName || "").toLowerCase().includes(repQuery);
  const branchMatch = !branchQuery || String(resolvedRep.branch || resolvedRep.department || "").toLowerCase().includes(branchQuery);
  return typeMatch && repMatch && branchMatch && date && date >= from && date <= to;
}

function projectionFilteredRequests() {
  return loadSalesRequests().filter((request) => projectionFilterMatchesRecord({
    date: projectionRequestDate(request),
    type: request.quotation_type || "Technical Quotation",
    rep: repRecordForSalesRequest(request),
    repName: request.sales_rep_name,
  }));
}

function isInternallyRejectedQuote(quote = {}) {
  return normalizedStatus(quote.status) === "rejected" && quote.rejectionSource !== "client";
}

function isClientRejectedQuote(quote = {}) {
  return normalizedStatus(quote.status) === "client_declined" || quote.clientOutcome === "Rejected by client" || quote.rejectionSource === "client";
}

function isSentToClientQuote(quote = {}) {
  return normalizedStatus(quote.status) === "sent_to_client";
}

function projectionRepActivityRows(quotes, predicate, valueMode = "count") {
  const rows = new Map();
  projectionSalesReps().forEach((rep) => rows.set(rep.id || slugify(rep.name), {
    key: rep.id || slugify(rep.name),
    salesRep: rep.name || "Unknown",
    value: 0,
  }));
  quotes.filter(predicate).forEach((quote) => {
    const rep = repRecordForQuote(quote);
    const key = rep.id || slugify(rep.name || "Unknown");
    const row = rows.get(key) || { key, salesRep: rep.name || "Unknown", value: 0 };
    row.value += valueMode === "value" ? quoteSubtotal(quote) : 1;
    rows.set(key, row);
  });
  return Array.from(rows.values()).sort((a, b) => a.salesRep.localeCompare(b.salesRep));
}

function monthlySubmittedRequestRows() {
  const now = new Date();
  const rows = [];
  const selectedType = projectionsQuotationType?.value || "";
  const repQuery = (projectionsSalesRepFilter?.value || "").trim().toLowerCase();
  const branchQuery = (projectionsBranchFilter?.value || "").trim().toLowerCase();
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = monthInputValue(date);
    const range = monthDateRange(month);
    const value = loadSalesRequests().filter((request) => {
      const requestDate = projectionRequestDate(request);
      const rep = repRecordForSalesRequest(request);
      const typeMatch = !selectedType || (request.quotation_type || "Technical Quotation") === selectedType;
      const repMatch = !repQuery || String(rep.name || request.sales_rep_name || "").toLowerCase().includes(repQuery);
      const branchMatch = !branchQuery || String(rep.branch || rep.department || "").toLowerCase().includes(branchQuery);
      return typeMatch && repMatch && branchMatch && requestDate >= range.from && requestDate <= range.to;
    }).length;
    rows.push({ label: date.toLocaleDateString("en-ZA", { month: "short" }), value });
  }
  return rows;
}

function projectionActivityData() {
  const requests = projectionFilteredRequests();
  const quotes = projectionsBaseQuotes();
  const submittedForApprovalQuotes = quotes.filter(isApprovalPendingQuote);
  const approved = quotes.filter(isInternallyApproved);
  const rejectedInternal = quotes.filter(isInternallyRejectedQuote);
  const sentToClient = quotes.filter(isSentToClientQuote);
  const acceptedClient = quotes.filter(isClientAccepted);
  const rejectedClient = quotes.filter(isClientRejectedQuote);
  const awaitingClient = quotes.filter(isOutstandingClientApproval);
  const completedRequests = requests.filter((request) => salesRequestStatusLabel(request.status) === "Completed");
  const acceptedProcessing = requests.filter((request) => salesRequestStatusLabel(request.status) === "Accepted for Processing");
  const submittedApprovalRequests = requests.filter((request) => salesRequestStatusLabel(request.status) === "Submitted for Approval");
  const statusRows = [
    { label: "Submitted", value: requests.length, color: "#2563eb" },
    { label: "In Progress", value: acceptedProcessing.length, color: "#f59e0b" },
    { label: "Awaiting Approval", value: submittedForApprovalQuotes.length + submittedApprovalRequests.length, color: "#0ea5e9" },
    { label: "Approved Internally", value: approved.length, color: "#16a34a" },
    { label: "Rejected Internally", value: rejectedInternal.length, color: "#dc2626" },
    { label: "Sent to Client", value: sentToClient.length, color: "#7c3aed" },
    { label: "Accepted by Client", value: acceptedClient.length, color: "#15803d" },
    { label: "Rejected by Client", value: rejectedClient.length, color: "#b91c1c" },
    { label: "Completed", value: completedRequests.length, color: "#0f766e" },
  ];
  return {
    requests,
    quotes,
    acceptedProcessing,
    submittedApprovalRequests,
    submittedForApprovalQuotes,
    approved,
    rejectedInternal,
    sentToClient,
    acceptedClient,
    rejectedClient,
    awaitingClient,
    completedRequests,
    statusRows,
    approvedByRep: projectionRepActivityRows(quotes, isInternallyApproved),
    acceptedByRep: projectionRepActivityRows(quotes, isClientAccepted),
    valueRows: [
      { label: "Approved value", value: roundCurrency(approved.reduce((sum, quote) => sum + quoteSubtotal(quote), 0)) },
      { label: "Accepted value", value: roundCurrency(acceptedClient.reduce((sum, quote) => sum + quoteSubtotal(quote), 0)) },
    ],
  };
}

function renderProjectionStatusPie(rows = []) {
  const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  if (!total) return `<p class="empty-state">No status data for selected range.</p>`;
  let cursor = 0;
  const stops = rows.filter((row) => row.value > 0).map((row) => {
    const start = cursor;
    cursor += (row.value / total) * 100;
    return `${row.color} ${start}% ${cursor}%`;
  }).join(", ");
  return `
    <div class="projection-pie projection-status-pie" style="background: conic-gradient(${stops});"></div>
    <div class="projection-pie-legend projection-status-legend">
      ${rows.map((row) => `<span><i style="background:${escapeHtml(row.color)}"></i>${escapeHtml(row.label)} ${row.value}</span>`).join("")}
    </div>
  `;
}

function renderProjectionProgressRows(rows) {
  if (!rows.length) return `<p class="empty-state">No sales reps match the selected filters.</p>`;
  return rows.map((row) => `
    <article class="projection-rep-card">
      <div>
        <strong>${escapeHtml(row.salesRep)}</strong>
        <small>${escapeHtml(row.branch)}</small>
      </div>
      <div class="projection-progressbar"><span style="width:${Math.min(row.achievedPercent, 100)}%"></span></div>
      <div class="projection-rep-metrics">
        <span><small>Target</small><strong>${money.format(row.target)}</strong></span>
        <span><small>Sold</small><strong>${money.format(row.soldValue)}</strong></span>
        <span><small>Achieved</small><strong>${row.achievedPercent.toFixed(2)}%</strong></span>
        <span><small>Remaining</small><strong>${money.format(row.remaining)}</strong></span>
      </div>
    </article>
  `).join("");
}

function monthlyTechnicalSalesRows() {
  const now = new Date();
  const rows = [];
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = monthInputValue(date);
    const range = monthDateRange(month);
    const value = loadApprovals()
      .filter((quote) => isTechnicalQuote(quote) && isClientAccepted(quote))
      .filter((quote) => {
        const acceptedDate = projectionQuoteDate(quote, "accepted");
        return acceptedDate >= range.from && acceptedDate <= range.to;
      })
      .reduce((sum, quote) => sum + quoteSubtotal(quote), 0);
    rows.push({ label: date.toLocaleDateString("en-ZA", { month: "short" }), value: roundCurrency(value) });
  }
  return rows;
}

function renderProjectionLineChart(rows) {
  if (!rows.length) return `<p class="empty-state">No monthly sales data available.</p>`;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const points = rows.map((row, index) => `${(index / Math.max(rows.length - 1, 1)) * 100},${100 - ((row.value / max) * 88 + 6)}`).join(" ");
  return `
    <svg viewBox="0 0 100 112" preserveAspectRatio="none" aria-label="Technical sales sold per month">
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.8" vector-effect="non-scaling-stroke"></polyline>
      ${rows.map((row, index) => `<circle cx="${(index / Math.max(rows.length - 1, 1)) * 100}" cy="${100 - ((row.value / max) * 88 + 6)}" r="1.8" vector-effect="non-scaling-stroke"></circle>`).join("")}
    </svg>
    <div class="projection-line-labels">${rows.map((row) => `<span>${escapeHtml(row.label)}</span>`).join("")}</div>
  `;
}

function renderProjections() {
  if (!canAccess("projections")) return;
  if (!projectionsMonth.value) projectionsMonth.value = monthInputValue();
  const data = projectionsData();
  const activity = projectionActivityData();
  projectionsSummary.innerHTML = [
    renderSummaryCard("Submitted", String(activity.requests.length)),
    renderSummaryCard("In Progress", String(activity.acceptedProcessing.length)),
    renderSummaryCard("Awaiting Approval", String(activity.submittedForApprovalQuotes.length + activity.submittedApprovalRequests.length)),
    renderSummaryCard("Approved Internally", String(activity.approved.length)),
    renderSummaryCard("Rejected Internally", String(activity.rejectedInternal.length)),
    renderSummaryCard("Sent to Client", String(activity.sentToClient.length)),
    renderSummaryCard("Accepted by Client", String(activity.acceptedClient.length)),
    renderSummaryCard("Rejected by Client", String(activity.rejectedClient.length)),
    renderSummaryCard("Completed", String(activity.completedRequests.length)),
  ].join("");
  projectionsActivitySummary.innerHTML = [
    renderSummaryCard("Total quotation requests submitted", String(activity.requests.length)),
    renderSummaryCard("Total quotations accepted for processing", String(activity.acceptedProcessing.length)),
    renderSummaryCard("Total quotations submitted for approval", String(activity.submittedForApprovalQuotes.length + activity.submittedApprovalRequests.length)),
    renderSummaryCard("Total quotations approved internally", String(activity.approved.length)),
    renderSummaryCard("Total quotations rejected internally", String(activity.rejectedInternal.length)),
    renderSummaryCard("Total quotations sent to client", String(activity.sentToClient.length)),
    renderSummaryCard("Total quotations accepted by client", String(activity.acceptedClient.length)),
    renderSummaryCard("Total quotations rejected by client", String(activity.rejectedClient.length)),
    renderSummaryCard("Still awaiting client response", String(activity.awaitingClient.length)),
    renderSummaryCard("Total completed quotations", String(activity.completedRequests.length)),
  ].join("");
  renderBarChart(projectionsSubmittedApprovedRejectedBar, [
    { label: "Submitted", value: activity.requests.length },
    { label: "Approved", value: activity.approved.length },
    { label: "Rejected", value: activity.rejectedInternal.length + activity.rejectedClient.length },
  ], "value", "label", (value) => String(value));
  projectionsStatusPieChart.innerHTML = renderProjectionStatusPie(activity.statusRows);
  projectionsSubmittedLineChart.innerHTML = renderProjectionLineChart(monthlySubmittedRequestRows());
  renderBarChart(projectionsApprovedRepBar, activity.approvedByRep, "value", "salesRep", (value) => String(value));
  renderBarChart(projectionsAcceptedRepBar, activity.acceptedByRep, "value", "salesRep", (value) => String(value));
  renderBarChart(projectionsValueApprovedAcceptedBar, activity.valueRows, "value", "label", (value) => money.format(value));
  projectionsRepProgress.innerHTML = renderProjectionProgressRows(data.byRep);
  renderBarChart(projectionsSalesRepBar, data.byRep, "soldValue", "salesRep", (value) => money.format(value));
  projectionsPieChart.innerHTML = `
    <div class="projection-pie" style="--achieved:${Math.min(data.achievedPercent, 100)}"></div>
    <div class="projection-pie-legend">
      <span><i class="legend-achieved"></i> Achieved ${money.format(data.totalSold)}</span>
      <span><i class="legend-outstanding"></i> Outstanding ${money.format(data.outstandingTarget)}</span>
    </div>
  `;
  projectionsLineChart.innerHTML = renderProjectionLineChart(monthlyTechnicalSalesRows());
  renderBarChart(projectionsApprovedAcceptedBar, [
    { label: "Approved internally", value: data.approved.length },
    { label: "Accepted by clients", value: data.accepted.length },
  ], "value", "label", (value) => String(value));
  projectionsTargetTable.innerHTML = tableHtml(["Sales rep", "Branch", "Monthly target", "Sold excl. VAT", "Achieved", "Remaining"], data.byRep.map((row) => [
    row.salesRep,
    row.branch,
    money.format(row.target),
    money.format(row.soldValue),
    `${row.achievedPercent.toFixed(2)}%`,
    money.format(row.remaining),
  ]));
}

function projectionsCsvRows() {
  const data = projectionsData();
  const activity = projectionActivityData();
  const rows = [
    ["Projection report", `${data.from} to ${data.to}`],
    [],
    ["Quotation Activity Summary"],
    ["Submitted", activity.requests.length],
    ["In Progress", activity.acceptedProcessing.length],
    ["Awaiting Approval", activity.submittedForApprovalQuotes.length + activity.submittedApprovalRequests.length],
    ["Approved Internally", activity.approved.length],
    ["Rejected Internally", activity.rejectedInternal.length],
    ["Sent to Client", activity.sentToClient.length],
    ["Accepted by Client", activity.acceptedClient.length],
    ["Rejected by Client", activity.rejectedClient.length],
    ["Awaiting Client Response", activity.awaitingClient.length],
    ["Completed", activity.completedRequests.length],
    [],
    ["Sales Rep Target Performance"],
    ["Total technical sold excl. VAT", data.totalSold],
    ["Total target", data.totalTarget],
    ["Target achieved %", data.achievedPercent],
    [],
    ["Sales rep", "Branch", "Monthly target", "Sold excl. VAT", "Achieved %", "Remaining"],
    ...data.byRep.map((row) => [row.salesRep, row.branch, row.target, row.soldValue, row.achievedPercent, row.remaining]),
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function exportProjectionsCsv() {
  if (!enforceAccess("projections")) return;
  downloadBlobFile(new Blob([projectionsCsvRows()], { type: "text/csv;charset=utf-8" }), `projections-report-${todayInputValue()}.csv`);
  writeAudit("Exported projections report", "Excel/CSV", "Projections", "Projections", "Export projections to Excel");
}

function exportProjectionsPdf() {
  if (!enforceAccess("projections")) return;
  const data = projectionsData();
  const activity = projectionActivityData();
  const rows = data.byRep.map((row) => `
    <tr><td>${escapeHtml(row.salesRep)}</td><td>${escapeHtml(row.branch)}</td><td>${money.format(row.target)}</td><td>${money.format(row.soldValue)}</td><td>${row.achievedPercent.toFixed(2)}%</td><td>${money.format(row.remaining)}</td></tr>
  `).join("");
  const activityRows = [
    ["Submitted", activity.requests.length],
    ["In Progress", activity.acceptedProcessing.length],
    ["Awaiting Approval", activity.submittedForApprovalQuotes.length + activity.submittedApprovalRequests.length],
    ["Approved Internally", activity.approved.length],
    ["Rejected Internally", activity.rejectedInternal.length],
    ["Sent to Client", activity.sentToClient.length],
    ["Accepted by Client", activity.acceptedClient.length],
    ["Rejected by Client", activity.rejectedClient.length],
    ["Awaiting Client Response", activity.awaitingClient.length],
    ["Completed", activity.completedRequests.length],
  ].map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join("");
  const report = window.open("", "_blank", "noopener");
  if (!report) return;
  report.document.write(`
    <html><head><title>Projections Report</title><style>
      body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#17212b}h1{margin:0 0 6px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #d8e0e6;padding:8px;text-align:left}th{background:#f2f5f7}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.summary div{border:1px solid #d8e0e6;padding:10px}.summary small{display:block;color:#687585;font-weight:700}.summary strong{display:block;font-size:16px;margin-top:4px}
    </style></head><body>
      <h1>Interactive Security Projections Report</h1>
      <p>${escapeHtml(data.from)} to ${escapeHtml(data.to)}</p>
      <div class="summary">
        <div><small>Submitted</small><strong>${activity.requests.length}</strong></div>
        <div><small>Approved internally</small><strong>${activity.approved.length}</strong></div>
        <div><small>Accepted by clients</small><strong>${activity.acceptedClient.length}</strong></div>
        <div><small>Target outstanding</small><strong>${money.format(data.outstandingTarget)}</strong></div>
      </div>
      <h2>Quotation Activity Summary</h2>
      <table><thead><tr><th>Status</th><th>Total</th></tr></thead><tbody>${activityRows}</tbody></table>
      <h2>Sales Rep Target Performance</h2>
      <table><thead><tr><th>Sales rep</th><th>Branch</th><th>Monthly target</th><th>Sold excl. VAT</th><th>Achieved</th><th>Remaining</th></tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload=()=>window.print();</script>
    </body></html>
  `);
  report.document.close();
  writeAudit("Exported projections report", "PDF", "Projections", "Projections", "Export projections to PDF");
}

function isManagementPortalUser() {
  return ["Admin", "Super Admin"].includes(currentMember().access) || hasPermission("reports");
}

function permissionKeyForHubSlug(slug = "") {
  return hubPermissionKey(slug) || permissionDefinitions.find((permission) => permission.hubSlug === slug)?.key || "";
}

function hasExplicitHubPermission(member, permissionKey) {
  if (!permissionKey) return false;
  const stored = storageList(userPermissionsStorageKey).some((permission) => (
    permission.permission_key === permissionKey
    && permission.can_access
    && (permission.user_id === member.id || normalizeEmail(permission.user_email) === normalizeEmail(member.email))
  ));
  if (stored) return true;
  return Boolean(member.permissionsExplicit && Array.isArray(member.permissions) && member.permissions.includes(permissionKey));
}

function hasHubAccess(hub) {
  if (!isSignedIn()) return false;
  if (!hub || !["active", "placeholder"].includes(hub.status)) return false;
  const member = currentMember();
  if (["disabled", "archived", "deactivated"].includes(String(member.inviteStatus || member.status || "").toLowerCase())) return false;
  const allowed = canAccessCompanyHub(member, hub.slug);
  logAuthDebug(`hasHubAccess:${hub.slug}`, member, getAllowedHubs(member));
  return allowed;
}

function currentCompanyHubSlug() {
  const match = window.location.pathname.match(/^\/hubs\/([^/]+)/);
  return match ? match[1] : "";
}

function companyHubBySlug(slug) {
  return companyHubs.find((hub) => hub.slug === slug)
    || storageList(hubsStorageKey).find((hub) => hub.slug === slug)
    || null;
}

function isPlaceholderHubRoute() {
  const slug = currentCompanyHubSlug();
  return Boolean(slug && slug !== "quotation-hub" && companyHubBySlug(slug));
}

function moduleIcon(type) {
  const icons = {
    quoteHub: `<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path><path d="m15 15 2 2 3-4"></path></svg>`,
    cost: `<svg viewBox="0 0 24 24"><path d="M4 7h16v13H4z"></path><path d="M8 7V5h8v2"></path><path d="M8 12h8"></path><path d="M8 16h5"></path></svg>`,
    finance: `<svg viewBox="0 0 24 24"><path d="M4 19h16"></path><path d="M6 17V9"></path><path d="M12 17V5"></path><path d="M18 17v-7"></path><path d="M8 11l4-4 4 4"></path></svg>`,
    fleet: `<svg viewBox="0 0 24 24"><path d="M5 16h14l-1.5-5h-11z"></path><path d="M7 16v2"></path><path d="M17 16v2"></path><path d="M7 18h.1"></path><path d="M17 18h.1"></path><path d="M8 11l1.5-4h5L16 11"></path></svg>`,
    resources: `<svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11"></path><path d="M9 20v-7h6v7"></path><path d="M7 11h2"></path><path d="M15 11h2"></path></svg>`,
    accounts: `<svg viewBox="0 0 24 24"><path d="M4 6h16v14H4z"></path><path d="M8 10h8"></path><path d="M8 14h5"></path><path d="M16 18l2-2 2 2"></path></svg>`,
    maintenance: `<svg viewBox="0 0 24 24"><path d="M14 7 8 13"></path><path d="m6 15 3 3 9-9-3-3z"></path><path d="M4 20h8"></path><path d="M17 14l3 3"></path></svg>`,
    payroll: `<svg viewBox="0 0 24 24"><path d="M6 4h12v18H6z"></path><path d="M9 8h6"></path><path d="M9 12h6"></path><path d="M9 16h3"></path></svg>`,
    overtime: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path><path d="M4 4l3 3"></path><path d="M20 4l-3 3"></path></svg>`,
    controlRoom: `<svg viewBox="0 0 24 24"><path d="M4 5h16v10H4z"></path><path d="M8 21h8"></path><path d="M12 15v6"></path><path d="M8 9h2"></path><path d="M12 9h2"></path><path d="M16 9h2"></path></svg>`,
    stores: `<svg viewBox="0 0 24 24"><path d="M4 8h16l-1 12H5z"></path><path d="M7 8V6a5 5 0 0 1 10 0v2"></path><path d="M8 13h8"></path></svg>`,
    employeeFiles: `<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5"></path><circle cx="12" cy="13" r="2"></circle><path d="M9 19a3 3 0 0 1 6 0"></path></svg>`,
    dashboard: `<svg viewBox="0 0 24 24"><path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M8 16v-5"></path><path d="M12 16V8"></path><path d="M16 16v-3"></path></svg>`,
    projects: `<svg viewBox="0 0 24 24"><path d="M4 6h6l2 2h8v10H4z"></path><path d="M8 13h8"></path><path d="M8 16h5"></path></svg>`,
    milestones: `<svg viewBox="0 0 24 24"><path d="M5 5v14"></path><path d="M5 7h13l-2 4 2 4H5"></path></svg>`,
    team: `<svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-8 0"></path><path d="M4 21a8 8 0 0 1 16 0"></path><path d="M19 8a3 3 0 0 1 2 5"></path></svg>`,
    status: `<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"></path><path d="M8 8h8"></path><path d="M8 12h5"></path><path d="m8 16 2 2 4-5"></path></svg>`,
    critical: `<svg viewBox="0 0 24 24"><path d="M4 18h16"></path><path d="M6 16l4-5 3 3 5-8"></path><path d="M18 6h2v2"></path></svg>`,
    slides: `<svg viewBox="0 0 24 24"><path d="M4 5h16v12H4z"></path><path d="M9 21h6"></path><path d="M12 17v4"></path><path d="M8 9h8"></path></svg>`,
    file: `<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5"></path><path d="M9.5 13h5"></path><path d="M9.5 17h5"></path></svg>`,
    shield: `<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"></path><path d="M9 12l2 2 4-5"></path></svg>`,
    radio: `<svg viewBox="0 0 24 24"><path d="M12 2v20"></path><path d="M5 7h14"></path><path d="M7 7l2 12"></path><path d="M17 7l-2 12"></path><path d="M8 13h8"></path></svg>`,
    upload: `<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m8 7 4-4 4 4"></path><path d="M5 15v4h14v-4"></path></svg>`,
    archive: `<svg viewBox="0 0 24 24"><path d="M4 7h16v13H4z"></path><path d="M4 7l2-4h12l2 4"></path><path d="M9 12h6"></path></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path><path d="M12 3a9 9 0 1 1-8.4 5.8"></path></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path><path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.4-2.4 1a7.8 7.8 0 0 0-1.7-1L15 5.5h-4l-.4 2.6a7.8 7.8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.4 2.4-1a7.8 7.8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.8 7.8 0 0 0 1.7-1l2.4 1 2-3.4Z"></path></svg>`,
    audit: `<svg viewBox="0 0 24 24"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="m3 6 1 1 2-2"></path><path d="m3 12 1 1 2-2"></path><path d="m3 18 1 1 2-2"></path></svg>`,
  };
  return icons[type] || icons.file;
}

const financeTabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "opening", label: "Current Balances" },
  { key: "closing", label: "Closing Balances" },
  { key: "monthly", label: "Monthly Balances" },
  { key: "age", label: "Age Analysis" },
  { key: "outstanding30", label: "30+ Days Outstanding" },
  { key: "bank", label: "Bank Balances" },
  { key: "setup", label: "Setup" },
  { key: "audit", label: "Audit Trail" },
];

const costTabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "requests", label: "Purchase Requests" },
  { key: "approvals", label: "PO Approvals" },
  { key: "entities", label: "Entities" },
  { key: "suppliers", label: "Suppliers" },
  { key: "purchaseOrders", label: "Purchase Orders" },
  { key: "bills", label: "Supplier Bills" },
  { key: "payments", label: "Payments" },
  { key: "credits", label: "Credit Notes" },
  { key: "documents", label: "Documents" },
  { key: "reports", label: "Reports" },
  { key: "setup", label: "Setup" },
  { key: "audit", label: "Audit Trail" },
];

const costStorageKeys = {
  requests: `${costStoragePrefix}:requests`,
  entities: `${costStoragePrefix}:entities`,
  suppliers: `${costStoragePrefix}:suppliers`,
  purchaseOrders: `${costStoragePrefix}:purchaseOrders`,
  bills: `${costStoragePrefix}:bills`,
  payments: `${costStoragePrefix}:payments`,
  credits: `${costStoragePrefix}:credits`,
  documents: `${costStoragePrefix}:documents`,
  setup: `${costStoragePrefix}:setup`,
  sequence: `${costStoragePrefix}:sequence`,
};

let activeCostTab = "dashboard";
let costEditingSupplierId = "";
let costEditingEntityId = "";
let costEntityBalanceImportNotice = "";
let costSelectedApprovalId = "";
let costApprovalSearch = "";
let costApprovalFilters = { status: "", requester: "", supplier: "", date: "", entity: "" };
let costRequestFilters = { status: "", requester: "", supplier: "", date: "", entity: "" };
let costDashboardFilters = { month: todayInputValue().slice(0, 7), supplierId: "", branch: "" };
let costSelectedEntityOverview = "";
let costEntityOverviewTab = "paid";

const governanceTabs = [
  { key: "dashboard", label: "System Dashboard" },
  { key: "users", label: "User Access Management" },
  { key: "matrix", label: "Hub Access Matrix" },
  { key: "audit", label: "Full System Audit Trail" },
  { key: "search", label: "Audit Search Centre" },
  { key: "reports", label: "Audit Reports" },
  { key: "security", label: "Login & Security Monitoring" },
  { key: "history", label: "Permission History" },
];

let activeGovernanceTab = "dashboard";
let governanceAuditFilters = { user: "", from: "", to: "", hub: "", action: "", search: "" };
let governanceEditingUserId = "";
let governanceUserNotice = null;
let setupEditingMemberId = "";
let setupMemberNotice = null;
let governancePasswordResetRequests = [];
let governanceEmailDiagnostics = null;
let governancePasswordResetRequestsLoaded = false;
let governancePasswordResetRequestsLoading = false;

const financeStorageKeys = {
  opening: `${financeStoragePrefix}:openingBalances`,
  closing: `${financeStoragePrefix}:closingBalances`,
  monthly: `${financeStoragePrefix}:monthlyBalances`,
  age: `${financeStoragePrefix}:ageAnalysis`,
  bank: `${financeStoragePrefix}:bankBalances`,
  debitBudget: `${financeStoragePrefix}:debitOrderBudget`,
  setup: `${financeStoragePrefix}:setup`,
  openingMeta: `${financeStoragePrefix}:openingMeta`,
  openingAccounts: `${financeStoragePrefix}:openingAccounts`,
  openingHistoricalExpanded: `${financeStoragePrefix}:openingHistoricalExpanded`,
};

let activeFinanceTab = "dashboard";
let financeOpeningView = { mode: "compact", from: "", to: "" };

const financeOpeningTemplateRows = [
  { name: "NEDBANK", type: "heading" },
  { name: "OPERATING COMPANIES", type: "section" },
  { name: "CC", type: "account" },
  { name: "PTY", type: "account" },
  { name: "LIMPOPO", type: "account" },
  { name: "UPLIFTMENT TRUST", type: "account" },
  { name: "GAUTENG", type: "account" },
  { name: "TRUCK & AUTO", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "PROPERTY COMPANIES", type: "section" },
  { name: "MPUMALANGA", type: "account" },
  { name: "ETERNITY STAR", type: "account" },
  { name: "ANRONOX", type: "account" },
  { name: "FONZOMART", type: "account" },
  { name: "LE LENANLIZE", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "LOAN COMPANIES", type: "section" },
  { name: "PROVIDENT FUND", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "BONDS", type: "section" },
  { name: "LE LENANLIZE BOND", type: "account" },
  { name: "MPUMALANGA BOND", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "NEDBANK PRIVATE", type: "section" },
  { name: "F RYKAART", type: "account" },
  { name: "N RYKAART", type: "account" },
  { name: "CC CREDIT CARD", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "TOTAL AVAILABLE", type: "available-total" },
  { name: "DISCOVERY", type: "section" },
  { name: "DISCOVERY CURRENT", type: "account" },
  { name: "DISCOVERY CREDIT", type: "account" },
  { name: "TOTAL AVAILABLE", type: "available-total" },
  { name: "FNB", type: "section" },
  { name: "FNB CHEQUE", type: "account" },
  { name: "FNB CURRENT", type: "account" },
  { name: "FNB CREDIT", type: "account" },
  { name: "FNB BUSINESS", type: "account" },
  { name: "TOTAL AVAILABLE", type: "available-total" },
  { name: "ABSA BUSINESS", type: "section" },
  { name: "ABSA 1", type: "account" },
  { name: "ABSA 2", type: "account" },
  { name: "CC", type: "account" },
  { name: "TRUCK & AUTO", type: "account" },
  { name: "GAUTENG", type: "account" },
  { name: "LIMPOPO", type: "account" },
  { name: "INTERACTIVE CURRENT", type: "account" },
  { name: "MPUMALANGA", type: "account" },
  { name: "HILUGEN (WILGE)", type: "account" },
  { name: "ZECASCORE (24)", type: "account" },
  { name: "OXFOCRAFT", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "ABSA PRIVATE", type: "section" },
  { name: "ABSA CURRENT", type: "account" },
  { name: "ABSA CREDIT", type: "account" },
  { name: "SUB TOTAL", type: "total" },
  { name: "TOTAL AVAILABLE", type: "available-total" },
  { name: "SALARY COMPANIES", type: "section" },
  { name: "ASCOGYSTIX", type: "account" },
  { name: "PLATOSOL", type: "account" },
  { name: "ASCOPAX", type: "account" },
  { name: "TOTAL AVAILABLE", type: "available-total" },
  { name: "GRAND TOTAL AVAILABLE", type: "grand-total" },
];

function financeRows(type) {
  return storageList(financeStorageKeys[type], []);
}

function saveFinanceRows(type, rows) {
  saveStorageList(financeStorageKeys[type], rows);
}

function financeNumber(value) {
  return Number(String(value ?? "").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
}

function financeAudit(action, reference = "-", notes = "") {
  writeAudit(action, reference, "Finance Balances and Age Analysis", reference, notes || `Action by ${currentUserName()}`);
}

function financeOpeningDateLabel(dateValue) {
  const date = new Date(`${dateValue || todayInputValue()}T00:00:00`);
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}

function financeOpeningRowKey(row = {}) {
  return `${row.accountCode || ""}|${row.accountName || row.partyName || ""}|${row.rowOrder ?? ""}`;
}

function financeOpeningTemplateAccounts() {
  const accounts = [];
  let group = "OPERATING COMPANIES";
  financeOpeningTemplateRows.forEach((row, index) => {
    if (row.type === "section") {
      group = row.name;
      return;
    }
    if (row.type !== "account") return;
    accounts.push({
      id: `opening-account-${slugify(group)}-${slugify(row.name)}-${index}`,
      name: row.name,
      group,
      accountCode: slugify(row.name).toUpperCase(),
      branch: "",
      rowOrder: index,
      status: "active",
      archivedAt: "",
    });
  });
  return accounts;
}

function saveFinanceOpeningAccounts(accounts) {
  saveStorageList(financeStorageKeys.openingAccounts, accounts);
}

function financeOpeningAccounts() {
  const saved = storageList(financeStorageKeys.openingAccounts, []);
  const templateAccounts = financeOpeningTemplateAccounts();
  const accounts = saved.length ? [...saved] : [...templateAccounts];
  const known = new Set(accounts.map((account) => `${account.group || ""}|${account.name || ""}`.toLowerCase()));
  templateAccounts.forEach((account) => {
    const key = `${account.group || ""}|${account.name || ""}`.toLowerCase();
    if (!known.has(key)) {
      accounts.push(account);
      known.add(key);
    }
  });
  financeRows("opening").forEach((row) => {
    if ((row.rowType || "account") !== "account") return;
    const name = row.accountName || row.partyName || row.accountCode || "";
    if (!name) return;
    const group = row.group || row.sectionName || row.branch || "OPERATING COMPANIES";
    const key = `${group}|${name}`.toLowerCase();
    if (known.has(key)) return;
    accounts.push({
      id: `opening-account-imported-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      group,
      accountCode: row.accountCode || slugify(name).toUpperCase(),
      branch: row.branch || "",
      rowOrder: Number(row.rowOrder ?? accounts.length + 1000),
      status: "active",
      archivedAt: "",
    });
    known.add(key);
  });
  if (!saved.length) saveFinanceOpeningAccounts(accounts);
  return accounts.sort((a, b) => String(a.group || "").localeCompare(String(b.group || "")) || Number(a.rowOrder ?? 9999) - Number(b.rowOrder ?? 9999));
}

function financeOpeningGroupNames() {
  const names = financeOpeningTemplateRows.filter((row) => row.type === "section").map((row) => row.name);
  financeOpeningAccounts().forEach((account) => {
    if (account.group && !names.includes(account.group)) names.push(account.group);
  });
  return names;
}

function financeOpeningTemplateTotalLabels() {
  const labels = {};
  let currentGroup = "";
  let grandTotalLabel = "GRAND TOTAL AVAILABLE";
  financeOpeningTemplateRows.forEach((row) => {
    if (row.type === "section") {
      currentGroup = row.name;
      return;
    }
    if (row.type === "grand-total") {
      grandTotalLabel = row.name;
      return;
    }
    if (row.type === "total" && currentGroup && !labels[currentGroup]) {
      labels[currentGroup] = row.name;
    }
  });
  return { labels, grandTotalLabel };
}

function financeCanManageOpeningAccounts() {
  return ["Admin", "Super Admin"].includes(currentMember().access) || hasPermission("finance_age_analysis");
}

function financeOpeningBaseRows(includeArchived = financeOpeningView.mode !== "current") {
  const saved = financeRows("opening");
  const base = [];
  const accounts = financeOpeningAccounts();
  financeOpeningGroupNames().forEach((groupName, groupIndex) => {
    const groupAccounts = accounts.filter((account) => account.group === groupName && (includeArchived || account.status !== "archived"));
    if (!groupAccounts.length && !includeArchived) return;
    base.push({ name: groupName, type: "section", accountCode: "", branch: "", rowOrder: groupIndex * 1000 });
    groupAccounts.forEach((account) => {
      base.push({
        id: account.id,
        name: account.name,
        type: "account",
        accountCode: account.accountCode || slugify(account.name).toUpperCase(),
        branch: account.branch || "",
        rowOrder: Number(account.rowOrder ?? base.length),
        status: account.status || "active",
        group: account.group,
      });
    });
  });
  const known = new Set(base.map((row) => `${row.group || ""}|${row.name}`.toLowerCase()));
  saved
    .slice()
    .sort((a, b) => Number(a.rowOrder ?? 9999) - Number(b.rowOrder ?? 9999))
    .forEach((row) => {
      const name = row.accountName || row.partyName || row.accountCode || "";
      const group = row.group || row.sectionName || "OPERATING COMPANIES";
      const key = `${group}|${name}`.toLowerCase();
      if (!name || known.has(key)) return;
      const registered = accounts.find((account) => account.name.toLowerCase() === name.toLowerCase() && account.group.toLowerCase() === group.toLowerCase());
      if (registered?.status === "archived" && !includeArchived) return;
      known.add(key);
      base.push({
        name,
        type: row.rowType || "account",
        accountCode: row.accountCode || slugify(name).toUpperCase(),
        branch: row.branch || "",
        rowOrder: Number(row.rowOrder ?? base.length),
        group,
      });
    });
  return base;
}

function financeOpeningGroups() {
  const groups = [];
  let currentGroup = null;
  const { labels } = financeOpeningTemplateTotalLabels();
  financeOpeningBaseRows().forEach((row) => {
    if (row.type === "section") {
      currentGroup = { name: row.name, rowOrder: row.rowOrder, totalLabel: labels[row.name] || "SUB TOTAL", accounts: [] };
      groups.push(currentGroup);
      return;
    }
    if (row.type !== "account") return;
    if (!currentGroup) {
      currentGroup = { name: "OPERATING COMPANIES", rowOrder: 0, totalLabel: labels["OPERATING COMPANIES"] || "SUB TOTAL", accounts: [] };
      groups.push(currentGroup);
    }
    currentGroup.accounts.push(row);
  });
  return groups;
}

function financeOpeningStructuredRows() {
  const includeArchived = financeOpeningView.mode !== "current";
  const accounts = financeOpeningAccounts().filter((account) => includeArchived || account.status !== "archived");
  const accountsByGroup = new Map();
  accounts.forEach((account) => {
    const key = String(account.group || "OPERATING COMPANIES").toUpperCase();
    if (!accountsByGroup.has(key)) accountsByGroup.set(key, []);
    accountsByGroup.get(key).push(account);
  });
  accountsByGroup.forEach((groupAccounts) => groupAccounts.sort((a, b) => Number(a.rowOrder ?? 9999) - Number(b.rowOrder ?? 9999)));

  const rows = [];
  const rendered = new Set();
  const templateGroups = new Set(financeOpeningTemplateRows.filter((row) => row.type === "section").map((row) => row.name.toUpperCase()));
  let currentGroup = "";
  let sectionAccounts = [];
  let bankBlockAccounts = [];

  const pushAccount = (account) => {
    if (!account) return;
    const key = account.id || `${account.group}|${account.name}|${account.rowOrder}`;
    if (rendered.has(key)) return;
    const row = {
      id: account.id,
      name: account.name,
      type: "account",
      accountCode: account.accountCode || slugify(account.name).toUpperCase(),
      branch: account.branch || "",
      rowOrder: Number(account.rowOrder ?? rows.length),
      status: account.status || "active",
      group: account.group || currentGroup,
    };
    rows.push(row);
    sectionAccounts.push(row);
    bankBlockAccounts.push(row);
    rendered.add(key);
  };

  const pushRemainingAccounts = (groupName) => {
    const list = accountsByGroup.get(String(groupName || "").toUpperCase()) || [];
    list.forEach(pushAccount);
  };

  financeOpeningTemplateRows.forEach((templateRow, index) => {
    if (templateRow.type === "heading") {
      rows.push({ ...templateRow, rowOrder: index });
      return;
    }
    if (templateRow.type === "section") {
      currentGroup = templateRow.name;
      sectionAccounts = [];
      rows.push({ ...templateRow, rowOrder: index });
      return;
    }
    if (templateRow.type === "account") {
      const list = accountsByGroup.get(String(currentGroup || "").toUpperCase()) || [];
      const account = list.find((item) => String(item.name || "").toUpperCase() === templateRow.name.toUpperCase());
      if (account) pushAccount(account);
      return;
    }
    if (templateRow.type === "total") {
      pushRemainingAccounts(currentGroup);
      rows.push({ ...templateRow, rowOrder: index, scopeAccounts: [...sectionAccounts] });
      return;
    }
    if (templateRow.type === "available-total") {
      pushRemainingAccounts(currentGroup);
      rows.push({ ...templateRow, rowOrder: index, scopeAccounts: [...bankBlockAccounts] });
      bankBlockAccounts = [];
      return;
    }
    if (templateRow.type === "grand-total") {
      accountsByGroup.forEach((groupAccounts, groupName) => {
        if (templateGroups.has(groupName)) return;
        const customAccounts = groupAccounts.filter((account) => !rendered.has(account.id || `${account.group}|${account.name}|${account.rowOrder}`));
        if (!customAccounts.length) return;
        rows.push({ name: customAccounts[0].group || groupName, type: "section", rowOrder: rows.length + 1000 });
        sectionAccounts = [];
        customAccounts.forEach(pushAccount);
        rows.push({ name: "SUB TOTAL", type: "total", rowOrder: rows.length + 1000, scopeAccounts: [...sectionAccounts] });
      });
      rows.push({ ...templateRow, rowOrder: index, scopeAccounts: rows.filter((row) => row.type === "account" && row.status !== "archived") });
    }
  });

  return rows;
}

function latestFinanceOpeningDateBefore(dateValue) {
  return financeRows("opening")
    .map((row) => row.openingDate)
    .filter((date) => date && date < dateValue)
    .sort()
    .pop() || "";
}

function ensureFinanceDailyOpeningBalances() {
  const today = todayInputValue();
  const rows = financeRows("opening");
  const previousDate = latestFinanceOpeningDateBefore(today);
  const previousRows = rows.filter((row) => row.openingDate === previousDate);
  const previousByKey = Object.fromEntries(previousRows.map((row) => [financeOpeningRowKey(row), row]));
  const createdAt = new Date().toISOString();
  const todayRows = rows.filter((row) => row.openingDate === today);
  const todayKeys = new Set(todayRows.map((row) => financeOpeningRowKey(row)));
  const generated = financeOpeningBaseRows(false).filter((base) => {
    if (base.type !== "account") return false;
    return !todayKeys.has(`${base.accountCode || ""}|${base.name}|${base.rowOrder ?? ""}`)
      && !todayRows.some((row) => (row.accountName || row.partyName) === base.name && Number(row.rowOrder ?? -1) === Number(base.rowOrder ?? -2));
  }).map((base) => {
    const previous = previousByKey[`${base.accountCode || ""}|${base.name}|${base.rowOrder ?? ""}`]
      || previousRows.find((row) => Number(row.rowOrder ?? -1) === Number(base.rowOrder ?? -2) && (!base.accountCode || row.accountCode === base.accountCode))
      || previousRows.find((row) => (row.accountName || row.partyName) === base.name)
      || {};
    return {
      id: `finance-opening-${today}-${base.rowOrder}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      accountCode: base.accountCode,
      accountName: base.name,
      partyName: base.name,
      branch: base.branch,
      group: base.group || "",
      rowType: base.type,
      rowOrder: base.rowOrder,
      openingDate: today,
      openingBalance: financeNumber(previous.closingBalance ?? previous.availableBalance ?? previous.openingBalance ?? 0),
      availableBalance: financeNumber(previous.availableBalance ?? previous.openingBalance ?? 0),
      source: previousDate ? "Previous day closing balance" : "BALANSE template",
      importedBy: currentUserName(),
      importedAt: createdAt,
    };
  });
  if (!generated.length) return;
  saveFinanceRows("opening", [...rows, ...generated]);
  const meta = JSON.parse(localStorage.getItem(financeStorageKeys.openingMeta) || "{}");
  if (meta.lastDailyDate !== today) {
    financeAudit("New daily current balance created", financeOpeningDateLabel(today), previousDate ? `Created from ${financeOpeningDateLabel(previousDate)} available balances` : "Created from BALANSE template layout");
    if (previousDate) financeAudit("Previous day retained", financeOpeningDateLabel(previousDate), "BALANSE view keeps previous days available for comparison");
    localStorage.setItem(financeStorageKeys.openingMeta, JSON.stringify({ ...meta, lastDailyDate: today }));
  }
}

function financeOpeningVisibleDates() {
  ensureFinanceDailyOpeningBalances();
  const dates = Array.from(new Set(financeRows("opening").map((row) => row.openingDate).filter(Boolean))).sort();
  const today = todayInputValue();
  const expanded = localStorage.getItem(financeStorageKeys.openingHistoricalExpanded) === "true";
  if (financeOpeningView.mode === "historical" || expanded) return dates;
  if (financeOpeningView.mode === "range") {
    const from = financeOpeningView.from || dates[0] || today;
    const to = financeOpeningView.to || today;
    return dates.filter((date) => date >= from && date <= to);
  }
  const currentDate = dates.includes(today) ? today : (dates[dates.length - 1] || today);
  const previousDate = dates.filter((date) => date < currentDate).pop();
  return Array.from(new Set([previousDate, currentDate].filter(Boolean)));
}

function financeOpeningDateGroups() {
  return financeOpeningVisibleDates()
    .slice()
    .sort()
    .map((date) => ({
      date,
    }));
}

function financeOpeningRowRecord(base, date, allRows, byDateAndRow) {
  const baseGroup = String(base.group || "").toLowerCase();
  return byDateAndRow.get(`${date}|${base.accountCode || ""}|${base.name}|${base.rowOrder ?? ""}`)
    || allRows.find((row) => row.openingDate === date && Number(row.rowOrder ?? -1) === Number(base.rowOrder ?? -2) && (!base.accountCode || row.accountCode === base.accountCode))
    || allRows.find((row) => row.openingDate === date && (row.accountName || row.partyName) === base.name && Number(row.rowOrder ?? -1) === Number(base.rowOrder ?? -2))
    || allRows.find((row) => row.openingDate === date && String(row.group || row.branch || "").toLowerCase() === baseGroup && (row.accountName || row.partyName) === base.name)
    || allRows.find((row) => row.openingDate === date && (row.accountName || row.partyName) === base.name)
    || {};
}

function financeOpeningCellValue(base, column, allRows, byDateAndRow) {
  const record = financeOpeningRowRecord(base, column.date, allRows, byDateAndRow);
  return financeNumber(record[column.field]);
}

function financeOpeningMoney(value) {
  const amount = roundCurrency(financeNumber(value));
  const formatted = `R ${Math.abs(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return amount < 0 ? `-(${formatted})` : formatted;
}

function financeDebitBudgetRecordsForTable() {
  return financeRows("debitBudget").slice(0, 250).map((row) => ({
    "Account / client": row.accountName,
    Date: financeOpeningDateLabel(row.budgetDate),
    Balance: financeOpeningMoney(row.balance),
    Available: financeOpeningMoney(row.available),
    Source: row.source || "DEBIT ORDER BUDGET",
    "Imported by": row.importedBy || "-",
  }));
}

function financeOpeningColumnTotal(accounts, column, allRows, byDateAndRow) {
  return accounts
    .filter((account) => account.type === "account" && account.status !== "archived")
    .reduce((sum, account) => sum + financeOpeningCellValue(account, column, allRows, byDateAndRow), 0);
}

function financeOpeningGroupSubtotal(group, columns, allRows, byDateAndRow) {
  return columns.map((column) => financeOpeningColumnTotal(group.accounts, column, allRows, byDateAndRow));
}

function financeOpeningGrandTotals(groups, columns, allRows, byDateAndRow) {
  const groupSubtotals = groups.map((group) => financeOpeningGroupSubtotal(group, columns, allRows, byDateAndRow));
  return columns.map((_, columnIndex) => groupSubtotals.reduce((sum, subtotal) => sum + financeNumber(subtotal[columnIndex]), 0));
}

function financeOpeningDisplayColumns(dateGroups) {
  return dateGroups.flatMap((group) => [
    { date: group.date, field: "openingBalance", label: "BALANCE", role: "balance", isCurrent: group.date === todayInputValue() },
    { date: group.date, field: "availableBalance", label: "AVAILABLE", role: "available", isCurrent: group.date === todayInputValue() },
  ]);
}

function financeOpeningColumnClass(column) {
  return `finance-balanse-${column.role}${column.isCurrent ? " finance-balanse-current-day" : ""}`;
}

function financeOpeningAccountCell(base, column, allRows, byDateAndRow) {
  const record = financeOpeningRowRecord(base, column.date, allRows, byDateAndRow);
  const value = financeNumber(record[column.field]);
  return `
    <td class="finance-balanse-value ${escapeHtml(financeOpeningColumnClass(column))}">
      <input class="finance-balance-input" type="number" step="0.01" value="${value}"
        data-finance-opening-edit="${escapeHtml(record.id || "")}"
        data-finance-opening-date="${escapeHtml(column.date)}"
        data-finance-opening-name="${escapeHtml(base.name)}"
        data-finance-opening-group="${escapeHtml(base.group || "")}"
        data-finance-opening-code="${escapeHtml(base.accountCode || "")}"
        data-finance-opening-row-order="${escapeHtml(String(base.rowOrder ?? ""))}"
        data-finance-opening-field="${escapeHtml(column.field)}" />
    </td>
  `;
}

function financeOpeningCalculatedRow(label, accounts, columns, allRows, byDateAndRow, type = "total") {
  return `
    <tr class="finance-balanse-${escapeHtml(type)}">
      <th>${escapeHtml(label)}</th>
      ${columns.map((column) => {
        const total = financeOpeningColumnTotal(accounts, column, allRows, byDateAndRow);
        return `<td class="finance-balanse-value ${escapeHtml(financeOpeningColumnClass(column))}">${escapeHtml(financeOpeningMoney(total))}</td>`;
      }).join("")}
    </tr>
  `;
}

function financeOpeningGrandTotalRow(groups, columns, allRows, byDateAndRow) {
  const totals = financeOpeningGrandTotals(groups, columns, allRows, byDateAndRow);
  const { grandTotalLabel } = financeOpeningTemplateTotalLabels();
  return `
    <tr class="finance-balanse-grand-total">
      <th>${escapeHtml(grandTotalLabel)}</th>
      ${totals.map((total, index) => `<td class="finance-balanse-value ${escapeHtml(financeOpeningColumnClass(columns[index]))}">${escapeHtml(financeOpeningMoney(total))}</td>`).join("")}
    </tr>
  `;
}

function financeOpeningExportRows() {
  ensureFinanceDailyOpeningBalances();
  const dateGroups = financeOpeningDateGroups();
  const columns = financeOpeningDisplayColumns(dateGroups);
  const allRows = financeRows("opening");
  const byDateAndRow = new Map(allRows.map((row) => [`${row.openingDate}|${financeOpeningRowKey(row)}`, row]));
  const dateHeader = [""];
  dateGroups.forEach((group) => dateHeader.push(financeOpeningDateLabel(group.date), financeOpeningDateLabel(group.date)));
  const typeHeader = ["NEDBANK", ...columns.map((column) => column.label)];
  const rows = [dateHeader, typeHeader];
  financeOpeningStructuredRows().forEach((row) => {
    if (row.type === "heading") return;
    if (row.type === "section") {
      rows.push([row.name, ...columns.map(() => "")]);
      return;
    }
    if (row.type === "account") {
      rows.push([
        row.name,
        ...columns.map((column) => financeOpeningCellValue(row, column, allRows, byDateAndRow).toFixed(2)),
      ]);
      return;
    }
    if (["total", "available-total", "grand-total"].includes(row.type)) {
      rows.push([
        row.name,
        ...columns.map((column) => financeOpeningColumnTotal(row.scopeAccounts || [], column, allRows, byDateAndRow).toFixed(2)),
      ]);
    }
  });
  return rows;
}

function renderFinanceOpeningAccountManagement() {
  if (!financeCanManageOpeningAccounts()) return "";
  const accounts = financeOpeningAccounts();
  const groups = financeOpeningGroupNames();
  return `
    <details class="finance-account-management" open>
      <summary>Bank Account Management</summary>
      <div class="finance-account-add-row">
        <label>Account name<input id="financeNewOpeningAccountName" placeholder="New bank account name" /></label>
        <label>Group
          <select id="financeNewOpeningAccountGroup">
            ${groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join("")}
          </select>
        </label>
        <label>New group, if needed<input id="financeNewOpeningAccountGroupCustom" placeholder="Optional future group name" /></label>
        <button class="primary-btn" type="button" data-finance-opening-account-add>Add bank account</button>
      </div>
      <div class="finance-account-table">
        <div class="finance-account-row finance-account-head">
          <span>Account name</span>
          <span>Group</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        ${accounts.map((account) => `
          <div class="finance-account-row ${account.status === "archived" ? "archived" : ""}">
            <span><input value="${escapeHtml(account.name)}" data-finance-opening-account-name="${escapeHtml(account.id)}" /></span>
            <span>
              <select data-finance-opening-account-group="${escapeHtml(account.id)}">
                ${groups.map((group) => `<option value="${escapeHtml(group)}" ${group === account.group ? "selected" : ""}>${escapeHtml(group)}</option>`).join("")}
              </select>
            </span>
            <span><mark>${escapeHtml(account.status === "archived" ? "Archived" : "Active")}</mark></span>
            <span class="row-actions">
              <button class="secondary-btn" type="button" data-finance-opening-account-save="${escapeHtml(account.id)}">Save</button>
              ${account.status === "archived"
                ? `<button class="secondary-btn" type="button" data-finance-opening-account-restore="${escapeHtml(account.id)}">Restore</button>`
                : `<button class="danger-btn" type="button" data-finance-opening-account-archive="${escapeHtml(account.id)}">Archive</button>`}
            </span>
          </div>
        `).join("")}
      </div>
      <p class="finance-note">Archived accounts are hidden from the current daily view, but their historical balances stay stored for reporting and date-range comparisons.</p>
    </details>
  `;
}

function addFinanceOpeningAccount() {
  if (!financeCanManageOpeningAccounts()) return;
  const name = document.querySelector("#financeNewOpeningAccountName")?.value.trim();
  const selectedGroup = document.querySelector("#financeNewOpeningAccountGroup")?.value || "OPERATING COMPANIES";
  const customGroup = document.querySelector("#financeNewOpeningAccountGroupCustom")?.value.trim();
  const group = customGroup || selectedGroup;
  if (!name) {
    alert("Please enter a bank account name.");
    return;
  }
  const accounts = financeOpeningAccounts();
  if (accounts.some((account) => account.name.toLowerCase() === name.toLowerCase() && account.group.toLowerCase() === group.toLowerCase() && account.status !== "archived")) {
    alert("This active bank account already exists in that group.");
    return;
  }
  const nextOrder = Math.max(0, ...accounts.map((account) => Number(account.rowOrder || 0))) + 1;
  accounts.push({
    id: `opening-account-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    group,
    accountCode: slugify(name).toUpperCase(),
    branch: "",
    rowOrder: nextOrder,
    status: "active",
    archivedAt: "",
  });
  saveFinanceOpeningAccounts(accounts);
  ensureFinanceDailyOpeningBalances();
  financeAudit("Bank account added", name, `Added to ${group}`);
  renderFinanceHub("opening");
}

function updateFinanceOpeningAccount(id, changes = {}) {
  if (!financeCanManageOpeningAccounts()) return;
  const accounts = financeOpeningAccounts();
  const index = accounts.findIndex((account) => account.id === id);
  if (index < 0) return;
  const before = accounts[index];
  accounts[index] = { ...before, ...changes, updatedAt: new Date().toISOString(), updatedBy: currentUserName() };
  saveFinanceOpeningAccounts(accounts);
  ensureFinanceDailyOpeningBalances();
  financeAudit("Bank account updated", before.name, JSON.stringify({ before: { name: before.name, group: before.group, status: before.status }, after: { name: accounts[index].name, group: accounts[index].group, status: accounts[index].status } }));
  renderFinanceHub("opening");
}

function renderFinanceOpeningBalances() {
  ensureFinanceDailyOpeningBalances();
  const historicalExpanded = localStorage.getItem(financeStorageKeys.openingHistoricalExpanded) === "true" || financeOpeningView.mode === "historical";
  const dateGroups = financeOpeningDateGroups();
  const columns = financeOpeningDisplayColumns(dateGroups);
  const allRows = financeRows("opening");
  const byDateAndRow = new Map(allRows.map((row) => [`${row.openingDate}|${financeOpeningRowKey(row)}`, row]));
  const structuredRows = financeOpeningStructuredRows();
  return `
    <section class="finance-card finance-balanse-card">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">BALANSE daily balance format</p>
          <h2>Current Balances</h2>
        </div>
        <strong class="finance-active-date">${financeOpeningDateLabel(todayInputValue())}</strong>
      </div>
      <div class="finance-actions">
        <button class="secondary-btn" data-finance-import-source="Pastel Cloud" data-finance-type="opening">Import from Pastel Cloud</button>
        <button class="secondary-btn" data-finance-import-source="Listener" data-finance-type="opening">Import from Listener</button>
        <label class="secondary-btn finance-upload">Upload BALANSE Excel/CSV<input data-finance-upload="opening" type="file" accept=".csv,.xlsx,.xls" hidden /></label>
        <button class="secondary-btn" data-finance-opening-view="compact">Hide Historical Balances</button>
        <button class="secondary-btn" data-finance-opening-view="historical">${historicalExpanded ? "Historical Balances Shown" : "Show All Historical Balances"}</button>
        <button class="secondary-btn" data-finance-opening-view="range">Select date range</button>
        <button class="secondary-btn" data-finance-export="opening">Export to Excel</button>
        <button class="secondary-btn" data-finance-print="opening">Export to PDF</button>
      </div>
      <p class="finance-note">Default view shows the previous day and current day only, each with BALANCE and AVAILABLE columns. Historical dates remain stored and can be expanded for comparison.</p>
      ${renderFinanceOpeningAccountManagement()}
      <div class="finance-balanse-table-wrap ${historicalExpanded ? "is-expanded" : "is-compact"}">
        <table class="finance-balanse-table">
          <thead>
            <tr>
              <th></th>
              ${dateGroups.map((group) => `<th colspan="2" class="${group.date === todayInputValue() ? "finance-balanse-current-day" : ""}">${escapeHtml(financeOpeningDateLabel(group.date))}</th>`).join("")}
            </tr>
            <tr>
              <th>NEDBANK</th>
              ${columns.map((column) => `<th class="${column.isCurrent ? "finance-balanse-current-day" : ""}">${escapeHtml(column.label)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${structuredRows.map((row) => {
              if (row.type === "heading") return "";
              if (row.type === "section") {
                return `
                  <tr class="finance-balanse-section">
                    <th>${escapeHtml(row.name)}</th>
                    ${columns.map((column) => `<td class="${escapeHtml(financeOpeningColumnClass(column))}"></td>`).join("")}
                  </tr>
                `;
              }
              if (row.type === "account") {
                return `
                  <tr class="finance-balanse-account">
                    <th>${escapeHtml(row.name)}</th>
                    ${columns.map((column) => financeOpeningAccountCell(row, column, allRows, byDateAndRow)).join("")}
                  </tr>
                `;
              }
              if (row.type === "grand-total") return financeOpeningCalculatedRow(row.name, row.scopeAccounts || [], columns, allRows, byDateAndRow, "grand-total");
              if (row.type === "available-total") return financeOpeningCalculatedRow(row.name, row.scopeAccounts || [], columns, allRows, byDateAndRow, "available-total");
              if (row.type === "total") return financeOpeningCalculatedRow(row.name, row.scopeAccounts || [], columns, allRows, byDateAndRow, "total");
              return "";
            }).join("")}
          </tbody>
        </table>
      </div>
      <details class="finance-import-detail">
        <summary>Stored record details</summary>
        ${financeTable(Object.keys(financeRecordsForTable("opening")[0] || { Empty: "" }), financeRecordsForTable("opening"))}
      </details>
      <details class="finance-import-detail">
        <summary>Debit Order Budget support data</summary>
        ${financeTable(Object.keys(financeDebitBudgetRecordsForTable()[0] || { Empty: "" }), financeDebitBudgetRecordsForTable())}
      </details>
    </section>
  `;
}

function financeTotals() {
  const opening = financeRows("opening");
  const closing = financeRows("closing");
  const monthly = financeRows("monthly");
  const age = financeRows("age");
  const bank = financeRows("bank");
  return {
    opening: opening.reduce((sum, row) => sum + financeNumber(row.openingBalance), 0),
    closing: closing.reduce((sum, row) => sum + financeNumber(row.closingBalance), 0),
    monthly: monthly.reduce((sum, row) => sum + financeNumber(row.closingBalance), 0),
    debtors: age.filter((row) => (row.type || "Debtor") !== "Creditor").reduce((sum, row) => sum + financeNumber(row.totalOutstanding), 0),
    creditors: age.filter((row) => row.type === "Creditor").reduce((sum, row) => sum + financeNumber(row.totalOutstanding), 0),
    d30: age.reduce((sum, row) => sum + financeNumber(row.days30), 0),
    d60: age.reduce((sum, row) => sum + financeNumber(row.days60), 0),
    d90: age.reduce((sum, row) => sum + financeNumber(row.days90), 0),
    d120: age.reduce((sum, row) => sum + financeNumber(row.days120), 0),
    bank: bank.reduce((sum, row) => sum + financeNumber(row.closingBankBalance), 0),
  };
}

function financeSimpleBar(title, rows) {
  const max = Math.max(...rows.map((row) => Math.abs(Number(row.value || 0))), 1);
  return `
    <section class="finance-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="dashboard-bar-chart">
        ${rows.map((row) => `
          <div class="dashboard-bar-row">
            <span>${escapeHtml(row.label)}</span>
            <div><i style="width:${Math.max((Math.abs(row.value) / max) * 100, row.value ? 4 : 0)}%"></i></div>
            <strong>${money.format(row.value)}</strong>
          </div>
        `).join("") || `<p class="empty-state">No data imported yet.</p>`}
      </div>
    </section>
  `;
}

function financeTable(headers, rows) {
  if (!rows.length) return `<p class="empty-state">No finance records imported yet.</p>`;
  return `
    <div class="finance-table">
      <div class="finance-table-row finance-table-head" style="grid-template-columns: repeat(${headers.length}, minmax(140px, 1fr));">
        ${headers.map((header) => `<span>${escapeHtml(header)}</span>`).join("")}
      </div>
      ${rows.map((row) => `
        <div class="finance-table-row" style="grid-template-columns: repeat(${headers.length}, minmax(140px, 1fr));">
          ${headers.map((header) => `<span>${escapeHtml(row[header] ?? "-")}</span>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function financeRecordsForTable(type) {
  const sourceRows = type === "outstanding30"
    ? financeRows("age").filter((row) => financeNumber(row.days30) + financeNumber(row.days60) + financeNumber(row.days90) + financeNumber(row.days120) > 0)
    : financeRows(type);
  return sourceRows.map((row) => {
    if (type === "opening") return {
      "Account code": row.accountCode,
      "Account name": row.accountName,
      "Customer / supplier": row.partyName,
      Branch: row.branch,
      "Opening balance": money.format(financeNumber(row.openingBalance)),
      "Opening date": formatDate(row.openingDate),
      Source: row.source,
      "Imported date": formatDate(String(row.importedAt || "").slice(0, 10)),
      "Imported by": row.importedBy,
    };
    if (type === "closing") return {
      "Account code": row.accountCode,
      "Account name": row.accountName,
      "Customer / supplier": row.partyName,
      Branch: row.branch,
      "Closing balance": money.format(financeNumber(row.closingBalance)),
      "Closing date": formatDate(row.closingDate),
      Source: row.source,
      "Imported date": formatDate(String(row.importedAt || "").slice(0, 10)),
      "Imported by": row.importedBy,
    };
    if (type === "monthly") return {
      Month: row.month,
      "Account code": row.accountCode,
      "Account name": row.accountName,
      "Opening balance": money.format(financeNumber(row.openingBalance)),
      "Debit movement": money.format(financeNumber(row.debitMovement)),
      "Credit movement": money.format(financeNumber(row.creditMovement)),
      "Closing balance": money.format(financeNumber(row.closingBalance)),
      Difference: money.format(financeNumber(row.closingBalance) - financeNumber(row.openingBalance)),
      Source: row.source,
      "Imported date": formatDate(String(row.importedAt || "").slice(0, 10)),
    };
    if (type === "age" || type === "outstanding30") return {
      "Customer / supplier": row.partyName,
      "Account code": row.accountCode,
      Branch: row.branch,
      Current: money.format(financeNumber(row.current)),
      "30 Days": money.format(financeNumber(row.days30)),
      "60 Days": money.format(financeNumber(row.days60)),
      "90 Days": money.format(financeNumber(row.days90)),
      "120+ Days": money.format(financeNumber(row.days120)),
      "Total outstanding": money.format(financeNumber(row.totalOutstanding)),
      "Last payment": formatDate(row.lastPaymentDate),
      "Last invoice": formatDate(row.lastInvoiceDate),
      "Collection notes": row.collectionNotes || "",
      "Promise to pay": formatDate(row.promiseToPayDate),
      "Responsible member": row.responsibleMember || "",
      Status: row.status || "Not contacted",
    };
    return {
      "Bank name": row.bankName,
      "Account name": row.accountName,
      "Account number": row.accountNumber,
      Branch: row.branch,
      "Opening bank balance": money.format(financeNumber(row.openingBankBalance)),
      "Closing bank balance": money.format(financeNumber(row.closingBankBalance)),
      "Balance date": formatDate(row.balanceDate),
      Month: row.month,
      "Imported date": formatDate(String(row.importedAt || "").slice(0, 10)),
      "Imported by": row.importedBy,
      Notes: row.notes,
    };
  });
}

function financeExport(type) {
  if (type === "opening") {
    const rows = financeOpeningExportRows();
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `finance-current-balances-${todayInputValue()}.csv`);
    financeAudit("Export generated", "Current Balances", "Displayed BALANSE period exported to CSV");
    return;
  }
  const rows = financeRecordsForTable(type);
  const headers = Object.keys(rows[0] || { Empty: "" });
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `finance-${type}-${todayInputValue()}.csv`);
  financeAudit("Export generated", type, "Finance CSV export");
}

function financePrintExport(type) {
  if (type === "opening") {
    const rows = financeOpeningExportRows();
    const report = window.open("", "_blank", "noopener");
    if (!report) return;
    report.document.write(`
      <html><head><title>Finance Current Balances</title><style>
        body{font-family:Arial,Helvetica,sans-serif;margin:18px;color:#111}
        h1{margin:0 0 12px;font-size:18px}
        table{width:100%;border-collapse:collapse;font-size:10.5px}
        th,td{border:1px solid #000;padding:5px;text-align:right}
        th:first-child,td:first-child{text-align:left;background:#ffff00;font-weight:700}
        thead th{background:#ffff00;text-align:center;font-weight:800}
        .section th,.section td{background:#ffd966;font-weight:800;text-transform:uppercase}
        .subtotal th,.subtotal td{background:#9dc3e6;font-weight:800}
        .grand th,.grand td{background:#1f4e79;color:#fff;font-weight:900}
      </style></head><body>
        <h1>Finance Balances and Age Analysis - Current Balances</h1>
        <table>
          <thead><tr>${rows[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr><tr>${rows[1].map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.slice(2).map((row) => {
              const label = String(row[0] || "").toUpperCase();
              const isSection = row.slice(1).every((cell) => String(cell || "") === "");
              const cls = label.includes("GRAND") ? "grand" : (label.includes("SUB TOTAL") || label.includes("TOTAL AVAILABLE")) ? "subtotal" : isSection ? "section" : "";
              return `<tr class="${cls}">${row.map((cell, index) => `<td>${escapeHtml(index === 0 || isSection ? cell : financeOpeningMoney(cell))}</td>`).join("")}</tr>`;
            }).join("")}
          </tbody>
        </table>
        <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    report.document.close();
    financeAudit("Export generated", "Current Balances", "Displayed BALANSE period exported to PDF/print");
    return;
  }
  const rows = financeRecordsForTable(type);
  const headers = Object.keys(rows[0] || { Empty: "" });
  const report = window.open("", "_blank", "noopener");
  if (!report) return;
  report.document.write(`
    <html><head><title>Finance ${escapeHtml(type)} Report</title><style>
      body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#17212b}h1{margin:0 0 12px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #d8e0e6;padding:6px;text-align:left}th{background:#f2f5f7}
    </style></head><body>
      <h1>Finance Balances and Age Analysis - ${escapeHtml(type)} report</h1>
      <table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>
        ${rows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`).join("")}
      </tbody></table>
      <script>window.onload=()=>window.print();</script>
    </body></html>
  `);
  report.document.close();
  financeAudit("Export generated", type, "Finance PDF export");
}

function mapFinanceCsvRow(type, headers, row) {
  const find = (...names) => {
    const index = headers.findIndex((header) => names.some((name) => header.toLowerCase().includes(name)));
    return index >= 0 ? row[index] || "" : "";
  };
  const base = {
    id: `finance-${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    accountCode: find("account code", "code"),
    accountName: find("account name", "account"),
    partyName: find("customer", "supplier", "name"),
    branch: find("branch"),
    source: find("source") || "Excel",
    importedAt: new Date().toISOString(),
    importedBy: currentUserName(),
  };
  if (type === "opening") return { ...base, openingBalance: find("opening balance", "balance"), availableBalance: find("available"), openingDate: find("opening date", "balance date", "date"), rowType: "account", rowOrder: Date.now() };
  if (type === "closing") return { ...base, closingBalance: find("closing balance", "balance"), closingDate: find("closing date", "date") };
  if (type === "monthly") return { ...base, month: find("month"), openingBalance: find("opening"), debitMovement: find("debit"), creditMovement: find("credit"), closingBalance: find("closing") };
  if (type === "age") {
    const current = find("current");
    const d30 = find("30");
    const d60 = find("60");
    const d90 = find("90");
    const d120 = find("120");
    return { ...base, current, days30: d30, days60: d60, days90: d90, days120: d120, totalOutstanding: find("total") || [current, d30, d60, d90, d120].reduce((sum, value) => sum + financeNumber(value), 0), lastPaymentDate: find("last payment"), lastInvoiceDate: find("last invoice"), status: "Not contacted" };
  }
  return { ...base, bankName: find("bank name", "bank"), accountNumber: find("account number", "number"), openingBankBalance: find("opening"), closingBankBalance: find("closing", "balance"), balanceDate: find("balance date", "date"), month: find("month"), notes: find("notes") };
}

async function financeImportFile(type, file) {
  if (!file) return;
  const lowerName = file.name.toLowerCase();
  if (type === "opening" && (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls"))) {
    await financeImportOpeningWorkbook(file);
    return;
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("Excel uploads are accepted in the control, but this local prototype can only parse CSV for now. Please save the Excel file as CSV to import.");
    financeAudit("Excel upload attempted", file.name, "CSV parser required for local prototype");
    return;
  }
  const rows = parseCsv(await file.text());
  const headers = rows[0] || [];
  const imported = rows.slice(1).map((row) => mapFinanceCsvRow(type, headers, row));
  saveFinanceRows(type, [...imported, ...financeRows(type)]);
  financeAudit("Excel upload", file.name, `${imported.length} ${type} records imported`);
  renderFinanceHub(activeFinanceTab);
}

async function financeImportOpeningWorkbook(file) {
  try {
    const response = await fetch(`/api/finance/import-opening-balances?fileName=${encodeURIComponent(file.name)}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/octet-stream" },
      body: await file.arrayBuffer(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "BALANSE workbook could not be imported.");
    const imported = (data.rows || []).map((row, index) => ({
      ...row,
      id: row.id || `finance-opening-import-${Date.now()}-${index}`,
      importedBy: row.importedBy || currentUserName(),
      importedAt: row.importedAt || new Date().toISOString(),
    }));
    saveFinanceRows("opening", [...imported, ...financeRows("opening")]);
    if (Array.isArray(data.debitOrderBudget) && data.debitOrderBudget.length) {
      const debitBudget = data.debitOrderBudget.map((row, index) => ({
        ...row,
        id: row.id || `finance-debit-budget-${Date.now()}-${index}`,
        importedBy: row.importedBy || currentUserName(),
        importedAt: row.importedAt || new Date().toISOString(),
      }));
      saveFinanceRows("debitBudget", [...debitBudget, ...financeRows("debitBudget")]);
    }
    localStorage.setItem(financeStorageKeys.openingHistoricalExpanded, "false");
    financeOpeningView = { mode: "compact", from: "", to: "" };
    financeAudit("Balance imported", file.name, `${imported.length} BALANSE opening balance records imported`);
    renderFinanceHub("opening");
  } catch (error) {
    alert(error.message || "The BALANSE workbook could not be imported.");
    financeAudit("Excel upload attempted", file.name, error.message || "Import failed");
  }
}

function renderFinanceDashboard() {
  const totals = financeTotals();
  return `
    <div class="dashboard-summary-grid">
      ${renderSummaryCard("Total opening balances", money.format(totals.opening))}
      ${renderSummaryCard("Total closing balances", money.format(totals.closing))}
      ${renderSummaryCard("Total monthly balances", money.format(totals.monthly))}
      ${renderSummaryCard("Total debtors outstanding", money.format(totals.debtors))}
      ${renderSummaryCard("Total creditors outstanding", money.format(totals.creditors))}
      ${renderSummaryCard("Total 30+ days outstanding", money.format(totals.d30 + totals.d60 + totals.d90 + totals.d120))}
      ${renderSummaryCard("Total 60+ days outstanding", money.format(totals.d60 + totals.d90 + totals.d120))}
      ${renderSummaryCard("Total 90+ days outstanding", money.format(totals.d90 + totals.d120))}
      ${renderSummaryCard("Total 120+ days outstanding", money.format(totals.d120))}
      ${renderSummaryCard("Total bank balances", money.format(totals.bank))}
    </div>
    <div class="dashboard-chart-grid">
      ${financeSimpleBar("Opening vs closing balances", [{ label: "Opening", value: totals.opening }, { label: "Closing", value: totals.closing }])}
      ${financeSimpleBar("Monthly balance movement", financeRows("monthly").slice(0, 8).map((row) => ({ label: row.month || row.accountName || "-", value: financeNumber(row.closingBalance) - financeNumber(row.openingBalance) })))}
      ${financeSimpleBar("Age analysis split", [{ label: "Current", value: financeRows("age").reduce((s, r) => s + financeNumber(r.current), 0) }, { label: "30 Days", value: totals.d30 }, { label: "60 Days", value: totals.d60 }, { label: "90 Days", value: totals.d90 }, { label: "120+ Days", value: totals.d120 }])}
      ${financeSimpleBar("30+ days outstanding by client/customer", financeRows("age").filter((row) => financeNumber(row.days30) + financeNumber(row.days60) + financeNumber(row.days90) + financeNumber(row.days120) > 0).slice(0, 8).map((row) => ({ label: row.partyName || row.accountName || "-", value: financeNumber(row.days30) + financeNumber(row.days60) + financeNumber(row.days90) + financeNumber(row.days120) })))}
      ${financeSimpleBar("Bank balances by account", financeRows("bank").slice(0, 8).map((row) => ({ label: row.accountName || row.bankName || "-", value: financeNumber(row.closingBankBalance) })))}
    </div>
  `;
}

function renderFinanceDataTab(type, title, purpose) {
  const tableType = type === "outstanding30" ? "outstanding30" : type;
  const tableRows = financeRecordsForTable(tableType);
  return `
    <section class="finance-card">
      <div class="panel-heading"><div><p class="eyebrow">${escapeHtml(purpose)}</p><h2>${escapeHtml(title)}</h2></div></div>
      <div class="finance-actions">
        ${["opening", "closing", "age"].includes(type) ? `<button class="secondary-btn" data-finance-import-source="Pastel Cloud" data-finance-type="${type}">Import from Pastel Cloud</button><button class="secondary-btn" data-finance-import-source="Listener" data-finance-type="${type}">Import from Listener</button>` : ""}
        ${type !== "outstanding30" ? `<label class="secondary-btn finance-upload">Manual upload/import<input data-finance-upload="${type}" type="file" accept=".csv,.xlsx,.xls" hidden /></label>` : ""}
        <button class="secondary-btn" data-finance-export="${tableType}">Export to Excel</button>
        <button class="secondary-btn" data-finance-print="${tableType}">Export to PDF</button>
      </div>
      <div class="approval-filterbar"><label>Search<input type="search" placeholder="Search records" data-finance-search /></label><label>Filter date<input type="date" data-finance-date /></label><label>Branch<input type="search" placeholder="Branch" data-finance-branch /></label><label>Account / customer<input type="search" placeholder="Account or customer" data-finance-account /></label></div>
      ${type === "outstanding30" ? `<div class="finance-actions"><button class="primary-btn" data-finance-note>Add collection notes</button><button class="secondary-btn" data-finance-promise>Add promise to pay</button><button class="secondary-btn" data-finance-status>Update status</button></div>` : ""}
      ${financeTable(Object.keys(tableRows[0] || { Empty: "" }), tableRows)}
    </section>
  `;
}

function renderFinanceSetup() {
  const setup = JSON.parse(localStorage.getItem(financeStorageKeys.setup) || "{}");
  return `
    <section class="finance-card">
      <h2>Finance Hub Setup</h2>
      <div class="setup-grid">
        <label>Pastel Cloud connection settings<input id="financePastelConnection" value="${escapeHtml(setup.pastel || "")}" placeholder="API endpoint / tenant details" /></label>
        <label>Listener connection settings<input id="financeListenerConnection" value="${escapeHtml(setup.listener || "")}" placeholder="Listener endpoint" /></label>
        <label>Import mapping settings<textarea id="financeImportMapping" rows="3" placeholder="Default column mappings">${escapeHtml(setup.importMapping || "")}</textarea></label>
        <label>Bank balance Excel mapping<textarea id="financeBankMapping" rows="3" placeholder="Bank upload mappings">${escapeHtml(setup.bankMapping || "")}</textarea></label>
        <label>Branch setup<textarea id="financeBranchSetup" rows="3" placeholder="Branches">${escapeHtml(setup.branches || "")}</textarea></label>
        <label>Account categories<textarea id="financeAccountCategories" rows="3" placeholder="Categories">${escapeHtml(setup.categories || "")}</textarea></label>
        <label>Age bucket setup<input id="financeAgeBuckets" value="${escapeHtml(setup.ageBuckets || "Current, 30 Days, 60 Days, 90 Days, 120+ Days")}" /></label>
        <label>User permissions for this hub<textarea rows="3" readonly>${escapeHtml("Managed from main platform member access and hub permissions.")}</textarea></label>
      </div>
      <button class="primary-btn" data-save-finance-setup>Save setup</button>
    </section>
  `;
}

function renderFinanceAudit() {
  const rows = loadAudit().filter((entry) => entry.module === "Finance Balances and Age Analysis");
  return financeTable(["Date and time", "Member name", "Action performed", "Reference", "Details"], rows.map((entry) => ({
    "Date and time": new Date(entry.timestamp).toLocaleString("en-ZA"),
    "Member name": entry.userName || displayNameFromUser(entry.user),
    "Action performed": entry.action,
    Reference: entry.reference || "-",
    Details: entry.notes || entry.detail || "-",
  })));
}

function renderFinanceHub(tab = activeFinanceTab) {
  activeFinanceTab = tab;
  const hub = companyHubBySlug("finance-age-analysis");
  const content = {
    dashboard: renderFinanceDashboard(),
    opening: renderFinanceOpeningBalances(),
    closing: renderFinanceDataTab("closing", "Closing Balances", "Imported closing balance records"),
    monthly: renderFinanceDataTab("monthly", "Monthly Balances", "Monthly balance movement"),
    age: renderFinanceDataTab("age", "Age Analysis", "Debtor and creditor age analysis"),
    outstanding30: renderFinanceDataTab("outstanding30", "30+ Days Outstanding", "Collection workflow for aged balances"),
    bank: renderFinanceDataTab("bank", "Bank Balances", "Excel/CSV bank balance upload"),
    setup: renderFinanceSetup(),
    audit: renderFinanceAudit(),
  }[tab] || renderFinanceDashboard();
  portalHubGrid.innerHTML = `
    <section class="finance-hub-shell">
      <aside class="finance-sidebar">
        <div class="brand"><img class="brand-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" /><div><strong>${escapeHtml(hub.name)}</strong><small>Finance hub</small></div></div>
        <nav>${financeTabs.map((item) => `<button class="nav-item ${item.key === tab ? "active" : ""}" type="button" data-finance-tab="${item.key}">${escapeHtml(item.label)}</button>`).join("")}</nav>
        <div class="finance-user-panel">
          <small>Signed in as</small>
          <strong>${escapeHtml(currentUserName())}</strong>
          <span>${escapeHtml(currentMember().access || "Member")}</span>
          <button class="secondary-btn" type="button" data-finance-logout>Logout</button>
        </div>
      </aside>
      <main class="finance-main">
        <div class="topbar"><div><p class="eyebrow">Interactive Security</p><h1>${escapeHtml(financeTabs.find((item) => item.key === tab)?.label || "Finance Hub")}</h1></div><button class="secondary-btn" type="button" onclick="window.location.href='/'">Back to portal</button></div>
        ${content}
      </main>
    </section>
  `;
  financeAudit("User login/access", hub.name, `Opened ${financeTabs.find((item) => item.key === tab)?.label || tab}`);
}

function costRows(type) {
  return storageList(costStorageKeys[type], []);
}

function saveCostRows(type, rows) {
  saveStorageList(costStorageKeys[type], rows);
}

function costAudit(action, reference = "-", notes = "") {
  writeAudit(action, reference, "Cost Hub", reference, notes || `Action by ${currentUserName()}`);
}

function nextCostNumber(prefix, type) {
  const sequence = JSON.parse(localStorage.getItem(costStorageKeys.sequence) || "{}");
  sequence[type] = Number(sequence[type] || 0) + 1;
  localStorage.setItem(costStorageKeys.sequence, JSON.stringify(sequence));
  return `${prefix}-${new Date().getFullYear()}-${String(sequence[type]).padStart(4, "0")}`;
}

function costSupplierName(id) {
  return costRows("suppliers").find((supplier) => supplier.id === id)?.name || "Unknown supplier";
}

function costBillPayments(billId) {
  return costRows("payments").filter((payment) => payment.billId === billId).reduce((sum, payment) => sum + financeNumber(payment.amount), 0);
}

function costBillStatus(bill) {
  const paid = costBillPayments(bill.id);
  if (paid >= financeNumber(bill.total) && financeNumber(bill.total) > 0) return "Paid";
  if (paid > 0) return "Part paid";
  if (bill.dueDate && bill.dueDate < todayInputValue()) return "Overdue";
  return bill.status || "Awaiting payment";
}

function costStatusClass(status = "") {
  const value = status.toLowerCase();
  if (["paid", "approved", "active", "allocated"].includes(value)) return "status-complete";
  if (["overdue", "rejected", "void", "archived"].includes(value)) return "status-rejected";
  return "status-warning";
}

function costTable(headers, rows) {
  if (!rows.length) return `<p class="empty-state">No records yet.</p>`;
  return `<div class="cost-table-wrap"><table class="cost-table"><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function renderCostDashboardLegacy() {
  const suppliers = costRows("suppliers").filter((supplier) => supplier.status !== "Archived");
  const pendingRequests = costRows("requests").filter((request) => ["Submitted", "Supplier approval required"].includes(request.status));
  const purchaseOrders = costRows("purchaseOrders");
  const bills = costRows("bills");
  const payments = costRows("payments");
  const outstanding = bills.reduce((sum, bill) => sum + Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)), 0);
  const overdue = bills.filter((bill) => costBillStatus(bill) === "Overdue");
  const month = todayInputValue().slice(0, 7);
  const monthlySpend = payments.filter((payment) => String(payment.date || "").startsWith(month)).reduce((sum, payment) => sum + financeNumber(payment.amount), 0);
  const supplierTotals = suppliers.map((supplier) => ({
    label: supplier.name,
    value: bills.filter((bill) => bill.supplierId === supplier.id).reduce((sum, bill) => sum + financeNumber(bill.total), 0),
  })).sort((a, b) => b.value - a.value).slice(0, 8);
  return `
    <div class="dashboard-summary-grid">
      ${renderSummaryCard("Purchase requests to process", pendingRequests.length)}
      ${renderSummaryCard("Active suppliers", suppliers.length)}
      ${renderSummaryCard("Open purchase orders", purchaseOrders.filter((po) => !["Completed", "Cancelled"].includes(po.status)).length)}
      ${renderSummaryCard("Bills outstanding", money.format(outstanding))}
      ${renderSummaryCard("Overdue bills", overdue.length)}
      ${renderSummaryCard("Payments this month", money.format(monthlySpend))}
      ${renderSummaryCard("Supplier bills", bills.length)}
    </div>
    <div class="dashboard-chart-grid">
      ${financeSimpleBar("Supplier cost exposure", supplierTotals)}
      <section class="finance-card"><h3>Cost workflow</h3><div class="cost-workflow"><span>Purchase order</span><i>→</i><span>Supplier bill</span><i>→</i><span>Payment</span><i>→</i><span>Completed</span></div><p class="finance-note">Capture supplier commitments before payment, then track bill balances and supporting documents.</p></section>
    </div>
  `;
}

function renderCostEntityOverviewDetail(entityName) {
  const entity = costRows("entities").find((item) => item.name === entityName);
  const bills = costRows("bills").filter((bill) => (bill.branch || "Unassigned") === entityName);
  const orders = costRows("purchaseOrders").filter((po) => (po.branch || "Unassigned") === entityName);
  const payments = costRows("payments").filter((payment) => bills.some((bill) => bill.id === payment.billId));
  const outstandingBills = bills.filter((bill) => Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)) > 0);
  const recurring = outstandingBills.filter((bill) => String(bill.category || "").toLowerCase().includes("recurring"));
  const adHoc = outstandingBills.filter((bill) => !recurring.includes(bill));
  const scheduled = orders.filter((po) => ["Approved", "Issued"].includes(po.status));
  const tabs = [
    { key: "paid", label: "Paid", count: payments.length },
    { key: "adhoc", label: "Ad-hoc Outstanding", count: adHoc.length },
    { key: "recurring", label: "Recurring Outstanding", count: recurring.length },
    { key: "scheduled", label: "Scheduled", count: scheduled.length },
  ];
  const paidRows = payments.map((payment) => { const bill = bills.find((item) => item.id === payment.billId); return `<tr><td>${escapeHtml(formatDate(payment.date))}</td><td>${escapeHtml(bill?.billNumber || "-")}</td><td>${escapeHtml(costSupplierName(bill?.supplierId))}</td><td>${money.format(financeNumber(payment.amount))}</td><td>${escapeHtml(payment.method || "EFT")}</td><td>${escapeHtml(payment.reference || "-")}</td></tr>`; });
  const billRows = (rows) => rows.map((bill) => `<tr><td><strong>${escapeHtml(bill.billNumber)}</strong><small>${escapeHtml(bill.category || "")}</small></td><td>${escapeHtml(costSupplierName(bill.supplierId))}</td><td>${escapeHtml(formatDate(bill.date))}</td><td>${escapeHtml(formatDate(bill.dueDate))}</td><td>${money.format(financeNumber(bill.total))}</td><td>${money.format(Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)))}</td><td><span class="status-badge ${costStatusClass(costBillStatus(bill))}">${escapeHtml(costBillStatus(bill))}</span></td></tr>`);
  const scheduledRows = scheduled.map((po) => `<tr><td><strong>${escapeHtml(po.number)}</strong></td><td>${escapeHtml(costSupplierName(po.supplierId))}</td><td>${escapeHtml(formatDate(po.date))}</td><td>${escapeHtml(formatDate(po.dueDate))}</td><td>${escapeHtml(po.description || "-")}</td><td>${money.format(financeNumber(po.total))}</td><td><span class="status-badge ${costStatusClass(po.status)}">${escapeHtml(po.status)}</span></td></tr>`);
  const content = {
    paid: costTable(["Payment date", "Supplier bill", "Supplier", "Amount paid", "Method", "Reference"], paidRows),
    adhoc: costTable(["Bill", "Supplier", "Invoice date", "Due date", "Total", "Outstanding", "Status"], billRows(adHoc)),
    recurring: costTable(["Bill", "Supplier", "Invoice date", "Due date", "Total", "Outstanding", "Status"], billRows(recurring)),
    scheduled: costTable(["PO", "Supplier", "Order date", "Expected date", "Description", "Total", "Status"], scheduledRows),
  }[costEntityOverviewTab];
  const paidTotal = payments.reduce((sum, payment) => sum + financeNumber(payment.amount), 0);
  const outstandingTotal = outstandingBills.reduce((sum, bill) => sum + Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)), 0);
  const scheduledTotal = scheduled.reduce((sum, po) => sum + financeNumber(po.total), 0);
  return `<div class="cost-entity-detail-page"><div class="panel-heading"><div><p class="eyebrow">Entity cost overview</p><h1>${escapeHtml(entityName)}</h1><p>All costs and payments linked to this entity.</p></div><button class="secondary-btn" type="button" data-cost-entity-overview-back>Back to dashboard</button></div><div class="dashboard-summary-grid">${renderSummaryCard("Current balance", entity ? money.format(financeNumber(entity.currentBalance)) : "Not set")}${renderSummaryCard("Total paid", money.format(paidTotal))}${renderSummaryCard("Total outstanding", money.format(outstandingTotal))}${renderSummaryCard("Total scheduled", money.format(scheduledTotal))}</div><nav class="cost-entity-detail-tabs">${tabs.map((tab) => `<button type="button" class="${tab.key === costEntityOverviewTab ? "active" : ""}" data-cost-entity-detail-tab="${tab.key}">${escapeHtml(tab.label)} <span>${tab.count}</span></button>`).join("")}</nav><section class="finance-card"><div class="panel-heading"><div><h2>${escapeHtml(tabs.find((tab) => tab.key === costEntityOverviewTab)?.label || "Entity costs")}</h2></div></div>${content}</section></div>`;
}

function renderCostDashboard() {
  if (costSelectedEntityOverview) return renderCostEntityOverviewDetail(costSelectedEntityOverview);
  const month = costDashboardFilters.month || todayInputValue().slice(0, 7);
  const suppliers = costRows("suppliers").filter((supplier) => supplier.status !== "Archived");
  const allOrders = costRows("purchaseOrders");
  const allBills = costRows("bills");
  const allPayments = costRows("payments");
  const matchesFilters = (row) => (!costDashboardFilters.supplierId || row.supplierId === costDashboardFilters.supplierId) && (!costDashboardFilters.branch || (row.branch || "Unassigned") === costDashboardFilters.branch);
  const bills = allBills.filter(matchesFilters);
  const orders = allOrders.filter(matchesFilters);
  const monthBills = bills.filter((bill) => String(bill.date || bill.dueDate || "").startsWith(month));
  const monthOrders = orders.filter((po) => String(po.dueDate || po.date || "").startsWith(month));
  const outstanding = monthBills.reduce((sum, bill) => sum + Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)), 0);
  const scheduled = monthOrders.filter((po) => ["Approved", "Issued"].includes(po.status)).reduce((sum, po) => sum + financeNumber(po.total), 0);
  const overdue = monthBills.filter((bill) => costBillStatus(bill) === "Overdue");
  const entities = costRows("entities").filter((entity) => entity.status !== "Archived");
  const branchNames = Array.from(new Set([...entities.map((entity) => entity.name), ...allBills.map((row) => row.branch || "Unassigned"), ...allOrders.map((row) => row.branch || "Unassigned")])).sort();
  const supplierOptions = `<option value="">All suppliers</option>${suppliers.map((supplier) => `<option value="${escapeHtml(supplier.id)}" ${costDashboardFilters.supplierId === supplier.id ? "selected" : ""}>${escapeHtml(supplier.name)}</option>`).join("")}`;
  const branchOptions = `<option value="">All entities / branches</option>${branchNames.map((branch) => `<option value="${escapeHtml(branch)}" ${costDashboardFilters.branch === branch ? "selected" : ""}>${escapeHtml(branch)}</option>`).join("")}`;
  const [year, monthNumber] = month.split("-").map(Number);
  const monthLabel = new Date(year, monthNumber - 1, 1).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
  const trend = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(year, monthNumber - 12 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const value = bills.filter((bill) => String(bill.date || "").startsWith(key)).reduce((sum, bill) => sum + financeNumber(bill.total), 0);
    return { label: date.toLocaleDateString("en-ZA", { month: "short" }), value };
  });
  const trendMax = Math.max(...trend.map((item) => item.value), 1);
  const entityCards = (costDashboardFilters.branch ? [costDashboardFilters.branch] : branchNames).map((branch) => {
    const entity = entities.find((item) => item.name === branch);
    const entityBills = monthBills.filter((bill) => (bill.branch || "Unassigned") === branch);
    const entityOrders = monthOrders.filter((po) => (po.branch || "Unassigned") === branch);
    const recurringBills = entityBills.filter((bill) => String(bill.category || "").toLowerCase().includes("recurring"));
    const recurringOutstanding = recurringBills.reduce((sum, bill) => sum + Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)), 0);
    const adHocOutstanding = entityBills.filter((bill) => !recurringBills.includes(bill)).reduce((sum, bill) => sum + Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id)), 0);
    const entityOutstanding = adHocOutstanding + recurringOutstanding;
    const entityScheduled = entityOrders.filter((po) => ["Approved", "Issued"].includes(po.status)).reduce((sum, po) => sum + financeNumber(po.total), 0);
    const entityPaid = allPayments.filter((payment) => String(payment.date || "").startsWith(month) && entityBills.some((bill) => bill.id === payment.billId)).reduce((sum, payment) => sum + financeNumber(payment.amount), 0);
    const safetyBuffer = financeNumber(entity?.safetyBuffer);
    const availableFunds = financeNumber(entity?.currentBalance) - entityScheduled - safetyBuffer;
    const overBudget = Boolean(entity) && availableFunds < 0;
    return `<article class="cost-entity-card ${overBudget ? "over-budget" : "within-budget"}"><div class="cost-entity-card-head"><h3>${escapeHtml(branch)}</h3><span class="cost-budget-pill ${overBudget ? "over" : "within"}">${overBudget ? "ⓘ Over Budget" : "✓ Within Budget"}</span></div><div class="cost-entity-metrics"><div><span>Current Balance</span><strong>${entity ? money.format(financeNumber(entity.currentBalance)) : "Not set"}</strong>${entity ? `<button type="button" data-cost-dashboard-edit-entity="${escapeHtml(entity.id)}" aria-label="Edit entity balance">✎</button>` : ""}</div><div><span>◉&nbsp; Paid This Month</span><strong class="metric-paid">${money.format(entityPaid)}</strong></div><div><span>ϟ&nbsp; Ad-hoc Outstanding</span><strong>${money.format(adHocOutstanding)}</strong></div><div><span>▣&nbsp; Recurring Outstanding</span><strong>${money.format(recurringOutstanding)}</strong></div><div><span>⌁&nbsp; Scheduled</span><strong>${money.format(entityScheduled)}</strong></div></div><div class="cost-entity-buffer"><span>Safety Buffer</span><strong>${money.format(safetyBuffer)}</strong></div><div class="cost-entity-available"><span>▣&nbsp; Available</span><strong class="${overBudget ? "negative" : "positive"}">${entity ? money.format(availableFunds) : "Not set"}</strong></div></article>`;
  }).join("");
  return `<div class="cost-dashboard-reference"><div class="cost-dashboard-original-summary">${renderCostDashboardLegacy()}</div><div><h1>Dashboard</h1><p>Cost tracking and financial overview</p></div>
    <section class="cost-dashboard-filters"><button class="secondary-btn" type="button" data-cost-dashboard-month="prev" aria-label="Previous month">‹</button><label>Month<input type="month" data-cost-dashboard-filter="month" value="${escapeHtml(month)}" /></label><button class="secondary-btn" type="button" data-cost-dashboard-month="next" aria-label="Next month">›</button><label>Entity<select data-cost-dashboard-filter="branch">${branchOptions}</select></label><label>Supplier<select data-cost-dashboard-filter="supplierId">${supplierOptions}</select></label></section>
    <div class="cost-dashboard-stat-grid"><button type="button" class="cost-dashboard-stat stat-outstanding" data-cost-tab="bills"><span>◷</span><small>Total Outstanding</small><strong>${money.format(outstanding)}</strong><em>Click to view all</em></button><button type="button" class="cost-dashboard-stat stat-scheduled" data-cost-tab="purchaseOrders"><span>▣</span><small>Total Scheduled</small><strong>${money.format(scheduled)}</strong><em>Click to view all</em></button><button type="button" class="cost-dashboard-stat stat-overdue" data-cost-tab="bills"><span>!</span><small>Overdue Items</small><strong>${overdue.length}</strong><em>${overdue.length ? "Requires attention" : "No overdue items"}</em></button></div>
    <section class="finance-card cost-trend-card"><div class="panel-heading"><div><p class="eyebrow">12 month view</p><h2>Cost Trends - ${escapeHtml(monthLabel)}</h2></div></div><div class="cost-trend-chart">${trend.map((item) => `<div class="cost-trend-column" title="${escapeHtml(item.label)}: ${money.format(item.value)}"><strong>${item.value ? money.format(item.value).replace("R", "") : ""}</strong><i style="height:${Math.max(3, item.value / trendMax * 100)}%"></i><span>${escapeHtml(item.label)}</span></div>`).join("")}</div></section>
    <section><div class="panel-heading"><div><h2>Entity Overview</h2><p>Monthly commitments and payments by branch.</p></div></div><div class="cost-entity-grid">${entityCards || '<div class="finance-card empty-state">No entity or branch activity found for this month.</div>'}</div></section></div>`;
}

const costPaymentTerms = [
  "Due on receipt",
  "Prepaid",
  "Cash on delivery (COD)",
  "7 days",
  "14 days",
  "15 days",
  "21 days",
  "30 days",
  "45 days",
  "60 days",
  "90 days",
  "120 days",
  "End of current month",
  "7 days after month end",
  "15 days after month end",
  "30 days after month end",
  "60 days after month end",
];

function costPaymentTermOptions(selected = "30 days") {
  return costPaymentTerms.map((term) => `<option value="${escapeHtml(term)}" ${term === selected ? "selected" : ""}>${escapeHtml(term)}</option>`).join("");
}

function costRequestSupplierFields(request = {}) {
  return [
    ["Registration", request.registrationNumber], ["VAT", request.vatNumber], ["Email", request.email],
    ["Phone", request.phone], ["Category", request.category], ["Address", request.address], ["Bank", request.bankName],
    ["Account", request.accountNumber], ["Branch", request.branchCode], ["Terms", request.paymentTerms],
  ].filter(([, value]) => value).map(([label, value]) => `<small><strong>${label}:</strong> ${escapeHtml(value)}</small>`).join("");
}

function costRequestItems(request = {}) {
  if (Array.isArray(request.items) && request.items.length) return request.items;
  return [{ description: request.description || "", quantity: financeNumber(request.quantity || 1), unitCost: financeNumber(request.unitCost) }];
}

function costRequestItemRow(item = {}, removable = true) {
  return `<div class="cost-request-line" data-cost-request-line>
    <label>Item / service description<input name="lineDescription" value="${escapeHtml(item.description || "")}" required /></label>
    <label>Quantity<input name="lineQuantity" type="number" min="0.01" step="0.01" value="${escapeHtml(String(item.quantity || 1))}" required /></label>
    <label>Unit cost excl. VAT<input name="lineUnitCost" type="number" min="0" step="0.01" value="${escapeHtml(String(item.unitCost || ""))}" required /></label>
    <strong data-cost-line-total>${money.format(financeNumber(item.quantity || 1) * financeNumber(item.unitCost))}</strong>
    <button class="danger-btn small-btn" type="button" data-cost-remove-request-line ${removable ? "" : "hidden"}>Remove</button>
  </div>`;
}

function updateCostRequestTotals(form) {
  let total = 0;
  form.querySelectorAll("[data-cost-request-line]").forEach((row) => {
    const lineTotal = financeNumber(row.querySelector('[name="lineQuantity"]')?.value) * financeNumber(row.querySelector('[name="lineUnitCost"]')?.value);
    total += lineTotal;
    const output = row.querySelector("[data-cost-line-total]");
    if (output) output.textContent = money.format(lineTotal);
  });
  const totalOutput = form.querySelector("[data-cost-request-total]");
  if (totalOutput) totalOutput.textContent = money.format(total);
  const rows = form.querySelectorAll("[data-cost-request-line]");
  rows.forEach((row) => { const button = row.querySelector("[data-cost-remove-request-line]"); if (button) button.hidden = rows.length === 1; });
}

function renderCostRequestsLegacy() {
  const requests = costRows("requests");
  const suppliers = costRows("suppliers").filter((supplier) => supplier.status !== "Archived");
  const rows = requests.map((request) => {
    const supplier = suppliers.find((item) => item.id === request.supplierId);
    const files = (request.documents || []).map((file) => `<button class="secondary-btn small-btn" type="button" data-cost-request-document="${escapeHtml(request.id)}" data-file-id="${escapeHtml(file.id)}">${escapeHtml(file.file_name)}</button>`).join(" ");
    const actions = isGovernanceAdmin() && (request.status === "Submitted" || request.status === "Supplier approval required")
      ? `<button class="primary-btn small-btn" type="button" data-cost-request-po="${escapeHtml(request.id)}">${supplier ? "Process PO" : "Approve supplier + process PO"}</button>`
      : "";
    const items = costRequestItems(request);
    const itemTotal = items.reduce((sum, item) => sum + financeNumber(item.quantity) * financeNumber(item.unitCost), 0);
    const itemSummary = items.map((item) => `<div><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(String(item.quantity))} × ${money.format(financeNumber(item.unitCost))}</small></div>`).join("");
    return `<tr><td><strong>${escapeHtml(request.number)}</strong><small>${escapeHtml(new Date(request.createdAt).toLocaleString("en-ZA"))}</small></td><td><strong>${escapeHtml(supplier?.name || request.supplierName)}</strong>${costRequestSupplierFields(request)}</td><td>${itemSummary}<small>${escapeHtml(request.project || "")}</small></td><td><strong>${money.format(itemTotal)}</strong><small>${items.length} line item${items.length === 1 ? "" : "s"}</small></td><td>${files || "-"}</td><td><span class="status-badge ${costStatusClass(request.status)}">${escapeHtml(request.status)}</span></td><td>${actions}</td></tr>`;
  });
  const supplierData = suppliers.map((supplier) => `<option value="${escapeHtml(supplier.name)}"></option>`).join("");
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Staff purchasing inbox</p><h2>Purchase Requests</h2><p>Submit a request and supporting documents. Existing supplier details fill automatically; new suppliers are sent for approval.</p></div></div>
    <form class="cost-form-grid" data-cost-form="request">
      <label>Supplier name<input name="supplierName" list="costSupplierNames" data-cost-request-supplier required autocomplete="off" /></label><datalist id="costSupplierNames">${supplierData}</datalist>
      <input type="hidden" name="supplierId" />
      <label>Registration number<input name="registrationNumber" data-cost-supplier-detail /></label><label>VAT number<input name="vatNumber" data-cost-supplier-detail /></label>
      <label>Email<input name="email" type="email" data-cost-supplier-detail /></label><label>Phone<input name="phone" data-cost-supplier-detail /></label><label>Category<input name="category" data-cost-supplier-detail placeholder="Stock, services, subcontractor" /></label><label>Address<input name="address" data-cost-supplier-detail /></label>
      <label>Bank name<input name="bankName" data-cost-supplier-detail /></label><label>Account number<input name="accountNumber" data-cost-supplier-detail /></label><label>Branch code<input name="branchCode" data-cost-supplier-detail /></label>
      <label>Payment terms<select name="paymentTerms" data-cost-supplier-detail>${costPaymentTermOptions("30 days")}</select></label>
      <label>Project / job<input name="project" /></label><label>Entity / branch<input name="branch" list="costEntityNames" required /></label><label>Required by<input name="requiredBy" type="date" /></label>
      <div class="cost-form-wide cost-request-lines"><div class="panel-heading"><div><h3>Supplier quotation line items</h3><p>Add each quoted item separately.</p></div><button class="secondary-btn" type="button" data-cost-add-request-line>Add line item</button></div><div data-cost-request-lines>${costRequestItemRow({}, false)}</div><div class="cost-request-grand-total"><span>Estimated total excl. VAT</span><strong data-cost-request-total>${money.format(0)}</strong></div></div>
      <label class="cost-form-wide">Request documents<input name="files" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" /></label>
      <label class="cost-form-wide">Notes<textarea name="notes" rows="2"></textarea></label><button class="primary-btn" type="submit">Submit purchase request</button>
    </form>${costTable(["Request", "Supplier details", "Requirement", "Estimate", "Documents", "Status", "Action"], rows)}</section>`;
}

function costRequestRowMatchesFilters(request, supplierName) {
  const submittedDate = String(request.createdAt || "").slice(0, 10);
  return (!costRequestFilters.status || request.status === costRequestFilters.status)
    && (!costRequestFilters.requester || String(request.createdBy || "").toLowerCase().includes(costRequestFilters.requester.toLowerCase()))
    && (!costRequestFilters.supplier || supplierName.toLowerCase().includes(costRequestFilters.supplier.toLowerCase()))
    && (!costRequestFilters.date || submittedDate === costRequestFilters.date)
    && (!costRequestFilters.entity || String(request.branch || "").toLowerCase().includes(costRequestFilters.entity.toLowerCase()));
}

function applyCostRequestFilters() {
  portalHubGrid.querySelectorAll("[data-cost-request-register-row]").forEach((row) => {
    const matches = (!costRequestFilters.status || row.dataset.status === costRequestFilters.status)
      && (!costRequestFilters.requester || String(row.dataset.requester || "").includes(costRequestFilters.requester.toLowerCase()))
      && (!costRequestFilters.supplier || String(row.dataset.supplier || "").includes(costRequestFilters.supplier.toLowerCase()))
      && (!costRequestFilters.date || row.dataset.date === costRequestFilters.date)
      && (!costRequestFilters.entity || String(row.dataset.entity || "").includes(costRequestFilters.entity.toLowerCase()));
    row.hidden = !matches;
  });
}

function renderCostRequests() {
  const requests = costRows("requests");
  const suppliers = costRows("suppliers").filter((supplier) => supplier.status !== "Archived");
  const supplierData = suppliers.map((supplier) => `<option value="${escapeHtml(supplier.name)}"></option>`).join("");
  const statuses = Array.from(new Set(requests.map((request) => request.status).filter(Boolean))).sort();
  const rows = requests.map((request) => {
    const supplier = suppliers.find((item) => item.id === request.supplierId);
    const supplierName = supplier?.name || request.supplierName || "Unknown supplier";
    const files = request.documents || [];
    const items = costRequestItems(request);
    const itemTotal = items.reduce((sum, item) => sum + financeNumber(item.quantity) * financeNumber(item.unitCost), 0);
    const itemSummary = items.map((item) => `<div><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(String(item.quantity))} × ${money.format(financeNumber(item.unitCost))}</small></div>`).join("");
    const actions = isGovernanceAdmin() && ["Submitted", "Supplier approval required"].includes(request.status) ? `<button class="primary-btn small-btn" type="button" data-cost-request-po="${escapeHtml(request.id)}">${supplier ? "Process PO" : "Approve supplier + process PO"}</button>` : "-";
    const visible = costRequestRowMatchesFilters(request, supplierName);
    return `<tr data-cost-request-register-row data-status="${escapeHtml(request.status || "")}" data-requester="${escapeHtml(String(request.createdBy || "").toLowerCase())}" data-supplier="${escapeHtml(supplierName.toLowerCase())}" data-date="${escapeHtml(String(request.createdAt || "").slice(0, 10))}" data-entity="${escapeHtml(String(request.branch || "").toLowerCase())}" ${visible ? "" : "hidden"}><td><strong>${escapeHtml(request.number)}</strong></td><td>${escapeHtml(formatDate(request.createdAt))}</td><td><strong>${escapeHtml(request.createdBy || "-")}</strong><small>${escapeHtml(request.createdByEmail || "")}</small></td><td><strong>${escapeHtml(supplierName)}</strong><small>${escapeHtml(request.email || supplier?.email || "")}</small></td><td>${escapeHtml(request.branch || "-")}<small>${escapeHtml(request.project || "")}</small></td><td>${itemSummary}</td><td><strong>${money.format(itemTotal)}</strong><small>${items.length} line item${items.length === 1 ? "" : "s"}</small></td><td><span class="status-badge ${costStatusClass(request.status)}">${escapeHtml(request.status)}</span></td><td><button class="secondary-btn small-btn" type="button" ${files.length ? `data-cost-request-document="${escapeHtml(request.id)}" data-file-id="${escapeHtml(files[0].id)}"` : "disabled"}>Docs (${files.length})</button></td><td>${actions}</td></tr>`;
  });
  return `<div class="cost-request-page"><div class="cost-request-page-heading"><h2>Purchase Order Requests</h2><p>Submit supplier quotations and supporting information for purchase order processing.</p></div><section class="finance-card cost-request-new-panel"><div class="panel-heading"><div><h3>New request</h3></div></div><form class="cost-form-grid cost-request-entry-form" data-cost-form="request">
    <label>Supplier name<input name="supplierName" list="costSupplierNames" data-cost-request-supplier required autocomplete="off" /></label><datalist id="costSupplierNames">${supplierData}</datalist><input type="hidden" name="supplierId" />
    <label>Registration number<input name="registrationNumber" data-cost-supplier-detail /></label><label>VAT number<input name="vatNumber" data-cost-supplier-detail /></label><label>Email<input name="email" type="email" data-cost-supplier-detail /></label><label>Phone<input name="phone" data-cost-supplier-detail /></label><label>Category<input name="category" data-cost-supplier-detail placeholder="Stock, services, subcontractor" /></label><label>Address<input name="address" data-cost-supplier-detail /></label><label>Bank name<input name="bankName" data-cost-supplier-detail /></label><label>Account number<input name="accountNumber" data-cost-supplier-detail /></label><label>Branch code<input name="branchCode" data-cost-supplier-detail /></label><label>Payment terms<select name="paymentTerms" data-cost-supplier-detail>${costPaymentTermOptions("30 days")}</select></label><label>Project / job<input name="project" /></label><label>Entity / branch<input name="branch" list="costEntityNames" required /></label><label>Required by<input name="requiredBy" type="date" /></label>
    <div class="cost-form-wide cost-request-lines"><div class="panel-heading"><div><h3>Supplier quotation line items</h3><p>Add every quoted item separately.</p></div><button class="secondary-btn" type="button" data-cost-add-request-line>Add line item</button></div><div data-cost-request-lines>${costRequestItemRow({}, false)}</div><div class="cost-request-grand-total"><span>Estimated total excl. VAT</span><strong data-cost-request-total>${money.format(0)}</strong></div></div>
    <label class="cost-form-wide">Request documents<input name="files" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" /></label><label class="cost-form-wide">Notes<textarea name="notes" rows="3"></textarea></label><button class="primary-btn cost-request-submit" type="submit">Submit purchase request</button></form></section>
    <section class="finance-card cost-request-register"><div class="panel-heading"><div><h3>Requests</h3></div></div><div class="cost-request-filter-bar"><label>Status<select data-cost-request-filter="status"><option value="">All statuses</option>${statuses.map((status) => `<option value="${escapeHtml(status)}" ${costRequestFilters.status === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></label><label>Requester<input data-cost-request-filter="requester" value="${escapeHtml(costRequestFilters.requester)}" placeholder="Search requester" /></label><label>Supplier<input data-cost-request-filter="supplier" value="${escapeHtml(costRequestFilters.supplier)}" placeholder="Search supplier" /></label><label>Date submitted<input type="date" data-cost-request-filter="date" value="${escapeHtml(costRequestFilters.date)}" /></label><label>Entity / branch<input data-cost-request-filter="entity" value="${escapeHtml(costRequestFilters.entity)}" placeholder="Search entity" /></label><button class="secondary-btn" type="button" data-cost-clear-request-filters>Clear filters</button></div>${costTable(["Request number", "Date submitted", "Requested by", "Supplier", "Entity / project", "Line items", "Estimate", "Status", "Documents", "Action"], rows)}</section></div>`;
}

function renderCostEntities() {
  const entities = costRows("entities");
  const editing = entities.find((entity) => entity.id === costEditingEntityId);
  const value = (name, fallback = "") => escapeHtml(String(editing?.[name] ?? fallback));
  const rows = entities.map((entity) => `<tr><td><strong>${escapeHtml(entity.name)}</strong><small>${escapeHtml(entity.physicalAddress || "")}</small></td><td>${escapeHtml(entity.vatNumber || "-")}</td><td>${money.format(financeNumber(entity.currentBalance))}</td><td>${money.format(financeNumber(entity.safetyBuffer))}</td><td>${escapeHtml(entity.bankAccount || "-")}<small>${entity.branchCode ? `Branch: ${escapeHtml(entity.branchCode)}` : ""}</small></td><td><span class="status-badge ${costStatusClass(entity.status || "Active")}">${escapeHtml(entity.status || "Active")}</span></td><td class="row-actions"><button class="secondary-btn small-btn" type="button" data-cost-edit-entity="${escapeHtml(entity.id)}">Edit</button><button class="secondary-btn small-btn" type="button" data-cost-archive-entity="${escapeHtml(entity.id)}">${entity.status === "Archived" ? "Restore" : "Archive"}</button></td></tr>`);
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Entity master data</p><h2>${editing ? `Edit ${escapeHtml(editing.name)}` : "Entities"}</h2><p>Manage the companies, divisions, or branches used in Cost Hub reporting.</p></div><div class="row-actions"><button class="secondary-btn" type="button" data-cost-download-entity-template>Download balance template</button><label class="primary-btn finance-upload">Upload balances<input type="file" data-cost-entity-balance-upload accept=".xlsx,.csv" hidden /></label></div></div>${costEntityBalanceImportNotice ? `<div class="import-summary">${escapeHtml(costEntityBalanceImportNotice)}</div>` : ""}<p class="finance-note">Upload an Excel or CSV file with columns named <strong>Entity</strong> and <strong>Current Balance</strong>. Matching entities update automatically.</p>
    <form class="cost-form-grid" data-cost-form="entity"><label>Entity name<input name="name" value="${value("name")}" required /></label><label>VAT number<input name="vatNumber" value="${value("vatNumber")}" /></label><label>Bank account number<input name="bankAccount" value="${value("bankAccount")}" /></label><label>Bank branch code<input name="branchCode" value="${value("branchCode")}" /></label><label>Current balance<input name="currentBalance" type="number" step="0.01" value="${value("currentBalance", 0)}" /></label><label>Safety buffer<input name="safetyBuffer" type="number" min="0" step="0.01" value="${value("safetyBuffer", 0)}" /></label><label class="cost-form-wide">Physical address<textarea name="physicalAddress" rows="2">${value("physicalAddress")}</textarea></label><button class="primary-btn" type="submit">${editing ? "Save entity changes" : "Add entity"}</button>${editing ? '<button class="secondary-btn" type="button" data-cost-cancel-entity-edit>Cancel edit</button>' : ""}</form>
    ${costTable(["Entity", "VAT number", "Current balance", "Safety buffer", "Banking details", "Status", "Actions"], rows)}</section>`;
}

function applyCostEntityBalanceRows(rows, fileName) {
  const entities = costRows("entities");
  let updatedCount = 0;
  const unmatched = [];
  const now = new Date().toISOString();
  const updates = new Map();
  rows.forEach((row) => {
    const name = String(row.entityName || "").trim();
    if (!name) return;
    const entity = entities.find((item) => item.name.trim().toLowerCase() === name.toLowerCase());
    if (!entity) { unmatched.push(name); return; }
    updates.set(entity.id, financeNumber(row.balance));
  });
  const nextEntities = entities.map((entity) => {
    if (!updates.has(entity.id)) return entity;
    updatedCount += 1;
    return { ...entity, currentBalance: updates.get(entity.id), balanceImportedAt: now, balanceImportedBy: currentUserName(), balanceImportFile: fileName };
  });
  saveCostRows("entities", nextEntities);
  costEntityBalanceImportNotice = `${updatedCount} ${updatedCount === 1 ? "entity balance" : "entity balances"} updated${unmatched.length ? `; ${unmatched.length} unmatched: ${unmatched.slice(0, 4).join(", ")}${unmatched.length > 4 ? "…" : ""}` : ""}.`;
  costAudit("Imported entity balances", fileName, costEntityBalanceImportNotice);
  renderCostHub("entities");
}

async function importCostEntityBalances(file) {
  if (!file) return;
  try {
    let rows = [];
    if (file.name.toLowerCase().endsWith(".csv")) {
      const parsed = parseCsv(await file.text());
      const headers = (parsed[0] || []).map((header) => String(header || "").trim().toLowerCase());
      const entityIndex = headers.findIndex((header) => ["entity", "entity name", "company", "branch", "name"].some((label) => header === label || header.includes(label)));
      const balanceIndex = headers.findIndex((header) => ["current balance", "available balance", "balance", "available"].some((label) => header === label || header.includes(label)));
      if (entityIndex < 0 || balanceIndex < 0) throw new Error("The file needs Entity and Current Balance columns.");
      rows = parsed.slice(1).map((row) => ({ entityName: row[entityIndex], balance: row[balanceIndex] }));
    } else {
      const response = await fetch(`/api/cost/import-entity-balances?fileName=${encodeURIComponent(file.name)}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/octet-stream" }, body: await file.arrayBuffer() });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The Excel file could not be imported.");
      rows = data.rows || [];
    }
    applyCostEntityBalanceRows(rows, file.name);
  } catch (error) {
    costEntityBalanceImportNotice = error.message || "The balance file could not be imported.";
    renderCostHub("entities");
  }
}

function renderCostSuppliers() {
  const suppliers = costRows("suppliers");
  const editing = suppliers.find((supplier) => supplier.id === costEditingSupplierId);
  const value = (name, fallback = "") => escapeHtml(editing?.[name] || fallback);
  const rows = suppliers.map((supplier) => `<tr><td><strong>${escapeHtml(supplier.name)}</strong><small>${escapeHtml(supplier.registrationNumber || "")}</small></td><td>${escapeHtml(supplier.email || "-")}<br>${escapeHtml(supplier.phone || "-")}</td><td>${escapeHtml(supplier.bankName || "-")}<small>${escapeHtml(supplier.accountNumber || "")} ${supplier.branchCode ? `· ${escapeHtml(supplier.branchCode)}` : ""}</small></td><td>${escapeHtml(supplier.category || "General")}</td><td>${escapeHtml(supplier.paymentTerms || "30 days")}</td><td><span class="status-badge ${costStatusClass(supplier.status || "Active")}">${escapeHtml(supplier.status || "Active")}</span></td><td class="row-actions"><button class="secondary-btn small-btn" type="button" data-cost-edit-supplier="${escapeHtml(supplier.id)}">Edit</button><button class="secondary-btn small-btn" type="button" data-cost-archive-supplier="${escapeHtml(supplier.id)}">${supplier.status === "Archived" ? "Restore" : "Archive"}</button></td></tr>`);
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Supplier master data</p><h2>${editing ? `Edit ${escapeHtml(editing.name)}` : "Suppliers"}</h2></div></div>
    <form class="cost-form-grid" data-cost-form="supplier">
      <label>Supplier name<input name="name" value="${value("name")}" required /></label><label>Registration number<input name="registrationNumber" value="${value("registrationNumber")}" /></label><label>VAT number<input name="vatNumber" value="${value("vatNumber")}" /></label>
      <label>Email<input name="email" type="email" value="${value("email")}" /></label><label>Phone<input name="phone" value="${value("phone")}" /></label><label>Category<input name="category" value="${value("category")}" placeholder="Stock, services, subcontractor" /></label>
      <label>Payment terms<select name="paymentTerms">${costPaymentTermOptions(editing?.paymentTerms || "30 days")}</select></label><label>Bank name<input name="bankName" value="${value("bankName")}" /></label><label>Account number<input name="accountNumber" value="${value("accountNumber")}" /></label><label>Branch code<input name="branchCode" value="${value("branchCode")}" /></label><label>Address<input name="address" value="${value("address")}" /></label>
      <label class="cost-form-wide">Notes<textarea name="notes" rows="2">${value("notes")}</textarea></label><button class="primary-btn" type="submit">${editing ? "Save supplier changes" : "Add supplier"}</button>${editing ? '<button class="secondary-btn" type="button" data-cost-cancel-supplier-edit>Cancel edit</button>' : ""}
    </form>
    ${costTable(["Supplier", "Contact", "Banking", "Category", "Terms", "Status", "Actions"], rows)}
  </section>`;
}

function costSupplierOptions(selected = "") {
  return `<option value="">Select supplier</option>${costRows("suppliers").filter((supplier) => supplier.status !== "Archived").map((supplier) => `<option value="${escapeHtml(supplier.id)}" ${selected === supplier.id ? "selected" : ""}>${escapeHtml(supplier.name)}</option>`).join("")}`;
}

function costEntityDatalist() {
  return costRows("entities").filter((entity) => entity.status !== "Archived").map((entity) => `<option value="${escapeHtml(entity.name)}"></option>`).join("");
}

function renderCostPurchaseOrders() {
  const rows = costRows("purchaseOrders").map((po) => { const awaitingDecision = ["Pending approval", "Draft", "Rejected"].includes(po.status); return `<tr><td><strong>${escapeHtml(po.number)}</strong></td><td>${escapeHtml(costSupplierName(po.supplierId))}</td><td>${escapeHtml(formatDate(po.date))}</td><td>${escapeHtml(po.project || "-")}</td><td>${money.format(financeNumber(po.total))}</td><td><span class="status-badge ${costStatusClass(po.status)}">${escapeHtml(po.status === "Draft" ? "Pending approval" : po.status)}</span></td><td><button class="secondary-btn small-btn" ${awaitingDecision ? `data-cost-open-approval="${escapeHtml(po.id)}"` : `data-cost-po-status="${escapeHtml(po.id)}"`}>${awaitingDecision ? "View approval" : "Update status"}</button></td></tr>`; });
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Purchasing</p><h2>Purchase Orders</h2></div></div>
    <form class="cost-form-grid" data-cost-form="purchaseOrder"><label>Supplier<select name="supplierId" required>${costSupplierOptions()}</select></label><label>Order date<input type="date" name="date" value="${todayInputValue()}" required /></label><label>Expected date<input type="date" name="dueDate" /></label><label>Project / job<input name="project" /></label><label>Branch<input name="branch" /></label><label>Item description<input name="description" required /></label><label>Quantity<input type="number" min="0.01" step="0.01" name="quantity" value="1" required /></label><label>Unit cost excl. VAT<input type="number" min="0" step="0.01" name="unitCost" required /></label><label>VAT %<input type="number" min="0" step="0.01" name="taxRate" value="15" /></label><label class="cost-form-wide">Notes<textarea name="notes" rows="2"></textarea></label><button class="primary-btn" type="submit">Create purchase order</button></form>
    ${costTable(["PO number", "Supplier", "Date", "Project", "Total incl. VAT", "Status", "Actions"], rows)}
  </section>`;
}

function costPoRequesterIsCurrentUser(po) {
  return normalizeEmail(po.requestedByEmail || "") === normalizeEmail(currentUser()) || po.requestedBy === currentUserName() || po.createdBy === currentUserName();
}

function costPoApprovalLabel(status = "") {
  if (status === "Approved") return "Accepted";
  if (status === "Draft" || status === "Pending approval") return "Pending acceptance";
  return status || "Pending acceptance";
}

function renderCostPoApprovalDetail(po) {
  if (!po) return "";
  const items = costRequestItems(po);
  const itemRows = items.map((item) => `<tr><td>${escapeHtml(item.description)}</td><td>${escapeHtml(String(item.quantity))}</td><td>${money.format(financeNumber(item.unitCost))}</td><td>${money.format(financeNumber(item.quantity) * financeNumber(item.unitCost))}</td></tr>`);
  const canDecide = isGovernanceAdmin() && ["Pending approval", "Draft"].includes(po.status);
  const canEditRejected = po.status === "Rejected" && costPoRequesterIsCurrentUser(po);
  return `<section class="finance-card cost-approval-detail"><div class="panel-heading"><div><p class="eyebrow">Purchase order review</p><h2>${escapeHtml(po.number)}</h2><p>${escapeHtml(costSupplierName(po.supplierId))} · Requested by ${escapeHtml(po.requestedBy || po.createdBy || "-")}</p></div><button class="secondary-btn" type="button" data-cost-close-approval>Close</button></div>
    <div class="dashboard-summary-grid"><section class="summary-card"><span>Status</span><strong><mark class="status-badge ${costStatusClass(po.status)}">${escapeHtml(costPoApprovalLabel(po.status))}</mark></strong></section>${renderSummaryCard("Project", po.project || "-")}${renderSummaryCard("Total incl. VAT", money.format(financeNumber(po.total)))}</div>
    ${po.rejectionReason ? `<div class="approval-rejection-reason"><strong>Rejection reason</strong><p>${escapeHtml(po.rejectionReason)}</p></div>` : ""}
    ${costTable(["Description", "Quantity", "Unit cost excl. VAT", "Line total"], itemRows)}
    <p><strong>Required / expected date:</strong> ${escapeHtml(formatDate(po.dueDate) || "-")}<br><strong>Notes:</strong> ${escapeHtml(po.notes || "-")}</p>
    ${canDecide ? `<div class="row-actions"><button class="primary-btn" type="button" data-cost-approve-po="${escapeHtml(po.id)}">Accept PO</button><button class="danger-btn" type="button" data-cost-reject-po="${escapeHtml(po.id)}">Reject PO</button></div>` : ""}
    ${canEditRejected ? `<form class="cost-form-grid" data-cost-form="rejectedPo" data-po-id="${escapeHtml(po.id)}"><h3 class="cost-form-wide">Edit and resubmit rejected PO</h3><label>Supplier<select name="supplierId" required>${costSupplierOptions(po.supplierId)}</select></label><label>Expected date<input type="date" name="dueDate" value="${escapeHtml(po.dueDate || "")}" /></label><label>Project / job<input name="project" value="${escapeHtml(po.project || "")}" /></label><div class="cost-form-wide cost-request-lines"><div class="panel-heading"><div><h3>Line items</h3></div><button class="secondary-btn" type="button" data-cost-add-request-line>Add line item</button></div><div data-cost-request-lines>${items.map((item) => costRequestItemRow(item, items.length > 1)).join("")}</div><div class="cost-request-grand-total"><span>Total excl. VAT</span><strong data-cost-request-total>${money.format(financeNumber(po.subtotal))}</strong></div></div><label class="cost-form-wide">Notes<textarea name="notes" rows="2">${escapeHtml(po.notes || "")}</textarea></label><button class="primary-btn" type="submit">Resubmit for approval</button></form>` : ""}
  </section>`;
}

function renderCostPoApprovals() {
  const orders = costRows("purchaseOrders").filter((po) => ["Pending approval", "Draft", "Approved", "Rejected"].includes(po.status));
  const selected = orders.find((po) => po.id === costSelectedApprovalId);
  const rows = orders.map((po) => { const supplierName = costSupplierName(po.supplierId); const requester = po.requestedBy || po.createdBy || ""; const normalizedStatus = ["Draft", "Pending approval"].includes(po.status) ? "Pending approval" : po.status; const submittedDate = String(po.createdAt || po.date || "").slice(0, 10); const entity = po.branch || ""; const visible = (!costApprovalFilters.status || normalizedStatus === costApprovalFilters.status) && (!costApprovalFilters.requester || requester.toLowerCase().includes(costApprovalFilters.requester.toLowerCase())) && (!costApprovalFilters.supplier || supplierName.toLowerCase().includes(costApprovalFilters.supplier.toLowerCase())) && (!costApprovalFilters.date || submittedDate === costApprovalFilters.date) && (!costApprovalFilters.entity || entity.toLowerCase().includes(costApprovalFilters.entity.toLowerCase())); const rowClass = po.status === "Approved" ? "approval-row-accepted" : po.status === "Rejected" ? "approval-row-rejected" : "approval-row-pending"; return `<tr class="${rowClass}" data-cost-approval-row data-status="${escapeHtml(normalizedStatus)}" data-requester="${escapeHtml(requester.toLowerCase())}" data-supplier="${escapeHtml(supplierName.toLowerCase())}" data-date="${escapeHtml(submittedDate)}" data-entity="${escapeHtml(entity.toLowerCase())}" ${visible ? "" : "hidden"}><td><strong>${escapeHtml(po.number)}</strong><small>${escapeHtml(formatDate(po.date))}</small></td><td>${escapeHtml(supplierName)}</td><td>${escapeHtml(requester || "-")}</td><td>${escapeHtml(entity || "-")}<small>${escapeHtml(po.project || "")}</small></td><td>${money.format(financeNumber(po.total))}</td><td><span class="status-badge ${costStatusClass(po.status)}">${escapeHtml(costPoApprovalLabel(po.status))}</span>${po.rejectionReason ? `<small>${escapeHtml(po.rejectionReason)}</small>` : ""}</td><td><button class="secondary-btn small-btn" type="button" data-cost-open-approval="${escapeHtml(po.id)}">Open & view</button></td></tr>`; });
  return `${renderCostPoApprovalDetail(selected)}<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Approval queue</p><h2>Purchase Order Approvals</h2><p>Open a purchase order to review every line before accepting or rejecting it.</p></div></div><div class="cost-request-filter-bar cost-approval-filter-bar"><label>Status<select data-cost-approval-filter="status"><option value="">All statuses</option><option value="Pending approval" ${costApprovalFilters.status === "Pending approval" ? "selected" : ""}>Pending acceptance</option><option value="Approved" ${costApprovalFilters.status === "Approved" ? "selected" : ""}>Accepted</option><option value="Rejected" ${costApprovalFilters.status === "Rejected" ? "selected" : ""}>Rejected</option></select></label><label>Requester<input data-cost-approval-filter="requester" value="${escapeHtml(costApprovalFilters.requester)}" placeholder="Search requester" /></label><label>Supplier<input data-cost-approval-filter="supplier" value="${escapeHtml(costApprovalFilters.supplier)}" placeholder="Search supplier" /></label><label>Date submitted<input type="date" data-cost-approval-filter="date" value="${escapeHtml(costApprovalFilters.date)}" /></label><label>Entity / branch<input data-cost-approval-filter="entity" value="${escapeHtml(costApprovalFilters.entity)}" placeholder="Search entity" /></label><button class="secondary-btn" type="button" data-cost-clear-approval-filters>Clear filters</button></div>${costTable(["PO", "Supplier", "Requested by", "Entity / project", "Total", "Status", "Review"], rows)}</section>`;
}

function applyCostApprovalFilters() {
  portalHubGrid.querySelectorAll("[data-cost-approval-row]").forEach((row) => {
    const visible = (!costApprovalFilters.status || row.dataset.status === costApprovalFilters.status)
      && (!costApprovalFilters.requester || String(row.dataset.requester || "").includes(costApprovalFilters.requester.toLowerCase()))
      && (!costApprovalFilters.supplier || String(row.dataset.supplier || "").includes(costApprovalFilters.supplier.toLowerCase()))
      && (!costApprovalFilters.date || row.dataset.date === costApprovalFilters.date)
      && (!costApprovalFilters.entity || String(row.dataset.entity || "").includes(costApprovalFilters.entity.toLowerCase()));
    row.hidden = !visible;
  });
}

function renderCostBills() {
  const rows = costRows("bills").map((bill) => { const paid = costBillPayments(bill.id); const balance = Math.max(0, financeNumber(bill.total) - paid); const status = costBillStatus(bill); return `<tr><td><strong>${escapeHtml(bill.billNumber)}</strong><small>${escapeHtml(bill.reference || "")}</small></td><td>${escapeHtml(costSupplierName(bill.supplierId))}</td><td>${escapeHtml(formatDate(bill.date))}</td><td>${escapeHtml(formatDate(bill.dueDate))}</td><td>${money.format(financeNumber(bill.total))}</td><td>${money.format(paid)}</td><td>${money.format(balance)}</td><td><span class="status-badge ${costStatusClass(status)}">${escapeHtml(status)}</span></td></tr>`; });
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Accounts payable</p><h2>Supplier Bills</h2></div></div>
    <form class="cost-form-grid" data-cost-form="bill"><label>Supplier<select name="supplierId" required>${costSupplierOptions()}</select></label><label>Supplier invoice number<input name="billNumber" required /></label><label>Invoice date<input type="date" name="date" value="${todayInputValue()}" required /></label><label>Due date<input type="date" name="dueDate" required /></label><label>PO reference<input name="poNumber" /></label><label>Category<input name="category" /></label><label>Amount excl. VAT<input type="number" min="0" step="0.01" name="subtotal" required /></label><label>VAT %<input type="number" min="0" step="0.01" name="taxRate" value="15" /></label><label>Project / job<input name="project" /></label><label>Branch<input name="branch" /></label><label class="cost-form-wide">Notes<textarea name="notes" rows="2"></textarea></label><button class="primary-btn" type="submit">Capture supplier bill</button></form>
    ${costTable(["Bill", "Supplier", "Invoice date", "Due date", "Total", "Paid", "Balance", "Status"], rows)}
  </section>`;
}

function renderCostPayments() {
  const openBills = costRows("bills").filter((bill) => costBillPayments(bill.id) < financeNumber(bill.total));
  const billOptions = `<option value="">Select supplier bill</option>${openBills.map((bill) => `<option value="${escapeHtml(bill.id)}">${escapeHtml(bill.billNumber)} · ${escapeHtml(costSupplierName(bill.supplierId))} · ${money.format(financeNumber(bill.total) - costBillPayments(bill.id))}</option>`).join("")}`;
  const rows = costRows("payments").map((payment) => { const bill = costRows("bills").find((item) => item.id === payment.billId); return `<tr><td>${escapeHtml(formatDate(payment.date))}</td><td>${escapeHtml(bill?.billNumber || "-")}</td><td>${escapeHtml(costSupplierName(bill?.supplierId))}</td><td>${money.format(financeNumber(payment.amount))}</td><td>${escapeHtml(payment.method || "EFT")}</td><td>${escapeHtml(payment.reference || "-")}</td></tr>`; });
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Supplier payments</p><h2>Payments</h2></div></div><form class="cost-form-grid" data-cost-form="payment"><label>Supplier bill<select name="billId" required>${billOptions}</select></label><label>Payment date<input type="date" name="date" value="${todayInputValue()}" required /></label><label>Amount<input type="number" min="0.01" step="0.01" name="amount" required /></label><label>Method<select name="method"><option>EFT</option><option>Cash</option><option>Card</option><option>Debit order</option></select></label><label>Reference<input name="reference" required /></label><label class="cost-form-wide">Notes<textarea name="notes" rows="2"></textarea></label><button class="primary-btn" type="submit">Record payment</button></form>${costTable(["Date", "Bill", "Supplier", "Amount", "Method", "Reference"], rows)}</section>`;
}

function renderCostCredits() {
  const rows = costRows("credits").map((credit) => `<tr><td>${escapeHtml(credit.number)}</td><td>${escapeHtml(costSupplierName(credit.supplierId))}</td><td>${escapeHtml(formatDate(credit.date))}</td><td>${money.format(financeNumber(credit.amount))}</td><td>${escapeHtml(credit.reference || "-")}</td><td><span class="status-badge ${costStatusClass(credit.status)}">${escapeHtml(credit.status)}</span></td></tr>`);
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Supplier credits</p><h2>Credit Notes</h2></div></div><form class="cost-form-grid" data-cost-form="credit"><label>Supplier<select name="supplierId" required>${costSupplierOptions()}</select></label><label>Date<input type="date" name="date" value="${todayInputValue()}" required /></label><label>Amount<input type="number" min="0.01" step="0.01" name="amount" required /></label><label>Supplier reference<input name="reference" required /></label><label class="cost-form-wide">Reason / notes<textarea name="notes" rows="2"></textarea></label><button class="primary-btn" type="submit">Add credit note</button></form>${costTable(["Credit note", "Supplier", "Date", "Amount", "Reference", "Status"], rows)}</section>`;
}

function renderCostDocuments() {
  const rows = costRows("documents").map((document) => `<tr><td><strong>${escapeHtml(document.file_name)}</strong><small>${escapeHtml(formatFileSize(document.file_size))}</small></td><td>${escapeHtml(document.documentType)}</td><td>${escapeHtml(document.supplierId ? costSupplierName(document.supplierId) : "General")}</td><td>${escapeHtml(new Date(document.uploaded_at).toLocaleString("en-ZA"))}</td><td class="row-actions"><button class="secondary-btn small-btn" data-cost-view-document="${escapeHtml(document.id)}">View</button><button class="secondary-btn small-btn" data-cost-download-document="${escapeHtml(document.id)}">Download</button><button class="danger-btn small-btn" data-cost-remove-document="${escapeHtml(document.id)}">Remove</button></td></tr>`);
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Supporting records</p><h2>Documents</h2></div></div><form class="cost-form-grid" data-cost-form="documents"><label>Supplier<select name="supplierId">${costSupplierOptions()}</select></label><label>Document type<select name="documentType"><option>Supplier quotation</option><option>Supplier invoice</option><option>Proof of payment</option><option>Statement</option><option>Contract</option><option>Other</option></select></label><label class="cost-form-wide">Files<input type="file" name="files" multiple required /></label><button class="primary-btn" type="submit">Upload documents</button></form>${costTable(["File", "Type", "Supplier", "Uploaded", "Actions"], rows)}</section>`;
}

function renderCostReports() {
  const bills = costRows("bills");
  const supplierRows = costRows("suppliers").map((supplier) => { const supplierBills = bills.filter((bill) => bill.supplierId === supplier.id); const total = supplierBills.reduce((sum, bill) => sum + financeNumber(bill.total), 0); const paid = supplierBills.reduce((sum, bill) => sum + costBillPayments(bill.id), 0); return `<tr><td>${escapeHtml(supplier.name)}</td><td>${supplierBills.length}</td><td>${money.format(total)}</td><td>${money.format(paid)}</td><td>${money.format(Math.max(0, total - paid))}</td></tr>`; });
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Cost reporting</p><h2>Supplier Cost Report</h2></div><button class="secondary-btn" data-cost-export-report>Export CSV</button></div>${costTable(["Supplier", "Bills", "Total billed", "Paid", "Outstanding"], supplierRows)}</section>`;
}

function renderCostSetup() {
  const setup = JSON.parse(localStorage.getItem(costStorageKeys.setup) || "{}");
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Cost Hub configuration</p><h2>Setup</h2></div></div><form class="cost-form-grid" data-cost-form="setup"><label>Default VAT %<input type="number" min="0" step="0.01" name="vatRate" value="${escapeHtml(String(setup.vatRate ?? 15))}" /></label><label>Default payment terms<select name="paymentTerms">${costPaymentTermOptions(setup.paymentTerms || "30 days")}</select></label><label>Cost categories<input name="categories" value="${escapeHtml(setup.categories || "Stock, Services, Subcontractors, Labour, Consumables")}" /></label><label>Branches<input name="branches" value="${escapeHtml(setup.branches || "")}" /></label><label class="cost-form-wide">Approval notes<textarea name="approvalNotes" rows="3">${escapeHtml(setup.approvalNotes || "")}</textarea></label><button class="primary-btn" type="submit">Save Cost Hub setup</button></form></section>`;
}

function renderCostAudit() {
  const rows = loadAudit().filter((entry) => entry.module === "Cost Hub");
  return `<section class="finance-card"><div class="panel-heading"><div><p class="eyebrow">Activity history</p><h2>Cost Hub Audit Trail</h2></div></div>${renderGovernanceAuditTable(rows)}</section>`;
}

function renderCostHub(tab = activeCostTab) {
  activeCostTab = costTabs.some((item) => item.key === tab) ? tab : "dashboard";
  const hub = companyHubBySlug("cost-hub");
  const renderers = {
    dashboard: renderCostDashboard, requests: renderCostRequests, approvals: renderCostPoApprovals, entities: renderCostEntities, suppliers: renderCostSuppliers, purchaseOrders: renderCostPurchaseOrders, bills: renderCostBills, payments: renderCostPayments, credits: renderCostCredits, documents: renderCostDocuments, reports: renderCostReports, setup: renderCostSetup, audit: renderCostAudit,
  };
  const content = (renderers[activeCostTab] || renderCostDashboard)();
  document.body.classList.add("finance-hub-active");
  const requestCount = costRows("requests").filter((request) => ["Submitted", "Supplier approval required"].includes(request.status)).length;
  const approvalCount = costRows("purchaseOrders").filter((po) => ["Pending approval", "Draft"].includes(po.status)).length;
  portalHubGrid.innerHTML = `<section class="finance-hub-shell cost-hub-shell"><aside class="finance-sidebar"><div class="brand"><img class="brand-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" /><div><strong>${escapeHtml(hub.name)}</strong><small>Supplier costs</small></div></div><nav>${costTabs.map((item) => `<button class="nav-item ${item.key === activeCostTab ? "active" : ""}" type="button" data-cost-tab="${item.key}">${escapeHtml(item.label)}${item.key === "requests" && requestCount ? ` <span class="status-badge status-info">${requestCount}</span>` : ""}${item.key === "approvals" && approvalCount ? ` <span class="status-badge status-warning">${approvalCount}</span>` : ""}</button>`).join("")}</nav><div class="finance-user-panel"><small>Signed in as</small><strong>${escapeHtml(currentUserName())}</strong><span>${escapeHtml(currentMember().access || "Member")}</span><button class="secondary-btn" type="button" data-finance-logout>Logout</button></div></aside><main class="finance-main"><div class="topbar"><div><p class="eyebrow">Interactive Security</p><h1>${escapeHtml(costTabs.find((item) => item.key === activeCostTab)?.label || "Cost Hub")}</h1></div><button class="secondary-btn" type="button" onclick="window.location.href='/'">Back to portal</button></div>${content}</main></section>`;
  portalHubGrid.insertAdjacentHTML("beforeend", `<datalist id="costEntityNames">${costEntityDatalist()}</datalist>`);
  portalHubGrid.querySelectorAll('[name="branch"]').forEach((input) => input.setAttribute("list", "costEntityNames"));
  costAudit("Opened Cost Hub tab", activeCostTab);
}

function costFormValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleCostFormSubmit(form) {
  const type = form.dataset.costForm;
  const values = costFormValues(form);
  const now = new Date().toISOString();
  if (type === "request") {
    delete values.files;
    delete values.lineDescription;
    delete values.lineQuantity;
    delete values.lineUnitCost;
    const items = Array.from(form.querySelectorAll("[data-cost-request-line]")).map((row) => ({
      description: row.querySelector('[name="lineDescription"]')?.value.trim() || "",
      quantity: financeNumber(row.querySelector('[name="lineQuantity"]')?.value),
      unitCost: financeNumber(row.querySelector('[name="lineUnitCost"]')?.value),
    })).filter((item) => item.description && item.quantity > 0);
    if (!items.length) { alert("Please add at least one supplier quotation line item."); return; }
    const files = Array.from(form.querySelector('[name="files"]')?.files || []);
    const documents = [];
    for (const file of files) {
      if (!isSupportedRequestDocument(file)) { alert(`${file.name} is not a supported document type.`); continue; }
      documents.push({ ...(await requestFileMetadata(file)), id: `cost-request-file-${Date.now()}-${Math.random().toString(36).slice(2)}` });
    }
    const supplier = costRows("suppliers").find((item) => item.id === values.supplierId);
    const request = { id: `cost-request-${Date.now()}`, number: nextCostNumber("REQ", "request"), ...values, items, documents, status: supplier ? "Submitted" : "Supplier approval required", createdAt: now, createdBy: currentUserName(), createdByEmail: currentUser() };
    saveCostRows("requests", [request, ...costRows("requests")]);
    costAudit("Submitted purchase request", request.number, `${request.supplierName} · ${request.status}`);
    alert(`Purchase request ${request.number} was submitted${supplier ? "." : " and the new supplier is awaiting approval."}`);
    renderCostHub("requests");
    return;
  }
  if (type === "rejectedPo") {
    const orders = costRows("purchaseOrders");
    const existing = orders.find((po) => po.id === form.dataset.poId);
    if (!existing || existing.status !== "Rejected" || !costPoRequesterIsCurrentUser(existing)) return alert("Only the original requester can edit this rejected purchase order.");
    const items = Array.from(form.querySelectorAll("[data-cost-request-line]")).map((row) => ({ description: row.querySelector('[name="lineDescription"]')?.value.trim() || "", quantity: financeNumber(row.querySelector('[name="lineQuantity"]')?.value), unitCost: financeNumber(row.querySelector('[name="lineUnitCost"]')?.value) })).filter((item) => item.description && item.quantity > 0);
    if (!items.length) return alert("Please add at least one line item.");
    const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0));
    const taxRate = financeNumber(existing.taxRate || 15);
    const updated = { ...existing, supplierId: values.supplierId, dueDate: values.dueDate, project: values.project, notes: values.notes, items, description: items.map((item) => item.description).join("; "), quantity: items.reduce((sum, item) => sum + item.quantity, 0), unitCost: items.length === 1 ? items[0].unitCost : 0, subtotal, vat: roundCurrency(subtotal * taxRate / 100), total: roundCurrency(subtotal * (1 + taxRate / 100)), status: "Pending approval", rejectionReason: "", resubmittedAt: now, resubmittedBy: currentUserName() };
    saveCostRows("purchaseOrders", orders.map((po) => po.id === updated.id ? updated : po));
    if (updated.requestId) saveCostRows("requests", costRows("requests").map((request) => request.id === updated.requestId ? { ...request, items, status: "PO resubmitted", updatedAt: now, updatedBy: currentUserName() } : request));
    costAudit("Resubmitted rejected purchase order", updated.number, `Resubmitted by ${currentUserName()}`);
    costSelectedApprovalId = updated.id;
    renderCostHub("approvals");
    return;
  }
  if (type === "entity") {
    const entities = costRows("entities");
    const existing = entities.find((item) => item.id === costEditingEntityId);
    const entity = existing
      ? { ...existing, ...values, currentBalance: financeNumber(values.currentBalance), safetyBuffer: financeNumber(values.safetyBuffer), updatedAt: now, updatedBy: currentUserName() }
      : { id: `cost-entity-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...values, currentBalance: financeNumber(values.currentBalance), safetyBuffer: financeNumber(values.safetyBuffer), status: "Active", createdAt: now, createdBy: currentUserName() };
    saveCostRows("entities", existing ? entities.map((item) => item.id === entity.id ? entity : item) : [entity, ...entities]);
    costAudit(existing ? "Updated entity" : "Added entity", entity.name, `${existing ? "Updated" : "Created"} by ${currentUserName()}`);
    costEditingEntityId = "";
    renderCostHub("entities");
    return;
  }
  if (type === "supplier") {
    const suppliers = costRows("suppliers");
    const existing = suppliers.find((item) => item.id === costEditingSupplierId);
    const supplier = existing
      ? { ...existing, ...values, updatedAt: now, updatedBy: currentUserName() }
      : { id: `cost-supplier-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...values, status: "Active", createdAt: now, createdBy: currentUserName() };
    saveCostRows("suppliers", existing ? suppliers.map((item) => item.id === existing.id ? supplier : item) : [supplier, ...suppliers]);
    costAudit(existing ? "Updated supplier" : "Added supplier", supplier.name, `${existing ? "Updated" : "Created"} by ${currentUserName()}`);
    costEditingSupplierId = "";
    renderCostHub("suppliers");
    return;
  }
  if (type === "purchaseOrder") {
    const quantity = financeNumber(values.quantity);
    const unitCost = financeNumber(values.unitCost);
    const taxRate = financeNumber(values.taxRate);
    const subtotal = roundCurrency(quantity * unitCost);
    const vat = roundCurrency(subtotal * taxRate / 100);
    const po = { id: `cost-po-${Date.now()}`, number: nextCostNumber("PO", "po"), ...values, quantity, unitCost, taxRate, subtotal, vat, total: roundCurrency(subtotal + vat), status: "Pending approval", requestedBy: currentUserName(), requestedByEmail: currentUser(), createdAt: now, createdBy: currentUserName() };
    saveCostRows("purchaseOrders", [po, ...costRows("purchaseOrders")]);
    costAudit("Created purchase order", po.number, `${costSupplierName(po.supplierId)} · ${money.format(po.total)}`);
    renderCostHub("purchaseOrders");
    return;
  }
  if (type === "bill") {
    const subtotal = financeNumber(values.subtotal);
    const taxRate = financeNumber(values.taxRate);
    const vat = roundCurrency(subtotal * taxRate / 100);
    const bill = { id: `cost-bill-${Date.now()}`, ...values, subtotal, taxRate, vat, total: roundCurrency(subtotal + vat), status: "Awaiting payment", createdAt: now, createdBy: currentUserName() };
    saveCostRows("bills", [bill, ...costRows("bills")]);
    costAudit("Captured supplier bill", bill.billNumber, `${costSupplierName(bill.supplierId)} · ${money.format(bill.total)}`);
    renderCostHub("bills");
    return;
  }
  if (type === "payment") {
    const bill = costRows("bills").find((item) => item.id === values.billId);
    if (!bill) return;
    const amount = financeNumber(values.amount);
    const remaining = Math.max(0, financeNumber(bill.total) - costBillPayments(bill.id));
    if (amount <= 0 || amount > remaining + 0.01) {
      alert(`Payment cannot exceed the outstanding balance of ${money.format(remaining)}.`);
      return;
    }
    const payment = { id: `cost-payment-${Date.now()}`, ...values, amount, createdAt: now, createdBy: currentUserName() };
    saveCostRows("payments", [payment, ...costRows("payments")]);
    costAudit("Recorded supplier payment", bill.billNumber, `${money.format(amount)} · ${values.reference}`);
    renderCostHub("payments");
    return;
  }
  if (type === "credit") {
    const credit = { id: `cost-credit-${Date.now()}`, number: nextCostNumber("CN", "credit"), ...values, amount: financeNumber(values.amount), status: "Unallocated", createdAt: now, createdBy: currentUserName() };
    saveCostRows("credits", [credit, ...costRows("credits")]);
    costAudit("Added supplier credit note", credit.number, `${costSupplierName(credit.supplierId)} · ${money.format(credit.amount)}`);
    renderCostHub("credits");
    return;
  }
  if (type === "documents") {
    const files = Array.from(form.querySelector('[name="files"]')?.files || []);
    if (!files.length) return;
    const uploaded = [];
    for (const file of files) {
      if (!isSupportedRequestDocument(file)) {
        alert(`${file.name} is not a supported document type.`);
        continue;
      }
      const metadata = await requestFileMetadata(file);
      uploaded.push({ ...metadata, id: `cost-document-${Date.now()}-${Math.random().toString(36).slice(2)}`, supplierId: values.supplierId || "", documentType: values.documentType || "Other" });
    }
    saveCostRows("documents", [...uploaded, ...costRows("documents")]);
    costAudit("Uploaded cost documents", `${uploaded.length} file(s)`, values.documentType || "Other");
    renderCostHub("documents");
    return;
  }
  if (type === "setup") {
    localStorage.setItem(costStorageKeys.setup, JSON.stringify(values));
    costAudit("Updated Cost Hub setup", "Setup", `Updated by ${currentUserName()}`);
    renderCostHub("setup");
  }
}

function openCostDocument(id, mode = "view") {
  const documentRecord = costRows("documents").find((document) => document.id === id);
  if (!documentRecord?.file_data_base64) return alert("The original file data is not available.");
  const binary = atob(documentRecord.file_data_base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const url = URL.createObjectURL(new Blob([bytes], { type: documentRecord.mime_type || "application/octet-stream" }));
  if (mode === "download") {
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = documentRecord.file_name; anchor.click();
  } else window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function openCostRequestDocument(requestId, fileId) {
  const file = costRows("requests").find((request) => request.id === requestId)?.documents?.find((item) => item.id === fileId);
  if (!file?.file_data_base64) return alert("The original request document is not available.");
  const binary = atob(file.file_data_base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const url = URL.createObjectURL(new Blob([bytes], { type: file.mime_type || "application/octet-stream" }));
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function processCostRequest(requestId) {
  if (!isGovernanceAdmin()) return alert("Only an administrator can approve suppliers and process purchase requests.");
  const requests = costRows("requests");
  const request = requests.find((item) => item.id === requestId);
  if (!request) return;
  let supplier = costRows("suppliers").find((item) => item.id === request.supplierId);
  if (!supplier) {
    supplier = {
      id: `cost-supplier-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: request.supplierName, registrationNumber: request.registrationNumber, vatNumber: request.vatNumber,
      email: request.email, phone: request.phone, address: request.address, bankName: request.bankName,
      accountNumber: request.accountNumber, branchCode: request.branchCode, paymentTerms: request.paymentTerms,
      category: request.category || "General", status: "Active", notes: `Created from ${request.number}`,
      createdAt: new Date().toISOString(), createdBy: currentUserName(),
    };
    saveCostRows("suppliers", [supplier, ...costRows("suppliers")]);
    costAudit("Approved and added supplier", supplier.name, `From purchase request ${request.number}`);
  }
  const items = costRequestItems(request);
  const quantity = items.reduce((sum, item) => sum + financeNumber(item.quantity), 0);
  const unitCost = items.length === 1 ? financeNumber(items[0].unitCost) : 0;
  const taxRate = 15;
  const subtotal = roundCurrency(items.reduce((sum, item) => sum + financeNumber(item.quantity) * financeNumber(item.unitCost), 0));
  const po = { id: `cost-po-${Date.now()}`, number: nextCostNumber("PO", "po"), supplierId: supplier.id, date: todayInputValue(), dueDate: request.requiredBy || "", project: request.project || "", branch: request.branch || "", description: items.map((item) => item.description).join("; "), items, quantity, unitCost, taxRate, subtotal, vat: roundCurrency(subtotal * taxRate / 100), total: roundCurrency(subtotal * (1 + taxRate / 100)), notes: request.notes || "", requestId: request.id, status: "Pending approval", requestedBy: request.createdBy || currentUserName(), requestedByEmail: request.createdByEmail || "", createdAt: new Date().toISOString(), createdBy: currentUserName() };
  saveCostRows("purchaseOrders", [po, ...costRows("purchaseOrders")]);
  saveCostRows("requests", requests.map((item) => item.id === request.id ? { ...item, supplierId: supplier.id, status: "PO created", poId: po.id, processedAt: new Date().toISOString(), processedBy: currentUserName() } : item));
  costAudit("Processed purchase request", request.number, `${po.number} · ${supplier.name}`);
  alert(`${po.number} was created from ${request.number}.`);
  renderCostHub("purchaseOrders");
}

function exportCostReport() {
  const rows = [["Supplier", "Bill count", "Total billed", "Paid", "Outstanding"]];
  costRows("suppliers").forEach((supplier) => {
    const bills = costRows("bills").filter((bill) => bill.supplierId === supplier.id);
    const total = bills.reduce((sum, bill) => sum + financeNumber(bill.total), 0);
    const paid = bills.reduce((sum, bill) => sum + costBillPayments(bill.id), 0);
    rows.push([supplier.name, bills.length, total.toFixed(2), paid.toFixed(2), Math.max(0, total - paid).toFixed(2)]);
  });
  downloadBlobFile(new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }), `cost-hub-supplier-report-${todayInputValue()}.csv`);
  costAudit("Exported Cost Hub report", "Supplier cost report", `${rows.length - 1} suppliers`);
}

function isSuperAdmin() {
  return isSuperAdminUser();
}

function isGovernanceAdmin() {
  return ["Admin", "Super Admin"].includes(currentMember().access);
}

function currentUserCanEditPermissions() {
  const role = normalizeRole(currentMember().access || currentMember().role || "Read Only");
  return role === "Super Admin" || role === "Admin" || hasPermission("member_access_management");
}

function governanceMembers() {
  return storageList(membersStorageKey).map((member) => ({
    ...member,
    status: member.inviteStatus || member.status || (member.disabled ? "Disabled" : "Active"),
    department: member.department || member.branch || "-",
    position: member.position || member.access || member.role || "-",
  }));
}

function isDeactivatedGovernanceMember(member) {
  const status = String(member.inviteStatus || member.status || "").toLowerCase();
  return ["disabled", "archived", "deactivated"].includes(status);
}

function governanceActiveMembers() {
  return governanceMembers().filter((member) => !isDeactivatedGovernanceMember(member));
}

function governanceDeactivatedMembers() {
  return governanceMembers().filter(isDeactivatedGovernanceMember);
}

function setGovernanceUserNotice(memberId, message, tone = "success") {
  governanceUserNotice = { memberId, message, tone };
}

function renderGovernanceUserNotice(memberId) {
  if (!governanceUserNotice || governanceUserNotice.memberId !== memberId) return "";
  return `<div class="governance-inline-notice ${escapeHtml(governanceUserNotice.tone)}">${escapeHtml(governanceUserNotice.message)}</div>`;
}

function governanceHubList() {
  const hubBySlug = new Map(companyHubs.map((hub, index) => [hub.slug, { ...hub, sortOrder: index + 1 }]));
  storageList(hubsStorageKey).forEach((hub) => {
    hubBySlug.set(hub.slug, { ...hubBySlug.get(hub.slug), ...hub });
  });
  return Array.from(hubBySlug.values())
    .filter((hub) => ["active", "placeholder"].includes(hub.status || "active"))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function governanceHubAccessFor(member, hub) {
  const explicit = storageList(userHubAccessStorageKey).find((access) => access.hubSlug === hub.slug && (access.userId === member.id || normalizeEmail(access.email) === normalizeEmail(member.email)));
  if (explicit) return explicit.status === "active";
  if (isSuperAdminUser(member)) return true;
  return hasExplicitHubPermission(member, permissionKeyForHubSlug(hub.slug));
}

function recordPermissionHistory(member, hub, previousValue, nextValue) {
  const history = storageList(permissionHistoryStorageKey);
  history.unshift({
    id: `permission-history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId: member.id,
    userEmail: member.email,
    userName: member.name,
    hubSlug: hub.slug,
    hubName: hub.name,
    granted: Boolean(nextValue),
    previousPermissions: previousValue ? "Access granted" : "Access removed",
    newPermissions: nextValue ? "Access granted" : "Access removed",
    changedBy: currentUserName(),
    changedByEmail: currentUser(),
    changedAt: new Date().toISOString(),
  });
  saveStorageList(permissionHistoryStorageKey, history);
  const audit = loadAudit();
  audit.unshift({
    action: nextValue ? "Granted hub access" : "Removed hub access",
    detail: `${member.name} - ${hub.name}`,
    module: "Administration & Governance",
    reference: member.email,
    oldValue: previousValue ? "Access granted" : "Access removed",
    newValue: nextValue ? "Access granted" : "Access removed",
    notes: `Changed by ${currentUserName()}`,
    user: currentUser(),
    userName: currentUserName(),
    ipAddress: "Local prototype / browser session",
    device: navigator.userAgent || "Unknown device",
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(auditStorageKey, JSON.stringify(audit));
}

function setGovernanceHubAccess(memberId, hubSlug, canAccessHub, options = {}) {
  if (!currentUserCanEditPermissions()) {
    alert("You do not have permission to change hub access permissions.");
    return;
  }
  const member = governanceMembers().find((item) => item.id === memberId);
  const hub = companyHubBySlug(hubSlug);
  if (!member || !hub) return;
  if (member.access === "Super Admin" && normalizeEmail(member.email) === normalizeEmail(currentUser())) {
    alert("You cannot remove your own Super Admin hub access.");
    return;
  }
  const previous = governanceHubAccessFor(member, hub);
  if (previous === Boolean(canAccessHub)) return;
  let accessRows = storageList(userHubAccessStorageKey).filter((row) => !(row.hubSlug === hubSlug && (row.userId === member.id || normalizeEmail(row.email) === normalizeEmail(member.email))));
  accessRows.push({
    id: `hub-access-${member.id}-${hubSlug}`,
    userId: member.id,
    email: member.email,
    hubSlug,
    status: canAccessHub ? "active" : "removed",
    updatedAt: new Date().toISOString(),
    updatedBy: currentUserName(),
  });
  saveStorageList(userHubAccessStorageKey, accessRows);
  const permissionKey = permissionDefinitions.find((permission) => permission.hubSlug === hubSlug)?.key || hubSlug.replace(/-/g, "_");
  const members = storageList(membersStorageKey);
  const memberIndex = members.findIndex((item) => item.id === memberId);
  if (memberIndex >= 0) {
    const nextPermissions = new Set(Array.isArray(members[memberIndex].permissions) ? members[memberIndex].permissions : Array.from(memberPermissions(members[memberIndex])));
    if (canAccessHub) nextPermissions.add(permissionKey);
    else nextPermissions.delete(permissionKey);
    members[memberIndex] = { ...members[memberIndex], permissions: Array.from(nextPermissions), permissionsExplicit: true, updatedAt: new Date().toISOString(), updatedBy: currentUserName() };
    saveStorageList(membersStorageKey, members);
    syncGovernanceMemberToBackend(members[memberIndex]).catch((error) => console.warn("Governance hub access backend sync failed", error));
  }
  recordPermissionHistory(member, hub, previous, canAccessHub);
  if (options.render !== false) renderGovernanceHub(options.tab || "matrix");
}

async function syncGovernanceMemberToBackend(member) {
  if (window.location.protocol === "file:") return;
  const role = normalizeRole(member.access || member.role || "Read Only");
  const response = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...member,
      role,
      access: role,
      permissions: Array.isArray(member.permissions) ? member.permissions : Array.from(memberPermissions(member)),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "User changes could not be saved to the server.");
}

function mergeGovernanceMemberFromServer(member) {
  if (!member?.id) return;
  const members = storageList(membersStorageKey);
  const index = members.findIndex((item) => item.id === member.id || normalizeEmail(item.email) === normalizeEmail(member.email));
  const normalized = {
    ...(index >= 0 ? members[index] : {}),
    ...member,
    id: member.id || member.userId,
    access: normalizeRole(member.access || member.role || "Read Only"),
    role: normalizeRole(member.role || member.access || "Read Only"),
    inviteStatus: member.inviteStatus || member.status || "Active",
    status: member.status || member.inviteStatus || "Active",
    updatedAt: member.updated_at || member.updatedAt || new Date().toISOString(),
  };
  if (index >= 0) members[index] = normalized;
  else members.push(normalized);
  saveStorageList(membersStorageKey, members);
}

function showOneTimePasswordFallback(password, emailStatus, emailError) {
  if (!password) return;
  alert(`Email delivery ${emailStatus || "Failed"}.\n\nGive this temporary one-time password to the user now:\n${password}\n\nThis password will not be shown again. The user must change it after first login.${emailError ? `\n\nEmail error: ${emailError}` : ""}`);
}

async function removeGovernanceMemberOnServer(memberId) {
  const response = await fetch("/api/members/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ memberId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Member could not be removed.");
  mergeGovernanceMemberFromServer(data.member);
  return data;
}

async function readdGovernanceMemberOnServer(payload) {
  const response = await fetch("/api/members/readd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Member could not be created.");
  mergeGovernanceMemberFromServer(data.member);
  showOneTimePasswordFallback(data.temporaryPassword, data.emailStatus, data.emailError);
  return data;
}

async function updateGovernanceMember(memberId, changes = {}, options = {}) {
  const members = storageList(membersStorageKey);
  const index = members.findIndex((member) => member.id === memberId);
  if (index < 0) return;
  const before = members[index];
  if (before.access === "Super Admin" && !isSuperAdmin()) {
    alert("Only Super Admin users may manage Super Admin accounts.");
    return;
  }
  const changedEntries = Object.entries(changes).filter(([key, value]) => before[key] !== value);
  if (!changedEntries.length) {
    if (options.notice) setGovernanceUserNotice(memberId, options.notice);
    if (options.render !== false) renderGovernanceHub(options.tab || "users");
    return;
  }
  members[index] = { ...before, ...Object.fromEntries(changedEntries), updatedAt: new Date().toISOString(), updatedBy: currentUserName() };
  saveStorageList(membersStorageKey, members);
  try {
    await syncGovernanceMemberToBackend(members[index]);
  } catch (error) {
    console.warn("Governance user backend sync failed", error);
    setGovernanceUserNotice(memberId, error.message || "Saved locally, but server sync failed.", "warning");
  }
  changedEntries.forEach(([key, value]) => {
    const audit = loadAudit();
    audit.unshift({
      action: "Updated user access",
      detail: `${before.email} - ${key}`,
      module: "Administration & Governance",
      reference: before.email,
      oldValue: String(before[key] ?? "-"),
      newValue: String(value ?? "-"),
      notes: `Changed by ${currentUserName()}`,
      user: currentUser(),
      userName: currentUserName(),
      ipAddress: "Local prototype / browser session",
      device: navigator.userAgent || "Unknown device",
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(auditStorageKey, JSON.stringify(audit));
  });
  if (options.notice) setGovernanceUserNotice(memberId, options.notice);
  if (options.render !== false) renderGovernanceHub(options.tab || "users");
}

async function addGovernanceUser(existingMember = null) {
  if (!isGovernanceAdmin()) return;
  const name = prompt("User name:", existingMember?.name || "");
  const email = prompt("Email address:", existingMember?.email || "");
  if (!name || !email) return;
  const duplicate = memberByEmail(email);
  if (!existingMember && duplicate && !isDeactivatedGovernanceMember(duplicate)) {
    alert("A user with this email already exists.");
    return;
  }
  const department = prompt("Department:", existingMember?.department || "");
  const position = prompt("Position:", existingMember?.position || "");
  const access = isSuperAdmin() ? (prompt("Role: Super Admin, Admin, Quotation Builder, Sales Representative, Read Only", existingMember?.access || existingMember?.role || "Read Only") || "Read Only") : "Read Only";
  const role = normalizeRole(access);
  const currentPermissions = new Set(Array.isArray(existingMember?.permissions) && existingMember.permissions.length ? existingMember.permissions : (roleDefaultPermissions[role] || []));
  const selected = prompt(
    "Permission keys to assign, comma-separated. Leave as-is to use the suggested permissions.",
    Array.from(currentPermissions).join(", ")
  );
  const permissions = selected === null
    ? Array.from(currentPermissions)
    : selected.split(",").map((value) => value.trim()).filter((value) => permissionDefinitions.some((permission) => permission.key === value));
  try {
    const data = await readdGovernanceMemberOnServer({
      id: existingMember?.id,
      name,
      email: normalizeEmail(email),
      position,
      department,
      access: role,
      role,
      permissions,
    });
    writeAudit(existingMember ? "Member re-added" : "Created user", normalizeEmail(email), "Administration & Governance", normalizeEmail(email), `Created by ${currentUserName()}; email ${data.emailStatus || "Unknown"}`);
    renderGovernanceHub("users");
  } catch (error) {
    alert(error.message || "Member could not be created.");
  }
}

function governanceAuditRows() {
  const filters = governanceAuditFilters;
  return loadAudit().filter((entry) => {
    const timestamp = String(entry.timestamp || "");
    const haystack = [entry.userName, entry.user, entry.module, entry.action, entry.reference, entry.detail, entry.notes].join(" ").toLowerCase();
    if (filters.user && ![entry.userName, entry.user].join(" ").toLowerCase().includes(filters.user.toLowerCase())) return false;
    if (filters.from && timestamp.slice(0, 10) < filters.from) return false;
    if (filters.to && timestamp.slice(0, 10) > filters.to) return false;
    if (filters.hub && !String(entry.module || "").toLowerCase().includes(filters.hub.toLowerCase())) return false;
    if (filters.action && !String(entry.action || "").toLowerCase().includes(filters.action.toLowerCase())) return false;
    if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

function governanceExportAudit(format = "csv", reportName = "Full system activity report") {
  if (!isSuperAdmin() && reportName.toLowerCase().includes("full")) {
    alert("Only Super Admin users may export full audit reports.");
    return;
  }
  const rows = governanceAuditRows();
  const headers = ["Date", "Time", "User", "Hub", "Section", "Action", "Record affected", "Old value", "New value", "IP Address", "Device"];
  const csvRows = rows.map((entry) => {
    const date = new Date(entry.timestamp);
    return [
      date.toLocaleDateString("en-ZA"),
      date.toLocaleTimeString("en-ZA"),
      entry.userName || displayNameFromUser(entry.user),
      entry.module || "-",
      entry.reference || "-",
      entry.action || "-",
      entry.detail || entry.reference || "-",
      entry.oldValue || "-",
      entry.newValue || entry.notes || "-",
      entry.ipAddress || "Local prototype / browser session",
      entry.device || "-",
    ].map(csvEscape).join(",");
  });
  const csv = [headers.map(csvEscape).join(","), ...csvRows].join("\n");
  if (format === "pdf") {
    const report = window.open("", "_blank", "noopener");
    if (!report) return;
    report.document.write(`
      <html><head><title>${escapeHtml(reportName)}</title><style>
        body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#17212b}
        h1{margin:0 0 12px;font-size:20px}
        table{width:100%;border-collapse:collapse;font-size:10px}
        th,td{border:1px solid #d8e0e6;padding:6px;text-align:left;vertical-align:top}
        th{background:#f2f5f7}
      </style></head><body>
        <h1>${escapeHtml(reportName)}</h1>
        <table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>
          ${rows.map((entry) => {
            const date = new Date(entry.timestamp);
            const values = [
              date.toLocaleDateString("en-ZA"),
              date.toLocaleTimeString("en-ZA"),
              entry.userName || displayNameFromUser(entry.user),
              entry.module || "-",
              entry.reference || "-",
              entry.action || "-",
              entry.detail || entry.reference || "-",
              entry.oldValue || "-",
              entry.newValue || entry.notes || "-",
              entry.ipAddress || "Local prototype / browser session",
              entry.device || "-",
            ];
            return `<tr>${values.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`;
          }).join("")}
        </tbody></table>
        <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    report.document.close();
    writeAudit("Exported governance report", reportName, "Administration & Governance", reportName, `${rows.length} rows exported to PDF`);
    return;
  }
  downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `governance-${slugify(reportName)}-${todayInputValue()}.${format === "excel" ? "csv" : "csv"}`);
  writeAudit("Exported governance report", reportName, "Administration & Governance", reportName, `${rows.length} rows exported`);
}

function renderGovernanceDashboard() {
  const members = governanceMembers();
  const auditToday = loadAudit().filter((entry) => String(entry.timestamp || "").slice(0, 10) === todayInputValue());
  const quotes = storageList(approvalsStorageKey);
  const financeEvents = loadAudit().filter((entry) => String(entry.module || "").includes("Finance"));
  const failedLoginsToday = loadAudit().filter((entry) => String(entry.action || "").toLowerCase().includes("failed") && String(entry.timestamp || "").slice(0, 10) === todayInputValue());
  return `
    <div class="governance-summary-grid">
      ${renderSummaryCard("Total users", members.length)}
      ${renderSummaryCard("Active users", governanceActiveMembers().length)}
      ${renderSummaryCard("Online users", currentSession()?.email ? 1 : 0)}
      ${renderSummaryCard("Quotations processed", quotes.length)}
      ${renderSummaryCard("Finance records updated", financeEvents.length)}
      ${renderSummaryCard("Audit events today", auditToday.length)}
      ${renderSummaryCard("Failed login attempts today", failedLoginsToday.length)}
    </div>
    <section class="finance-card">
      <h2>System Activity Overview</h2>
      <p class="finance-note">This dashboard reads from all shared platform records and audit events. Audit history is stored permanently in this prototype storage and archived users remain visible in reports.</p>
    </section>
  `;
}

function renderGovernanceHubPermissionChecks(member) {
  const hubs = governanceHubList();
  const canEditPermissions = currentUserCanEditPermissions();
  return hubs.map((hub) => `
    <label>
      <input type="checkbox" ${governanceHubAccessFor(member, hub) ? "checked" : ""} ${canEditPermissions ? "" : "disabled"} data-governance-edit-hub="${escapeHtml(hub.slug)}" />
      ${escapeHtml(hub.name)}
    </label>
  `).join("");
}

function renderGovernanceEditPanel(member) {
  const roleOptions = ["Super Admin", "Admin", "Quotation Builder", "Sales Representative", "Read Only"];
  const currentStatus = String(member.inviteStatus || member.status || "Active");
  const canEditPermissions = currentUserCanEditPermissions();
  const statusOptions = canEditPermissions ? ["Active", "Pending", "Disabled", "Archived"] : ["Active", "Pending", "Disabled"];
  if (!statusOptions.includes(currentStatus)) statusOptions.push(currentStatus);
  return `
    <div class="governance-edit-panel" data-governance-edit-panel="${escapeHtml(member.id)}">
      <div class="governance-edit-grid">
        <label>Name<input data-governance-edit-field="name" value="${escapeHtml(member.name || "")}" /></label>
        <label>Email<input type="email" data-governance-edit-field="email" value="${escapeHtml(member.email || "")}" /></label>
        <label>Position<input data-governance-edit-field="position" value="${escapeHtml(member.position === "-" ? "" : member.position || "")}" /></label>
        <label>Department<input data-governance-edit-field="department" value="${escapeHtml(member.department === "-" ? "" : member.department || "")}" /></label>
        <label>Status<select data-governance-edit-field="inviteStatus" ${currentStatus === "Archived" && !canEditPermissions ? "disabled" : ""}>
          ${statusOptions.map((status) => `<option value="${status}" ${currentStatus === status ? "selected" : ""}>${status}</option>`).join("")}
        </select></label>
        <label>Role<select data-governance-edit-field="access" ${canEditPermissions ? "" : "disabled"}>
          ${roleOptions.map((role) => `<option value="${role}" ${normalizeRole(member.access || member.role || "Read Only") === role ? "selected" : ""}>${role}</option>`).join("")}
        </select></label>
      </div>
      <div class="governance-edit-permissions">
        <strong>Hub access permissions</strong>
        <div>${renderGovernanceHubPermissionChecks(member)}</div>
      </div>
      <div class="row-actions">
        <button class="primary-btn" type="button" data-governance-save-user="${escapeHtml(member.id)}">Save changes</button>
        <button class="secondary-btn" type="button" data-governance-cancel-edit>Cancel</button>
        <button class="secondary-btn" type="button" data-governance-force-password="${escapeHtml(member.id)}">Force password change</button>
        <button class="secondary-btn" type="button" data-governance-reset-password="${escapeHtml(member.id)}">Reset password</button>
      </div>
    </div>
  `;
}

function renderGovernanceUserRows(members, mode = "active") {
  if (!members.length) return `<p class="empty-state">${mode === "active" ? "No active users found." : "No deactivated users found."}</p>`;
  return `
    <div class="finance-table">
      <div class="finance-table-row finance-table-head" style="grid-template-columns: repeat(9, minmax(140px, 1fr));">
        ${["Name", "Email", "Position", "Department", "Status", "Last login", "Last activity", "Role", "Actions"].map((header) => `<span>${header}</span>`).join("")}
      </div>
      ${members.map((member) => `
        <div class="finance-table-row ${mode === "deactivated" ? "governance-deactivated-row" : ""}" style="grid-template-columns: repeat(9, minmax(140px, 1fr));">
          <span><strong>${escapeHtml(member.name)}</strong>${renderGovernanceUserNotice(member.id)}</span>
          <span>${escapeHtml(member.email)}</span>
          <span>${escapeHtml(member.position || "-")}</span>
          <span>${escapeHtml(member.department || "-")}</span>
          <span>${escapeHtml(member.status)}</span>
          <span>${escapeHtml(formatDate(String(member.lastLoginAt || member.signedInAt || "").slice(0, 10)))}</span>
          <span>${escapeHtml(formatDate(String(member.lastActivityAt || member.updatedAt || "").slice(0, 10)))}</span>
          <span>${escapeHtml(member.access || member.role || "-")}</span>
          <span class="row-actions">
            <button class="secondary-btn" type="button" data-governance-edit-user="${escapeHtml(member.id)}">Edit</button>
            ${mode === "active" ? `<button class="danger-btn" type="button" data-governance-remove-user="${escapeHtml(member.id)}">Remove Member</button>` : `<button class="primary-btn" type="button" data-governance-readd-user="${escapeHtml(member.id)}">Re-add Member</button>`}
            ${isSuperAdmin() && mode === "active" ? `<button class="danger-btn" type="button" data-governance-archive-user="${escapeHtml(member.id)}">Archive</button>` : ""}
          </span>
        </div>
        ${governanceEditingUserId === member.id ? renderGovernanceEditPanel(member) : ""}
      `).join("")}
    </div>
  `;
}

function renderGovernanceUsers() {
  const activeMembers = governanceActiveMembers();
  const deactivatedMembers = governanceDeactivatedMembers();
  return `
    <section class="finance-card governance-user-section">
      <div class="panel-heading"><div><p class="eyebrow">User access management</p><h2>Active Users</h2></div><button class="primary-btn" type="button" data-governance-add-user>Add user</button></div>
      ${renderGovernanceUserRows(activeMembers, "active")}
    </section>
    <section class="finance-card governance-user-section">
      <div class="panel-heading"><div><p class="eyebrow">Archived access</p><h2>Deactivated Users</h2></div><span class="finance-active-date">${deactivatedMembers.length}</span></div>
      <p class="finance-note">Deactivated and archived users cannot sign in, but their historical audit records remain available for reporting.</p>
      ${renderGovernanceUserRows(deactivatedMembers, "deactivated")}
    </section>
  `;
}

function renderGovernanceMatrix() {
  const members = governanceMembers();
  const hubs = governanceHubList();
  const canEditPermissions = currentUserCanEditPermissions();
  return `
    <section class="finance-card">
      <div class="panel-heading"><div><p class="eyebrow">Hub access control</p><h2>Hub Access Matrix</h2></div><button class="secondary-btn" data-governance-copy-permissions>Copy permissions</button></div>
      <p class="finance-note">Hub access checkboxes can be changed by users with member access management permission. Every change is written to permission history and the full audit trail.</p>
      <div class="governance-matrix-wrap">
        <table class="governance-matrix">
          <thead><tr><th>User Name</th>${hubs.map((hub) => `<th>${escapeHtml(hub.name)}</th>`).join("")}</tr></thead>
          <tbody>${members.map((member) => `<tr><th>${escapeHtml(member.name)}</th>${hubs.map((hub) => {
            const checked = governanceHubAccessFor(member, hub);
            return `<td><input type="checkbox" ${checked ? "checked" : ""} ${canEditPermissions ? "" : "disabled"} data-governance-hub-access data-member-id="${escapeHtml(member.id)}" data-hub-slug="${escapeHtml(hub.slug)}" /></td>`;
          }).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderGovernanceAuditTable(rows = governanceAuditRows()) {
  return `<div class="finance-table"><div class="finance-table-row finance-table-head" style="grid-template-columns: repeat(11, minmax(150px, 1fr));">${["Date/time", "User", "Hub", "Section", "Action", "Record", "Old value", "New value", "IP", "Device", "Notes"].map((h) => `<span>${h}</span>`).join("")}</div>${rows.map((entry) => `<div class="finance-table-row" style="grid-template-columns: repeat(11, minmax(150px, 1fr));"><span>${escapeHtml(new Date(entry.timestamp).toLocaleString("en-ZA"))}</span><span>${escapeHtml(entry.userName || displayNameFromUser(entry.user))}</span><span>${escapeHtml(entry.module || "-")}</span><span>${escapeHtml(entry.reference || "-")}</span><span>${escapeHtml(entry.action || "-")}</span><span>${escapeHtml(entry.detail || "-")}</span><span>${escapeHtml(entry.oldValue || "-")}</span><span>${escapeHtml(entry.newValue || "-")}</span><span>${escapeHtml(entry.ipAddress || "Local prototype")}</span><span>${escapeHtml(entry.device || "-")}</span><span>${escapeHtml(entry.notes || "-")}</span></div>`).join("") || `<p class="empty-state">No audit activity matches the selected filters.</p>`}</div>`;
}

function renderGovernanceSearch() {
  return `
    <section class="finance-card">
      <h2>Audit Search Centre</h2>
      <div class="approval-filterbar governance-filters">
        <label>User<input data-governance-filter="user" value="${escapeHtml(governanceAuditFilters.user)}" placeholder="User name or email" /></label>
        <label>From date<input type="date" data-governance-filter="from" value="${escapeHtml(governanceAuditFilters.from)}" /></label>
        <label>To date<input type="date" data-governance-filter="to" value="${escapeHtml(governanceAuditFilters.to)}" /></label>
        <label>Hub<input data-governance-filter="hub" value="${escapeHtml(governanceAuditFilters.hub)}" placeholder="Hub/module" /></label>
        <label>Action type<input data-governance-filter="action" value="${escapeHtml(governanceAuditFilters.action)}" placeholder="Action" /></label>
        <label>Client / quote / account / department<input data-governance-filter="search" value="${escapeHtml(governanceAuditFilters.search)}" placeholder="Search all details" /></label>
      </div>
      ${renderGovernanceAuditTable()}
    </section>
  `;
}

function renderGovernanceReports() {
  const reports = ["User activity report", "Hub activity report", "Security report", "Login report", "Failed login report", "Approval report", "Full system activity report"];
  return `<section class="finance-card"><h2>Audit Reports</h2><p class="finance-note">Reports respect the current Audit Search Centre filters. Full system exports are restricted to Super Admin users.</p><div class="governance-report-grid">${reports.map((report) => `<article><strong>${escapeHtml(report)}</strong><div class="row-actions"><button class="secondary-btn" data-governance-export="pdf" data-report="${escapeHtml(report)}">PDF</button><button class="secondary-btn" data-governance-export="csv" data-report="${escapeHtml(report)}">CSV</button><button class="secondary-btn" data-governance-export="excel" data-report="${escapeHtml(report)}">Excel</button></div></article>`).join("")}</div></section>`;
}

async function loadGovernancePasswordResetRequests() {
  if (!isSignedIn()) return;
  governancePasswordResetRequestsLoading = true;
  try {
    const response = await fetch("/api/auth/password-reset-requests", { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Password reset requests could not be loaded.");
    governancePasswordResetRequests = data.requests || [];
    governanceEmailDiagnostics = data.emailDiagnostics || null;
    governancePasswordResetRequestsLoaded = true;
  } catch (error) {
    governancePasswordResetRequests = [];
    governanceEmailDiagnostics = { provider: "Load failed", error: error.message };
    governancePasswordResetRequestsLoaded = true;
  } finally {
    governancePasswordResetRequestsLoading = false;
  }
}

async function runGovernancePasswordResetAction(requestId, action) {
  const response = await fetch("/api/auth/password-reset-requests/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ requestId, action }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Password reset request could not be updated.");
  if (data.resetLink) console.log("Development password reset link:", data.resetLink);
  if (data.otp) {
    alert(`Give this OTP to the user: ${data.otp}\n\nThis OTP expires in 15 minutes and will not be shown again.`);
  }
  await loadGovernancePasswordResetRequests();
  renderGovernanceHub("security");
}

async function generateGovernanceOtpForUser(userId) {
  const response = await fetch("/api/auth/password-reset-requests/generate-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "OTP could not be generated.");
  if (data.otp) {
    alert(`Give this OTP to the user: ${data.otp}\n\nThis OTP expires in 15 minutes and will not be shown again.`);
  }
  await loadGovernancePasswordResetRequests();
  renderGovernanceHub("security");
}

function renderGovernancePasswordResetRequests() {
  const diagnostics = governanceEmailDiagnostics || {};
  return `
    <section class="finance-card">
      <div class="panel-heading"><div><p class="eyebrow">Password recovery</p><h2>Password Reset Requests</h2></div><button class="secondary-btn" type="button" data-governance-refresh-resets>Refresh</button></div>
      <p class="finance-note">Email service: ${escapeHtml(diagnostics.provider || "Unknown")} | Admin recipient: ${escapeHtml(diagnostics.adminEmail || "Not configured")} | Sender: ${escapeHtml(diagnostics.sender || "Not configured")}${diagnostics.error ? ` | Error: ${escapeHtml(diagnostics.error)}` : ""}</p>
      <div class="finance-table">
        <div class="finance-table-row finance-table-head" style="grid-template-columns: repeat(9, minmax(160px,1fr));">
          ${["Request ID", "User", "Email", "Request date", "Status", "Approved by", "IP / Device", "Completed date", "Actions"].map((h) => `<span>${h}</span>`).join("")}
        </div>
        ${governancePasswordResetRequests.map((request) => `
          <div class="finance-table-row" style="grid-template-columns: repeat(9, minmax(160px,1fr));">
            <span>${escapeHtml(request.id || "-")}</span>
            <span>${escapeHtml(request.user_name || "-")}</span>
            <span>${escapeHtml(request.user_email || "-")}</span>
            <span>${escapeHtml(request.requested_at ? new Date(request.requested_at).toLocaleString("en-ZA") : "-")}</span>
            <span>${escapeHtml(request.status === "Completed" && request.otp_status === "Used" ? "Completed / OTP Used" : request.status || "Pending")}${request.otp_expires_at ? `<small>OTP expires: ${escapeHtml(new Date(request.otp_expires_at).toLocaleString("en-ZA"))}</small>` : ""}${request.otp_attempts ? `<small>OTP attempts: ${escapeHtml(String(request.otp_attempts))}</small>` : ""}${request.admin_email_status ? `<small>Optional email: ${escapeHtml(request.admin_email_status)}${request.admin_email_error ? ` - ${escapeHtml(request.admin_email_error)}` : ""}</small>` : ""}</span>
            <span>${escapeHtml(request.approved_by || "-")}</span>
            <span>${escapeHtml(request.requested_ip || "-")}<small>${escapeHtml(request.requested_device || "")}</small></span>
            <span>${escapeHtml(request.completed_at ? new Date(request.completed_at).toLocaleString("en-ZA") : "-")}</span>
            <span class="row-actions">
              <button class="secondary-btn" type="button" data-governance-reset-action="generate_otp" data-request-id="${escapeHtml(request.id)}">Generate OTP</button>
              <button class="secondary-btn" type="button" data-governance-reset-action="mark_completed" data-request-id="${escapeHtml(request.id)}">Mark as Completed</button>
              <button class="secondary-btn" type="button" data-governance-reset-action="force_change" data-request-id="${escapeHtml(request.id)}">Force password change</button>
              <button class="danger-btn" type="button" data-governance-reset-action="reject" data-request-id="${escapeHtml(request.id)}">Reject</button>
            </span>
          </div>
        `).join("") || `<p class="empty-state">No password reset requests found.</p>`}
      </div>
    </section>
  `;
}

function renderGovernanceSecurity() {
  const members = governanceMembers();
  const session = currentSession();
  return `<section class="finance-card"><h2>Login & Security Monitoring</h2><div class="governance-summary-grid">${renderSummaryCard("Current online users", session?.email ? 1 : 0)}${renderSummaryCard("Locked accounts", members.filter((m) => m.lockedUntil && new Date(m.lockedUntil) > new Date()).length)}${renderSummaryCard("Password reset requests", governancePasswordResetRequests.filter((request) => ["Pending", "OTP Generated", "Force Change Required"].includes(request.status || "Pending")).length)}${renderSummaryCard("Active sessions", session?.email ? 1 : 0)}</div><div class="finance-table"><div class="finance-table-row finance-table-head" style="grid-template-columns: repeat(7, minmax(150px,1fr));">${["User", "Last login", "Failed attempts", "Locked until", "Reset requested", "Session", "Actions"].map((h) => `<span>${h}</span>`).join("")}</div>${members.map((member) => `<div class="finance-table-row" style="grid-template-columns: repeat(7, minmax(150px,1fr));"><span>${escapeHtml(member.name)}</span><span>${escapeHtml(formatDate(String(member.lastLoginAt || "").slice(0,10)))}</span><span>${escapeHtml(String(member.failedLoginAttempts || 0))}</span><span>${escapeHtml(member.lockedUntil ? new Date(member.lockedUntil).toLocaleString("en-ZA") : "-")}</span><span>${member.passwordResetRequested ? "Yes" : "-"}</span><span>${normalizeEmail(session?.email || "") === normalizeEmail(member.email) ? "Active" : "-"}</span><span class="row-actions"><button class="secondary-btn" data-governance-unlock-user="${escapeHtml(member.id)}">Unlock</button><button class="secondary-btn" data-governance-reset-password="${escapeHtml(member.id)}">Generate Password Reset OTP</button><button class="secondary-btn" data-governance-force-logout="${escapeHtml(member.id)}">Force logout</button></span></div>`).join("")}</div></section>${renderGovernancePasswordResetRequests()}`;
}

function renderGovernanceHistory() {
  const rows = storageList(permissionHistoryStorageKey);
  return `<section class="finance-card"><h2>Permission History</h2><p class="finance-note">No permission change may occur without being logged here and in the full audit trail.</p><div class="finance-table"><div class="finance-table-row finance-table-head" style="grid-template-columns: repeat(7, minmax(150px,1fr));">${["Date/time", "User", "Hub", "Changed by", "Previous", "New", "Result"].map((h) => `<span>${h}</span>`).join("")}</div>${rows.map((row) => `<div class="finance-table-row" style="grid-template-columns: repeat(7, minmax(150px,1fr));"><span>${escapeHtml(new Date(row.changedAt).toLocaleString("en-ZA"))}</span><span>${escapeHtml(row.userName || row.userEmail)}</span><span>${escapeHtml(row.hubName)}</span><span>${escapeHtml(row.changedBy)}</span><span>${escapeHtml(row.previousPermissions)}</span><span>${escapeHtml(row.newPermissions)}</span><span>${row.granted ? "Granted" : "Removed"}</span></div>`).join("") || `<p class="empty-state">No permission changes recorded yet.</p>`}</div></section>`;
}

function governanceTabFromHash() {
  const key = window.location.hash.slice(1);
  return governanceTabs.some((item) => item.key === key) ? key : activeGovernanceTab;
}

function renderGovernanceHub(tab = activeGovernanceTab) {async function emergencyResetMembers() {
  const confirmed = confirm(
    "This will remove ALL old members, archived users, duplicate users, permissions and invites.\n" +
    "Only your current Super Admin account will remain.\n\nContinue?"
  );
  if (!confirmed) return;
  const res = await fetch("/api/admin/reset-members", { method: "POST" });
  const data = await res.json();
  if (data.ok) {
    alert("Reset complete. Removed " + data.membersRemoved + " member(s). Only you remain.");
    // reload both member tables — replace these with whatever your app uses
    if (typeof loadMembers === "function") loadMembers();
    if (typeof loadArchivedMembers === "function") loadArchivedMembers();
  } else {
    alert("Reset failed: " + (data.error || "Unknown error"));
  }
}
  activeGovernanceTab = tab;
  if (tab === "security" && !governancePasswordResetRequestsLoaded && !governancePasswordResetRequestsLoading) {
    loadGovernancePasswordResetRequests().then(() => renderGovernanceHub("security"));
  }
  const hub = companyHubBySlug("administration-governance");
  const content = {
    dashboard: renderGovernanceDashboard(),
    users: renderGovernanceUsers(),
    matrix: renderGovernanceMatrix(),
    audit: `<section class="finance-card"><h2>Full System Audit Trail</h2>${renderGovernanceAuditTable(loadAudit())}</section>`,
    search: renderGovernanceSearch(),
    reports: renderGovernanceReports(),
    security: renderGovernanceSecurity(),
    history: renderGovernanceHistory(),
  }[tab] || renderGovernanceDashboard();
  portalHubGrid.innerHTML = `<section class="finance-hub-shell governance-hub-shell"><aside class="finance-sidebar"><div class="brand"><img class="brand-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" /><div><strong>${escapeHtml(hub.name)}</strong><small>System governance</small></div></div><nav>${governanceTabs.map((item) => `<button class="nav-item ${item.key === tab ? "active" : ""}" type="button" data-governance-tab="${item.key}">${escapeHtml(item.label)}</button>`).join("")}</nav><div class="finance-user-panel"><small>Signed in as</small><strong>${escapeHtml(currentUserName())}</strong><span>${escapeHtml(currentMember().access || "Member")}</span><button class="secondary-btn" type="button" data-finance-logout>Logout</button></div></aside><main class="finance-main"><div class="panel-heading"><div><p class="eyebrow">Administration & Governance</p><h1>${escapeHtml(governanceTabs.find((item) => item.key === tab)?.label || "System Dashboard")}</h1></div><strong class="finance-active-date">${escapeHtml(isSuperAdmin() ? "Super Admin" : "Admin view")}</strong></div>${content}</main></section>`;
  writeAudit("Opened governance tab", tab, "Administration & Governance", tab, currentUserName());<button onclick="emergencyResetMembers()" 
  style="background:#dc2626;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">
  🚨 Emergency Reset Members
</button>
}

function financeTabFromHash() {
  const key = window.location.hash.slice(1);
  return financeTabs.some((item) => item.key === key) ? key : activeFinanceTab;
}

function costTabFromHash() {
  const key = window.location.hash.slice(1);
  return costTabs.some((item) => item.key === key) ? key : activeCostTab;
}

function renderPortal() {
  const routeHub = companyHubBySlug(currentCompanyHubSlug());
  const member = currentMember();
  const superAdminBypass = isSuperAdminUser(member);
  const allowedHubs = getAllowedHubs(member);
  logAuthDebug("renderPortal:start", member, allowedHubs);
  if (routeHub && routeHub.slug !== "quotation-hub") {
    if (!canAccessCompanyHub(member, routeHub.slug)) {
      console.warn("Hub access denied", {
        userRole: normalizeRole(member.access || member.role),
        hub: routeHub.slug,
        permissions: Array.from(memberPermissions(member)),
        allowedHubs,
        superAdminBypass,
      });
      document.body.classList.remove("finance-hub-active");
      portalHubGrid.innerHTML = `<p class="empty-state">Access denied</p>`;
      return;
    }
    if (routeHub.slug === "finance-age-analysis") {
      document.body.classList.add("finance-hub-active");
      renderFinanceHub(financeTabFromHash());
      return;
    }
    if (routeHub.slug === "cost-hub") {
      document.body.classList.add("finance-hub-active");
      renderCostHub(costTabFromHash());
      return;
    }
    if (routeHub.slug === "administration-governance") {
      document.body.classList.add("finance-hub-active");
      renderGovernanceHub(governanceTabFromHash());
      return;
    }
    document.body.classList.remove("finance-hub-active");
    portalHubGrid.innerHTML = `
      <article class="hub-card portal-module-card hub-placeholder-card">
        <div class="module-icon" aria-hidden="true">${moduleIcon(routeHub.icon)}</div>
        <div>
          <mark>Placeholder</mark>
          <strong>${escapeHtml(routeHub.name)}</strong>
          <p>${escapeHtml(routeHub.description)} This hub has been reserved and will be built out in a future phase.</p>
          <ul class="hub-feature-list">
            ${(routeHub.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
          </ul>
        </div>
        <button class="secondary-btn" type="button" onclick="window.close()">Close tab</button>
      </article>
    `;
    return;
  }
  document.body.classList.remove("finance-hub-active");

  const storedHubs = storageList(hubsStorageKey);
  const hubBySlug = new Map(companyHubs.map((hub, index) => [hub.slug, { ...hub, sortOrder: index + 1 }]));
  storedHubs.forEach((hub) => {
    hubBySlug.set(hub.slug, { ...hubBySlug.get(hub.slug), ...hub });
  });
  const hubs = Array.from(hubBySlug.values())
    .filter((hub) => ["active", "placeholder"].includes(hub.status || "active"))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .filter((hub) => superAdminBypass || allowedHubs.includes(hub.slug));

  console.info("Portal hub loading", {
    userRole: normalizeRole(member.access || member.role),
    permissionsApplied: Array.from(memberPermissions(member)),
    superAdminBypass,
    allowedHubs,
    hubsLoaded: hubs.map((hub) => hub.slug),
  });

  const authDebugPanel = `
    <div class="portal-auth-debug">
      <strong>AUTH DEBUG</strong>
      <span>Email: ${escapeHtml(member.email || "-")}</span>
      <span>Role: ${escapeHtml(member.role || member.access || "-")}</span>
      <span>isSuperAdmin: ${escapeHtml(String(superAdminBypass))}</span>
      <span>Allowed hubs: ${escapeHtml(allowedHubs.join(", ") || "-")}</span>
    </div>
  `;

  portalHubGrid.innerHTML = hubs.length
    ? authDebugPanel + hubs.map((hub) => `
      <article class="hub-card portal-module-card" data-open-hub="${escapeHtml(hub.slug)}">
        <div class="module-icon" aria-hidden="true">${moduleIcon(hub.icon)}</div>
        <div>
          <mark>${hub.status === "active" ? "Active" : "Placeholder"}</mark>
          <strong>${escapeHtml(hub.name)}</strong>
          <p>${escapeHtml(hub.description)}</p>
          <ul class="hub-feature-list">
            ${(hub.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
          </ul>
        </div>
        <button class="primary-btn" type="button" data-open-hub="${escapeHtml(hub.slug)}">Open hub</button>
      </article>
    `).join("")
    : `${authDebugPanel}<p class="empty-state">No hub access has been assigned. Please contact an administrator.</p>`;
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
      ["Total technical quotations", data.technical.length],
      ["Total guarding quotations", data.guarding.length],
      ["Total armed response quotations", data.armedResponse.length],
      ["Monthly armed response value", data.armedResponse.reduce((sum, quote) => sum + Number(quote.armedResponsePricing?.monthlySelling || quote.monthlyValue || 0), 0)],
      ["Once-off armed response value", data.armedResponse.reduce((sum, quote) => sum + Number(quote.armedResponsePricing?.onceOffSelling || quote.onceOffValue || 0), 0)],
      ["Armed response annual contract value", data.armedResponse.reduce((sum, quote) => sum + quoteAnnualValue(quote), 0)],
      ["Total quotations approved internally", data.approved.length],
      ["Total quotations accepted by clients", data.accepted.length],
      ["Total quotations outstanding for client approval", data.outstanding.length],
      ["Lost quotations", data.lost.length],
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

function renderSetupMemberPermissionChecks(member) {
  const permissions = memberPermissions(member);
  return quotationHubPermissionDefinitions().map((permission) => `
    <label class="permission-option">
      <input type="checkbox" value="${escapeHtml(permission.key)}" data-setup-member-permission="${escapeHtml(permission.key)}" ${permissions.has(permission.key) ? "checked" : ""} />
      ${escapeHtml(permission.label)}
    </label>
  `).join("");
}

function renderSetupMemberEditPanel(member) {
  const role = normalizeRole(member.access || member.role || "Read Only");
  const status = member.inviteStatus || member.status || (member.hasLoggedIn ? "Active" : "Pending");
  return `
    <div class="setup-member-edit-panel" data-setup-member-edit-panel="${escapeHtml(member.id)}">
      <div class="governance-edit-grid">
        <label>Name<input data-setup-member-field="name" value="${escapeHtml(member.name || "")}" /></label>
        <label>Email<input type="email" data-setup-member-field="email" value="${escapeHtml(member.email || "")}" /></label>
        <label>Position<input data-setup-member-field="position" value="${escapeHtml(member.position || "")}" /></label>
        <label>Department<input data-setup-member-field="department" value="${escapeHtml(member.department || member.branch || "")}" /></label>
        <label>Status<select data-setup-member-field="inviteStatus">
          ${["Active", "Pending", "Invite Sent", "Disabled"].map((item) => `<option value="${item}" ${status === item ? "selected" : ""}>${item}</option>`).join("")}
        </select></label>
        <label>Role<select data-setup-member-field="access">
          ${platformRoles.map((item) => `<option value="${item}" ${role === item ? "selected" : ""}>${item}</option>`).join("")}
        </select></label>
      </div>
      <fieldset class="member-permission-checklist setup-member-permission-grid">
        <legend>Quotation Hub section access</legend>
        ${renderSetupMemberPermissionChecks(member)}
      </fieldset>
      <div class="row-actions">
        <button class="primary-btn" type="button" data-save-setup-member="${escapeHtml(member.id)}">Save changes</button>
        <button class="secondary-btn" type="button" data-cancel-setup-member-edit>Cancel</button>
        <button class="secondary-btn" type="button" data-force-setup-member-password="${escapeHtml(member.id)}">Force password change</button>
      </div>
    </div>
  `;
}

function renderSetupMemberRows(members, mode = "active") {
  if (!members.length) {
    return `<p class="empty-state">${mode === "active" ? "No active members saved yet." : "No deactivated members found."}</p>`;
  }
  return members.map((member) => {
    const inviteStatus = member.inviteStatus || member.status || (member.hasLoggedIn ? "Active" : "Pending");
    const role = normalizeRole(member.access || member.role || "Read Only");
    const permissions = Array.from(memberPermissions(member))
      .filter((key) => quotationHubPermissionKeys.includes(key))
      .map((key) => permissionDefinitions.find((permission) => permission.key === key)?.label || key)
      .join(", ") || "None selected";
    return `
      <article class="setup-row ${mode === "deactivated" ? "setup-row-deactivated" : ""}">
        <div>
          <strong>${escapeHtml(member.name)}</strong>
          ${renderSetupMemberNotice(member.id)}
          <small>${escapeHtml(member.email)} | ${escapeHtml(role)} | ${escapeHtml(inviteStatus)}</small>
          <small>Quotation Hub permissions: ${escapeHtml(permissions)}</small>
          <small>${member.inviteSentAt ? `Invite sent: ${escapeHtml(formatDate(member.inviteSentAt.slice(0, 10)))}` : "Invite not sent yet"}</small>
        </div>
        <div class="setup-actions">
          <button class="secondary-btn" type="button" data-edit-setup-member="${escapeHtml(member.id)}">Edit</button>
          ${mode === "active" ? `<button class="secondary-btn" type="button" data-deactivate-setup-member="${escapeHtml(member.id)}">Deactivate</button>` : `<button class="primary-btn" type="button" data-reactivate-setup-member="${escapeHtml(member.id)}">Reactivate</button>`}
        </div>
      </article>
      ${setupEditingMemberId === member.id ? renderSetupMemberEditPanel(member) : ""}
    `;
  }).join("");
}

function renderMembers() {
  const members = storageList(membersStorageKey);
  const activeMembers = members.filter((member) => !isInactiveMember(member));
  const deactivatedMembers = members.filter(isInactiveMember);
  memberList.innerHTML = "";
  if (!members.length) {
    memberList.innerHTML = `<p class="empty-state">No members saved yet. Add members and assign exact role/module access before they can use the platform.</p>`;
    return;
  }
  memberList.innerHTML = `
    <section class="setup-member-section">
      <div class="panel-heading"><div><p class="eyebrow">Quotation Hub permissions</p><h3>Active Users</h3></div><span class="finance-active-date">${activeMembers.length}</span></div>
      ${renderSetupMemberRows(activeMembers, "active")}
    </section>
    <section class="setup-member-section">
      <div class="panel-heading"><div><p class="eyebrow">Archived access</p><h3>Deactivated Users</h3></div><span class="finance-active-date">${deactivatedMembers.length}</span></div>
      <p class="finance-note">Deactivated users are hidden from the active permissions list and cannot access the Quotation Hub, but their quotation and audit history stays available.</p>
      ${renderSetupMemberRows(deactivatedMembers, "deactivated")}
    </section>
  `;
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

function renderGuardingPriceManagement() {
  if (!guardingPriceList) return;
  const items = loadGuardingMasterPriceList();
  guardingPriceList.innerHTML = "";
  if (!items.length) {
    guardingPriceList.innerHTML = `<p class="empty-state">No guarding price list items saved.</p>`;
    return;
  }

  items
    .slice()
    .sort((a, b) => (a.itemName || "").localeCompare(b.itemName || ""))
    .forEach((item) => {
      const row = document.createElement("div");
      row.className = `setup-row ${item.active === false ? "muted-row" : ""}`;
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(item.itemName || item.description || "Guarding item")}</strong>
          <small>${escapeHtml(item.description || "-")}</small>
          <small>${escapeHtml([item.shiftType, item.billingType, item.category, item.serviceType, item.unitType].filter(Boolean).join(" | ") || "-")} | ${money.format(Number(item.rate || 0))} | ${item.active === false ? "Inactive" : "Active"}</small>
        </div>
        <div class="setup-actions">
          <button class="secondary-btn" type="button" data-edit-guarding-price="${escapeHtml(item.id)}">Edit</button>
          <button class="secondary-btn" type="button" data-toggle-guarding-price="${escapeHtml(item.id)}">${item.active === false ? "Activate" : "Deactivate"}</button>
        </div>
      `;
      guardingPriceList.appendChild(row);
    });
}

function renderSetupBootstrapNotice() {
  const section = document.querySelector("#settings-section");
  if (!section) return;
  section.querySelector("#setupBootstrapNotice")?.remove();
  if (!isBootstrapSuperAdmin()) return;
  const notice = document.createElement("div");
  notice.id = "setupBootstrapNotice";
  notice.className = "bootstrap-admin-notice";
  notice.innerHTML = `
    <strong>First setup access is active</strong>
    <p>No active Super Admin exists yet, so your signed-in account has temporary setup access. Add yourself as a Super Admin to make this permanent.</p>
    <button class="primary-btn" type="button" data-bootstrap-add-self>Add me as Super Admin</button>
  `;
  section.querySelector("p")?.insertAdjacentElement("afterend", notice);
}

function renderSetup() {
  if (!canAccess("settings")) return;
  renderSetupBootstrapNotice();
  const settings = quotationSettings();
  profitDeductionPercent.value = settings.profitDeductionPercent;
  commissionPercent.value = settings.commissionPercent;
  if (!memberPermissionChecklist.children.length) {
    renderPermissionChecklist(roleDefaultPermissions[memberAccess.value] || []);
  }
  renderMembers();
  renderSetupSalesReps();
  renderSupplierPrices();
  renderGuardingPriceManagement();
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

const salesRequestStatusFlow = [
  "New Request",
  "Accepted for Processing",
  "Submitted for Approval",
  "Approved",
  "Rejected / Needs Changes",
  "Completed",
];

function salesRequestStatusLabel(status = "") {
  const normalized = normalizedStatus(status);
  if (normalized === "new" || normalized === "new_request" || normalized === "") return "New Request";
  if (normalized === "accepted" || normalized === "accepted_for_processing" || normalized === "processing" || normalized === "in_progress") return "Accepted for Processing";
  if (normalized === "approved") return "Approved";
  if (normalized === "submitted_for_approval" || normalized === "pending_approval" || normalized === "awaiting_approval") return "Submitted for Approval";
  if (normalized === "rejected" || normalized === "needs_changes" || normalized === "rejected_needs_changes" || normalized === "rejected_insufficient_information") return "Rejected / Needs Changes";
  if (normalized === "completed" || normalized === "complete") return "Completed";
  return "New Request";
}

function salesRequestStatusClass(status = "") {
  const label = salesRequestStatusLabel(status);
  if (label === "Approved") return "status-badge status-complete";
  if (label === "Completed") return "status-badge status-complete";
  if (label === "Submitted for Approval") return "status-badge status-info";
  if (label === "Rejected / Needs Changes") return "status-badge status-rejected";
  return "status-badge status-warning";
}

function migrateSalesRequestStatuses() {
  const requests = loadSalesRequests();
  let changed = false;
  const migrated = requests.map((request) => {
    const mappedStatus = salesRequestStatusLabel(request.status);
    const quotationType = request.quotation_type || "Technical Quotation";
    if (request.status === mappedStatus && request.quotation_type) return request;
    changed = true;
    return {
      ...request,
      legacy_status: request.legacy_status || request.status || "",
      status: mappedStatus,
      quotation_type: quotationType,
      updated_at: request.updated_at || new Date().toISOString(),
    };
  });
  if (changed) saveSalesRequests(migrated);
}

function canViewSalesRequestQueue() {
  return hasPermission("build_quotation") || hasPermission("approval") || ["Admin", "Super Admin"].includes(currentMember().access);
}

function salesRequestViewedBy(request = {}) {
  return Array.isArray(request.viewed_by_user_ids) ? request.viewed_by_user_ids : [];
}

function isUnreadSalesRequest(request = {}) {
  if (!canViewSalesRequestQueue()) return false;
  if (salesRequestStatusLabel(request.status) !== "New Request") return false;
  return !salesRequestViewedBy(request).includes(currentUser()) && !request.accepted_by_user_id;
}

function newSalesRequestBadgeCount() {
  return salesRequestsForCurrentUser().filter(isUnreadSalesRequest).length;
}

function renderSalesRequestBadge() {
  if (!salesRequestCount) return;
  const count = newSalesRequestBadgeCount();
  salesRequestCount.textContent = String(count);
  salesRequestCount.hidden = count <= 0;
  if (state.lastSalesRequestBadgeCount !== null && state.lastSalesRequestBadgeCount !== count) {
    writeAudit("Badge count updated", `Sales Quotation Requests: ${count}`, "Sales Quotation Requests", "Sales request badge", `Updated by ${currentUserName()} from ${state.lastSalesRequestBadgeCount} to ${count}`);
  }
  state.lastSalesRequestBadgeCount = count;
}

function markSalesRequestViewed(id, reason = "Request viewed") {
  const request = loadSalesRequests().find((item) => item.id === id);
  if (!request) return null;
  const viewedBy = new Set(salesRequestViewedBy(request));
  const wasUnread = isUnreadSalesRequest(request);
  viewedBy.add(currentUser());
  const updated = updateSalesRequest(id, {
    viewed_by_user_ids: Array.from(viewedBy),
    viewed_at: request.viewed_at || new Date().toISOString(),
    last_viewed_by_name: currentUserName(),
    is_new: false,
  });
  if (wasUnread) {
    writeAudit(reason, updated.request_number, "Sales Quotation Requests", updated.request_number, `Viewed by ${currentUserName()}`);
  }
  renderSalesRequestBadge();
  return updated;
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
    .filter((member) => !["disabled", "archived", "deactivated"].includes(String(member.inviteStatus || member.status || (member.hasLoggedIn ? "Active" : "Pending")).toLowerCase()))
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

function salesRequestSummaryHtml(request) {
  return `
    <div class="internal-costing-grid request-summary-grid">
      <div><small>Request number</small><strong>${escapeHtml(request.request_number || "-")}</strong></div>
      <div><small>Quotation type</small><strong>${escapeHtml(request.quotation_type || "Technical Quotation")}</strong></div>
      <div><small>Client</small><strong>${escapeHtml(request.client_name || "-")}</strong></div>
      <div><small>Contact</small><strong>${escapeHtml([request.client_contact_person, request.client_email, request.client_phone].filter(Boolean).join(" / ") || "-")}</strong></div>
      <div><small>Site / project</small><strong>${escapeHtml(request.site_project_name || "-")}</strong></div>
      <div><small>Site address</small><strong>${escapeHtml(request.site_address || "-")}</strong></div>
      <div><small>Sales rep</small><strong>${escapeHtml([request.sales_rep_name, request.sales_rep_email, request.sales_rep_phone].filter(Boolean).join(" / ") || "-")}</strong></div>
      <div><small>Due date</small><strong>${escapeHtml(formatDate(request.required_due_date))}</strong></div>
      <div><small>Status</small><strong>${escapeHtml(salesRequestStatusLabel(request.status))}</strong></div>
      <div><small>Description of work</small><strong>${escapeHtml(request.description_of_work || "-")}</strong></div>
      ${request.quotation_type === "Guarding Quotation" ? `
        <div><small>Guarding service</small><strong>${escapeHtml(request.required_service_type || "-")}</strong></div>
        <div><small>Shift structure</small><strong>${escapeHtml(`Day: ${request.day_shift_required || "-"} / Night: ${request.night_shift_required || "-"}`)}</strong></div>
        <div><small>Guarding notes</small><strong>${escapeHtml([request.equipment_required, request.special_site_instructions].filter(Boolean).join(" / ") || "-")}</strong></div>
      ` : ""}
      ${request.quotation_type === "Monthly Armed Response Quotation" ? `
        <div><small>Sites covered</small><strong>${escapeHtml(request.number_of_sites || "-")}</strong></div>
        <div><small>Area / suburb</small><strong>${escapeHtml([request.area_suburb, request.province].filter(Boolean).join(" / ") || "-")}</strong></div>
        <div><small>Armed response requirement</small><strong>${escapeHtml(`Monitoring: ${request.alarm_monitoring_required || "-"} / Armed response: ${request.armed_response_required || "-"} / Key holding: ${request.key_holding_required || "-"}`)}</strong></div>
        <div><small>Special instructions</small><strong>${escapeHtml(request.special_site_instructions || "-")}</strong></div>
      ` : ""}
      <div><small>Notes to quotation builder</small><strong>${escapeHtml(request.notes_for_builder || "-")}</strong></div>
    </div>
  `;
}

function renderSalesRequestSummary(request) {
  salesRequestSummaryPanel.hidden = !request;
  if (!request) {
    salesRequestSummary.innerHTML = "";
    return;
  }
  salesRequestSummary.innerHTML = salesRequestSummaryHtml(request);
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

function populateGuardingCompanyOptions() {
  if (!guardingFields.company) return;
  guardingFields.company.innerHTML = `<option value="">Select quoting company</option>`;
  Object.entries(companies).forEach(([id, company]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = company.name;
    guardingFields.company.appendChild(option);
  });
}

let guardingPriceCatalog = [];

function isAdminMember() {
  return ["Admin", "Super Admin"].includes(currentMember().access);
}

function guardingPriceNumber(value) {
  const cleaned = String(value ?? "").replace(/[^\d,.-]/g, "").replace(",", ".");
  return Number(cleaned) || 0;
}

function normalizeGuardingShiftType(item = {}) {
  const value = `${item.shiftType || item.shift_type || ""} ${item.itemName || item.name || ""} ${item.description || ""} ${item.schedule || ""} ${item.unitType || ""} ${item.category || ""} ${item.serviceType || ""}`.toLowerCase();
  if (value.includes("night")) return "Night Shift";
  if (value.includes("day")) return "Day Shift";
  return "Day Shift";
}

function normalizeGuardingBillingType(item = {}) {
  const value = `${item.billingType || item.billing_type || item.cadence || item.unitType || ""}`.toLowerCase();
  if (value.includes("hourly") || value.includes("hour")) return "Hourly";
  if (value.includes("daily") || value.includes("day")) return "Daily";
  if (value.includes("monthly") || value.includes("month")) return "Monthly";
  return item.billingType || item.cadence || "Monthly";
}

function normalizeGuardingPriceItem(item = {}, index = 0) {
  const itemName = item.itemName || item.name || item.description || item.item || "Guarding item";
  const description = item.description || item.itemDescription || item.duties || itemName;
  const shiftType = normalizeGuardingShiftType(item);
  const billingType = normalizeGuardingBillingType(item);
  const sourceParts = [item.source, item.region, item.cadence].filter(Boolean).join(" - ");
  return {
    id: item.id || slugify(`${itemName}-${index}-${Date.now()}`),
    itemName,
    shiftType,
    billingType,
    description,
    unitType: item.unitType || item.unit_type || item.unit || "Unit",
    category: item.category || item.region || item.source || "Guarding",
    serviceType: item.serviceType || item.service_type || item.source || "Guarding",
    rate: guardingPriceNumber(item.rate ?? item.unitPrice ?? item.price ?? item.monthlySellingPrice ?? 0),
    schedule: item.schedule || "",
    experience: item.experience || "",
    duties: item.duties || "",
    source: item.source || sourceParts || "Guarding",
    active: item.active !== false && String(item.active || "true").toLowerCase() !== "false",
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

function loadGuardingMasterPriceList() {
  const saved = storageList(guardingPriceListStorageKey);
  guardingPriceCatalog = saved.map(normalizeGuardingPriceItem);
  return guardingPriceCatalog;
}

function saveGuardingMasterPriceList(list) {
  const normalized = list.map(normalizeGuardingPriceItem);
  saveStorageList(guardingPriceListStorageKey, normalized);
  guardingPriceCatalog = normalized;
}

async function loadGuardingPriceCatalog() {
  try {
    const response = await fetch("/guarding-price-catalog.generated.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Price list request failed: ${response.status}`);
    const rows = await response.json();
    const existing = storageList(guardingPriceListStorageKey);
    if (!existing.length && Array.isArray(rows) && rows.length) {
      saveGuardingMasterPriceList(rows.map((row, index) => normalizeGuardingPriceItem(row, index)));
    } else {
      loadGuardingMasterPriceList();
    }
  } catch (error) {
    console.warn("Guarding price list could not be loaded", error);
    loadGuardingMasterPriceList();
  }
  renderGuardingBuilder();
  renderGuardingPriceManagement();
}

function guardingCatalogItem(id) {
  return loadGuardingMasterPriceList().find((item) => item.id === id);
}

function activeGuardingPriceItems() {
  return loadGuardingMasterPriceList().filter((item) => item.active !== false);
}

function guardingItemLabel(item = {}) {
  return item.itemName || item.description || "Guarding item";
}

function guardingItemShiftKey(item = {}) {
  return `${String(item.itemName || item.description || "").trim().toLowerCase()}|${String(item.shiftType || "Day Shift").trim().toLowerCase()}`;
}

function guardingSearchOptions() {
  const seen = new Set();
  return activeGuardingPriceItems().reduce((options, item) => {
    const key = String(guardingItemLabel(item)).trim().toLowerCase();
    if (seen.has(key)) return options;
    seen.add(key);
    options.push(item);
    return options;
  }, []).sort((a, b) => guardingItemLabel(a).localeCompare(guardingItemLabel(b)));
}

function findGuardingItemBySearchValue(value = "") {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return guardingSearchOptions().find((item) => guardingItemLabel(item).toLowerCase() === normalized) || null;
}

function guardingBillingOptionsForRow(row = {}) {
  return row.itemName ? ["Hourly", "Daily", "Monthly"] : [];
}

function findGuardingCatalogByBilling(row = {}) {
  if (!row.itemName || !row.shiftType || !row.billingType) return null;
  const rowKey = guardingItemShiftKey(row);
  return activeGuardingPriceItems().find((item) => guardingItemShiftKey(item) === rowKey && item.billingType === row.billingType) || null;
}

function refreshGuardingPriceForRow(index) {
  const row = state.guarding.lineItems[index];
  if (!row?.itemName || !row.shiftType || !row.billingType) return false;
  const item = findGuardingCatalogByBilling(row);
  if (!item) {
    row.catalogId = "";
    row.rate = 0;
    row.scheduleText = "";
    return false;
  }
  applyGuardingCatalogItemToRow(index, item);
  return true;
}

function guardingLineItemLabel(row = {}) {
  return row.itemName || row.description || row.position || "Guarding service";
}

function applyGuardingCatalogItemToRow(index, item) {
  const row = state.guarding.lineItems[index];
  if (!row || !item) return;
  state.guarding.lineItems[index] = {
    ...row,
    catalogId: item.id,
    catalogSearch: guardingItemLabel(item),
    itemName: item.itemName || item.description,
    shiftType: item.shiftType || "Day Shift",
    billingType: item.billingType || "",
    description: item.itemName || item.description,
    unitType: item.unitType || "",
    category: item.category || "",
    rate: Number(item.rate || 0),
    serviceDate: row.serviceDate || guardingFields.quoteDate?.value || todayInputValue(),
    serviceMonth: row.serviceMonth || (guardingFields.quoteDate?.value || todayInputValue()).slice(0, 7),
    scheduleText: "",
    unitNotes: "",
    schedule: item.schedule || "",
    experience: item.experience || "",
    duties: item.duties || "",
    source: item.source || "",
  };
}

function applyGuardingItemShiftToRow(index, item) {
  const row = state.guarding.lineItems[index];
  if (!row || !item) return;
  const itemName = item.itemName || item.description;
  state.guarding.lineItems[index] = {
    ...row,
    catalogId: "",
    catalogSearch: guardingItemLabel(item),
    itemName,
    shiftType: row.shiftType || "",
    billingType: "",
    description: itemName,
    unitType: item.unitType || "",
    category: item.category || "",
    rate: 0,
    schedule: item.schedule || "",
    experience: item.experience || "",
    duties: item.duties || "",
    source: item.source || "",
  };
  refreshGuardingPriceForRow(index);
}

function defaultGuardingLineItem() {
  return {
    catalogId: "",
    catalogSearch: "",
    itemName: "",
    shiftType: "",
    billingType: "",
    description: "",
    unitType: "",
    category: "",
    serviceType: "",
    rate: 0,
    quantity: 1,
    serviceDate: "",
    serviceMonth: "",
    scheduleText: "",
    unitNotes: "",
    notes: "",
    schedule: "",
    experience: "",
    duties: "",
    source: "",
  };
}

function guardingLineItemTotal(row = {}) {
  return roundCurrency(Number(row.quantity || 0) * Number(row.rate ?? row.monthlySellingPrice ?? 0));
}

function guardingLineScheduleDate(row = {}, quote = {}) {
  const rawDate = row.serviceDate || quote.quoteDate || todayInputValue();
  const rawMonth = row.serviceMonth || String(rawDate).slice(0, 7);
  if (row.billingType === "Monthly") {
    const [year, month] = String(rawMonth || "").split("-");
    if (year && month) return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
  }
  return formatDate(String(rawDate).slice(0, 10));
}

function guardingShiftScheduleText(row = {}) {
  const shift = String(row.shiftType || row.schedule || "Day Shift").toLowerCase().includes("night") ? "night" : "day";
  if (row.billingType === "Hourly") return `Per hour ${shift} shift`;
  const hours = String(row.schedule || "").match(/(\d+)\s*hour/i)?.[1] || "12";
  return `Per ${hours} hour ${shift} shift`;
}

function guardingScheduleText(row = {}, quote = {}) {
  if (row.scheduleText) return row.scheduleText;
  const scheduleLines = [
    guardingLineScheduleDate(row, quote),
    row.billingType || "",
    guardingShiftScheduleText(row),
    `${money.format(Number(row.rate || row.monthlySellingPrice || 0))} Excl. VAT per officer`,
  ].filter(Boolean);
  return scheduleLines.join("\n");
}

function guardingUnitNotesText(row = {}) {
  if (row.unitNotes) return row.unitNotes;
  return [
    row.shiftType || "",
    row.billingType || "",
    guardingShiftScheduleText(row),
    row.notes || "",
  ].filter(Boolean).join("\n");
}

function guardingDisplayLineItems(quote = null) {
  const directRows = quote ? quote.guardingLineItems : state.guarding.lineItems;
  const selectedRows = directRows?.filter((row) => row.itemName || row.description || row.catalogId) || [];
  if (selectedRows.length) return selectedRows;
  if (quote?.guardingStaffing?.length) {
    return quote.guardingStaffing.map((row) => ({
      description: row.position || "Guarding service",
      unitType: row.grade ? `Grade ${row.grade}` : "Guarding",
      rate: Number(row.monthlySellingPrice || 0),
      quantity: Number(row.quantity || 0),
      schedule: guardingShiftLabel(row),
      experience: row.experience || "",
      duties: row.duties || "",
    }));
  }
  return [];
}

function syncGuardingDerivedFields() {
  const rows = state.guarding.lineItems || [];
  const descriptions = rows.map(guardingLineItemLabel).filter(Boolean);
  const serviceSummary = descriptions.length ? descriptions.join(", ") : "";
  if (guardingFields.serviceType) guardingFields.serviceType.value = serviceSummary;
  if (guardingFields.guardCount) guardingFields.guardCount.value = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0) || "";
  if (guardingFields.equipmentRequired) guardingFields.equipmentRequired.value = rows.map((row) => row.duties || row.notes).filter(Boolean).join("\n");
  if (guardingFields.specialInstructions) guardingFields.specialInstructions.value = rows.map((row) => row.schedule).filter(Boolean).join("\n");
}

function defaultGuardingStaffRow() {
  return {
    position: "Grade C Guard",
    grade: "C",
    quantity: 1,
    dayShiftQuantity: 1,
    nightShiftQuantity: 0,
    hoursPerShift: 12,
    daysPerMonth: 30,
    monthlyCost: 0,
    monthlySellingPrice: 0,
  };
}

function guardingPricingValues() {
  if (state.guarding.lineItems?.length) {
    const monthlySelling = roundCurrency(state.guarding.lineItems.reduce((sum, row) => sum + guardingLineItemTotal(row), 0));
    return {
      monthlyCost: monthlySelling,
      monthlySelling,
      grossProfit: 0,
      grossProfitPercent: 0,
      markupPercent: 0,
      annualValue: roundCurrency(monthlySelling * 12),
    };
  }
  const staffingCost = state.guarding.staffing.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.monthlyCost || 0), 0);
  const staffingSelling = state.guarding.staffing.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0), 0);
  const equipmentCost = state.guarding.equipment.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.monthlyCost || 0), 0);
  const equipmentSelling = state.guarding.equipment.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0), 0);
  const additionalCost = state.guarding.additionalCosts.reduce((sum, row) => sum + Number(row.monthlyCost || 0), 0);
  const additionalSelling = state.guarding.additionalCosts.reduce((sum, row) => sum + Number(row.monthlySellingPrice || 0), 0);
  const monthlyCost = roundCurrency(staffingCost + equipmentCost + additionalCost);
  const monthlySelling = roundCurrency(staffingSelling + equipmentSelling + additionalSelling);
  const grossProfit = roundCurrency(monthlySelling - monthlyCost);
  const grossProfitPercent = monthlySelling ? roundCurrency((grossProfit / monthlySelling) * 100) : 0;
  const markupPercent = monthlyCost ? roundCurrency(((monthlySelling - monthlyCost) / monthlyCost) * 100) : 0;
  return {
    monthlyCost,
    monthlySelling,
    grossProfit,
    grossProfitPercent,
    markupPercent,
    annualValue: roundCurrency(monthlySelling * 12),
  };
}

function renderGuardingStaffRows() {
  if (!guardingStaffRows) return;
  guardingStaffRows.innerHTML = state.guarding.staffing.map((row, index) => `
    <div class="guarding-row" data-guarding-staff-row="${index}">
      <input data-guarding-staff="${index}" data-field="position" value="${escapeHtml(row.position || "")}" placeholder="Position" list="guardingPositionOptions" />
      <input data-guarding-staff="${index}" data-field="grade" value="${escapeHtml(row.grade || "")}" placeholder="Grade" />
      <input data-guarding-staff="${index}" data-field="quantity" type="number" min="0" step="1" value="${escapeHtml(row.quantity || 0)}" />
      <input data-guarding-staff="${index}" data-field="dayShiftQuantity" type="number" min="0" step="1" value="${escapeHtml(row.dayShiftQuantity || 0)}" />
      <input data-guarding-staff="${index}" data-field="nightShiftQuantity" type="number" min="0" step="1" value="${escapeHtml(row.nightShiftQuantity || 0)}" />
      <input data-guarding-staff="${index}" data-field="hoursPerShift" type="number" min="0" step="0.5" value="${escapeHtml(row.hoursPerShift || 0)}" />
      <input data-guarding-staff="${index}" data-field="daysPerMonth" type="number" min="0" step="1" value="${escapeHtml(row.daysPerMonth || 0)}" />
      <input data-guarding-staff="${index}" data-field="monthlyCost" type="number" min="0" step="0.01" value="${escapeHtml(row.monthlyCost || 0)}" />
      <input data-guarding-staff="${index}" data-field="monthlySellingPrice" type="number" min="0" step="0.01" value="${escapeHtml(row.monthlySellingPrice || 0)}" />
      <button class="danger-btn" type="button" data-remove-guarding-staff="${index}">x</button>
    </div>
  `).join("");
}

function renderGuardingSimpleRows(target, rows, type, firstPlaceholder) {
  if (!target) return;
  target.innerHTML = rows.map((row, index) => `
    <div class="guarding-simple-row" data-guarding-${type}-row="${index}">
      <input data-guarding-${type}="${index}" data-field="${type === "equipment" ? "item" : "description"}" value="${escapeHtml(row.item || row.description || "")}" placeholder="${firstPlaceholder}" />
      ${type === "equipment" ? `<input data-guarding-${type}="${index}" data-field="quantity" type="number" min="0" step="1" value="${escapeHtml(row.quantity || 1)}" />` : `<span></span>`}
      <input data-guarding-${type}="${index}" data-field="monthlyCost" type="number" min="0" step="0.01" value="${escapeHtml(row.monthlyCost || 0)}" placeholder="Monthly cost" />
      <input data-guarding-${type}="${index}" data-field="monthlySellingPrice" type="number" min="0" step="0.01" value="${escapeHtml(row.monthlySellingPrice || 0)}" placeholder="Monthly selling" />
      <button class="danger-btn" type="button" data-remove-guarding-${type}="${index}">x</button>
    </div>
  `).join("");
}

function guardingCatalogOptions() {
  return guardingSearchOptions()
    .map((item) => `<option value="${escapeHtml(guardingItemLabel(item))}"></option>`)
    .join("");
}

function renderGuardingLineItemRows() {
  if (!guardingLineItemRows) return;
  const rows = state.guarding.lineItems?.length ? state.guarding.lineItems : [];
  guardingLineItemRows.innerHTML = rows.map((row, index) => `
    <div class="guarding-price-row ${row.shiftType === "Night Shift" ? "guarding-night-row" : ""}" data-guarding-line-row="${index}" draggable="true">
      <div class="guarding-search-cell">
        <label class="mini-label">Guarding Item</label>
        <input data-guarding-line="${index}" data-field="catalogSearch" value="${escapeHtml(row.catalogSearch || "")}" placeholder="Search guarding item" list="guardingCatalogOptions-${index}" autocomplete="off" />
        <datalist id="guardingCatalogOptions-${index}">${guardingCatalogOptions()}</datalist>
      </div>
      <label class="mini-label">
        Shift Type
        <select data-guarding-line="${index}" data-field="shiftType" ${row.itemName ? "" : "disabled"}>
          <option value="">Select shift type</option>
          <option value="Day Shift" ${row.shiftType === "Day Shift" ? "selected" : ""}>Day Shift</option>
          <option value="Night Shift" ${row.shiftType === "Night Shift" ? "selected" : ""}>Night Shift</option>
        </select>
      </label>
      <label class="mini-label">
        Billing type
        <select data-guarding-line="${index}" data-field="billingType" ${row.itemName ? "" : "disabled"}>
          <option value="">Select billing type</option>
          ${guardingBillingOptionsForRow(row).map((billingType) => `<option value="${escapeHtml(billingType)}"${billingType === row.billingType ? " selected" : ""}>${escapeHtml(billingType)}</option>`).join("")}
        </select>
      </label>
      <div class="guarding-detail-stack">
        <input data-guarding-line="${index}" data-field="unitType" value="${escapeHtml(row.unitType || "")}" placeholder="Unit type" />
        <textarea data-guarding-line="${index}" data-field="unitNotes" placeholder="Unit / notes">${escapeHtml(row.unitNotes || guardingUnitNotesText(row))}</textarea>
        <input data-guarding-line="${index}" data-field="serviceDate" type="date" value="${escapeHtml(row.serviceDate || todayInputValue())}" />
        <input data-guarding-line="${index}" data-field="serviceMonth" type="month" value="${escapeHtml(row.serviceMonth || todayInputValue().slice(0, 7))}" />
        <textarea data-guarding-line="${index}" data-field="scheduleText" placeholder="Schedule wording">${escapeHtml(row.scheduleText || guardingScheduleText(row, { quoteDate: guardingFields.quoteDate?.value || todayInputValue() }))}</textarea>
      </div>
      <textarea class="guarding-large-textarea" data-guarding-line="${index}" data-field="experience" placeholder="Experience / training">${escapeHtml(row.experience || "")}</textarea>
      <textarea class="guarding-large-textarea" data-guarding-line="${index}" data-field="duties" placeholder="Equipment and duties">${escapeHtml(row.duties || "")}</textarea>
      <input data-guarding-line="${index}" data-field="rate" type="number" min="0" step="0.01" value="${escapeHtml(row.rate || 0)}" />
      <input data-guarding-line="${index}" data-field="quantity" type="number" min="0" step="1" value="${escapeHtml(row.quantity || 1)}" />
      <div class="guarding-line-actions">
        <small>Line Item Total</small>
        <strong class="guarding-line-total">${money.format(guardingLineItemTotal(row))}</strong>
        <div class="reorder-actions">
          <button class="secondary-btn small-btn" type="button" data-move-guarding-line-up="${index}" ${index === 0 ? "disabled" : ""}>Move up</button>
          <button class="secondary-btn small-btn" type="button" data-move-guarding-line-down="${index}" ${index === rows.length - 1 ? "disabled" : ""}>Move down</button>
        </div>
        ${isAdminMember() && row.catalogId ? `<button class="secondary-btn small-btn" type="button" data-update-guarding-master="${index}">Update master price list</button>` : ""}
      </div>
      <button class="danger-btn" type="button" data-remove-guarding-line="${index}">x</button>
    </div>
  `).join("") || `<p class="empty-state">Add a guarding price list item to start the quotation.</p>`;
}

function renderGuardingRequestDocuments(request) {
  const files = request?.files || [];
  if (!guardingRequestDocumentsPanel || !guardingRequestDocumentsList) return;
  guardingRequestDocumentsPanel.hidden = !request || !files.length;
  guardingRequestDocumentsList.innerHTML = files.map((file) => `
    <span>
      <strong>${escapeHtml(file.file_name || file.name || "Document")}</strong>
      <small>${escapeHtml(file.file_type || file.mime_type || file.type || "Unknown file type")} | ${escapeHtml(formatFileSize(file.file_size || file.size || 0))}</small>
    </span>
    <div>
      <button class="secondary-btn" type="button" data-view-request-file="${escapeHtml(file.id || file.fileId || "")}">View</button>
      <button class="secondary-btn" type="button" data-download-request-file="${escapeHtml(file.id || file.fileId || "")}">Download</button>
    </div>
  `).join("");
}

function renderGuardingPreview() {
  if (!guardingFields.company) return;
  const pricing = guardingPricingValues();
  document.querySelector("#guardingTotalCost").textContent = money.format(pricing.monthlyCost);
  document.querySelector("#guardingMarkup").textContent = `${pricing.markupPercent.toFixed(2)}%`;
  document.querySelector("#guardingTotalSelling").textContent = money.format(pricing.monthlySelling);
  document.querySelector("#guardingGrossProfit").textContent = `${pricing.grossProfitPercent.toFixed(2)}%`;
  document.querySelector("#guardingAnnualValue").textContent = money.format(roundCurrency(pricing.monthlySelling * (1 + state.taxRate)));
  document.querySelector("#guardingPreview").innerHTML = guardingQuotationDocumentHtml(guardingPayload("Draft"), { preview: true });
}

function renderGuardingBuilder() {
  syncGuardingDerivedFields();
  renderGuardingLineItemRows();
  renderGuardingPreview();
}

function resetGuardingQuote(reserveNumber = true) {
  Object.values(guardingFields).forEach((field) => {
    if (!field) return;
    if (field.tagName === "SELECT") field.value = "";
    else field.value = "";
  });
  guardingFields.quoteDate.value = todayInputValue();
  guardingFields.quoteNumber.value = reserveNumber ? reserveQuoteNumber(todayInputValue()) : "";
  state.guarding.activeSalesRequestId = "";
  state.guarding.staffing = [];
  state.guarding.equipment = [];
  state.guarding.additionalCosts = [];
  state.guarding.lineItems = [defaultGuardingLineItem()];
  renderGuardingRequestDocuments(null);
  if (guardingRequestSummaryPanel) guardingRequestSummaryPanel.hidden = true;
  renderGuardingBuilder();
}

function guardingPayload(status = "Submitted for approval") {
  syncGuardingDerivedFields();
  const pricing = guardingPricingValues();
  const lineItems = (state.guarding.lineItems || []).filter((row) => row.itemName || row.description || row.catalogId).map((row) => ({ ...row, lineTotal: guardingLineItemTotal(row) }));
  const derivedStaffing = lineItems.map((row) => ({
    position: guardingLineItemLabel(row),
    grade: row.unitType,
    quantity: Number(row.quantity || 0),
    dayShiftQuantity: 0,
    nightShiftQuantity: 0,
    hoursPerShift: 0,
    daysPerMonth: row.cadence === "Daily" ? 1 : 30,
    monthlyCost: Number(row.rate || 0),
    monthlySellingPrice: Number(row.rate || 0),
    schedule: row.schedule || "",
    experience: row.experience || "",
    duties: row.duties || "",
  }));
  return {
    id: `${guardingFields.quoteNumber.value || "guarding"}-${Date.now()}`,
    quotationType: "Guarding Quotation",
    status,
    approvalStatus: status,
    workflowStatus: status,
    submittedAt: new Date().toISOString(),
    createdBy: currentUser(),
    createdByName: currentUserName(),
    submittedBy: currentUser(),
    submittedByName: currentUserName(),
    sales_request_id: state.guarding.activeSalesRequestId || "",
    selectedCompany: guardingFields.company.value,
    clientName: guardingFields.clientName.value,
    clientAddress: guardingFields.siteAddress.value,
    contactPerson: guardingFields.contactPerson.value,
    contactEmail: guardingFields.email.value,
    contactNumber: guardingFields.contactNumber.value,
    quoteNumber: guardingFields.quoteNumber.value,
    quoteDate: guardingFields.quoteDate.value,
    salesRep: guardingFields.salesRep.value,
    guardingDetails: Object.fromEntries(Object.entries(guardingFields).map(([key, field]) => [key, field?.value || ""])),
    guardingLineItems: lineItems,
    guardingStaffing: derivedStaffing,
    guardingEquipment: state.guarding.equipment.map((row) => ({ ...row })),
    guardingAdditionalCosts: state.guarding.additionalCosts.map((row) => ({ ...row })),
    guardingPricing: pricing,
    monthlyValue: pricing.monthlySelling,
    annualValue: pricing.annualValue,
    supplierQuotes: [],
    items: [],
    revisionHistory: [],
  };
}

function validateGuardingQuote() {
  const required = [
    [guardingFields.company, "Quoting company"],
    [guardingFields.clientName, "Client name"],
    [guardingFields.contactPerson, "Contact person"],
    [guardingFields.contactNumber, "Contact number"],
    [guardingFields.email, "Email address"],
    [guardingFields.siteAddress, "Site address"],
    [guardingFields.province, "Province"],
    [guardingFields.industry, "Industry type"],
    [guardingFields.salesRep, "Sales rep"],
  ];
  const missing = required.filter(([field]) => !String(field?.value || "").trim());
  if (missing.length) {
    alert(`Please complete: ${missing.map(([, label]) => label).join(", ")}`);
    missing[0][0]?.focus();
    return false;
  }
  const completeLineItems = (state.guarding.lineItems || []).filter((row) => (row.itemName || row.description || row.catalogId) && Number(row.quantity || 0) > 0 && Number(row.rate || 0) >= 0);
  if (!completeLineItems.length || guardingPricingValues().monthlySelling <= 0) {
    alert("Please add at least one guarding price list item before submitting the guarding quotation.");
    return false;
  }
  return true;
}

function submitGuardingQuoteForApproval() {
  if (!enforceAccess("guardingBuilder") || !validateGuardingQuote()) return;
  const payload = guardingPayload("Submitted for Approval");
  saveApprovals([payload, ...loadApprovals()]);
  if (state.guarding.activeSalesRequestId) {
    updateSalesRequest(state.guarding.activeSalesRequestId, {
      status: "Submitted for Approval",
      linked_quotation_id: payload.id,
      submitted_for_approval_at: new Date().toISOString(),
    });
  }
  writeAudit("Guarding quotation built", payload.quoteNumber, "Building Guarding Quotation", payload.quoteNumber, payload.clientName);
  writeAudit("Submitted for approval", `${payload.quoteNumber} for ${payload.clientName}`, "Building Guarding Quotation", payload.quoteNumber, "Guarding Quotation");
  alert("Guarding quotation submitted for approval.");
  resetGuardingQuote();
  renderApprovals();
}

function createGuardingQuotationFromRequest(id) {
  const request = loadSalesRequests().find((item) => item.id === id);
  if (!request) return;
  resetGuardingQuote();
  state.guarding.activeSalesRequestId = request.id;
  state.activeSalesRequestId = request.id;
  guardingFields.clientName.value = request.client_name || "";
  guardingFields.contactPerson.value = request.client_contact_person || "";
  guardingFields.email.value = request.client_email || "";
  guardingFields.contactNumber.value = request.client_phone || "";
  guardingFields.siteName.value = request.site_project_name || "";
  guardingFields.siteAddress.value = request.site_address || "";
  guardingFields.province.value = request.province || "";
  guardingFields.industry.value = request.industry_type || "";
  if (guardingFields.serviceType) guardingFields.serviceType.value = request.required_service_type || request.description_of_work || "";
  if (guardingFields.startDate) guardingFields.startDate.value = request.contract_start_date || "";
  if (guardingFields.duration) guardingFields.duration.value = request.contract_duration || "";
  if (guardingFields.dayShift) guardingFields.dayShift.value = request.day_shift_required || "Yes";
  if (guardingFields.nightShift) guardingFields.nightShift.value = request.night_shift_required || "No";
  if (guardingFields.guardCount) guardingFields.guardCount.value = request.number_of_guards_required || "";
  if (guardingFields.supervisor) guardingFields.supervisor.value = request.supervisor_required || "No";
  if (guardingFields.armed) guardingFields.armed.value = request.armed_guards_required || "No";
  if (guardingFields.controlRoom) guardingFields.controlRoom.value = request.control_room_required || "No";
  if (guardingFields.patrols) guardingFields.patrols.value = request.patrols_required || "No";
  if (guardingFields.equipmentRequired) guardingFields.equipmentRequired.value = request.equipment_required || "";
  if (guardingFields.specialInstructions) guardingFields.specialInstructions.value = request.special_site_instructions || "";
  if (guardingFields.builderNotes) guardingFields.builderNotes.value = request.notes_for_builder || "";
  state.guarding.lineItems = [defaultGuardingLineItem()];
  const rep = salesRepsList().find((item) => normalizeEmail(item.email) === normalizeEmail(request.sales_rep_email));
  if (rep) guardingFields.salesRep.value = rep.id;
  updateSalesRequest(id, { linked_quotation_id: guardingFields.quoteNumber.value });
  renderGuardingRequestDocuments(request);
  if (guardingRequestSummaryPanel && guardingRequestSummary) {
    guardingRequestSummaryPanel.hidden = false;
    guardingRequestSummary.innerHTML = salesRequestSummaryHtml(request);
  }
  renderGuardingBuilder();
  writeAudit("User redirected to guarding quotation builder", request.request_number, "Sales Quotation Requests", request.request_number, currentUserName());
  showSection("guardingBuilder");
  const params = new URLSearchParams(window.location.search);
  params.set("salesRequestId", id);
  window.history.pushState({}, document.title, `${window.location.pathname}?${params.toString()}#guardingBuilder`);
}

function populateArmedResponseCompanyOptions() {
  if (!armedResponseFields.company) return;
  armedResponseFields.company.innerHTML = `<option value="">Select quoting company</option>`;
  Object.entries(companies).forEach(([id, company]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = company.name;
    armedResponseFields.company.appendChild(option);
  });
}

function armedResponsePricingValues() {
  const siteCount = Math.max(1, Number(armedResponseFields.packageSiteCount?.value || armedResponseFields.siteCount?.value || 1));
  const perSiteSelling = Number(armedResponseFields.monthlyPerSite?.value || 0);
  const packageSelling = siteCount * perSiteSelling;
  const serviceCost = state.armed.additionalServices.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.monthlyCost || 0), 0);
  const serviceSelling = state.armed.additionalServices.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0), 0);
  const onceOffCost = state.armed.onceOffCharges.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.onceOffCost || 0), 0);
  const onceOffSelling = state.armed.onceOffCharges.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.onceOffSellingPrice || 0), 0);
  const monthlyCost = roundCurrency(serviceCost);
  const monthlySelling = roundCurrency(packageSelling + serviceSelling);
  const grossProfit = roundCurrency(monthlySelling - monthlyCost);
  const grossProfitPercent = monthlySelling ? roundCurrency((grossProfit / monthlySelling) * 100) : 0;
  const markupPercent = monthlyCost ? roundCurrency(((monthlySelling - monthlyCost) / monthlyCost) * 100) : Number(armedResponseFields.markupPercent?.value || 0);
  return {
    monthlyCost,
    monthlySelling,
    markupPercent,
    grossProfit,
    grossProfitPercent,
    onceOffCost: roundCurrency(onceOffCost),
    onceOffSelling: roundCurrency(onceOffSelling),
    annualValue: roundCurrency(monthlySelling * 12),
    totalMonthlySellingPerSite: roundCurrency(perSiteSelling),
  };
}

function renderArmedResponseRows(target, rows, type) {
  if (!target) return;
  target.innerHTML = rows.map((row, index) => {
    const descriptionField = type === "service" ? "description" : "item";
    const costField = type === "service" ? "monthlyCost" : "onceOffCost";
    const sellingField = type === "service" ? "monthlySellingPrice" : "onceOffSellingPrice";
    return `
      <div class="guarding-simple-row armed-response-row" data-armed-response-${type}-row="${index}">
        <input data-armed-response-${type}="${index}" data-field="${descriptionField}" value="${escapeHtml(row[descriptionField] || "")}" placeholder="${type === "service" ? "Service description" : "Item description"}" />
        <input data-armed-response-${type}="${index}" data-field="quantity" type="number" min="0" step="1" value="${escapeHtml(row.quantity || 1)}" />
        <input data-armed-response-${type}="${index}" data-field="${costField}" type="number" min="0" step="0.01" value="${escapeHtml(row[costField] || 0)}" placeholder="${type === "service" ? "Monthly cost" : "Once-off cost"}" />
        <input data-armed-response-${type}="${index}" data-field="${sellingField}" type="number" min="0" step="0.01" value="${escapeHtml(row[sellingField] || 0)}" placeholder="${type === "service" ? "Monthly selling" : "Once-off selling"}" />
        <button class="danger-btn" type="button" data-remove-armed-response-${type}="${index}">x</button>
      </div>
    `;
  }).join("");
}

function renderArmedResponseRequestDocuments(request) {
  const files = request?.files || [];
  if (!armedResponseRequestDocumentsPanel || !armedResponseRequestDocumentsList) return;
  armedResponseRequestDocumentsPanel.hidden = !request || !files.length;
  armedResponseRequestDocumentsList.innerHTML = files.map((file) => `
    <span>
      <strong>${escapeHtml(file.file_name || file.name || "Document")}</strong>
      <small>${escapeHtml(file.file_type || file.mime_type || file.type || "Unknown file type")} | ${escapeHtml(formatFileSize(file.file_size || file.size || 0))}</small>
    </span>
    <div>
      <button class="secondary-btn" type="button" data-view-request-file="${escapeHtml(file.id || file.fileId || "")}">View</button>
      <button class="secondary-btn" type="button" data-download-request-file="${escapeHtml(file.id || file.fileId || "")}">Download</button>
    </div>
  `).join("");
}

function renderArmedResponsePreview() {
  if (!armedResponseFields.company) return;
  const company = companies[armedResponseFields.company.value];
  const salesRep = salesReps[armedResponseFields.salesRep.value];
  const pricing = armedResponsePricingValues();
  document.querySelector("#armedResponsePreviewCompany").textContent = company?.name || "Select quoting company";
  document.querySelector("#armedResponsePreviewReg").textContent = company ? `Reg no: ${company.registration} | VAT No: ${company.vat}` : "Reg no: - | VAT No: -";
  document.querySelector("#armedResponsePreviewQuoteNumber").textContent = armedResponseFields.quoteNumber.value || "Draft";
  document.querySelector("#armedResponsePreviewClient").textContent = [armedResponseFields.clientName.value || "No client yet", armedResponseFields.email.value].filter(Boolean).join("\n");
  document.querySelector("#armedResponsePreviewSite").textContent = [armedResponseFields.siteName.value || "No site yet", armedResponseFields.siteAddress.value, armedResponseFields.area.value, armedResponseFields.province.value].filter(Boolean).join("\n");
  document.querySelector("#armedResponsePreviewRep").textContent = [salesRep?.name || "No sales rep selected", salesRep?.email, salesRep?.phone].filter(Boolean).join("\n");
  document.querySelector("#armedResponsePreviewDate").textContent = formatDate(armedResponseFields.quoteDate.value);
  document.querySelector("#armedResponsePreviewScope").textContent = [
    armedResponseFields.packageName.value || "Monthly armed response services",
    `Sites covered: ${armedResponseFields.packageSiteCount.value || armedResponseFields.siteCount.value || 1}`,
    `Alarm monitoring: ${armedResponseFields.alarmMonitoring.value}`,
    `Armed response: ${armedResponseFields.armedRequired.value}`,
    `Key holding: ${armedResponseFields.keyHolding.value}`,
    armedResponseFields.specialInstructions.value,
  ].filter(Boolean).join(" | ");
  document.querySelector("#armedResponsePreviewServices").innerHTML = `
    <div class="quotation-table-header"><span>Service</span><span>Qty</span><span>Included</span><span>Monthly Selling</span></div>
    ${state.armed.additionalServices.map((row) => `<div class="quotation-table-row"><span>${escapeHtml(row.description || "-")}</span><span>${escapeHtml(row.quantity || 0)}</span><span>Yes</span><strong>${money.format(Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0))}</strong></div>`).join("") || `<div class="quotation-table-row"><span>${escapeHtml(armedResponseFields.packageName.value || "Package")}</span><span>${escapeHtml(armedResponseFields.packageSiteCount.value || armedResponseFields.siteCount.value || 1)}</span><span>Yes</span><strong>${money.format(pricing.monthlySelling)}</strong></div>`}
  `;
  document.querySelector("#armedResponsePreviewCharges").innerHTML = `
    <div class="quotation-table-header"><span>Equipment / Once-off</span><span>Qty</span><span>Type</span><span>Selling</span></div>
    ${state.armed.onceOffCharges.map((row) => `<div class="quotation-table-row"><span>${escapeHtml(row.item || "-")}</span><span>${escapeHtml(row.quantity || 0)}</span><span>Once-off</span><strong>${money.format(Number(row.quantity || 0) * Number(row.onceOffSellingPrice || 0))}</strong></div>`).join("") || `<div class="quotation-table-row"><span>-</span><span>No once-off charges</span><span>-</span><strong>-</strong></div>`}
  `;
  document.querySelector("#armedResponseTotalCost").textContent = money.format(pricing.monthlyCost);
  document.querySelector("#armedResponseTotalSelling").textContent = money.format(pricing.monthlySelling);
  document.querySelector("#armedResponseMarkupDisplay").textContent = `${pricing.markupPercent.toFixed(2)}%`;
  document.querySelector("#armedResponseGrossProfit").textContent = `${pricing.grossProfitPercent.toFixed(2)}%`;
  document.querySelector("#armedResponseOnceOffCost").textContent = money.format(pricing.onceOffCost);
  document.querySelector("#armedResponseOnceOffSelling").textContent = money.format(pricing.onceOffSelling);
  document.querySelector("#armedResponseAnnualValue").textContent = money.format(pricing.annualValue);
  document.querySelector("#armedResponsePreviewMonthly").textContent = money.format(pricing.monthlySelling);
  document.querySelector("#armedResponsePreviewOnceOff").textContent = money.format(pricing.onceOffSelling);
  document.querySelector("#armedResponsePreviewAnnual").textContent = money.format(pricing.annualValue);
}

function renderArmedResponseBuilder() {
  renderArmedResponseRows(armedResponseServiceRows, state.armed.additionalServices, "service");
  renderArmedResponseRows(armedResponseChargeRows, state.armed.onceOffCharges, "charge");
  renderArmedResponsePreview();
}

function resetArmedResponseQuote(reserveNumber = true) {
  Object.values(armedResponseFields).forEach((field) => {
    if (!field) return;
    if (field.tagName === "SELECT") field.value = "";
    else field.value = "";
  });
  armedResponseFields.quoteDate.value = todayInputValue();
  armedResponseFields.quoteNumber.value = reserveNumber ? reserveQuoteNumber(todayInputValue()) : "";
  armedResponseFields.siteCount.value = 1;
  armedResponseFields.packageSiteCount.value = 1;
  armedResponseFields.markupPercent.value = 20;
  state.armed.activeSalesRequestId = "";
  state.armed.additionalServices = [];
  state.armed.onceOffCharges = [];
  renderArmedResponseRequestDocuments(null);
  if (armedResponseRequestSummaryPanel) armedResponseRequestSummaryPanel.hidden = true;
  renderArmedResponseBuilder();
}

function armedResponsePayload(status = "Submitted for approval") {
  const pricing = armedResponsePricingValues();
  return {
    id: `${armedResponseFields.quoteNumber.value || "armed-response"}-${Date.now()}`,
    quotationType: "Monthly Armed Response Quotation",
    status,
    approvalStatus: status,
    workflowStatus: status,
    submittedAt: new Date().toISOString(),
    createdBy: currentUser(),
    createdByName: currentUserName(),
    submittedBy: currentUser(),
    submittedByName: currentUserName(),
    sales_request_id: state.armed.activeSalesRequestId || "",
    selectedCompany: armedResponseFields.company.value,
    clientName: armedResponseFields.clientName.value,
    clientAddress: armedResponseFields.siteAddress.value,
    contactPerson: armedResponseFields.contactPerson.value,
    contactEmail: armedResponseFields.email.value,
    contactNumber: armedResponseFields.contactNumber.value,
    quoteNumber: armedResponseFields.quoteNumber.value,
    quoteDate: armedResponseFields.quoteDate.value,
    salesRep: armedResponseFields.salesRep.value,
    armedResponseDetails: Object.fromEntries(Object.entries(armedResponseFields).map(([key, field]) => [key, field?.value || ""])),
    armedResponseServices: state.armed.additionalServices.map((row) => ({ ...row })),
    armedResponseOnceOffCharges: state.armed.onceOffCharges.map((row) => ({ ...row })),
    armedResponsePricing: pricing,
    monthlyValue: pricing.monthlySelling,
    onceOffValue: pricing.onceOffSelling,
    annualValue: pricing.annualValue,
    supplierQuotes: [],
    items: [],
    revisionHistory: [],
  };
}

function validateArmedResponseQuote() {
  const required = [
    [armedResponseFields.company, "Quoting company"],
    [armedResponseFields.clientName, "Client name"],
    [armedResponseFields.contactPerson, "Contact person"],
    [armedResponseFields.contactNumber, "Contact number"],
    [armedResponseFields.email, "Email address"],
    [armedResponseFields.siteAddress, "Site address"],
    [armedResponseFields.province, "Province"],
    [armedResponseFields.area, "Area / suburb"],
    [armedResponseFields.industry, "Industry type"],
    [armedResponseFields.siteCount, "Number of sites"],
    [armedResponseFields.startDate, "Contract start date"],
    [armedResponseFields.duration, "Contract duration"],
    [armedResponseFields.salesRep, "Sales rep"],
    [armedResponseFields.packageName, "Package name"],
    [armedResponseFields.monthlyPerSite, "Monthly selling price per site"],
  ];
  const missing = required.filter(([field]) => !String(field?.value || "").trim());
  if (missing.length) {
    alert(`Please complete: ${missing.map(([, label]) => label).join(", ")}`);
    missing[0][0]?.focus();
    return false;
  }
  if (armedResponsePricingValues().monthlySelling <= 0) {
    alert("Please add a monthly selling price before submitting the armed response quotation.");
    return false;
  }
  return true;
}

function submitArmedResponseQuoteForApproval() {
  if (!enforceAccess("armedResponseBuilder") || !validateArmedResponseQuote()) return;
  const payload = armedResponsePayload("Submitted for Approval");
  saveApprovals([payload, ...loadApprovals()]);
  if (state.armed.activeSalesRequestId) {
    updateSalesRequest(state.armed.activeSalesRequestId, {
      status: "Submitted for Approval",
      linked_quotation_id: payload.id,
      submitted_for_approval_at: new Date().toISOString(),
    });
  }
  writeAudit("Armed response quotation built", payload.quoteNumber, "Building Armed Response Quotation", payload.quoteNumber, payload.clientName);
  writeAudit("Submitted for approval", `${payload.quoteNumber} for ${payload.clientName}`, "Building Armed Response Quotation", payload.quoteNumber, "Monthly Armed Response Quotation");
  alert("Monthly armed response quotation submitted for approval.");
  resetArmedResponseQuote();
  renderApprovals();
}

function createArmedResponseQuotationFromRequest(id) {
  const request = loadSalesRequests().find((item) => item.id === id);
  if (!request) return;
  resetArmedResponseQuote();
  state.armed.activeSalesRequestId = request.id;
  state.activeSalesRequestId = request.id;
  armedResponseFields.clientName.value = request.client_name || "";
  armedResponseFields.contactPerson.value = request.client_contact_person || "";
  armedResponseFields.email.value = request.client_email || "";
  armedResponseFields.contactNumber.value = request.client_phone || "";
  armedResponseFields.siteName.value = request.site_project_name || "";
  armedResponseFields.siteAddress.value = request.site_address || "";
  armedResponseFields.province.value = request.province || "";
  armedResponseFields.area.value = request.area_suburb || "";
  armedResponseFields.industry.value = request.industry_type || "";
  armedResponseFields.siteCount.value = request.number_of_sites || 1;
  armedResponseFields.packageSiteCount.value = request.number_of_sites || 1;
  armedResponseFields.existingAlarm.value = request.existing_alarm_system || "Yes";
  armedResponseFields.alarmMonitoring.value = request.alarm_monitoring_required || "Yes";
  armedResponseFields.armedRequired.value = request.armed_response_required || "Yes";
  armedResponseFields.keyHolding.value = request.key_holding_required || "No";
  armedResponseFields.openingClosing.value = request.opening_closing_required || "No";
  armedResponseFields.patrolService.value = request.patrol_service_required || "No";
  armedResponseFields.panicButton.value = request.panic_button_required || "No";
  armedResponseFields.medical.value = request.medical_response_required || "No";
  armedResponseFields.fire.value = request.fire_response_required || "No";
  armedResponseFields.startDate.value = request.contract_start_date || "";
  armedResponseFields.duration.value = request.contract_duration || "";
  armedResponseFields.specialInstructions.value = request.special_site_instructions || "";
  armedResponseFields.builderNotes.value = request.notes_for_builder || "";
  armedResponseFields.packageName.value = request.alarm_monitoring_required === "Yes" ? "Armed Response with Monitoring" : "Standard Armed Response";
  armedResponseFields.packageDescription.value = request.description_of_work || "";
  const rep = salesRepsList().find((item) => normalizeEmail(item.email) === normalizeEmail(request.sales_rep_email));
  if (rep) armedResponseFields.salesRep.value = rep.id;
  updateSalesRequest(id, { linked_quotation_id: armedResponseFields.quoteNumber.value });
  renderArmedResponseRequestDocuments(request);
  if (armedResponseRequestSummaryPanel && armedResponseRequestSummary) {
    armedResponseRequestSummaryPanel.hidden = false;
    armedResponseRequestSummary.innerHTML = salesRequestSummaryHtml(request);
  }
  renderArmedResponseBuilder();
  writeAudit("User redirected to armed response quotation builder", request.request_number, "Sales Quotation Requests", request.request_number, currentUserName());
  showSection("armedResponseBuilder");
  const params = new URLSearchParams(window.location.search);
  params.set("salesRequestId", id);
  window.history.pushState({}, document.title, `${window.location.pathname}?${params.toString()}#armedResponseBuilder`);
}

function canProcessSalesRequest(request) {
  if (!hasPermission("build_quotation") && !hasPermission("approval")) return false;
  if (!["New Request", "Accepted for Processing", "Rejected / Needs Changes"].includes(salesRequestStatusLabel(request.status))) return false;
  return !request.accepted_by_user_id || request.accepted_by_user_id === currentUser() || ["Admin", "Super Admin"].includes(currentMember().access);
}

function salesRequestsForCurrentUser() {
  const requests = loadSalesRequests();
  if (hasPermission("approval") || hasPermission("build_quotation") || ["Admin", "Super Admin"].includes(currentMember().access)) return requests;
  const email = normalizeEmail(currentUser());
  return requests.filter((request) => normalizeEmail(request.sales_rep_email) === email || normalizeEmail(request.submitted_by_user_id) === email);
}

function filteredSalesRequests() {
  const filters = state.salesRequestFilters;
  return salesRequestsForCurrentUser().filter((request) => {
    const statusMatch = filters.status === "All" || salesRequestStatusLabel(request.status) === filters.status;
    const repMatch = !filters.salesRep || String(request.sales_rep_name || "").toLowerCase().includes(filters.salesRep.toLowerCase());
    const clientMatch = !filters.clientName || String(request.client_name || "").toLowerCase().includes(filters.clientName.toLowerCase());
    const dateMatch = !filters.submittedDate || String(request.created_at || "").slice(0, 10) === filters.submittedDate;
    const typeMatch = filters.quotationType === "All" || String(request.quotation_type || "Technical Quotation") === filters.quotationType;
    return statusMatch && repMatch && clientMatch && dateMatch && typeMatch;
  });
}

function salesRequestFilterOptions(requests, field, fallback = "") {
  return Array.from(new Set(requests.map((request) => request[field] || fallback).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
}

function renderSalesRequests() {
  if (!canAccess("salesRequests")) return;
  autoPopulateRequestSalesRep();
  renderSalesRequestBadge();
  const allRequests = salesRequestsForCurrentUser().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const requests = filteredSalesRequests().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const unreadCount = newSalesRequestBadgeCount();
  const reps = salesRequestFilterOptions(allRequests, "sales_rep_name");
  const quotationTypes = salesRequestFilterOptions(allRequests, "quotation_type", "Technical Quotation");
  salesRequestList.innerHTML = "";

  salesRequestList.innerHTML = `
    ${unreadCount ? `<div class="request-alert">New sales quotation request submitted <strong>${unreadCount}</strong></div>` : ""}
    <div class="approval-filterbar request-filterbar">
      <label>
        Status
        <select data-request-filter="status">
          <option value="All"${state.salesRequestFilters.status === "All" ? " selected" : ""}>All statuses</option>
          ${salesRequestStatusFlow.map((status) => `<option value="${escapeHtml(status)}"${state.salesRequestFilters.status === status ? " selected" : ""}>${escapeHtml(status)}</option>`).join("")}
        </select>
      </label>
      <label>
        Sales rep
        <input data-request-filter="salesRep" type="search" list="salesRequestRepFilterOptions" value="${escapeHtml(state.salesRequestFilters.salesRep)}" placeholder="Search sales rep" />
        <datalist id="salesRequestRepFilterOptions">${reps.map((rep) => `<option value="${escapeHtml(rep)}"></option>`).join("")}</datalist>
      </label>
      <label>
        Client name
        <input data-request-filter="clientName" type="search" value="${escapeHtml(state.salesRequestFilters.clientName)}" placeholder="Search client" />
      </label>
      <label>
        Date submitted
        <input data-request-filter="submittedDate" type="date" value="${escapeHtml(state.salesRequestFilters.submittedDate)}" />
      </label>
      <label>
        Quotation type
        <select data-request-filter="quotationType">
          <option value="All"${state.salesRequestFilters.quotationType === "All" ? " selected" : ""}>All types</option>
          ${quotationTypes.map((type) => `<option value="${escapeHtml(type)}"${state.salesRequestFilters.quotationType === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
        </select>
      </label>
      <button class="secondary-btn" type="button" data-clear-request-filters>Clear filters</button>
    </div>
    ${!requests.length ? `<p class="empty-state">No sales quotation requests match the selected filters.</p>` : `
    <div class="approval-table request-table" role="table" aria-label="Sales quotation requests">
      <div class="approval-table-header" role="row">
        <span>Request number</span>
        <span>Date submitted</span>
        <span>Sales rep</span>
        <span>Client name</span>
        <span>Site/project</span>
        <span>Quotation type</span>
        <span>Status</span>
        <span>Documents</span>
        <span>Notes</span>
        <span>Assigned / accepted by</span>
        <span>Last updated</span>
        <span>Actions</span>
      </div>
      ${requests.map((request) => `
        <div class="approval-table-row ${isUnreadSalesRequest(request) ? "request-row-new" : ""}" role="row">
          <span><strong>${escapeHtml(request.request_number)}</strong>${isUnreadSalesRequest(request) ? `<small><mark class="status-badge status-info">New</mark></small>` : ""}</span>
          <span>${escapeHtml(formatDate((request.created_at || "").slice(0, 10)))}</span>
          <span><strong>${escapeHtml(request.sales_rep_name)}</strong><small>${escapeHtml([request.sales_rep_email, request.sales_rep_phone].filter(Boolean).join(" | "))}</small></span>
          <span>${escapeHtml(request.client_name)}</span>
          <span>${escapeHtml(request.site_project_name || "-")}</span>
          <span>${escapeHtml(request.quotation_type || "Technical Quotation")}</span>
          <span><mark class="${salesRequestStatusClass(request.status)}">${escapeHtml(salesRequestStatusLabel(request.status))}</mark></span>
          <span><button class="secondary-btn small-btn" type="button" data-view-request-docs="${escapeHtml(request.id)}">Docs (${(request.files || []).length})</button></span>
          <span>${escapeHtml(request.notes_for_builder || "-")}</span>
          <span>${escapeHtml(request.accepted_by_name || "-")}</span>
          <span>${escapeHtml(request.updated_at ? new Date(request.updated_at).toLocaleString("en-ZA") : "-")}</span>
          <span class="approval-row-actions">
            ${isUnreadSalesRequest(request) ? `<button class="secondary-btn small-btn" type="button" data-mark-request-viewed="${escapeHtml(request.id)}">Mark viewed</button>` : ""}
            ${canProcessSalesRequest(request) && !request.accepted_by_user_id ? `<button class="primary-btn" type="button" data-accept-request="${escapeHtml(request.id)}">Accept Request</button>` : ""}
            ${salesRequestStatusLabel(request.status) === "Accepted for Processing" && request.accepted_by_user_id === currentUser() ? `<button class="secondary-btn" type="button" data-create-quote-request="${escapeHtml(request.id)}">Create Quotation from Request</button>` : ""}
          </span>
        </div>
      `).join("")}
    </div>`}
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
  renderSalesRequestBadge();
  return updatedRequest || requests.find((request) => request.id === id);
}

function createQuotationFromRequest(id) {
  const request = loadSalesRequests().find((item) => item.id === id);
  if (!request) return;
  if (request.quotation_type === "Guarding Quotation") {
    createGuardingQuotationFromRequest(id);
    return;
  }
  if (request.quotation_type === "Monthly Armed Response Quotation") {
    createArmedResponseQuotationFromRequest(id);
    return;
  }
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

function loadGuardingQuoteIntoBuilder(quote) {
  resetGuardingQuote();
  state.revisingQuoteId = quote.id;
  state.revisionSourceId = quote.id;
  state.revisionNumber = Number(quote.revisionNumber || 0) + 1;
  state.guarding.activeSalesRequestId = quote.sales_request_id || "";
  const details = quote.guardingDetails || {};
  Object.entries(guardingFields).forEach(([key, field]) => {
    if (!field) return;
    field.value = details[key] || "";
  });
  guardingFields.company.value = quote.selectedCompany || "";
  guardingFields.clientName.value = quote.clientName || "";
  guardingFields.contactPerson.value = quote.contactPerson || "";
  guardingFields.email.value = quote.contactEmail || "";
  guardingFields.contactNumber.value = quote.contactNumber || "";
  guardingFields.siteAddress.value = quote.clientAddress || "";
  guardingFields.quoteNumber.value = quote.quoteNumber || reserveQuoteNumber(todayInputValue());
  guardingFields.quoteDate.value = todayInputValue();
  guardingFields.salesRep.value = quote.salesRep || "";
  state.guarding.lineItems = quote.guardingLineItems?.length ? quote.guardingLineItems.map((row) => ({ ...row })) : guardingDisplayLineItems(quote).map((row) => ({
    catalogId: row.catalogId || "",
    description: row.description || row.position || "",
    unitType: row.unitType || row.grade || "",
    rate: Number(row.rate || row.monthlySellingPrice || 0),
    quantity: Number(row.quantity || 1),
    schedule: row.schedule || "",
    experience: row.experience || "",
    duties: row.duties || "",
    source: row.source || "",
  }));
  if (!state.guarding.lineItems.length) state.guarding.lineItems = [defaultGuardingLineItem()];
  state.guarding.staffing = quote.guardingStaffing?.length ? quote.guardingStaffing.map((row) => ({ ...row })) : [];
  state.guarding.equipment = quote.guardingEquipment?.map((row) => ({ ...row })) || [];
  state.guarding.additionalCosts = quote.guardingAdditionalCosts?.map((row) => ({ ...row })) || [];
  renderGuardingBuilder();
}

function loadArmedResponseQuoteIntoBuilder(quote) {
  resetArmedResponseQuote();
  state.revisingQuoteId = quote.id;
  state.revisionSourceId = quote.id;
  state.revisionNumber = Number(quote.revisionNumber || 0) + 1;
  state.armed.activeSalesRequestId = quote.sales_request_id || "";
  const details = quote.armedResponseDetails || {};
  Object.entries(armedResponseFields).forEach(([key, field]) => {
    if (!field) return;
    field.value = details[key] || "";
  });
  armedResponseFields.company.value = quote.selectedCompany || "";
  armedResponseFields.clientName.value = quote.clientName || "";
  armedResponseFields.contactPerson.value = quote.contactPerson || "";
  armedResponseFields.email.value = quote.contactEmail || "";
  armedResponseFields.contactNumber.value = quote.contactNumber || "";
  armedResponseFields.siteAddress.value = quote.clientAddress || "";
  armedResponseFields.quoteNumber.value = quote.quoteNumber || reserveQuoteNumber(todayInputValue());
  armedResponseFields.quoteDate.value = todayInputValue();
  armedResponseFields.salesRep.value = quote.salesRep || "";
  state.armed.additionalServices = quote.armedResponseServices?.map((row) => ({ ...row })) || [];
  state.armed.onceOffCharges = quote.armedResponseOnceOffCharges?.map((row) => ({ ...row })) || [];
  renderArmedResponseBuilder();
}

function reviseRejectedQuote(id) {
  const quote = loadApprovals().find((item) => item.id === id);
  if (!quote) return;
  if (!canReviseQuote(quote)) {
    alert("This quotation cannot be edited because it has already moved into a final client or converted status.");
    return;
  }

  if (quote.quotationType === "Guarding Quotation") {
    loadGuardingQuoteIntoBuilder(quote);
    writeAudit("Rejected quotation opened for revision", quote.quoteNumber, "Building Guarding Quotation", quote.quoteNumber, `Revision ${state.revisionNumber}`);
    state.selectedLibraryId = "";
    state.selectedApprovalId = "";
    showSection("guardingBuilder");
    window.location.hash = "guardingBuilder";
    return;
  }
  if (quote.quotationType === "Monthly Armed Response Quotation") {
    loadArmedResponseQuoteIntoBuilder(quote);
    writeAudit("Rejected armed response quotation opened for revision", quote.quoteNumber, "Building Armed Response Quotation", quote.quoteNumber, `Revision ${state.revisionNumber}`);
    state.selectedLibraryId = "";
    state.selectedApprovalId = "";
    showSection("armedResponseBuilder");
    window.location.hash = "armedResponseBuilder";
    return;
  }
  loadQuoteIntoBuilder(quote);
  writeAudit("Rejected quotation opened for revision", quote.quoteNumber, "Building Technical Quotation", quote.quoteNumber, `Revision ${state.revisionNumber}`);
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

const projectTimelineStages = [
  { key: "quotation_approved", label: "Quotation Approved", percent: 5 },
  { key: "client_accepted", label: "Client Accepted", percent: 10 },
  { key: "invoice_issued", label: "Invoice Issued", percent: 20 },
  { key: "deposit_requested", label: "Deposit Requested", percent: 25 },
  { key: "deposit_received", label: "Deposit Received", percent: 35 },
  { key: "stock_ordered", label: "Stock Ordered", percent: 50 },
  { key: "stock_received", label: "Stock Received", percent: 60 },
  { key: "installation_booked", label: "Installation Booked", percent: 75 },
  { key: "installation_completed", label: "Installation Completed", percent: 90 },
  { key: "final_invoice_issued", label: "Final Invoice Issued", percent: 95 },
  { key: "paid_in_full", label: "Paid In Full", percent: 100 },
  { key: "project_closed", label: "Project Closed", percent: 100 },
];

const timelineStageStatuses = ["Not started", "In progress", "Completed", "Overdue"];

function loadProjectTimelines() {
  try {
    return JSON.parse(localStorage.getItem(projectTimelineStorageKey) || "{}");
  } catch {
    localStorage.removeItem(projectTimelineStorageKey);
    return {};
  }
}

function saveProjectTimelines(timelines) {
  localStorage.setItem(projectTimelineStorageKey, JSON.stringify(timelines));
}

function timelineAcceptedDateForQuote(quote) {
  return quote.clientAcceptedAt || quote.acceptedAt || quote.convertedAt || quote.clientOutcomeDate || quote.updatedAt || "";
}

function timelineApprovedDateForQuote(quote) {
  return quote.approvedDate || quote.decidedAt || quote.submittedAt || quote.quoteDate || "";
}

function siteProjectNameForQuote(quote) {
  return quote.siteName || quote.projectName || quote.guardingDetails?.siteName || quote.armedResponseDetails?.siteName || quote.projectSummary || quote.clientAddress || "-";
}

function timelineRequestForQuote(quote) {
  if (!quote?.sales_request_id) return null;
  return loadSalesRequests().find((request) => request.id === quote.sales_request_id || request.linked_quotation_id === quote.id) || null;
}

function timelineQuoteLineItems(quote) {
  if (quote.quotationType === "Guarding Quotation") {
    return guardingDisplayLineItems(quote).map((row) => ({
      description: guardingLineItemLabel(row),
      detail: [row.shiftType, row.billingType, row.unitType].filter(Boolean).join(" | "),
      quantity: row.quantity,
      total: guardingLineItemTotal(row),
    }));
  }
  if (quote.quotationType === "Monthly Armed Response Quotation") {
    return [
      ...(quote.armedResponseServices || []).map((row) => ({
        description: row.description || "Armed response service",
        detail: "Monthly armed response",
        quantity: row.quantity,
        total: Number(row.monthlySellingPrice || 0) * Number(row.quantity || 0),
      })),
      ...(quote.armedResponseCharges || []).map((row) => ({
        description: row.item || "Once-off charge",
        detail: "Once-off",
        quantity: row.quantity,
        total: Number(row.onceOffSellingPrice || 0) * Number(row.quantity || 0),
      })),
    ];
  }
  return (quote.items || []).map((item) => ({
    description: item.description || item.stockCode || "Quotation item",
    detail: item.stockCode || "Technical quotation",
    quantity: item.quantity,
    total: quoteItemTotal(quote, item),
  }));
}

function timelineDepositAmount(quote) {
  const explicit = Number(quote.depositAmount || quote.depositValue || 0);
  if (explicit > 0) return roundCurrency(explicit);
  return roundCurrency(quoteTotalValue(quote) * 0.7);
}

function timelineOutstandingBalance(quote) {
  if (quote.paidInFull) return 0;
  const total = quoteTotalValue(quote);
  return roundCurrency(quote.depositReceived ? Math.max(total - timelineDepositAmount(quote), 0) : total);
}

function isTimelineEligibleQuote(quote) {
  const statuses = approvalStatusCandidates(quote).map(normalizedStatus);
  if (statuses.includes("client_declined") || statuses.includes("rejected") || quote.clientOutcome === "Rejected by client" || quote.rejectionSource === "client") return false;
  return isClientAccepted(quote) || statuses.some((status) => ["approved", "sent_to_client", "client_accepted"].includes(status));
}

function defaultTimelineForQuote(quote) {
  const approvedAt = timelineApprovedDateForQuote(quote) || new Date().toISOString();
  const acceptedAt = timelineAcceptedDateForQuote(quote);
  const timeline = {
    quoteId: quote.id,
    quoteNumber: quote.quoteNumber,
    responsibleMember: quote.responsibleMember || quote.approvedByName || quote.createdByName || salesRepNameForQuote(quote),
    stages: projectTimelineStages.reduce((acc, stage) => {
      const isApprovedStage = stage.key === "quotation_approved";
      const isAcceptedStage = stage.key === "client_accepted" && isClientAccepted(quote);
      acc[stage.key] = {
        status: isApprovedStage || isAcceptedStage ? "Completed" : "Not started",
        dateCompleted: isApprovedStage ? String(approvedAt).slice(0, 10) : isAcceptedStage ? String(acceptedAt).slice(0, 10) : "",
        notes: "",
        updatedBy: isApprovedStage ? (quote.approvedByName || quote.decidedByName || "System") : isAcceptedStage ? (quote.clientAcceptedByName || "System") : "",
        updatedAt: isApprovedStage ? new Date(approvedAt).toISOString() : isAcceptedStage ? new Date(acceptedAt).toISOString() : "",
      };
      return acc;
    }, {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (quote.depositReceived) {
    timeline.stages.deposit_received = {
      status: "Completed",
      dateCompleted: String(quote.depositReceivedAt || quote.updatedAt || new Date().toISOString()).slice(0, 10),
      notes: "Pulled through from Quote Library payment tracking.",
      updatedBy: quote.updatedByName || "System",
      updatedAt: quote.updatedAt || new Date().toISOString(),
    };
  }
  if (quote.paidInFull) {
    timeline.stages.paid_in_full = {
      status: "Completed",
      dateCompleted: String(quote.paidInFullAt || quote.updatedAt || new Date().toISOString()).slice(0, 10),
      notes: "Pulled through from Quote Library payment tracking.",
      updatedBy: quote.updatedByName || "System",
      updatedAt: quote.updatedAt || new Date().toISOString(),
    };
  }
  return timeline;
}

function timelineForQuote(quote) {
  const timelines = loadProjectTimelines();
  const existing = timelines[quote.id] || {};
  const base = defaultTimelineForQuote(quote);
  const merged = {
    ...base,
    ...existing,
    stages: { ...base.stages, ...(existing.stages || {}) },
  };
  projectTimelineStages.forEach((stage) => {
    merged.stages[stage.key] = {
      ...base.stages[stage.key],
      ...(existing.stages?.[stage.key] || {}),
    };
  });
  timelines[quote.id] = merged;
  saveProjectTimelines(timelines);
  return merged;
}

function timelineEligibleQuotes() {
  return loadApprovals().filter(isTimelineEligibleQuote);
}

function timelineStage(timeline, key) {
  return timeline.stages?.[key] || { status: "Not started", dateCompleted: "", notes: "", updatedBy: "", updatedAt: "" };
}

function timelineCurrentStage(timeline) {
  const overdue = projectTimelineStages.find((item) => timelineStage(timeline, item.key).status === "Overdue");
  if (overdue) return overdue.label;
  const inProgress = projectTimelineStages.find((item) => timelineStage(timeline, item.key).status === "In progress");
  if (inProgress) return inProgress.label;
  const stage = projectTimelineStages.find((item) => timelineStage(timeline, item.key).status !== "Completed");
  return stage ? stage.label : "Project Closed";
}

function timelineCompletionPercent(timeline) {
  const completed = projectTimelineStages
    .filter((stage) => timelineStage(timeline, stage.key).status === "Completed")
    .map((stage) => stage.percent);
  return completed.length ? Math.max(...completed) : 0;
}

function timelineLastUpdated(timeline) {
  const dates = Object.values(timeline.stages || {}).map((stage) => stage.updatedAt).filter(Boolean).sort();
  return dates.at(-1) || timeline.updatedAt || timeline.createdAt || "";
}

function daysBetween(dateValue, endDate = new Date()) {
  if (!dateValue) return 0;
  const start = new Date(String(dateValue).slice(0, 10) + "T00:00:00");
  const end = new Date(dateInputValue(endDate) + "T00:00:00");
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

function timelineOverdueReasons(quote, timeline) {
  const reasons = [];
  const acceptedDate = timelineAcceptedDateForQuote(quote);
  if (acceptedDate && timelineStage(timeline, "deposit_received").status !== "Completed" && daysBetween(acceptedDate) > 7) {
    reasons.push("Deposit not received within 7 days");
  }
  const stockOrdered = timelineStage(timeline, "stock_ordered");
  if (stockOrdered.status === "Completed" && stockOrdered.dateCompleted && timelineStage(timeline, "stock_received").status !== "Completed" && daysBetween(stockOrdered.dateCompleted) > 14) {
    reasons.push("Stock not received within 14 days");
  }
  const installationBooked = timelineStage(timeline, "installation_booked");
  if (installationBooked.status === "Completed" && installationBooked.dateCompleted && timelineStage(timeline, "installation_completed").status !== "Completed" && daysBetween(installationBooked.dateCompleted) > 0) {
    reasons.push("Installation not completed after booked date");
  }
  return reasons;
}

function timelineStatusClass(status, overdue = false) {
  if (overdue || status === "Overdue") return "timeline-status timeline-overdue";
  if (status === "Completed") return "timeline-status timeline-complete";
  if (status === "In progress") return "timeline-status timeline-progress";
  return "timeline-status timeline-not-started";
}

function renderProjectTimelineSummary(rows) {
  const countStage = (key, status = "Completed") => rows.filter(({ timeline }) => timelineStage(timeline, key).status === status).length;
  const awaitingDeposit = rows.filter(({ timeline }) => timelineStage(timeline, "deposit_received").status !== "Completed").length;
  const overdue = rows.filter(({ quote, timeline }) => timelineOverdueReasons(quote, timeline).length).length;
  return `
    <div class="dashboard-summary-grid timeline-summary-grid">
      ${renderSummaryCard("Timeline projects", String(rows.length))}
      ${renderSummaryCard("Awaiting deposit", String(awaitingDeposit))}
      ${renderSummaryCard("Deposit received", String(countStage("deposit_received")))}
      ${renderSummaryCard("Stock ordered", String(countStage("stock_ordered")))}
      ${renderSummaryCard("Installation booked", String(countStage("installation_booked")))}
      ${renderSummaryCard("Installation completed", String(countStage("installation_completed")))}
      ${renderSummaryCard("Paid in full", String(countStage("paid_in_full")))}
      ${renderSummaryCard("Overdue projects", String(overdue))}
    </div>
  `;
}

function projectTimelineRows() {
  return timelineEligibleQuotes().map((quote) => ({
    quote,
    timeline: timelineForQuote(quote),
    request: timelineRequestForQuote(quote),
  }));
}

function renderProjectTimelineDetail(quote) {
  if (!quote) {
    projectTimelineDetail.innerHTML = `<p class="empty-state">Select an accepted quotation to update project progress.</p>`;
    return;
  }
  const timeline = timelineForQuote(quote);
  const request = timelineRequestForQuote(quote);
  const lineItems = timelineQuoteLineItems(quote);
  const salesRepProfile = salesReps[quote.salesRep] || {};
  const responsibleProfile = storageList(membersStorageKey).find((member) => member.name === timeline.responsibleMember || normalizeEmail(member.email) === normalizeEmail(quote.approvedByUserId || quote.createdBy || quote.submittedBy || ""));
  const overdueReasons = timelineOverdueReasons(quote, timeline);
  const installationComplete = timelineStage(timeline, "installation_completed").status === "Completed";
  const paidInFull = timelineStage(timeline, "paid_in_full").status === "Completed";
  const projectClosed = timelineStage(timeline, "project_closed").status === "Completed";
  const percent = timelineCompletionPercent(timeline);
  projectTimelineDetail.innerHTML = `
    <div class="approval-detail-header">
      <div>
        <p class="eyebrow">Project timeline</p>
        <h3>${escapeHtml(quote.quoteNumber)}</h3>
        <p>${escapeHtml(quote.clientName || "-")} | ${escapeHtml(siteProjectNameForQuote(quote))}</p>
      </div>
      <span class="${timelineStatusClass(timelineStage(timeline, "project_closed").status, overdueReasons.length > 0)}">${overdueReasons.length ? "Overdue" : timelineCurrentStage(timeline)}</span>
    </div>
    <div class="timeline-progressbar" aria-label="Project completion">
      <span style="width:${percent}%"></span>
    </div>
    <div class="approval-review-metrics timeline-review-metrics">
      <div><small>Quotation value</small><strong>${money.format(quoteTotalValue(quote))}</strong></div>
      <div><small>Deposit value</small><strong>${money.format(timelineDepositAmount(quote))}</strong></div>
      <div><small>Outstanding balance</small><strong>${money.format(timelineOutstandingBalance(quote))}</strong></div>
      <div><small>Date approved</small><strong>${escapeHtml(formatDate(String(timelineApprovedDateForQuote(quote)).slice(0, 10)))}</strong></div>
      <div><small>Date accepted by client</small><strong>${escapeHtml(timelineAcceptedDateForQuote(quote) ? formatDate(String(timelineAcceptedDateForQuote(quote)).slice(0, 10)) : "-")}</strong></div>
      <div><small>Sales rep</small><strong>${escapeHtml(salesRepNameForQuote(quote))}</strong></div>
      <div><small>Quotation type</small><strong>${escapeHtml(quote.quotationType || "Technical Quotation")}</strong></div>
      <div><small>Completion</small><strong>${percent}%</strong></div>
      <div><small>Responsible member</small><strong>${escapeHtml(timeline.responsibleMember || "-")}</strong></div>
      <div><small>Last updated</small><strong>${escapeHtml(timelineLastUpdated(timeline) ? new Date(timelineLastUpdated(timeline)).toLocaleString("en-ZA") : "-")}</strong></div>
    </div>
    <section class="timeline-source-panel">
      <h4>Information pulled from Quotation Hub</h4>
      <div class="timeline-source-grid">
        <div><small>Current quotation status</small><strong>${escapeHtml(quote.status || quote.workflowStatus || "-")}</strong></div>
        <div><small>Approved by</small><strong>${escapeHtml(quote.approvedByName || quote.decidedByName || "-")}</strong></div>
        <div><small>Approval notes</small><strong>${escapeHtml(quote.approvalNotes || quote.decisionNotes || "-")}</strong></div>
        <div><small>Sales rep details</small><strong>${escapeHtml([salesRepProfile.email, salesRepProfile.phone].filter(Boolean).join(" / ") || "-")}</strong></div>
        <div><small>Responsible role</small><strong>${escapeHtml(responsibleProfile?.access || responsibleProfile?.role || "-")}</strong></div>
        <div><small>Permission level</small><strong>${escapeHtml(responsibleProfile ? memberPermissions(responsibleProfile).length + " permissions" : "-")}</strong></div>
        <div><small>Sales request</small><strong>${escapeHtml(request?.request_number || quote.sales_request_id || "-")}</strong></div>
        <div><small>Request notes</small><strong>${escapeHtml(request?.notes_for_builder || request?.notes || "-")}</strong></div>
        <div><small>Request documents</small><strong>${escapeHtml(request?.files?.length ? `${request.files.length} uploaded` : "-")}</strong></div>
      </div>
      <div class="timeline-line-items">
        <strong>Quotation line items</strong>
        ${lineItems.length ? lineItems.slice(0, 8).map((item) => `<span>${escapeHtml(item.description)} <small>${escapeHtml(item.detail || "")} | Qty ${escapeHtml(item.quantity || "-")} | ${money.format(Number(item.total || 0))}</small></span>`).join("") : `<span>No line items found.</span>`}
      </div>
    </section>
    ${overdueReasons.length ? `<div class="timeline-overdue-panel"><strong>Overdue:</strong> ${escapeHtml(overdueReasons.join(" | "))}</div>` : ""}
    <div class="timeline-stage-list">
      ${projectTimelineStages.map((stage, index) => {
        const record = timelineStage(timeline, stage.key);
        const isLockedClosed = stage.key === "project_closed" && (!installationComplete || !paidInFull);
        const isOverdue = overdueReasons.some((reason) => (
          (stage.key === "deposit_received" && reason.includes("Deposit")) ||
          (stage.key === "stock_received" && reason.includes("Stock")) ||
          (stage.key === "installation_completed" && reason.includes("Installation"))
        ));
        return `
          <article class="timeline-stage-card timeline-vertical-card ${isOverdue ? "stage-overdue" : ""}">
            <div class="timeline-stage-marker ${record.status === "Completed" ? "marker-complete" : record.status === "In progress" ? "marker-progress" : isOverdue || record.status === "Overdue" ? "marker-overdue" : ""}">${index + 1}</div>
            <div class="timeline-stage-fields">
              <div class="timeline-stage-title">
                <strong>${escapeHtml(stage.label)}</strong>
                <span class="${timelineStatusClass(record.status, isOverdue)}">${escapeHtml(isOverdue ? "Overdue" : record.status)}</span>
              </div>
              <div class="timeline-stage-form">
                <label>Status
                  <select data-timeline-status="${escapeHtml(stage.key)}" ${isLockedClosed ? "disabled" : ""}>
                    ${timelineStageStatuses.map((status) => `<option value="${status}" ${record.status === status || (isOverdue && status === "Overdue") ? "selected" : ""}>${status}</option>`).join("")}
                  </select>
                </label>
                <label>${stage.key === "installation_booked" ? "Booked date" : "Date completed"}
                  <input type="date" data-timeline-date="${escapeHtml(stage.key)}" value="${escapeHtml(record.dateCompleted || "")}" ${isLockedClosed ? "disabled" : ""} />
                </label>
                <label>Notes
                  <textarea rows="2" data-timeline-notes="${escapeHtml(stage.key)}" ${isLockedClosed ? "disabled" : ""}>${escapeHtml(record.notes || "")}</textarea>
                </label>
                <div class="timeline-stage-meta">
                  <small>Completed by: ${escapeHtml(record.updatedBy || "-")}</small>
                  <small>${record.updatedAt ? escapeHtml(new Date(record.updatedAt).toLocaleString("en-ZA")) : "No update yet"}</small>
                  <button class="secondary-btn" type="button" data-save-timeline-stage="${escapeHtml(stage.key)}" ${isLockedClosed ? "disabled" : ""}>Save stage</button>
                </div>
              </div>
              ${isLockedClosed ? `<p class="timeline-lock-note">Project can only be closed once Installation completed and Paid in full are completed.</p>` : ""}
            </div>
          </article>
        `;
      }).join("")}
    </div>
    ${installationComplete && paidInFull && !projectClosed ? `<button class="primary-btn" type="button" data-close-project="${escapeHtml(quote.id)}">Mark project as Closed</button>` : ""}
    <button class="secondary-btn" type="button" data-back-timeline="true">Back to timelines</button>
  `;
}

function renderProjectTimeline() {
  let rows = projectTimelineRows();
  projectTimelineList.innerHTML = "";
  projectTimelineDetail.innerHTML = "";

  if (state.selectedTimelineId) {
    const selected = timelineEligibleQuotes().find((quote) => quote.id === state.selectedTimelineId);
    if (selected) {
      projectTimelineList.hidden = true;
      projectTimelineDetail.hidden = false;
      renderProjectTimelineDetail(selected);
      return;
    }
    state.selectedTimelineId = "";
  }

  projectTimelineList.hidden = false;
  projectTimelineDetail.hidden = true;

  if (!rows.length) {
    projectTimelineList.innerHTML = `<p class="empty-state">No approved or client-accepted quotations are available for the Project Timeline yet.</p>`;
    return;
  }

  const salesReps = Array.from(new Set(rows.map(({ quote }) => salesRepNameForQuote(quote)).filter(Boolean))).sort();
  const stages = projectTimelineStages.map((stage) => stage.label);
  projectTimelineList.innerHTML = `
    ${renderProjectTimelineSummary(rows)}
    <div class="approval-filterbar timeline-filterbar">
      <label>Search client name<input id="timelineClientSearch" type="search" placeholder="Client name" /></label>
      <label>Search quotation number<input id="timelineQuoteSearch" type="search" placeholder="Q-2026-0001" /></label>
      <label>Sales rep<select id="timelineSalesRepFilter"><option value="">All sales reps</option>${salesReps.map((rep) => `<option value="${escapeHtml(rep)}">${escapeHtml(rep)}</option>`).join("")}</select></label>
      <label>Current stage<select id="timelineStageFilter"><option value="">All stages</option>${stages.map((stage) => `<option value="${escapeHtml(stage)}">${escapeHtml(stage)}</option>`).join("")}</select></label>
      <label>Date accepted<input id="timelineAcceptedDateFilter" type="date" /></label>
      <label>Overdue items<select id="timelineOverdueFilter"><option value="">All</option><option value="yes">Overdue only</option><option value="no">Not overdue</option></select></label>
      <button class="secondary-btn" type="button" id="timelineClearFilters">Clear filters</button>
    </div>
    <div class="timeline-card-grid" id="timelineRows"></div>
  `;

  const timelineRows = projectTimelineList.querySelector("#timelineRows");
  const renderRows = (filteredRows) => {
    timelineRows.innerHTML = "";
    if (!filteredRows.length) {
      timelineRows.innerHTML = `<p class="empty-state approval-table-empty">No project timelines match this filter.</p>`;
      return;
    }
    filteredRows.forEach(({ quote, timeline }) => {
      const overdueReasons = timelineOverdueReasons(quote, timeline);
      const currentStage = timelineCurrentStage(timeline);
      const percent = timelineCompletionPercent(timeline);
      const card = document.createElement("article");
      card.className = `timeline-project-card ${overdueReasons.length ? "timeline-row-overdue" : ""}`;
      card.innerHTML = `
        <div class="timeline-project-head">
          <div>
            <p class="eyebrow">${escapeHtml(quote.quotationType || "Technical Quotation")}</p>
            <h3>${escapeHtml(quote.quoteNumber || "-")}</h3>
            <p>${escapeHtml(quote.clientName || "-")} | ${escapeHtml(siteProjectNameForQuote(quote))}</p>
          </div>
          <span class="${timelineStatusClass("", overdueReasons.length > 0)}">${escapeHtml(overdueReasons.length ? "Overdue" : currentStage)}</span>
        </div>
        <div class="timeline-progressbar"><span style="width:${percent}%"></span></div>
        <div class="timeline-card-facts">
          <div><small>Quotation value</small><strong>${money.format(quoteTotalValue(quote))}</strong></div>
          <div><small>Deposit value</small><strong>${money.format(timelineDepositAmount(quote))}</strong></div>
          <div><small>Outstanding balance</small><strong>${money.format(timelineOutstandingBalance(quote))}</strong></div>
          <div><small>Date approved</small><strong>${escapeHtml(formatDate(String(timelineApprovedDateForQuote(quote)).slice(0, 10)))}</strong></div>
          <div><small>Date accepted by client</small><strong>${escapeHtml(timelineAcceptedDateForQuote(quote) ? formatDate(String(timelineAcceptedDateForQuote(quote)).slice(0, 10)) : "-")}</strong></div>
          <div><small>Sales rep</small><strong>${escapeHtml(salesRepNameForQuote(quote))}</strong></div>
          <div><small>Completion</small><strong>${percent}%</strong></div>
          <div><small>Responsible member</small><strong>${escapeHtml(timeline.responsibleMember || "-")}</strong></div>
        </div>
        <button class="secondary-btn" type="button" data-view-timeline="${escapeHtml(quote.id)}">Open timeline</button>
      `;
      timelineRows.appendChild(card);
    });
  };

  const applyFilters = () => {
    const clientQuery = projectTimelineList.querySelector("#timelineClientSearch").value.trim().toLowerCase();
    const quoteQuery = projectTimelineList.querySelector("#timelineQuoteSearch").value.trim().toLowerCase();
    const salesRep = projectTimelineList.querySelector("#timelineSalesRepFilter").value;
    const stage = projectTimelineList.querySelector("#timelineStageFilter").value;
    const acceptedDate = projectTimelineList.querySelector("#timelineAcceptedDateFilter").value;
    const overdueFilter = projectTimelineList.querySelector("#timelineOverdueFilter").value;
    const filtered = rows.filter(({ quote, timeline }) => {
      const overdue = timelineOverdueReasons(quote, timeline).length > 0;
      return (
        (!clientQuery || (quote.clientName || "").toLowerCase().includes(clientQuery)) &&
        (!quoteQuery || (quote.quoteNumber || "").toLowerCase().includes(quoteQuery)) &&
        (!salesRep || salesRepNameForQuote(quote) === salesRep) &&
        (!stage || timelineCurrentStage(timeline) === stage) &&
        (!acceptedDate || String(timelineAcceptedDateForQuote(quote)).slice(0, 10) === acceptedDate) &&
        (!overdueFilter || (overdueFilter === "yes" ? overdue : !overdue))
      );
    });
    renderRows(filtered);
  };

  ["timelineClientSearch", "timelineQuoteSearch", "timelineSalesRepFilter", "timelineStageFilter", "timelineAcceptedDateFilter", "timelineOverdueFilter"].forEach((id) => {
    projectTimelineList.querySelector(`#${id}`).addEventListener("input", applyFilters);
    projectTimelineList.querySelector(`#${id}`).addEventListener("change", applyFilters);
  });
  projectTimelineList.querySelector("#timelineClearFilters").addEventListener("click", () => {
    ["timelineClientSearch", "timelineQuoteSearch", "timelineSalesRepFilter", "timelineStageFilter", "timelineAcceptedDateFilter", "timelineOverdueFilter"].forEach((id) => {
      projectTimelineList.querySelector(`#${id}`).value = "";
    });
    applyFilters();
  });
  renderRows(rows);
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
    quotationType: "Technical Quotation",
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
    writeAudit("Quotation created from sales request", payload.quoteNumber, "Building Technical Quotation", payload.quoteNumber, request?.request_number || state.activeSalesRequestId);
    writeAudit("Sales request submitted for approval", request?.request_number || state.activeSalesRequestId, "Sales Quotation Requests", request?.request_number || state.activeSalesRequestId, payload.quoteNumber);
  }
  if (state.revisingQuoteId) {
    writeAudit("Revised quotation saved", payload.quoteNumber, "Building Technical Quotation", payload.quoteNumber, `Revision ${payload.revisionNumber}`);
    writeAudit("Revised quotation resubmitted for approval", payload.quoteNumber, "Approval", payload.quoteNumber, `Revision ${payload.revisionNumber}`);
  } else {
    writeAudit("Submitted for approval", `${payload.quoteNumber} for ${payload.clientName}`);
  }
  renderApprovals();
}

function decideQuote(id, status, rejectionReason = "") {
  if (normalizedStatus(status) === "approved") {
    const quoteToApprove = loadApprovals().find((quote) => quote.id === id);
    if (!["Guarding Quotation", "Monthly Armed Response Quotation"].includes(quoteToApprove?.quotationType) && quoteToApprove && quoteCostingValues(quoteToApprove).totalQuotationProfit <= 0) {
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
    if (normalizedStatus(status) === "rejected" && quote.sales_request_id) {
      updateSalesRequest(quote.sales_request_id, {
        status: "Rejected / Needs Changes",
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
        rejected_by_name: currentUserName(),
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

function renderGuardingApprovalDetail(quote) {
  const salesRep = salesReps[quote.salesRep];
  const pricing = quote.guardingPricing || {};
  const canDecide = isApprovalPendingQuote(quote);
  approvalDetail.innerHTML = `
    <div class="approval-detail-header">
      <div>
        <p class="eyebrow">Guarding Quotation Approval</p>
        <h3>${escapeHtml(quote.quoteNumber || quote.id)}</h3>
      </div>
      <span class="status-badge status-info">Guarding Quotation</span>
    </div>
    <div class="approval-review-metrics">
      <div><small>Client</small><strong>${escapeHtml(quote.clientName || "-")}</strong></div>
      <div><small>Site</small><strong>${escapeHtml(quote.guardingDetails?.siteName || quote.clientAddress || "-")}</strong></div>
      <div><small>Sales rep</small><strong>${escapeHtml(salesRep?.name || "-")}</strong></div>
      <div><small>Subtotal excluding VAT</small><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>
      <div><small>Total including VAT</small><strong>${money.format(roundCurrency(Number(pricing.monthlySelling || 0) * (1 + state.taxRate)))}</strong></div>
      <div><small>Gross profit %</small><strong>${Number(pricing.grossProfitPercent || 0).toFixed(2)}%</strong></div>
    </div>
    <div class="quote-preview approval-quote">${guardingQuotationDocumentHtml(quote, { preview: true })}</div>
    <div class="approval-detail-actions">
      <button class="secondary-btn" type="button" data-back-approvals="true">Back to approval list</button>
      ${canDecide ? `<button class="primary-btn" type="button" data-approve="${quote.id}">Approve</button>` : ""}
      ${canDecide ? `<button class="danger-btn" type="button" data-start-reject="${quote.id}">Reject</button>` : ""}
    </div>
    <div class="rejection-panel">
      <label>Reason for rejection<textarea id="rejectionReason" rows="3" placeholder="Add the reason before rejecting this quotation..." spellcheck="false"></textarea></label>
      ${canDecide ? `<button class="danger-btn" type="button" data-reject="${quote.id}">Reject quotation</button>` : ""}
    </div>
  `;
}

function renderArmedResponseApprovalDetail(quote) {
  const company = companies[quote.selectedCompany];
  const salesRep = salesReps[quote.salesRep];
  const pricing = quote.armedResponsePricing || {};
  const services = quote.armedResponseServices || [];
  const charges = quote.armedResponseOnceOffCharges || [];
  const canDecide = isApprovalPendingQuote(quote);
  approvalDetail.innerHTML = `
    <div class="approval-detail-header">
      <div>
        <p class="eyebrow">Monthly Armed Response Approval</p>
        <h3>${escapeHtml(quote.quoteNumber || quote.id)}</h3>
      </div>
      <span class="status-badge status-info">Monthly Armed Response</span>
    </div>
    <div class="approval-review-metrics">
      <div><small>Client</small><strong>${escapeHtml(quote.clientName || "-")}</strong></div>
      <div><small>Site</small><strong>${escapeHtml(quote.armedResponseDetails?.siteName || quote.clientAddress || "-")}</strong></div>
      <div><small>Sales rep</small><strong>${escapeHtml(salesRep?.name || "-")}</strong></div>
      <div><small>Monthly value</small><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>
      <div><small>Once-off value</small><strong>${money.format(Number(pricing.onceOffSelling || 0))}</strong></div>
      <div><small>Annual contract value</small><strong>${money.format(Number(pricing.annualValue || 0))}</strong></div>
      <div><small>Gross profit %</small><strong>${Number(pricing.grossProfitPercent || 0).toFixed(2)}%</strong></div>
    </div>
    <div class="quote-preview approval-quote">
      <div class="company-strip quotation-brand">
        <img class="quotation-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <div>
          <h2>${escapeHtml(company?.name || "No company selected")}</h2>
          <p>Reg no: ${escapeHtml(company?.registration || "-")} | VAT No: ${escapeHtml(company?.vat || "-")}</p>
        </div>
      </div>
      <div class="preview-meta">
        <div><small>Client</small><strong>${escapeHtml(quote.clientName || "-")}</strong></div>
        <div><small>Site</small><strong>${escapeHtml([quote.armedResponseDetails?.siteName, quote.clientAddress].filter(Boolean).join("\n") || "-")}</strong></div>
        <div><small>Package</small><strong>${escapeHtml(quote.armedResponseDetails?.packageName || "-")}</strong></div>
        <div><small>Date</small><strong>${escapeHtml(formatDate(quote.quoteDate))}</strong></div>
      </div>
      <div class="equipment-description">
        <h3>Scope of Armed Response Services</h3>
        <p>${escapeHtml([quote.armedResponseDetails?.packageDescription, quote.armedResponseDetails?.specialInstructions].filter(Boolean).join(" | ") || "Monthly armed response services as requested.")}</p>
      </div>
      <div class="quotation-table guarding-preview-table">
        <div class="quotation-table-header"><span>Service</span><span>Qty</span><span>Included</span><span>Monthly Selling</span></div>
        ${services.map((row) => `<div class="quotation-table-row"><span>${escapeHtml(row.description || "-")}</span><span>${escapeHtml(row.quantity || 0)}</span><span>Yes</span><strong>${money.format(Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0))}</strong></div>`).join("") || `<div class="quotation-table-row"><span>${escapeHtml(quote.armedResponseDetails?.packageName || "Package")}</span><span>${escapeHtml(quote.armedResponseDetails?.packageSiteCount || 1)}</span><span>Yes</span><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>`}
      </div>
      <div class="quotation-table guarding-preview-table">
        <div class="quotation-table-header"><span>Once-off item</span><span>Qty</span><span>Type</span><span>Selling</span></div>
        ${charges.map((row) => `<div class="quotation-table-row"><span>${escapeHtml(row.item || "-")}</span><span>${escapeHtml(row.quantity || 0)}</span><span>Once-off</span><strong>${money.format(Number(row.quantity || 0) * Number(row.onceOffSellingPrice || 0))}</strong></div>`).join("") || `<div class="quotation-table-row"><span>-</span><span>No once-off charges</span><span>-</span><strong>-</strong></div>`}
      </div>
      <div class="totals">
        <div><span>Monthly selling price</span><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>
        <div><span>Once-off charges</span><strong>${money.format(Number(pricing.onceOffSelling || 0))}</strong></div>
        <div class="grand-total"><span>Annual contract value</span><strong>${money.format(Number(pricing.annualValue || 0))}</strong></div>
      </div>
    </div>
    <div class="approval-detail-actions">
      <button class="secondary-btn" type="button" data-back-approvals="true">Back to approval list</button>
      ${canDecide ? `<button class="primary-btn" type="button" data-approve="${quote.id}">Approve</button>` : ""}
      ${canDecide ? `<button class="danger-btn" type="button" data-start-reject="${quote.id}">Reject</button>` : ""}
    </div>
    <div class="rejection-panel">
      <label>Reason for rejection<textarea id="rejectionReason" rows="3" placeholder="Add the reason before rejecting this quotation..." spellcheck="false"></textarea></label>
      ${canDecide ? `<button class="danger-btn" type="button" data-reject="${quote.id}">Reject quotation</button>` : ""}
    </div>
  `;
}

function renderApprovalDetail(quote) {
  if (!quote) {
    approvalDetail.innerHTML = `<p class="empty-state">Select a quotation to view the full approval details.</p>`;
    return;
  }
  if (quote.quotationType === "Guarding Quotation") {
    renderGuardingApprovalDetail(quote);
    return;
  }
  if (quote.quotationType === "Monthly Armed Response Quotation") {
    renderArmedResponseApprovalDetail(quote);
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
        Quotation Type
        <select id="approvalTypeFilter">
          <option value="">All</option>
          <option value="Technical Quotation">Technical</option>
          <option value="Guarding Quotation">Guarding</option>
          <option value="Monthly Armed Response Quotation">Monthly Armed Response</option>
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
        <small>${escapeHtml(quote.quotationType || "Technical Quotation")} | ${escapeHtml(companies[quote.selectedCompany]?.name || "No company selected")}</small>
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

  const applyApprovalFilters = () => {
    const query = approvalList.querySelector("#approvalSearch").value.trim().toLowerCase();
    const type = approvalList.querySelector("#approvalTypeFilter").value;
    const filtered = pending.filter((quote) => {
      const salesRep = salesReps[quote.salesRep];
      const typeMatch = !type || (quote.quotationType || "Technical Quotation") === type;
      return typeMatch && [
        quote.clientName,
        quote.quoteNumber,
        quote.quotationType || "Technical Quotation",
        companies[quote.selectedCompany]?.name,
        salesRep?.name,
        salesRep?.email,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
    });
    renderRows(filtered);
  };
  approvalList.querySelector("#approvalSearch").addEventListener("input", applyApprovalFilters);
  approvalList.querySelector("#approvalTypeFilter").addEventListener("change", applyApprovalFilters);
}

function renderQuoteLibraryDetail(quote) {
  if (!quote) {
    quoteLibraryDetail.innerHTML = `<p class="empty-state">Select a quotation to view library details.</p>`;
    return;
  }
  if (quote.quotationType === "Guarding Quotation") {
    const salesRep = salesReps[quote.salesRep];
    const internalBadge = internalStatusBadge(quote);
    const statusBadge = libraryStatusBadge(quote);
    quoteLibraryDetail.innerHTML = `
      <div class="approval-detail-header">
        <div>
          <p class="eyebrow">Quote Library</p>
          <h3>${escapeHtml(quote.quoteNumber)}</h3>
        </div>
        <span class="${internalBadge.className}">${escapeHtml(internalBadge.label)}</span>
      </div>
      <div class="approval-review-metrics">
        <div><small>Quotation type</small><strong>Guarding Quotation</strong></div>
        <div><small>Client</small><strong>${escapeHtml(quote.clientName || "-")}</strong></div>
        <div><small>Sales rep</small><strong>${escapeHtml(salesRep?.name || "-")}</strong></div>
        <div><small>Subtotal excluding VAT</small><strong>${money.format(Number(quote.guardingPricing?.monthlySelling || 0))}</strong></div>
        <div><small>Total including VAT</small><strong>${money.format(roundCurrency(Number(quote.guardingPricing?.monthlySelling || 0) * (1 + state.taxRate)))}</strong></div>
        <div><small>Client outcome</small><strong><span class="${statusBadge.className}">${escapeHtml(libraryClientOutcomeLabel(quote))}</span></strong></div>
      </div>
      <div class="quote-preview approval-quote">${guardingQuotationDocumentHtml(quote, { preview: true })}</div>
      <div class="approval-detail-actions">
        <button class="secondary-btn" type="button" data-back-library="true">Back to quote library</button>
        ${canReviseQuote(quote) ? `<button class="primary-btn" type="button" data-revise-quote="${quote.id}">Edit / Revise Quotation</button>` : ""}
      </div>
    `;
    return;
  }
  if (quote.quotationType === "Monthly Armed Response Quotation") {
    const salesRep = salesReps[quote.salesRep];
    const internalBadge = internalStatusBadge(quote);
    const statusBadge = libraryStatusBadge(quote);
    const pricing = quote.armedResponsePricing || {};
    quoteLibraryDetail.innerHTML = `
      <div class="approval-detail-header">
        <div>
          <p class="eyebrow">Quote Library</p>
          <h3>${escapeHtml(quote.quoteNumber)}</h3>
        </div>
        <span class="${internalBadge.className}">${escapeHtml(internalBadge.label)}</span>
      </div>
      <div class="approval-review-metrics">
        <div><small>Quotation type</small><strong>Monthly Armed Response Quotation</strong></div>
        <div><small>Client</small><strong>${escapeHtml(quote.clientName || "-")}</strong></div>
        <div><small>Sales rep</small><strong>${escapeHtml(salesRep?.name || "-")}</strong></div>
        <div><small>Monthly value</small><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>
        <div><small>Once-off value</small><strong>${money.format(Number(pricing.onceOffSelling || 0))}</strong></div>
        <div><small>Annual contract value</small><strong>${money.format(quoteAnnualValue(quote))}</strong></div>
        <div><small>Client outcome</small><strong><span class="${statusBadge.className}">${escapeHtml(libraryClientOutcomeLabel(quote))}</span></strong></div>
      </div>
      <div class="quote-preview approval-quote">
        <div class="equipment-description">
          <h3>Scope of Armed Response Services</h3>
          <p>${escapeHtml([quote.armedResponseDetails?.packageDescription, quote.armedResponseDetails?.specialInstructions].filter(Boolean).join(" | ") || "Monthly armed response services as requested.")}</p>
        </div>
        <div class="quotation-table guarding-preview-table">
          <div class="quotation-table-header"><span>Service</span><span>Qty</span><span>Included</span><span>Monthly Selling</span></div>
          ${(quote.armedResponseServices || []).map((row) => `<div class="quotation-table-row"><span>${escapeHtml(row.description || "-")}</span><span>${escapeHtml(row.quantity || 0)}</span><span>Yes</span><strong>${money.format(Number(row.quantity || 0) * Number(row.monthlySellingPrice || 0))}</strong></div>`).join("") || `<div class="quotation-table-row"><span>${escapeHtml(quote.armedResponseDetails?.packageName || "Package")}</span><span>${escapeHtml(quote.armedResponseDetails?.packageSiteCount || 1)}</span><span>Yes</span><strong>${money.format(Number(pricing.monthlySelling || 0))}</strong></div>`}
        </div>
      </div>
      <div class="approval-detail-actions">
        <button class="secondary-btn" type="button" data-back-library="true">Back to quote library</button>
        ${canReviseQuote(quote) ? `<button class="primary-btn" type="button" data-revise-quote="${quote.id}">Edit / Revise Quotation</button>` : ""}
      </div>
    `;
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
        Quotation Type
        <select id="libraryTypeFilter">
          <option value="">All</option>
          <option value="Technical Quotation">Technical</option>
          <option value="Guarding Quotation">Guarding</option>
          <option value="Monthly Armed Response Quotation">Monthly Armed Response</option>
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
        <span>Type</span>
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
        <span>${escapeHtml(quote.quotationType || "Technical Quotation")}</span>
        <span>
          <strong>${escapeHtml(salesRep?.name || "Unknown")}</strong>
          <small>${escapeHtml(salesRep?.email || currentUser())}</small>
        </span>
        <span>
          <strong>${money.format(quoteTotalValue(quote))}</strong>
          ${quote.quotationType === "Monthly Armed Response Quotation" ? `<small>Monthly ${money.format(Number(quote.armedResponsePricing?.monthlySelling || 0))} | Once-off ${money.format(Number(quote.armedResponsePricing?.onceOffSelling || 0))} | Annual ${money.format(quoteAnnualValue(quote))}</small>` : ""}
        </span>
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
    const type = quoteLibraryList.querySelector("#libraryTypeFilter").value;
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
      const total = quoteTotalValue(quote);
      const internalStatusMatch = !internalStatus || normalizedStatus(quote.status) === normalizedStatus(internalStatus);
      const typeMatch = !type || (quote.quotationType || "Technical Quotation") === type;
      const clientOutcomeLabel = libraryClientOutcomeLabel(quote);
      const clientOutcomeMatch = !clientOutcome || (
        clientOutcome === "awaiting"
          ? clientOutcomeLabel === "Awaiting client outcome"
          : clientOutcomeLabel === clientOutcome
      );
      const searchMatch = [
        quote.clientName,
        quote.quoteNumber,
        quote.quotationType || "Technical Quotation",
        companies[quote.selectedCompany]?.name,
        salesRep?.name,
        salesRep?.email,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
      const quoteNumberMatch = !quoteNumberQuery || String(quote.quoteNumber || "").toLowerCase().includes(quoteNumberQuery);
      const clientMatch = !clientQuery || String(quote.clientName || "").toLowerCase().includes(clientQuery);
      const salesRepMatch = !salesRepQuery || [salesRep?.name, salesRep?.email, quote.createdByName, quote.submittedByName].filter(Boolean).join(" ").toLowerCase().includes(salesRepQuery);
      const dateMatch = (!dateFrom || quoteDate >= dateFrom) && (!dateTo || quoteDate <= dateTo);
      const totalMatch = total >= minTotal && total <= maxTotal;
      return internalStatusMatch && typeMatch && clientOutcomeMatch && searchMatch && quoteNumberMatch && clientMatch && salesRepMatch && dateMatch && totalMatch;
    });
    renderRows(filtered);
    quoteLibraryList.dataset.filteredIds = JSON.stringify(filtered.map((quote) => quote.id));
  };

  renderRows(quotes);
  quoteLibraryList.dataset.filteredIds = JSON.stringify(quotes.map((quote) => quote.id));
  quoteLibraryList.querySelector("#libraryInternalStatusFilter").addEventListener("change", applyFilters);
  quoteLibraryList.querySelector("#libraryTypeFilter").addEventListener("change", applyFilters);
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
      quote.quotationType || "Technical Quotation",
      quote.clientName,
      salesRepNameForQuote(quote),
      quote.status,
      libraryClientOutcomeLabel(quote),
      quoteTotalValue(quote),
    ]);
    const csv = [["Quote number", "Quotation type", "Client", "Sales rep", "Status", "Client outcome", "Total"], ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
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
    const updatedQuote = updateStoredQuote(clientApprovedId, {
      status: "Client Accepted",
      approvalStatus: "Client Accepted",
      workflowStatus: "Client Accepted",
      clientOutcome: "Approved by client",
      clientAcceptedAt: new Date().toISOString(),
      clientAcceptedByName: currentUserName(),
      clientRejectionReason: "",
    });
    if (updatedQuote?.sales_request_id) {
      updateSalesRequest(updatedQuote.sales_request_id, {
        status: "Completed",
        completed_at: new Date().toISOString(),
        completed_by_name: currentUserName(),
      });
      writeAudit("Request completed", updatedQuote.sales_request_id, "Sales Quotation Requests", updatedQuote.sales_request_id, `Completed by ${currentUserName()}`);
    }
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
    if (paymentField === "depositReceived" && event.target.checked) updates.depositReceivedAt = new Date().toISOString();
    if (paymentField === "paidInFull" && event.target.checked) {
      updates.paidInFullAt = new Date().toISOString();
      updates.depositReceivedAt = quote.depositReceivedAt || new Date().toISOString();
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

projectTimelineList.addEventListener("click", (event) => {
  if (!enforceAccess("projectTimeline")) return;
  const row = event.target.closest("[data-view-timeline]");
  if (!row) return;
  state.selectedTimelineId = row.dataset.viewTimeline;
  renderProjectTimeline();
});

projectTimelineDetail.addEventListener("click", (event) => {
  if (!enforceAccess("projectTimeline")) return;
  if (event.target.dataset.backTimeline) {
    state.selectedTimelineId = "";
    renderProjectTimeline();
    return;
  }

  const quote = timelineEligibleQuotes().find((item) => item.id === state.selectedTimelineId);
  if (!quote) return;

  const closeProjectId = event.target.dataset.closeProject;
  if (closeProjectId) {
    const timelines = loadProjectTimelines();
    const timeline = timelineForQuote(quote);
    const oldStatus = timelineStage(timeline, "project_closed").status;
    timeline.stages.project_closed = {
      ...timelineStage(timeline, "project_closed"),
      status: "Completed",
      dateCompleted: todayInputValue(),
      notes: "Project closed after installation completion and full payment.",
      updatedBy: currentUserName(),
      updatedAt: new Date().toISOString(),
    };
    timeline.responsibleMember = currentUserName();
    timeline.updatedAt = new Date().toISOString();
    timelines[quote.id] = timeline;
    saveProjectTimelines(timelines);
    writeAudit("Updated project timeline", currentUserName(), "Project Timeline", quote.quoteNumber, `Project closed: ${oldStatus} -> Completed | Project closed after installation completion and full payment.`);
    renderProjectTimeline();
    return;
  }

  const stageKey = event.target.dataset.saveTimelineStage;
  if (!stageKey) return;
  const stageDefinition = projectTimelineStages.find((stage) => stage.key === stageKey);
  if (!stageDefinition) return;
  const timelines = loadProjectTimelines();
  const timeline = timelineForQuote(quote);
  const previous = { ...timelineStage(timeline, stageKey) };
  const status = projectTimelineDetail.querySelector(`[data-timeline-status="${stageKey}"]`)?.value || "Not started";
  const dateCompleted = projectTimelineDetail.querySelector(`[data-timeline-date="${stageKey}"]`)?.value || "";
  const notes = projectTimelineDetail.querySelector(`[data-timeline-notes="${stageKey}"]`)?.value.trim() || "";
  timeline.stages[stageKey] = {
    status,
    dateCompleted,
    notes,
    updatedBy: currentUserName(),
    updatedAt: new Date().toISOString(),
  };
  timeline.responsibleMember = currentUserName();
  timeline.updatedAt = new Date().toISOString();
  timelines[quote.id] = timeline;
  saveProjectTimelines(timelines);
  writeAudit(
    "Updated project timeline",
    currentUserName(),
    "Project Timeline",
    quote.quoteNumber,
    `${stageDefinition.label}: ${previous.status || "Not started"} -> ${status}${notes ? ` | Notes: ${notes}` : ""}`
  );
  renderProjectTimelineDetail(quote);
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
  if (temporaryPassword && !isStrongPassword(temporaryPassword)) {
    alert(strongPasswordMessage(temporaryPassword));
    markInvalid(memberTempPassword);
    return;
  }

  const id = memberForm.dataset.editId || slugify(email);
  const selectedRole = normalizeRole(memberAccess.value);
  const payload = {
    ...(existing || {}),
    id,
    name: memberName.value.trim(),
    email,
    access: selectedRole,
    role: selectedRole,
    permissions: selectedPermissionKeys(),
    inviteStatus: memberInviteStatus.value,
  };
  if (temporaryPassword) {
    payload.mustChangePassword = true;
    payload.hasLoggedIn = false;
    payload.inviteStatus = "Invite Sent";
    payload.inviteSentAt = new Date().toISOString();
  }
  const isBootstrapSave = isBootstrapSuperAdmin() && selectedRole === "Super Admin";
  if (!isBootstrapSave) {
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...payload, role: payload.access, temporaryPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Member could not be saved securely.");
    } catch (error) {
      alert(error.message || "Member could not be saved securely.");
      return;
    }
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

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-bootstrap-add-self]")) return;
  if (!isBootstrapSuperAdmin()) return;
  const session = currentSession();
  const email = normalizeEmail(currentUser());
  memberName.value = session?.name || displayNameFromUser(email);
  memberEmail.value = email;
  memberAccess.value = "Super Admin";
  memberInviteStatus.value = "Active";
  memberTempPassword.value = "";
  renderPermissionChecklist(roleDefaultPermissions["Super Admin"] || []);
  memberName.focus();
});

memberList.addEventListener("click", async (event) => {
  if (!enforceAccess("settings")) return;
  const members = storageList(membersStorageKey);
  const editId = event.target.dataset.editSetupMember;
  const saveId = event.target.dataset.saveSetupMember;
  const deactivateId = event.target.dataset.deactivateSetupMember;
  const reactivateId = event.target.dataset.reactivateSetupMember;
  const forcePasswordId = event.target.dataset.forceSetupMemberPassword;
  const cancelEdit = event.target.closest("[data-cancel-setup-member-edit]");
  if (editId) {
    setupEditingMemberId = setupEditingMemberId === editId ? "" : editId;
    renderSetup();
    return;
  }
  if (cancelEdit) {
    setupEditingMemberId = "";
    renderSetup();
    return;
  }
  if (saveId) {
    const index = members.findIndex((item) => item.id === saveId);
    const member = members[index];
    const panel = memberList.querySelector(`[data-setup-member-edit-panel="${CSS.escape(saveId)}"]`);
    if (index < 0 || !member || !panel) return;
    const fieldValue = (field) => panel.querySelector(`[data-setup-member-field="${field}"]`)?.value?.trim() || "";
    const nextEmail = normalizeEmail(fieldValue("email"));
    const duplicate = members.find((item) => item.id !== saveId && normalizeEmail(item.email) === nextEmail);
    if (!fieldValue("name") || !nextEmail) {
      setSetupMemberNotice(saveId, "Name and email are required.", "warning");
      renderSetup();
      return;
    }
    if (duplicate) {
      setSetupMemberNotice(saveId, "Another member already uses this email address.", "warning");
      renderSetup();
      return;
    }
    const previousPermissions = memberPermissions(member);
    const nextPermissions = new Set(Array.isArray(member.permissions) ? member.permissions : Array.from(previousPermissions));
    quotationHubPermissionDefinitions().forEach((permission) => {
      const checked = Boolean(panel.querySelector(`[data-setup-member-permission="${permission.key}"]`)?.checked);
      const previous = previousPermissions.has(permission.key);
      if (checked) nextPermissions.add(permission.key);
      else nextPermissions.delete(permission.key);
      if (previous !== checked) writeQuotationPermissionAudit(member, permission, previous, checked);
    });
    const changes = {
      name: fieldValue("name"),
      email: nextEmail,
      position: fieldValue("position"),
      department: fieldValue("department"),
      access: normalizeRole(fieldValue("access")),
      role: normalizeRole(fieldValue("access")),
      inviteStatus: fieldValue("inviteStatus") || "Active",
      status: fieldValue("inviteStatus") || "Active",
      permissions: Array.from(nextPermissions),
      permissionsExplicit: true,
    };
    if (changes.inviteStatus === "Disabled" && !isInactiveMember(member)) {
      changes.deactivatedAt = new Date().toISOString();
      changes.deactivatedBy = currentUserName();
    }
    if (changes.inviteStatus === "Active" && isInactiveMember(member)) {
      changes.reactivatedAt = new Date().toISOString();
      changes.reactivatedBy = currentUserName();
      changes.deactivatedAt = "";
      changes.deactivatedBy = "";
    }
    const changedEntries = Object.entries(changes).filter(([key, value]) => JSON.stringify(member[key] ?? "") !== JSON.stringify(value ?? ""));
    if (!changedEntries.length) {
      setSetupMemberNotice(saveId, "No changes to save.");
      setupEditingMemberId = "";
      renderSetup();
      return;
    }
    const updated = { ...member, ...Object.fromEntries(changedEntries), updatedAt: new Date().toISOString(), updatedBy: currentUserName() };
    try {
      await syncGovernanceMemberToBackend(updated);
    } catch (error) {
      setSetupMemberNotice(saveId, error.message || "Saved locally, but server sync failed.", "warning");
    }
    members[index] = updated;
    saveStorageList(membersStorageKey, members);
    saveUserPermissions(updated);
    changedEntries
      .filter(([key]) => !["permissions", "permissionsExplicit"].includes(key))
      .forEach(([key, value]) => {
        writeAudit("Updated Quotation Hub member", `${member.email} - ${key}`, "Quotation Hub Setup", key, `${member[key] ?? "-"} -> ${value ?? "-"}`);
      });
    setSetupMemberNotice(saveId, "Member permissions saved.");
    setupEditingMemberId = "";
    applyPermissions();
    renderSetup();
    return;
  }
  if (deactivateId || reactivateId || forcePasswordId) {
    const targetId = deactivateId || reactivateId || forcePasswordId;
    const index = members.findIndex((item) => item.id === targetId);
    const member = members[index];
    if (index < 0 || !member) return;
    const changes = forcePasswordId
      ? { forcePasswordChange: true, passwordResetRequested: true }
      : deactivateId
        ? { inviteStatus: "Disabled", status: "Disabled", deactivatedAt: new Date().toISOString(), deactivatedBy: currentUserName() }
        : { inviteStatus: "Active", status: "Active", reactivatedAt: new Date().toISOString(), reactivatedBy: currentUserName(), deactivatedAt: "", deactivatedBy: "" };
    const updated = { ...member, ...changes, updatedAt: new Date().toISOString(), updatedBy: currentUserName() };
    try {
      await syncGovernanceMemberToBackend(updated);
    } catch (error) {
      setSetupMemberNotice(targetId, error.message || "Saved locally, but server sync failed.", "warning");
    }
    members[index] = updated;
    saveStorageList(membersStorageKey, members);
    writeAudit(forcePasswordId ? "Forced password change" : deactivateId ? "Deactivated Quotation Hub member" : "Reactivated Quotation Hub member", member.email, "Quotation Hub Setup", member.email, `Changed by ${currentUserName()}`);
    setSetupMemberNotice(targetId, forcePasswordId ? "Password change will be required." : deactivateId ? "Member deactivated." : "Member reactivated.");
    applyPermissions();
    renderSetup();
    return;
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

guardingPriceForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("settings") || !isAdminMember()) return;
  if (!guardingPriceItemName.value.trim() || !guardingPriceDescription.value.trim()) return;

  const items = loadGuardingMasterPriceList();
  const id = guardingPriceForm.dataset.editId || slugify(`${guardingPriceItemName.value}-${Date.now()}`);
  const existingIndex = items.findIndex((item) => item.id === id);
  const oldItem = existingIndex >= 0 ? { ...items[existingIndex] } : null;
  const payload = normalizeGuardingPriceItem({
    id,
    itemName: guardingPriceItemName.value.trim(),
    shiftType: guardingPriceShiftType.value,
    billingType: guardingPriceBillingType.value,
    description: guardingPriceDescription.value.trim(),
    unitType: guardingPriceUnitType.value.trim(),
    category: guardingPriceCategory.value.trim(),
    serviceType: guardingPriceServiceType.value.trim(),
    rate: Number(guardingPriceRate.value || 0),
    active: guardingPriceActive.checked,
    updatedAt: new Date().toISOString(),
  });
  if (existingIndex >= 0) items[existingIndex] = payload;
  else items.push(payload);
  saveGuardingMasterPriceList(items);
  guardingPriceForm.reset();
  guardingPriceShiftType.value = "Day Shift";
  guardingPriceBillingType.value = "Daily";
  guardingPriceActive.checked = true;
  delete guardingPriceForm.dataset.editId;
  writeAudit(
    oldItem ? "Guarding price item edited" : "Guarding price item added",
    payload.itemName,
    "Setup - Guarding price list",
    payload.id,
    `Old price: ${oldItem ? money.format(Number(oldItem.rate || 0)) : "-"}; New price: ${money.format(Number(payload.rate || 0))}; Old description: ${oldItem?.description || "-"}; New description: ${payload.description || "-"}`
  );
  renderSetup();
  renderGuardingBuilder();
});

guardingPriceList?.addEventListener("click", (event) => {
  if (!enforceAccess("settings") || !isAdminMember()) return;
  const editId = event.target.dataset.editGuardingPrice;
  const toggleId = event.target.dataset.toggleGuardingPrice;
  const items = loadGuardingMasterPriceList();
  if (editId) {
    const item = items.find((priceItem) => priceItem.id === editId);
    if (!item) return;
    guardingPriceForm.dataset.editId = item.id;
    guardingPriceItemName.value = item.itemName || "";
    guardingPriceShiftType.value = item.shiftType || "Day Shift";
    guardingPriceBillingType.value = item.billingType || "Monthly";
    guardingPriceDescription.value = item.description || "";
    guardingPriceUnitType.value = item.unitType || "";
    guardingPriceCategory.value = item.category || "";
    guardingPriceServiceType.value = item.serviceType || "";
    guardingPriceRate.value = item.rate || 0;
    guardingPriceActive.checked = item.active !== false;
  }
  if (toggleId) {
    const itemIndex = items.findIndex((priceItem) => priceItem.id === toggleId);
    if (itemIndex < 0) return;
    const oldItem = { ...items[itemIndex] };
    items[itemIndex] = { ...items[itemIndex], active: items[itemIndex].active === false, updatedAt: new Date().toISOString() };
    saveGuardingMasterPriceList(items);
    writeAudit(
      items[itemIndex].active ? "Guarding price item activated" : "Guarding price item deactivated",
      items[itemIndex].itemName,
      "Setup - Guarding price list",
      items[itemIndex].id,
      `Old price: ${money.format(Number(oldItem.rate || 0))}; New price: ${money.format(Number(items[itemIndex].rate || 0))}; Old description: ${oldItem.description || "-"}; New description: ${items[itemIndex].description || "-"}`
    );
    renderSetup();
    renderGuardingBuilder();
  }
});

guardingPriceImportFile?.addEventListener("change", async (event) => {
  if (!enforceAccess("settings") || !isAdminMember()) return;
  const file = event.target.files?.[0];
  if (!file) return;
  const extension = file.name.split(".").pop().toLowerCase();
  if (["xls", "xlsx"].includes(extension)) {
    guardingPriceImportSummary.innerHTML = `<span class="import-error">Excel files need the live backend spreadsheet parser. For this local prototype, please save the sheet as CSV and upload the CSV.</span>`;
    writeAudit("Guarding price import blocked", file.name, "Setup - Guarding price list", file.name, "Excel parser unavailable in local static prototype");
    event.target.value = "";
    return;
  }
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    guardingPriceImportSummary.innerHTML = `<span class="import-error">The uploaded CSV does not contain enough rows to import.</span>`;
    return;
  }
  const headers = rows[0].map((header) => header.trim());
  const headerIndex = (keywords) => {
    const normalized = headers.map((header) => header.toLowerCase());
    return normalized.findIndex((header) => keywords.some((keyword) => header.includes(keyword)));
  };
  const indexes = {
    itemName: headerIndex(["itemname", "item name", "name", "service"]),
    shiftType: headerIndex(["shift", "day night"]),
    billingType: headerIndex(["billing", "cadence", "hourly", "daily", "monthly"]),
    description: headerIndex(["description", "duties", "details"]),
    unitType: headerIndex(["unit", "type"]),
    category: headerIndex(["category", "region", "group"]),
    serviceType: headerIndex(["service type", "cadence", "service"]),
    rate: headerIndex(["rate", "price", "cost"]),
    active: headerIndex(["active", "status"]),
  };
  const existing = loadGuardingMasterPriceList();
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  rows.slice(1).forEach((row, rowIndex) => {
    const itemName = row[indexes.itemName] || row[indexes.description] || "";
    const description = row[indexes.description] || itemName;
    const shiftType = indexes.shiftType >= 0 ? row[indexes.shiftType] : "";
    const billingType = indexes.billingType >= 0 ? row[indexes.billingType] : "";
    const rate = guardingPriceNumber(row[indexes.rate]);
    if (!itemName.trim() || !description.trim()) {
      skipped += 1;
      return;
    }
    const id = slugify(`${itemName}-${shiftType || "Day Shift"}-${billingType || "Monthly"}-${row[indexes.unitType] || ""}-${row[indexes.category] || ""}`) || `guarding-import-${rowIndex}`;
    const payload = normalizeGuardingPriceItem({
      id,
      itemName,
      shiftType,
      billingType,
      description,
      unitType: row[indexes.unitType] || "Unit",
      category: row[indexes.category] || "Guarding",
      serviceType: row[indexes.serviceType] || "Guarding",
      rate,
      active: indexes.active >= 0 ? !["false", "inactive", "no", "0"].includes(String(row[indexes.active]).toLowerCase()) : true,
      updatedAt: new Date().toISOString(),
    });
    const existingIndex = existing.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      existing[existingIndex] = payload;
      updated += 1;
    } else {
      existing.push(payload);
      imported += 1;
    }
  });
  saveGuardingMasterPriceList(existing);
  guardingPriceImportSummary.textContent = `${imported} items imported, ${updated} updated, ${skipped} skipped.`;
  writeAudit("Guarding price list imported", `${imported} imported, ${updated} updated, ${skipped} skipped`, "Setup - Guarding price list", file.name, "CSV import");
  event.target.value = "";
  renderSetup();
  renderGuardingBuilder();
});

exportGuardingPriceList?.addEventListener("click", () => {
  if (!enforceAccess("settings") || !isAdminMember()) return;
  const headers = ["itemName", "shiftType", "billingType", "description", "unitType", "category", "serviceType", "rate", "active"];
  const rows = loadGuardingMasterPriceList().map((item) => [
    item.itemName,
    item.shiftType,
    item.billingType,
    item.description,
    item.unitType,
    item.category,
    item.serviceType,
    item.rate,
    item.active !== false,
  ]);
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
  downloadBlobFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), `guarding-price-list-${todayInputValue()}.csv`);
  writeAudit("Guarding price list exported", `${rows.length} rows`, "Setup - Guarding price list", "Guarding price list", "CSV export");
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
dashboardTypeFilter?.addEventListener("change", renderDashboard);
dashboardSalesRepFilter?.addEventListener("input", renderDashboard);
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

function renderProjectionsAfterFilterChange(filterName) {
  if (!canAccess("projections")) return;
  renderProjections();
  writeAudit("Changed projections filters", filterName, "Projections", "Projections", `${filterName} changed by ${currentUserName()}`);
}

projectionsMonth?.addEventListener("change", () => {
  projectionsFromDate.value = "";
  projectionsToDate.value = "";
  renderProjectionsAfterFilterChange("Month");
});
projectionsFromDate?.addEventListener("change", () => renderProjectionsAfterFilterChange("Date from"));
projectionsToDate?.addEventListener("change", () => renderProjectionsAfterFilterChange("Date to"));
projectionsQuotationType?.addEventListener("change", () => renderProjectionsAfterFilterChange("Quotation type"));
projectionsSalesRepFilter?.addEventListener("input", () => {
  clearTimeout(window.projectionsFilterTimer);
  window.projectionsFilterTimer = setTimeout(() => renderProjectionsAfterFilterChange("Sales rep"), 250);
});
projectionsBranchFilter?.addEventListener("input", () => {
  clearTimeout(window.projectionsFilterTimer);
  window.projectionsFilterTimer = setTimeout(() => renderProjectionsAfterFilterChange("Branch"), 250);
});
projectionsPreviousMonth?.addEventListener("click", () => {
  const [year, month] = (projectionsMonth.value || monthInputValue()).split("-").map(Number);
  projectionsMonth.value = monthInputValue(new Date(year, month - 2, 1));
  projectionsFromDate.value = "";
  projectionsToDate.value = "";
  renderProjectionsAfterFilterChange("Previous month");
});
projectionsNextMonth?.addEventListener("click", () => {
  const [year, month] = (projectionsMonth.value || monthInputValue()).split("-").map(Number);
  projectionsMonth.value = monthInputValue(new Date(year, month, 1));
  projectionsFromDate.value = "";
  projectionsToDate.value = "";
  renderProjectionsAfterFilterChange("Next month");
});
projectionsExportExcel?.addEventListener("click", exportProjectionsCsv);
projectionsExportPdf?.addEventListener("click", exportProjectionsPdf);

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

requestQuotationType.addEventListener("change", () => {
  guardingRequestFields.hidden = requestQuotationType.value !== "Guarding Quotation";
  if (armedResponseRequestFields) armedResponseRequestFields.hidden = requestQuotationType.value !== "Monthly Armed Response Quotation";
});

salesRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enforceAccess("salesRequests")) return;
  const quotationType = requestQuotationType.value;
  const required = [
    ["requestQuotationType", "Quotation type"],
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
  if (quotationType === "Guarding Quotation") {
    required.push(
      ["requestProvince", "Province"],
      ["requestIndustryType", "Industry type"],
      ["requestServiceType", "Required service type"],
      ["requestContractStartDate", "Contract start date"],
      ["requestContractDuration", "Contract duration"],
      ["requestNumberOfGuards", "Number of guards required"]
    );
  }
  if (quotationType === "Monthly Armed Response Quotation") {
    required.push(
      ["requestArmedProvince", "Province"],
      ["requestArmedArea", "Area / suburb"],
      ["requestArmedIndustryType", "Industry type"],
      ["requestArmedNumberOfSites", "Number of sites"],
      ["requestArmedContractStartDate", "Contract start date"],
      ["requestArmedContractDuration", "Contract duration"]
    );
  }
  const missing = required.filter(([id]) => !document.querySelector(`#${id}`)?.value.trim());
  if (missing.length) {
    alert(`Please complete: ${missing.map(([, label]) => label).join(", ")}`);
    return;
  }
  const request = {
    id: `sqr-${Date.now()}`,
    request_number: reserveRequestNumber(),
    quotation_type: quotationType,
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
    province: document.querySelector("#requestProvince")?.value.trim() || document.querySelector("#requestArmedProvince")?.value.trim() || "",
    area_suburb: document.querySelector("#requestArmedArea")?.value.trim() || "",
    industry_type: document.querySelector("#requestIndustryType")?.value.trim() || document.querySelector("#requestArmedIndustryType")?.value.trim() || "",
    required_service_type: document.querySelector("#requestServiceType")?.value.trim() || "",
    contract_start_date: document.querySelector("#requestContractStartDate")?.value || document.querySelector("#requestArmedContractStartDate")?.value || "",
    contract_duration: document.querySelector("#requestContractDuration")?.value.trim() || document.querySelector("#requestArmedContractDuration")?.value.trim() || "",
    day_shift_required: document.querySelector("#requestDayShiftRequired")?.value || "",
    night_shift_required: document.querySelector("#requestNightShiftRequired")?.value || "",
    number_of_guards_required: document.querySelector("#requestNumberOfGuards")?.value || "",
    supervisor_required: document.querySelector("#requestSupervisorRequired")?.value || "",
    armed_guards_required: document.querySelector("#requestArmedGuardsRequired")?.value || "",
    control_room_required: document.querySelector("#requestControlRoomRequired")?.value || "",
    patrols_required: document.querySelector("#requestPatrolsRequired")?.value || "",
    equipment_required: document.querySelector("#requestEquipmentRequired")?.value.trim() || "",
    special_site_instructions: document.querySelector("#requestSpecialInstructions")?.value.trim() || document.querySelector("#requestArmedSpecialInstructions")?.value.trim() || "",
    number_of_sites: document.querySelector("#requestArmedNumberOfSites")?.value || "",
    existing_alarm_system: document.querySelector("#requestExistingAlarmSystem")?.value || "",
    alarm_monitoring_required: document.querySelector("#requestAlarmMonitoringRequired")?.value || "",
    armed_response_required: document.querySelector("#requestArmedResponseRequired")?.value || "",
    key_holding_required: document.querySelector("#requestKeyHoldingRequired")?.value || "",
    opening_closing_required: document.querySelector("#requestOpeningClosingRequired")?.value || "",
    patrol_service_required: document.querySelector("#requestPatrolServiceRequired")?.value || "",
    panic_button_required: document.querySelector("#requestPanicButtonRequired")?.value || "",
    medical_response_required: document.querySelector("#requestMedicalResponseRequired")?.value || "",
    fire_response_required: document.querySelector("#requestFireResponseRequired")?.value || "",
    notes_for_builder: document.querySelector("#requestNotes").value.trim(),
    status: "New Request",
    is_new: true,
    viewed_by_user_ids: [],
    submitted_by_user_id: currentUser(),
    files: state.salesRequestFiles,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveSalesRequests([request, ...loadSalesRequests()]);
  writeAudit("Request submitted", request.request_number, "Sales Quotation Requests", request.request_number, `${request.quotation_type}: ${request.client_name}`);
  renderSalesRequestBadge();
  state.salesRequestFiles = [];
  state.selectedRequestSalesRepId = "";
  salesRequestForm.reset();
  guardingRequestFields.hidden = true;
  if (armedResponseRequestFields) armedResponseRequestFields.hidden = true;
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
  const viewedId = event.target.dataset.markRequestViewed;
  const clearFilters = event.target.dataset.clearRequestFilters !== undefined;
  if (clearFilters) {
    state.salesRequestFilters = { status: "All", salesRep: "", clientName: "", submittedDate: "", quotationType: "All" };
    renderSalesRequests();
    return;
  }
  if (viewedId) {
    markSalesRequestViewed(viewedId);
    renderSalesRequests();
    return;
  }
  if (acceptId) {
    const existingRequest = loadSalesRequests().find((item) => item.id === acceptId);
    if (existingRequest?.accepted_by_user_id && existingRequest.accepted_by_user_id !== currentUser() && !["Admin", "Super Admin"].includes(currentMember().access)) {
      alert(`This request is already being processed by ${existingRequest.accepted_by_name || "another user"}.`);
      return;
    }
    markSalesRequestViewed(acceptId, "Request viewed before acceptance");
    const request = updateSalesRequest(acceptId, {
      status: "Accepted for Processing",
      accepted_by_user_id: currentUser(),
      accepted_by_name: currentUserName(),
      accepted_at: new Date().toISOString(),
      is_new: false,
    });
    writeAudit("Sales request accepted", request.request_number, "Sales Quotation Requests", request.request_number, `Accepted by ${currentUserName()}`);
    createQuotationFromRequest(acceptId);
    return;
  }
  if (createId) createQuotationFromRequest(createId);
  if (docsId) {
    markSalesRequestViewed(docsId);
    const request = loadSalesRequests().find((item) => item.id === docsId);
    alert((request?.files || []).map((file) => `${file.file_name} (${formatFileSize(file.file_size)})`).join("\n") || "No documents uploaded.");
    renderSalesRequests();
  }
});

salesRequestList.addEventListener("input", (event) => {
  const filter = event.target.dataset.requestFilter;
  if (!filter) return;
  state.salesRequestFilters[filter] = event.target.value;
  clearTimeout(window.salesRequestFilterTimer);
  window.salesRequestFilterTimer = setTimeout(renderSalesRequests, 250);
});

salesRequestList.addEventListener("change", (event) => {
  const filter = event.target.dataset.requestFilter;
  if (!filter) return;
  state.salesRequestFilters[filter] = event.target.value;
  renderSalesRequests();
});

document.querySelector("#addGuardingStaff")?.addEventListener("click", () => {
  state.guarding.staffing.push(defaultGuardingStaffRow());
  renderGuardingBuilder();
});

document.querySelector("#addGuardingEquipment")?.addEventListener("click", () => {
  state.guarding.equipment.push({ item: "", quantity: 1, monthlyCost: 0, monthlySellingPrice: 0 });
  renderGuardingBuilder();
});

document.querySelector("#addGuardingCost")?.addEventListener("click", () => {
  state.guarding.additionalCosts.push({ description: "", monthlyCost: 0, monthlySellingPrice: 0 });
  renderGuardingBuilder();
});

document.querySelector("#addGuardingLineItem")?.addEventListener("click", () => {
  state.guarding.lineItems.push(defaultGuardingLineItem());
  renderGuardingBuilder();
});

document.querySelector("#guardingNewQuote")?.addEventListener("click", resetGuardingQuote);
document.querySelector("#submitGuardingQuote")?.addEventListener("click", submitGuardingQuoteForApproval);
document.querySelector("#saveGuardingDraft")?.addEventListener("click", () => {
  localStorage.setItem("interactiveSecurityGuardingDraft", JSON.stringify(guardingPayload("Draft")));
  alert("Guarding quotation draft saved.");
});

document.querySelector("#guardingQuoteForm")?.addEventListener("input", (event) => {
  const lineIndex = event.target.dataset.guardingLine;
  const staffIndex = event.target.dataset.guardingStaff;
  const equipmentIndex = event.target.dataset.guardingEquipment;
  const costIndex = event.target.dataset.guardingCost;
  const field = event.target.dataset.field;
  if (lineIndex !== undefined && field) {
    const row = state.guarding.lineItems[Number(lineIndex)];
    if (!row) return;
    if (field === "catalogSearch") {
      row.catalogSearch = event.target.value;
      row.itemName = event.target.value;
      row.description = event.target.value;
      const item = findGuardingItemBySearchValue(event.target.value);
      if (item) {
        applyGuardingItemShiftToRow(Number(lineIndex), item);
        renderGuardingBuilder();
      }
      return;
    }
    row[field] = ["itemName", "description", "unitType", "category", "shiftType", "billingType", "experience", "duties", "serviceDate", "serviceMonth", "scheduleText", "unitNotes", "notes"].includes(field) ? event.target.value : Number(event.target.value || 0);
    if (["rate", "quantity"].includes(field)) {
      const lineTotal = event.target.closest("[data-guarding-line-row]")?.querySelector(".guarding-line-total");
      if (lineTotal) lineTotal.textContent = money.format(guardingLineItemTotal(row));
    }
  } else if (staffIndex !== undefined && field) {
    state.guarding.staffing[Number(staffIndex)][field] = ["position", "grade"].includes(field) ? event.target.value : Number(event.target.value || 0);
  } else if (equipmentIndex !== undefined && field) {
    state.guarding.equipment[Number(equipmentIndex)][field] = field === "item" ? event.target.value : Number(event.target.value || 0);
  } else if (costIndex !== undefined && field) {
    state.guarding.additionalCosts[Number(costIndex)][field] = field === "description" ? event.target.value : Number(event.target.value || 0);
  }
  renderGuardingPreview();
});

document.querySelector("#guardingQuoteForm")?.addEventListener("change", (event) => {
  if (event.target.dataset.guardingLine !== undefined && event.target.dataset.field === "catalogSearch") {
    const item = findGuardingItemBySearchValue(event.target.value);
    if (item) {
      applyGuardingItemShiftToRow(Number(event.target.dataset.guardingLine), item);
      renderGuardingBuilder();
      return;
    }
  }
  if (event.target.dataset.guardingLine !== undefined && event.target.dataset.field === "shiftType") {
    const lineIndex = Number(event.target.dataset.guardingLine);
    const row = state.guarding.lineItems[lineIndex];
    if (!row) return;
    row.shiftType = event.target.value;
    row.scheduleText = "";
    refreshGuardingPriceForRow(lineIndex);
    renderGuardingBuilder();
    return;
  }
  if (event.target.dataset.guardingLine !== undefined && event.target.dataset.field === "billingType") {
    const lineIndex = Number(event.target.dataset.guardingLine);
    const row = state.guarding.lineItems[lineIndex];
    if (!row) return;
    row.billingType = event.target.value;
    row.scheduleText = "";
    refreshGuardingPriceForRow(lineIndex);
    renderGuardingBuilder();
    return;
  }
  renderGuardingPreview();
});

document.querySelector("#guardingQuoteForm")?.addEventListener("click", (event) => {
  const removeLine = event.target.dataset.removeGuardingLine;
  const moveLineUp = event.target.dataset.moveGuardingLineUp;
  const moveLineDown = event.target.dataset.moveGuardingLineDown;
  const removeStaff = event.target.dataset.removeGuardingStaff;
  const removeEquipment = event.target.dataset.removeGuardingEquipment;
  const removeCost = event.target.dataset.removeGuardingCost;
  const updateMasterIndex = event.target.dataset.updateGuardingMaster;
  if (updateMasterIndex !== undefined) {
    if (!isAdminMember()) {
      alert("Only admin users can update the master guarding price list.");
      return;
    }
    const row = state.guarding.lineItems[Number(updateMasterIndex)];
    if (!row?.catalogId) return;
    const items = loadGuardingMasterPriceList();
    const itemIndex = items.findIndex((item) => item.id === row.catalogId);
    if (itemIndex < 0) return;
    const oldItem = { ...items[itemIndex] };
    items[itemIndex] = normalizeGuardingPriceItem({
      ...items[itemIndex],
      itemName: row.itemName || row.description,
      shiftType: row.shiftType || "Day Shift",
      billingType: row.billingType || "Monthly",
      description: row.description || row.itemName,
      unitType: row.unitType || "",
      category: row.category || "",
      serviceType: row.serviceType || "",
      rate: Number(row.rate || 0),
      updatedAt: new Date().toISOString(),
    });
    saveGuardingMasterPriceList(items);
    writeAudit(
      "Guarding price item edited",
      items[itemIndex].itemName,
      "Setup - Guarding price list",
      items[itemIndex].id,
      `Old price: ${money.format(Number(oldItem.rate || 0))}; New price: ${money.format(Number(items[itemIndex].rate || 0))}; Old description: ${oldItem.description || "-"}; New description: ${items[itemIndex].description || "-"}`
    );
    alert("Master guarding price list item updated.");
    renderGuardingBuilder();
    renderSetup();
    return;
  }
  if (removeLine !== undefined) state.guarding.lineItems.splice(Number(removeLine), 1);
  if (moveLineUp !== undefined) {
    const index = Number(moveLineUp);
    if (index > 0) {
      const [item] = state.guarding.lineItems.splice(index, 1);
      state.guarding.lineItems.splice(index - 1, 0, item);
    }
  }
  if (moveLineDown !== undefined) {
    const index = Number(moveLineDown);
    if (index < state.guarding.lineItems.length - 1) {
      const [item] = state.guarding.lineItems.splice(index, 1);
      state.guarding.lineItems.splice(index + 1, 0, item);
    }
  }
  if (removeStaff !== undefined) state.guarding.staffing.splice(Number(removeStaff), 1);
  if (removeEquipment !== undefined) state.guarding.equipment.splice(Number(removeEquipment), 1);
  if (removeCost !== undefined) state.guarding.additionalCosts.splice(Number(removeCost), 1);
  if (removeLine !== undefined || moveLineUp !== undefined || moveLineDown !== undefined || removeStaff !== undefined || removeEquipment !== undefined || removeCost !== undefined) renderGuardingBuilder();
});

document.querySelector("#guardingQuoteForm")?.addEventListener("dragstart", (event) => {
  const row = event.target.closest("[data-guarding-line-row]");
  if (!row) return;
  event.dataTransfer.setData("text/plain", row.dataset.guardingLineRow);
  event.dataTransfer.effectAllowed = "move";
});

document.querySelector("#guardingQuoteForm")?.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-guarding-line-row]")) event.preventDefault();
});

document.querySelector("#guardingQuoteForm")?.addEventListener("drop", (event) => {
  const row = event.target.closest("[data-guarding-line-row]");
  if (!row) return;
  event.preventDefault();
  const fromIndex = Number(event.dataTransfer.getData("text/plain"));
  const toIndex = Number(row.dataset.guardingLineRow);
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || fromIndex === toIndex) return;
  const [item] = state.guarding.lineItems.splice(fromIndex, 1);
  state.guarding.lineItems.splice(toIndex, 0, item);
  renderGuardingBuilder();
});

document.querySelector("#addArmedResponseService")?.addEventListener("click", () => {
  state.armed.additionalServices.push({ description: "", quantity: 1, monthlyCost: 0, monthlySellingPrice: 0 });
  renderArmedResponseBuilder();
});

document.querySelector("#addArmedResponseCharge")?.addEventListener("click", () => {
  state.armed.onceOffCharges.push({ item: "", quantity: 1, onceOffCost: 0, onceOffSellingPrice: 0 });
  renderArmedResponseBuilder();
});

document.querySelector("#armedResponseNewQuote")?.addEventListener("click", resetArmedResponseQuote);
document.querySelector("#submitArmedResponseQuote")?.addEventListener("click", submitArmedResponseQuoteForApproval);
document.querySelector("#saveArmedResponseDraft")?.addEventListener("click", () => {
  localStorage.setItem("interactiveSecurityArmedResponseDraft", JSON.stringify(armedResponsePayload("Draft")));
  alert("Monthly armed response quotation draft saved.");
});

document.querySelector("#armedResponseQuoteForm")?.addEventListener("input", (event) => {
  const serviceIndex = event.target.dataset.armedResponseService;
  const chargeIndex = event.target.dataset.armedResponseCharge;
  const field = event.target.dataset.field;
  if (serviceIndex !== undefined && field) {
    state.armed.additionalServices[Number(serviceIndex)][field] = field === "description" ? event.target.value : Number(event.target.value || 0);
  } else if (chargeIndex !== undefined && field) {
    state.armed.onceOffCharges[Number(chargeIndex)][field] = field === "item" ? event.target.value : Number(event.target.value || 0);
  }
  renderArmedResponsePreview();
});

document.querySelector("#armedResponseQuoteForm")?.addEventListener("change", renderArmedResponsePreview);

document.querySelector("#armedResponseQuoteForm")?.addEventListener("click", (event) => {
  const removeService = event.target.dataset.removeArmedResponseService;
  const removeCharge = event.target.dataset.removeArmedResponseCharge;
  if (removeService !== undefined) state.armed.additionalServices.splice(Number(removeService), 1);
  if (removeCharge !== undefined) state.armed.onceOffCharges.splice(Number(removeCharge), 1);
  if (removeService !== undefined || removeCharge !== undefined) renderArmedResponseBuilder();
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

guardingRequestDocumentsList?.addEventListener("click", (event) => {
  const viewId = event.target.dataset.viewRequestFile;
  const downloadId = event.target.dataset.downloadRequestFile;
  if (viewId) openRequestDocument(viewId, "view");
  if (downloadId) openRequestDocument(downloadId, "download");
});

armedResponseRequestDocumentsList?.addEventListener("click", (event) => {
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
  let user;
  try {
    user = await backendLogin(email, loginPassword.value);
  } catch (error) {
    if (error.data?.code === "ACCOUNT_LOCKED") {
      alert(`This account is locked until ${new Date(error.data.lockedUntil).toLocaleString("en-ZA")}.`);
    } else if (error.data?.code === "PASSWORD_RESET_REQUIRED") {
      alert("This account needs a password reset before it can sign in. Please use Forgot password.");
    } else if (error.data?.remainingAttempts !== undefined) {
      alert(`${error.message} Remaining attempts before lockout: ${error.data.remainingAttempts}`);
    } else {
      alert(error.message || "The email address or password is incorrect.");
    }
    return;
  }
  if (user.mustChangePassword) {
    const newPassword = prompt(`Please create a new password before continuing. ${passwordPolicyMessage}`);
    if (!newPassword || !isStrongPassword(newPassword.trim())) {
      alert(strongPasswordMessage(newPassword || ""));
      clearSharedSession();
      loginScreen.hidden = false;
      return;
    }
    try {
      await changeBackendPassword(loginPassword.value, newPassword.trim());
      user.mustChangePassword = false;
      writeAudit("Changed temporary password", email, "Authentication", email, "First login password change");
    } catch (error) {
      alert(error.message || "Password could not be changed.");
      clearSharedSession();
      loginScreen.hidden = false;
      return;
    }
  }
  saveSharedSessionObject(user);
  const member = memberByEmail(email);
  saveMemberRecord({
    ...(member || {}),
    id: user.userId || member?.id || slugify(email),
    name: user.name || member?.name || displayNameFromUser(email),
    email,
    access: user.role,
    role: user.role,
    permissions: Array.isArray(user.permissions) ? user.permissions : member?.permissions || [],
    permissionsExplicit: Boolean(user.permissionsExplicit),
    hasLoggedIn: true,
    inviteStatus: "Active",
    passwordHash: undefined,
    legacyPasswordHash: member?.legacyPasswordHash,
  });
  loginScreen.hidden = true;
  writeAudit("Signed in", email);
  applyPermissions();
  window.location.hash = "portal";
  showSection("portal");
});

forgotPassword?.addEventListener("click", async () => {
  const email = normalizeEmail(prompt("Enter your email address to request a password reset OTP:", loginEmail.value.trim()) || "");
  if (!email) return;
  try {
    const response = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Password reset could not be requested.");
    alert(data.message || "Your password reset request has been submitted. Please contact your administrator for your OTP.");
    window.history.pushState({}, "", "/reset-password");
    renderPasswordResetOtpScreen(email);
  } catch (error) {
    alert(error.message || "Password reset could not be requested.");
  }
});

function renderPasswordResetOtpScreen(prefilledEmail = "") {
  document.querySelector(".app-shell")?.setAttribute("hidden", "true");
  loginScreen.hidden = false;
  loginScreen.innerHTML = `
    <form class="login-card" id="otpResetForm">
      <div class="brand login-brand">
        <img class="brand-logo" src="./interactive-security-logo.jpg" alt="Interactive Security" />
        <div>
          <strong>Interactive Security Portal</strong>
          <small>Password reset</small>
        </div>
      </div>
      <h1>Reset password</h1>
      <p>Enter the OTP provided by your administrator. The OTP expires after 15 minutes and can only be used once.</p>
      <label>Email address<input id="otpResetEmail" type="email" value="${escapeHtml(prefilledEmail)}" required /></label>
      <label>OTP<input id="otpResetCode" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="6-digit OTP" required /></label>
      <label>New password<input id="otpResetNewPassword" type="password" placeholder="New password" required /></label>
      <label>Confirm new password<input id="otpResetConfirmPassword" type="password" placeholder="Confirm new password" required /></label>
      <button class="primary-btn" type="submit">Reset password</button>
      <button class="link-btn" id="backToLoginFromOtp" type="button">Back to sign in</button>
      <p class="login-note">${escapeHtml(passwordPolicyMessage)}</p>
    </form>
  `;
  document.querySelector("#backToLoginFromOtp")?.addEventListener("click", () => {
    window.location.href = "/";
  });
  document.querySelector("#otpResetForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = normalizeEmail(document.querySelector("#otpResetEmail")?.value || "");
    const otp = String(document.querySelector("#otpResetCode")?.value || "").trim();
    const newPassword = String(document.querySelector("#otpResetNewPassword")?.value || "");
    const confirmPassword = String(document.querySelector("#otpResetConfirmPassword")?.value || "");
    if (newPassword !== confirmPassword) {
      alert("The new password and confirmation do not match.");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      alert(strongPasswordMessage(newPassword));
      return;
    }
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Password reset failed.");
      alert("Password reset complete. Please sign in with your new password.");
      window.location.href = "/";
    } catch (error) {
      alert(error.message || "Password reset failed.");
    }
  });
}

async function handlePasswordResetTokenFromUrl() {
  if (window.location.pathname === "/reset-password") {
    renderPasswordResetOtpScreen(new URLSearchParams(window.location.search).get("email") || "");
    return true;
  }
  const params = new URLSearchParams(window.location.search);
  const token = params.get("resetToken");
  if (!token) return false;
  loginScreen.hidden = false;
  const newPassword = prompt(`Please enter your new password. ${passwordPolicyMessage}`);
  if (!newPassword || !isStrongPassword(newPassword.trim())) {
    alert(strongPasswordMessage(newPassword || ""));
    return true;
  }
  try {
    const resetResponse = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, newPassword: newPassword.trim() }),
    });
    const resetData = await resetResponse.json().catch(() => ({}));
    if (!resetResponse.ok) throw new Error(resetData.error || "Password reset failed.");
    window.history.replaceState({}, "", window.location.pathname || "/");
    alert("Password reset complete. Please sign in with your new password.");
  } catch (error) {
    alert(error.message || "Password reset failed.");
  }
  return true;
}

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
  if (isHubSsoRoute()) return;
  const activeSection = sectionName === "approval" ? "approvals" : sectionName;
  const previousSection = document.body.dataset.activeSection || "";
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
  renderSalesRequestBadge();

  ["portal", "projections", "dashboard", "builder", "guardingBuilder", "armedResponseBuilder", "salesRequests", "approvals", "library", "projectTimeline", "settings", "audit"].forEach((section) => {
    const sectionElement = document.querySelector(`#${section}-section`);
    const isActive = section === activeSection;
    if (!sectionElement) return;
    sectionElement.hidden = !isActive;
    sectionElement.style.display = isActive ? (["builder", "guardingBuilder", "armedResponseBuilder"].includes(section) ? "grid" : "block") : "none";
    sectionElement.setAttribute("aria-hidden", String(!isActive));
  });

  if (activeSection === "portal") renderPortal();
  if (activeSection === "projections") {
    renderProjections();
    if (previousSection !== "projections") {
      const range = projectionsRange();
      writeAudit("Opened Projections tab", `${range.from} to ${range.to}`, "Projections", "Projections", currentUserName());
    }
  }
  if (activeSection === "dashboard") renderDashboard();
  if (activeSection === "guardingBuilder") {
    if (!guardingFields.quoteNumber.value) guardingFields.quoteNumber.value = reserveQuoteNumber(todayInputValue());
    renderGuardingBuilder();
  }
  if (activeSection === "armedResponseBuilder") {
    if (!armedResponseFields.quoteNumber.value) armedResponseFields.quoteNumber.value = reserveQuoteNumber(todayInputValue());
    renderArmedResponseBuilder();
  }
  if (activeSection === "salesRequests") renderSalesRequests();
  if (activeSection === "approvals") renderApprovals();
  if (activeSection === "library") renderQuoteLibrary();
  if (activeSection === "projectTimeline") renderProjectTimeline();
  if (activeSection === "settings") renderSetup();
  if (activeSection === "audit" && canAccess("audit")) renderAudit();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
    window.location.hash = button.dataset.section;
  });
});

async function openHub(hubSlug, targetSection = "dashboard") {
  if (!isSignedIn()) {
    loginScreen.hidden = false;
    window.location.hash = "portal";
    return;
  }
  const hub = companyHubBySlug(hubSlug);
  const member = currentMember();
  logAuthDebug(`openHub:${hubSlug}`, member, getAllowedHubs(member));
  if (!hub || !canAccessCompanyHub(member, hubSlug)) {
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
    const redirectUrl = new URL(data.redirectUrl, window.location.origin);
    if (targetSection) redirectUrl.searchParams.set("section", targetSection);
    console.log("SSO redirect URL generated", redirectUrl.toString());
    writeAudit("Opened hub", hub.name, "Portal", hub.slug, "Opened from company portal with one-time SSO token");
    targetWindow.location.href = redirectUrl.toString();
  } catch (error) {
    console.error("SSO handoff failed", error);
    if (hubWindow) hubWindow.close();
    alert("The secure hub login could not be created. Please try again.");
  }
}

function openPlaceholderHub(hubSlug) {
  if (!isSignedIn()) {
    loginScreen.hidden = false;
    window.location.hash = "portal";
    return;
  }
  const hub = companyHubBySlug(hubSlug);
  const member = currentMember();
  logAuthDebug(`openPlaceholderHub:${hubSlug}`, member, getAllowedHubs(member));
  if (!hub || !canAccessCompanyHub(member, hubSlug)) {
    alert("Access denied");
    return;
  }
  if (window.location.protocol === "file:") {
    alert("Please open http://localhost:3100 to use hub routing.");
    return;
  }
  window.open(`${window.location.origin}/hubs/${hubSlug}`, "_blank", "noopener,noreferrer");
  writeAudit("Opened hub", hub.name, "Portal", hub.slug, "Opened placeholder company hub");
}

portalHubGrid.addEventListener("click", async (event) => {
  if (event.target.closest("[data-finance-logout]")) {
    clearSharedSession();
    loginScreen.hidden = false;
    window.location.href = "/";
    return;
  }
  const financeTab = event.target.closest("[data-finance-tab]");
  if (financeTab) {
    window.location.hash = financeTab.dataset.financeTab;
    renderFinanceHub(financeTab.dataset.financeTab);
    return;
  }
  const costTab = event.target.closest("[data-cost-tab]");
  if (costTab) {
    window.location.hash = costTab.dataset.costTab;
    renderCostHub(costTab.dataset.costTab);
    return;
  }
  const dashboardMonthDirection = event.target.closest("[data-cost-dashboard-month]")?.dataset.costDashboardMonth;
  if (dashboardMonthDirection) {
    const [year, month] = costDashboardFilters.month.split("-").map(Number);
    const date = new Date(year, month - 1 + (dashboardMonthDirection === "prev" ? -1 : 1), 1);
    costDashboardFilters.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    renderCostHub("dashboard");
    return;
  }
  if (event.target.closest("[data-cost-add-request-line]")) {
    const form = event.target.closest('[data-cost-form="request"], [data-cost-form="rejectedPo"]');
    form?.querySelector("[data-cost-request-lines]")?.insertAdjacentHTML("beforeend", costRequestItemRow());
    if (form) updateCostRequestTotals(form);
    return;
  }
  const removeRequestLine = event.target.closest("[data-cost-remove-request-line]");
  if (removeRequestLine) {
    const form = removeRequestLine.closest('[data-cost-form="request"], [data-cost-form="rejectedPo"]');
    if (form?.querySelectorAll("[data-cost-request-line]").length > 1) removeRequestLine.closest("[data-cost-request-line]")?.remove();
    if (form) updateCostRequestTotals(form);
    return;
  }
  const requestPoId = event.target.closest("[data-cost-request-po]")?.dataset.costRequestPo;
  if (requestPoId) { processCostRequest(requestPoId); return; }
  const requestDocument = event.target.closest("[data-cost-request-document]");
  if (requestDocument) { openCostRequestDocument(requestDocument.dataset.costRequestDocument, requestDocument.dataset.fileId); return; }
  const dashboardEditEntityId = event.target.closest("[data-cost-dashboard-edit-entity]")?.dataset.costDashboardEditEntity;
  if (dashboardEditEntityId) { costEditingEntityId = dashboardEditEntityId; renderCostHub("entities"); return; }
  const entityOverviewCard = event.target.closest(".cost-entity-card");
  if (entityOverviewCard) { costSelectedEntityOverview = entityOverviewCard.querySelector("h3")?.textContent.trim() || ""; costEntityOverviewTab = "paid"; renderCostHub("dashboard"); return; }
  if (event.target.closest("[data-cost-entity-overview-back]")) { costSelectedEntityOverview = ""; renderCostHub("dashboard"); return; }
  const entityDetailTab = event.target.closest("[data-cost-entity-detail-tab]")?.dataset.costEntityDetailTab;
  if (entityDetailTab) { costEntityOverviewTab = entityDetailTab; renderCostHub("dashboard"); return; }
  const openApprovalId = event.target.closest("[data-cost-open-approval]")?.dataset.costOpenApproval;
  if (openApprovalId) { costSelectedApprovalId = openApprovalId; renderCostHub("approvals"); return; }
  if (event.target.closest("[data-cost-close-approval]")) { costSelectedApprovalId = ""; renderCostHub("approvals"); return; }
  const approvePoId = event.target.closest("[data-cost-approve-po]")?.dataset.costApprovePo;
  if (approvePoId) {
    if (!isGovernanceAdmin()) return alert("Only an administrator can approve purchase orders.");
    const now = new Date().toISOString();
    const orders = costRows("purchaseOrders").map((po) => po.id === approvePoId ? { ...po, status: "Approved", rejectionReason: "", approvedAt: now, approvedBy: currentUserName() } : po);
    const changed = orders.find((po) => po.id === approvePoId);
    saveCostRows("purchaseOrders", orders);
    if (changed?.requestId) saveCostRows("requests", costRows("requests").map((request) => request.id === changed.requestId ? { ...request, status: "PO approved", updatedAt: now } : request));
    costAudit("Approved purchase order", changed?.number || approvePoId, `Approved by ${currentUserName()}`);
    renderCostHub("approvals");
    return;
  }
  const rejectPoId = event.target.closest("[data-cost-reject-po]")?.dataset.costRejectPo;
  if (rejectPoId) {
    if (!isGovernanceAdmin()) return alert("Only an administrator can reject purchase orders.");
    const reason = prompt("Please enter the reason for rejecting this purchase order:", "");
    if (!reason?.trim()) { alert("A rejection reason is required."); return; }
    const now = new Date().toISOString();
    const orders = costRows("purchaseOrders").map((po) => po.id === rejectPoId ? { ...po, status: "Rejected", rejectionReason: reason.trim(), rejectedAt: now, rejectedBy: currentUserName() } : po);
    const changed = orders.find((po) => po.id === rejectPoId);
    saveCostRows("purchaseOrders", orders);
    if (changed?.requestId) saveCostRows("requests", costRows("requests").map((request) => request.id === changed.requestId ? { ...request, status: "PO rejected", rejectionReason: reason.trim(), updatedAt: now } : request));
    costAudit("Rejected purchase order", changed?.number || rejectPoId, reason.trim());
    renderCostHub("approvals");
    return;
  }
  const governanceTab = event.target.closest("[data-governance-tab]");
  if (governanceTab) {
    window.location.hash = governanceTab.dataset.governanceTab;
    if (governanceTab.dataset.governanceTab === "security") await loadGovernancePasswordResetRequests();
    renderGovernanceHub(governanceTab.dataset.governanceTab);
    return;
  }
  if (event.target.closest("[data-cost-clear-request-filters]")) {
    costRequestFilters = { status: "", requester: "", supplier: "", date: "", entity: "" };
    renderCostHub("requests");
    return;
  }
  if (event.target.closest("[data-cost-clear-approval-filters]")) {
    costApprovalFilters = { status: "", requester: "", supplier: "", date: "", entity: "" };
    renderCostHub("approvals");
    return;
  }
  if (event.target.closest("[data-cost-download-entity-template]")) {
    const rows = [["Entity", "Current Balance"], ...costRows("entities").filter((entity) => entity.status !== "Archived").map((entity) => [entity.name, financeNumber(entity.currentBalance).toFixed(2)])];
    downloadBlobFile(new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }), `entity-balance-template-${todayInputValue()}.csv`);
    return;
  }
  const editEntityId = event.target.closest("[data-cost-edit-entity]")?.dataset.costEditEntity;
  if (editEntityId) { costEditingEntityId = editEntityId; renderCostHub("entities"); portalHubGrid.querySelector('[data-cost-form="entity"] [name="name"]')?.focus(); return; }
  if (event.target.closest("[data-cost-cancel-entity-edit]")) { costEditingEntityId = ""; renderCostHub("entities"); return; }
  const archiveEntityId = event.target.closest("[data-cost-archive-entity]")?.dataset.costArchiveEntity;
  if (archiveEntityId) {
    const entities = costRows("entities").map((entity) => entity.id === archiveEntityId ? { ...entity, status: entity.status === "Archived" ? "Active" : "Archived", updatedAt: new Date().toISOString(), updatedBy: currentUserName() } : entity);
    const changed = entities.find((entity) => entity.id === archiveEntityId);
    saveCostRows("entities", entities);
    costAudit(changed.status === "Archived" ? "Archived entity" : "Restored entity", changed.name);
    if (costEditingEntityId === archiveEntityId) costEditingEntityId = "";
    renderCostHub("entities");
    return;
  }
  const editSupplierId = event.target.closest("[data-cost-edit-supplier]")?.dataset.costEditSupplier;
  if (editSupplierId) {
    costEditingSupplierId = editSupplierId;
    renderCostHub("suppliers");
    portalHubGrid.querySelector('[data-cost-form="supplier"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
    portalHubGrid.querySelector('[data-cost-form="supplier"] [name="name"]')?.focus();
    return;
  }
  if (event.target.closest("[data-cost-cancel-supplier-edit]")) {
    costEditingSupplierId = "";
    renderCostHub("suppliers");
    return;
  }
  const archiveSupplierId = event.target.closest("[data-cost-archive-supplier]")?.dataset.costArchiveSupplier;
  if (archiveSupplierId) {
    const suppliers = costRows("suppliers").map((supplier) => supplier.id === archiveSupplierId ? { ...supplier, status: supplier.status === "Archived" ? "Active" : "Archived", updatedAt: new Date().toISOString(), updatedBy: currentUserName() } : supplier);
    const changed = suppliers.find((supplier) => supplier.id === archiveSupplierId);
    saveCostRows("suppliers", suppliers);
    costAudit(changed.status === "Archived" ? "Archived supplier" : "Restored supplier", changed.name);
    if (costEditingSupplierId === archiveSupplierId) costEditingSupplierId = "";
    renderCostHub("suppliers");
    return;
  }
  const poStatusId = event.target.closest("[data-cost-po-status]")?.dataset.costPoStatus;
  if (poStatusId) {
    const currentPo = costRows("purchaseOrders").find((po) => po.id === poStatusId);
    if (!currentPo || !["Approved", "Issued", "Completed", "Cancelled"].includes(currentPo.status)) return alert("This purchase order must be handled through PO Approvals first.");
    const status = prompt("Purchase order status: Approved, Issued, Completed, Cancelled", currentPo.status || "Approved");
    if (!status) return;
    if (!["Approved", "Issued", "Completed", "Cancelled"].includes(status)) return alert("Please use one of the listed purchase order statuses.");
    const orders = costRows("purchaseOrders").map((po) => po.id === poStatusId ? { ...po, status, updatedAt: new Date().toISOString(), updatedBy: currentUserName() } : po);
    const changed = orders.find((po) => po.id === poStatusId);
    saveCostRows("purchaseOrders", orders);
    costAudit("Updated purchase order status", changed.number, status);
    renderCostHub("purchaseOrders");
    return;
  }
  if (event.target.closest("[data-cost-export-report]")) {
    exportCostReport();
    return;
  }
  const viewCostDocumentId = event.target.closest("[data-cost-view-document]")?.dataset.costViewDocument;
  if (viewCostDocumentId) { openCostDocument(viewCostDocumentId, "view"); return; }
  const downloadCostDocumentId = event.target.closest("[data-cost-download-document]")?.dataset.costDownloadDocument;
  if (downloadCostDocumentId) { openCostDocument(downloadCostDocumentId, "download"); return; }
  const removeCostDocumentId = event.target.closest("[data-cost-remove-document]")?.dataset.costRemoveDocument;
  if (removeCostDocumentId) {
    const documentRecord = costRows("documents").find((document) => document.id === removeCostDocumentId);
    if (!documentRecord || !confirm(`Remove ${documentRecord.file_name}?`)) return;
    saveCostRows("documents", costRows("documents").filter((document) => document.id !== removeCostDocumentId));
    costAudit("Removed cost document", documentRecord.file_name);
    renderCostHub("documents");
    return;
  }
  if (event.target.closest("[data-governance-refresh-resets]")) {
    await loadGovernancePasswordResetRequests();
    renderGovernanceHub("security");
    return;
  }
  const governanceResetAction = event.target.closest("[data-governance-reset-action]");
  if (governanceResetAction) {
    try {
      await runGovernancePasswordResetAction(governanceResetAction.dataset.requestId, governanceResetAction.dataset.governanceResetAction);
    } catch (error) {
      alert(error.message || "Password reset action failed.");
    }
    return;
  }
  if (event.target.closest("[data-governance-add-user]")) {
    await addGovernanceUser();
    return;
  }
  const governanceEditUser = event.target.closest("[data-governance-edit-user]")?.dataset.governanceEditUser;
  if (governanceEditUser) {
    governanceEditingUserId = governanceEditingUserId === governanceEditUser ? "" : governanceEditUser;
    renderGovernanceHub("users");
    return;
  }
  if (event.target.closest("[data-governance-cancel-edit]")) {
    governanceEditingUserId = "";
    renderGovernanceHub("users");
    return;
  }
  const governanceSaveUser = event.target.closest("[data-governance-save-user]")?.dataset.governanceSaveUser;
  if (governanceSaveUser) {
    const member = governanceMembers().find((item) => item.id === governanceSaveUser);
    const panel = document.querySelector(`[data-governance-edit-panel="${CSS.escape(governanceSaveUser)}"]`);
    if (!member || !panel) return;
    const fieldValue = (field) => panel.querySelector(`[data-governance-edit-field="${field}"]`)?.value?.trim() || "";
    const nextEmail = normalizeEmail(fieldValue("email"));
    if (!fieldValue("name") || !nextEmail) {
      setGovernanceUserNotice(governanceSaveUser, "Name and email are required.", "warning");
      renderGovernanceHub("users");
      return;
    }
    const duplicate = governanceMembers().find((item) => item.id !== governanceSaveUser && normalizeEmail(item.email) === nextEmail);
    if (duplicate) {
      setGovernanceUserNotice(governanceSaveUser, "Another user already uses this email address.", "warning");
      renderGovernanceHub("users");
      return;
    }
    const changes = {
      name: fieldValue("name"),
      email: nextEmail,
      position: fieldValue("position"),
      department: fieldValue("department"),
      inviteStatus: fieldValue("inviteStatus") || "Active",
      status: fieldValue("inviteStatus") || "Active",
    };
    const roleSelect = panel.querySelector('[data-governance-edit-field="access"]:not(:disabled)');
    if (roleSelect) {
      changes.access = normalizeRole(roleSelect.value);
      changes.role = normalizeRole(roleSelect.value);
    }
    if (changes.inviteStatus === "Disabled" && !isDeactivatedGovernanceMember(member)) {
      changes.deactivatedAt = new Date().toISOString();
      changes.deactivatedBy = currentUserName();
    }
    if (changes.inviteStatus === "Active" && isDeactivatedGovernanceMember(member)) {
      changes.reactivatedAt = new Date().toISOString();
      changes.reactivatedBy = currentUserName();
      changes.archivedAt = "";
      changes.archivedBy = "";
      changes.deactivatedAt = "";
      changes.deactivatedBy = "";
    }
    if (currentUserCanEditPermissions()) {
      const nextPermissions = new Set(Array.isArray(member.permissions) ? member.permissions : Array.from(memberPermissions(member)));
      panel.querySelectorAll("[data-governance-edit-hub]").forEach((checkbox) => {
        const permissionKey = permissionDefinitions.find((permission) => permission.hubSlug === checkbox.dataset.governanceEditHub)?.key || checkbox.dataset.governanceEditHub.replace(/-/g, "_");
        if (checkbox.checked) nextPermissions.add(permissionKey);
        else nextPermissions.delete(permissionKey);
        setGovernanceHubAccess(governanceSaveUser, checkbox.dataset.governanceEditHub, checkbox.checked, { render: false });
      });
      changes.permissions = Array.from(nextPermissions);
      changes.permissionsExplicit = true;
    }
    governanceEditingUserId = "";
    await updateGovernanceMember(governanceSaveUser, changes, { tab: "users", notice: "User changes saved." });
    return;
  }
  const governanceRemoveUser = event.target.closest("[data-governance-remove-user]")?.dataset.governanceRemoveUser;
  if (governanceRemoveUser) {
    const member = governanceMembers().find((item) => item.id === governanceRemoveUser);
    if (!member) return;
    if (!confirm(`Remove ${member.name || member.email} from active access? They will not be able to log in, but their audit history will remain.`)) return;
    try {
      await removeGovernanceMemberOnServer(governanceRemoveUser);
      writeAudit("Member removed", member.email, "Administration & Governance", member.email, `Removed by ${currentUserName()}`);
      renderGovernanceHub("users");
    } catch (error) {
      alert(error.message || "Member could not be removed.");
    }
    return;
  }
  const governanceReaddUser = event.target.closest("[data-governance-readd-user]")?.dataset.governanceReaddUser;
  if (governanceReaddUser) {
    const member = governanceMembers().find((item) => item.id === governanceReaddUser);
    await addGovernanceUser(member || null);
    return;
  }
  const governanceDeactivateUser = event.target.closest("[data-governance-deactivate-user]")?.dataset.governanceDeactivateUser;
  if (governanceDeactivateUser) {
    await updateGovernanceMember(governanceDeactivateUser, { inviteStatus: "Disabled", status: "Disabled", deactivatedAt: new Date().toISOString(), deactivatedBy: currentUserName() }, { tab: "users", notice: "User deactivated. They can no longer sign in." });
    return;
  }
  const governanceReactivateUser = event.target.closest("[data-governance-reactivate-user]")?.dataset.governanceReactivateUser;
  if (governanceReactivateUser) {
    await updateGovernanceMember(governanceReactivateUser, { inviteStatus: "Active", status: "Active", reactivatedAt: new Date().toISOString(), reactivatedBy: currentUserName(), deactivatedAt: "", deactivatedBy: "", archivedAt: "", archivedBy: "" }, { tab: "users", notice: "User reactivated." });
    return;
  }
  const governanceArchiveUser = event.target.closest("[data-governance-archive-user]")?.dataset.governanceArchiveUser;
  if (governanceArchiveUser) {
    if (!isSuperAdmin()) {
      alert("Only Super Admin users may archive users.");
      return;
    }
    await updateGovernanceMember(governanceArchiveUser, { inviteStatus: "Archived", status: "Archived", archivedAt: new Date().toISOString(), archivedBy: currentUserName() }, { tab: "users", notice: "User archived. They can no longer sign in." });
    return;
  }
  const governanceForcePassword = event.target.closest("[data-governance-force-password]")?.dataset.governanceForcePassword;
  if (governanceForcePassword) {
    await updateGovernanceMember(governanceForcePassword, { forcePasswordChange: true }, { tab: "users", notice: "Password change will be required at next sign-in." });
    return;
  }
  const governanceResetPassword = event.target.closest("[data-governance-reset-password]")?.dataset.governanceResetPassword;
  if (governanceResetPassword) {
    try {
      await generateGovernanceOtpForUser(governanceResetPassword);
    } catch (error) {
      alert(error.message || "OTP could not be generated.");
    }
    return;
  }
  const governanceUnlockUser = event.target.closest("[data-governance-unlock-user]")?.dataset.governanceUnlockUser;
  if (governanceUnlockUser) {
    await updateGovernanceMember(governanceUnlockUser, { lockedUntil: "", failedLoginAttempts: 0 });
    return;
  }
  const governanceForceLogout = event.target.closest("[data-governance-force-logout]")?.dataset.governanceForceLogout;
  if (governanceForceLogout) {
    const member = governanceMembers().find((item) => item.id === governanceForceLogout);
    if (member && normalizeEmail(member.email) === normalizeEmail(currentUser())) clearSharedSession();
    writeAudit("Forced user logout", member?.email || governanceForceLogout, "Administration & Governance", member?.email || governanceForceLogout, `Forced by ${currentUserName()}`);
    renderGovernanceHub("security");
    return;
  }
  if (event.target.closest("[data-governance-copy-permissions]")) {
    if (!currentUserCanEditPermissions()) {
      alert("You do not have permission to copy permissions.");
      return;
    }
    const fromEmail = prompt("Copy permissions from user email:");
    const toEmail = prompt("Copy permissions to user email:");
    const fromMember = governanceMembers().find((member) => normalizeEmail(member.email) === normalizeEmail(fromEmail || ""));
    const toMember = governanceMembers().find((member) => normalizeEmail(member.email) === normalizeEmail(toEmail || ""));
    if (!fromMember || !toMember) {
      alert("Could not find one or both users.");
      return;
    }
    governanceHubList().forEach((hub) => {
      setGovernanceHubAccess(toMember.id, hub.slug, governanceHubAccessFor(fromMember, hub));
    });
    writeAudit("Copied hub permissions", `${fromMember.email} -> ${toMember.email}`, "Administration & Governance", toMember.email, `Copied by ${currentUserName()}`);
    renderGovernanceHub("matrix");
    return;
  }
  const governanceExport = event.target.closest("[data-governance-export]");
  if (governanceExport) {
    governanceExportAudit(governanceExport.dataset.governanceExport, governanceExport.dataset.report || "Full system activity report");
    return;
  }
  const financeOpeningViewButton = event.target.closest("[data-finance-opening-view]");
  if (financeOpeningViewButton) {
    const mode = financeOpeningViewButton.dataset.financeOpeningView;
    if (mode === "range") {
      const from = prompt("From date (YYYY-MM-DD):", financeOpeningView.from || todayInputValue());
      const to = prompt("To date (YYYY-MM-DD):", financeOpeningView.to || todayInputValue());
      if (!from || !to) return;
      localStorage.setItem(financeStorageKeys.openingHistoricalExpanded, "true");
      financeOpeningView = { mode, from, to };
      financeAudit("Date range viewed", "Current Balances", `${from} to ${to}`);
    } else {
      localStorage.setItem(financeStorageKeys.openingHistoricalExpanded, mode === "historical" ? "true" : "false");
      financeOpeningView = { mode, from: "", to: "" };
      financeAudit("Date range viewed", "Current Balances", mode === "historical" ? "All historical balances shown" : "Collapsed to previous day and current day");
    }
    renderFinanceHub("opening");
    return;
  }
  const financeImportSource = event.target.closest("[data-finance-import-source]");
  if (financeImportSource) {
    const source = financeImportSource.dataset.financeImportSource;
    const type = financeImportSource.dataset.financeType;
    alert(`${source} connection is not configured yet. Please add the connection details in Finance Setup.`);
    financeAudit(`Import from ${source}`, type, "Connection settings not configured");
    return;
  }
  const financeExportType = event.target.closest("[data-finance-export]")?.dataset.financeExport;
  if (financeExportType) {
    financeExport(financeExportType);
    return;
  }
  const financePrintType = event.target.closest("[data-finance-print]")?.dataset.financePrint;
  if (financePrintType) {
    financePrintExport(financePrintType);
    return;
  }
  if (event.target.closest("[data-finance-opening-account-add]")) {
    addFinanceOpeningAccount();
    return;
  }
  const accountSaveId = event.target.closest("[data-finance-opening-account-save]")?.dataset.financeOpeningAccountSave;
  if (accountSaveId) {
    const name = document.querySelector(`[data-finance-opening-account-name="${CSS.escape(accountSaveId)}"]`)?.value.trim();
    const group = document.querySelector(`[data-finance-opening-account-group="${CSS.escape(accountSaveId)}"]`)?.value || "OPERATING COMPANIES";
    if (!name) {
      alert("Please enter a bank account name.");
      return;
    }
    updateFinanceOpeningAccount(accountSaveId, { name, group });
    return;
  }
  const accountArchiveId = event.target.closest("[data-finance-opening-account-archive]")?.dataset.financeOpeningAccountArchive;
  if (accountArchiveId) {
    updateFinanceOpeningAccount(accountArchiveId, { status: "archived", archivedAt: new Date().toISOString(), archivedBy: currentUserName() });
    return;
  }
  const accountRestoreId = event.target.closest("[data-finance-opening-account-restore]")?.dataset.financeOpeningAccountRestore;
  if (accountRestoreId) {
    updateFinanceOpeningAccount(accountRestoreId, { status: "active", archivedAt: "", archivedBy: "" });
    return;
  }
  if (event.target.closest("[data-save-finance-setup]")) {
    localStorage.setItem(financeStorageKeys.setup, JSON.stringify({
      pastel: document.querySelector("#financePastelConnection")?.value || "",
      listener: document.querySelector("#financeListenerConnection")?.value || "",
      importMapping: document.querySelector("#financeImportMapping")?.value || "",
      bankMapping: document.querySelector("#financeBankMapping")?.value || "",
      branches: document.querySelector("#financeBranchSetup")?.value || "",
      categories: document.querySelector("#financeAccountCategories")?.value || "",
      ageBuckets: document.querySelector("#financeAgeBuckets")?.value || "",
    }));
    financeAudit("Manual edit", "Finance setup", "Setup settings saved");
    renderFinanceHub("setup");
    return;
  }
  if (event.target.closest("[data-finance-note]")) {
    const name = prompt("Customer / supplier name for collection note:");
    const note = prompt("Collection note:");
    if (name && note) {
      const rows = financeRows("age").map((row) => String(row.partyName || "").toLowerCase() === name.toLowerCase() ? { ...row, collectionNotes: note } : row);
      saveFinanceRows("age", rows);
      financeAudit("Collection note added", name, note);
      renderFinanceHub("outstanding30");
    }
    return;
  }
  if (event.target.closest("[data-finance-promise]")) {
    const name = prompt("Customer / supplier name:");
    const date = prompt("Promise to pay date (YYYY-MM-DD):");
    if (name && date) {
      const rows = financeRows("age").map((row) => String(row.partyName || "").toLowerCase() === name.toLowerCase() ? { ...row, promiseToPayDate: date, status: "Promise to pay" } : row);
      saveFinanceRows("age", rows);
      financeAudit("Promise to pay added", name, date);
      renderFinanceHub("outstanding30");
    }
    return;
  }
  if (event.target.closest("[data-finance-status]")) {
    const name = prompt("Customer / supplier name:");
    const status = prompt("Status: Not contacted, Contacted, Promise to pay, Payment received, Dispute, Handed over");
    if (name && status) {
      const rows = financeRows("age").map((row) => String(row.partyName || "").toLowerCase() === name.toLowerCase() ? { ...row, status } : row);
      saveFinanceRows("age", rows);
      financeAudit("Status changed", name, status);
      renderFinanceHub("outstanding30");
    }
    return;
  }
  const moduleCard = event.target.closest("[data-open-section]");
  const section = moduleCard?.dataset.openSection;
  if (section) {
    showSection(section);
    window.location.hash = section;
    writeAudit("Opened module", sectionHeadings[section]?.title || section, "Portal", section, "Opened from portal dashboard");
    return;
  }
  const button = event.target.closest("[data-open-hub]");
  const slug = button?.dataset.openHub;
  if (!slug) return;
  console.log("Hub card clicked", { hubSlug: slug });
  const hub = storageList(hubsStorageKey).find((item) => item.slug === slug);
  if (hub?.status === "active") {
    const section = firstAccessibleQuotationSection();
    openHub(slug, slug === "quotation-hub" ? section : "dashboard");
    writeAudit("Opened hub", hub.name, "Portal", hub.slug, `Opened ${hub.name} in a new tab`);
    return;
  }
  openPlaceholderHub(slug);
});

portalHubGrid.addEventListener("submit", async (event) => {
  const costForm = event.target.closest("[data-cost-form]");
  if (!costForm) return;
  event.preventDefault();
  await handleCostFormSubmit(costForm);
});

portalHubGrid.addEventListener("input", (event) => {
  if (event.target.matches("[data-cost-request-filter]")) {
    costRequestFilters[event.target.dataset.costRequestFilter] = event.target.value;
    applyCostRequestFilters();
    return;
  }
  if (event.target.matches("[data-cost-approval-filter]")) {
    costApprovalFilters[event.target.dataset.costApprovalFilter] = event.target.value;
    applyCostApprovalFilters();
    return;
  }
  if (!event.target.matches('[name="lineQuantity"], [name="lineUnitCost"]')) return;
  const form = event.target.closest('[data-cost-form="request"], [data-cost-form="rejectedPo"]');
  if (form) updateCostRequestTotals(form);
});

portalHubGrid.addEventListener("change", async (event) => {
  if (event.target.matches("[data-cost-approval-filter]")) {
    costApprovalFilters[event.target.dataset.costApprovalFilter] = event.target.value;
    applyCostApprovalFilters();
    return;
  }
  if (event.target.matches("[data-cost-request-filter]")) {
    costRequestFilters[event.target.dataset.costRequestFilter] = event.target.value;
    applyCostRequestFilters();
    return;
  }
  if (event.target.matches("[data-cost-entity-balance-upload]")) {
    await importCostEntityBalances(event.target.files?.[0]);
    event.target.value = "";
    return;
  }
  if (event.target.matches("[data-cost-dashboard-filter]")) {
    costDashboardFilters[event.target.dataset.costDashboardFilter] = event.target.value;
    renderCostHub("dashboard");
    return;
  }
  if (event.target.matches("[data-cost-request-supplier]")) {
    const form = event.target.closest('[data-cost-form="request"]');
    const supplier = costRows("suppliers").find((item) => item.status !== "Archived" && item.name.trim().toLowerCase() === event.target.value.trim().toLowerCase());
    const fields = ["registrationNumber", "vatNumber", "email", "phone", "category", "address", "bankName", "accountNumber", "branchCode", "paymentTerms"];
    form.elements.supplierId.value = supplier?.id || "";
    fields.forEach((name) => { form.elements[name].value = supplier?.[name] || (name === "paymentTerms" ? "30 days" : ""); form.elements[name].readOnly = Boolean(supplier) && form.elements[name].tagName !== "SELECT"; form.elements[name].disabled = false; });
    return;
  }
  if (event.target.matches("[data-governance-hub-access]")) {
    setGovernanceHubAccess(event.target.dataset.memberId, event.target.dataset.hubSlug, event.target.checked);
    return;
  }
  if (event.target.matches("[data-governance-filter]")) {
    governanceAuditFilters[event.target.dataset.governanceFilter] = event.target.value;
    writeAudit("Changed audit search filter", event.target.dataset.governanceFilter, "Administration & Governance", "Audit Search Centre", event.target.value);
    renderGovernanceHub("search");
    return;
  }
  const openingEdit = event.target.dataset.financeOpeningEdit;
  if (openingEdit !== undefined) {
    const field = event.target.dataset.financeOpeningField;
    const date = event.target.dataset.financeOpeningDate;
    const name = event.target.dataset.financeOpeningName;
    const group = event.target.dataset.financeOpeningGroup || "";
    const accountCode = event.target.dataset.financeOpeningCode || slugify(name).toUpperCase();
    const rowOrder = Number(event.target.dataset.financeOpeningRowOrder || 9999);
    const rows = financeRows("opening");
    let updated = false;
    const nextRows = rows.map((row) => {
      const matches = (openingEdit && row.id === openingEdit)
        || (row.openingDate === date && Number(row.rowOrder ?? -1) === rowOrder && (!accountCode || row.accountCode === accountCode))
        || (row.openingDate === date && (row.accountName || row.partyName) === name && Number(row.rowOrder ?? -1) === rowOrder);
      if (!matches) return row;
      updated = true;
      return { ...row, [field]: Number(event.target.value || 0), source: "Manual", importedAt: new Date().toISOString(), importedBy: currentUserName() };
    });
    if (!updated) {
      nextRows.push({
        id: `finance-opening-manual-${date}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        accountCode,
        accountName: name,
        partyName: name,
        group,
        branch: "",
        rowType: "account",
        rowOrder,
        openingDate: date,
        openingBalance: field === "openingBalance" ? Number(event.target.value || 0) : 0,
        availableBalance: field === "availableBalance" ? Number(event.target.value || 0) : 0,
        source: "Manual",
        importedAt: new Date().toISOString(),
        importedBy: currentUserName(),
      });
      updated = true;
    }
    if (updated) {
      saveFinanceRows("opening", nextRows);
      financeAudit("Balance manually edited", `${name} - ${financeOpeningDateLabel(date)}`, `${field}: ${event.target.value}`);
      renderFinanceHub("opening");
    }
    return;
  }
  const type = event.target.dataset.financeUpload;
  if (!type) return;
  await financeImportFile(type, event.target.files?.[0]);
  event.target.value = "";
});

function installUiPositionPreservation() {
  renderAll = withUiPositionPreserved(renderAll);
  renderPreview = withUiPositionPreserved(renderPreview);
  renderCosting = withUiPositionPreserved(renderCosting);
  renderDashboard = withUiPositionPreserved(renderDashboard);
  renderProjections = withUiPositionPreserved(renderProjections);
  renderAudit = withUiPositionPreserved(renderAudit);
  renderSetup = withUiPositionPreserved(renderSetup);
  renderMembers = withUiPositionPreserved(renderMembers);
  renderSetupSalesReps = withUiPositionPreserved(renderSetupSalesReps);
  renderSupplierPrices = withUiPositionPreserved(renderSupplierPrices);
  renderGuardingPriceManagement = withUiPositionPreserved(renderGuardingPriceManagement);
  renderClients = withUiPositionPreserved(renderClients);
  renderSalesRequests = withUiPositionPreserved(renderSalesRequests);
  renderSalesRequestDocuments = withUiPositionPreserved(renderSalesRequestDocuments);
  renderSalesRequestSummary = withUiPositionPreserved(renderSalesRequestSummary);
  renderGuardingBuilder = withUiPositionPreserved(renderGuardingBuilder);
  renderGuardingLineItemRows = withUiPositionPreserved(renderGuardingLineItemRows);
  renderGuardingPreview = withUiPositionPreserved(renderGuardingPreview);
  renderArmedResponseBuilder = withUiPositionPreserved(renderArmedResponseBuilder);
  renderArmedResponseRows = withUiPositionPreserved(renderArmedResponseRows);
  renderArmedResponsePreview = withUiPositionPreserved(renderArmedResponsePreview);
  renderProjectTimeline = withUiPositionPreserved(renderProjectTimeline);
  renderProjectTimelineDetail = withUiPositionPreserved(renderProjectTimelineDetail);
  renderApprovals = withUiPositionPreserved(renderApprovals);
  renderApprovalDetail = withUiPositionPreserved(renderApprovalDetail);
  renderQuoteLibrary = withUiPositionPreserved(renderQuoteLibrary);
  renderQuoteLibraryDetail = withUiPositionPreserved(renderQuoteLibraryDetail);
  renderFinanceHub = withUiPositionPreserved(renderFinanceHub);
  renderGovernanceHub = withUiPositionPreserved(renderGovernanceHub);
  renderPortal = withUiPositionPreserved(renderPortal);
}

installUiPositionPreservation();
seedPortalTables();
refreshFirstSetupAccess();
migrateSalesRequestStatuses();
renderPermissionChecklist(roleDefaultPermissions[memberAccess.value] || []);
renderRequestSalesRepOptions();
autoPopulateRequestSalesRep(true);
const hasSsoParamOnLoad = new URLSearchParams(window.location.search).has("sso");
const isQuotationHubRouteOnLoad = window.location.pathname.startsWith("/hubs/quotation-hub");
const isCompanyHubRouteOnLoad = window.location.pathname.startsWith("/hubs/");
if (isHubSsoRoute() || hasSsoParamOnLoad || isCompanyHubRouteOnLoad) {
  hydrateSharedSessionFromUrl();
} else {
  clearSharedSession();
}
loadSalesRepsFromStorage();
renderSalesRepOptions();
populateGuardingCompanyOptions();
populateArmedResponseCompanyOptions();
resetGuardingQuote(false);
resetArmedResponseQuote(false);
loadGuardingPriceCatalog();
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
renderSalesRequestBadge();
const routeSection = window.location.hash.slice(1) === "approval" ? "approvals" : window.location.hash.slice(1);
const initialSection = ["portal", "projections", "dashboard", "builder", "guardingBuilder", "armedResponseBuilder", "salesRequests", "approvals", "library", "projectTimeline", "settings", "audit"].includes(routeSection)
  ? routeSection
  : "portal";
handlePasswordResetTokenFromUrl().then((handledReset) => {
  if (handledReset) return true;
  return consumeHubSsoTokenIfPresent();
}).then(async (handledSso) => {
  if (handledSso) return;
  const refreshed = await refreshBackendSession();
  if (refreshed) {
    loginScreen.hidden = true;
    applyPermissions();
  }
  if (isQuotationHubRouteOnLoad && isSignedIn()) {
    loginScreen.hidden = true;
    applyPermissions();
    const hubSection = canAccess(initialSection) && !["portal", "dashboard"].includes(initialSection)
      ? initialSection
      : firstAccessibleQuotationSection();
    showSection(hubSection);
  } else if (isPlaceholderHubRoute() && isSignedIn()) {
    loginScreen.hidden = true;
    applyPermissions();
    showSection("portal");
  } else if (hasSsoParamOnLoad && isSignedIn()) {
    loginScreen.hidden = true;
    applyPermissions();
    showSection("portal");
  } else if (isSignedIn()) {
    loginScreen.hidden = true;
    applyPermissions();
    showSection("portal");
  } else {
    loginScreen.hidden = false;
    window.location.hash = "portal";
  }
});

window.addEventListener("storage", (event) => {
  if (event.key !== salesRequestsStorageKey || !isSignedIn()) return;
  renderSalesRequestBadge();
  if (document.body.dataset.activeSection === "salesRequests") renderSalesRequests();
});

setInterval(() => {
  if (!isSignedIn()) return;
  renderSalesRequestBadge();
  if (document.body.dataset.activeSection === "salesRequests") renderSalesRequests();
}, 15000);

(function patchBarChart() {
  if (typeof renderBarChart !== "function") return;
  window.renderBarChart = function (target, rows, valueKey, labelKey, formatter) {
    target.innerHTML = "";
    if (!rows || !rows.length) {
      target.innerHTML = '<p style="padding:20px 0;text-align:center;color:#6b7a8d;font-size:13px;">No data for the selected period.</p>';
      return;
    }
    const max = Math.max(...rows.map((r) => Number(r[valueKey] || 0)), 1);
    rows.forEach((row, i) => {
      const value = Number(row[valueKey] || 0);
      const pct = value > 0 ? Math.max((value / max) * 100, 3) : 0;
      const bar = document.createElement("div");
      bar.className = "dashboard-bar-row";
      bar.innerHTML = `
        <span title="${String(row[labelKey] || "").replace(/"/g, "&quot;")}">${String(row[labelKey] || "")}</span>
        <div role="progressbar" aria-valuenow="${value}" aria-valuemax="${max}">
          <i style="width:0%;transition:width .5s cubic-bezier(.4,0,.2,1) ${i * 40}ms" data-w="${pct}"></i>
        </div>
        <strong>${formatter ? formatter(value) : String(value)}</strong>
      `;
      target.appendChild(bar);
    });
    requestAnimationFrame(() => {
      target.querySelectorAll(".dashboard-bar-row i[data-w]").forEach((el) => {
        el.style.width = el.dataset.w + "%";
      });
    });
  };
})();

(function patchSectionTransitions() {
  if (typeof showSection !== "function") return;
  const _orig = showSection;
  window.showSection = function (sectionName) {
    _orig(sectionName);
    const activeEl = document.querySelector("#" + sectionName + "-section");
    if (activeEl && !activeEl.hidden) {
      activeEl.style.opacity = "0";
      activeEl.style.transform = "translateY(6px)";
      requestAnimationFrame(() => {
        activeEl.style.transition = "opacity .2s ease, transform .2s ease";
        activeEl.style.opacity = "1";
        activeEl.style.transform = "translateY(0)";
      });
    }
  };
})();

document.addEventListener("keydown", function(e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
  if (e.key === "n" || e.key === "N") {
    var btn = document.querySelector('[data-section="builder"]');
    if (btn && !btn.hidden) btn.click();
  }
});
