// database.ts
import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import { User } from "./models/user"; // Import your User interface

dotenv.config();

const connectionString: string = process.env.DB_CONN_STRING || "";
const dbName: string = process.env.DB_NAME || "Web2_2025";
const client = new MongoClient(connectionString);

// Update with proper typing
export const collections: { 
    users?: Collection<User>; 
    Reports?: Collection; 
} = {}

if (connectionString == "") {
    throw new Error("No connection string in .env");
}

let db: Db;

export async function initDb(): Promise<void> {
    try {
        await client.connect();
        db = client.db(dbName);
        
        // Type the users collection properly
        const usersCollection: Collection<User> = db.collection<User>('users');
        collections.users = usersCollection;
        
        const alertCollection: Collection = db.collection('alert');
        collections.Reports = alertCollection;
        
        console.log('connected to database');
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(`issue with db connection ${error.message}`);
        } else {
            console.log(`error with ${error}`);
        }
    }
}