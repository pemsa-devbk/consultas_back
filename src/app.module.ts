import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ReportsModule } from './reports/reports.module';
import { MailerModule } from './mailer/mailer.module';
import { Logger } from './middlewares/logger.middleware';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DownloadModule } from './download/download.module';
import { CompanyModule } from './company/company.module';
import { CustomGroupModule } from './custom-group/custom-group.module';
import { GroupAccountModule } from './group-account/group-account.module';
import { UserAccountsModule } from './user-accounts/user-accounts.module';
import { ServicesModule } from './services/services.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/public')
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      extra: {
        trustServerCertificate: true
      }
    }),
    AuthModule,
    UserModule,
    CommonModule,
    MailerModule,
    DownloadModule,
    CompanyModule,
    UserAccountsModule,
    GroupAccountModule,
    CustomGroupModule,
    ReportsModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Logger).forRoutes('*')
  }
}
