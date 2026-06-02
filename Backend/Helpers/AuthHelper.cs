using Microsoft.AspNetCore.Http;

namespace kyrsovaya.Helpers
{
    public static class AuthHelper
    {
        public static bool IsAuthenticated(HttpContext ctx) =>
            ctx.Session.GetInt32("UserId").HasValue;

        public static bool IsAdmin(HttpContext ctx) =>
            ctx.Session.GetString("UserRole") == "admin";

        public static bool IsDoctor(HttpContext ctx) =>
            ctx.Session.GetString("UserRole") == "doctor";

        public static bool IsAdminOrDoctor(HttpContext ctx)
        {
            var role = ctx.Session.GetString("UserRole");
            return role == "admin" || role == "doctor";
        }

        public static int? GetUserId(HttpContext ctx) =>
            ctx.Session.GetInt32("UserId");

        public static string? GetRole(HttpContext ctx) =>
            ctx.Session.GetString("UserRole");
    }
}