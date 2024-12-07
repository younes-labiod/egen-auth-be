import { Injectable, Logger } from "@nestjs/common";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

@Injectable()
export class SecretsManagerService {
  private readonly client: SecretsManagerClient;
  private readonly logger = new Logger(SecretsManagerService.name);

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || "me-central-1",
    });
  }

  async getSecret(secretName: string): Promise<string | null> {
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);

      if (response.SecretString) {
        return response.SecretString;
      }

      this.logger.error("Secret ${secretName} does not contain a SecretString");
      return null;
    } catch (error) {
      this.logger.error("Failed to fetch secret ${secretName}:", error);
      throw error;
    }
  }
}
