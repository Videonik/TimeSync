import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateOAuthLogin(profile: any): Promise<string> {
    try {
      let user = await this.userRepository.findOne({
        where: [{ yandexId: profile.yandexId }, { email: profile.email }],
      });

      if (!user) {
        user = this.userRepository.create({
          yandexId: profile.yandexId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          // Store encrypted tokens here later
        });
      } else {
        // Update info if it changed
        user.yandexId = profile.yandexId;
        user.name = profile.name || user.name;
        user.avatarUrl = profile.avatarUrl || user.avatarUrl;
      }
      
      await this.userRepository.save(user);

      const payload = { sub: user.id, email: user.email, name: user.name };
      return this.jwtService.sign(payload);
    } catch (err) {
      throw new Error('OAuth login validation failed: ' + err);
    }
  }
}
