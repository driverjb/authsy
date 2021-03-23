import Joi from 'joi';

export const vaultEntry = Joi.object({
  id: Joi.number().min(1).required(),
  passwordHash: Joi.string().required(),
  salt: Joi.string().required()
});

export default {
  vaultEntry
};
