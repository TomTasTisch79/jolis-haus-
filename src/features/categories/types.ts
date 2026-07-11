export type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
};

export type CategoryInput = {
  name: string;
  icon: string;
  color: string;
};
