import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccounts } from './entities/user-accounts.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CustomGroup, GroupAccount } from './entities';
import { CommonModule } from '../common/common.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountsController as AccountsControllerv1 } from './old/accounts.controller';
import { AccountsService as AccountsServicev1 } from './old/accounts.service';

@Module({
  controllers: [AccountsController, AccountsControllerv1],
  providers: [AccountsService, AccountsServicev1],
  imports: [
    TypeOrmModule.forFeature([UserAccounts, CustomGroup, GroupAccount]),
    AuthModule,
    UserModule,
    CommonModule
  ],
  exports: [TypeOrmModule, AccountsService]
})
export class AccountsModule {}
