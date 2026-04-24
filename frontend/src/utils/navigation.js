export function readRoute() {
  return window.location.hash.replace(/^#/, "") || "/signin";
}

export function navigate(nextRoute) {
  if (window.location.hash !== `#${nextRoute}`) {
    window.location.hash = nextRoute;
  }
}
