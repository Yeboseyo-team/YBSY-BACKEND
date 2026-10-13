import type { Plan, PlanLoadLevel, PlanType } from "@/types/database";
import type { PlanRecord } from "./types";

/** DB 행 → PlanRecord (type·load_level 좁히기, numeric을 숫자로) */
export function toPlanRecord(row: Plan): PlanRecord {
  return {
    id: row.id,
    title: row.title,
    type: row.type as PlanType,
    credits: row.credits,
    load_level: row.load_level as PlanLoadLevel,
    start_week: row.start_week,
    end_week: row.end_week,
    hours_per_week: Number(row.hours_per_week),
  };
}
