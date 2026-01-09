import { Request, ResponseToolkit } from "@hapi/hapi";

export function validationError(request: Request, h: ResponseToolkit, error: any) {
  console.log(error.message);
  return error;
}