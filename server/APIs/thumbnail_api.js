//Setting up debugging channels
const dbDebugger = require("debug")("app:db");
const fsDebugger = require("debug")("app:fs");

//Configuration
const config = require("config");


//Pool allows express to communicate with PostgreSQL database
const Pool = require("pg").Pool;
const pool = new Pool({
  max: config.get("database.connection_limit"),
  user: config.get("database.user"),
  host: config.get("database.host"),
  database: config.get("database.database"),
  password: config.get("database.db_password"),
  port: config.get("database.port"),
});
pool.on('error', (error) => {
  console.error('Unexpected error on idle client', error);
  process.exit(-1);
});
pool.on('connect', (client) => {
	console.log(`Nb of clients in pool : total = ${pool.totalCount} idle = ${pool.idleCount} active = ${pool.activeCount}`);
});

//fs and fsExtra allow express to work with the temporary file and directory
const fsExtra = require('fs-extra');
const fs = require('fs');

const getThumbnailByProject = (project_id) => {

  return new Promise(async(resolve, reject) => {
    const connection = await pool.connect();

    connection.query("SELECT * FROM thumbnails WHERE project_id = $1", [project_id])
      .then((results) => {
        dbDebugger("Thumbnail retrieved");

        var thumbnail = results.rows;

        if (thumbnail.length === 0) {
          reject("No thumbnail")
        } else {
          connection.query("SELECT lo_get($1)", [thumbnail[0].thumbnail_data_id])
            .then((results) => {
              const data = (results.rows[0].lo_get);
    
              const path = "./Temp_storage/" + thumbnail[0].project_id
              fs.writeFile(path, data, () => {
                connection.release()
                resolve({
                  thumbnail,
                  data,
                  path
                })
              })
            })
            .catch((error) => {
              dbDebugger("Error: ", error);
              reject(error)
            })
        }
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error)
      })
  })
}

const storeThumbnail = async (data, project_id) => {

  return new Promise( async (resolve, reject) => {
    const connection = await pool.connect();

      connection.query("INSERT INTO thumbnails (thumbnail_data_id, project_id) VALUES (lo_from_bytea(0, $1), $2)", [data, project_id])
        .then((results) => {
          dbDebugger("Thumbnail uploaded to database")
          connection.release()
          resolve(results)
        })
        .catch((error) => {
          dbDebugger("Error: ", error);
          reject(error)
        })
  })
}

const deleteThumbnail = async(project_id) => {

  return new Promise( async (resolve, reject) => {
    const connection = await pool.connect();

    connection.query("DELETE FROM thumbnails WHERE project_id = $1", [project_id])
      .then((results) => {
        dbDebugger("Thumbnail deleted")
        connection.release()
        resolve(results)
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error)
      })
  })
}

module.exports = {
  getThumbnailByProject,
  storeThumbnail,
  deleteThumbnail
}