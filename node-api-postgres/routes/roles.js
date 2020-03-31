const express = require("express");
const router = express.Router();
const roles_api = require("../APIs/role_api");
const Joi = require("joi");

//Setting up debugging channels
const debug = require("debug")("app:debug");

//Configuration
const config = require("config");

router.get("/", async (request, response) => {
  await roles_api.getRoles().then((roles) => {
    response.status(200).json(roles);
  })
  .catch((error) => {
    response.status(400).json(error);
  })
})

router.get("/project/:id", async (request, response) => {
  debug(parseInt(request.params.id))

  await roles_api.getRolesByProject(parseInt(request.params.id)).then((roles) => {
    response.status(200).json(roles);
  })
  .catch((error) => {
    response.status(400).json(error);
  })
})

router.get("/user/:id", async (request, response) => {
  await roles_api.getRolesByUser(parseInt(request.params.id)).then((roles) => {
    response.status(200).json(roles);
  })
  .catch((error) => {
    response.status(400).json(error);
  })
})

router.post("/", async (request, response) => {
  const schema = {
    project_id: Joi.number.integer().max(100000000).required(),
    project_name: Joi.string().alphanum().min(3).max(25).required(),
    user_id: Joi.number.integer().max(10000000).required()
  }

  Joi.validate(request.body, schema, async (error) => {
    if (error) {
      response.status(400).json(error);
    } else {
      await roles_api.createRole(request.body.project_id, request.body.role_name, request.body.user_id).then((results) => {
        response.status(200).json(results);
      })
      .catch((error) => {
        response.status(400).json(error);
      })
    }
  })
})

router.post("/update", async (request, response) => {
  const schema = {
    project_id: Joi.number.integer().max(100000000).required(),
    project_name: Joi.string().alphanum().min(3).max(25).required(),
    user_id: Joi.number.integer().max(10000000).required(),
    new_name: Joi.string().alphanum().min(3).max(25).required()
  }

  Joi.validate(request.body, schema, async (error) => {
    if (error) {
      response.status(400).json(error);
    } else {
      await roles_api.updateRole(request.body.project_id, request.body.role_name, request.body.user_id, request.body.new_name).then((results) => {
        response.status(200).json(results);
      })
      .catch((error) => {
        response.status(400).json(error);
      })
    }
  })
})

router.delete("/delete", async (request, response) => {
  await roles_api.deleteRole(request.body.project_id, request.body.role_name, request.body.user_id).then((results) => {
    response.status(200).json(results);
  })
  .catch((error) => {
    response.status(400).json(error);
  })
})

module.exports = router;