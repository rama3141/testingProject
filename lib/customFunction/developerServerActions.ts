"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ResetBenchmarkResult {
    success: boolean;
    message: string;
    deleted_records: {
        ie_participations: number;
        event_detail: number;
        students: number;
    };
    total_deleted: number;
}

interface ResetBenchmarkResponse {
    success: boolean;
    message: string;
    data?: ResetBenchmarkResult;
}

export async function handleResetAllTableData(): Promise<ResetBenchmarkResponse> {
    try {
        const supabase = await supabaseServer();

        // 1. Authenticate the current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: "Unauthorized. Please sign in first.",
            };
        }

        // 2. Execute PostgreSQL RPC
        const { data, error } = await supabase.rpc(
            "reset_benchmark_data"
        );

        if (error) {
            console.error("Reset benchmark RPC error:", error);

            return {
                success: false,
                message: "Failed to reset benchmark data.",
            };
        }

        // 3. Validate RPC response
        const result = data as ResetBenchmarkResult | null;

        if (!result || !result.success) {
            return {
                success: false,
                message: result?.message ?? "Unexpected RPC response.",
            };
        }

        // 4. Revalidate IE Monitoring page
        revalidatePath("/dashboard/ie");

        // 5. Return deletion statistics
        return {
            success: true,
            message: result.message,
            data: result,
        };

    } catch (error) {
        console.error("Reset benchmark action error:", error);

        return {
            success: false,
            message: "An unexpected error occurred while resetting data.",
        };
    }
}