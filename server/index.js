
import app from "./src/app.js";
import { config } from "./src/config.js";

const PORT = config.port || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
