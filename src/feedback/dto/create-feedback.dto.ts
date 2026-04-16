import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  // 피드백 본문
  @IsString()
  @MinLength(1, { message: '피드백 내용을 입력해 주세요.' })
  @MaxLength(20000, { message: '피드백 내용이 너무 길어요.' })
  content: string;

  // 만족도 등 1~5 (선택)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
