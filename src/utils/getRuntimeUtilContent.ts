export default () => {
  return `
    import LazyLoadable from '@/components/LazyLoadable';
    import { isNaN, isNumber } from 'lodash';
    import { lazy } from 'react';
    import type { DynamicRoutes } from './typing';
    import { Outlet } from '@umijs/max';
    
    function generateComponentPath(inputPath: string): string {
      // Başındaki './' kısmını kaldır
      let newPath = inputPath.replace('./', '');
    
      // Sonuna '/index' ekle
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
      const routes: DynamicRoutes.ParsedRoutes = {}; // Dönüştürülmüş rota bilgileri
      const routeComponents: DynamicRoutes.ParsedRouteComponent = {}; // Oluşturulan React.lazy bileşenleri
      const routeParentMap = new Map<string, number>(); // menü kimliği ile rotalar dizisindeki indeks arasındaki eşleme. Örneğin: 'role_management' -> 7
    
      let currentIndex = findLastRouteIndex(currentRoutes) + 1; // İşlenmekte olan rota öğesinin indeksi. patchRoutes'a gelen rotaları bir dizi olarak düşünebiliriz, burası dizideki öğenin dizini gibidir.
    
      routesRaw.forEach((route) => {
        let effectiveRoute = true; // Şu anda işlenmekte olan rota geçerli mi?
    
        const replaceRoute = Object.entries(currentRoutes).find((x) => x[1].key === route.key);
        const tempRoute = { ...route };
    
        if (tempRoute.routes) {
          delete tempRoute.routes;
        }
    
        if (replaceRoute) {
          // Eğer replace rota durumu varsa.
          const replaceRouteIndex = replaceRoute[0];
          const replaceRouteMap: DynamicRoutes.Route = {
            ...route,
            id: replaceRouteIndex,
          };
          // Rota bilgisini sakla
          routes[parseInt(replaceRouteIndex)] = replaceRouteMap;
        } else {
          // Eğer bileşen varsa oluştur ve sakla.
          if (route.component) {
            const componentPath = generateComponentPath(route.component);
            // Bileşeni oluştur
            const tempComponent = LazyLoadable(lazy(() => import(\`@/pages/$\{componentPath}\`)));
            // Bileşeni sakla
            routeComponents[currentIndex] = tempComponent;
          } // Eğer rotanın kendi sayfası yoksa.
          else {
            // Rotanın kendi sayfası yoktur, burada alt rotaların sayfalarını göstermek için bir Outlet oluşturulur
            const tempComponent = Outlet;
            // Outlet'i sakla
            routeComponents[currentIndex] = tempComponent;
          }
    
          if (route.parentKeys === undefined || (route.parentKeys && route.parentKeys.length === 0)) {
            // İşlenmekte olan öğe birinci seviye rota
            // Rota bilgisi oluştur
            const mainRouteMap: DynamicRoutes.Route = {
              ...tempRoute,
              id: currentIndex.toString(),
              parentId: 'ant-design-pro-layout',
            };
            // Rota bilgisini sakla
            routes[currentIndex] = mainRouteMap;
    
            // Menü kimliğini ve mevcut öğenin dizinini eşle
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
          } // Doğrudan görünen (alt rotaları içermeyen) bir rota kaydı mı? Örneğin: /home; /Dashboard
          else if (route.parentKeys && route.parentKeys.length > 0) {
            // Birinci seviye rota değil
            // Gerçek üst seviye rota kimliğini al
    
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
              // Rota bilgisini sakla
              routes[currentIndex] = routeMap;
            } else {
              // Üst seviye rota bulunamadı, rota geçersizdir, currentIdx artırılmaz
              effectiveRoute = false;
            }
          }
    
          if (effectiveRoute) {
            // Rota geçerliyse, currentIdx'i bir artır
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
