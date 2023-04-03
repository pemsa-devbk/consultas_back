import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  imports: [
    ConfigModule
  ],
  exports: [MailerService]
})
export class MailerModule {}
