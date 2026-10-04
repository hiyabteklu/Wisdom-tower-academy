/**
 * Bulletproof structural navigation parent mapping and history utilities.
 * Every deep path parents up one level only (strip last segment).
 * Home ("/") is the parent ONLY at the true top of site sections.
 */

export const ROOT = "/";

/** Explicit immediate one-level parents for known hub and section roots */
export const PARENT_OF: Record<string, string> = {
  // Top-level sections (parent is Home)
  "/academy": ROOT,
  "/account": ROOT,
  "/about": ROOT,
  "/contact": ROOT,
  "/privacy": ROOT,
  "/terms": ROOT,
  "/login": ROOT,
  "/signup": ROOT,

  // Commerce & learning (parent is Academy or Cart, never /)
  "/learning": "/academy",
  "/packages": "/academy",
  "/cart": "/packages",
  "/checkout": "/cart",

  // Admin & user sub-hubs (parent is Account, never /)
  "/admin": "/account",
  "/settings": "/account",
  "/notifications": "/account",
  "/orders": "/account",

  // Academy primary curriculum branches (parent is Academy)
  "/academy/grades": "/academy",
  "/academy/freshman": "/academy",
  "/academy/uat": "/academy",
  "/academy/gat": "/academy",
  "/academy/coc": "/academy",
  "/academy/exit-exam": "/academy",
  "/academy/remedial": "/academy",
  "/academy/special-packages": "/academy",

  // Academy guidance and free resources
  "/academy/universities": "/academy",
  "/academy/departments": "/academy",
  "/academy/campus-life": "/academy",
  "/academy/study-techniques": "/academy",
  "/academy/scholarships": "/academy",
  "/academy/success-stories": "/academy",
  "/academy/quiz-demo": "/academy",
  "/academy/faq": "/academy",
  "/academy/leaderboard": "/academy",
  "/academy/tower-climb": "/academy",

  // Games
  "/games/tower-climb": "/academy",
  "/games/tower-defense": "/academy/exit-exam",

  // Auth sub-flows
  "/forgot-password": "/login",
  "/reset-password": "/login",
  "/signin": "/login",
  "/register": "/signup",
};

export function normalizePath(pathname: string): string {
  if (!pathname) return ROOT;
  let p = pathname.split("?")[0].split("#")[0];
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || ROOT;
}

/**
 * Computes the parent path in the site hierarchy for the current URL.
 * Every deep path goes up exactly one level (strip last segment).
 * Never jumps straight to Home unless already at a true top-level section.
 */
export function structuralParent(pathname: string, explicitFallback?: string): string {
  if (explicitFallback) {
    const normFallback = normalizePath(explicitFallback);
    const normPath = normalizePath(pathname);
    if (normFallback !== normPath) {
      return normFallback;
    }
  }

  const path = normalizePath(pathname);
  if (path === ROOT) return ROOT;

  // 1. Direct match in PARENT_OF table
  if (PARENT_OF[path]) {
    return PARENT_OF[path];
  }

  // 2. Admin subroutes: strip last segment, always ending at /admin, never /
  if (path === "/admin") {
    return "/account";
  }
  if (path.startsWith("/admin/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    const parent = "/" + parts.join("/");
    return parent || "/admin";
  }

  // 3. Learning subroutes: strip last segment, always ending at /learning, never /
  if (path === "/learning") {
    return "/academy";
  }
  if (path.startsWith("/learning/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    const parent = "/" + parts.join("/");
    return parent || "/learning";
  }

  // 4. Checkout subroutes (e.g. /checkout/[id], /checkout/multi) -> /cart
  if (path.startsWith("/checkout/")) {
    return "/cart";
  }

  // 5. Account subroutes: strip last segment, ending at /account
  if (path.startsWith("/settings/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? "/" + parts.join("/") : "/account";
  }
  if (path.startsWith("/notifications/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? "/" + parts.join("/") : "/account";
  }
  if (path.startsWith("/orders/")) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? "/" + parts.join("/") : "/account";
  }

  // 6. Generic deep path: strip last segment to go exactly one level up
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) {
    // Top-level 1-segment route not explicitly matched: default to Home
    return ROOT;
  }

  parts.pop();
  const parent = "/" + parts.join("/");
  return parent;
}

export function parentLabel(parentPath: string): string {
  const labels: Record<string, string> = {
    "/": "Home",
    "/academy": "Academy",
    "/packages": "Packages",
    "/learning": "My Learning",
    "/account": "Account",
    "/admin": "Admin Hub",
    "/settings": "Settings",
    "/notifications": "Notifications",
    "/orders": "Orders",
    "/cart": "Cart",
    "/academy/grades": "Grades",
    "/academy/freshman": "Freshman",
    "/academy/uat": "UAT",
    "/academy/gat": "GAT",
    "/academy/coc": "COC",
    "/academy/exit-exam": "Exit Exam",
    "/academy/remedial": "Remedial",
    "/academy/special-packages": "Special Packages",
    "/academy/universities": "Universities",
    "/academy/departments": "Departments",
    "/academy/campus-life": "Campus Life",
    "/academy/study-techniques": "Study Techniques",
    "/academy/scholarships": "Scholarships",
    "/academy/success-stories": "Success Stories",
  };
  if (labels[parentPath]) return labels[parentPath];
  if (parentPath.startsWith("/academy/grades/")) return "Grade";
  if (parentPath.startsWith("/academy/freshman/")) return "Subject";
  if (parentPath.startsWith("/academy/remedial/")) return "Subject";
  if (parentPath.startsWith("/academy/special-packages/")) return "Course";
  if (parentPath.startsWith("/admin/")) return "Admin";
  if (parentPath.startsWith("/learning/")) return "Learning";
  return "Back";
}

/**
 * Records route navigation in sessionStorage to track whether the previous
 * page visited within the session matches the structural parent.
 */
export function recordNavigation(pathname: string): void {
  if (typeof window === "undefined") return;
  try {
    const norm = normalizePath(pathname);
    const curr = sessionStorage.getItem("wta_nav_curr");
    if (curr && curr !== norm) {
      sessionStorage.setItem("wta_nav_prev", curr);
    }
    sessionStorage.setItem("wta_nav_curr", norm);
  } catch {
    /* ignore session errors */
  }
}

/**
 * Checks if browser history can be safely used to go back:
 * Only returns true if the previous entry in navigation history matches the
 * structural parent, avoiding jumping straight to Home on deep entries.
 */
export function canPreferHistory(targetParent: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.history.length <= 1) return false;

    const normTarget = normalizePath(targetParent);
    const prev = sessionStorage.getItem("wta_nav_prev");
    if (prev) {
      const normPrev = normalizePath(prev);
      return normPrev === normTarget;
    }

    if (document.referrer) {
      const url = new URL(document.referrer, window.location.origin);
      if (url.origin === window.location.origin) {
        return normalizePath(url.pathname) === normTarget;
      }
    }

    return false;
  } catch {
    return false;
  }
}
