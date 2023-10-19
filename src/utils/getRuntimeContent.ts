export default () => {
  return `
  import React from 'react';
  import icons from './icons';
  import { createElement } from "react";
  
  function formatIcon(name: string) {
    return name
      .replace(name[0], name[0].toUpperCase())
      .replace(/-(w)/g, function(all, letter) {
        return letter.toUpperCase();
      });
  }
  
  export function patchRoutes({ routes, routeComponents }) {
    const parsedRoutes = parseRoutes(newRoutes, routes);

    Object.assign(routes, parsedRoutes.routes);
    Object.assign(routeComponents, parsedRoutes.routeComponents);

    Object.keys(routes).forEach(key => {
      const { icon } = routes[key];
      if (icon && typeof icon === 'string') {
        const upperIcon = formatIcon(icon);
        if (icons[upperIcon] || icons[upperIcon + 'Outlined']) {
          routes[key].icon = React.createElement(icons[upperIcon] || icons[upperIcon + 'Outlined']);
        }
      }
    });
  }
  
  `;
};
