import React, { memo } from "react";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import {theme} from "../library/theme";

const LinkScreen = ({ navigation }) => (
  <Background>
    <Logo />
    <Header>siFame</Header>

    <Paragraph>
      Welcome to the siFame Instagram AI !
    </Paragraph>
    <Paragraph>
    You will be able to connect via your instagram account and see how many percent you are similar with your BFF ! :)  
   </Paragraph>

    <Button mode="contained" style={{backgroundColor: theme.colors.primary }}onPress={() => alert("I said soon :P")}>
      SOON
    </Button>
  </Background>
);

export default memo(LinkScreen);