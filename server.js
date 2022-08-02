const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const morgan = require('morgan');


const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
router.use(bodyParser.json())

const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require("mongodb");


    app.use(morgan('dev'));


//path
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//ejs
app.set('view engine', 'ejs');

app.post('/Add', 
//email must be valid
body('email').isEmail(),
(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('<script>alert("Invalid Email address");window.location.href="/";</script>');
    }
   const name = req.body.name;
    const email = req.body.email;


    // if name and email are empty, return error
    if (!name || !email) {
        res.send('<script>alert("Name and Email cannot be empty!");window.location.href="/";</script>');
    }
    else {

    console.log(name, email);
    // send data to database mongodb atlas
    const url = process.env.DB_URL;
    const client = new MongoClient(url, { useNewUrlParser: true });
    const db = client.db('Emissio');
    const collection = db.collection('waitinglist');

    // check if email already exist
    collection.findOne({ email: email }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if (result) {
                // send alert in browser and redirect to home page
                res.send('<script>alert("You are already part of the waiting list");window.location.href="/";</script>');
            } else {

                // insert data to database
                collection.insertOne({ 
                    name: name,
                     email: email, 
                        date: new Date(),
                        send: true  
                }, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        // send alert in browser and redirect to home page
                        res.send('<script>alert("Successfully added to the waiting list");window.location.href="/";</script>');
                        // send email to user
                        const transporter = nodemailer.createTransport({
                            host: 'smtp.zoho.in',
                            port: 465,
                            secure: true,
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS
                            }
                        });

                    // send image to user
                        const mailOptions = {
                            from: "Emissio Waiting List <info@emissio.live>",
                            to: email,
                            subject: "We're delighted to have you on our waiting list!",
                            //sending image
                            html: `<body style="background-color: #eee; padding:10px;"><img style="display:block; width:70%; margin:0 auto; padding:25px;" src="cid:unique@kreata.ee"/ >
                                <a style="text-decoration:none; color:black; display:block; margin:0 auto; text-align:center;" href="https://emissio.live/">Copyright &copy; 2022 Emissio. All Rights Reserved.</a>
                                    </body>`,
                            attachments: [{
                                filename: 'email.jpg',
                                path: './public/images/email.jpg',
                                cid: 'unique@kreata.ee' //same cid value as in the html img src
                            }]
                        };

                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                console.log(err);
                                res.status(500).render('500'), { error: err };

                            } else {
                                console.log(info);
                            // get success.ejs
                            res.send('<script>alert("You are added to the Waiting List!");window.location.href="/";</script>');
                                res.status(200).json({
                                    message: 'User Added And Email Sent',
                                });
                            }
                        });
                    }
                }
                );
            }
        }
    }
    );
    }
}
);


                            

app.get('/', (req, res) => {
    res.render('index');
}
);

app.get('/store', (req, res) => {
    res.render('cs');
}
);

// dowload wallpaper
app.get('/download', (req, res) => {
    // to check if the browser is mobile
    if (req.headers['user-agent'].includes('Mobile')) {
        res.download('./public/Images/Metaverse Mobile Wallpaper.jpg');
    } else {
        res.download('./public/Images/Metaverse Wallpaper.png');

    }
}
);

app.use(function(req, res) {
    res.status(404);
   res.render('404', {title: '404: File Not Found'});
   });
   
   // Handle 500
   app.use(function(error, req, res, next) {
     res.status(500);
   res.render('500', {title:'500: Internal Server Error', error: error});
   });

var http = require('http')
 var port = process.env.PORT || 1337;
 if (process.env.NODE_ENV === 'production') {
    http.createServer(app).listen(port, function() {
     console.log('===============================');
     console.log('   Production Environment    ');
     console.log('         Port: ' + port         );
     console.log('===============================');
    });
  }
     else {
         app.listen(port, function() {
            console.log('===============================');
            console.log('   Developement Environment    ');
            console.log('         Port: ' + port         );
            console.log('===============================');
         });
        };
    

