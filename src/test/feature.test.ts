import { describe, beforeEach, test, expect, afterEach } from "vitest";
import nock from "nock";
import { sendToBackend, generateIssueMarkdown } from "../index.js";

// Requiring our fixtures
const payload = require("./fixtures/request.issue.opened.default.json");
const payloadKo = require("./fixtures/request.issue.opened.ko.json");

describe("sendToBackend", () => {
  beforeEach(() => {
    // nock.disableNetConnect();
    nock.enableNetConnect();
    // nock.enableNetConnect("zekxyavkzonflbkssvkc.supabase.co");
  });
  describe("English", () => {
    test("sendToBackend", async () => {
      // Test that we correctly return a test token
      nock("https://api.github.com")
        .post("/app/installations/2/access_tokens")
        .reply(200, { token: "test" });

      await sendToBackend("## Issue Opened\n- Title: Test issue\n- Description: \n\`\`\`markdown\nThis is a test issue body.\n(...)\n\`\`\`\n- Author: testuser\n- URL: [Link](https://github.com/test/repo/issues/1)\n", payload.repository, "Issue");    
    });
  });
  describe("Korean", () => {
    test("sendToBackend", async () => {
      // Test that we correctly return a test token
      nock("https://api.github.com")
        .post("/app/installations/2/access_tokens")
        .reply(200, { token: "test" });

      // await sendToBackend("## Issue Opened\n- Title: 테스트 이슈\n- Description: \n\`\`\`markdown\n이것은 테스트 이슈 본문입니다.\n(...)\n\`\`\`\n- Author: 테스트유저\n- URL: [Link](https://github.com/test/repo/issues/1)\n", payloadKo.repository, "Issue");
    });
  });
});

describe("generateIssueMarkdown", () => {
  beforeEach(() => {
    nock.disableNetConnect();
    // nock.enableNetConnect();
    nock.enableNetConnect("zekxyavkzonflbkssvkc.supabase.co");
  });
  describe("English", () => {
    test("generateIssueMarkdown", async () => {
      const markdownContent = generateIssueMarkdown(payload.issue, "Issue Opened");
      expect(markdownContent).toBe(`## Issue Opened\n- Title: Test issue\n- Description: \n\`\`\`markdown\nThis is a test issue body.\n(...)\n\`\`\`\n- Author: testuser\n- URL: [Link](https://github.com/test/repo/issues/1)\n`);
    });
  })
  describe("Korean", () => {
    test("generateIssueMarkdown", async () => {
      const markdownContent = generateIssueMarkdown(payloadKo.issue, "Issue Opened");
      expect(markdownContent).toBe(`## Issue Opened\n- Title: 테스트 이슈\n- Description: \n\`\`\`markdown\n이것은 테스트 이슈 본문입니다.\n(...)\n\`\`\`\n- Author: 테스트유저\n- URL: [Link](https://github.com/test/repo/issues/1)\n`);
    });
  })

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});