import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa6";
import {
  FiLogIn,
  FiLogOut,
  FiKey,
  FiUser,
  FiLink,
  FiSlash,
  FiShield,
  FiSmartphone,
  FiEye,
} from "react-icons/fi";
import type { ActivityType, Provider } from "./types";

// Display metadata for the mock social providers.
export const PROVIDERS: Record<
  Provider,
  { label: string; icon: typeof FaFacebook; color: string }
> = {
  FACEBOOK: { label: "Facebook", icon: FaFacebook, color: "#1877F2" },
  INSTAGRAM: { label: "Instagram", icon: FaInstagram, color: "#E4405F" },
  WHATSAPP: { label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
};

export const ALL_PROVIDERS = Object.keys(PROVIDERS) as Provider[];

// Human labels + icons for each activity type shown in the history feed.
export const ACTIVITY_META: Record<
  ActivityType,
  { label: string; icon: typeof FiLogIn }
> = {
  LOGIN: { label: "Signed in", icon: FiLogIn },
  LOGOUT: { label: "Signed out", icon: FiLogOut },
  PASSWORD_CHANGE: { label: "Changed password", icon: FiKey },
  PROFILE_UPDATE: { label: "Updated profile", icon: FiUser },
  ACCOUNT_CONNECTED: { label: "Connected an account", icon: FiLink },
  ACCOUNT_REMOVED: { label: "Removed an account", icon: FiSlash },
  PRIVACY_UPDATE: { label: "Updated privacy settings", icon: FiEye },
  TWO_FACTOR_TOGGLE: { label: "Changed two-factor setting", icon: FiShield },
  DEVICE_REMOVED: { label: "Removed a device", icon: FiSmartphone },
};

export const ACTIVITY_FILTERS: { value: ActivityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All activity" },
  { value: "LOGIN", label: "Logins" },
  { value: "PASSWORD_CHANGE", label: "Password changes" },
  { value: "PROFILE_UPDATE", label: "Profile updates" },
  { value: "ACCOUNT_CONNECTED", label: "Account changes" },
  { value: "PRIVACY_UPDATE", label: "Privacy changes" },
];
