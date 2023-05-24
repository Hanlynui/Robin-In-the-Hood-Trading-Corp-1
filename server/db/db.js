const Sequelize = require("sequelize");
const pkg = require("../../package.json");

const databaseName =
  pkg.name + (process.env.NODE_ENV === "test" ? "-test" : "");

const config = {
  logging: false,
};

if (process.env.LOGGING === "true") {
  delete config.logging;
}

//https://stackoverflow.com/questions/61254851/heroku-postgres-sequelize-no-pg-hba-conf-entry-for-host
// if (process.env.DATABASE_URL) {
//   config.dialectOptions = {
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   };
// }

const db = new Sequelize(
  `postgresql://Hanlynui:v2_44fB7_SCAWCRAh4cGPrjQmR2AvDXr@db.bit.io:5432/Hanlynui/robin-in-the-hood`,
  config
);
module.exports = db;
