import React, { memo } from "react";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import Paragraph from "../../components/Paragraph";
import {theme} from "../../library/theme";

const HomeScreen = ({ navigation }) => (
  <Background>
    <Logo />
    <Header>siFame</Header>

    <Paragraph>
      Welcome to the siFame, do you want to have some fun here ?
    </Paragraph>
    <Paragraph>
    See how similar you are with world wide famous people and with your best friend !   
   </Paragraph>

    <Button mode="contained" style={{backgroundColor: theme.colors.primary }}onPress={() => navigation.navigate("registerScreen")}>
      Start
    </Button>
  </Background>
);

export default memo(HomeScreen);