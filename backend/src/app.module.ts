import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { Participant } from './entities/participant.entity';
import { AuthModule } from './auth/auth.module';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { SchedulerService } from './scheduler/scheduler.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available across all modules
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'scheduler'),
        entities: [User, Event, TimeSlot, Participant],
        synchronize: true, // Auto create tables for dev
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Event, TimeSlot, Participant]),
    AuthModule,
  ],
  controllers: [AppController, EventsController],
  providers: [AppService, EventsService, SchedulerService],
})
export class AppModule {}
