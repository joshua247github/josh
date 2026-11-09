import type { Service } from "./constants";

export type Plan = {
  id: string;
  network: string;
  name: string;
  size: string;
  validity: string;
  price: number;
  active: boolean;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  wallet_balance: number;
  created_at?: string;
};

export type Order = {
  id: string;
  user_id: string;
  plan_id: string | null;
  service: Service;
  network: string | null;
  phone_number: string;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  reference: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: "funding" | "purchase" | "refund";
  amount: number;
  status: "pending" | "success" | "failed";
  reference: string;
  created_at: string;
};

export type Announcement = {
  id: string;
  message: string;
  active: boolean;
  created_at: string;
};
