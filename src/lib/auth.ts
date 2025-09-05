import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export async function signInWithEmail(params: { email: string; password: string }): Promise<{ error: string | null }>
{
  const { email, password } = params;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(params: { email: string; password: string }): Promise<{ error: string | null }>
{
  const { email, password } = params;
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}


