import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import type { Certificate } from "@/types/database";
import type { CertificatePrepInput } from "./types";

export const certificateKeys = {
  search: (q: string) => ["certificates", "search", q] as const,
  mine: (userId: string) => ["user_certificates", userId] as const,
};

/** 자격증 회차 검색 (FR-04-1). 이름에 검색어가 들어간 회차를 시험일 순으로 */
export function useCertificates(search: string) {
  const q = search.trim();
  return useQuery({
    queryKey: certificateKeys.search(q),
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<Certificate[]> => {
      let query = supabase.from("certificates").select("*").order("name").order("exam_date");
      // ilike 패턴 문자(%, _)는 글자 그대로 찾도록 이스케이프
      if (q) query = query.ilike("name", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

function useUserId() {
  return useAuth().user?.id;
}

/** 내가 고른 회차 목록 (회차 정보 포함) */
export function useMyCertificates() {
  const userId = useUserId();
  return useQuery({
    queryKey: certificateKeys.mine(userId ?? "anonymous"),
    enabled: Boolean(userId),
    queryFn: async (): Promise<CertificatePrepInput[]> => {
      const { data, error } = await supabase
        .from("user_certificates")
        .select("certificate_id, study_hours, prep_weeks, certificate:certificates(*)");
      if (error) throw error;
      return data
        .filter((row): row is typeof row & { certificate: Certificate } => row.certificate !== null)
        .sort((a, b) => a.certificate.exam_date.localeCompare(b.certificate.exam_date));
    },
  });
}

type PrepValues = { certificateId: string; prepWeeks: number; studyHours: number };

function useInvalidateMine() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: certificateKeys.mine(userId ?? "anonymous") });
}

/**
 * 회차 추가 (FR-04-3). 같은 자격증의 다른 회차를 이미 골랐다면 replaceId로 넘겨 바꿉니다.
 */
export function useAddCertificate() {
  const invalidate = useInvalidateMine();
  return useMutation({
    mutationFn: async ({ certificateId, prepWeeks, studyHours, replaceId }: PrepValues & { replaceId?: string }) => {
      const { error } = await supabase
        .from("user_certificates")
        .insert({ certificate_id: certificateId, prep_weeks: prepWeeks, study_hours: studyHours });
      if (error) throw error;
      if (replaceId && replaceId !== certificateId) {
        const { error: removeError } = await supabase.from("user_certificates").delete().eq("certificate_id", replaceId);
        if (removeError) throw removeError;
      }
    },
    onSettled: invalidate,
  });
}

/** 준비 기간·공부 시간 수정 (FR-04-4, FR-04-5) */
export function useUpdateMyCertificate() {
  const invalidate = useInvalidateMine();
  return useMutation({
    mutationFn: async ({ certificateId, prepWeeks, studyHours }: PrepValues) => {
      const { error } = await supabase
        .from("user_certificates")
        .update({ prep_weeks: prepWeeks, study_hours: studyHours })
        .eq("certificate_id", certificateId);
      if (error) throw error;
    },
    onSettled: invalidate,
  });
}

/** 선택 해제 */
export function useRemoveMyCertificate() {
  const invalidate = useInvalidateMine();
  return useMutation({
    mutationFn: async (certificateId: string) => {
      const { error } = await supabase.from("user_certificates").delete().eq("certificate_id", certificateId);
      if (error) throw error;
    },
    onSettled: invalidate,
  });
}

export function toCertificateMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  return "자격증 일정을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}
