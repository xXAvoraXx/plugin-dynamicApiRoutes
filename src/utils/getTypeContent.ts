export default () => {
  return `
  import type { Outlet } from '@umijs/max';
  import type { ComponentType, LazyExoticComponent } from 'react';
  
  declare namespace DynamicRoutes {
    // 根据来自服务器的数据在前端生成路由数据
    interface Route {
      id: string;
      path: string;
      name?: string;
      component?: string;
      icon?: string;
      access?: string;
      parentId?: 'ant-design-pro-layout' | string;
      locale?: string;
      target?: string;
      navTheme?: 'dark' | 'light' | 'realDark' | undefined;
      layout?: 'side' | 'top' | 'mix';
      headerTheme?: 'dark' | 'light';
      flatMenu?: boolean;
      headerRender?: boolean;
      footerRender?: boolean;
      menuRender?: boolean;
      menuHeaderRender?: boolean;
      fixedHeader?: boolean;
      fixSiderbar?: boolean;
      hideInMenu?: boolean;
      hideChildrenInMenu?: boolean;
      hideInBreadcrumb?: boolean;
      redirect?: string;
      disabled?: boolean;
    }
  
    // 来自服务器的路由数据将是 RouteRaw[]
    interface RouteRaw extends Omit<Route, 'id' | 'parentId'> {
      key: string;
      parentKeys?: 'ant-design-pro-layout' | string[];
      routes?: RouteRaw[]
    }
  
    // React.lazy 根据来自服务器的数据延迟加载前端生成的组件或 Outlet（一级路由
    type RouteComponent = LazyExoticComponent<ComponentType<any>> | typeof Outlet;
  
    // patchRoutes 函数的参数可被分析为 { routes, routeComponents }。
    // 该类型用于 Object.assign(routes,parsedRoutes)操作，将路由数据组合在一起。
    interface ParsedRoutes {
      [key: number]: Route;
    }
  
    // 该类型用于 Object.assign(routeComponents,parsedRoutes)操作，结合路由组件
    interface ParsedRouteComponent {
      [key: number]: RouteComponent;
    }
  
    // parseRoutes 函数的返回值
    interface ParseRoutesReturnType {
      routes: DynamicRoutes.ParsedRoutes;
      routeComponents: DynamicRoutes.ParsedRouteComponent;
    }
  }
  
  `;
};
