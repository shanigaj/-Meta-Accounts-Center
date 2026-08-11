// Client-facing shapes. These mirror what the API actually returns (no
// passwordHash, dates as ISO strings over the wire).

export type Role = "USER" | "ADMIN";
export type Provider = "FACEBOOK" | "INSTAGRAM" | "WHATSAPP";
export type Visibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export type ActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE"
  | "ACCOUNT_CONNECTED"
  | "ACCOUNT_REMOVED"
  | "PRIVACY_UPDATE"
  | "TWO_FACTOR_TOGGLE"
  | "DEVICE_REMOVED";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
};

export type ConnectedAccount = {
  id: string;
  provider: Provider;
  providerUsername: string;
  connectedAt: string;
};

export type SessionInfo = {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
};

export type Security = {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  activeSessions: number;
};

export type Privacy = {
  profileVisibility: Visibility;
  emailVisibility: Visibility;
  phoneVisibility: Visibility;
  personalizedAds: boolean;
  dataSharing: boolean;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  deviceName: string;
  browser: string;
  ipAddress: string;
  createdAt: string;
};

export type ActivityPage = {
  items: ActivityItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  _count: { connectedAccounts: number; sessions: number };
};

export type Dashboard = {
  user: User;
  security: { twoFactorEnabled: boolean; emailVerified: boolean; score: number };
  connectedAccounts: ConnectedAccount[];
  devices: SessionInfo[];
  recentActivity: ActivityItem[];
};
