import {
  createQuote,
  getClientQuotes,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  decideClientQuote,
} from "./quote.service.js";

import {
  success,
  created,
} from "../../utils/response.js";

/*
|--------------------------------------------------------------------------
| Create quote
|--------------------------------------------------------------------------
*/

export async function createQuoteController(
  req,
  res,
  next
) {
  try {
    const quote = await createQuote({
      req,
      ...req.body,
    });

    return created(
      res,
      { quote },
      "Quote created successfully."
    );
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get client quotes
|--------------------------------------------------------------------------
*/

export async function getClientQuotesController(
  req,
  res,
  next
) {
  try {
    const quotes =
      await getClientQuotes(req);

    return success(
      res,
      { quotes },
      "Quotes retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get all quotes
|--------------------------------------------------------------------------
*/

export async function getAllQuotesController(
  req,
  res,
  next
) {
  try {
    const quotes =
      await getAllQuotes(req);

    return success(
      res,
      { quotes },
      "Quotes retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get quote by ID
|--------------------------------------------------------------------------
*/

export async function getQuoteByIdController(
  req,
  res,
  next
) {
  try {
    const quote = await getQuoteById({
      req,
      quoteId: req.params.quoteId,
    });

    return success(
      res,
      { quote },
      "Quote retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Update quote
|--------------------------------------------------------------------------
*/

export async function updateQuoteController(
  req,
  res,
  next
) {
  try {
    const quote = await updateQuote({
      req,
      quoteId: req.params.quoteId,
      ...req.body,
    });

    return success(
      res,
      { quote },
      "Quote updated successfully."
    );
  } catch (error) {
    next(error);
  }
}
export async function decideClientQuoteController(req, res, next) { try { const quote = await decideClientQuote({ req, quoteId: req.params.quoteId, status: req.body.status }); return success(res, { quote }, 'Quote decision saved successfully.'); } catch (error) { next(error); } }
