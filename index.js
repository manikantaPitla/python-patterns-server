const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");

app.use(express.json());

const dbPath = path.join(__dirname, "patterns.db");

let db = null;

const corsOptions = {
  origin: "*",
  methods: "GET,POST",
};
app.use(cors(corsOptions));

async function initializeDbAndServer() {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    const corsOptions = {
      origin: "*",
      methods: "GET,POST",
    };
    app.use(cors(corsOptions));

    app.listen(4000, () => {
      console.log("Server Started Running");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
}
initializeDbAndServer();

app.get("/", async (request, response) => {
  try {
    const getAllPatternsSquery = `
    SELECT * FROM patterns`;

    const data = await db.all(getAllPatternsSquery);
    response.status(200).json({ success: true, data });
  } catch (error) {
    response.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/postcode", async (request, response) => {
  try {
    const {
      id,
      code_type,
      code_description,
      code_hint,
      code_input,
      code_output,
      code,
    } = request.body;

    const postPatternsQuery = `
    INSERT INTO patterns (id, code_type, code_description, code_hint, code_input, code_output, code)
    VALUES ('${id}','${code_type}', '${code_description}', '${code_hint}', '${code_input}', '${code_output}', '${code}');
    `;

    await db.run(postPatternsQuery);
    response
      .status(201)
      .json({ success: true, message: "Submitted Successfully" });
  } catch (error) {
    response.status(500).json({ error: "An error occurred while Submitting" });
  }
});
