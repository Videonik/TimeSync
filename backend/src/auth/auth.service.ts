import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // OAuth callbacks for Yandex/VK would be implemented here or handled via Passport strategies
  async handleOAuthCallback(profile: any) {
    // Upsert user based on profile
    // Return JWT token
    return this.login({ id: profile.id, email: profile.email });
  }
}
