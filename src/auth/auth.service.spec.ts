import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "../users/user.service";
import { SecretsManagerService } from "src/config/secrets-manager.service";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { RequestContext } from "src/utils/request-context";

jest.mock("src/utils/request-context"); // Mock the RequestContext utility

describe("AuthService", () => {
  let authService: AuthService;
  let userService: Partial<UserService>;
  let secretsManagerService: Partial<SecretsManagerService>;

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    secretsManagerService = {
      getSecret: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: SecretsManagerService, useValue: secretsManagerService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe("onModuleInit", () => {
    it("should initialize JWT_SECRET successfully", async () => {
      const secret = { JWT_SECRET: "test-secret" };
      (secretsManagerService.getSecret as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(secret)
      );

      await authService.onModuleInit();
      expect(authService["jwtSecret"]).toBe(secret.JWT_SECRET);
    });

    it("should throw an error if JWT_SECRET is not fetched", async () => {
      (secretsManagerService.getSecret as jest.Mock).mockResolvedValueOnce(
        null
      );

      await expect(authService.onModuleInit()).rejects.toThrow(
        "Failed to load JWT_SECRET from Secrets Manager."
      );
    });
  });

  describe("signIn", () => {
    beforeEach(() => {
      (RequestContext.getTransactionUuid as jest.Mock).mockReturnValue(
        "test-transaction-id"
      );
    });

    it("should return a JWT token for valid credentials", async () => {
      const user = {
        _id: "userId",
        email: "test@example.com",
        password: "hashed_password",
      };
      const token = "fake_jwt_token";

      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true as never); // TODO check
      jest.spyOn(jwt, "sign").mockReturnValueOnce(token as never); // TODO check

      authService["jwtSecret"] = "test-secret"; // Mock initialized secret

      const result = await authService.signIn(
        "test@example.com",
        "Password123!"
      );
      expect(result).toEqual({ token });
      expect(RequestContext.getTransactionUuid).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user._id, email: user.email },
        "test-secret",
        { expiresIn: "1h" }
      );
    });

    it("should throw UnauthorizedException for invalid email", async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        authService.signIn("test@example.com", "Password123!")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const user = {
        _id: "userId",
        email: "test@example.com",
        password: "hashed_password",
      };

      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false as never); // TODO check

      await expect(
        authService.signIn("test@example.com", "WrongPassword")
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("signUp", () => {
    beforeEach(() => {
      (RequestContext.getTransactionUuid as jest.Mock).mockReturnValue(
        "test-transaction-id"
      );
    });

    it("should create a user successfully", async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(null);
      (userService.create as jest.Mock).mockResolvedValueOnce({
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
      });

      jest
        .spyOn(bcrypt, "hash")
        .mockResolvedValueOnce("hashed_password" as never); //TODO check

      const result = await authService.signUp(
        "test@example.com",
        "Test User",
        "Password123!"
      );
      expect(result).toEqual({
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
      });
      expect(userService.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(userService.create).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password",
      });
    });

    it("should throw BadRequestException if email is already taken", async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce({
        email: "test@example.com",
      });

      await expect(
        authService.signUp("test@example.com", "Test User", "Password123!")
      ).rejects.toThrow(BadRequestException);
    });
  });
});
