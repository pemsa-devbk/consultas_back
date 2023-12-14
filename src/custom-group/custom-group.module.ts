import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomGroupService } from './custom-group.service';
import { CustomGroup } from './entities/custom-group.entity';
import { GroupAccountModule } from '../group-account/group-account.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CustomGroup]),
    GroupAccountModule
  ],
  providers: [CustomGroupService],
  exports:[
    CustomGroupService,
  ]
})
export class CustomGroupModule {}
