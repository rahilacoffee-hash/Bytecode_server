import {
  registerClient,
  requestClientRecovery,
  verifyClientRecovery,
  getCurrentClient,
  updateClientProfile,
  logoutClient,
  getClientSessionInfo,

  registerAdmin,
  verifyAdminRegistration,
  loginAdmin,
  getCurrentAdmin,
  getAdminSessionInfo,
  logoutAdmin,
} from "./auth.service.js";

import {
  success,
  created,
} from "../../utils/response.js";

/*
|--------------------------------------------------------------------------
| CLIENT CONTROLLERS
|--------------------------------------------------------------------------
*/

/**
 * POST /api/v1/auth/client/register
 */
export async function registerClientController(req, res, next) {
  try {
    const result = await registerClient({
      ...req.body,
      res,
    });

    return created(
      res,
      result,
      "Client account created successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/v1/auth/client/recovery/request
 */
export async function requestClientRecoveryController(
  req,
  res,
  next
) {
  try {
    const result = await requestClientRecovery({
      email: req.body.email,
    });

    return success(
      res,
      result,
      result.message
    );
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/v1/auth/client/recovery/verify
 */
export async function verifyClientRecoveryController(
  req,
  res,
  next
) {
  try {
    const result = await verifyClientRecovery({
      email: req.body.email,
      otp: req.body.otp,
      res,
    });

    return success(
      res,
      result,
      "Client recovery verified successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/v1/auth/client/me
 */
export async function getCurrentClientController(
  req,
  res,
  next
) {
  try {
    const client = await getCurrentClient(req);

    return success(
      res,
      { client },
      "Current client retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/v1/auth/client/session
 */
export async function getClientSessionController(
  req,
  res,
  next
) {
  try {
    const result = await getClientSessionInfo(req);

    return success(
      res,
      result,
      "Client session retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * PATCH /api/v1/auth/client/me
 */
export async function updateClientProfileController(
  req,
  res,
  next
) {
  try {
    const client = await updateClientProfile({
      req,
      ...req.body,
    });

    return success(
      res,
      { client },
      "Client profile updated successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/v1/auth/client/logout
 */
export async function logoutClientController(
  req,
  res,
  next
) {
  try {
    const result = await logoutClient({
      req,
      res,
    });

    return success(
      res,
      null,
      result.message
    );
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| ADMIN CONTROLLERS
|--------------------------------------------------------------------------
*/

/**
 * POST /api/v1/auth/admin/register
 */
export async function registerAdminController(
  req,
  res,
  next
) {
  try {
    const result = await registerAdmin({
      ...req.body,
    });

    return created(
      res,
      result,
      "Admin account created successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/v1/auth/admin/verify-otp
 */
export async function verifyAdminRegistrationController(
  req,
  res,
  next
) {
  try {
    const result = await verifyAdminRegistration({
      email: req.body.email,
      otp: req.body.otp,
    });

    return success(
      res,
      result,
      result.message
    );
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/v1/auth/admin/login
 */
export async function loginAdminController(
  req,
  res,
  next
) {
  try {
    const result = await loginAdmin({
      email: req.body.email,
      password: req.body.password,
      res,
    });

    return success(
      res,
      result,
      "Admin logged in successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/v1/auth/admin/me
 */
export async function getCurrentAdminController(
  req,
  res,
  next
) {
  try {
    const admin = await getCurrentAdmin(req);

    return success(
      res,
      { admin },
      "Current admin retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/v1/auth/admin/session
 */
export async function getAdminSessionController(
  req,
  res,
  next
) {
  try {
    const result = await getAdminSessionInfo(req);

    return success(
      res,
      result,
      "Admin session retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}


/**
 * POST /api/v1/auth/admin/logout
 */
export async function logoutAdminController(
  req,
  res,
  next
) {
  try {
    const result = await logoutAdmin({
      req,
      res,
    });

    return success(
      res,
      null,
      result.message
    );
  } catch (error) {
    next(error);
  }
}