const mongoose = require("mongoose");
const request = require("supertest");
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const { Movie } = require("../../../models/movie");
const moment = require("moment");

// POST /api/returns {customerId, movieId}

// Negative Test Cases
// Return 401 if client is not logged in
// Return 400 if customer ID is not provided
// Return 400 if movie ID is not provided
// Return 404 if no rental for this customer/movie
// Return 400 if Rental already processed

// Happy Path Test Cases
//Should return 200 if valid request
// Set the return Date
// Calculate the rental fee
// Increase in stock
// Return the rental (DateIn, DateOut, Rental fee etc)

fdescribe("/api/returns", () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const execute = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({
        customerId,
        movieId,
      });
  };

  beforeEach(async () => {
    server = require("../../../index");
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: '12345',
      dailyRentalRate: 2,
      genre: {name : '12345'},
      numberInStock: 10
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });
    await rental.save();
  });
  afterEach(async () => {
    await Rental.remove({});
    await Movie.remove({});
    await server.close();
  });

  it("should return 401 if client is not logged in", async () => {
    token = "";

    const res = await execute();

    expect(res.status).toBe(401);
  });

  it("should return 400 if customer ID is not provided", async () => {
    customerId = "";

    const res = await execute();

    expect(res.status).toBe(400);
  });

  it("should return 400 if movie ID is not provided", async () => {
    movieId = "";

    const res = await execute();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental for this customer/movie", async () => {
    await Rental.remove({});

    const res = await execute();

    expect(res.status).toBe(404);
  });

  it("should return 400 if rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await execute();

    expect(res.status).toBe(400);
  });

  it("should return 200 if we have a valid request", async () => {
    const res = await execute();

    expect(res.status).toBe(200);
  });

  it("should set returnDate if we have a valid request", async () => {
    const res = await execute();

    const rentalInDb = await Rental.findById(rental._id);

    const diff = new Date() - rentalInDb.dateReturned;

    expect(rentalInDb.dateReturned).toBeDefined();
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set rental fee if input is valid", async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();

    const res = await execute();

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should increse movie stock if input is valid", async () => {
    const res = await execute();

    const movieInDb = await Movie.findById(movieId);

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental if input is valid", async () => {
    const res = await execute();
    const rentalInDb = await Rental.findById(rental._id);

    expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
      'dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'
    ]));
  });
});

