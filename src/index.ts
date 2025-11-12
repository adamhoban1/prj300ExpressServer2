import express, {Application, Request, Response} from "express" ;//test
import morgan from "morgan";
import userRoutes from "./routes/users";//import user routes
import dotenv from "dotenv";
import { initDb } from "./database";
import { authenticateKey } from "./middleware/auth.middleware";

dotenv.config();

const PORT = process.env.PORT || 3001;
initDb();

const app: Application = express();

app.use(morgan("dev"));
app.use(express.json());
app.use("/api/v1/users", userRoutes );//api base path
//app.use("/api/v1/users", userRoutes );//middleware authenciate version 
app.use(authenticateKey);
app.get("/ping", async (_req : Request, res: Response) => {//for Project 300 testing purposes
    res.json({
        message: "Test for express server is successful",
    });
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
