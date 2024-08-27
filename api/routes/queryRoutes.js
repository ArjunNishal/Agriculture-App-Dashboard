const router = require("express").Router();
const authenticate = require("../middlewares/auth");
const queryFctrl = require("../controllers/queryctrl");
const Mem_auth = require("../middlewares/Mem_auth");

router.post("/addquery", Mem_auth, queryFctrl.createQuery);
router.get("/allquery", authenticate, queryFctrl.getAllQueries);
router.get("/queries/fpo/:id", authenticate, queryFctrl.getQueriesByFPO);
router.post(
  "/status/query/:queryId",
  authenticate,
  queryFctrl.changeQueryStatus
);

router.get("/privacy-policy/:fpoId", authenticate, queryFctrl.getPrivacyPolicy);

router.put(
  "/privacy-policy/:fpoId",
  authenticate,
  queryFctrl.editPrivacyPolicy
);

router.get("/aboutus/:fpoId", authenticate, queryFctrl.getaboutus);

router.put("/aboutus/:fpoId", authenticate, queryFctrl.editaboutus);

module.exports = router;
