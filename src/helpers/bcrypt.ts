import { compareSync, hashSync } from "bcryptjs";

export const hashPassword = (password: string) => hashSync(password, 10);
export const comparePassword = (password: string, hashedPassword: string) =>
  compareSync(password, hashedPassword);
