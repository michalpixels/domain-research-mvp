import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/stripe/webhook',
    '/pricing',
    '/features',
    '/sign-in',
    '/sign-up',
  ],
  ignoredRoutes: [
    '/api/stripe/webhook',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
