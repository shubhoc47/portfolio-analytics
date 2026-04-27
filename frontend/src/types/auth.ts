export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface SignupInput {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}
