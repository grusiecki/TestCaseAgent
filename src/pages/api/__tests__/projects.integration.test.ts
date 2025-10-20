import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { APIContext } from "astro";
import { GET, POST, PUT, DELETE } from "../projects";

import type { AstroCookies } from 'astro';
import type { RewritePayload } from 'astro/dist/core/rewrite';

function createTestContext(options: {
  method: string;
  path: string;
  body?: unknown;
  supabase?: SupabaseClient;
  user?: { id: string };
  params?: Record<string, string | undefined>;
}): TestContext {
  const { method, path, body, supabase, user, params = {} } = options;
  const url = new URL(`http://localhost${path}`);

  return {
    request: new Request(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    locals: {
      supabase: supabase ?? {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        },
      } as unknown as SupabaseClient,
      ...(user ? { user } : {}),
    },
    site: {
      site: "http://localhost",
      url: new URL("http://localhost"),
    },
    generator: "test",
    props: {},
    url,
    cookies: new Map() as unknown as AstroCookies,
    params,
    redirect: async () => new Response(null, { status: 302 }),
    rewrite: async () => new Response(),
    preferredLocale: "en",
    preferredLocaleList: ["en"],
    currentLocale: "en",
    i18n: {
      defaultLocale: "en",
      locales: ["en"],
    },
    clientAddress: "127.0.0.1",
    responseHeaders: new Headers(),
    routePattern: path,
    originPathname: path,
    getActionResult: async () => undefined,
    callAction: async () => new Response(),
    getStaticID: () => undefined,
    getStaticPathID: () => undefined,
  };
}

type TestContext = {
  request: Request;
  locals: {
    supabase: SupabaseClient;
    user?: { id: string };
  };
  site: {
    site: string;
    url: URL;
  };
  generator: string;
  props: Record<string, unknown>;
  url: URL;
  cookies: AstroCookies;
  params: Record<string, string | undefined>;
  redirect: (rewritePayload: RewritePayload) => Promise<Response>;
  rewrite: (rewritePayload: RewritePayload) => Promise<Response>;
  preferredLocale: string;
  preferredLocaleList: string[];
  currentLocale: string;
  i18n: {
    defaultLocale: string;
    locales: string[];
  };
  clientAddress: string;
  responseHeaders: Headers;
  routePattern: string;
  originPathname: string;
  getActionResult: () => Promise<Response | undefined>;
  callAction: (action: string, payload: unknown) => Promise<Response>;
  getStaticID: () => string | undefined;
  getStaticPathID: () => string | undefined;
};

describe("POST /projects Integration Tests", () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    // Initialize Supabase client with test credentials
    supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  });

  afterAll(async () => {
    // Clean up test data
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("projects").delete().eq("user_id", user.id);
    }
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      const context: TestContext = {
        request: new Request("http://localhost/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test Project" }),
        }),
        locals: {
          supabase: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            },
          } as unknown as SupabaseClient,
        },
        site: {
          site: "http://localhost",
          url: new URL("http://localhost"),
        },
        generator: "test",
        props: {},
        url: new URL("http://localhost/projects"),
        cookies: new Map() as unknown as AstroCookies,
        params: {},
        redirect: async () => new Response(null, { status: 302 }),
        rewrite: async () => new Response(),
        preferredLocale: "en",
        preferredLocaleList: ["en"],
        currentLocale: "en",
        i18n: {
          defaultLocale: "en",
          locales: ["en"],
        },
        clientAddress: "127.0.0.1",
        responseHeaders: new Headers(),
        routePattern: "/projects",
        originPathname: "/projects",
        getActionResult: async () => undefined,
        callAction: async () => new Response(),
        getStaticID: () => undefined,
        getStaticPathID: () => undefined,
      };

      const response = await POST(context as TestContext);
      expect(response.status).toBe(401);
    });
  });

  describe("Input Validation", () => {
    it("should return 400 when project name is missing", async () => {
      const context = {
        request: new Request("http://localhost/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
      };

      const response = await POST(context as TestContext);
      expect(response.status).toBe(400);
    });

    it("should return 400 when too many initial titles are provided", async () => {
      const context = {
        request: new Request("http://localhost/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Project",
            initialTitles: Array(21).fill("Test Case"),
          }),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
      };

      const response = await POST(context as TestContext);
      expect(response.status).toBe(400);
    });
  });

  describe("Successful Creation", () => {
    it("should create a project with initial test cases", async () => {
      const projectData = {
        name: "Integration Test Project",
        initialTitles: ["Test Case 1", "Test Case 2"],
      };

      const context = {
        request: new Request("http://localhost/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
      };

      const response = await POST(context as TestContext);
      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData).toMatchObject({
        name: projectData.name,
        testCaseCount: 2,
      });
      expect(responseData.id).toBeDefined();
      expect(responseData.created_at).toBeDefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      const makeRequest = () =>
        POST({
          request: new Request("http://localhost/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Rate Limited Project" }),
          }),
          locals: {
            supabase,
            user: { id: "test-user-id" },
          },
        } as TestContext);

      // Make multiple requests to exceed rate limit
      const requests = Array(101).fill(null).map(makeRequest);
      const responses = await Promise.all(requests);

      expect(responses.some((r) => r.status === 429)).toBe(true);
    });
  });

  describe("Payload Size", () => {
    it("should return 413 when payload is too large", async () => {
      const largePayload = {
        name: "Test Project",
        initialTitles: Array(1000).fill("X".repeat(1000)),
      };

      const context = {
        request: new Request("http://localhost/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(largePayload),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
      };

      const response = await POST(context as TestContext);
      expect(response.status).toBe(413);
    });
  });
});

