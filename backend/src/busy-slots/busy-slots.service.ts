import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusySlot } from '../entities/busy-slot.entity';

@Injectable()
export class BusySlotsService {
  constructor(
    @InjectRepository(BusySlot)
    private busySlotRepository: Repository<BusySlot>,
  ) {}

  async getUserBusySlots(userId: string): Promise<BusySlot[]> {
    return this.busySlotRepository.find({ where: { userId } });
  }

  async createBusySlot(userId: string, data: { startTime: Date, endTime: Date, title?: string }): Promise<BusySlot> {
    const slot = this.busySlotRepository.create({
      userId,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title
    });
    return this.busySlotRepository.save(slot);
  }

  async deleteBusySlot(id: string): Promise<void> {
    await this.busySlotRepository.delete(id);
  }
}
