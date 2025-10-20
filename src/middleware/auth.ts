import type { APIContext } from 'astro';
import { AuthenticationError } from '../lib/errors/api-errors';

export const requireAuth = async (context: APIContext) => {
  const { locals } = context;
  const { supabase } = locals;

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new AuthenticationError('Failed to verify authentication status');
  }

  if (!session) {
    throw new AuthenticationError('Authentication required');
  }

  // Add user info to context for downstream use
  locals.user = session.user;
  locals.session = session;
};
