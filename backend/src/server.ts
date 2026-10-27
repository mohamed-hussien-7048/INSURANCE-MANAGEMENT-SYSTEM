
import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exitCode = 1;
  }
}

void startServer();
