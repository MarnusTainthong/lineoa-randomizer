// Enums are const objects + union types so they work in Prisma, class-validator and React alike.

export const EVENT_STATUS = { OPEN: 'OPEN', DRAWN: 'DRAWN', CLOSED: 'CLOSED' } as const;
export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const FEASIBILITY = {
  OK: 'OK',
  INFEASIBLE: 'INFEASIBLE',
  TOO_FEW_PARTICIPANTS: 'TOO_FEW_PARTICIPANTS',
} as const;
export type Feasibility = (typeof FEASIBILITY)[keyof typeof FEASIBILITY];

export const RULE_TYPE = {
  MUTUAL_EXCLUDE: 'MUTUAL_EXCLUDE',
  ONE_WAY_EXCLUDE: 'ONE_WAY_EXCLUDE',
  GROUP_EXCLUDE: 'GROUP_EXCLUDE',
  FORCE_ASSIGN: 'FORCE_ASSIGN',
} as const;
export type RuleType = (typeof RULE_TYPE)[keyof typeof RULE_TYPE];

export const MIN_PARTICIPANTS_TO_DRAW = 3;

/** Rule types whose participantIds are an ordered [from, to] pair. */
export const DIRECTED_RULE_TYPES: readonly RuleType[] = [
  RULE_TYPE.ONE_WAY_EXCLUDE,
  RULE_TYPE.FORCE_ASSIGN,
];

export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface AuthResponse {
  accessToken: string;
  user: { id: string; displayName: string; pictureUrl: string | null };
}

export interface ParticipantView {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  isGuest: boolean;
  isMe: boolean;
  isOrganizer: boolean;
}

export interface EventSummary {
  id: string;
  name: string;
  status: EventStatus;
  budget: number | null;
  exchangeDate: string | null;
  currentDrawVersion: number;
  participantCount: number;
  isOrganizer: boolean;
  /** True when the user has seen an earlier round and a newer one exists. */
  hasNewDraw: boolean;
  feasibility: Feasibility | null;
}

export interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  budget: number | null;
  exchangeDate: string | null;
  inviteCode: string;
  status: EventStatus;
  allowViewAllResults: boolean;
  currentDrawVersion: number;
  isOrganizer: boolean;
  /** Only filled for the organizer. */
  feasibility: Feasibility | null;
  feasibilityReason: string | null;
  participants: ParticipantView[];
}

export interface InvitePreview {
  eventId: string;
  name: string;
  status: EventStatus;
  isAlreadyJoined: boolean;
}

export interface RuleView {
  id: string;
  type: RuleType;
  participantIds: string[];
  note: string | null;
}

export interface MyResult {
  eventId: string;
  eventName: string;
  budget: number | null;
  exchangeDate: string | null;
  status: EventStatus;
  allowViewAllResults: boolean;
  drawVersion: number;
  drawnAt: string | null;
  /** Null until the draw happens. */
  receiverName: string | null;
  hasNewDraw: boolean;
  /** True once the user opened the current round (envelope no longer needs opening). */
  hasOpenedCurrent: boolean;
}

export interface ResultHistoryEntry {
  drawVersion: number;
  drawnAt: string;
  receiverName: string;
  isCurrent: boolean;
}

export interface ResultRow {
  giverName: string;
  receiverName: string;
}

export interface RoundResults {
  drawVersion: number;
  drawnAt: string | null;
  availableVersions: number[];
  rows: ResultRow[];
}

export interface DrawResponse {
  drawVersion: number;
}

export interface MockUserView {
  id: string;
  displayName: string;
}

/** Drop spaces and uppercase letters. `ab3 k9q` and `AB3K9Q` are the same code. */
export function normalizeInviteCode(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}

/** Six letters or digits. No spaces, symbols, or lowercase. */
export function isInviteCode(raw: string): boolean {
  return /^[A-Z0-9]{6}$/.test(normalizeInviteCode(raw));
}

/** Shown as `AB3 K9Q`. */
export function formatInviteCode(code: string): string {
  const normalized = normalizeInviteCode(code);
  if (!isInviteCode(normalized)) return normalized;
  return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
}
