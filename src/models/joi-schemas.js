import Joi from "joi";


export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().example("secret").required(),
  })
  .label("UserCredentials");

export const UserSpec = UserCredentialsSpec.keys({
  firstName: Joi.string().example("Homer").required(),
  lastName: Joi.string().example("Simpson").required(),
  _id: IdSpec.optional(), 
  __v: Joi.any().optional(),
}).label("UserDetails");

export const UserSpecPlus = UserSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("UserDetailsPlus");

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");

/**
 * LocalSpot Schemas
 */

// Das hier wird für den PAYLOAD (POST/PUT) genutzt
export const LocalSpotSpec = Joi.object()
  .keys({
    title: Joi.string().example("Harbour Cafe").required(),
    description: Joi.string().example("A cozy cafe by the docks").required().allow("").optional(),
    latitude: Joi.number().example(52.1234).required(),
    longitude: Joi.number().example(13.5678).required(),
    userid: IdSpec.optional(),    // Erlaubt userid, falls der Test sie mitschickt
    categoryid: IdSpec.optional(), // Vorbereitung für Level 2
  })
  .unknown(true) // DAS HIER fixiert den "_id is not allowed" Fehler im Payload
  .label("LocalSpot");

// Das hier wird für die RESPONSE (Antwort vom Server) genutzt
export const LocalSpotSpecPlus = LocalSpotSpec.keys({
  _id: IdSpec,
  __v: Joi.any().optional(),
}).label("LocalSpotDetails");

export const LocalSpotArray = Joi.array().items(LocalSpotSpecPlus).label("LocalSpotArray");

export const JwtAuthSpec = Joi.object()
  .keys({
    success: Joi.boolean().example(true).required(),
    token: Joi.string().example("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...").required(),
  })
  .label("JwtAuth");