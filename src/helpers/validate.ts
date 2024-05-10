import Joi from 'joi';

export const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
  userName: Joi.string().required(),
});
