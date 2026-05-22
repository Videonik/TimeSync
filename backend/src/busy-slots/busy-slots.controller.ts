import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BusySlotsService } from './busy-slots.service';
import { BusySlot } from '../entities/busy-slot.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users/:userId/busy-slots')
@UseGuards(JwtAuthGuard)
export class BusySlotsController {
  constructor(private readonly busySlotsService: BusySlotsService) {}

  @Get()
  async getUserBusySlots(@Param('userId') userId: string): Promise<BusySlot[]> {
    return this.busySlotsService.getUserBusySlots(userId);
  }

  @Post()
  async createBusySlot(
    @Param('userId') userId: string,
    @Body() body: { startTime: string; endTime: string; title?: string }
  ): Promise<BusySlot> {
    return this.busySlotsService.createBusySlot(userId, {
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      title: body.title
    });
  }
}

@Controller('busy-slots')
@UseGuards(JwtAuthGuard)
export class BusySlotsControllerRoot {
  constructor(private readonly busySlotsService: BusySlotsService) {}

  @Delete(':id')
  async deleteBusySlot(@Param('id') id: string): Promise<void> {
    return this.busySlotsService.deleteBusySlot(id);
  }
}
