"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"

export async function login(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // authentikasi user dengan supabase
    const { error } = await supabase.auth.signInWithPassword({email, password});

    if (error) {
        // redirect ke orror page
        console.error("Supabase login error:", error); 
        redirect(`/?error=${encodeURIComponent(error.message)}`);
    }

    // clear cache untuk layout, agar UI ter-update ke new auth
    revalidatePath("/", "layout");

    redirect("/dashboard/ie");

}