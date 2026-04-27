import { apiRequest } from "./client";
import type { LoginInput, SignupInput, TokenResponse, User } from "../types/auth";

const BASE_PATH = "/api/v1/auth";

export function signup(payload: SignupInput): Promise<User> {
  return apiRequest<User>(`${BASE_PATH}/signup`, {
    method: "POST",
    jsonBody: payload,
  });
}

export function login(payload: LoginInput): Promise<TokenResponse> {
  return apiRequest<TokenResponse>(`${BASE_PATH}/login`, {
    method: "POST",
    jsonBody: payload,
  });
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>(`${BASE_PATH}/me`, { method: "GET" });
}
