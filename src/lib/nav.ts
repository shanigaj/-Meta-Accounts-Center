import {
  FiActivity,
  FiEye,
  FiGrid,
  FiLink,
  FiLock,
  FiSmartphone,
  FiUser,
} from "react-icons/fi";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/profile", label: "Profile", icon: FiUser },
  { href: "/accounts", label: "Connected accounts", icon: FiLink },
  { href: "/security", label: "Security", icon: FiLock },
  { href: "/privacy", label: "Privacy", icon: FiEye },
  { href: "/activity", label: "Activity", icon: FiActivity },
  { href: "/devices", label: "Devices", icon: FiSmartphone },
] as const;
