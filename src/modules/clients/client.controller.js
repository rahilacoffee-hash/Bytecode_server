import { getClientProfile, updateClientProfile, getAllClients, getAdminClientById } from "./client.service.js";
import { success } from "../../utils/response.js";
export async function getClientProfileController(req,res,next) { try { return success(res,{ client: await getClientProfile(req) },"Client profile retrieved successfully."); } catch (error) { next(error); } }
export async function updateClientProfileController(req,res,next) { try { return success(res,{ client: await updateClientProfile({ req,...req.body }) },"Client profile updated successfully."); } catch (error) { next(error); } }
export async function getAllClientsController(req,res,next) { try { return success(res,{ clients: await getAllClients(req) },"Clients retrieved successfully."); } catch (error) { next(error); } }
export async function getAdminClientByIdController(req,res,next) { try { return success(res,{ client: await getAdminClientById({ req, clientId: req.params.clientId }) },"Client retrieved successfully."); } catch (error) { next(error); } }
