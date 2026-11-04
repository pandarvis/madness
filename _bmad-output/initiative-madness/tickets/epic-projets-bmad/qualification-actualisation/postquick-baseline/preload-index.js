let electron = require("electron");
var COMMAND_CHANNEL = "madness:command:v1";
var EVENT_CHANNEL = "madness:event:v1";
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var exact$9 = (value, keys) => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
var id = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value);
var nullableId = (value) => value === null || id(value);
var timestamp = (value) => typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));
var isCorrelationId = (value) => id(value) && value.length >= 8;
function isContext(value) {
	return isRecord(value) && exact$9(value, [
		"projectId",
		"initiativeId",
		"conversationId",
		"providerId",
		"connectionId"
	]) && Object.values(value).every(nullableId);
}
function isSnapshot(value) {
	if (!isRecord(value) || !exact$9(value, [
		"schemaVersion",
		"revision",
		"projects",
		"activeProjectId",
		"drafts",
		"preferences",
		"conversations"
	]) || value.schemaVersion !== 1 || !Number.isSafeInteger(value.revision) || Number(value.revision) < 0) return false;
	if (!Array.isArray(value.projects) || value.projects.length > 1e3 || !Array.isArray(value.drafts) || !Array.isArray(value.conversations) || value.conversations.length > 1e3) return false;
	const projects = value.projects;
	if (!projects.every((p) => isRecord(p) && exact$9(p, [
		"id",
		"name",
		"rootPath",
		"openedAt"
	]) && id(p.id) && typeof p.name === "string" && p.name.length > 0 && p.name.length <= 255 && typeof p.rootPath === "string" && p.rootPath.length > 0 && p.rootPath.length <= 32767 && !p.rootPath.includes("\0") && timestamp(p.openedAt))) return false;
	const ids = new Set(projects.map((p) => p.id));
	if (ids.size !== projects.length || value.activeProjectId !== null && !ids.has(value.activeProjectId)) return false;
	if (!isRecord(value.preferences) || !exact$9(value.preferences, ["navigationCollapsed"]) || typeof value.preferences.navigationCollapsed !== "boolean") return false;
	if (value.drafts.length > projects.length || !value.drafts.every((d) => isRecord(d) && exact$9(d, [
		"projectId",
		"text",
		"savedAt"
	]) && ids.has(d.projectId) && typeof d.text === "string" && d.text.length <= 1e5 && timestamp(d.savedAt))) return false;
	if (new Set(value.drafts.map((d) => d.projectId)).size !== value.drafts.length) return false;
	return value.conversations.every((c) => isRecord(c) && exact$9(c, [
		"id",
		"context",
		"lastKnownActivity",
		"messages"
	]) && id(c.id) && isContext(c.context) && c.context.projectId !== null && ids.has(c.context.projectId) && c.context.conversationId === c.id && c.context.providerId !== null && c.context.connectionId !== null && [
		"idle",
		"running",
		"waiting",
		"interrupted",
		"unknown"
	].includes(String(c.lastKnownActivity)) && Array.isArray(c.messages) && c.messages.length <= 1e4 && c.messages.every((m) => isRecord(m) && exact$9(m, [
		"id",
		"role",
		"text"
	]) && id(m.id) && ["user", "assistant"].includes(String(m.role)) && typeof m.text === "string" && m.text.length <= 1e5));
}
function isDomainEvent(value) {
	return isRecord(value) && exact$9(value, [
		"contractVersion",
		"correlationId",
		"type",
		"sequence",
		"context",
		"revision"
	]) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && value.type === "state-changed" && Number.isSafeInteger(value.sequence) && Number(value.sequence) > 0 && Number.isSafeInteger(value.revision) && Number(value.revision) >= 0 && isContext(value.context);
}
function isReply(value) {
	if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId)) return false;
	if (value.ok === false) {
		const error = value.error;
		return exact$9(value, [
			"contractVersion",
			"correlationId",
			"ok",
			"error"
		]) && isRecord(error) && exact$9(error, [
			"code",
			"messageKey",
			"correlationId",
			"context",
			"outcome",
			"recovery"
		]) && [
			"INVALID_COMMAND",
			"UNTRUSTED_CALLER",
			"PROJECT_NOT_FOUND",
			"DIRECTORY_UNAVAILABLE",
			"STORAGE_READ_FAILED",
			"STORAGE_WRITE_FAILED",
			"STORAGE_CORRUPT",
			"STORAGE_VERSION_UNSUPPORTED",
			"STORAGE_CONFLICT",
			"APP_CLOSING"
		].includes(String(error.code)) && error.messageKey === error.code && error.correlationId === value.correlationId && isContext(error.context) && ["failed", "unknown"].includes(String(error.outcome)) && [
			"retry",
			"choose-directory",
			"preserve-storage"
		].includes(String(error.recovery));
	}
	if (value.ok !== true || !exact$9(value, [
		"contractVersion",
		"correlationId",
		"ok",
		"value"
	]) || !isRecord(value.value) || !exact$9(value.value, ["state", "effect"]) || ![
		"read",
		"cancelled",
		"saved"
	].includes(String(value.value.effect))) return false;
	const state = value.value.state;
	if (!isRecord(state) || !exact$9(state, [
		"schemaVersion",
		"revision",
		"projects",
		"activeProjectId",
		"drafts",
		"preferences",
		"conversations",
		"capabilities",
		"lifecycle"
	])) return false;
	const { capabilities, lifecycle, ...snapshot } = state;
	return isSnapshot(snapshot) && ["idle", "closing"].includes(String(lifecycle)) && isRecord(capabilities) && exact$9(capabilities, ["codex"]) && isRecord(capabilities.codex) && exact$9(capabilities.codex, ["available", "reasonKey"]) && capabilities.codex.available === false && capabilities.codex.reasonKey === "codex.unqualified";
}
// src/contracts/connection.ts
/** Surface dédiée : aucun secret ni identifiant de compte ne traverse ce contrat. */
var CONNECTION_COMMAND_CHANNEL = "madness:connection:command:v1";
var CONNECTION_EVENT_CHANNEL = "madness:connection:event:v1";
var connectionStatuses = [
	"disconnected",
	"registered",
	"authorizing",
	"verifying",
	"stopping",
	"verified",
	"error",
	"cancelled",
	"unknown",
	"closing"
];
var connectionErrors = [
	"INVALID_COMMAND",
	"UNTRUSTED_CALLER",
	"ENCRYPTION_UNAVAILABLE",
	"VAULT_UNREADABLE",
	"VAULT_WRITE_FAILED",
	"REGISTRATION_INVALID",
	"NETWORK_UNAVAILABLE",
	"OAUTH_INVALID",
	"CONSENT_DENIED",
	"SCOPES_MISSING",
	"IDENTITY_CHANGED",
	"CANCELLED",
	"TIMEOUT",
	"BROWSER_UNAVAILABLE",
	"CODEX_MISSING",
	"CODEX_INVALID",
	"PROBE_FAILED",
	"STOP_UNCONFIRMED",
	"APP_CLOSING",
	"BUSY",
	"NO_ACCOUNT"
];
var exact$8 = (value, keys) => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
function isConnectionState(value) {
	if (!isRecord(value) || !exact$8(value, [
		"contractVersion",
		"network",
		"sequence",
		"status",
		"accountStored",
		"verifiedAt",
		"errorCode",
		"cliVersion",
		"needsPlanAcknowledgement"
	])) return false;
	if (!isRecord(value.network) || !exact$8(value.network, [
		"status",
		"checkedAt",
		"errorCode"
	]) || ![
		"idle",
		"checking",
		"accessible",
		"error",
		"cancelled"
	].includes(String(value.network.status)) || !(value.network.checkedAt === null || typeof value.network.checkedAt === "string" && Number.isFinite(Date.parse(value.network.checkedAt))) || !(value.network.errorCode === null || ["NETWORK_UNAVAILABLE", "TIMEOUT"].includes(String(value.network.errorCode))) || value.network.status === "accessible" && value.network.checkedAt === null) return false;
	return value.contractVersion === 1 && Number.isSafeInteger(value.sequence) && Number(value.sequence) >= 0 && connectionStatuses.includes(value.status) && typeof value.accountStored === "boolean" && typeof value.needsPlanAcknowledgement === "boolean" && (!value.needsPlanAcknowledgement || value.accountStored) && (value.errorCode === null || connectionErrors.includes(value.errorCode)) && (value.cliVersion === null || typeof value.cliVersion === "string" && /^\d+\.\d+\.\d+(?:[-.a-zA-Z0-9]+)?$/.test(value.cliVersion)) && (value.verifiedAt === null || typeof value.verifiedAt === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.verifiedAt) && Number.isFinite(Date.parse(value.verifiedAt))) && (value.status !== "verified" || value.accountStored && value.verifiedAt !== null && value.errorCode === null) && (value.status !== "registered" || value.accountStored) && (value.status !== "disconnected" || !value.accountStored);
}
function isConnectionReply(value) {
	return isRecord(value) && exact$8(value, [
		"contractVersion",
		"correlationId",
		"state"
	]) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && isConnectionState(value.state);
}
// src/contracts/approvals.ts
var approvalIdentifier = (v) => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v);
var exact$7 = (v, keys) => Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
var text$4 = (v, max) => typeof v === "string" && v.length > 0 && v.length <= max && !v.includes("\0");
var digest$1 = (v) => v === null || typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
function isApprovalFiles(v) {
	return Array.isArray(v) && v.length > 0 && v.length <= 50 && new Set(v.map((f) => isRecord(f) && typeof f.path === "string" ? f.path.toLowerCase() : "")).size === v.length && v.every((f) => isRecord(f) && exact$7(f, [
		"path",
		"kind",
		"diff",
		"beforeSha256",
		"afterSha256"
	]) && text$4(f.path, 32767) && [
		"add",
		"update",
		"delete"
	].includes(String(f.kind)) && typeof f.diff === "string" && f.diff.length <= 1e5 && digest$1(f.beforeSha256) && digest$1(f.afterSha256) && (f.kind !== "add" || f.beforeSha256 === null) && (f.kind !== "delete" || f.afterSha256 === null)) && v.reduce((n, f) => n + f.diff.length, 0) <= 1e5;
}
function isApprovalResult(v) {
	return isRecord(v) && exact$7(v, [
		"nativeStatus",
		"raw",
		"files"
	]) && [
		"completed",
		"failed",
		"declined"
	].includes(String(v.nativeStatus)) && typeof v.raw === "string" && v.raw.length <= 1e5 && Array.isArray(v.files) && v.files.length > 0 && v.files.length <= 50 && v.files.every((f) => isRecord(f) && exact$7(f, [
		"path",
		"sha256",
		"matches"
	]) && text$4(f.path, 32767) && digest$1(f.sha256) && typeof f.matches === "boolean");
}
function isApprovalRecord(v) {
	return isRecord(v) && exact$7(v, [
		"schemaVersion",
		"id",
		"context",
		"requestId",
		"turnId",
		"identity",
		"mode",
		"files",
		"reason",
		"adjustment",
		"adjustmentStatus",
		"status",
		"decision",
		"transmission",
		"effect",
		"result",
		"createdAt",
		"expiresAt",
		"revision",
		"storage"
	]) && v.schemaVersion === 1 && approvalIdentifier(v.id) && isRecord(v.context) && exact$7(v.context, [
		"projectId",
		"initiativeId",
		"conversationId",
		"providerId",
		"connectionId"
	]) && Object.values(v.context).every((x) => x === null || approvalIdentifier(x)) && v.context.projectId !== null && v.context.conversationId !== null && text$4(v.requestId, 100) && approvalIdentifier(v.turnId) && isMessageIdentity(v.identity) && v.mode === "file-approval" && isApprovalFiles(v.files) && (v.reason === null || [
		"resolved",
		"expired",
		"stopped",
		"reopened",
		"changed",
		"failed"
	].includes(String(v.reason))) && typeof v.adjustment === "string" && v.adjustment.length <= 1e5 && [
		"draft",
		"sending",
		"sent",
		"unknown"
	].includes(String(v.adjustmentStatus)) && [
		"waiting",
		"sending",
		"decided",
		"inactive",
		"unknown"
	].includes(String(v.status)) && (v.decision === null || v.decision === "accept" || v.decision === "decline") && [
		"none",
		"pending",
		"sent",
		"unknown"
	].includes(String(v.transmission)) && [
		"pending",
		"succeeded",
		"declined",
		"failed",
		"unknown"
	].includes(String(v.effect)) && (v.result === null || isApprovalResult(v.result)) && text$4(v.createdAt, 100) && Number.isFinite(Date.parse(v.createdAt)) && Number.isSafeInteger(v.expiresAt) && Number(v.expiresAt) > 0 && Number.isSafeInteger(v.revision) && Number(v.revision) > 0 && [
		"pending",
		"stored",
		"failed"
	].includes(String(v.storage));
}
// src/contracts/questions.ts
var questionIdentifier = (v) => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v);
var exact$6 = (v, keys) => Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
var text$3 = (v, max) => typeof v === "string" && v.length > 0 && v.length <= max && !v.includes("\0");
function isQuestionValues(v, complete = false) {
	return isRecord(v) && Object.keys(v).length <= 3 && Object.entries(v).every(([k, x]) => questionIdentifier(k) && typeof x === "string" && x.length <= 1e5 && (!complete || !!x.trim())) && Object.values(v).reduce((n, x) => n + String(x).length, 0) <= 1e5;
}
function isQuestionFields(v) {
	return Array.isArray(v) && v.length > 0 && v.length <= 3 && new Set(v.map((f) => f?.id)).size === v.length && v.every((f) => isRecord(f) && exact$6(f, [
		"id",
		"header",
		"prompt",
		"options",
		"allowOther"
	]) && questionIdentifier(f.id) && text$3(f.header, 100) && text$3(f.prompt, 1e4) && typeof f.allowOther === "boolean" && Array.isArray(f.options) && f.options.length <= 10 && new Set(f.options.map((o) => o?.label)).size === f.options.length && f.options.every((o) => isRecord(o) && exact$6(o, ["label", "description"]) && text$3(o.label, 500) && typeof o.description === "string" && o.description.length <= 2e3));
}
function validQuestionValues(fields, values, complete) {
	if (!isQuestionValues(values, complete) || Object.keys(values).some((k) => !fields.some((f) => f.id === k)) || complete && fields.some((f) => !Object.hasOwn(values, f.id))) return false;
	return fields.every((f) => !values[f.id]?.trim() || !f.options.length || f.allowOther || f.options.some((o) => o.label === values[f.id]));
}
function isQuestionRecord(v) {
	return isRecord(v) && exact$6(v, [
		"schemaVersion",
		"id",
		"context",
		"requestId",
		"turnId",
		"identity",
		"fields",
		"values",
		"status",
		"reason",
		"createdAt",
		"expiresAt",
		"revision",
		"storage"
	]) && v.schemaVersion === 1 && questionIdentifier(v.id) && isRecord(v.context) && exact$6(v.context, [
		"projectId",
		"initiativeId",
		"conversationId",
		"providerId",
		"connectionId"
	]) && Object.values(v.context).every((x) => x === null || questionIdentifier(x)) && v.context.projectId !== null && v.context.conversationId !== null && text$3(v.requestId, 100) && questionIdentifier(v.turnId) && isMessageIdentity(v.identity) && isQuestionFields(v.fields) && validQuestionValues(v.fields, v.values, false) && [
		"waiting",
		"sending",
		"sent",
		"inactive",
		"unknown"
	].includes(String(v.status)) && (v.reason === null || [
		"resolved",
		"expired",
		"stopped",
		"reopened",
		"failed"
	].includes(String(v.reason))) && text$3(v.createdAt, 100) && Number.isFinite(Date.parse(v.createdAt)) && (v.expiresAt === null || typeof v.expiresAt === "number" && Number.isSafeInteger(v.expiresAt) && v.expiresAt > 0) && Number.isSafeInteger(v.revision) && Number(v.revision) > 0 && [
		"pending",
		"stored",
		"failed"
	].includes(String(v.storage));
}
// src/contracts/recovery.ts
var exact$5 = (v, keys) => Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
function isRecoveryState(v) {
	return isRecord(v) && exact$5(v, [
		"stop",
		"observations",
		"capabilities"
	]) && ["clear", "unconfirmed"].includes(String(v.stop)) && isRecord(v.capabilities) && exact$5(v.capabilities, [
		"resume",
		"newConversation",
		"inspectFiles"
	]) && v.capabilities.resume === false && v.capabilities.newConversation === true && typeof v.capabilities.inspectFiles === "boolean" && Array.isArray(v.observations) && v.observations.length <= 200 && new Set(v.observations.map((o) => o?.approvalId)).size === v.observations.length && v.observations.every((o) => isRecord(o) && exact$5(o, [
		"approvalId",
		"observedAt",
		"outcome",
		"files"
	]) && approvalIdentifier(o.approvalId) && typeof o.observedAt === "string" && Number.isFinite(Date.parse(o.observedAt)) && [
		"before",
		"after",
		"identical",
		"mixed",
		"diverged"
	].includes(String(o.outcome)) && Array.isArray(o.files) && o.files.length > 0 && o.files.length <= 50 && o.files.every((f) => isRecord(f) && exact$5(f, [
		"path",
		"sha256",
		"position"
	]) && typeof f.path === "string" && f.path.length > 0 && f.path.length <= 32767 && !f.path.includes("\0") && (f.sha256 === null || typeof f.sha256 === "string" && /^[a-f0-9]{64}$/.test(f.sha256)) && [
		"before",
		"after",
		"identical",
		"diverged"
	].includes(String(f.position))));
}
// src/contracts/dialogue.ts
var DIALOGUE_COMMAND_CHANNEL = "madness:dialogue:command:v1";
var DIALOGUE_EVENT_CHANNEL = "madness:dialogue:event:v1";
var dialogueErrors = [
	"NETWORK_UNAVAILABLE",
	"INSPECTION_REQUIRED",
	"INSPECTION_STALE",
	"INSPECTION_CONFLICT",
	"INVALID_COMMAND",
	"UNTRUSTED_CALLER",
	"BUSY",
	"APP_CLOSING",
	"PROJECT_NOT_FOUND",
	"CONTEXT_MISMATCH",
	"PROFILE_ABSENT",
	"PROFILE_UNRECOGNIZED",
	"PROFILE_CHANGED",
	"RESOLVER_FAILED",
	"NO_ACCOUNT",
	"PLAN_ACK_REQUIRED",
	"CONNECTION_BUSY",
	"PROVIDER_FAILED",
	"UNSUPPORTED_INTERACTION",
	"CANCELLED",
	"STOP_UNCONFIRMED",
	"STORAGE_READ_FAILED",
	"STORAGE_WRITE_FAILED",
	"OUTPUT_REFUSED",
	"OUTPUT_CONFLICT",
	"EFFECT_UNKNOWN",
	"RESUME_UNSUPPORTED"
];
var identifier = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value);
var exact$4 = (value, keys) => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
function isDialogueState(value) {
	if (!isRecord(value) || !exact$4(value, [
		"contractVersion",
		"recovery",
		"sequence",
		"status",
		"context",
		"invocation",
		"profile",
		"acknowledged",
		"errorCode",
		"activities",
		"workflows",
		"turn",
		"messages",
		"questions",
		"approvals",
		"mode"
	]) || value.contractVersion !== 1 || !Number.isSafeInteger(value.sequence) || Number(value.sequence) < 0 || ![
		"idle",
		"inspecting",
		"qualifying",
		"qualified",
		"starting",
		"running",
		"waiting-question",
		"waiting-approval",
		"ready",
		"stopping",
		"stopped",
		"error",
		"unknown"
	].includes(String(value.status))) return false;
	if (!isRecoveryState(value.recovery)) return false;
	if (!["read-only", "file-approval"].includes(String(value.mode)) || !Array.isArray(value.approvals) || value.approvals.length > 200 || !value.approvals.every(isApprovalRecord) || new Set(value.approvals.map((a) => a.id)).size !== value.approvals.length) return false;
	if (!Array.isArray(value.questions) || value.questions.length > 500 || !value.questions.every(isQuestionRecord) || new Set(value.questions.map((q) => q.id)).size !== value.questions.length) return false;
	if (value.turn !== null && (!isRecord(value.turn) || !exact$4(value.turn, [
		"id",
		"requestId",
		"context",
		"phase"
	]) || !identifier(value.turn.id) || !isCorrelationId(value.turn.requestId) || !validContext(value.turn.context) || ![
		"awaiting-ack",
		"streaming",
		"completed",
		"interrupted",
		"unknown"
	].includes(String(value.turn.phase)))) return false;
	if (!Array.isArray(value.messages) || value.messages.length > 2e3 || !value.messages.every(isDialogueMessage) || new Set(value.messages.map((m) => m.id)).size !== value.messages.length || value.messages.reduce((n, m) => n + m.text.length, 0) > 2e6) return false;
	return validContext(value.context) && [
		"$bmad-agent-analyst",
		"$bmad-forge-idea",
		"$bmad"
	].includes(String(value.invocation)) && typeof value.acknowledged === "boolean" && (value.errorCode === null || dialogueErrors.includes(value.errorCode)) && (value.profile === null || isRecord(value.profile) && (exact$4(value.profile, ["fingerprint", "skillPath"]) || exact$4(value.profile, [
		"fingerprint",
		"skillPath",
		"outputBase"
	]) && pathText(value.profile.outputBase)) && digest(value.profile.fingerprint) && pathText(value.profile.skillPath)) && Array.isArray(value.activities) && value.activities.length <= 80 && value.activities.every((v) => typeof v === "string" && v.length <= 500) && Array.isArray(value.workflows) && value.workflows.length <= 200 && value.workflows.every(isWorkflowRecord);
}
var pathText = (v) => typeof v === "string" && v.length > 0 && v.length <= 32767 && !v.includes("\0");
var digest = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
var validContext = (v) => isRecord(v) && exact$4(v, [
	"projectId",
	"initiativeId",
	"conversationId",
	"providerId",
	"connectionId"
]) && Object.values(v).every((x) => x === null || identifier(x));
function isMessageIdentity(v) {
	return isRecord(v) && (v.kind === "unknown" && exact$4(v, ["kind"]) || v.kind === "attested" && exact$4(v, [
		"kind",
		"name",
		"source"
	]) && typeof v.name === "string" && v.name.length > 0 && v.name.length <= 100 && typeof v.source === "string" && v.source.length > 0 && v.source.length <= 200);
}
function isDialogueMessage(v) {
	return isRecord(v) && exact$4(v, [
		"id",
		"context",
		"requestId",
		"turnId",
		"order",
		"revision",
		"text",
		"phase",
		"storage",
		"identity"
	]) && identifier(v.id) && validContext(v.context) && v.context.conversationId !== null && isCorrelationId(v.requestId) && identifier(v.turnId) && Number.isSafeInteger(v.order) && Number(v.order) > 0 && Number(v.order) <= 200 && Number.isSafeInteger(v.revision) && Number(v.revision) > 0 && typeof v.text === "string" && v.text.length <= 1e5 && [
		"streaming",
		"complete",
		"interrupted",
		"unknown"
	].includes(String(v.phase)) && [
		"pending",
		"stored",
		"failed"
	].includes(String(v.storage)) && isMessageIdentity(v.identity);
}
function isWorkflowRecord(v) {
	return isRecord(v) && exact$4(v, [
		"schemaVersion",
		"conversationId",
		"context",
		"invocation",
		"capturedAt",
		"rootPath",
		"outputBase",
		"contextDigest",
		"fingerprint",
		"skillPath",
		"workspace",
		"outcome",
		"observations"
	]) && v.schemaVersion === 1 && identifier(v.conversationId) && validContext(v.context) && v.context.conversationId === v.conversationId && v.invocation === "$bmad-forge-idea" && typeof v.capturedAt === "string" && Number.isFinite(Date.parse(v.capturedAt)) && pathText(v.rootPath) && pathText(v.outputBase) && digest(v.contextDigest) && digest(v.fingerprint) && pathText(v.skillPath) && (v.workspace === null || pathText(v.workspace)) && [
		"open",
		"HARDENED",
		"KILLED",
		"CLARIFIED"
	].includes(String(v.outcome)) && Array.isArray(v.observations) && v.observations.length <= 1e3 && v.observations.every((o) => isRecord(o) && exact$4(o, [
		"id",
		"turnId",
		"operation",
		"phase",
		"at",
		"path",
		"sha256",
		"bytes"
	]) && typeof o.id === "string" && o.id.length <= 200 && typeof o.turnId === "string" && o.turnId.length <= 200 && typeof o.operation === "string" && o.operation.length <= 100 && [
		"pending",
		"observed",
		"failed",
		"unknown"
	].includes(String(o.phase)) && typeof o.at === "string" && Number.isFinite(Date.parse(o.at)) && (o.path === null || pathText(o.path)) && (o.sha256 === null || digest(o.sha256)) && (o.bytes === null || Number.isSafeInteger(o.bytes) && Number(o.bytes) >= 0));
}
function isDialogueReply(value) {
	return isRecord(value) && exact$4(value, [
		"contractVersion",
		"correlationId",
		"state"
	]) && value.contractVersion === 1 && isCorrelationId(value.correlationId) && isDialogueState(value.state);
}
// src/contracts/appearance.ts
/** Préférence d’interface indépendante du Snapshot métier v1. */
var APPEARANCE_CHANNEL = "madness:appearance:v1";
var exact$3 = (value, keys) => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
var isTheme = (value) => value === "dark" || value === "light";
function isAppearanceState(value) {
	return isRecord(value) && exact$3(value, ["theme", "warning"]) && isTheme(value.theme) && (value.warning === null || value.warning === "read-failed" || value.warning === "save-failed");
}
function isAppearanceReply(value) {
	if (!isRecord(value) || value.contractVersion !== 1 || !isCorrelationId(value.correlationId) || !isAppearanceState(value.state)) return false;
	return value.ok === true ? exact$3(value, [
		"contractVersion",
		"correlationId",
		"ok",
		"state"
	]) : value.ok === false && exact$3(value, [
		"contractVersion",
		"correlationId",
		"ok",
		"state",
		"error"
	]) && [
		"UNTRUSTED_CALLER",
		"INVALID_COMMAND",
		"APP_CLOSING"
	].includes(String(value.error));
}
function appearanceFromArguments(args) {
	const themes = args.filter((arg) => arg.startsWith("--madness-theme=")), warnings = args.filter((arg) => arg.startsWith("--madness-appearance-warning="));
	const theme = themes[0]?.slice(16), warning = warnings[0]?.slice(29);
	if (themes.length !== 1 || !isTheme(theme) || warnings.length > 1 || warning !== void 0 && warning !== "none" && warning !== "read-failed") return {
		theme: "dark",
		warning: "read-failed"
	};
	return {
		theme,
		warning: warning === "read-failed" ? warning : null
	};
}
// src/contracts/bmad-help.ts
var HELP_COMMAND_CHANNEL = "madness:help:command:v1";
var HELP_EVENT_CHANNEL = "madness:help:event:v1";
var HELP_LIMIT = 4194304;
var helpId = (v) => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v);
var exact$2 = (v, keys) => Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
var text$2 = (v, max = HELP_LIMIT) => typeof v === "string" && v.length <= max && !v.includes("\0");
var path = (v) => text$2(v, 32767) && !!v;
var sha$2 = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
var source = (v) => isRecord(v) && exact$2(v, [
	"id",
	"source",
	"snapshot",
	"sha256",
	"bytes",
	"text",
	"module",
	"skills"
]) && helpId(v.id) && path(v.source) && path(v.snapshot) && sha$2(v.sha256) && Number.isSafeInteger(v.bytes) && Number(v.bytes) >= 0 && Number(v.bytes) <= 1048576 && text$2(v.text, 1048576) && (v.module === null || text$2(v.module, 200)) && Array.isArray(v.skills) && v.skills.length <= 1024 && v.skills.every(helpId);
function isHelpBundle(v) {
	return isRecord(v) && exact$2(v, [
		"schemaVersion",
		"id",
		"projectId",
		"rootPath",
		"observedAt",
		"revision",
		"diagnostic",
		"nativeReady",
		"problems",
		"documents",
		"references",
		"sources",
		"activeInitiative",
		"selectedInitiative",
		"outputPath",
		"inventories",
		"knowledgeRaw",
		"configRaw",
		"skillPath"
	]) && v.schemaVersion === 1 && helpId(v.id) && helpId(v.projectId) && path(v.rootPath) && text$2(v.observedAt, 100) && Number.isFinite(Date.parse(v.observedAt)) && sha$2(v.revision) && [
		"absent",
		"legacy-observed",
		"unknown",
		"partial",
		"candidate-observed"
	].includes(String(v.diagnostic)) && typeof v.nativeReady === "boolean" && Array.isArray(v.problems) && v.problems.length <= 1024 && v.problems.every((p) => text$2(p, 4e3)) && Array.isArray(v.documents) && v.documents.length <= 1024 && v.documents.every(source) && Array.isArray(v.sources) && v.sources.length <= 1024 && v.sources.every(source) && Array.isArray(v.references) && v.references.length <= 1024 && v.references.every((r) => isRecord(r) && exact$2(r, ["module", "path"]) && text$2(r.module, 200) && path(r.path)) && (v.activeInitiative === null || helpId(v.activeInitiative)) && (v.selectedInitiative === null || helpId(v.selectedInitiative)) && (v.outputPath === null || path(v.outputPath)) && Array.isArray(v.inventories) && v.inventories.length <= 1024 && v.inventories.every((i) => text$2(i, 32767)) && text$2(v.knowledgeRaw) && text$2(v.configRaw) && path(v.skillPath) && JSON.stringify(v).length <= 4194304;
}
function isHelpRecord(v) {
	return isRecord(v) && exact$2(v, [
		"schemaVersion",
		"conversationId",
		"context",
		"invocation",
		"bundle",
		"turns",
		"localTurnId",
		"nativeThreadId",
		"nativeTurnId",
		"transmission",
		"tools",
		"response",
		"outcome",
		"storage"
	]) && v.schemaVersion === 1 && helpId(v.conversationId) && isRecord(v.context) && exact$2(v.context, [
		"projectId",
		"initiativeId",
		"conversationId",
		"providerId",
		"connectionId"
	]) && Object.values(v.context).every((x) => x === null || helpId(x)) && v.context.conversationId === v.conversationId && Array.isArray(v.turns) && v.turns.length <= 200 && v.turns.every((t) => isRecord(t) && exact$2(t, [
		"localId",
		"nativeId",
		"threadId",
		"response"
	]) && helpId(t.localId) && text$2(t.nativeId, 200) && text$2(t.threadId, 200) && text$2(t.response, 1e5)) && v.invocation === "$bmad" && isHelpBundle(v.bundle) && v.context.projectId === v.bundle.projectId && (v.localTurnId === null || helpId(v.localTurnId)) && (v.nativeThreadId === null || text$2(v.nativeThreadId, 200)) && (v.nativeTurnId === null || text$2(v.nativeTurnId, 200)) && [
		"none",
		"partial",
		"transmitted"
	].includes(String(v.transmission)) && Array.isArray(v.tools) && v.tools.length <= 200 && v.tools.every((t) => isRecord(t) && exact$2(t, [
		"threadId",
		"turnId",
		"callId",
		"operation",
		"reference",
		"sha256",
		"raw"
	]) && [
		t.threadId,
		t.turnId,
		t.callId
	].every((x) => text$2(x, 200)) && [
		"knowledge",
		"config",
		"read"
	].includes(String(t.operation)) && (t.reference === null || helpId(t.reference)) && sha$2(t.sha256) && text$2(t.raw)) && (v.response === null || text$2(v.response, 1e5)) && [
		"pending",
		"received",
		"unknown"
	].includes(String(v.outcome)) && [
		"pending",
		"stored",
		"failed"
	].includes(String(v.storage)) && JSON.stringify(v).length <= 8388608;
}
function isHelpState(v) {
	return isRecord(v) && exact$2(v, [
		"contractVersion",
		"sequence",
		"status",
		"freshness",
		"monitoring",
		"projectId",
		"bundle",
		"records",
		"error"
	]) && v.contractVersion === 1 && Number.isSafeInteger(v.sequence) && Number(v.sequence) >= 0 && [
		"idle",
		"reading",
		"ready",
		"error",
		"closing"
	].includes(String(v.status)) && [
		"none",
		"current",
		"stale",
		"uncertain"
	].includes(String(v.freshness)) && [
		"unarmed",
		"watching",
		"unavailable"
	].includes(String(v.monitoring)) && (v.projectId === null || helpId(v.projectId)) && (v.bundle === null || isHelpBundle(v.bundle)) && Array.isArray(v.records) && v.records.length <= 200 && v.records.every(isHelpRecord) && (v.error === null || text$2(v.error, 4e3));
}
// src/contracts/bmad-context.ts
var BMAD_CONTEXT_COMMAND_CHANNEL = "madness:bmad-context:command:v1";
var BMAD_CONTEXT_EVENT_CHANNEL = "madness:bmad-context:event:v1";
var contextId = (v) => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v);
var exact$1 = (v, keys) => Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
var text$1 = (v, max = 32767) => typeof v === "string" && v.length > 0 && v.length <= max && !v.includes("\0");
var sha$1 = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
function isBmadSelection(v) {
	return isRecord(v) && exact$1(v, [
		"schemaVersion",
		"projectId",
		"rootPath",
		"rootIdentity",
		"revision",
		"initiativeId"
	]) && v.schemaVersion === 1 && contextId(v.projectId) && text$1(v.rootPath) && text$1(v.rootIdentity, 1e3) && Number.isSafeInteger(v.revision) && Number(v.revision) > 0 && contextId(v.initiativeId);
}
function isBmadContextObservation(v) {
	return isRecord(v) && exact$1(v, [
		"schemaVersion",
		"projectId",
		"rootPath",
		"rootIdentity",
		"revision",
		"observedAt",
		"status",
		"activeInitiative",
		"activeStatus",
		"initiatives",
		"sources",
		"problems"
	]) && v.schemaVersion === 1 && contextId(v.projectId) && text$1(v.rootPath) && text$1(v.rootIdentity, 1e3) && sha$1(v.revision) && text$1(v.observedAt, 100) && Number.isFinite(Date.parse(v.observedAt)) && [
		"absent",
		"legacy-observed",
		"unknown",
		"incompatible",
		"partial",
		"candidate-observed"
	].includes(String(v.status)) && (v.activeInitiative === null || text$1(v.activeInitiative, 255)) && [
		"absent",
		"unknown",
		"invalid",
		"valid"
	].includes(String(v.activeStatus)) && Array.isArray(v.initiatives) && v.initiatives.length <= 1024 && v.initiatives.every((i) => isRecord(i) && exact$1(i, [
		"id",
		"name",
		"path",
		"source",
		"revision"
	]) && (i.id === null || contextId(i.id) && i.id === i.name) && text$1(i.name, 255) && text$1(i.path) && text$1(i.source) && sha$1(i.revision)) && new Set(v.initiatives.map((i) => i.name)).size === v.initiatives.length && Array.isArray(v.sources) && v.sources.length <= 2048 && v.sources.every((s) => isRecord(s) && exact$1(s, ["path", "sha256"]) && text$1(s.path) && sha$1(s.sha256)) && Array.isArray(v.problems) && v.problems.length <= 1024 && v.problems.every((p) => text$1(p, 4e3)) && (v.activeStatus !== "valid" || contextId(v.activeInitiative) && v.initiatives.some((i) => i.id === v.activeInitiative)) && JSON.stringify(v).length <= 4194304;
}
function isBmadContextState(v) {
	return isRecord(v) && exact$1(v, [
		"contractVersion",
		"sequence",
		"projects"
	]) && v.contractVersion === 1 && Number.isSafeInteger(v.sequence) && Number(v.sequence) >= 0 && Array.isArray(v.projects) && v.projects.length <= 1e3 && new Set(v.projects.map((p) => isRecord(p) ? p.projectId : null)).size === v.projects.length && v.projects.every((p) => isRecord(p) && exact$1(p, [
		"projectId",
		"status",
		"freshness",
		"monitoring",
		"observation",
		"selection",
		"storage",
		"error"
	]) && contextId(p.projectId) && [
		"idle",
		"reading",
		"ready",
		"error"
	].includes(String(p.status)) && [
		"none",
		"current",
		"stale",
		"uncertain"
	].includes(String(p.freshness)) && [
		"unarmed",
		"watching",
		"unavailable"
	].includes(String(p.monitoring)) && (p.observation === null || isBmadContextObservation(p.observation) && p.observation.projectId === p.projectId) && (p.selection === null || isBmadSelection(p.selection) && p.selection.projectId === p.projectId) && [
		"unset",
		"stored",
		"pending",
		"failed",
		"unreadable"
	].includes(String(p.storage)) && (p.error === null || text$1(p.error, 4e3)));
}
// src/contracts/bmad-progress.ts
var BMAD_PROGRESS_COMMAND_CHANNEL = "madness:bmad-progress:command:v1";
var BMAD_PROGRESS_EVENT_CHANNEL = "madness:bmad-progress:event:v1";
var exact = (v, keys) => Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
var text = (v, max = 32767, empty = false) => typeof v === "string" && (empty || v.length > 0) && v.length <= max && !v.includes("\0");
var sha = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
var integer = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && Number(v) >= min && Number(v) <= max;
var date = (v) => text(v, 100) && Number.isFinite(Date.parse(v));
var normalized = (v) => v.replaceAll("\\", "/").replace(/\/$/, "").toLowerCase();
var within = (path, root) => normalized(path).startsWith(normalized(root) + "/") && !path.replaceAll("\\", "/").split("/").some((p) => p === ".." || p === ".");
function isBmadProgressSnapshot(v) {
	if (!isRecord(v) || !exact(v, [
		"schemaVersion",
		"projectId",
		"rootPath",
		"rootIdentity",
		"initiativeId",
		"initiativePath",
		"contextRevision",
		"revision",
		"observedAt",
		"coverage",
		"sources",
		"declarations",
		"excerpts",
		"problems"
	]) || v.schemaVersion !== 1 || !contextId(v.projectId) || !text(v.rootPath) || !text(v.rootIdentity, 1e3) || !contextId(v.initiativeId) || !text(v.initiativePath) || !within(v.initiativePath, v.rootPath) || !sha(v.contextRevision) || !sha(v.revision) || !date(v.observedAt) || !["complete", "partial"].includes(String(v.coverage))) return false;
	if (!Array.isArray(v.sources) || v.sources.length > 512 || !v.sources.every((s) => isRecord(s) && exact(s, [
		"id",
		"kind",
		"path",
		"relativePath",
		"sha256",
		"bytes",
		"modifiedAt"
	]) && contextId(s.id) && [
		"entry",
		"leaf",
		"plan",
		"container",
		"document"
	].includes(String(s.kind)) && text(s.path) && within(s.path, v.initiativePath) && text(s.relativePath) && !s.relativePath.includes("\\") && !s.relativePath.startsWith("/") && !s.relativePath.split("/").some((p) => !p || p === "." || p === ".." || p.includes(":")) && normalized(s.path) === normalized(v.initiativePath) + "/" + s.relativePath.toLowerCase() && sha(s.sha256) && integer(s.bytes, 0, 1048576) && date(s.modifiedAt)) || new Set(v.sources.map((s) => s.id)).size !== v.sources.length || new Set(v.sources.map((s) => normalized(s.path))).size !== v.sources.length) return false;
	const sourceIds = new Set(v.sources.map((s) => s.id));
	if (!Array.isArray(v.declarations) || v.declarations.length > 4096 || !v.declarations.every((d) => isRecord(d) && exact(d, [
		"sourceId",
		"container",
		"ticketId",
		"title",
		"field",
		"value",
		"line"
	]) && sourceIds.has(d.sourceId) && text(d.container, 1e3) && (d.ticketId === null || text(d.ticketId, 255)) && text(d.title, 1e3, true) && [
		"existence",
		"status",
		"tracker_status"
	].includes(String(d.field)) && text(d.value, 1e3) && integer(d.line, 1, 1048576))) return false;
	if (!Array.isArray(v.excerpts) || v.excerpts.length > 256 || !v.excerpts.every((e) => isRecord(e) && exact(e, [
		"sourceId",
		"category",
		"heading",
		"text",
		"startLine",
		"endLine"
	]) && sourceIds.has(e.sourceId) && [
		"results",
		"decisions",
		"remaining",
		"recap"
	].includes(String(e.category)) && text(e.heading, 500) && text(e.text, 12e3) && integer(e.startLine, 1, 1048576) && integer(e.endLine, Number(e.startLine), 1048576))) return false;
	return Array.isArray(v.problems) && v.problems.length <= 1024 && v.problems.every((p) => text(p, 4e3)) && (v.coverage !== "complete" || v.problems.length === 0) && JSON.stringify(v).length <= 4194304;
}
function isBmadProgressState(v) {
	return isRecord(v) && exact(v, [
		"contractVersion",
		"sequence",
		"projects"
	]) && v.contractVersion === 1 && integer(v.sequence) && Array.isArray(v.projects) && v.projects.length <= 1e3 && new Set(v.projects.map((p) => isRecord(p) ? p.projectId : null)).size === v.projects.length && v.projects.every((p) => isRecord(p) && exact(p, [
		"projectId",
		"generation",
		"status",
		"freshness",
		"monitoring",
		"queued",
		"snapshot",
		"errorCode",
		"error"
	]) && contextId(p.projectId) && integer(p.generation) && [
		"idle",
		"reading",
		"ready",
		"stale",
		"error"
	].includes(String(p.status)) && [
		"none",
		"current",
		"stale",
		"uncertain"
	].includes(String(p.freshness)) && [
		"unarmed",
		"watching",
		"unavailable"
	].includes(String(p.monitoring)) && typeof p.queued === "boolean" && (p.snapshot === null || isBmadProgressSnapshot(p.snapshot) && p.snapshot.projectId === p.projectId) && (p.errorCode === null || text(p.errorCode, 100)) && (p.error === null || text(p.error, 4e3)));
}
// src/preload/index.ts
var appearanceRequest = async (action) => {
	const correlationId = crypto.randomUUID();
	const reply = await electron.ipcRenderer.invoke(APPEARANCE_CHANNEL, {
		contractVersion: 1,
		correlationId,
		...action
	});
	if (!isAppearanceReply(reply)) throw new Error("INVALID_APPEARANCE_REPLY");
	if (reply.correlationId !== correlationId && (reply.ok || reply.correlationId !== "rejected-request")) throw new Error("UNRELATED_APPEARANCE_REPLY");
	if (!reply.ok) throw new Error(reply.error);
	return reply.state;
};
var appearanceBridge = {
	initial: Object.freeze(appearanceFromArguments(process.argv)),
	read: () => appearanceRequest({ type: "read" }),
	setTheme: (theme) => appearanceRequest({ theme })
};
electron.contextBridge.exposeInMainWorld("madnessAppearance", Object.freeze(appearanceBridge));
var request = async (payload) => {
	const correlationId = crypto.randomUUID();
	const reply = await electron.ipcRenderer.invoke(COMMAND_CHANNEL, {
		...payload,
		contractVersion: 1,
		correlationId
	});
	if (!isReply(reply)) throw new Error("INVALID_BRIDGE_REPLY");
	if (reply.correlationId !== correlationId && (reply.ok || !["INVALID_COMMAND", "UNTRUSTED_CALLER"].includes(reply.error.code))) throw new Error("UNRELATED_BRIDGE_REPLY");
	return reply;
};
electron.contextBridge.exposeInMainWorld("madness", Object.freeze({
	readState: () => request({ type: "read-state" }),
	chooseDirectory: () => request({ type: "choose-directory" }),
	selectProject: (projectId) => request({
		type: "select-project",
		projectId
	}),
	saveDraft: (projectId, text) => request({
		type: "save-draft",
		projectId,
		text
	}),
	setNavigation: (collapsed) => request({
		type: "set-navigation",
		collapsed
	}),
	onStateChanged: (listener) => {
		const receive = (_event, value) => {
			if (isDomainEvent(value)) listener(value);
		};
		electron.ipcRenderer.on(EVENT_CHANNEL, receive);
		return () => electron.ipcRenderer.removeListener(EVENT_CHANNEL, receive);
	}
}));
var connectionRequest = async (action) => {
	const correlationId = crypto.randomUUID();
	const reply = await electron.ipcRenderer.invoke(CONNECTION_COMMAND_CHANNEL, {
		contractVersion: 1,
		correlationId,
		action
	});
	if (!isConnectionReply(reply)) throw new Error("INVALID_CONNECTION_REPLY");
	if (reply.correlationId !== correlationId && (reply.correlationId !== "rejected-request" || !["UNTRUSTED_CALLER", "INVALID_COMMAND"].includes(reply.state.errorCode ?? ""))) throw new Error("UNRELATED_CONNECTION_REPLY");
	return reply;
};
electron.contextBridge.exposeInMainWorld("madnessConnection", Object.freeze({
	checkPublicKeys: () => connectionRequest("check-public-keys"),
	cancelPublicKeys: () => connectionRequest("cancel-public-keys"),
	read: () => connectionRequest("read"),
	connect: () => connectionRequest("connect"),
	verify: () => connectionRequest("verify"),
	cancel: () => connectionRequest("cancel"),
	disconnect: () => connectionRequest("disconnect"),
	acknowledgePlan: () => connectionRequest("acknowledge-plan"),
	manageUsage: () => connectionRequest("manage-usage"),
	openPublicKeys: () => connectionRequest("open-public-keys"),
	copyPublicKeys: () => connectionRequest("copy-public-keys"),
	onChanged: (listener) => {
		const receive = (_event, value) => {
			if (isConnectionState(value)) listener(value);
		};
		electron.ipcRenderer.on(CONNECTION_EVENT_CHANNEL, receive);
		return () => electron.ipcRenderer.removeListener(CONNECTION_EVENT_CHANNEL, receive);
	}
}));
var dialogueRequest = async (payload) => {
	const correlationId = crypto.randomUUID();
	const reply = await electron.ipcRenderer.invoke(DIALOGUE_COMMAND_CHANNEL, {
		...payload,
		contractVersion: 1,
		correlationId
	});
	if (!isDialogueReply(reply)) throw new Error("INVALID_DIALOGUE_REPLY");
	if (reply.correlationId !== correlationId && (reply.correlationId !== "rejected-request" || !["INVALID_COMMAND", "UNTRUSTED_CALLER"].includes(reply.state.errorCode ?? ""))) throw new Error("UNRELATED_DIALOGUE_REPLY");
	return reply.state;
};
electron.contextBridge.exposeInMainWorld("madnessDialogue", Object.freeze({
	launchHelp: (projectId) => dialogueRequest({
		type: "launch-help",
		projectId
	}),
	inspectApproval: (approvalId) => dialogueRequest({
		type: "inspect-approval",
		approvalId
	}),
	observeStop: () => dialogueRequest({ type: "observe-stop" }),
	saveApproval: (approvalId, adjustment) => dialogueRequest({
		type: "save-approval",
		approvalId,
		adjustment
	}),
	decideApproval: (approvalId, decision) => dialogueRequest({
		type: "decide-approval",
		approvalId,
		decision
	}),
	sendAdjustment: (approvalId) => dialogueRequest({
		type: "send-adjustment",
		approvalId
	}),
	saveQuestion: (questionId, values) => dialogueRequest({
		type: "save-question",
		questionId,
		values
	}),
	answerQuestion: (questionId, values) => dialogueRequest({
		type: "answer-question",
		questionId,
		values
	}),
	qualifyForge: (projectId) => dialogueRequest({
		type: "qualify-forge",
		projectId
	}),
	launchForge: (projectId) => dialogueRequest({
		type: "launch-forge",
		projectId
	}),
	copyWorkflow: (conversationId, target) => dialogueRequest({
		type: "copy-workflow",
		conversationId,
		target
	}),
	read: () => dialogueRequest({ type: "read" }),
	qualify: (projectId) => dialogueRequest({
		type: "qualify",
		projectId
	}),
	launch: (projectId, mode) => dialogueRequest({
		type: "launch",
		projectId,
		...mode ? { mode } : {}
	}),
	send: (projectId, conversationId, text) => dialogueRequest({
		type: "send",
		projectId,
		conversationId,
		text
	}),
	stop: () => dialogueRequest({ type: "stop" }),
	onChanged: (listener) => {
		const receive = (_event, value) => {
			if (isDialogueState(value)) listener(value);
		};
		electron.ipcRenderer.on(DIALOGUE_EVENT_CHANNEL, receive);
		return () => electron.ipcRenderer.removeListener(DIALOGUE_EVENT_CHANNEL, receive);
	}
}));
var helpRequest = async (payload) => {
	const correlationId = crypto.randomUUID();
	const reply = await electron.ipcRenderer.invoke(HELP_COMMAND_CHANNEL, {
		...payload,
		contractVersion: 1,
		correlationId
	});
	if (!reply || typeof reply !== "object" || !("state" in reply) || !("correlationId" in reply) || reply.correlationId !== correlationId || !isHelpState(reply.state)) throw new Error("INVALID_HELP_REPLY");
	return reply.state;
};
electron.contextBridge.exposeInMainWorld("madnessHelp", Object.freeze({
	read: () => helpRequest({ type: "read" }),
	prepare: (projectId) => helpRequest({
		type: "prepare",
		projectId
	}),
	copy: () => helpRequest({ type: "copy" }),
	retrySave: (conversationId) => helpRequest({
		type: "retry-save",
		conversationId
	}),
	onChanged: (listener) => {
		const receive = (_event, value) => {
			if (isHelpState(value)) listener(value);
		};
		electron.ipcRenderer.on(HELP_EVENT_CHANNEL, receive);
		return () => electron.ipcRenderer.removeListener(HELP_EVENT_CHANNEL, receive);
	}
}));
var contextRequest = async (payload) => {
	const correlationId = crypto.randomUUID(), reply = await electron.ipcRenderer.invoke(BMAD_CONTEXT_COMMAND_CHANNEL, {
		...payload,
		contractVersion: 1,
		correlationId
	});
	if (!reply || typeof reply !== "object" || !("state" in reply) || !("correlationId" in reply) || reply.correlationId !== correlationId || !isBmadContextState(reply.state)) throw Error("INVALID_CONTEXT_REPLY");
	return reply.state;
};
electron.contextBridge.exposeInMainWorld("madnessBmadContext", Object.freeze({
	read: () => contextRequest({ type: "read" }),
	observe: (projectId) => contextRequest({
		type: "observe",
		projectId
	}),
	choose: (projectId, initiativeId, revision) => contextRequest({
		type: "choose",
		projectId,
		initiativeId,
		revision
	}),
	retrySave: (projectId) => contextRequest({
		type: "retry-save",
		projectId
	}),
	onChanged: (listener) => {
		const receive = (_event, value) => {
			if (isBmadContextState(value)) listener(value);
		};
		electron.ipcRenderer.on(BMAD_CONTEXT_EVENT_CHANNEL, receive);
		return () => electron.ipcRenderer.removeListener(BMAD_CONTEXT_EVENT_CHANNEL, receive);
	}
}));
var progressRequest = async (payload) => {
	const correlationId = crypto.randomUUID(), reply = await electron.ipcRenderer.invoke(BMAD_PROGRESS_COMMAND_CHANNEL, {
		...payload,
		contractVersion: 1,
		correlationId
	});
	if (!reply || typeof reply !== "object" || !("state" in reply) || !("correlationId" in reply) || reply.correlationId !== correlationId || !isBmadProgressState(reply.state)) throw Error("INVALID_PROGRESS_REPLY");
	return reply.state;
};
electron.contextBridge.exposeInMainWorld("madnessBmadProgress", Object.freeze({
	read: () => progressRequest({ type: "read" }),
	collect: (projectId) => progressRequest({
		type: "collect",
		projectId
	}),
	onChanged: (listener) => {
		const receive = (_event, value) => {
			if (isBmadProgressState(value)) listener(value);
		};
		electron.ipcRenderer.on(BMAD_PROGRESS_EVENT_CHANNEL, receive);
		return () => electron.ipcRenderer.removeListener(BMAD_PROGRESS_EVENT_CHANNEL, receive);
	}
}));
