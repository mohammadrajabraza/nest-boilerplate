import { registerAs } from '@nestjs/config';
import { AWSConfig } from './config.type';
import validateConfig from '@/utils/validate-config';
import { IsString } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  AWS_REGION: string;

  @IsString()
  AWS_ACCESS_KEY: string;

  @IsString()
  AWS_SECRET_KEY: string;

  @IsString()
  AWS_S3_BUCKET: string;
}

export default registerAs<AWSConfig>('aws', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    region: config.AWS_REGION,
    accessKey: config.AWS_ACCESS_KEY,
    secretAccess: config.AWS_SECRET_KEY,
    s3: {
      bucketName: config.AWS_S3_BUCKET,
    },
  } as AWSConfig;
});
