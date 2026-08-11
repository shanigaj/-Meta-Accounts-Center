// Provide the JWT secrets before any module that reads them at import time.
process.env.JWT_ACCESS_SECRET ??= "test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret";
process.env.ACCESS_TOKEN_TTL_MIN ??= "15";
process.env.REFRESH_TOKEN_TTL_DAYS ??= "7";
