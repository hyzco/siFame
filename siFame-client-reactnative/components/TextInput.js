import React, { memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput as Input } from "react-native-paper";
import { theme } from "../library/theme";

const TextInput = ({ errorText, ...props }) => (
  <View style={styles.container}>
    <Input
      theme={{ colors: { primary: theme.colors.primary }}}
      style={styles.input}
      selectionColor="blue"
      underlineColor="transparent"
      mode="outlined"
      {...props}
    />
    {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 12
  },
  input: {
    backgroundColor: theme.colors.surface
  },
  error: {
    fontSize: 14,
    color: theme.colors.error,
    paddingHorizontal: 4,
    paddingTop: 4
  }
});

export default memo(TextInput);
