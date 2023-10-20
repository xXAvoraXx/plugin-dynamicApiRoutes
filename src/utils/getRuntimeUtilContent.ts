export default () => {
  return `
    import LazyLoadable from './LazyLoadable';
    import { isNaN, isNumber } from 'lodash';
    import { lazy } from 'react';
    import type { DynamicRoutes } from './typing';
    import { Outlet } from '@umijs/max';
    
    function generateComponentPath(inputPath: string): string {
      // 删除开头的"./"。
      let newPath = inputPath.replace('./', '');
    
      // 在末尾添加"/index
      newPath = newPath + '/index';
    
      return newPath;
    }
    
    function findLastRouteIndex(obj: any): number {
      let maxNumberKey = 0;
    
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const keyString = key.toString();
          const keyNumber = parseInt(keyString);
          if (isNaN(keyNumber) === false && isNumber(keyNumber)) {
            if (maxNumberKey === null || keyNumber > maxNumberKey) {
              maxNumberKey = keyNumber;
            }
          }
        }
      }
    
      return maxNumberKey;
    }
    
    export function parseRoutes(
      routesRaw: DynamicRoutes.RouteRaw[],
      currentRoutes: DynamicRoutes.RouteRaw[],
    ): DynamicRoutes.ParseRoutesReturnType {
      const routes: DynamicRoutes.ParsedRoutes = {}; // 已转换的路由信息
      const routeComponents: DynamicRoutes.ParsedRouteComponent = {}; // 生成 React.lazy 组件
      const routeParentMap = new Map<string, number>(); // 菜单 id 与路由数组中的索引之间的映射。例如：'role_management' -> 7
    
      let currentIndex = findLastRouteIndex(currentRoutes) + 1; // 我们可以把进入 patchRoutes 的路由看作一个数组，这里就是数组中项的索引。
    
      routesRaw.forEach((route) => {
        let effectiveRoute = true; // 当前正在处理的路由是否有效？
    
        const replaceRoute = Object.entries(currentRoutes).find((x) => x[1].key === route.key);
        const tempRoute = { ...route };
    
        if (tempRoute.routes) {
          delete tempRoute.routes;
        }
    
        if (replaceRoute) {
          // 如果替换路由状态可用。
          const replaceRouteIndex = replaceRoute[0];
          const replaceRouteMap: DynamicRoutes.Route = {
            ...route,
            id: replaceRouteIndex,
          };
          // 存储路由信息
          routes[parseInt(replaceRouteIndex)] = replaceRouteMap;
        } else {
          // 创建并存储已存在的组件。
          if (route.component) {
            const componentPath = generateComponentPath(route.component);
            // 创建组件
            const tempComponent = LazyLoadable(lazy(() => import(\`@/pages/$\{componentPath}\`)));
            // 存储组件
            routeComponents[currentIndex] = tempComponent;
          } // 如果路由没有自己的页面。
          else {
            // 路由没有自己的页面，这里创建了一个 Outlet 来显示子路的页面
            const tempComponent = Outlet;
            // temp Outlet.
            routeComponents[currentIndex] = tempComponent;
          }
    
          if (route.parentKeys === undefined || (route.parentKeys && route.parentKeys.length === 0)) {
            // 加工项目一级路线
            // 创建路线信息
            const mainRouteMap: DynamicRoutes.Route = {
              ...tempRoute,
              id: currentIndex.toString(),
              parentId: 'ant-design-pro-layout',
            };
            // 存储路线信息
            routes[currentIndex] = mainRouteMap;
    
            // 映射菜单 ID 和当前项目的索引
            routeParentMap.set(route.key!, currentIndex);
    
            if (route.routes && route.routes.length > 0) {
              const mergeRoutes = { ...currentRoutes };
              Object.assign(mergeRoutes, { [currentIndex]: mainRouteMap });
              const { routes: childRoutes, routeComponents: childComponents } = parseRoutes(
                route.routes,
                mergeRoutes,
              );
    
              if (
                childRoutes &&
                Object.keys(childRoutes).length > 0 &&
                childComponents &&
                Object.keys(childComponents).length > 0
              ) {
                const childRoutesLength = Object.keys(childRoutes).length;
                const childComponentsLength = Object.keys(childComponents).length;
    
                if (childRoutesLength === childComponentsLength) {
                  Object.assign(routes, childRoutes);
                  Object.assign(routeComponents, childComponents);
                  currentIndex += childRoutesLength;
                }
              }
            }
          } // 直接出现的路由记录（不包括子路由）？ 例如：/home; /Dashboard
          else if (route.parentKeys && route.parentKeys.length > 0) {
            // 不是一级路由
            // 获取实际的顶级路由 ID
    
            const parentKeys = route.parentKeys[0];
    
            const routeParentMapKey = routeParentMap.get(parentKeys);
            const currentRoutesParentKey = Object.entries(currentRoutes).find(
              (x) => x[1].key === parentKeys,
            );
    
            if (
              routeParentMapKey ||
              (currentRoutesParentKey !== undefined && currentRoutesParentKey.length > 0)
            ) {
              const routeMap: DynamicRoutes.Route = {
                ...tempRoute,
                id: currentIndex.toString(),
                parentId: (routeParentMapKey || currentRoutesParentKey![0]).toString(),
              };
              // 存储路由信息
              routes[currentIndex] = routeMap;
            } else {
              // 未找到顶级路由，路由无效，currentIdx 未递增
              effectiveRoute = false;
            }
          }
    
          if (effectiveRoute) {
            // 如果路由有效，则将 currentIdx 增 1
            currentIndex += 1;
          }
        }
      });
    
      return {
        routes,
        routeComponents,
      };
    }  
    
    `;
};
