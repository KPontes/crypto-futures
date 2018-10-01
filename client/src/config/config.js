import config from "./config.json";

var env = process.env.NODE_ENV || "development";

if (env === "development" || env === "test") {
  var envConfig = config[env];
  console.log("config: " + env, config[env]);
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
    console.log(process.env[key] + " = " + envConfig[key]);
  });
}

// if (env === 'development') {
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoMgs';
// } else if (env === 'test'){
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoTest';
// }
