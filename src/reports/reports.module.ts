import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';

import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CustomGroupModule } from '../custom-group/custom-group.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    UserAccountsModule,
    AuthModule,
    CustomGroupModule,
    ServicesModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule {}
