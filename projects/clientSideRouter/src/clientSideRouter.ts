declare const global: any;

global.window = {
  history: {
    pushState: () => {},
    back: () => {},
    forward: () => {},
  },
};

// route: /orders/:orderId/items/:itemId
// route to match : /orders/100/items/2
type Params = Record<string, string>;
type RouteNode = {
  children: Map<string, RouteNode>;
  paramChild?: RouteNode;
  paramName?: string;
  component?: Function;
};
export class TrieRouter {
  private root: RouteNode = { children: new Map() };
  notFound: null | (() => unknown) = null;

  navigate(path: string) {
    const value = this.match(path);
    if (value) {
      const { params, component } = value;
      component?.(params);
      window.history.pushState(path, "", path);
    } else this.notFound?.();
  }

  setNotFound(cb: () => unknown) {
    this.notFound = cb;
  }

  navigateBack() {
    window.history.back();
  }
  navigateFront() {
    window.history.forward();
  }

  addRoute(path: string, component: Function) {
    const segments = path.split("/").filter(Boolean);
    let node = this.root;

    for (const segment of segments) {
      if (segment.startsWith(":")) {
        if (!node.paramChild) {
          node.paramChild = { children: new Map() };
          node.paramChild.paramName = segment.slice(1);
        }
        node = node.paramChild;
      } else {
        if (!node.children.has(segment)) {
          node.children.set(segment, { children: new Map() });
        }
        node = node.children.get(segment)!;
      }
    }

    node.component = component;
  }

  match(path: string) {
    const segments = path.split("/").filter(Boolean);
    let node = this.root;
    const params: Params = {};

    for (const segment of segments) {
      if (node.children.has(segment)) {
        node = node.children.get(segment)!;
      } else if (node.paramChild) {
        params[node.paramChild.paramName!] = segment;
        node = node.paramChild;
      } else {
        return null;
      }
    }

    if (!node.component) return null;

    return {
      component: node.component,
      params,
    };
  }
}
