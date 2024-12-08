import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { UserService } from "../users/user.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { SecretsManagerService } from "src/config/secrets-manager.service";
import { RequestContext } from "src/utils/request-context";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private jwtSecret: string;

  constructor(
    private readonly userService: UserService,
    private readonly secretsManagerService: SecretsManagerService
  ) {}

  async onModuleInit() {
    const secretName = process.env.JWT_SECRET_NAME || "prod/jwt-secret";
    const secretString = await this.secretsManagerService.getSecret(secretName);

    if (secretString) {
      const secret = JSON.parse(secretString);
      this.jwtSecret = secret.JWT_SECRET;
    } else {
      this.logger.error("Failed to load JWT_SECRET from Secrets Manager.");
      throw new Error("Failed to load JWT_SECRET from Secrets Manager.");
    }
  }

  async signIn(email: string, password: string) {
    const transactionUuid = RequestContext.getTransactionUuid();
    this.logger.log(`[${transactionUuid}] - Authenticating user ${email}`);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.debug(`[${transactionUuid}] - Invalid credentials.`);
      throw new UnauthorizedException(
        `[${transactionUuid}] - Invalid credentials.`
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.debug(`[${transactionUuid}] - Invalid credentials.`);
      throw new UnauthorizedException(
        `[${transactionUuid}] - Invalid credentials.`
      );
    }

    if (!this.jwtSecret) {
      this.logger.debug(
        `[${transactionUuid}] - JWT_SECRET is not initialized.`
      );
      throw new Error(`[${transactionUuid}] - JWT_SECRET is not initialized.`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      this.jwtSecret,
      { expiresIn: "1h" }
    );
    return { token };
  }

  async signUp(email: string, name: string, password: string) {
    const transactionUuid = RequestContext.getTransactionUuid();
    this.logger.log(`[${transactionUuid}] - Creating user ${email}`);

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      this.logger.debug(`[${transactionUuid}] - Email is already taken.`);
      throw new BadRequestException(
        `[${transactionUuid}] - Email is already taken.`
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create({ email, name, password: hashedPassword });
  }
}
