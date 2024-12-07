import { Module } from '@nestjs/common';
import { SecretsManagerService } from './secrets-manager.service';

@Module({
  providers: [SecretsManagerService],
  exports: [SecretsManagerService], // Export so it can be used in other modules
})
export class SecretsModule {}
