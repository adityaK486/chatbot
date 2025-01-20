import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import knex from "knex";

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;
const apiKey = process.env.VITE_OPEN_AI_KEY;


const db = knex({
    client: "pg",
    connection: {
        host: process.env.PG_HOST,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        port: process.env.PG_PORT, 
        ssl: { rejectUnauthorized: false },
    },
});


db.schema.hasTable("messages").then((exists) => {
    if (!exists) {
        return db.schema.createTable("messages", (table) => {
            table.increments("id").primary();
            table.text("question");
            table.text("response");
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    }
});



const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
})


app.use(cors());
app.use(express.json()); 
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


app.post("/chatbot",async(req,res)=>{
    const {question} = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                },
                {
                    role: "user",
                    content: question,
                },
            ],
            max_tokens: 300,
        });
        const chatbotResponse = response.choices[0].message.content;
    
        await db("messages").insert({
            question,
            response: chatbotResponse,
        });
    
        res.send(chatbotResponse);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).send("Error processing the request.");
    }
    
});


app.get("/chat-history", async (req, res) => {
    try {
        const messages = await db("messages").select("*").orderBy("created_at", "desc");
        res.json(messages);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Error retrieving chat history.");
    }
});