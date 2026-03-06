vi.mock("@/lib/auth", () => ({
  getToken: () => null,
}));

import { api } from "@/lib/api";

describe("api client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON with Content-Type header", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await api.post<{ ok: boolean }>("/api/help", { hello: "world" });

    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const headers = new Headers(options.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ hello: "world" }));
  });

  it("sends FormData without forcing Content-Type", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const formData = new FormData();
    formData.append("name", "demo");

    await api.put<{ ok: boolean }>("/api/rooms/SINGLE", formData);

    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const headers = new Headers(options.headers);
    expect(headers.get("Content-Type")).toBeNull();
    expect(options.body).toBe(formData);
  });
});
