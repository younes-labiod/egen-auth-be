import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SecretsManagerService } from 'src/config/secrets-manager.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private jwtSecret: string;

  constructor(
    private readonly userService: UserService,
    private readonly secretsManagerService: SecretsManagerService,
  ) {}

  async onModuleInit() {
    const secretName = process.env.JWT_SECRET_NAME || 'prod/jwt-secret';
    const secretString = await this.secretsManagerService.getSecret(secretName);

    if (secretString) {
      const secret = JSON.parse(secretString);
      this.jwtSecret = secret.JWT_SECRET;
    } else {
      throw new Error('Failed to load JWT_SECRET from Secrets Manager.');
    }
  }

  async signIn(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not initialized.');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      this.jwtSecret,
      { expiresIn: '1h' },
    );
    return { token };
  }

  async signUp(email: string, name: string, password: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email is already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create({ email, name, password: hashedPassword });
  }

  /*async signInw(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Retrieve secret from environment variables
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment.');
    }

    // Sign the JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: '1h',
    });
    return { token };
  }*/
}
