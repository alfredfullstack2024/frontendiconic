module.exports = function override(config, env) {
  config.module.rules = config.module.rules.map((rule) => {
    if (Array.isArray(rule.use)) {
      rule.use = rule.use.map((loader) => {
        if (loader.loader && loader.loader.includes("source-map-loader")) {
          loader.options = {
            ...loader.options,
            filterSourceMappingUrl: (url, resourcePath) => {
              return !resourcePath.includes("react-datepicker");
            },
          };
        }
        return loader;
      });
    }
    return rule;
  });
  return config;
};
