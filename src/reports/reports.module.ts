import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CommonModule } from 'src/common/common.module';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthModule } from '../auth/auth.module';
import { ReportsController as ReportsControllerv1 } from './old/reports.controller';
import { ReportsService as ReportsServicev1 } from './old/reports.service';

@Module({
  imports: [
    CommonModule,
    AccountsModule,
    AuthModule,
  ],
  controllers: [ReportsController, ReportsControllerv1],
  providers: [ReportsService, ReportsServicev1],
  exports: [ReportsService]
})
export class ReportsModule {}
