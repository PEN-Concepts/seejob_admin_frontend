import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  private readonly rightRoutes = [
    { route: '/dashboard', keys: ['dashboard'] },
    { route: '/revenue-dashboard', keys: ['revenue_dashboard', 'revenue-dashboard'] },
    { route: '/members', keys: ['members', 'member'] },
    { route: '/billing', keys: ['billing'] },
    { route: '/analytics', keys: ['analytics'] },
    { route: '/support', keys: ['support'] },
    { route: '/contact-request', keys: ['contact_request', 'contact-request'] },
    { route: '/demo-request', keys: ['demo_request', 'demo-request'] },
    { route: '/admin-users', keys: ['admin-users', 'admin_users'] },
  ];

  async requestLoginOtp(email: string): Promise<any> {
    return this.api.post('admin_contactRequest/login-otp-request', { email });
  }

  async verifyLoginOtp(email: string, otp: string): Promise<boolean> {
    const res: any = await this.api.post('admin_contactRequest/login-otp-verify', { email, otp });

    if (String(res?.code) !== '200') {
      return false;
    }

    const token = this.extractToken(res);
    if (!token) {
      return false;
    }

    localStorage.setItem('token', token);
    if (res?.data?.basicData) {
      localStorage.setItem('user', JSON.stringify(res.data.basicData));
    }
    if (res?.data?.photoName) {
      localStorage.setItem('photoName', res.data.photoName);
    }
    return true;
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('photoName');
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getDefaultRouteAfterLogin(): string {
    const user = this.getStoredUser();
    const rights = Array.isArray(user?.rights) ? user.rights : [];

    if (!rights.length) {
      return '/dashboard';
    }

    const allowedNames = new Set<string>();
    rights.forEach((right: any) => {
      this.getRightNameCandidates(right).forEach((name) => allowedNames.add(name));
    });

    return (
      this.rightRoutes.find((item) =>
        item.keys.some((key) => allowedNames.has(this.normalizeRightName(key)))
      )?.route || '/dashboard'
    );
  }

  private extractToken(response: any): string | null {
    if (!response) return null;

    // Handle common Node API response shapes.
    return (
      response.token ||
      response.accessToken ||
      response.jwt ||
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.jwt ||
      null
    );
  }

  private getStoredUser(): any {
    try {
      const rawUser = localStorage.getItem('user');
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }

  private getRightNameCandidates(right: any): string[] {
    return [right?.name, right?.display_name]
      .filter(Boolean)
      .flatMap((value) => {
        const normalized = this.normalizeRightName(value);
        return [
          normalized,
          normalized.replace(/_/g, '-'),
          normalized.replace(/-/g, '_'),
        ];
      });
  }

  private normalizeRightName(value: any): string {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
  }
}
