// import { createClient } from "@/lib/supabase/server";
// import { createUser, getUserByEmail } from "./utils";

// export async function syncUserFromSupabase() {
//   const supabase = await createClient();
  
//   // Get user from Supabase auth
//   const { data: { user }, error } = await supabase.auth.getUser();
  
//   if (error || !user) {
//     throw new Error("Failed to get user from Supabase");
//   }

//   // Check if user exists in our database
//   const existingUser = await getUserByEmail(user.email!);
  
//   if (!existingUser) {
//     // Create user in our database
//     await createUser({
//       id: user.id,
//       email: user.email!,
//       fullName: user.user_metadata?.full_name,
//       avatarUrl: user.user_metadata?.avatar_url,
//     });
//   }
  
//   return user;
// } 