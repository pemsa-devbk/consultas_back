import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { UserModule } from '../user/user.module';
import { MailerModule } from '../mailer/mailer.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    UserModule,
    MailerModule,
    ServicesModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService]
})
export class CompanyModule {}
