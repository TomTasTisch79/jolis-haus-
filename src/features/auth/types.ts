import { APPLE_SYSTEM_COLORS } from "@/lib/colors";

export type Profile = {
  id: string;
  username: string;
  color: string | null;
  created_at: string;
};

export const MAX_PROFILES = 2;

export const PROFILE_COLORS = APPLE_SYSTEM_COLORS;
