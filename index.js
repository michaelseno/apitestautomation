const expect = require('chai').expect; // chai expect for validation
const supertest = require('supertest'); // supertest for api url
let api = supertest('http://localhost:51544'); // init for api url
let newID; // place holder for order id

describe('API Test Automation', function () {
    // Test for Place Order endpoint
    it('Place Order Test should return 201 reponse', async function () {
        this.timeout(5000);
        await api.post('/v1/orders')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send({
            id: "11",
            orderAt: "2019-09-03T13:00:00.000Z",
            fare: {
                amount: "130.00",
                currency: "HKD"
            },
            drivingDistancesInMeters: [ 2300, 1640],
            stops: [
                { lat: 22.344674, lng: 114.124651 },
                { lat: 22.375384, lng: 114.182446 },
                { lat: 22.385669, lng: 114.186962 },
            ]
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
            newID = response.body.id;
        });
    });
    
    // Test for Fetch Order Details endpoint with expected 200 response status (correct order id)
    it('Fetch Order Details and Should return Response 200 with Body', async function () {
        this.timeout(5000);
        await api.get(`/v1/orders/${newID}`)
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            expect(response.status, 'ASSIGNING');
        });
    });

    // Test for Fetch Order Details endpoint with expected 404 response status (order id does not exist)
    it('Fetch Order which does not exist should return 404', async function () {
        this.timeout(5000);
        await api.get(`/v1/orders/${newID + 1}`)
        .set('Accept', 'application/json')
        .expect(404)
        .then(response => {
            expect(response.message, 'ORDER_NOT_FOUND');
        });
    });

    // Test for Driver to Take the Order endpoint with expected 200 response status (correct order id)
    it('Take Order which is still on ASSIGNING status should return Response 200 with body', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID}/take`)
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            expect(response.status, 'ONGOING');
        });
    });

    // Test for Driver to Take the Order endpoint with expected 404 response status (order id does not exist)
    it('Take Order which does not exist should return 404', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID + 1}/take`)
        .set('Accept', 'application/json')
        .expect(404)
        .then(response => {
            expect(response.message, 'ORDER_NOT_FOUND');
        });
    });

    // Test for Driver to Take the Order endpoint with expected 422 response status (violated the logic flow)
    it('Take Order which is already taken and has ONGOING status should return Response 422', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID}/take`)
        .set('Accept', 'application/json')
        .expect(422)
        .then(response => {
            expect(response.message, 'Order status is not ASSIGNING');
        });
    });

    // Test for Driver to Complete the Order endpoint with expected 200 response status (correct order id)
    it('Complete Order which is still on ONGOING status should return Response 200 with body', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID}/complete`)
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            expect(response.status, 'COMPLETED');
        });
    });

    // Test for Driver to Complete the Order endpoint with expected 404 response status (order id does not exist)
    it('Complete Order which does not exist should return 404', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID + 1}/complete`)
        .set('Accept', 'application/json')
        .expect(404)
        .then(response => {
            expect(response.message, 'ORDER_NOT_FOUND');
        });
    });

    // Test for Driver to Complete the Order endpoint with expected 422 response status (violated the logic flow)
    it('Complete Order which is already has COMPLETED status should return Response 422', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID}/complete`)
        .set('Accept', 'application/json')
        .expect(422)
        .then(response => {
            expect(response.message, 'Order status is not ONGOING');
        });
    });

    // Test for Cancel Order endpoint with expected 422 response status (violated the logic flow)
    it('Cancel Order which is already COMPLETED status should return Response 422', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID}/cancel`)
        .set('Accept', 'application/json')
        .expect(422)
        .then(response => {
            expect(response.message, 'Order status is COMPLETED already');
        });
    });

    // Test for Cancel Order endpoint with expected 200 response status (correct order id)
    it('Cancel Order which is still on ASSIGNING status should return Response 200 with body', async function () {
        this.timeout(5000);
        await api.post('/v1/orders')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send({
            id: "11",
            orderAt: "2019-09-03T13:00:00.000Z",
            fare: {
                amount: "130.00",
                currency: "HKD"
            },
            drivingDistancesInMeters: [ 2300, 1640],
            stops: [
                { lat: 22.344674, lng: 114.124651 },
                { lat: 22.375384, lng: 114.182446 },
                { lat: 22.385669, lng: 114.186962 },
            ]
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
            newID = response.body.id;
            expect(response.status, 'ASSIGNING');
        });
        await api.put(`/v1/orders/${newID}/cancel`)
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            expect(response.status, 'CANCELLED');
        });
    });

    // Test for Cancel Order endpoint with expected 200 response status (correct order id)
    it('Cancel Order which is still ONGOING status should return Response 200 with body', async function () {
        this.timeout(5000);
        await api.post('/v1/orders')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send({
            id: "11",
            orderAt: "2019-09-03T13:00:00.000Z",
            fare: {
                amount: "130.00",
                currency: "HKD"
            },
            drivingDistancesInMeters: [ 2300, 1640],
            stops: [
                { lat: 22.344674, lng: 114.124651 },
                { lat: 22.375384, lng: 114.182446 },
                { lat: 22.385669, lng: 114.186962 },
            ]
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
            newID = response.body.id;
            expect(response.status, 'ASSIGNING');
        });
        await api.put(`/v1/orders/${newID}/take`)
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            expect(response.status, 'ONGOING');
        });
        await api.put(`/v1/orders/${newID}/cancel`)
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            expect(response.status, 'CANCELLED');
        });
    });

    // Test for Cancel Order endpoint with expected 404 response status (order id does not exist)
    it('Cancel Order which does not exist should return 404', async function () {
        this.timeout(5000);
        await api.put(`/v1/orders/${newID + 1}/cancel`)
        .set('Accept', 'application/json')
        .expect(404)
        .then(response => {
            expect(response.message, 'ORDER_NOT_FOUND');
        });
    });
});