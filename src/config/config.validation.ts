import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  GEMINI_API_KEY: Joi.string().required().error(new Error('GEMINI_API_KEY is required')),
});
