export default () => {
  return `
import { PageLoading } from '@ant-design/pro-components';
import { Suspense } from 'react';
  
const LazyLoadable = (Component: any) => (props: any) =>
(
    <Suspense fallback={<PageLoading />}>
        <Component {...props} />
    </Suspense>
);
  
export default LazyLoadable;    
    
    `;
};
