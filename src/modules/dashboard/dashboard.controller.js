import {
  getDashboardStats,
  getRecentConversations,
  getRecentProjects,
  getRecentQuotes,
} from "./dashboard.service.js";

import { success } from "../../utils/response.js";

/*
|--------------------------------------------------------------------------
| Get dashboard overview
|--------------------------------------------------------------------------
*/

export async function getDashboardController(
  req,
  res,
  next
) {
  try {
    const [
      stats,
      recentConversations,
      recentProjects,
      recentQuotes,
    ] = await Promise.all([
      getDashboardStats(req),
      getRecentConversations(req),
      getRecentProjects(req),
      getRecentQuotes(req),
    ]);

    return success(
      res,
      {
        stats,
        recentConversations,
        recentProjects,
        recentQuotes,
      },
      "Dashboard data retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}