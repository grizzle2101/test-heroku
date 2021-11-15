const mongoose = require("mongoose");
const request = require("supertest");
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");
let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await Genre.remove({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.some((genre) => genre.name === "genre1")).toBeTruthy();
      expect(res.body.some((genre) => genre.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if a valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if an invalid id is passed", async () => {
      const id = mongoose.Types.ObjectId();

      const res = await request(server).get("/api/genres/" + id);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const execute = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name,
        });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return a 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();

      expect(res.status).toBe(401);
    });

    it("should return a 400 if genre is less than 5 characters", async () => {
      name = "aaa";

      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return a 400 if genre is greater than 50 characters", async () => {
      name = new Array(52).join("a").toString();

      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await execute();

      const result = await Genre.find({ name: "genre1" });

      expect(result).not.toBe(null);
    });

    it("should return the genre if it is valid", async () => {
      const res = await execute();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name");
    });
  });

  describe("PUT /", () => {
    let token;
    let name;
    let genre;
    let id;

    const execute = async () => {
      await genre.save();

      //Send PUT request
      return await request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({
          name,
        });
    };

    beforeEach(() => {
      //Congifureable Test Parameters
      token = new User().generateAuthToken();
      name = "genre1";
      genre = new Genre({ name: "genre1" });
      id = genre._id;
    });

    it("should return 400 if Genre is not valid", async () => {
      name = "aaa";

      const res = await execute();

      expect(res.status).toBe(400);
    });

    it("should return 404 if Genre is not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should return an updated genre when passed a valid genre", async () => {
      name = "genre2";

      const res = await execute();

      expect(res.body).toMatchObject({ name: "genre2" });
    });
  });

  describe("DELETE /", () => {
    let token;
    let name;
    let genre;
    let id;

    const execute = async () => {
      await genre.save();

      //Send DELETE request
      return await request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({
          name,
        });
    };

    beforeEach(() => {
      //Congifureable Test Parameters
      token = new User().generateAuthToken();
      name = "genre1";
      genre = new Genre({ name: "genre1" });
      id = genre._id;
    });

    it("should return 404 when the Genre not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await execute();

      expect(res.status).toBe(404);
    });

    it("should return a Deleted genre when passed a valid genre", async () => {
      const res = await execute();

      expect(res.body).toMatchObject({ name: "genre1" });
    });
  });

  //Additional Tests - Middleware Functions Auth, Admin & validateObjectId?
  //-Best to test these seperately.
});
