module.exports = {
  extends: ["airbnb", "plugin:react/recommended"],
  parser: "babel-eslint",
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "react/prop-types": 0,
  },
};
