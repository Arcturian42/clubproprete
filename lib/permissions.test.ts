import test from "node:test";
import assert from "node:assert/strict";
import {
  canPublishJob,
  canViewCandidate,
  hasAllowedEntityRole,
  isVerifiedPersonalAccount,
  PermissionError,
  type PermissionCompany,
  type PermissionUser,
} from "./permissions";

const verifiedUser: PermissionUser = {
  id: "user-owner",
  emailVerified: true,
  mainRole: "company_owner",
  role: null,
  profile: { verificationStatus: "draft" },
};

const approvedCompany: PermissionCompany = {
  id: "company-1",
  ownerUserId: "user-owner",
  verificationStatus: "approved",
};

test("isVerifiedPersonalAccount accepts email verification", () => {
  assert.equal(isVerifiedPersonalAccount(verifiedUser), true);
});

test("isVerifiedPersonalAccount accepts approved profile verification", () => {
  assert.equal(
    isVerifiedPersonalAccount({
      ...verifiedUser,
      emailVerified: false,
      profile: { verificationStatus: "approved" },
    }),
    true
  );
});

test("isVerifiedPersonalAccount rejects unverified personal accounts", () => {
  assert.equal(
    isVerifiedPersonalAccount({
      ...verifiedUser,
      emailVerified: false,
      profile: { verificationStatus: "pending" },
    }),
    false
  );
});

test("canPublishJob accepts verified owner of approved company", () => {
  assert.equal(canPublishJob(verifiedUser, approvedCompany), true);
});

test("canPublishJob accepts verified recruiter of approved company", () => {
  assert.equal(canPublishJob(verifiedUser, { ...approvedCompany, ownerUserId: "someone-else" }, "recruiter"), true);
});

test("canPublishJob rejects unapproved companies", () => {
  assert.equal(canPublishJob(verifiedUser, { ...approvedCompany, verificationStatus: "pending" }), false);
});

test("canPublishJob rejects forged ownership", () => {
  assert.equal(canPublishJob(verifiedUser, { ...approvedCompany, ownerUserId: "someone-else" }), false);
});

test("canPublishJob rejects unverified personal accounts", () => {
  assert.equal(
    canPublishJob({ ...verifiedUser, emailVerified: false, profile: { verificationStatus: "draft" } }, approvedCompany),
    false
  );
});

test("hasAllowedEntityRole checks entity role allowlists", () => {
  assert.equal(hasAllowedEntityRole("owner", ["owner", "recruiter"]), true);
  assert.equal(hasAllowedEntityRole("member", ["owner", "recruiter"]), false);
});

test("canViewCandidate accepts the candidate themself without database access", async () => {
  assert.equal(await canViewCandidate({ id: "candidate-user", role: "candidate_profile" }, "candidate-user"), true);
});

test("canViewCandidate accepts super admins without database access", async () => {
  assert.equal(await canViewCandidate({ id: "admin-user", role: "super_admin" }, "candidate-user"), true);
});

test("PermissionError carries an authorization code", () => {
  const error = new PermissionError("FORBIDDEN", "Refusé");
  assert.equal(error.code, "FORBIDDEN");
  assert.equal(error.message, "Refusé");
});
