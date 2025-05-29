export interface NewUser {
  name: string;
  username: string;
  email: string;
  password: string;
  children?: Child[];
}

export interface Child {
  id?: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  children?: Child[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiError {
  status: number;
  message: {
    message: string;
  };
}
