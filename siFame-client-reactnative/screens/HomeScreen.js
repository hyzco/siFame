import React, {useCallback, useState, useRef} from 'react';
import { Image, Platform, StyleSheet, View, FlatList,Text,  ImageBackground, KeyboardAvoidingView } from 'react-native';
import { MonoText } from '../components/StyledText';
import * as ImagePicker from 'expo-image-picker';
import { ListItem } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale'; 
import { LinearGradient } from 'expo-linear-gradient';
import Toast from "../components/Toast";
import Logo from "../components/Logo";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import {theme} from "../library/theme";
import {uploadImageAsync,postReqAI} from '../library/functions/fileUpload';
import * as MediaLibrary from 'expo-media-library';

import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

export default function HomeScreen({ navigation, route }) {
  const { mail,name,surname } = route.params.user;
//mail eklenecek !,
  const user = {
    name: name.value,
    surname: surname.value,
    age: 0,
    nationality: "null",
  }

  const colors =[{
     color: '#9900EF',
     color1:'#2196F3'
    },{
      color: '#FCB900',
      color1:'#00D084'
     },{
      color: '#9900EF',
      color1:'#EB144C'
     },{
      color: '#0693E3',
      color1:'#7BDCB5'
     },{
      color: '#00D084',
      color1:'#9900EF'
     },
  ]

  const [state, setState] = useState({
            isStartProcessButton : false,
            userData:{
              userImage: null,
              gender: null,
            },
            listRefresh : false,
    });

   const [listArr, setListArr] =  useState([]);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [loadingUpload, setLoadingUpload] = useState(false);
   const [loadingGetValue, setLoadingGetValue] = useState(false);
   const [preview, setPreview] = useState(null);
   const [processFinish, setProcessFinish] = useState(false);
 
   const full = useRef();

      const onCapture = useCallback(() => {
        full.current.capture().
        then((uri) =>{ 
          setPreview({ uri })
          openShareDialogAsync(uri);
          MediaLibrary.saveToLibraryAsync(uri);
        });
      }, []);

      let keyExtractor = (item, index) => index.toString()
   
      let renderItem = ({ item }) => (
        <ListItem
              style={styles.item}
              Component={TouchableScale}
              friction={90} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.95} //
              linearGradientProps={{
                colors: item.color,
                start: [1, 0],
                end: [0.2, 0],
              }}
              ViewComponent={LinearGradient} // Only if no expo
              leftAvatar={{ rounded: true, source: { uri: item.avatar_url } }}
              title={item.name}
              titleStyle={{ color: 'white', fontWeight: 'bold',fontSize:14 }}
              subtitleStyle={{ color: 'white',fontSize: 10}}
              subtitle={item.description}
              chevron={{ color: 'white' }}
              badge={{ value: "%"+Math.round(((1-item.distance).toFixed(2)*100)), textStyle: { color: 'black', fontWeight: 'bold' } ,
               badgeStyle:{ backgroundColor: "white",borderColor: "black",borderWidth:1} }}
            
            />
      )

      let openShareDialogAsync = async (uri) => {
        if (!(await Sharing.isAvailableAsync())) {
          alert(`Uh oh, sharing isn't available on your platform`);
          return;
        }
    
        Sharing.shareAsync(uri);
      };

      let openImagePickerAsync = async (userParam) =>{
                      let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

                      if (permissionResult.granted === false) {
                        alert("Permission to access camera roll is required!");
                        return;
                      }

                      let pickerResult = await ImagePicker.launchImageLibraryAsync();
                      if(pickerResult.cancelled === false){
                        setLoadingUpload(true);
                          let result = await uploadImageAsync(pickerResult,userParam).then((response) => {
                            if(response.success) {
                            setSuccess("We found some nice face ! :) Click contiune for results !")
                            setLoadingUpload(false);
                            setLoadingGetValue(false);
                            setListArr([]);
                            setProcessFinish(false);
                                setState({
                                    isStartProcessButton:true,
                                    userData:{
                                      userImage : response.user.image,
                                      gender: response.user.gender,
                                    },
                                    listRefresh:true,
                                })
                                return response;
                            }else{
                              setLoadingUpload(false);
                              setState({
                                isStartProcessButton: false,
                              })
                              setProcessFinish(false);
                              setError(response.message);
                            }
                        }).catch(error =>{
                            setError("We had a little problem. :(  Please try again.")
                            setLoadingUpload(false);
                        })
                      }else{
                        setListArr([]);
                          if(state.isStartProcessButton){
                            setState({isStartProcessButton:false,
                            listRefresh:true});
                          }
                          setProcessFinish(false);
                      }
              }

      let startProcess = async (param) =>{
            if(state.listRefresh){
               setState({
                 isStartProcessButton:true,
                  listRefresh:false,
                })
                setListArr([]);
                setLoadingGetValue(true);
            }
          const fameResults = await postReqAI(param);
          const tmpArr = [];
            if(fameResults !== undefined){
              var newArr = fameResults.slice(1);
              try{
                newArr.map((value,i)=>{
                  console.log(value);
                      tmpArr.push({
                        id: value.id,
                        name: (value.info.name+" "+value.info.surname),
                        avatar_url: 'http://185.184.24.14/getDataFamePic/'+value.info.image,
                        subtitle: 'Vice President',
                        color:[colors[i].color, colors[i].color1],
                        distance: value.distance,
                        description: value.info.description,
                        nationality: value.info.nationality,
                    })
                    setListArr(tmpArr);
                })  
                   setState({
                      listRefresh:true,
                    })
                  }catch(err){
                      setError("We have a problem, please try again.");
                      setLoadingGetValue(false);
                  }finally{
                      setSuccess("Here is your results, enjoy :)")
                      setState({
                        isStartProcessButton:false,
                       })
                       setProcessFinish(true);
                  }
            }
       
    }        

      return (
        
        <ImageBackground
        source={require("../assets/background_dot.png")}
        resizeMode="repeat"
        style={styles.background}
      >
        
        <KeyboardAvoidingView style={styles.container} behavior="padding">
       <Logo> </Logo>  
       
       {processFinish  ? null : 
        <Paragraph>
           SiFame Test Face Recog with Fame People. v.0.5.0
        </Paragraph>
        }

        <Button
        loading={loadingUpload}
        style={{backgroundColor: theme.colors.primary }}
        mode="contained"
        onPress={()=>{openImagePickerAsync(user)}}
        style={styles.button}
      >
        {processFinish? "Try Agaın" : "Upload Selfıe"}

      </Button>
      {state.isStartProcessButton &&
        <Button
         style={{backgroundColor: theme.colors.primary }}
        loading={loadingGetValue}
        mode="contained"
        onPress={()=>{startProcess(state.userData)}}
        style={styles.button}
      >
        See Results
      </Button>
    }

   <Image
              fadeDuration={0}
              resizeMode="contain"
              style={{width:0,height:0}}
              source={preview}
            />

 <ViewShot ref={full} style={styles.containerContent} options={{quality:1}}>
        {processFinish &&  <MonoText>{name.value+" "+surname.value} look like 🌟</MonoText> } 
                <FlatList
                style={{width: '80%'}}
                showsHorizontalScrollIndicator={false}
                  keyExtractor={keyExtractor}
                  data={listArr}
                  refreshing={state.listRefresh}
                  extraData={listArr}
                  renderItem={renderItem}
                />
              {processFinish &&  <MonoText>#siFame - sifame.com ❤️</MonoText> }
  </ViewShot>
     
  {processFinish &&
            <Button
            style={{backgroundColor: theme.colors.primary }}
            loading={false}
            mode="contained"
            onPress={()=>{onCapture()}}
            style={styles.button}
          >
              Save Image
          </Button>
}   
      <Toast message={success} type={"success"} onDismiss={() => setSuccess("")} />
      <Toast message={error} type={"error"} onDismiss={() => setError("")} />
      </KeyboardAvoidingView>
  </ImageBackground>
  
      );
    }


HomeScreen.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
   // maxWidth: 340,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  containerContent: {
    alignItems: "center",
    backgroundColor: 'white',
    width:"100%",
  },
  item: {
    alignItems:"center",
    marginVertical: 4,  
  },
  label: {
    color: theme.colors.secondary
  },
  button: {
    maxWidth: 250,
    marginTop: 24,
    backgroundColor: theme.colors.primary,
  },
  row: {
    flexDirection: "row",
    marginTop: 4
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary
  },
  textInfo:{
        flex:0.2,
        fontSize: 8,
        lineHeight: 12,
        color: theme.colors.secondary,
        textAlign: "center",
        marginTop:15,
        marginBottom:1
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});
