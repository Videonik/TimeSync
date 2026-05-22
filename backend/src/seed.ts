import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const existing = await userRepository.findOne({ where: { id: 'mock-user-id' } });
  if (!existing) {
    const user = userRepository.create({
      id: 'mock-user-id',
      email: 'mock@example.com',
      name: 'Mock User'
    });
    await userRepository.save(user);
    console.log('Mock user created');
  } else {
    console.log('Mock user already exists');
  }

  await app.close();
}

bootstrap();
