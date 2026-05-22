import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusySlotsService } from './busy-slots.service';
import { BusySlotsController, BusySlotsControllerRoot } from './busy-slots.controller';
import { BusySlot } from '../entities/busy-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusySlot])],
  controllers: [BusySlotsController, BusySlotsControllerRoot],
  providers: [BusySlotsService],
  exports: [BusySlotsService],
})
export class BusySlotsModule {}
