import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, Matches } from "class-validator";

export class SignUpDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John Doe", description: "User full name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "Password123!", description: "User password" })
  @MinLength(8)
  @Matches(/[A-Za-z]/, {
    message: "Password must contain at least one letter.",
  })
  @Matches(/\d/, { message: "Password must contain at least one number." })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: "Password must contain at least one special character.",
  })
  password: string;
}
