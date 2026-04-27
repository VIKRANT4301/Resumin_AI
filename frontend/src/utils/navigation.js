export function readRoute() {
  return window.location.hash.replace(/^#/, "") || "/";
}

export function navigate(nextRoute) {
  if (window.location.hash !== `#${nextRoute}`) {
    window.location.hash = nextRoute;
  }
}
