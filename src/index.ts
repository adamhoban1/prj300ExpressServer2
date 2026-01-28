import express, {Application, Request, Response} from "express" ;//test
import morgan from "morgan";
import userRoutes from "./Routes/users";//import user routes
import alertRoutes from "./Routes/alert";//import alert routes
import dotenv from "dotenv";
import { initDb } from "./database";
import { authenticateKey } from "./middleware/auth.middleware";
import cors from "cors";
import weatherRoutes from "./Routes/weather";


dotenv.config();

const PORT = process.env.PORT || 3001;



const app: Application = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/v1/users", userRoutes );//api base path
app.use("/api/v1/alert", alertRoutes );//api base path
app.use("/api/v1/weather", weatherRoutes);

//app.use("/api/v1/users", userRoutes );//middleware authenciate version 
initDb();
app.use(authenticateKey);
app.get("/ping", async (_req : Request, res: Response) => {//for Project 300 testing purposes
    res.json({
        message: "Test for express server is successful",
    });
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
