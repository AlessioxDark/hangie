const supabase = require("../config/db");
const authMiddleware = async (req, res, next) => {
  console.log("cia");
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      error: { message: "Token di autorizzazione mancante o malformato" },
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  const {
    data: { user },
    error: tokenError,
  } = await supabase.auth.getUser(token);
  console.log("ok 1", tokenError);
  if (tokenError) {
    return res.status(400).json({
      success: false,
      error: { message: "Token scaduto o non valido" },
    });
  }
  // Appendi l'utente alla request per poterlo usare nei model e controller
  req.user = user;

  next();
};
module.exports = { authMiddleware };
