import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('yandex')
  async yandexAuth() {
    // Redirect to Yandex OAuth
  }

  @Get('yandex/callback')
  async yandexAuthCallback(@Req() req: any) {
    // Mock processing callback
    return this.authService.handleOAuthCallback({ id: 'yandex-123', email: 'user@yandex.ru' });
  }

  @Get('vk')
  async vkAuth() {
    // Redirect to VK OAuth
  }

  @Get('vk/callback')
  async vkAuthCallback(@Req() req: any) {
    // Mock processing callback
    return this.authService.handleOAuthCallback({ id: 'vk-123', email: 'user@vk.com' });
  }
}
