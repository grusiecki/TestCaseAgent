import { defineMiddleware } from 'astro:middleware';
import { supabase } from '../db/supabase.client';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/temp-login'];

// List of public API routes
const publicApiRoutes = [
  '/api/auth/temp-login',
  '/api/auth/login',
  '/api/auth/check-session'
];

// Helper function to check if a route is public
const isPublicRoute = (pathname: string) => {
  // Check API routes
  if (pathname.startsWith('/api/')) {
    return publicApiRoutes.includes(pathname);
  }
  return publicRoutes.includes(pathname);
};

// Unified middleware for both API and page routes
export const authMiddleware = defineMiddleware(async (context, next) => {
  try {
    const url = new URL(context.request.url);
    
    // Skip auth check for public routes
    if (isPublicRoute(url.pathname)) {
      return await next();
    }

    // Get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    // If there's an error or no session
    if (error || !session) {
      // For API routes, return 401
      if (url.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      // For page routes, redirect to home
      return context.redirect('/');
    }

    // Add user info to locals for use in components/handlers
    Object.assign(context.locals, {
      session,
      user: session.user,
      supabase
    });

    // Continue to next middleware/handler
    return await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // For API routes, return 500
    if (context.url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'Authentication error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    // For page routes, redirect to home
    return context.redirect('/');
  }
});