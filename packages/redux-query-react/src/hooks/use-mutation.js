import * as React from 'react';
import { useDispatch } from 'react-redux';
import { mutateAsync } from 'redux-query';

import useConstCallback from './use-const-callback';
import useMemoizedQueryConfig from './use-memoized-query-config';
import useQueryState from './use-query-state';

const useMutation = providedQueryConfig => {
  const reduxDispatch = useDispatch();

  const isPendingRef = React.useRef(false);

  const finishedCallback = useConstCallback(() => {
    isPendingRef.current = false;
  });

  const transformQueryConfigToAction = useConstCallback(queryConfig => {
    return {
      ...queryConfig,
      unstable_preDispatchCallback: finishedCallback,
    };
  });

  const queryConfig = useMemoizedQueryConfig(providedQueryConfig, transformQueryConfigToAction);

  const queryState = useQueryState(queryConfig);

  const mutate = React.useCallback(() => {
    const promise = reduxDispatch(mutateAsync(queryConfig));

    if (promise) {
      isPendingRef.current = true;
    }

    return promise;
  }, [reduxDispatch, queryConfig]);

  return [queryState, mutate];
};

export default useMutation;
