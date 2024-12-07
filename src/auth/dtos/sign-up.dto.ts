import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @MinLength(8)
  @Matches(/[A-Za-z]/, {
    message: 'Password must contain at least one letter.',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number.' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character.',
  })
  password: string;
}
