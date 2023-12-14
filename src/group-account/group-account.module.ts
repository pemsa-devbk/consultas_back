import { Module } from '@nestjs/common';
import { GroupAccountService } from './group-account.service';
import { GroupAccountController } from './group-account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupAccount } from './entities/group-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupAccount])
  ],
  controllers: [GroupAccountController],
  providers: [GroupAccountService],
  exports: [GroupAccountService]
})
export class GroupAccountModule {}
