async function uploadImageAsync(imgParam, userParam) {
    const {name,surname,age,gender,nationality} = userParam;
    let apiUrl = 'http://185.184.24.14/uploadPicture';
    let uri = imgParam.uri;
    let uriParts = imgParam.uri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    let formData = new FormData();

    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('nationality', nationality);
    formData.append('photoTest', {
      uri,
      name: "hasan",
      type: `${imgParam.type}/${fileType}`,
    });
    
    let options = {
      method: 'POST',
      body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
      },
    };
     return await fetch(apiUrl,options)
        .then(response => response.json())
        .then(response => {
            return response;
        });
        
  }

  async function postReqAI(param){
      console.log(param);
    let apiUrl = 'http://185.184.24.14/faceRecog/Start';
    let options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: param.userImage,
            gender: param.gender,
          }),
      };
       return await fetch(apiUrl,options)
          .then(response => response.json())
          .then(response => {
              return response.result;
          });
          
  }

  module.exports =  {
    uploadImageAsync,
    postReqAI,
  }