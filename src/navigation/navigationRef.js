import { CommonActions } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function getRootNavigation(navigation) {
  if (!navigation) return null;
  let root = navigation;
  while (root?.getParent?.()) {
    root = root.getParent();
  }
  return root;
}

export function resetToScreen(navigation, routeName, params) {
  const route = params ? { name: routeName, params } : { name: routeName };

  const root = getRootNavigation(navigation);
  if (root?.dispatch) {
    root.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [route],
      })
    );
    return;
  }

  resetRoot([route]);
}

export function navigateRoot(name, params) {
  const attempt = (retriesLeft) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
      return;
    }
    if (retriesLeft > 0) {
      setTimeout(() => attempt(retriesLeft - 1), 100);
    }
  };
  attempt(15);
}

export function resetRoot(routes) {
  const attempt = (retriesLeft) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: routes.length - 1,
          routes,
        })
      );
      return;
    }
    if (retriesLeft > 0) {
      setTimeout(() => attempt(retriesLeft - 1), 100);
    }
  };
  attempt(15);
}
