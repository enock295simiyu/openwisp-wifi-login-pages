import config from "../config.json";

const statusRedirect = (req, res) => {
  const reqOrg = req.params.organization;
  const validSlug = config.some((org) => {
    return org.slug === reqOrg;
  });
  res.redirect(301, "https://google.com");
  // return 404 for invalid organization slug or org not listed in config
  if (!validSlug) {
    res.status(404).type("application/json").send({
      response_code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export default statusRedirect;
