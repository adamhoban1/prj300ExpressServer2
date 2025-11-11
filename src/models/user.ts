import { ObjectId } from "mongodb";

export interface User {
    id?: ObjectId;
    name: string;
    phonenumber: string;
    email: string;

}
