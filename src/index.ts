import type { IApi } from "umi";
import getServiceContent from "./utils/getServiceContent";
import getTypeContent from "./utils/getTypeContent";
import getRuntimeContent from "./utils/getRuntimeContent";
import getRuntimeUtilContent from "./utils/getRuntimeUtilContent";
import getLazyLoadableContent from "./utils/getLazyLoadableContent";

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

  api.onGenerateFiles(async () => {

    api.writeTmpFile({
      path: "LazyLoadable.tsx",
      content: getLazyLoadableContent(),
    });

    api.writeTmpFile({
      path: "util.ts",
      content: getRuntimeUtilContent(),
    });

    api.writeTmpFile({
      path: "service.ts",
      content: getServiceContent(requestUrl),
    });

    api.writeTmpFile({
      path: "typing.d.ts",
      content: getTypeContent(),
    });

    api.writeTmpFile({
      path: "runtime.tsx",
      content: getRuntimeContent(),
    });

  });
};
