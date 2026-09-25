import {
  createProject,
  getClientProjects,
  getAllProjects,
  getProjectById,
  updateProject,
} from "./project.service.js";

import {
  success,
  created,
} from "../../utils/response.js";

export async function createProjectController(
  req,
  res,
  next
) {
  try {
    const project = await createProject({
      req,
      ...req.body,
    });

    return created(
      res,
      { project },
      "Project created successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getClientProjectsController(
  req,
  res,
  next
) {
  try {
    const projects =
      await getClientProjects(req);

    return success(
      res,
      { projects },
      "Projects retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getAllProjectsController(
  req,
  res,
  next
) {
  try {
    const projects =
      await getAllProjects(req);

    return success(
      res,
      { projects },
      "Projects retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function getProjectByIdController(
  req,
  res,
  next
) {
  try {
    const project =
      await getProjectById({
        req,
        projectId:
          req.params.projectId,
      });

    return success(
      res,
      { project },
      "Project retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

export async function updateProjectController(
  req,
  res,
  next
) {
  try {
    const project =
      await updateProject({
        req,
        projectId:
          req.params.projectId,
        ...req.body,
      });

    return success(
      res,
      { project },
      "Project updated successfully."
    );
  } catch (error) {
    next(error);
  }
}