export type Profile = {
  id: string;
  username: string;
  color: string | null;
  created_at: string;
};

export const MAX_PROFILES = 2;

export const PROFILE_COLORS = [
  "#0A84FF",
  "#FF453A",
  "#30D158",
  "#FF9F0A",
  "#BF5AF2",
  "#FF375F",
] as const;
