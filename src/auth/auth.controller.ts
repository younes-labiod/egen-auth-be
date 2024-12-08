import { Controller, Post, Body, Get, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dtos/sign-up.dto";
import { SignInDto } from "./dtos/sign-in.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.name,
      signUpDto.password
    );
  }

  @Post("signin")
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Get("profile")
  getProfile(@Request() req: any) {
    return {
      message: `Welcome to the application, ${req.user}`,
      user: req.user,
    };
  }
}
