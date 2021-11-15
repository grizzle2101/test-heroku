const {User} = require('../../../models/user');
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

describe('user.generateAuthToken', () => {


    it('should return a valid JWT', () => {
        //Arrange
        const payload = new User({
            _id: new mongoose.Types.ObjectId, 
            isAdmin: true
        });

        //Act
        const token = payload.generateAuthToken();
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

        //Assert
        expect(decoded._id).toEqual(payload._id.toString());
    })
})