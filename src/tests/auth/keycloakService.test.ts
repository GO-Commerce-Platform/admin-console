import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { keycloakService, KeycloakService } from '@/services/keycloakService';
import { tokenManager } from '@/services/auth/tokenManager';

// Mock keycloak-js module by injecting a fake Keycloak constructor
vi.mock('keycloak-js', () => {
  class MockKeycloak {
    public token: string | null = null;
    public refreshToken: string | null = null;
    public tokenParsed: any = null;
    public authenticated = false;

    public onReady?: (authenticated: boolean) => void;
    public onAuthSuccess?: () => void;
    public onAuthError?: (error: any) => void;
    public onAuthRefreshSuccess?: () => void;
    public onAuthRefreshError?: (error: any) => void;
    public onTokenExpired?: () => void;
    public onAuthLogout?: () => void;

    constructor(public config: any) {}

    async init(opts: any) {
      // simulate check-sso not authenticated by default
      this.token = null;
      this.refreshToken = null;
      this.tokenParsed = null;
      this.authenticated = false;
      this.onReady && this.onReady(false);
      return false;
    }

    async login(_: any) {
      // simulate redirect by resolving
      return Promise.resolve();
    }

    async logout(_: any) {
      this.authenticated = false;
      this.token = null;
      this.refreshToken = null;
      this.onAuthLogout && this.onAuthLogout();
      return Promise.resolve();
    }

    async updateToken(_: number) {
      // simulate refresh success
      this.token = 'new_access_token';
      this.refreshToken = 'new_refresh_token';
      this.tokenParsed = { exp: Math.floor(Date.now() / 1000) + 300 };
      this.authenticated = true;
      this.onAuthRefreshSuccess && this.onAuthRefreshSuccess();
      return true;
    }
  }

  return { default: MockKeycloak };
});

describe('KeycloakService', () => {
  beforeEach(() => {
    // Clear tokens before each test
    tokenManager.clearTokens();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes without authentication on check-sso', async () => {
    const service = new KeycloakService({ enableLogging: false });
    const authenticated = await service.init();
    expect(authenticated).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('refreshes token and hydrates tokenManager', async () => {
    const service = new KeycloakService({ enableLogging: false });
    await service.init();
    const token = await service.refreshToken();
    expect(token).toBe('new_access_token');

    const authHeader = tokenManager.getAuthorizationHeader();
    expect(authHeader).toBe('Bearer new_access_token');
  });
});

