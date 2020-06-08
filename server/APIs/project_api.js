//Setting up debugging channels
const dbDebugger = require("debug")("app:db");
const debug = require("debug")("app:debug");

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

const getProjects = () => {
  //Gets all projects

  return new Promise(async(resolve, reject) => {
    const connection = await pool.connect();

    connection.query("SELECT * FROM projects ORDER BY project_id ASC")
      .then((results) => {
        dbDebugger("Retrieved all projects");
        connection.release()
        resolve(results.rows);
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error);
      })
  })
}

const getProjectById = (project_id) => {
  //Gets a project from an ID

  return new Promise(async(resolve, reject) => {
    const connection = await pool.connect();

    connection.query("SELECT * FROM projects WHERE project_id = $1", [project_id])
      .then((results) => {
        dbDebugger("Project retrieved");
        connection.release()
        resolve(results.rows);
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error);
      })
  })
}

const createProject = (project_name, is_public) => {
  //Creates a project

  return new Promise(async(resolve, reject) => {
    const connection = await pool.connect();

    connection.query("INSERT INTO projects (project_name, is_public, created_on) VALUES ($1, $2, NOW()) RETURNING project_id", [project_name, is_public])
      .then((results) => {
        dbDebugger("Project created");
        connection.release()
        resolve(results);
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error);
      })
  })
}

const updateProject = (project_id, project_name, is_public) => {
  //Updates the project information

  return new Promise(async(resolve, reject) => {
    const connection = await pool.connect();

    connection.query("UPDATE projects SET project_name = $2, is_public = $3 WHERE project_id = $1", [project_id, project_name, is_public])
      .then((results) => {
        dbDebugger("Project updated");
        connection.release()
        resolve(results);
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error);
      })
  })
}

const deleteProject = (project_id) => {
  //Deleted a project

  return new Promise(async(resolve, reject) => {
    const connection = await pool.connect();

    connection.query("DELETE FROM projects WHERE project_id = $1", [project_id])
      .then((results) => {
        dbDebugger("Project deleted");
        connection.release()
        resolve(results);
      })
      .catch((error) => {
        dbDebugger("Error: ", error);
        reject(error);
      })
  })
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
}