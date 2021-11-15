const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
const request = require("supertest");

describe("auth middleware", () => {
  let token;
  let server;

  const execute = async () => {
    return await request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    server = require("../../../index");
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await Genre.remove({});
    await server.close();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";

    const res = await execute();

    expect(res.status).toBe(401);
  });

  it("should return 200 if token is valid", async () => {
    const res = await execute();

    expect(res.status).toBe(200);
  });
});
