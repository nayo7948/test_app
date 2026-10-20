export function timeAgo(date: Date | string, now: Date = new Date()): string {
  const sec = Math.max(0, Math.floor((now.getTime() - new Date(date).getTime()) / 1000));
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(date).toLocaleDateString("ko-KR");
}
