import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  route("employer-dashboard", "routes/employer-dashboard.tsx"),
  route("student-dashboard", "routes/student-dashboard.tsx"),
  route("im-dashboard", "routes/im-dashboard.tsx"),
  route("cv/:studentId", "routes/cv-detail.tsx"),
  route("im-validation/:id", "routes/im-validation.tsx"),
] satisfies RouteConfig;
