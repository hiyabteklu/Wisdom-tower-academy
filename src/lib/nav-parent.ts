/**
 * Site structure parents — Back always goes up the tree, never browser history.
 */

const ROOT = "/";

/** Explicit one-level parents for known list/hub routes */
const PARENT_OF: Record<string, string> = {
  "/academy": "/",
  "/packages": "/",
  "/learning": "/",
  "/login": "/",
  "/signup": "/",
  "/about": "/",
  "/contact": "/",
  "/cart": "/packages",
  "/checkout": "/cart",
  "/academy/grades": "/academy",
  "/academy/freshman": "/academy",
  "/academy/uat": "/academy",
  "/academy/gat": "/academy",
  "/academy/coc": "/academy",
  "/academy/exit-exam": "/academy",
  "/academy/remedial": "/academy",
  "/academy/special-packages": "/academy",
  "/academy/universities": "/academy",
  "/academy/departments": "/academy",
  "/academy/campus-life": "/academy",
  "/academy/study-techniques": "/academy",
  "/academy/scholarships": "/academy",
  "/academy/success-stories": "/academy",
  "/academy/quiz-demo": "/academy",
};

function normalizePath(pathname: string): string {
  if (!pathname) return ROOT;
  let p = pathname.split("?")[0].split("#")[0];
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || ROOT;
}

/**
 * Parent path in the site hierarchy for the current URL.
 * Prefer stripping the last segment; use PARENT_OF for known hubs.
 */
export function structuralParent(pathname: string, explicitFallback?: string): string {
  if (explicitFallback) return normalizePath(explicitFallback);

  const path = normalizePath(pathname);
  if (path === ROOT) return ROOT;

  if (PARENT_OF[path]) return PARENT_OF[path];

  // /checkout/[id] → /cart
  if (path.startsWith("/checkout/")) return "/cart";

  // /academy/special-packages/[slug]/[sem]/[course]/[resource] → strip last
  // /academy/grades/[id]/[resource] → /academy/grades/[id]
  // Generic: drop last segment
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return ROOT;
  parts.pop();
  const parent = "/" + parts.join("/");
  return PARENT_OF[parent] ? parent : parent || ROOT;
}

export function parentLabel(parentPath: string): string {
  const labels: Record<string, string> = {
    "/": "Home",
    "/academy": "Academy",
    "/packages": "Packages",
    "/learning": "My Learning",
    "/cart": "Cart",
    "/academy/grades": "Grades",
    "/academy/freshman": "Freshman",
    "/academy/uat": "UAT",
    "/academy/gat": "GAT",
    "/academy/coc": "COC",
    "/academy/exit-exam": "Exit Exam",
    "/academy/special-packages": "Special packages",
  };
  if (labels[parentPath]) return labels[parentPath];
  if (parentPath.startsWith("/academy/grades/")) return "Grade";
  if (parentPath.startsWith("/academy/freshman/")) return "Subject";
  if (parentPath.startsWith("/academy/special-packages/")) return "Package";
  return "Back";
}
