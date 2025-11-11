import express, {Application, Request, Response} from "express" ;//test
import morgan from "morgan";
import userRoutes from "./routes/users";//import user routes

const PORT = process.env.PORT || 3000;

const app: Application = express();

app.use(morgan("dev"));
app.use(express.json());
app.use("/users", userRoutes);//use user routes

app.get("/ping", async (_req : Request, res: Response) => {//for Project 300 testing purposes
    res.json({
        message: "Test for express server is successful",
    });
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
