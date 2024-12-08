import { MiddlewareConsumer, Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./users/user.module";
import { ConfigModule } from "@nestjs/config";
import { SecretsManagerService } from "./config/secrets-manager.service";
import { SecretsModule } from "./config/secrets.module";
import { TransactionUuidMiddleware } from "./middleware/transaction-uuid.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    SecretsModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [SecretsManagerService],
  exports: [SecretsManagerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionUuidMiddleware).forRoutes("*");
    // consumer.apply(TransactionUuidMiddleware).forRoutes('auth');
  }
}
