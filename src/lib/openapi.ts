// Hand-written OpenAPI 3.0 spec for the Accounts Center API. Served as JSON at
// /api/openapi.json and rendered with Swagger UI at /api-docs.

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Accounts Center API",
    version: "1.0.0",
    description:
      "REST API for the Meta Accounts Center demo. Auth is cookie-based: " +
      "login/register set httpOnly cookies that authorise subsequent requests.",
  },
  servers: [{ url: "/", description: "Same-origin" }],
  tags: [
    { name: "Auth" },
    { name: "Profile" },
    { name: "Connected accounts" },
    { name: "Security" },
    { name: "Privacy" },
    { name: "Activity" },
    { name: "Devices" },
    { name: "Dashboard" },
    { name: "Admin" },
  ],
  components: {
    schemas: {
      Success: {
        type: "object",
        properties: { success: { type: "boolean", example: true }, data: {} },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          details: { type: "object", nullable: true },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string", nullable: true },
          dateOfBirth: { type: "string", format: "date-time", nullable: true },
          avatarUrl: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Credentials: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "demo@accounts.dev" },
          password: { type: "string", example: "Password123" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Jordan Rivera" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "409": { description: "Email already in use" },
          "422": { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Credentials" },
            },
          },
        },
        responses: {
          "200": { description: "Signed in (sets auth cookies)" },
          "401": { description: "Incorrect email or password" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out of the current session",
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh the access token",
        responses: {
          "200": { description: "Refreshed" },
          "401": { description: "Invalid/expired refresh token" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset (mock)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: { "200": { description: "Generic confirmation" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current user",
        responses: {
          "200": { description: "Current user" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/api/auth/verify-email/request": {
      post: {
        tags: ["Auth"],
        summary: "Request an email verification link (mock)",
        responses: {
          "200": { description: "Verification token issued" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/api/auth/verify-email/confirm": {
      post: {
        tags: ["Auth"],
        summary: "Confirm email verification",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: { token: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Email verified" },
          "400": { description: "Invalid or expired token" },
        },
      },
    },
    "/api/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get profile",
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorised" } },
      },
      patch: {
        tags: ["Profile"],
        summary: "Update profile",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                  dateOfBirth: { type: "string", format: "date-time" },
                  avatarUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Updated" }, "409": { description: "Email taken" } },
      },
    },
    "/api/accounts": {
      get: {
        tags: ["Connected accounts"],
        summary: "List connected accounts",
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Connected accounts"],
        summary: "Connect an account (mock)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["provider", "providerUsername"],
                properties: {
                  provider: {
                    type: "string",
                    enum: ["FACEBOOK", "INSTAGRAM", "WHATSAPP"],
                  },
                  providerUsername: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Connected" }, "409": { description: "Already connected" } },
      },
    },
    "/api/accounts/{id}": {
      delete: {
        tags: ["Connected accounts"],
        summary: "Remove a connected account",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Removed" }, "404": { description: "Not found" } },
      },
    },
    "/api/security": {
      get: {
        tags: ["Security"],
        summary: "Get security status",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/security/password": {
      patch: {
        tags: ["Security"],
        summary: "Change password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Updated" }, "400": { description: "Wrong current password" } },
      },
    },
    "/api/security/two-factor": {
      patch: {
        tags: ["Security"],
        summary: "Enable/disable two-factor (mock)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["enabled"],
                properties: { enabled: { type: "boolean" } },
              },
            },
          },
        },
        responses: { "200": { description: "Updated" } },
      },
    },
    "/api/security/sessions": {
      get: {
        tags: ["Security"],
        summary: "List active sessions",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/security/sessions/{id}": {
      delete: {
        tags: ["Security"],
        summary: "Revoke a session",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Revoked" } },
      },
    },
    "/api/security/logout-all": {
      post: {
        tags: ["Security"],
        summary: "Sign out of all devices",
        responses: { "200": { description: "Done" } },
      },
    },
    "/api/privacy": {
      get: {
        tags: ["Privacy"],
        summary: "Get privacy settings",
        responses: { "200": { description: "OK" } },
      },
      patch: {
        tags: ["Privacy"],
        summary: "Update privacy settings",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  profileVisibility: { type: "string", enum: ["PUBLIC", "FRIENDS", "PRIVATE"] },
                  emailVisibility: { type: "string", enum: ["PUBLIC", "FRIENDS", "PRIVATE"] },
                  phoneVisibility: { type: "string", enum: ["PUBLIC", "FRIENDS", "PRIVATE"] },
                  personalizedAds: { type: "boolean" },
                  dataSharing: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Updated" } },
      },
    },
    "/api/activity": {
      get: {
        tags: ["Activity"],
        summary: "List activity (paginated, filterable)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "LOGIN",
                "LOGOUT",
                "PASSWORD_CHANGE",
                "PROFILE_UPDATE",
                "ACCOUNT_CONNECTED",
                "ACCOUNT_REMOVED",
                "PRIVACY_UPDATE",
                "TWO_FACTOR_TOGGLE",
                "DEVICE_REMOVED",
              ],
            },
          },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/devices": {
      get: {
        tags: ["Devices"],
        summary: "List active devices",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/devices/{id}": {
      delete: {
        tags: ["Devices"],
        summary: "Remove a device session",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "Removed" } },
      },
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Aggregated dashboard overview",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin only)",
        description: "Requires an ADMIN role — returns 403 for regular users.",
        responses: {
          "200": { description: "OK" },
          "403": { description: "Admin access required" },
        },
      },
    },
  },
} as const;
