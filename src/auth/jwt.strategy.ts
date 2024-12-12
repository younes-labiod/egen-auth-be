import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { SecretsManagerService } from "src/config/secrets-manager.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  private jwtSecret: string;

  constructor(private readonly secretsManagerService: SecretsManagerService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, //  TODO check : Reject expired tokens
      secretOrKeyProvider: async (
        request: any,
        rawJwtToken: string,
        done: any
      ) => {
        try {
          // Dynamically fetch the JWT secret from Secrets Manager
          if (!this.jwtSecret) {
            const secretName = process.env.JWT_SECRET_NAME || "prod/jwt-secret";
            const secretString =
              await this.secretsManagerService.getSecret(secretName);
            if (secretString) {
              const secret = JSON.parse(secretString);
              this.jwtSecret = secret.JWT_SECRET;
              this.logger.log("Fetched JWT secret from AWS Secrets Manager.");
            } else {
              this.logger.error(
                "Failed to load JWT secret from Secrets Manager."
              );
              throw new UnauthorizedException(
                "Failed to load JWT secret from Secrets Manager."
              );
            }
          }
          done(null, this.jwtSecret);
        } catch (error) {
          this.logger.error("Error fetching JWT secret:", error.message);
          done(error, null);
        }
      },
    });
  }

  async validate(payload: any) {
    return { id: payload.id, email: payload.email };
  }
}
