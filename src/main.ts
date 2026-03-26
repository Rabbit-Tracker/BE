import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Request -> Pipe (Validation) -> Controller -> Service
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 값은 자동 제거
      forbidNonWhitelisted: true, // DTO에 없는 값이 있으면 에러 발생
      transform: true, // 데이터 타입 자동 변환
    }),
  );

  // Swagger 문서 (/docs, /docs-json)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rabbit Tracker API')
    .setDescription('Rabbit Tracker API 문서')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
