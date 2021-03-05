const express = require('express');
const mongoose = require('mongoose');
const Movie = require('./models/movies');
const fs = require('fs');

const app = express();

// CONNECT TO MONGODB
const dbURI = 'mongodb+srv://node_tutorial:adminadmin@cluster-node-tuts.adxjl.mongodb.net/movie-db?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

// SET VIEW ENGINE
app.set('view engine', 'ejs');

// ROUTES
app.get('/', (req, res) => {
    console.log('index page');
    res.render('index');
});

app.get('/movies', (req, res) => {
    console.log('movies page');
    Movie.find().sort({createdAt: -1})
        .then((result) => {
            res.render('movies', {movies: result});
        })
        .catch((err) => {
            res.status(404).render('404');
        });
});

// app.get('/player', (req, res) => {
//     console.log('player page');
// })

app.get('/player/:movie_id', (req, res) => {
    console.log('movie player');
    const id = req.params.movie_id;
    
    // Movie.findById(id)
    //     .then((result) => {
    //         res.render('player', { movie: result});
    //         console.log(result._id);
    //         console.log(result.title);
    //         console.log(result.path);
    //     })
    //     .catch((err) => {
    //         res.status(404).render('404');
    //     });
    
    Movie.findById(id)
        .then((result) => {
            console.log(result);
            
            const range = req.headers.range;
            console.log(req.headers);
            if(!range){
                return res.status(400).send("Requires Range header");
            }
            
            const videoPath = result.path;
            const videoSize = fs.statSync(result.path).size;

            const CHUNK_SIZE = 10 ** 6;
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            const contentLength = end - start + 1;
            const headers = {
                "Content-Range" : `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges" : "bytes",
                "Content-Length" : contentLength,
                "Content-Type" : "video/mp4",                
            };

            res.writeHead(206, headers);

            const videoStream = fs.createReadStream(videoPath, {start, end});

            videoStream.pipe(res);
        })
        .catch((err) => {
            res.status(404).render('404');
        });
});

app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});