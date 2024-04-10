const request = require('supertest');

const app = require('../server'); // Assuming your index.js is in the parent directory

const UserModel = require('../models/Users');

const bcrypt = require('bcryptjs');

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

describe('User Registration', () => {
    // Clear the database before running tests

    beforeAll(async () => {

        await UserModel.deleteMany({});

    });



    it('should register a new user', async () => {

        const res = await request(app)

            .post('/signup')

            .send({ email: 'test@example.com', password: 'testpassword' });

        expect(res.statusCode).toEqual(201);

        expect(res.body).toHaveProperty('message', 'User created successfully.');

        // Check if the user is actually saved in the database

        const user = await UserModel.findOne({ email: 'test@example.com' });

        expect(user).toBeDefined();

    });



    it('should return an error if the password is too short', async () => {

        const res = await request(app)

            .post('/signup')

            .send({ email: 'test2@example.com', password: 'short' });



        expect(res.statusCode).toEqual(400);

        expect(res.body).toHaveProperty('message', 'Password must be at least 8 characters long.');

    });



    it('should return an error if the email is already registered', async () => {

        const res = await request(app)

            .post('/signup')

            .send({ email: 'test@example.com', password: 'testpassword' });



        expect(res.statusCode).toEqual(400);

        expect(res.body).toHaveProperty('message', 'An account with this email already exists.');

    });

});



describe('User Login', () => {

    // Clear the database before running tests

    beforeAll(async () => {

        await UserModel.deleteMany({});

        // Create a test user for login

        const hashedPassword = await bcrypt.hash('testpassword', 12);

        await UserModel.create({ email: 'test@example.com', password: hashedPassword });

    });



    it('should login with correct credentials', async () => {

        const res = await request(app)

            .post('/login')

            .send({ email: 'test@example.com', password: 'testpassword' });



        expect(res.statusCode).toEqual(200);

        expect(res.body).toHaveProperty('message', 'Success');

        expect(res.body).toHaveProperty('token');

    });



    it('should return an error with incorrect password', async () => {

        const res = await request(app)

            .post('/login')

            .send({ email: 'test@example.com', password: 'wrongpassword' });



        expect(res.statusCode).toEqual(401);

        expect(res.body).toHaveProperty('message', 'The password is incorrect.');

    });



    it('should return an error with non-existent email', async () => {

        const res = await request(app)

            .post('/login')

            .send({ email: 'nonexistent@example.com', password: 'testpassword' });



        expect(res.statusCode).toEqual(404);

        expect(res.body).toHaveProperty('message', 'No account exists with this email.');

    });

});