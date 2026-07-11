import { Body, Controller, Post } from "@nestjs/common";
import { demoSession, demoUser } from "../../data/stockholm.stub";

interface AuthPayload {
  email: string;
  password: string;
}

@Controller("auth")
export class AuthController {
  @Post("register")
  register(@Body() payload: AuthPayload) {
    return {
      user: {
        ...demoUser,
        email: payload.email || demoUser.email
      },
      session: demoSession,
      onboardingState: "vehicle-required"
    };
  }

  @Post("login")
  login(@Body() payload: AuthPayload) {
    return {
      user: {
        ...demoUser,
        email: payload.email || demoUser.email
      },
      session: demoSession
    };
  }
}

