import { Module } from '@nestjs/common';
import { DownloadService } from './download.service';
import { DownloadController } from './download.controller';
import { ReportsModule } from '../reports/reports.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ReportsModule, AuthModule],
  controllers: [DownloadController],
  providers: [DownloadService]
})
export class DownloadModule {}
