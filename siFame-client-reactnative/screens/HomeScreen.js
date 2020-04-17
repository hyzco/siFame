import React, {useState  } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MonoText } from '../components/StyledText';
import * as ImagePicker from 'expo-image-picker';
import { ListItem } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale'; 
import { LinearGradient } from 'expo-linear-gradient';
import Toast from "../components/Toast";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import {theme} from "../library/theme";
import {uploadImageAsync,postReqAI} from '../library/functions/fileUpload';


export default function HomeScreen({ navigation, route }) {
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
              badge={{ value: "%"+(1-item.distance).toFixed(2), textStyle: { color: 'black', fontWeight: 'bold' } ,
               badgeStyle:{ backgroundColor: "white",borderColor: "black",borderWidth:1} }}
            
            />
      )

      const user = {
        name: "Hasan Ali",
        surname: "Yüzgeç",
        age: 21,
        nationality: "Turkish",
        gender: "Male"
      }

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
                              setError(response.message);
                            }
                        }).catch(error =>{
                        })
                      }else{
                        setListArr([]);
                          if(state.isStartProcessButton){
                            setState({isStartProcessButton:false,
                            listRefresh:true});
                          }
                         
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
                newArr.map((value)=>{
                      tmpArr.push({
                        id: value.id,
                        name: (value.info.name+" "+value.info.surname),
                        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                        subtitle: 'Vice President',
                        color:['#FF9800', '#F44336'],
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
                  }
            }
       
    }        

      return (
        <Background>
        <Logo />  
        <Paragraph>
            SiFame Test Face Recog with Fame People. v.0.5.0
        </Paragraph>
        <Button
        loading={loadingUpload}
        style={{backgroundColor: theme.colors.primary }}
        mode="contained"
        onPress={()=>{openImagePickerAsync(user)}}
        style={styles.button}
      >
        Upload Selfıe
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

           <View style={styles.containerContent}>
                <FlatList
                showsHorizontalScrollIndicator={false}
                  keyExtractor={keyExtractor}
                  data={listArr}
                  refreshing={state.listRefresh}
                  extraData={listArr}
                  renderItem={renderItem}
                />
          </View>
      <Toast message={success} type={"success"} onDismiss={() => setSuccess("")} />
      <Toast message={error} type={"error"} onDismiss={() => setError("")} />
      </Background>

  
      );
    }


HomeScreen.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({
  containerContent: {
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
  }
 
});
