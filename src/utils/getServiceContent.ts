export default (requestUrl: string = "") => {
  return `
import { request } from '@@plugin-request';
import { DynamicRoutes } from './typing';
  
export async function getRoutes() {
   const routes = await request('${requestUrl}', {
     method: 'GET',
   });
  
   return routes;
}

  `;
};
