import { expect, test, type Browser, type Page } from "@playwright/test";

const YEOKSAM = { latitude: 37.5006, longitude: 127.0365 };
const GANGNAM = { latitude: 37.4979, longitude: 127.0276 }; // ~0.8km from 역삼
const BUSAN = { latitude: 35.1631, longitude: 129.1636 };

const run = Date.now();

async function newResident(browser: Browser, name: string, geolocation: typeof YEOKSAM, dong: string) {
  const context = await browser.newContext({ geolocation, permissions: ["geolocation"], locale: "ko-KR" });
  const page = await context.newPage();
  await page.goto("/signup");
  await page.getByPlaceholder("닉네임").fill(name);
  await page.getByPlaceholder("이메일").fill(`${name}-${run}@example.com`);
  await page.getByPlaceholder("비밀번호 (8자 이상)").fill("password123");
  await page.getByRole("button", { name: "가입하기" }).click();

  await expect(page).toHaveURL(/\/onboarding\/location/);
  await page.getByRole("button", { name: /현재 위치로 찾기/ }).click();
  await expect(page.getByTestId("coords")).toBeVisible();
  await page.getByLabel("동네 이름").fill(dong);
  await page.getByRole("button", { name: "3km" }).click();
  await page.getByRole("button", { name: "이 동네로 설정하기" }).click();
  await expect(page.getByRole("link", { name: `${dong} ▾` })).toBeVisible();
  return page;
}

test("posts are shared with nearby neighbors only", async ({ browser }) => {
  const title = `역삼역 카페 추천 ${run}`;

  const alice: Page = await newResident(browser, "alice", YEOKSAM, "역삼동");
  await alice.getByRole("link", { name: "글쓰기" }).click();
  await alice.getByLabel("주제").selectOption("QUESTION");
  await alice.getByPlaceholder("제목").fill(title);
  await alice.getByPlaceholder(/이웃과 이야기를 나눠보세요/).fill("조용한 곳이면 좋겠어요.");
  await alice.getByRole("button", { name: "완료" }).click();
  await expect(alice.getByRole("heading", { name: title })).toBeVisible();

  // Bob lives ~0.8km away: sees the post, comments and likes it.
  const bob = await newResident(browser, "bob", GANGNAM, "역삼1동");
  await expect(bob.getByText(title)).toBeVisible();
  await bob.getByText(title).click();
  await expect(bob.getByText(/역삼동 · \d+m/)).toBeVisible();
  await bob.getByRole("button", { name: /공감 0/ }).click();
  await expect(bob.getByRole("button", { name: /공감 1/ })).toHaveAttribute("aria-pressed", "true");
  await bob.getByLabel("댓글").fill("저도 궁금해요!");
  await bob.getByRole("button", { name: "등록" }).click();
  await expect(bob.getByText("저도 궁금해요!")).toBeVisible();

  // Alice sees the comment and like count in her feed.
  await alice.goto("/");
  const card = alice.getByRole("link", { name: new RegExp(title) });
  await expect(card).toContainText("♡ 1");
  await expect(card).toContainText("💬 1");

  // Category tabs filter the feed.
  await alice.getByRole("link", { name: "맛집", exact: true }).click();
  await expect(alice.getByText(title)).toHaveCount(0);

  // Carol lives in Busan: the post isn't in her feed.
  const carol = await newResident(browser, "carol", BUSAN, "우동");
  await expect(carol.getByText("아직 근처에 올라온 글이 없어요.")).toBeVisible();
  await expect(carol.getByText(title)).toHaveCount(0);
});

test("logged-out visitors are sent to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});
