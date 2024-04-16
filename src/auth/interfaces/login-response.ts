import { User } from "../entities/user.entity";

export interface LoginReponse{
    user:User;
    token:string;
}