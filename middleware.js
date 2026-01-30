import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/nouveau-bien/:path*",
        "/mes-annonces/:path*",
        "/annonce/:path*",
    ],
};
