export interface Profile {
  name: string;
  fullName?: string;
  state: string;
  district: string;
  age: number;
  dateOfBirth?: string;
  gender: string;
  occupation: string;
  income: string;
  education: string;
  caste: string;
  landHolding?: string;
  bplStatus?: string;
  disabilityStatus?: string;
  maritalStatus?: string;
  minorityStatus?: string;
  residenceType?: string;
  existingDocs: string[];
  businessName?: string;
  msmeCategory?: string;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
  email?: string;
  language?: string;
  preferredLanguage?: string;
  photoUrl?: string;
  voiceEnabled?: boolean;
  role?: string;
  digilockerPin?: string;
  city?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  mobile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CitizenProfile = Profile;
export type UserProfile = Profile;

export type WorkflowStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED";
export type StepStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "FAILED";
export type TimelineClassification = "STATUTORY_SLA" | "SYSTEM_ESTIMATE";
export type TrackingStage = "PREPARED" | "SUBMITTED" | "ACKNOWLEDGED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED" | "UNAVAILABLE";

export interface HumanBlockerInfo {
  cannotCompleteStepTitle: string;
  firstRequirement: string;
  whyReason: string;
  nextAction: string;
  actionCtaLabel: string;
  actionUrl?: string;
  targetStepId?: string;
  missingDocumentName?: string;
}

export interface StepDocumentRequirement {
  name: string;
  purpose?: string;
  status: "AVAILABLE" | "MISSING" | "INVALID" | "EXPIRED";
  verified?: boolean;
}

export interface Step {
  id: string;
  title: string;
  purpose: string;
  whyRequired: string;
  mandatory: boolean;
  dependencies: string[];
  dept: string;
  portal: string;
  timeline: string;
  output: string;
  completed?: boolean;
  status?: StepStatus;
  blockingReason?: string;
  humanBlocker?: HumanBlockerInfo;
  requiredDocName?: string;
  documentsNeeded?: StepDocumentRequirement[];
  issuingAuthorityOffice?: string;
  informationStatus?: "CONFIRMED" | "NEEDS_VERIFICATION";
  verificationNotice?: string;
  timelineType?: TimelineClassification;
  timelineLabel?: string;
  officialLaunchUrl?: string;
  acknowledgementNumber?: string;
  trackingStatus?: TrackingStage;
  trackingStatusLabel?: string;
  completedAt?: string;
}

export interface Phase {
  phaseName: string;
  steps: Step[];
}

export interface GovDocument {
  id: string;
  name: string;
  purpose: string;
  where: string;
  mandatory: boolean;
  validity: string;
  estimatedTime: string;
  uploaded?: boolean;
  uploadedFileName?: string;
  category?: string;
  storagePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  fileType?: string;
  validityDate?: string;
  stepId?: string;
  verificationStatus?: "AVAILABLE" | "MISSING" | "INVALID" | "EXPIRED";
}

export interface Scheme {
  name: string;
  reason: string;
  howToApply: string;
  portal: string;
  isConfirmedEligible?: boolean;
  type?: "CONFIRMED_ELIGIBLE" | "POTENTIALLY_RELEVANT_DISCOVERY";
}

export interface NextBestAction {
  actionId: string;
  title: string;
  description: string;
  stepId: string;
  stepTitle: string;
  type: "UPLOAD_DOC" | "VISIT_PORTAL" | "VERIFY_INFO" | "PAY_FEE" | "SCHEDULE_APPOINTMENT";
  urgency: "HIGH" | "MEDIUM" | "LOW";
  actionUrl?: string;
  portalName?: string;
  blockingReason?: string;
  humanBlocker?: HumanBlockerInfo;
  ctaLabel?: string;
}

export interface CitizenJourneyIntelligence {
  whereAmI: {
    currentStepIndex: number;
    currentStepNumber: number;
    totalSteps: number;
    summary: string;
  };
  whyAmIHere: string;
  whatDoIHave: Array<{ name: string; status: "AVAILABLE" | "VERIFIED" }>;
  whatIsMissing: Array<{ name: string; reason: string; mandatory: boolean }>;
  whyIsItMissing: string;
  whatExactlyShouldIDo: string;
  whatHappensAfterThat: string[];
  recalculatesOnChange: boolean;
  isBlocked: boolean;
  humanBlocker?: HumanBlockerInfo;
  informationStatus: "CONFIRMED" | "NEEDS_VERIFICATION";
  verificationNotice?: string;
}

export interface JourneyMemory {
  lastCompletedStepId?: string;
  lastCompletedStepTitle?: string;
  lastCompletedAt?: string;
  currentStepId?: string;
  currentStepTitle?: string;
  blockedCount: number;
  completedCount: number;
  totalCount: number;
  memorySummary: string;
  nextRecommendedStep?: string;
}

export interface RoadmapData {
  id?: string;
  goal: string;
  category: string;
  workflowStatus?: WorkflowStatus;
  completionPercentage: number;
  phases: Phase[];
  documents: GovDocument[];
  eligibleSchemes: Scheme[];
  confirmedEligibleSchemes?: Scheme[];
  potentiallyRelevantSchemes?: Scheme[];
  potentialFutureServices: string[];
  commonMistakes: string[];
  updatedAt?: string;
  isArchived?: boolean;
  archivedAt?: string;
  nextBestAction?: NextBestAction;
  journeyMemory?: JourneyMemory;
  citizenIntelligence?: CitizenJourneyIntelligence;
  applicationRefId?: string;
  trackingStatus?: TrackingStage;
  trackingStatusMessage?: string;
  officialPortal?: {
    name: string;
    url: string;
    department: string;
    state: string;
  };
}

export interface RequiredDocItem {
  name: string;
  category: string;
  mandatory: boolean;
  whereToGet: string;
}

export interface MissingDocItem {
  name: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
}

export interface RecommendedServiceItem {
  name: string;
  description: string;
  portalUrl: string;
  category?: string;
}

export interface EligibleSchemeItem {
  name: string;
  department: string;
  grantOrBenefit: string;
  matchingReason: string;
  requiredDocuments: string[];
  portalUrl: string;
}

export interface EligibilityCheckResult {
  id: string;
  timestamp: string;
  profileSnapshot: Partial<Profile>;
  eligibilityScore: number;
  applicationReadiness?: number;
  statusSummary: string;
  eligibleSchemes: EligibleSchemeItem[];
  eligibleServices?: Array<{
    id: string;
    name: string;
    department: string;
    grantOrBenefit: string;
    matchingReason: string;
    portalUrl: string;
    requiredDocuments: string[];
    slaDays: number;
  }>;
  likelyEligibleSchemes?: Array<{
    id: string;
    name: string;
    department: string;
    grantOrBenefit: string;
    missingConditionReason: string;
    actionToQualify: string;
    portalUrl: string;
  }>;
  missingRequirements?: Array<{
    ruleId: string;
    schemeName: string;
    criterion: string;
    currentValue: string;
    requiredValue: string;
    severity: "High" | "Medium" | "Low";
  }>;
  requiredDocuments: RequiredDocItem[];
  missingDocuments: MissingDocItem[];
  recommendedServices: RecommendedServiceItem[];
  priorityRecommendations?: string[];
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'sla_alert' | 'doc_expiry' | 'system' | 'eligibility' | 'info';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface StructuredDocStatusItem {
  id: string;
  name: string;
  purpose: string;
  whereToGet?: string;
  where?: string;
  mandatory: boolean;
  validity?: string;
  estimatedTime?: string;
  status: "AVAILABLE" | "MISSING" | "EXPIRED" | "UNVERIFIED" | "NEEDS_VERIFICATION";
  matchedVaultDocId?: string;
  issuingAuthority?: string;
  howToObtain?: {
    authority?: string;
    supportingDocsRequired?: string[];
    timeline?: string;
    website?: string;
  } | string;
}

export interface MissingDocProcedure {
  documentName: string;
  whyRequired: string;
  issuingAuthority: string;
  howToObtain: string;
  requiredSupportingDocs: string[];
  officialPortalUrl: string;
  estimatedTimeline: string;
}

export interface StructuredEligibilityInfo {
  status: "ELIGIBLE" | "NOT_ELIGIBLE" | "POSSIBLY_ELIGIBLE" | "UNABLE_TO_VERIFY";
  summary: string;
  explanation?: string;
  matchingCriteria?: string[];
  matchedCriteria?: string[];
  missingCriteria?: string[];
  actionToQualify?: string;
}

export interface StructuredOfficialSource {
  name: string;
  department: string;
  url: string;
  verificationStatus?: string;
  freshnessState?: string;
}

export interface StructuredNextAction {
  title?: string;
  label: string;
  description: string;
  actionType: "START_ROADMAP" | "UPLOAD_DOC" | "VISIT_PORTAL" | "VIEW_ELIGIBILITY" | "GENERIC";
  targetUrl?: string;
}

export interface StructuredAiResponse {
  type?: "government_service_roadmap" | "information_guidance" | "missing_document_procedure";
  jurisdiction?: string;
  explanation?: string;
  goal?: string;
  title: string;
  summary: string;
  confidenceScore?: number;
  executionProvenance?: "FEATHERLESS_LIVE_AI" | "OFFLINE_SANDBOX_DEMO" | "GAZETTE_RAG_CORPUS" | string;
  requiresHumanEscalation?: boolean;
  context: {
    userProfileJurisdiction: string;
    queryJurisdiction: string;
    district?: string;
    preferredLanguage: string;
    matchedVaultDocsCount: number;
  };
  steps: Array<{
    id: string;
    title: string;
    purpose: string;
    whyRequired: string;
    mandatory: boolean;
    dept: string;
    portal: string;
    timeline: string;
    output?: string;
    dependencies?: string[];
  }>;
  documents: StructuredDocStatusItem[];
  documentStatus?: StructuredDocStatusItem[];
  eligibility: StructuredEligibilityInfo;
  deadline?: {
    daysRemaining?: number;
    targetDate?: string;
    description: string;
  } | null;
  missingDocumentProcedure?: MissingDocProcedure | null;
  officialSources: StructuredOfficialSource[];
  nextAction: StructuredNextAction;
  followUps: string[];
  roadmapData?: RoadmapData | null;
}

export interface Message {
  id: string;
  userId?: string;
  role: "user" | "model";
  content: string;
  title?: string;
  prompt?: string;
  response?: string;
  timestamp?: string;
  answer?: string;
  confidenceScore?: number;
  evaluation?: string;
  sourcesUsed?: { name: string; type: string; detail: string }[];
  latencyMs?: number;
  tokensCount?: number;
  roadmapData?: RoadmapData | null;
  structuredResponse?: StructuredAiResponse | null;
  queryJurisdiction?: string;
  languageUsed?: string;
  reasoningSteps?: AIReasoningStep[];
  referencedDocs?: { id: string; name: string; docType?: string; extractedSnippet?: string }[];
  workflowRefs?: { id: string; goal?: string; currentStep?: string }[];
  explainabilityPayload?: ExplainabilityPayload | null;
  actionPlan?: ActionPlan | null;
  auditLogs?: OrchestratorAuditLogEntry[];
  executionProvenance?: "FEATHERLESS_LIVE_AI" | "OFFLINE_SANDBOX_DEMO" | "GAZETTE_RAG_CORPUS" | string;
  isDegradedFallback?: boolean;
  fallbackType?: "AI_UNAVAILABLE" | "TIMEOUT" | "RATE_LIMITED" | string;
}

export interface AIReasoningStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: string;
  details?: string;
}

export interface AIWorkspace {
  id: string;
  userId?: string;
  name: string;
  iconName: string;
  description: string;
  color: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  workspaceId: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  referencedDocs?: { id: string; name: string; docType?: string }[];
  workflowReferences?: string[];
  pinnedMessages?: string[];
  status: 'active' | 'archived';
  pinned?: boolean;
  favorite?: boolean;
  summary?: string;
}

export interface CitizenTimelineEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'document' | 'conversation' | 'roadmap' | 'eligibility' | 'notification' | 'profile' | 'ocr';
  timestamp: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export type SourceType = 
  | "official_webpage" 
  | "official_pdf" 
  | "circular" 
  | "notification" 
  | "scheme_document" 
  | "service_documentation" 
  | "official_api_docs";

export type VerificationStatus = 
  | "VERIFIED" 
  | "PENDING_VERIFICATION" 
  | "REVIEW_REQUIRED" 
  | "ARCHIVED" 
  | "REJECTED";

export type FreshnessState = 
  | "CURRENT" 
  | "REVIEW_REQUIRED" 
  | "STALE" 
  | "EXPIRED";

export type SourceConfidenceLabel = 
  | "Verified" 
  | "Partially verified" 
  | "Unverified";

export interface GovernmentSource {
  sourceId: string;
  department: string;
  ministry: string;
  service: string;
  state: string;
  district: string;
  title: string;
  sourceUrl: string;
  documentUrl: string;
  sourceType: SourceType;
  publishedAt: string;
  effectiveFrom: string;
  effectiveUntil: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  freshnessState?: FreshnessState;
  confidenceLabel?: SourceConfidenceLabel;
  version: number;
  contentHash: string;
  language: string;
  jurisdiction: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  fullRuleText: string;
  summary: string;
  clauseReference: string;
  category?: string;
  tags?: string[];
  vectorEmbedding?: number[];
  ingestionErrors?: string[];
}

export interface GovernmentSourceVersion {
  versionId: string;
  sourceId: string;
  version: number;
  snapshot: GovernmentSource;
  changedBy: string;
  changeReason: string;
  createdAt: string;
}

export interface RetrievedChunkProvenance {
  sourceId: string;
  title: string;
  sourceUrl: string;
  documentUrl: string;
  department: string;
  ministry: string;
  pageSectionRef: string;
  retrievalTimestamp: string;
  version: number;
  verificationStatus: VerificationStatus;
  freshnessState: FreshnessState;
  confidenceLabel: SourceConfidenceLabel;
  effectiveFrom: string;
  effectiveUntil: string;
  lastVerifiedAt: string;
  score?: number;
}

export interface Phase1TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

// Phase 2: Citizen Intelligence Engine Data Types
export interface UnifiedCitizenContext {
  userId: string;
  profile: Profile;
  vaultDocs: any[];
  roadmaps: any[];
  eligibilityResult: EligibilityCheckResult | null;
  notifications: UserNotification[];
  conversationHistorySnapshot: Array<{ role: 'user' | 'assistant'; text: string; timestamp: string }>;
  sanitized: boolean;
  privacyMaskedFields: string[];
}

export type LifeEventType = 
  | "Relocation / Location Change" 
  | "Starting Business / MSME" 
  | "Higher Education" 
  | "Housing & Land Purchase" 
  | "Senior Care & Pension" 
  | "Document Issuance & Renewal"
  | "Healthcare & Insurance"
  | "General Inquiry";

export interface StructuredCitizenIntent {
  intentId: string;
  query: string;
  primaryIntent: string;
  lifeEvent: LifeEventType;
  locationChange: {
    isRelocating: boolean;
    fromState?: string;
    toState?: string;
  };
  potentialServices: string[];
  requiredContextKeys: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  clarificationPrompts: string[];
}

export type RequirementMatchStatus = "AVAILABLE" | "MISSING" | "INVALID" | "EXPIRED" | "UNKNOWN";

export interface RequirementMatchItem {
  requirementId: string;
  requirementName: string;
  category: string;
  mandatory: boolean;
  status: RequirementMatchStatus;
  vaultDocId?: string;
  vaultDocName?: string;
  currentValue?: string;
  requiredValue?: string;
  reason: string;
  actionToResolve: string;
  provenance: RetrievedChunkProvenance | null;
}

export interface ExplainabilityPayload {
  recommendationId: string;
  title: string;
  whyRecommended: string;
  dataPointsUsed?: Array<{
    label: string;
    value: string;
    source: "Profile" | "Vault" | "Roadmap" | "Eligibility Engine" | "Government Source";
  }>;
  dataSourcesUsed?: Array<{
    sourceId: string;
    title: string;
    provenance: string;
    freshnessState: string;
  }>;
  officialSource?: {
    title: string;
    clauseReference: string;
    sourceUrl: string;
    department: string;
  };
  ruleEngineRationale?: string[];
  maskedFieldsUsed?: string[];
  missingGaps?: string[];
  nextSteps?: string[];
  confidenceState: {
    level: "HIGH" | "MEDIUM" | "LOW";
    message?: string;
    score?: number;
    needsClarification?: boolean;
  };
}

export interface UserContextCorrection {
  state?: string;
  district?: string;
  income?: string;
  occupation?: string;
  caste?: string;
  targetState?: string;
  excludedVaultDocIds?: string[];
  notes?: string;
  updatedAt: string;
}

export interface Phase2TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

// Phase 4: Secure Vault & Document Intelligence Engine Types
export type VaultDocumentState = "VALID" | "INVALID" | "EXPIRED" | "EXPIRING" | "PROCESSING" | "UNVERIFIED";
export type VaultDocumentProcessingStatus = "PROCESSING" | "COMPLETED" | "FAILED";
export type VaultDocumentVerificationStatus = "VERIFIED" | "UNVERIFIED" | "REVIEW_REQUIRED" | "REJECTED";

export interface DocumentAuditLogEntry {
  logId: string;
  documentId: string;
  userId: string;
  operation: "UPLOAD" | "OCR_EXTRACT" | "CLASSIFICATION" | "WORKFLOW_MATCH" | "DELETE" | "ACCESS_ATTEMPT" | "SHARING_PERMITTED" | "SECURITY_SCAN";
  status: "SUCCESS" | "DENIED" | "WARNING";
  timestamp: string;
  details: string;
  requestingUserId?: string;
}

export interface VaultDocumentModel {
  documentId: string;
  userId: string;
  type: string;
  issuer: string;
  documentNumber: string;
  issueDate?: string;
  expiryDate?: string;
  language?: string;
  verificationStatus: VaultDocumentVerificationStatus;
  processingStatus: VaultDocumentProcessingStatus;
  documentState: VaultDocumentState;
  createdAt: string;
  updatedAt: string;
  fileSize?: number;
  mimeType?: string;
  storageUrl?: string;
  extractedFields?: { fieldName: string; fieldValue: string; confidence?: number; isValid?: boolean }[];
  ocrRawText?: string;
  matchedWorkflows?: { workflowId: string; workflowGoal: string; updatedStepId: string; updatedStepTitle: string }[];
  daysUntilExpiry?: number;
  auditLogs?: DocumentAuditLogEntry[];
  userAuthorizedExternalSharing?: boolean;
}

export interface Phase4TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

// Phase 5: AI Orchestrator & Smart Automation Types
export type ToolRiskLevel = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK";
export type ActionExecutionStatus = "PENDING" | "AWAITING_APPROVAL" | "APPROVED" | "EXECUTED" | "REJECTED" | "DENIED" | "DECLINED" | "FAILED";

export interface RegisteredToolDefinition {
  toolId: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  permission: string;
  riskLevel: ToolRiskLevel;
  approvalRequired: boolean;
  auditRequired: boolean;
  enabled: boolean;
}

export interface ExecutableActionItem {
  actionId: string;
  toolId: string;
  actionName: string;
  description: string;
  inputParams: Record<string, any>;
  riskLevel: ToolRiskLevel;
  approvalRequired: boolean;
  status: ActionExecutionStatus;
  executionResult?: any;
  verificationStatus?: "VERIFIED" | "FAILED" | "PENDING" | "DECLINED" | "SKIPPED";
  expectedResultPattern?: string;
  failureReason?: string;
  executedAt?: string;
  retryCount?: number;
}

export interface ActionPlan {
  planId: string;
  workflowId: string;
  userQuery: string;
  goal: string;
  actions: ExecutableActionItem[];
  createdAt: string;
  status: "DRAFT" | "READY_FOR_APPROVAL" | "EXECUTING" | "COMPLETED" | "PARTIAL_FAILURE" | "DENIED";
}

export interface OrchestratorAuditLogEntry {
  logId: string;
  workflowId: string;
  actionId: string;
  toolId: string;
  userId: string;
  riskLevel: ToolRiskLevel;
  dataAccessed: string[];
  policyDecision: string;
  approvalGranted?: boolean;
  approvalRecord?: {
    approvedBy: string;
    approvedAt: string;
    decision: "APPROVED" | "REJECTED";
    notes?: string;
  };
  executionResult?: any;
  verificationStatus: "VERIFIED" | "FAILED" | "SKIPPED" | "DECLINED" | "PENDING";
  failureReason?: string;
  timestamp: string;
}

export interface Phase5TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

// Phase 7: Trust, Security & Production Hardening Types
export type SecurityRole = "citizen" | "administrator" | "knowledge_manager" | "support_operator";

export type SecurityRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityAuditLogEntry {
  logId: string;
  timestamp: string;
  userId: string;
  role: SecurityRole;
  eventType: "AUTH" | "ACCESS_CONTROL" | "DOCUMENT_SECURITY" | "SECRET_AUDIT" | "INPUT_VALIDATION" | "RATE_LIMIT" | "BACKUP" | "ADMIN_ACTION" | "DATA_RIGHTS" | "RBAC_MUTATION";
  action: string;
  resource: string;
  requestingIp: string;
  status: "ALLOWED" | "DENIED" | "BLOCKED" | "SUCCESS" | "FAILED";
  riskLevel: SecurityRiskLevel;
  details: string;
  metadata?: Record<string, any>;
}

export interface SystemTelemetryMetrics {
  timestamp: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  uptimeSeconds: number;
  totalRequests: number;
  activeSessions: number;
  errorRatePercentage: number;
  avgLatencyMs: number;
  authFailuresCount: number;
  crossUserAccessAttemptsBlocked: number;
  aiFailuresCount: number;
  workflowFailuresCount: number;
  docProcessingFailuresCount: number;
  rateLimitBreachesCount: number;
  activeRateLimiters: number;
  backupsCreatedCount: number;
}

export interface SystemBackupManifest {
  backupId: string;
  timestamp: string;
  createdBy: string;
  version: string;
  checksum: string;
  totalRecords: number;
  fileSizeBytes: number;
  status: "VERIFIED" | "CORRUPTED" | "RESTORED";
  entityCounts: {
    sources: number;
    knowledgeCorpus: number;
    auditLogs: number;
    userProfiles: number;
  };
}

export interface Phase7TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

export type ProactiveEventType =
  | "document_uploaded"
  | "document_expiring"
  | "workflow_step_completed"
  | "workflow_blocked"
  | "deadline_approaching"
  | "deadline_reached"
  | "status_changed"
  | "eligibility_changed"
  | "new_verified_information"
  | "approval_required"
  | "action_failed";

export type NotificationPriority = "INFO" | "ACTION_REQUIRED" | "URGENT" | "DEADLINE";

export type NotificationCategory = "vault" | "workflow" | "deadlines" | "eligibility" | "system";

export type NotificationChannel = "in_app" | "sms" | "email" | "whatsapp";

export type NotificationLifecycleState = "CREATED" | "SENT" | "DELIVERED" | "READ" | "UNREAD" | "ACTION_TAKEN";

export interface UserNotificationPreferences {
  channels: Record<NotificationChannel, boolean>;
  categories: Record<NotificationCategory, boolean>;
  minimumPriority: NotificationPriority;
}

export interface CrossJourneyConsentPermission {
  id: string;
  journeyId: string;
  journeyName: string;
  requestedDocType: string;
  purpose: string;
  status: "ALLOWED" | "DENIED" | "PENDING";
  updatedAt: string;
}

export interface ProactiveNotification {
  notificationId: string;
  id?: string;
  userId: string;
  eventType: ProactiveEventType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  deduplicationKey: string;
  lifecycleState: NotificationLifecycleState;
  channelsDelivered: NotificationChannel[];
  createdAt: string;
  readAt?: string;
  actionTakenAt?: string;
  auditTrail: {
    state: NotificationLifecycleState;
    timestamp: string;
    details: string;
  }[];
}

export interface ProactiveEventRecord {
  eventId: string;
  eventType: ProactiveEventType;
  userId: string;
  entityId: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface Phase6TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

// Phase 9: Scale, Commercialization & Multi-Service Architecture Types
export interface JurisdictionModel {
  countryCode: string; // e.g., "IN"
  stateCode: string; // e.g., "MH", "KA", "DL", "RJ"
  districtName: string; // e.g., "Pune", "Bengaluru Urban"
  departmentId: string; // e.g., "DEPT_REVENUE", "DEPT_SOCIAL_JUSTICE"
  departmentName: string; // e.g., "Department of Revenue"
}

export interface DynamicFormFieldDefinition {
  fieldKey: string;
  label: string;
  fieldType: "text" | "number" | "select" | "date" | "file" | "checkbox";
  required: boolean;
  options?: string[];
  validationRegex?: string;
  helpText?: string;
}

export interface ServiceConfigDefinition {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  jurisdiction: JurisdictionModel;
  category: "CERTIFICATE" | "LICENSE" | "SCHEME" | "PERMIT" | "TAX" | "UTILITY";
  slaDays: number;
  description: string;
  eligibilityCriteria: {
    minAge?: number;
    maxIncomeINR?: number;
    residentStateRequired?: boolean;
    casteCategory?: string[];
    customRuleExpression?: string;
  };
  requiredDocuments: {
    docTypeCode: string;
    docName: string;
    mandatory: boolean;
    validityMonths?: number;
  }[];
  workflowPhases: {
    phaseId: string;
    phaseName: string;
    sequenceOrder: number;
    steps: {
      stepId: string;
      title: string;
      actor: "CITIZEN" | "SYSTEM_AI" | "DEPT_OFFICER" | "PAYMENT_GATEWAY";
      isAutomated: boolean;
      estimatedMinutes: number;
    }[];
  }[];
  formFields: DynamicFormFieldDefinition[];
  apiIntegrationEndpoint?: string;
  isActive: boolean;
  version: string;
}

export interface TenantStructure {
  tenantId: string;
  tenantName: string;
  tenantType: "STATE_GOVT" | "MUNICIPAL_CORP" | "CSC_NETWORK" | "ENTERPRISE_CSR";
  primaryJurisdiction: JurisdictionModel;
  allowedServices: string[]; // Service IDs
  customBranding: {
    portalTitle: string;
    primaryColorHex: string;
    logoUrl?: string;
  };
  rateLimitOverrideRps?: number;
  strictDataIsolationKey: string;
  createdAt: string;
}

export interface JourneyCostMetrics {
  journeyId: string;
  serviceId: string;
  userId: string;
  aiTokenCount: number;
  aiCostINR: number;
  ocrDocumentCount: number;
  ocrCostINR: number;
  storageMB: number;
  storageCostINR: number;
  computeRequestsCount: number;
  infraCostINR: number;
  totalJourneyCostINR: number;
  timestamp: string;
}

export interface LoadTestSimulationResult {
  testId: string;
  simulatedUsers: number;
  concurrentWorkflows: number;
  concurrentDocScans: number;
  concurrentAiCalls: number;
  durationSeconds: number;
  totalRequestsHandled: number;
  throughputRps: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  successRatePercentage: number;
  systemHealthStatus: "HEALTHY" | "DEGRADED" | "CRITICAL";
  timestamp: string;
}

export interface Phase9TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}

// Phase 10: IP, Funding & Final Acceptance Types
export interface DefinitionOfDoneDimension {
  dimensionKey: string;
  dimensionName: string;
  score: number; // Out of 10
  maxScore: number;
  evaluationSummary: string;
  linkedProofArtifact: string;
  verifiedInPhase: number;
}

export interface IPCandidateMechanism {
  candidateId: string;
  title: string;
  technicalCategory: string;
  novelProblemSolved: string;
  architecturalSolution: string;
  priorArtDifferentiation: string;
  statusForReview: "READY_FOR_PRIOR_ART_REVIEW";
}

export interface FundingAllocationItem {
  id: string;
  category: string;
  amountINR: number;
  spendType: "INTERNAL" | "EXTERNAL";
  whatToBuild: string;
  whyRequired: string;
  measurableOutcome: string;
}

export interface FeatureGapItem {
  featureId: string;
  subsystem: string;
  featureName: string;
  status: "DONE" | "PARTIALLY_DONE" | "NOT_DONE" | "BLOCKED";
  severity: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
  requiredImplementation: string;
  dependency: string;
  estimatedEffortHours: number;
}

export interface GoldenJourneyStep {
  stepNumber: number;
  stepCode: string;
  stepTitle: string;
  status: "VERIFIED";
  systemOutput: string;
  evidenceRef: string;
}

export interface Phase10TestResult {
  phase: number;
  status: "PASS" | "FAIL";
  timestamp: string;
  overallReadinessScorePercentage: number;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "NOT DONE";
    details: string;
    sampleData?: any;
  }[];
}








