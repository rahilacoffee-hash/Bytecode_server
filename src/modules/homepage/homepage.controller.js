import prisma from "../../config/prisma.js";
import { success } from "../../utils/response.js";

const HOMEPAGE_ID = "homepage";

export async function getHomepageController(req, res, next) {
  try {
    const page = await prisma.homePageContent.findUnique({
      where: { id: HOMEPAGE_ID },
      select: { content: true, updatedAt: true },
    });

    return success(res, { content: page?.content ?? null, updatedAt: page?.updatedAt ?? null });
  } catch (error) {
    next(error);
  }
}

export async function updateHomepageController(req, res, next) {
  try {
    const page = await prisma.homePageContent.upsert({
      where: { id: HOMEPAGE_ID },
      create: { id: HOMEPAGE_ID, content: req.body.content },
      update: { content: req.body.content },
      select: { content: true, updatedAt: true },
    });

    return success(res, page, "Homepage content saved successfully.");
  } catch (error) {
    next(error);
  }
}
