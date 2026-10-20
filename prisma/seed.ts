import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// All sample accounts use the password "password123".
const USERS = [
  { email: "yeoksam@example.com", nickname: "역삼토박이", neighborhoodName: "역삼동", lat: 37.5006, lng: 127.0365 },
  { email: "seocho@example.com", nickname: "서초댁", neighborhoodName: "서초동", lat: 37.4919, lng: 127.0076 },
  { email: "seongsu@example.com", nickname: "성수러버", neighborhoodName: "성수동", lat: 37.5446, lng: 127.0557 },
  { email: "haeundae@example.com", nickname: "해운대갈매기", neighborhoodName: "우동", lat: 35.1631, lng: 129.1636 },
];

const POSTS: { author: number; category: string; title: string; content: string; minutesAgo: number }[] = [
  { author: 0, category: "QUESTION", title: "역삼역 근처 조용한 카페 추천해주세요", content: "노트북 작업하기 좋은 곳 찾고 있어요. 콘센트 많으면 더 좋아요!", minutesAgo: 5 },
  { author: 0, category: "LOST_FOUND", title: "테헤란로에서 갈색 지갑 주우신 분", content: "어제 저녁 8시쯤 잃어버렸어요. 신분증만이라도 돌려받고 싶어요 ㅠㅠ", minutesAgo: 90 },
  { author: 1, category: "RESTAURANT", title: "서초동 숨은 국밥 맛집", content: "법원 뒤쪽 골목에 있는 순대국밥집, 아침 7시부터 열어요. 강추합니다.", minutesAgo: 240 },
  { author: 1, category: "NEWS", title: "이번 주말 서리풀 축제 한대요", content: "토요일 오후 2시부터 반포대로 일대 차량 통제된다고 하니 참고하세요.", minutesAgo: 600 },
  { author: 2, category: "FREE", title: "서울숲 산책하기 좋은 날씨네요", content: "단풍이 슬슬 들기 시작했어요 🍁", minutesAgo: 30 },
  { author: 3, category: "RESTAURANT", title: "해운대 시장 떡볶이 아직 맛있나요?", content: "오랜만에 가보려고 하는데 요즘도 줄 서나요?", minutesAgo: 15 },
];

async function main() {
  await db.like.deleteMany();
  await db.comment.deleteMany();
  await db.post.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const users = [];
  for (const u of USERS) users.push(await db.user.create({ data: { ...u, passwordHash, radiusKm: 5 } }));

  for (const p of POSTS) {
    const author = users[p.author];
    const post = await db.post.create({
      data: {
        authorId: author.id,
        category: p.category,
        title: p.title,
        content: p.content,
        neighborhoodName: author.neighborhoodName!,
        lat: author.lat!,
        lng: author.lng!,
        createdAt: new Date(Date.now() - p.minutesAgo * 60_000),
      },
    });
    if (p.author === 0) {
      await db.comment.create({ data: { postId: post.id, authorId: users[1].id, content: "저도 궁금했어요!" } });
      await db.like.create({ data: { postId: post.id, userId: users[1].id } });
    }
  }
  console.log(`Seeded ${users.length} users and ${POSTS.length} posts.`);
}

main().finally(() => db.$disconnect());
