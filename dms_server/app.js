//imports
import express from 'express';
import path from 'path';
import http from "http";
import cookieParser from 'cookie-parser';
import {
    PORT, clientPath
} from './config/keys';
import {
    mongoConnect
} from './config/mongo';
import cors from 'cors';



let app = express();
const server = http.createServer(app)

//routes
const usersRouter = require('./routes/users')();


//middlewares
app.use(cors({
    origin: [clientPath,'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));


app.use(cookieParser('cookiesecret'));
app.use(express.static(path.join(__dirname, 'public')));

mongoConnect();

//routes middlewares
app.use('/users', usersRouter);


module.exports = app;

app.get('/', (req, res) => {
    res.send('hello')
})


//server
server.listen(PORT, () => console.log(`server running on port ${PORT}`));