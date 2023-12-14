import { Module } from '@nestjs/common';
import { UserAccountsService } from './user-accounts.service';
import { UserAccountsController } from './user-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccounts } from './entities/user-accounts.entity';
import { CustomGroupModule } from '../custom-group/custom-group.module';
import { UserModule } from '../user/user.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAccounts]),
    // CommonModule,
    CustomGroupModule,
    UserModule,
    ServicesModule
  ],
  controllers: [UserAccountsController],
  providers: [UserAccountsService],
  exports: [UserAccountsService]
})
export class UserAccountsModule {}
