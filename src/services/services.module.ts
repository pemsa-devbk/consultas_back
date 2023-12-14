import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';

@Module({
  controllers: [],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule {}
