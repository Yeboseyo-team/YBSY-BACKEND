// 자격증 데이터 훅 (F-04) — 회차 목록(공용), 내가 고른 회차, 고르기·수정·해제.
// 바꾸면 내 자격증 캐시가 바뀌어 useForecastData 의 예보도 바로 다시 계산됩니다 (FR-04-7).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import { applyStatus, todayInKorea } from "@/features/forecast/calc";
import type { Certificate, UserCertificate } from "@/types/database";

export const certificateKeys = {
  all: ["certificates"] as const,
  mine: (userId: string) => ["user_certificates", userId] as const,
};

export class ApplyClosedError extends Error {
  constructor() {
    super("접수가 끝난 회차라 고를 수 없어요. 다른 회차를 골라 주세요.");
  }
}

/** 자격증 저장 오류를 화면에 보여 줄 한국어 문장으로 (NFR-USE-2) */
export function toCertificateMessage(error: unknown): string {
  if (error instanceof ApplyClosedError) return error.message;
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "23505") return "이미 고른 회차예요.";
  if (code === "23514") return "준비 기간은 1~16주, 주당 학습 시간은 1~40시간으로 입력하세요.";
  return "자격증을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/** 전체 자격증 회차 (공용, 로그인 사용자만). 검색·묶기는 searchCertificates 사용 */
export function useCertificates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: certificateKeys.all,
    enabled: Boolean(user),
    staleTime: 10 * 60_000, // 팀이 대시보드에서만 바꾸는 데이터라 자주 다시 부를 필요 없음
    queryFn: async (): Promise<Certificate[]> => {
      const { data, error } = await supabase.from("certificates").select("*").order("name").order("exam_date");
      if (error) throw error;
      return data;
    },
  });
}

/** 내가 고른 회차 목록 */
export function useMyCertificates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: certificateKeys.mine(user?.id ?? "anonymous"),
    enabled: Boolean(user),
    queryFn: async (): Promise<UserCertificate[]> => {
      const { data, error } = await supabase.from("user_certificates").select("*");
      if (error) throw error;
      return data;
    },
  });
}

function useMineKey() {
  const { user } = useAuth();
  return certificateKeys.mine(user?.id ?? "anonymous");
}

/**
 * 회차 고르기 (FR-04-3). 준비 기간·학습 시간을 안 넘기면 회차 기본값을 씁니다.
 * 접수 마감된 회차는 ApplyClosedError (FR-04-2, 화면에서도 미리 막으세요).
 */
export function useAddCertificate() {
  const key = useMineKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      certificate,
      prep_weeks,
      study_hours,
    }: {
      certificate: Pick<Certificate, "id" | "apply_start" | "apply_end" | "prep_weeks" | "default_study_hours">;
      prep_weeks?: number;
      study_hours?: number;
    }): Promise<UserCertificate> => {
      if (applyStatus(certificate, todayInKorea()) === "closed") throw new ApplyClosedError();
      const { data, error } = await supabase
        .from("user_certificates")
        .insert({
          certificate_id: certificate.id,
          prep_weeks: prep_weeks ?? certificate.prep_weeks,
          study_hours: study_hours ?? certificate.default_study_hours,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 고른 회차의 준비 기간·주당 학습 시간 바꾸기 (FR-04-3) */
export function useUpdateMyCertificate() {
  const key = useMineKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      certificate_id,
      prep_weeks,
      study_hours,
    }: Pick<UserCertificate, "certificate_id" | "prep_weeks" | "study_hours">): Promise<UserCertificate> => {
      const { data, error } = await supabase
        .from("user_certificates")
        .update({ prep_weeks, study_hours })
        .eq("certificate_id", certificate_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserCertificate[]>(key);
      queryClient.setQueryData<UserCertificate[]>(key, (old) =>
        old?.map((uc) => (uc.certificate_id === next.certificate_id ? { ...uc, ...next } : uc)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 고른 회차 해제 (FR-04-7). 그래프에서 준비 시간이 바로 빠지도록 먼저 목록에서 뺍니다. */
export function useRemoveMyCertificate() {
  const key = useMineKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (certificate_id: string) => {
      const { error } = await supabase.from("user_certificates").delete().eq("certificate_id", certificate_id);
      if (error) throw error;
    },
    onMutate: async (certificate_id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserCertificate[]>(key);
      queryClient.setQueryData<UserCertificate[]>(key, (old) => old?.filter((uc) => uc.certificate_id !== certificate_id));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
