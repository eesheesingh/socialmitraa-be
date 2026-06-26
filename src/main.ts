import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { env } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes under /api/* (so /api/auth/login, /api/oauth/callback, ...)
  app.setGlobalPrefix("api");

  app.use(cookieParser());

  // Allow the separate frontend origin to call the API with cookies.
  app.enableCors({
    origin: env.frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(env.port);
  console.log(`Backend running on http://localhost:${env.port}/api`);
}

bootstrap();
