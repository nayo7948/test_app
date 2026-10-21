import { expect, test, type Browser, type Page } from "@playwright/test";

const YEOKSAM = { latitude: 37.5006, longitude: 127.0365 };
const GANGNAM = { latitude: 37.4979, longitude: 127.0276 }; // ~0.8km from 역삼
const BUSAN = { latitude: 35.1631, longitude: 129.1636 };

const run = Date.now();

async function newResident(browser: Browser, name: string, geolocation: typeof YEOKSAM, dong: string) {
  // Inherit the project's device/viewport (mobile or desktop) and baseURL.
  const { baseURL, ...device } = test.info().project.use;
  const context = await browser.newContext({ ...device, baseURL, geolocation, permissions: ["geolocation"], locale: "ko-KR" });
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
  // A large photo: the browser should shrink it to 1600px on the long side before upload.
  await alice.getByLabel("사진 첨부").setInputFiles({ name: "cafe.png", mimeType: "image/png", buffer: await bigPng(alice) });
  await expect(alice.getByAltText("첨부한 사진 1")).toBeVisible();
  await expect(alice.getByRole("button", { name: /1\/5/ })).toBeVisible();
  await alice.getByRole("button", { name: "완료" }).click();
  await expect(alice.getByRole("heading", { name: title })).toBeVisible();
  const photo = alice.getByAltText(`${title} 사진 1`);
  await expect(photo).toHaveAttribute("width", "1600");
  await expect(photo).toHaveAttribute("height", "1200");
  expect(await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(1600);

  // Bob lives ~0.8km away: sees the post (with its thumbnail), comments and likes it.
  const bob = await newResident(browser, "bob", GANGNAM, "역삼1동");
  await expect(bob.getByText(title)).toBeVisible();
  await expect(bob.getByRole("link", { name: new RegExp(title) }).locator("img")).toBeVisible();
  await bob.getByText(title).click();
  await expect(bob).toHaveURL(/\/posts\//);
  await expect(bob.locator("article").getByText(/역삼동 · \d+m/)).toBeVisible();
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

test("photos need a login and only real images are accepted", async ({ browser, request }) => {
  expect((await request.get("/api/images/00000000-0000-0000-0000-000000000000.png")).status()).toBe(401);

  const page = await newResident(browser, "dave", YEOKSAM, "역삼동");
  const form = new FormData();
  form.set("category", "FREE");
  form.set("title", "가짜 사진");
  form.set("content", "내용");
  form.append("images", new Blob(["<script>alert(1)</script>"], { type: "image/png" }), "evil.png");
  const res = await page.request.post("/api/posts", { multipart: form });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain("사진");
  expect((await page.request.get("/api/images/..%2F..%2F.env")).status()).toBe(404);
});

/** A 2400x1800 PNG drawn in the browser (no binary fixtures in the repo). */
async function bigPng(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 2400, 1800);
    gradient.addColorStop(0, "#34d399");
    gradient.addColorStop(1, "#ff6f0f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2400, 1800);
    return canvas.toDataURL("image/png");
  });
  return Buffer.from(dataUrl.split(",")[1], "base64");
}
