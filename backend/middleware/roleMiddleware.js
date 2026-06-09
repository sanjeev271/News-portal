const allowRoles =
(...roles) =>
(req, res, next) => {

  if (
    !roles.includes(
      req.user.role
    )
  ) {

    return res.status(403).json({
      message: "Forbidden — admin access required",
      requiredRoles: roles,
      yourRole: req.user?.role || "unknown",
    });

  }

  next();
};

module.exports =
allowRoles;