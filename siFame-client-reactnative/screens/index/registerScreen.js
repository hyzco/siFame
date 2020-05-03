import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import BackButton from "../../components/BackButton";
import Paragraph from "../../components/Paragraph";
import { RadioButton } from 'react-native-paper';
import {
    emailValidator,
    nameValidator
  } from "../../library/utils";
import { theme } from "../../library/theme";
import Toast from "../../components/Toast";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState({ value: "", error: "" });
  const [surname, setSurname] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const _onSignUpPressed = async () => {
    if (loading){
        setLoading(false);
    }
    setLoading(true);

    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);

    if (emailError || nameError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setError("Please be careful :P");
            setTimeout(()=>{
                setLoading(false);
            },400)
      return;
    }else{
        setSuccess("Great !");
        const user = {
            name: name,
            surname: surname,
            mail: email,
        }    
    
        setTimeout(()=>{
                navigation.navigate('Root', {
                  screen: 'Home',
                  params: {user:user},
                });
        },1000)
    }

   
   /* if (response.error) {
      setError(response.error);
    }*/

  };

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate("welcomeScreen")} />

      <Logo />

      <Header>Who you are ?</Header>
        <Paragraph>
            We don't want too much information don't worry ! :)
        </Paragraph>
      <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={text => setName({ value: text, error: "" })}
        error={!!name.error}
        errorText={name.error}
      />

       <TextInput
        label="Surname"
        returnKeyType="next"
        value={surname.value}
        onChangeText={text => setSurname({ value: text, error: "" })}
        error={!!surname.error}
        errorText={surname.error}
      />

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <Button
        loading={loading}
        mode="contained"
        onPress={_onSignUpPressed}
        style={styles.button}
      >
        Come In
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Hey buddy! Try AI version for </Text>
        <TouchableOpacity onPress={() => alert("Soon")}>
          <Text style={styles.link}>Instagram</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.textInfo}>This informations will use for training AI (aritifical intelligence).
      You do not exactly register to the app. This informations just for one time use.</Text>

      <Toast message={success} type={"success"} onDismiss={() => setSuccess("")} />
      <Toast message={error} type={"error"} onDismiss={() => setError("")} />
    </Background>
  );
};

const styles = StyleSheet.create({
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

export default memo(RegisterScreen);