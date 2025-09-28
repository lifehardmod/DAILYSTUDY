import { USER_LIST } from "@/constants/userList";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// handle(아이디)로 name(이름) 찾는 함수 추가
export const getUserName = (handle: string) => {
  const user = USER_LIST.find((u) => u.handle === handle);
  return user ? user.name : handle;
};
