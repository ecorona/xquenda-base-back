import * as Joi from 'joi';

export const ConfigValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().required().not('root'),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  CREATE_SUPER_ADMIN: Joi.boolean().default(false),
  JWT_SECRET: Joi.string().required(),
  THROTTLER_TTL: Joi.number().default(60000),
  THROTTLER_LIMIT: Joi.number().default(10),
  CORS_ORIGIN: Joi.string().required(),
  APP_PREFIX: Joi.string().default('api'),
});
