import React, { Component } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MonoText } from '../components/StyledText';
import * as ImagePicker from 'expo-image-picker';

import {uploadImageAsync,postReqAI} from '../library/functions/fileUpload';

export default class HomeScreen extends Component {
      state = {
        isStartProcessButton : false,
        userData:{
          userImage: null,
          gender: null,
        }
      }   
  render() {
  
     
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
                      let result = await uploadImageAsync(pickerResult,userParam).then((response) => {
                          if(response.success) {
                              this.setState({
                                  isStartProcessButton:true,
                                  userData:{
                                    userImage : response.user.image,
                                    gender: response.user.gender,
                                  }
                              })
                              return response;
                          }
                      })
              }

    let startProcess = async (param) =>{
          await postReqAI(param)
    }        

      return (
        <View style={styles.container}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.welcomeContainer}>
              <Image
                source={
                  __DEV__
                    ? require('../assets/images/robot-dev.png')
                    : require('../assets/images/robot-prod.png')
                }
                style={styles.welcomeImage}
              />
            </View>

            <View style={styles.getStartedContainer}>
              <Text style={styles.getStartedText}>SiFame Test Face Recog with Fame people.</Text>

              <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
                <MonoText>Test v0.0.1</MonoText>
              </View>

              <TouchableOpacity onPress={()=>{openImagePickerAsync(user)}} style={styles.button}>
                  <Text style={styles.buttonText}>Pick a photo</Text>
              </TouchableOpacity>
              {this.state.isStartProcessButton &&
                <TouchableOpacity onPress={()=>{startProcess(this.state.userData)}} style={styles.button}>
                    <Text style={styles.buttonText}>Start Process</Text>
              </TouchableOpacity>
              }
          
            </View>

          </ScrollView>
        </View>
      );
    }
}

HomeScreen.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
