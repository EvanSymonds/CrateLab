//Setting up debugging channels
const dbDebugger = require("debug")("app:db");
const fsDebugger = require("debug")("app:fs");

//Configuration
const config = require("config");


//Pool allows express to communicate with PostgreSQL database
const Pool = require("pg").Pool;
const pool = new Pool({
  user: config.get("database.user"),
  host: config.get("database.host"),
  database: config.get("database.database"),
  password: config.get("database.db_password"),
  port: config.get("database.port"),
});

//fs and fsExtra allow express to work with the temporary file and directory
const fsExtra = require('fs-extra');
const fs = require('fs');

const getFiles = () => {
  //Gets all files from the files table
  
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM files ORDER BY file_id ASC", async(error, results) => {
      if (error) {
        dbDebugger("Error: ", error);
        reject(error)
      } else {
        dbDebugger("Files retrieved");
      }
      
      var file;
      var files = [];
  
      for(i = 0; i < results.rows.length; i++){
        file = results.rows[i];
  
        await getFileData(file).then((data) => {
          files.push({
            file,
            data
          });
        })
  
      }
      resolve(files)
    })
  })
}

const getFileInfoByProject = (project_id) => {
  //Gets all files from the files table
  
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM files WHERE project_id = $1", [project_id], (error, results) => {
      if (error) {
        dbDebugger("Error: ", error);
        reject(error)
      } else {
        dbDebugger("Files retrieved");
        resolve(results)
      }
    })
  })
}

const getFileById = (file_id) => {
  //Gets a single file from the files table

  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM files WHERE file_id = $1", [file_id], (error, results) => {
      if (error) {
        dbDebugger("Error: ", error);
        reject(error)
      } else {
        dbDebugger("File retrieved");
      }

      var file = results.rows;

      pool.query("SELECT lo_get($1)", [file[0].file_data_id], async (error, results) => {
        if (error){
          dbDebugger("Error: ", error);
          reject(error)
        } else {
          dbDebugger("File data retrieved");
        }
        dbDebugger(results)
        const data = (results.rows[0].lo_get);

        const path = "./Temp_storage/" + file[0].file_name 
        fs.writeFile(path, data, () => {
          resolve({
            file,
            data,
            path
          })
        })
      })
    })
  })
}

const storeFile = async (data, file_name, project_id, path) => {
  //Stores a file in the files table

  return new Promise( async (resolve, reject) => {

      file_type = file_name.split(".");
      file_type = file_type[file_type.length - 1].toLowerCase();

      pool.query("INSERT INTO files (file_data_id, file_type, file_name, project_id) VALUES (lo_from_bytea(0, $1), $2, $3, $4)", [data, file_type, file_name, project_id], (error, results) => {
        if (error) {
          dbDebugger("Error: ", error);
          reject(error)
        } else{
          dbDebugger("File uploaded to database")
          //fsExtra.emptyDir("./Temp_storage", () => {
            resolve(results)
          //});
        }
      })
  })
}

const deleteFile = (file_id) => {
  //Deletes a file from the files table

  return new Promise((resolve, reject) => {

    pool.query("DELETE FROM files WHERE file_id = $1", [file_id], (error, results) => {
      if (error) {
        dbDebugger("Error: ", error);
        reject(error)
      } else{
        dbDebugger("File deleted");
        resolve(results)
      }
    })
  })
}


function getFileData(file){
  //Gets just the data of a single file

  return new Promise((resolve, reject) => {
    pool.query("SELECT lo_get($1)", [file.file_data_id], (error, fileData) => {
      if (error){
        reject(error);
      }
      resolve(fileData.rows[0].lo_get);
    })
  })
}

module.exports = {
  getFiles,
  getFileById,
  getFileInfoByProject,
  storeFile,
  deleteFile
}