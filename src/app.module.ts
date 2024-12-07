import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { SecretsManagerService } from './config/secrets-manager.service';
import { SecretsModule } from './config/secrets.module';
import { TransactionUuidMiddleware } from './middleware/transaction-uuid.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env variables globallys
    UserModule,
    MongooseModule.forRoot('mongodb://localhost:27017/auth-demo'), // Replace with your MongoDB URI
    AuthModule,
    SecretsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SecretsManagerService],
  exports: [SecretsManagerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionUuidMiddleware).forRoutes('*');
    // consumer.apply(TransactionUuidMiddleware).forRoutes('auth');
  }
}
