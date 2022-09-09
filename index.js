import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Modelos ou Schemas

const participantSchema = joi.object({
  name: joi.string().min(1).required(),
});

const messageSchema = joi.object({
  from: joi.string().required(),
  to: joi.string().min(1).required(),
  text: joi.string().min(1).required(),
  type: joi.string().valid("message", "private_message").required(),
  time: joi.string(),
});

//Conexão com o mongodb
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db("batepapouol");
});
