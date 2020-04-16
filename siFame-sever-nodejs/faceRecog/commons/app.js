require('@tensorflow/tfjs-node'); 
const faceapi = require("face-api.js")  
const canvas = require("canvas")  
const fs = require("fs")  
const path = require("path")

// mokey pathing the faceapi canvas
const { Canvas, Image, ImageData } = canvas  
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const faceDetectionNet = faceapi.nets.ssdMobilenetv1

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408  
const scoreThreshold = 0.5

// MtcnnOptions
const minFaceSize = 50  
const scaleFactor = 0.8

const weight_location = path.resolve(__dirname, './weights');
const photo_location = path.resolve(__dirname, './library/Hasan');


const imageDB = [
  {
  id: 1,
  image : "/1.jpg",
  description: "User",
  fame: false,
  name: "Hasan Ali",
  surname: "Yüzgeç",
  age: "21",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 2,
  image : "/2.jpg",
  description: "Fame",
  fame: true,
  name: "Hasan Ali",
  surname: "Yüzgeç",
  age: "21",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 3,
  image : "/3.jpg",
  description: "Fame",
  fame: true,
  name: "Hasan Ali",
  surname: "Yüzgeç",
  age: "21",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 4,
  image : "/4.jpg",
  description: "Fame",
  fame: true,
  name: "Hasan Ali",
  surname: "Yüzgeç",
  age: "21",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 5,
  image : "/5.jpg",
  description: "Fame",
  fame: true,
  name: "Armagan",
  surname: "Demirci",
  age: "23",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 6,
  image : "/6.jpg",
  description: "Fame",
  fame: true,
  name: "Ramazan",
  surname: "Acikgoz",
  age: "28",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 7,
  image : "/7.jpg",
  description: "Fame",
  fame: true,
  name: "Ramazan",
  surname: "Acikgoz",
  age: "28",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 8,
  image : "/8.jpg",
  description: "Fame",
  fame: true,
  name: "Marta Weronika",
  surname: "Acikgoz",
  age: "27",
  ethnicity: "White",
  nationality: "Polish",
  gender: "Female",
},
{
  id: 9,
  image : "/9.jpg",
  description: "Fame",
  fame: true,
  name: "Ramazan",
  surname: "Acikgoz",
  age: "28",
  ethnicity: "White",
  nationality: "Turkish",
  gender: "Male",
},
{
  id: 10,
  image : "/10.jpg",
  description: "Fame",
  fame: true,
  name: "Marta Weronika",
  surname: "Acikgoz",
  age: "27",
  ethnicity: "White",
  nationality: "Polish",
  gender: "Female",
},
{
  id: 11,
  image : "/11.jpg",
  description: "Fame",
  fame: true,
  name: "Marta Weronika",
  surname: "Acikgoz",
  age: "27",
  ethnicity: "White",
  nationality: "Polish",
  gender: "Female",
},

]



function getFaceDetectorOptions(net) {  
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
            ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
            : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

async function loadWeights(){
    await faceDetectionNet.loadFromDisk(weight_location);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(weight_location);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(weight_location); 
}

// simple utils to save files
const baseDir = path.resolve(__dirname, './out')  
function saveFile(fileName, buf) {  
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir)
    }
    // this is ok for prototyping but using sync methods
    // is bad practice in NodeJS
    fs.writeFileSync(path.resolve(baseDir, fileName), buf)
  }

async function run(image) {
    const rand = random(1,9);
    // load the image
    const img = await canvas.loadImage(photo_location+image.imageUser)
    // detect the faces with landmarks
    const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
        .withFaceLandmarks()
    // create a new canvas and draw the detection and landmarks
    const out = faceapi.createCanvasFromMedia(img)
    faceapi.draw.drawDetections(out, results.map(res => res.detection))
    faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks), { drawLines: true, color: 'red' })
    // save the new canvas as image
    saveFile('faceLandmarkDetection'+rand+'.jpg', out.toBuffer('image/jpeg'))
    console.log('done, saved results to out/faceLandmarkDetection'+rand+'.jpg')
}

function random(low, high) {
  return Math.random() * (high - low) + low
}

async function computeDistance(image){
  const result = await image.map(async (value, i) => ({ 
                    distances: faceapi.euclideanDistance(await faceapi.computeFaceDescriptor(image[0].image),
                                                    await faceapi.computeFaceDescriptor(image[i].image)),
  }))

  return await Promise.all(result);
}

async function canvasLoadImg(image){
    const canvasImgArr = [];

     await image.map(async (value,i) =>{
       canvasImgArr.push({
          id: value.id,
          image : await canvas.loadImage(photo_location+value.image),
          description: value.description,
          fame: value.fame,
          info:{
            name: value.name,
            surname: value.surname,
            age: value.age,
            ethnicity: value.ethnicity,
            nationality: value.nationality,
            gender: value.gender,
          }
       })
    });

    return canvasImgArr;
}


async function similartyOfPictures(image){
 const distancesArr = [];
        const computedDistances = await computeDistance(image);

        image.forEach(async (value, i) => {
                 distancesArr.push({
                        distanceFromID: image[0].id,
                        distanceToID: value.id,     
                        distance: (1-computedDistances[i].distances),
                        description: value.description,
                        fame: value.fame,
                        info: value.info
                  })
        })

        return distancesArr;
}

async function faceRecog(){

    await loadWeights();
   /* run({
      imageUser : "/2.jpg",
    });*/
    const canvasImage = await canvasLoadImg(imageDB);
    const distances = await similartyOfPictures(canvasImage);
        console.log(distances);
  }

module.exports ={
    faceRecog,
}