describe("GET /projects Integration Tests", () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    // Initialize Supabase client with test credentials
    supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  });

  afterAll(async () => {
    // Clean up test data
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("projects").delete().eq("user_id", user.id);
    }
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      const context: TestContext = {
        request: new Request("http://localhost/projects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        locals: {
          supabase: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            },
          } as unknown as SupabaseClient,
        },
        site: {
          site: "http://localhost",
          url: new URL("http://localhost"),
        },
        url: new URL("http://localhost/projects"),
        generator: "test",
        props: {},
        cookies: new Map(),
        params: {},
        redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
        rewrite: (path: string) => path,
        preferredLocale: "en",
        preferredLocaleList: ["en"],
        currentLocale: "en",
        i18n: {
          defaultLocale: "en",
          locales: ["en"],
        },
        clientAddress: "127.0.0.1",
        responseHeaders: new Headers(),
      };

      const response = await GET(context as TestContext);
      expect(response.status).toBe(401);
    });
  });

  describe("Successful Retrieval", () => {
    it("should return an array of projects with test case counts", async () => {
      // First create a test project
      const projectData = {
        name: "Test Project for GET",
        initialTitles: ["Test Case 1", "Test Case 2"],
      };

      const postContext: TestContext = {
        request: new Request("http://localhost/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        site: {
          site: "http://localhost",
          url: new URL("http://localhost"),
        },
        url: new URL("http://localhost/projects"),
        generator: "test",
        props: {},
        cookies: new Map(),
        params: {},
        redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
        rewrite: (path: string) => path,
        preferredLocale: "en",
        preferredLocaleList: ["en"],
        currentLocale: "en",
        i18n: {
          defaultLocale: "en",
          locales: ["en"],
        },
        clientAddress: "127.0.0.1",
        responseHeaders: new Headers(),
      };

      await POST(postContext as TestContext);

      // Now test GET endpoint
      const getContext: TestContext = {
        request: new Request("http://localhost/projects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        site: {
          site: "http://localhost",
          url: new URL("http://localhost"),
        },
        url: new URL("http://localhost/projects"),
        generator: "test",
        props: {},
        cookies: new Map(),
        params: {},
        redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
        rewrite: (path: string) => path,
        preferredLocale: "en",
        preferredLocaleList: ["en"],
        currentLocale: "en",
        i18n: {
          defaultLocale: "en",
          locales: ["en"],
        },
        clientAddress: "127.0.0.1",
        responseHeaders: new Headers(),
      };

      const response = await GET(getContext as TestContext);
      expect(response.status).toBe(200);

      const projects = await response.json();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);

      const project = projects[0];
      expect(project).toMatchObject({
        name: projectData.name,
        testCaseCount: 2,
      });
      expect(project.id).toBeDefined();
      expect(project.created_at).toBeDefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      const makeRequest = () =>
        GET({
          request: new Request("http://localhost/projects", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          locals: {
            supabase,
            user: { id: "test-user-id" },
          },
        } as TestContext);

      // Make multiple requests to exceed rate limit
      const requests = Array(101).fill(null).map(makeRequest);
      const responses = await Promise.all(requests);

      expect(responses.some((r) => r.status === 429)).toBe(true);
    });
  });
});

