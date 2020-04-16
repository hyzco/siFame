// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require("@babel/register")({
    presets: ["@babel/preset-env"]
  });

  require("@babel/core").transform("code", {
    plugins: ["@babel/plugin-transform-regenerator"]
  });
  require("regenerator-runtime/runtime");

  
  // Import the rest of our application.
  module.exports = require('./api.js')