import prisma from "../../config/prisma.js";
import { unauthorized, notFound } from "../../utils/errors.js";
import { sanitizeClient } from "../auth/auth.utils.js";

function requireClient(req) { if (!req.client?.id) throw unauthorized("Authentication required.", "CLIENT_AUTH_REQUIRED"); return req.client; }
function requireAdmin(req) { if (!req.admin?.id) throw unauthorized("Admin authentication required.", "ADMIN_AUTH_REQUIRED"); }
export async function getClientProfile(req) { const current = requireClient(req); const client = await prisma.client.findUnique({ where: { id: current.id } }); if (!client) throw unauthorized("Client account no longer exists.", "CLIENT_NOT_FOUND"); return sanitizeClient(client); }
export async function updateClientProfile({ req, name, phone, companyName }) { const current = requireClient(req); const client = await prisma.client.findUnique({ where: { id: current.id } }); if (!client) throw unauthorized("Client account no longer exists.", "CLIENT_NOT_FOUND"); return sanitizeClient(await prisma.client.update({ where: { id: current.id }, data: { ...(name !== undefined && { name: name.trim() }), ...(phone !== undefined && { phone: phone.trim() || null }), ...(companyName !== undefined && { companyName: companyName.trim() || null }) } })); }
const adminClientInclude = { _count: { select: { conversations: true, projects: true, quotes: true } }, conversations: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } } };
export async function getAllClients(req) { requireAdmin(req); return prisma.client.findMany({ include: adminClientInclude, orderBy: { updatedAt: "desc" } }); }
export async function getAdminClientById({ req, clientId }) { requireAdmin(req); const client = await prisma.client.findUnique({ where: { id: clientId }, include: { ...adminClientInclude, conversations: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } }, projects: { orderBy: { updatedAt: "desc" } }, quotes: { orderBy: { updatedAt: "desc" } } } }); if (!client) throw notFound("Client not found.", "CLIENT_NOT_FOUND"); return client; }
