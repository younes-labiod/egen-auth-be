import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "../users/user.module";
import { SecretsModule } from "src/config/secrets.module";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [UserModule, SecretsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
