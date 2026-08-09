export const requireRole = (allowedRoles) => {
   const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return res.status(403).json({ message: "Không có quyền truy cập" });
      }
      next();
   };
};

export const requireAdmin = requireRole("admin");
export const requireStaff = requireRole(["admin", "staff"]);
