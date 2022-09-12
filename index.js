import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import bcrypt from 'bcrypt';
import dayjs from "dayjs";

dotenv.config();
const server = express();

server.use(cors());
server.use(express.json());

const signinSchema = joi.object({
  email: joi.string().min(1).required(),
  password: joi.string().min(1).required(),
});

const signupSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().min(1).required(),
  password: joi.string().min(1).required(),
  confirm: joi.string().ref(password).required(),
});

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db("mywallet");
});

server.post("/", async (req, res) => {
  const user = req.body;
    
  const validation = signinSchema.validate(user, {
    abortEarly: false,
  });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }
    
  try {
    const userExists = await db
    .collection("users")
    .findOne({ email: user.email });
    
    if (!userExists || !bcrypt.compareSync(user.password, userExists.password)) {
      res.status(404).send("Nenhum usuário encontrado!");
      return;
    }
    
    res.send(201);
  }
  catch (error) {
    res.status(500).send(error.message);
  }
});

server.post("/signup", async (req, res) => {
  const user = req.body;
  
  const validation = signupSchema.validate(user, {
    abortEarly: false,
  });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    res.status(422).send(errors);
    return;
  }
  
  try {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    const userExists = await db
    .collection("users")
    .findOne({ name: user.name, email: user.email, password: passwordHash });
  
    if (userExists) {
      res.send(409).send("Esse usuário já existe!");;
      return;
    }
  
    await db.collection("users").insertOne({
      name: user.name,
      email: user.email,
      password: passwordHash,
    });
  
    res.send(201);
  } 
  catch (error) {
    res.status(500).send(error.message);
  }
});

server.listen(5000, () => console.log(`App running in port: 5000`));