# 우리동네

당근의 '동네생활'처럼 **내 위치 근처 이웃의 글만 보는** 동네 커뮤니티 웹앱입니다.

## 기능 (MVP)
- 이메일/비밀번호 회원가입·로그인 (bcrypt 해시 + httpOnly JWT 쿠키)
- 동네 설정: 브라우저 위치(geolocation)로 좌표를 받고, 동네 이름과 반경(1/3/5/10km)을 고름
- 동네생활 피드: 반경 안의 글만 최신순으로 표시, 카테고리 탭(동네질문·맛집·분실/실종·동네소식·일상), 더보기 페이지네이션
- 글쓰기·삭제(작성자만), 댓글, 공감(좋아요), 조회수
- 사진 첨부: 글 하나에 최대 5장(JPG·PNG·WebP·GIF). 브라우저에서 긴 변 1600px로 줄여 올리고, 서버는 파일 내용으로 형식을 다시 확인한 뒤 `uploads/`(`UPLOAD_DIR`)에 저장
- 글에는 작성 시점의 동네 좌표가 저장되므로, 작성자가 동네를 옮겨도 글은 원래 동네에 남음
- 반응형 화면: 휴대폰은 하단 탭바, PC는 상단 메뉴와 3단 피드(주제 · 글 목록 · 내 동네)

## 기술 스택
Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Prisma 6 + SQLite · zod · jose · Vitest · Playwright

## 시작하기
```bash
npm install
cp .env.example .env          # AUTH_SECRET을 긴 랜덤 문자열로 바꿔주세요
npm run db:migrate            # DB 생성 + 샘플 데이터(seed)
npm run dev                   # http://localhost:3000
```
샘플 계정의 비밀번호는 모두 `password123`입니다: `yeoksam@example.com`(역삼동), `seocho@example.com`(서초동), `seongsu@example.com`(성수동), `haeundae@example.com`(부산 우동).

> 브라우저 위치 권한은 `localhost`나 HTTPS에서만 동작합니다.

> 새 버전을 받은 뒤(`git pull`)에는 `npm install`과 `npm run db:migrate`를 다시 실행해 DB 구조를 맞춰주세요.

## 스크립트
| 명령 | 설명 |
| --- | --- |
| `npm run dev` / `build` / `start` | 개발 서버 / 빌드 / 실행 |
| `npm run lint` / `typecheck` | ESLint / TypeScript 검사 |
| `npm test` | 단위 테스트 (거리 계산, 입력 검증, 반경 피드 페이지네이션) |
| `npm run test:e2e` | Playwright E2E, 휴대폰·PC 화면에서 각각 실행 (별도 `prisma/e2e.db` 사용) |
| `npm run db:seed` | 샘플 데이터 다시 넣기 |

## 위치 기반 조회 방식
`src/lib/posts.ts`의 `getNearbyPosts`는 이렇게 동작합니다.
1. 반경을 감싸는 위경도 사각형(bounding box)으로 SQL에서 후보를 좁힙니다. (`@@index([lat, lng])`)
2. 후보를 하버사인 거리로 다시 계산해 원 밖의 글을 뺍니다.
3. `(createdAt, id)` 커서로 최신순 페이지를 나눕니다.

데이터가 많아지면 Postgres + PostGIS(`ST_DWithin`)로 옮기는 것을 권장합니다.

## 구조
```
prisma/            schema.prisma, migrations, seed.ts
src/app/           (main): 로그인 후 화면(피드, 글쓰기, 글 상세, 나의 동네) · (auth): 로그인/가입 · api/: API 라우트
src/components/    UI 컴포넌트
src/lib/           auth, session, geo, posts, validators
src/middleware.ts  로그인하지 않은 사용자를 /login으로 보냄
tests/             unit(Vitest), e2e(Playwright)
```

## 다음 단계
중고거래(사진·거래 상태), 1:1 채팅(WebSocket), 역지오코딩으로 동네 이름 자동 입력, 동네 인증, 신고/차단
