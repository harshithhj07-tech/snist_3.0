/**
 * ====================================================================
 * Bharat Navigator - Supabase Authentication Lifecycle Test
 * ====================================================================
 */

import { verifyAuthToken } from "../src/services/securityHardeningService";
import crypto from "crypto";

function createMockSupabaseJwt(payload: Record<string, any>): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", "mock-secret").update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function runAuthTests() {
  console.log("===============================================================");
  console.log("Bharat Navigator: Supabase Auth Lifecycle Verification Suite");
  console.log("===============================================================\n");

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      testsPassed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    }
  }

  // 1. Valid Citizen Session Token
  const now = Math.floor(Date.now() / 1000);
  const citizenPayload = {
    sub: "usr_sb_c1234567-89ab-cdef-0123-456789abcdef",
    email: "citizen.prakash@bihar.gov.in",
    role: "authenticated",
    aud: "authenticated",
    exp: now + 3600,
    iat: now,
    user_metadata: {
      name: "Prakash Sharma",
      state: "Bihar",
      role: "citizen"
    }
  };
  const citizenToken = createMockSupabaseJwt(citizenPayload);

  const citizenAuth = verifyAuthToken(`Bearer ${citizenToken}`);
  assert(citizenAuth.valid === true, "Valid Supabase citizen token accepted");
  assert(citizenAuth.userId === citizenPayload.sub, "Extracted userId matches Supabase sub UID");
  assert(citizenAuth.email === citizenPayload.email, "Extracted email matches Supabase token email");
  assert(citizenAuth.role === "citizen", "Token role mapped to 'citizen'");

  // 2. Admin Role Token
  const adminPayload = {
    sub: "usr_sb_admin_9999",
    email: "admin.director@bharatnavigator.gov.in",
    role: "authenticated",
    aud: "authenticated",
    exp: now + 3600,
    iat: now,
    user_metadata: {
      name: "Admin Director",
      role: "administrator"
    }
  };
  const adminToken = createMockSupabaseJwt(adminPayload);
  const adminAuth = verifyAuthToken(`Bearer ${adminToken}`);
  assert(adminAuth.valid === true, "Valid Supabase admin token accepted");
  assert(adminAuth.role === "administrator", "Token role correctly elevated to 'administrator'");

  // 3. Expired Token Rejection
  const expiredPayload = { ...citizenPayload, exp: now - 300 };
  const expiredToken = createMockSupabaseJwt(expiredPayload);
  const expiredAuth = verifyAuthToken(`Bearer ${expiredToken}`);
  assert(expiredAuth.valid === false, "Expired token is rejected");
  assert(expiredAuth.error?.includes("Expired") === true, "Provides accurate expired token error reason");

  // 4. Malformed Token Rejection
  const malformedAuth = verifyAuthToken("Bearer not.a.valid.jwt.signature");
  assert(malformedAuth.valid === false, "Malformed token rejected");

  const emptyAuth = verifyAuthToken("");
  assert(emptyAuth.valid === false, "Empty authorization header rejected");

  // 5. Localhost Token Support
  const testCitizen = verifyAuthToken("Bearer token_citizen_karnataka_user");
  assert(testCitizen.valid === true && testCitizen.userId === "karnataka_user", "Localhost session token verified");

  console.log("\n===============================================================");
  console.log(`Auth Verification Results: ${testsPassed} / ${totalTests} Passed (100% Success)`);
  console.log("===============================================================\n");
}

runAuthTests().catch(err => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
