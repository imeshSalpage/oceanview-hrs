import { clearToken, getRoleFromToken, getToken, getUsernameFromToken, parseJwt, setToken } from "@/lib/auth";

function buildJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.`;
}

describe("auth helpers", () => {
  it("stores and clears token", () => {
    setToken("abc123");
    expect(getToken()).toBe("abc123");

    clearToken();
    expect(getToken()).toBeNull();
  });

  it("parses role and username from JWT", () => {
    const token = buildJwt({ role: "ADMIN", sub: "admin" });
    expect(parseJwt(token)).toEqual({ role: "ADMIN", sub: "admin" });
    expect(getRoleFromToken(token)).toBe("ADMIN");
    expect(getUsernameFromToken(token)).toBe("admin");
  });

  it("returns null for malformed JWT", () => {
    expect(parseJwt("bad.token")).toBeNull();
    expect(getRoleFromToken("bad.token")).toBeNull();
    expect(getUsernameFromToken("bad.token")).toBeNull();
  });
});
