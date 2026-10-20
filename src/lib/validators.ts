import { z } from "zod";
import { RADIUS_OPTIONS_KM } from "./geo";

export const CATEGORIES = {
  QUESTION: "동네질문",
  RESTAURANT: "맛집",
  LOST_FOUND: "분실/실종",
  NEWS: "동네소식",
  FREE: "일상",
} as const;

export type Category = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [Category, ...Category[]];

export const signupSchema = z.object({
  email: z.email("올바른 이메일을 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요."),
  nickname: z.string().trim().min(2, "닉네임은 2자 이상이어야 해요.").max(20),
});

export const loginSchema = z.object({
  email: z.email("올바른 이메일을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const locationSchema = z.object({
  neighborhoodName: z.string().trim().min(1, "동네 이름을 입력해주세요.").max(30),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z
    .number()
    .int()
    .refine((v) => (RADIUS_OPTIONS_KM as readonly number[]).includes(v), "지원하지 않는 반경이에요."),
});

export const postSchema = z.object({
  category: z.enum(CATEGORY_KEYS),
  title: z.string().trim().min(1, "제목을 입력해주세요.").max(100),
  content: z.string().trim().min(1, "내용을 입력해주세요.").max(5000),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "댓글을 입력해주세요.").max(1000),
});

/** First validation message, for showing a single error to the user. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "입력값을 확인해주세요.";
}
