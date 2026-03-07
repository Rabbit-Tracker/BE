# Rabbit Tracker 로컬 DB 세팅 가이드

## 1. 사전 준비

- Docker Desktop 설치
- rabbit-tracker 프로젝트 클론
- Node.js / pnpm 설치

## 2. docker-compose.yml

프로젝트 루트에 아래 파일 생성

```yml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    container_name: rabbit-tracker-postgres
    restart: always
    environment:
      POSTGRES_USER: rabbit
      POSTGRES_PASSWORD: rabbit123
      POSTGRES_DB: rabbit_tracker
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 설정 의미

- DB 이름: rabbit_tracker
- 유저명: rabbit
- 비밀번호: rabbit123
- 로컬 접속 포트: 5432

## 3. DB 실행

프로젝트 루트에서 아래 명령어를 실행

```bash
docker compose up -d
```

정상 실행 확인:

```bash
docker ps
```

예상 결과 예시:

```bash
CONTAINER ID   IMAGE         COMMAND                  STATUS         PORTS                                         NAMES
xxxxxxxxxxxx   postgres:16   "docker-entrypoint.s…"   Up ...         0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp   rabbit-tracker-postgres
```

로그 확인:

```bash
docker compose logs postgres
```

아래 문구가 보이면 정상

```bash
database system is ready to accept connections
```

## 4. Nest 환경변수 설정

프로젝트 루트에 .env 파일을 생성

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=rabbit
DB_PASSWORD=rabbit123
DB_NAME=rabbit_tracker
```

## 5. Nest DB 연결 패키지 설치

```bash
pnpm install
```

## 6. src/app.module.ts 설정

src/app.module.ts를 아래 코드로 변경

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],
})
export class AppModule {}
```

현재 설정 기준: 현재는 DB 연결만 수행

## 7. Nest 서버 실행

```bash
pnpm run start:dev
```

정상 연결 시 예시 로그:

```bash
[Nest] ... LOG [NestFactory] Starting Nest application...
[Nest] ... LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] ... LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
[Nest] ... LOG [NestApplication] Nest application successfully started
```

## 8. DB 직접 확인하는 방법

Postgres 컨테이너에 직접 접속:

```bash
docker exec -it rabbit-tracker-postgres psql -U rabbit -d rabbit_tracker
```

## 9. 최초 실행 순서 요약

아래 순서로 진행

```bash
docker compose up -d
pnpm install
pnpm run start:dev
```

## 10. 주의사항

### 5432 포트 충돌

이미 로컬에서 다른 Postgres가 5432를 사용 중이면 실행이 안 될 수 있음

그 경우 docker-compose.yml을 아래처럼 수정

```yml
ports:
  - '5433:5432'
```

그리고 .env도 함께 변경

```env
DB_PORT=5433
```
