// vitest
import { describe, beforeEach, test, expect, afterEach } from "vitest";
import nock from "nock";
// Requiring our app implementation
import myProbotApp from "../index.js";
import { Probot, ProbotOctokit } from "probot";

// Requiring our fixtures
const payload = require("./fixtures/request.issue.opened.default.json");
const payloadKo = require("./fixtures/request.issue.opened.ko.json");


describe("My Probot app", () => {
  let probot: any;

  beforeEach(() => {
    nock.disableNetConnect();
    nock.enableNetConnect("zekxyavkzonflbkssvkc.supabase.co");
    probot = new Probot({
      githubToken: "test",
      // Disable throttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults((instanceOptions: any) => {
        return {
          ...instanceOptions,
          retry: { enabled: false },
          throttle: { enabled: false },
        };
      }),
    });
    myProbotApp(probot);
  });

  test("creates an issue", async () => {
    // Test that we correctly return a test token
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" });
  
    // Test that an issue is created
    nock("https://api.github.com")
      .post("/repos/hiimbex/testing-things/issues", (body) => {
        expect(body).toMatchObject({ title: "New issue", body: "Issue body" });
        return true;
      })
      .reply(200);
  
    // Receive a webhook event
    await probot.receive({ name: "issues", payload: payload });
  });
  
  test("creates an issue with Korean payload", async () => {
    // Test that we correctly return a test token
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" });
  
    // Test that an issue is created
    nock("https://api.github.com")
      .post("/repos/hiimbex/testing-things/issues", (body) => {
        expect(body).toMatchObject({ title: "새 이슈", body: "이슈 내용" });
        return true;
      })
      .reply(200);
  
    // Receive a webhook event
    await probot.receive({ name: "issues", payload: payloadKo });
  });
  

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});