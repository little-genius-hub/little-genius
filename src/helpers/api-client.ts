/**
 * API utilities for making authenticated requests with cookie-based authentication
 */

import { ClientCookies } from "@/helpers/cookies";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Make an authenticated fetch request using cookies
 */
export async function authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const authToken = ClientCookies.getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper function to get the base API URL
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || '';
}

/**
 * Authenticated API client with predefined methods
 */
export class ApiClient {
  private static baseUrl = getBaseUrl();

  static async get(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    return authenticatedFetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      ...options,
    });
  }

  static async post(endpoint: string, data?: any, options: FetchOptions = {}): Promise<Response> {
    return authenticatedFetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async put(endpoint: string, data?: any, options: FetchOptions = {}): Promise<Response> {
    return authenticatedFetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async delete(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    return authenticatedFetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      ...options,
    });
  }

  // Specific API methods for children management
  static async getChildren(): Promise<Response> {
    return this.get('/api/user/children');
  }

  static async addChild(child: any): Promise<Response> {
    return this.post('/api/user/children', child);
  }

  static async updateChild(id: string, child: any): Promise<Response> {
    return this.put(`/api/user/children/${id}`, child);
  }

  static async deleteChild(id: string): Promise<Response> {
    return this.delete(`/api/user/children/${id}`);
  }

  static async updateChildren(children: any[]): Promise<Response> {
    return this.put('/api/user/children', { children });
  }

  static async getUserProfile(): Promise<Response> {
    return this.get('/api/user/profile');
  }
}
