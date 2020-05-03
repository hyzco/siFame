import http from 'http';
import path from 'path';
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cluster from 'cluster';
import faceRecog from './faceRecog/app.js';
import * as imageCompressor from './faceRecog/library/imageCompressor.hyzcode';
import { arrayScheme } from './faceRecog/library/jsonScheme.hyzcode';
import * as DB from './faceRecog/library/mongoDB.hyzcode';
import {data} from './dataxxx1.js';
import sharp from 'sharp';
import multer from 'multer';

var storageProfile = multer.diskStorage({
    filename: (req, file, cb) => {
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'profile-' + new Date().toISOString() + '.' + filetype);
    },
    limits: {
    fieldSize: 3 * 1024 * 1024,
  },
});

var uploadProfile = multer({storage: storageProfile});


const url = require('url');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()); //need to parse HTTP request body
//app.use('/uploads',express.static('uploads'));
app.use('/getDataFamePic',express.static(__dirname + '/faceRecog/library/Hasan'));

let workers = [];



function calculateMostN(data,size){
	data.sort((a,b) => (a.distances > b.distances) ? 1 : ((b.distances > a.distances) ? -1 : 0));
	var items = data.slice(0, size).map((value,i) => ({
			id: value.id,
			distance : value.distances,
			info: value.info,
	}))
		return items;
}

async function getDataFromDB(gender,condition){
	let responseImage = null;
	
	if(condition.random){
		responseImage = await DB.GetDataRandom({gender: gender},{gender:1,image:1},{size:condition.size});	
	}else{
		responseImage = await DB.GetData({type:"gender image", gender: gender },condition);
	}
	
		//const countResponse = await DB.CountCollection();
		const response = {
			responseImage : responseImage,
			//countResponse : countResponse,	
		};
	
		return response;
}

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
const setupWorkerProcesses = () => {
    // to read number of cores on system
    let numCores = require('os').cpus().length;
    console.log('Master cluster setting up ' + numCores + ' workers');

    // iterate on number of cores need to be utilized by an application
    // current example will utilize all of them
    for(let i = 0; i < numCores; i++) {
        // creating workers and pushing reference in an array
        // these references can be used to receive messages from workers
        workers.push(cluster.fork());

        // to receive messages from worker process
        workers[i].on('message', function(message) {
            console.log(message);
        });
    }

    // process is clustered on a core and process id is assigned
    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is listening');
    });

    // if any of the worker process dies then start a new one by simply forking another one
    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
        workers.push(cluster.fork());
        // to receive messages from worker process
        workers[workers.length-1].on('message', function(message) {
            console.log(message);
        });
    });
};


/**
 * Setup server either with clustering or without it
 * @param isClusterRequired
 * @constructor
 */
const setupServer = (isClusterRequired) => {

    // if it is a master process then call setting up worker process
    if(isClusterRequired && cluster.isMaster) {
        setupWorkerProcesses();
    } else {
        // to setup server configurations and share port address for incoming requests
        setUpExpress();
    }
};


const setUpExpress = () => {
    // create server
    app.server = http.createServer(app);

    // logger
    app.use(morgan('tiny'));

    // parse application/json
    app.use(bodyParser.json({
        limit: '2000kb',
    }));
	app.disable('x-powered-by');
	
	
	app.get('/',function(req,res){
		res.send("hey");
	});

	app.get('/insertData', function(req,res){
		DB.InsertData(data);
		res.end("TEST");
	});
	
	app.get("/cdnSiFame", (req, res) => {
		var pathForCdn = null;		
		if(req.query.fame == 'true'){
					pathForCdn = path.join(__dirname, "/faceRecog/library/Hasan/"+req.query.image);
						if(fs.existsSync(pathForCdn)){
							res.sendFile(pathForCdn);
						}else{
							res.status(404).send("404");
						}
				}else if(req.query.fame == 'false'){
					pathForCdn = path.join(__dirname, "/uploads/userPic/"+req.query.image);
						if(fs.existsSync(pathForCdn)){
							res.sendFile(pathForCdn);
						}else{
							res.status(404).send("404");
						}
				}else{
					res.status(400).send("400");
				}
	});

	app.get('/compressImg', function(req,res){
		var requestURL = url.parse(req.url, true);
		/**
		 * Search exist?
		 *  @return processReq
		 */
		if (requestURL.search == "") return res.end('Nodejs Image API, by HYzCode');

		return imageCompressor.processReq(requestURL.query, res);
	});
	
			app.post('/uploadPicture', uploadProfile.single("photoTest"), (req, res) => {
				console.log(req.file);
				const file = req.file;
				const user = req.body;
				var data ={}
				if(file) {
					var fileName = '512x512-'+file.filename+'.jpg';
						sharp(file.path).resize(512,512).toFile('./uploads/userPic/'+fileName, async function(err){
							if(err){
								res.status(400).json({
									success: false,
									message: "Retrieved data is not success",
								});
								res.end();
							}
							else{
								const checkIfFace = await faceRecog.checkIfFace(fileName);
								let gender = null;
									if(checkIfFace){
										if(checkIfFace.gender == "male"){
											gender = "Male";
										}else if(checkIfFace.gender == "female"){
											gender = "Female";
										} 
										data = {
											name : user.name,
											surname: user.surname,
											image: fileName,
											age: user.age,
											nationality: user.nationality,
											gender: gender,
										};
	
										DB.InsertData(data,true);
	
										res.status(200).json({
											success: true,
											message: "Retrieved data success",
											user: {
												image:data.image,
												gender:data.gender,
											},
										});
				
										res.end();
									}else{
										res.status(400).json({
											success: false,
											message: "Sorry, we could not find any face.",
										});
										res.end();
									}
		
							}
					})
				}
				else throw 'error';
			});

		app.post('/faceRecog/start', async function(req,res){
			//const result = await faceRecog.faceRecog(userImage,fameImage);
			/*var ua = req.headers['user-agent'];
			var raw = req.rawHeaders;
			var userIp = req.connection.remoteAddress
			const json =  {
				userIP: {userIp},
				info: {raw},
				userAgent: {ua},
				outputJson: {result},	
			}
			const json2 =  {
				userIP: {userIp},
				info: {raw},
				userAgent: {ua},	
			}*/

			/*const stringifyArray = fastJson(arrayScheme);
			//console.log(json2);
			res.set("Content-type", "application/json; charset=utf-8")
			.send(stringifyArray(result));
			res.end();*/
			const condition = {
				ok : true,
				image: req.body.image,
				gender: req.body.gender,
			}
			const getUserData = await getDataFromDB(condition.gender,condition);
			const getFameData = await getDataFromDB(condition.gender,{ok:false,random:true,size:40});
			const resultFaceRecog = await faceRecog.faceRecog(getUserData,getFameData)
			const result = calculateMostN(resultFaceRecog,6);
			

			res.status(200).json({
				success: true,
				message: "Retrieved data success",
				result,
			});

			res.end();
		});

			// start server
			app.server.listen('8080', () => {
				console.log(`Started server on => http://localhost:${app.server.address().port} for Process Id ${process.pid}`);
			});

			// in case of an error
			app.on('error', (appErr, appCtx) => {
				console.error('app error', appErr.stack);
				console.error('on url', appCtx.req.url);
				console.error('with headers', appCtx.req.headers);
			});
};


setupServer(true);

/*
var server = app.listen(8080, function () {

   var host = server.address().address;
   var port = server.address().port;

   console.log(`LoveSvan API Frankfurt-1 running  at ${host}:${port}`);
});*/