describe("PUT /projects Integration Tests", () => {
  let supabase: SupabaseClient;
  let testProjectId: string;

  beforeAll(() => {
    supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  });

  beforeEach(async () => {
    // Create a test project before each test
    const context = {
      request: new Request("http://localhost/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Project for Update",
          initialTitles: ["Test Case 1"],
        }),
      }),
      locals: {
        supabase,
        user: { id: "test-user-id" },
      },
    } as TestContext;

    const response = await POST(context);
    const data = await response.json();
    testProjectId = data.id;
  });

  afterAll(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("projects").delete().eq("user_id", user.id);
    }
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      const context = {
        request: new Request(`http://localhost/projects/${testProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Project" }),
        }),
        locals: {
          supabase: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            },
          },
        },
        params: { id: testProjectId },
      } as TestContext;

      const response = await PUT(context);
      expect(response.status).toBe(401);
    });
  });

  describe("Input Validation", () => {
    it("should return 400 when project ID is missing", async () => {
      const context = {
        request: new Request("http://localhost/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Project" }),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        params: {},
      } as TestContext;

      const response = await PUT(context);
      expect(response.status).toBe(400);
    });

    it("should return 400 when project name is missing", async () => {
      const context = {
        request: new Request(`http://localhost/projects/${testProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        params: { id: testProjectId },
      } as TestContext;

      const response = await PUT(context);
      expect(response.status).toBe(400);
    });

    it("should return 400 when project name is too long", async () => {
      const context = {
        request: new Request(`http://localhost/projects/${testProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "X".repeat(101) }),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        params: { id: testProjectId },
      } as TestContext;

      const response = await PUT(context);
      expect(response.status).toBe(400);
    });
  });

  describe("Successful Update", () => {
    it("should update project name", async () => {
      const newName = "Updated Project Name";
      const context = {
        request: new Request(`http://localhost/projects/${testProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        params: { id: testProjectId },
      } as TestContext;

      const response = await PUT(context);
      expect(response.status).toBe(200);

      const updatedProject = await response.json();
      expect(updatedProject).toMatchObject({
        id: testProjectId,
        name: newName,
      });
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      const makeRequest = () =>
        PUT({
          request: new Request(`http://localhost/projects/${testProjectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Rate Limited Update" }),
          }),
          locals: {
            supabase,
            user: { id: "test-user-id" },
          },
          params: { id: testProjectId },
        } as TestContext);

      const requests = Array(101).fill(null).map(makeRequest);
      const responses = await Promise.all(requests);

      expect(responses.some((r) => r.status === 429)).toBe(true);
    });
  });
});

describe("DELETE /projects Integration Tests", () => {
  let supabase: SupabaseClient;
  let testProjectId: string;

  beforeAll(() => {
    supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  });

  beforeEach(async () => {
    // Create a test project before each test
    const context = {
      request: new Request("http://localhost/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Project for Deletion",
          initialTitles: ["Test Case 1"],
        }),
      }),
      locals: {
        supabase,
        user: { id: "test-user-id" },
      },
    } as TestContext;

    const response = await POST(context);
    const data = await response.json();
    testProjectId = data.id;
  });

  afterAll(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("projects").delete().eq("user_id", user.id);
    }
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      const context = {
        request: new Request(`http://localhost/projects/${testProjectId}`, {
          method: "DELETE",
        }),
        locals: {
          supabase: {
            auth: {
              getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            },
          },
        },
        params: { id: testProjectId },
      } as TestContext;

      const response = await DELETE(context);
      expect(response.status).toBe(401);
    });
  });

  describe("Input Validation", () => {
    it("should return 400 when project ID is missing", async () => {
      const context = {
        request: new Request("http://localhost/projects", {
          method: "DELETE",
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        params: {},
      } as TestContext;

      const response = await DELETE(context);
      expect(response.status).toBe(400);
    });
  });

  describe("Successful Deletion", () => {
    it("should delete project and return 204", async () => {
      const context = {
        request: new Request(`http://localhost/projects/${testProjectId}`, {
          method: "DELETE",
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
        params: { id: testProjectId },
      } as TestContext;

      const response = await DELETE(context);
      expect(response.status).toBe(204);

      // Verify project was deleted by trying to fetch it
      const getContext = {
        request: new Request("http://localhost/projects", {
          method: "GET",
        }),
        locals: {
          supabase,
          user: { id: "test-user-id" },
        },
      } as TestContext;

      const getResponse = await GET(getContext);
      const projects = await getResponse.json();
      expect(projects.find((p: { id: string }) => p.id === testProjectId)).toBeUndefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      const makeRequest = () =>
        DELETE({
          request: new Request(`http://localhost/projects/${testProjectId}`, {
            method: "DELETE",
          }),
          locals: {
            supabase,
            user: { id: "test-user-id" },
          },
          params: { id: testProjectId },
        } as TestContext);

      const requests = Array(101).fill(null).map(makeRequest);
      const responses = await Promise.all(requests);

      expect(responses.some((r) => r.status === 429)).toBe(true);
    });
  });
});
