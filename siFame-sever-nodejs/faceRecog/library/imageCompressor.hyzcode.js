const imagemin = require('imagemin'),
imageminJpegtran = require('imagemin-jpegtran'),
imageminPngquant = require('imagemin-pngquant'),
imageminMozjpeg = require('imagemin-mozjpeg');
const got = require('got');



async function processReq({ file, device, hd }, res) {

    if (!file) return res.end("Missing image file !");

    /**
     * Get device preset quality
     */
	var defaultHdQuality = 95;
	var deviceQuality = getDeviceQuality(device);
	var quality = null;
	if(hd){
		quality == defaultHdQuality;
	}else if(hd || quality >=50){
		quality = (defaultHdQuality/2)+(quality/2);
	}
	else{
		quality = deviceQuality;
	}

    var imageFile = await got(file, { encoding: null, timeout: 10000 })
        .catch(_ => {});

    if (!imageFile || !imageFile.body) return res.end("Couldn't load image from remote server");

   

    const compressedImage = await imagemin.buffer(imageFile.body, {
        plugins: [
            imageminMozjpeg({ quality }),
            imageminJpegtran({ progressive: true }),
            imageminPngquant({ quality: [quality/100,90/100]})
        ]
    }).catch(_=>{});

    imageFile = null;
    quality= null;

    return res.end(compressedImage || "Couldn't compress image");

}


/**
 * 
 * @param device type device rendering image to
 */
function getDeviceQuality(device) {
    var quality = 10;
    switch (device) {
        case "mobile-sm":
            quality = 5;
            break;
        case "mobile-md":
            quality = 20;
            break;
        case "tablet":
            quality = 40;
            break;
        case "computer-md":
            quality = 75;
            break;
        case "computer-xl":
            quality = 90;
            break;
        default:
            break;
    }
    return quality;
}


module.exports ={
    processReq,
}