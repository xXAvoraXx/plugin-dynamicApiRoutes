import type { IApi } from "umi";

const DIR_NAME = "plugin-dynamicApiRoutes";

export default (api: IApi) => {
  api.logger.info("Use dynamic-api-routes plugin.");

  api.describe({
    key: "dynamicApiRoutes",
    config: {
      schema(joi) {
        return joi.object({
          requestUrl: joi.string(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  const { dynamicApiRoutes } = api.userConfig;
  if (!dynamicApiRoutes) {
    api.logger.warn(
      "Please configure dynamicApiRoutes, otherwise plugin-dynamic-api-routes will not work."
    );
    return;
  }

  const { requestUrl = "" } = api.userConfig?.dynamicApiRoutes || {};

  if (!requestUrl) {
    api.logger.warn(
      "Please configure dynamicApiRoutes.requestUrl, otherwise plugin-dynamic-api-routes will not work."
    );
    return;
  }
};
