"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function SearchLogger() {
  const params = useSearchParams();
  const key = params.toString();
  useEffect(() => {
    if (!key) return;
    supabase.from("search_logs").insert({
      query: params.get("q"),
      land_type: params.get("land_type"),
      max_price: params.get("max_price") ? Number(params.get("max_price")) : null,
      max_area: params.get("max_area") ? Number(params.get("max_area")) : null,
      district: params.get("district"),
    }).then(() => {});
  }, [key]);
  return null;
}
