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
const photo_user_location = path.resolve(__dirname, '../uploads/userPic');


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
  try{
    await faceDetectionNet.loadFromDisk(weight_location);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(weight_location);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(weight_location); 
  }catch(err){
    return "Weights could not loaded successfully.";
  }finally{
    return "Weights loaded successfully.";
  }
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
    // load the imagea
    const img = await canvas.loadImage(photo_user_location+"/"+image.imageUser);
    const img2 = await canvas.loadImage(photo_location+fame.fameUser);

    // detect the faces with landmarks
  //  const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
   //     .withFaceLandmarks()
  //  const results2 = await faceapi.detectAllFaces(img2, faceDetectionOptions)
   //     .withFaceLandmarks()   

    const result = await faceapi.detectSingleFace(img, faceDetectionOptions).
        withFaceLandmarks().
        withFaceDescriptor();
    const result2 = await faceapi.detectSingleFace(img2, faceDetectionOptions).
        withFaceLandmarks().
        withFaceDescriptor();

console.log(result2.descriptor);
    // create a new canvas and draw the detection and landmarks
 //   const out = faceapi.createCanvasFromMedia(img)
 const result3 = faceapi.euclideanDistance(result.descriptor,result2.descriptor);
 console.log(result3);
 
/*
   const result2 = faceapi.euclideanDistance([result.descriptor,result.descriptor],[result.descriptor,result.descriptor]);
console.log(result.descriptor);
    faceapi.draw.drawDetections(out, results.map(res => res.detection))
    faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks),
     { drawLines: true, color: 'red' })
    // save the new canvas as image
    saveFile('faceLandmarkDetection'+rand+'.jpg', out.toBuffer('image/jpeg'))
    console.log('done, saved results to out/faceLandmarkDetection'+rand+'.jpg')
*/
  }

async function checkIfFace(image){
  await loadWeights();
  const img = await canvas.loadImage(photo_user_location+"/"+image);
  const result = await faceapi.detectSingleFace(img, faceDetectionOptions).
  withFaceLandmarks().
  withFaceDescriptor();
    if(result === undefined){
        return false;
    }else{
      return true;
    }
}


function random(low, high) {
  return Math.random() * (high - low) + low
}

async function computeDescriptor(image){
      const result = await image.map(async (value,i) =>({
                      id: image[i].id,
                      descriptor: await faceapi.detectSingleFace(image[i].image,faceDetectionOptions).withFaceLandmarks().withFaceDescriptor(),
                      gender: image[i].gender,
                      info: value.fameInfo,
      }))
      return await Promise.all(result);
}

async function computeDistance(descriptor){
        const result = await descriptor.map(async (value, i) => ({ 
            id: value.id,
            distances: descriptor[0].descriptor === undefined ? 0 : faceapi.euclideanDistance(descriptor[0].descriptor.descriptor,descriptor[i].descriptor.descriptor),               
            gender: value.gender,
            info: value.info,
        }))  
   return await Promise.all(result);
}

async function canvasLoadImg(imageDB){
  const canvasImgArr = [];  
  canvasImgArr.push({id: imageDB.userImage.responseImage._id, 
                    image: await canvas.loadImage(photo_user_location+"/"+imageDB.userImage.responseImage.image),
                    gender: imageDB.userImage.responseImage.gender,  
                  });
                  
  imageDB.imageFame.map(async (value)=>{
      canvasImgArr.push({
        id: value._id,
        image: await canvas.loadImage(photo_location+value.image),
        gender: value.gender,
        fameInfo:{
            name: value.name,
            surname: value.surname,
            age: value.age,
            nationality: value.nationality,
            description: value.description,
        }
      })
  })
  return canvasImgArr;
}

async function faceRecog(userImage, imageFame){

 /* let userIndex = imageDB.findIndex(value => (value.description === "User" || value.fame === false));
    console.log(imageDB[userIndex].name,imageDB[userIndex].surname);*/
    
    const imageDB = {
      userImage : userImage,
      imageFame: imageFame.responseImage,
      //countResponse : imageFame.countResponse,
    }

    const resLoadWeights = await loadWeights();
    console.log('\x1b[42m\x1b[37m%s\x1b[0m', resLoadWeights); 

    const canvasImage =  await canvasLoadImg(imageDB);
    const descriptor =   await computeDescriptor(canvasImage);
    const distances = await computeDistance(descriptor);
   /*run({
      imageUser : imageDB.userImage.responseImage.image,
    },{
      fameUser: imageDB.imageFame[1].image,
    });*/

       return distances;
  }

module.exports ={
    faceRecog,
    checkIfFace,
}