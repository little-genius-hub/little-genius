export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export class ServerCookies {
  static async get(name: string): Promise<string | undefined> {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  }

  static async set(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): Promise<void> {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      maxAge: options.maxAge || 60 * 60 * 24 * 7,
      path: options.path || "/",
      secure: options.secure ?? process.env.NODE_ENV === "production",
      httpOnly: options.httpOnly ?? false,
      sameSite: options.sameSite || "lax",
      ...options,
    });
  }

  static async delete(name: string): Promise<void> {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete(name);
  }

  static async getAuthToken(): Promise<string | null> {
    const authorization = await this.get("Authorization");
    if (!authorization) return null;

    const [type, token] = authorization.split(" ");
    return type === "Bearer" ? token : null;
  }
}

export class ClientCookies {
  static get(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return undefined;
  }

  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === "undefined") return;

    let cookieString = `${name}=${value}`;

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    cookieString += `; path=${options.path || "/"}`;

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  static delete(name: string): void {
    this.set(name, "", { expires: new Date(0) });
  }

  static getAuthToken(): string | null {
    const authorization = this.get("Authorization");
    if (!authorization) return null;

    const [type, token] = authorization.split(" ");
    return type === "Bearer" ? token : null;
  }

  static getCurrentChildId(): string | null {
    return this.get("currentChildId") || null;
  }

  static setCurrentChildId(childId: string): void {
    this.set("currentChildId", childId, {
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  static removeCurrentChildId(): void {
    this.delete("currentChildId");
  }
}

export class UniversalCookies {
  static isServer(): boolean {
    return typeof window === "undefined";
  }

  static async getAuthToken(): Promise<string | null> {
    if (this.isServer()) {
      return await ServerCookies.getAuthToken();
    } else {
      return ClientCookies.getAuthToken();
    }
  }

  static getCurrentChildId(): string | null {
    if (this.isServer()) {
      return null;
    } else {
      return ClientCookies.getCurrentChildId();
    }
  }

  static setCurrentChildId(childId: string): void {
    if (!this.isServer()) {
      ClientCookies.setCurrentChildId(childId);
    }
  }

  static removeCurrentChildId(): void {
    if (!this.isServer()) {
      ClientCookies.removeCurrentChildId();
    }
  }
}
