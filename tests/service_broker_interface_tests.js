var should = require('should'),
    request = require('supertest'),
    Guid = require('guid'),
    kvs = require('keyvalue-xyz'),
    app = require('./../app');

describe('Service Broker Interface', function() {

    const instanceId = Guid.create().value;
    const bindingId = Guid.create().value;
    const organizationGuid = Guid.create().value;
    const spaceGuid = Guid.create().value;
    const appGuid = Guid.create().value;
    const apiVersion = '2.11';

    var server = null;
    var brokerServiceId = null;
    var simplePlanId = null;
    var complexPlanId = null;

    before(function(done) {
        app.start(function(s, sbInterface) {
            server = s;
            var serviceBroker = sbInterface.getServiceBroker();
            brokerServiceId = serviceBroker.getID();
            serviceBroker.getPlans().forEach(function(plan) {
                switch (plan.name) {
                    case 'simple':
                        simplePlanId = plan.id;
                        break;
                    case 'complex':
                        complexPlanId = plan.id;
                        break;
                    default:
                        break;
                }
            });
            done();
        });
    });

    after(function(done) {
        server.close();
        done();
    });

    describe('catalog', function() {

        it('should fetch the catalog', function(done) {
            request(server)
                .get('/v2/catalog')
                .set('X-Broker-Api-Version', apiVersion)
                .expect(200)
                .then(response => {
                    should.exist(response.body.services);
                    var services = response.body.services;
                    services.should.have.length(1);
                    should.exist(services[0].name);
                    should.exist(services[0].description);
                    should.exist(services[0].id);
                    should.exist(services[0].tags);
                    should.exist(services[0].bindable);
                    should.exist(services[0].plan_updateable);
                    should.exist(services[0].plans);
                    var plans = services[0].plans;
                    plans.should.have.length(2);
                    should.exist(plans[0].id);
                    should.exist(plans[0].name);
                    should.exist(plans[0].description);
                    should.exist(plans[0].free);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

    });

    describe('service instances', function() {

        it('should create service instance', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: simplePlanId,
                    parameters: {},
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    response.body.should.be.type('object');
                    response.body.should.have.property('dashboard_url');
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service instance without required parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service instance without invalid serviceId', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: Guid.create().value,
                    plan_id: simplePlanId,
                    parameters: {},
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service instance without invalid planId', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: Guid.create().value,
                    parameters: {},
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should update service instance', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: simplePlanId,
                    parameters: {}
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    (response.body).should.be.empty();
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to update service instance without required parameters', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to update service instance with invalid serviceId', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: Guid.create().value,
                    plan_id: simplePlanId,
                    parameters: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to update service instance with invalid planId', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: Guid.create().value,
                    parameters: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should delete service instance', function(done) {
            console.log('Deleting service instance %s with params %s %s', instanceId, brokerServiceId, simplePlanId);
            request(server)
                .delete('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .query({
                    service_id: brokerServiceId,
                    plan_id: simplePlanId
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    (response.body).should.be.empty();
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to delete service instance without required parameters', function(done) {
            request(server)
                .delete('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

    });

    describe('service bindings', function() {

        beforeEach(function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: simplePlanId,
                    parameters: {},
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should create service binding', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: simplePlanId,
                    app_guid: appGuid,
                    bind_resource: {},
                    parameters: {}
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    response.body.should.be.type('object');
                    response.body.should.have.property('credentials');
                    response.body.credentials.should.have.property('username');
                    response.body.credentials.should.have.property('password');
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service binding without required parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service binding with invalid serviceId', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: Guid.create().value,
                    plan_id: simplePlanId,
                    app_guid: appGuid,
                    bind_resource: {},
                    parameters: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service binding with invalid planId', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: Guid.create().value,
                    app_guid: appGuid,
                    bind_resource: {},
                    parameters: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should delete service binding', function(done) {
            request(server)
                .delete('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .query({
                    service_id: brokerServiceId,
                    plan_id: simplePlanId
                })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    (response.body).should.be.empty();
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to delete service binding without required parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to delete service binding with invalid serviceId', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .query({
                    service_id: Guid.create().value,
                    plan_id: simplePlanId
                })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to delete service binding with invalid planId', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .query({
                    service_id: brokerServiceId,
                    plan_id: Guid.create().value
                })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

    });

    describe('dashboard', function() {

        it('should show dashboard', function(done) {
            request(server)
                .get('/dashboard')
                .expect(200, done);
        });

    });

    describe('service instance paramter validation', function() {

        let validParameters = { name: 'special-broker' };
        let invalidParameters = { foo: 'bar' };

        it('should create service instance with valid parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    parameters: validParameters,
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    response.body.should.be.type('object');
                    response.body.should.have.property('dashboard_url');
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service instance with invalid parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    parameters: invalidParameters,
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service instance with no parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should update service instance with valid parameters', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    parameters: validParameters
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    (response.body).should.be.empty();
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to update service instance with invalid parameters', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    parameters: invalidParameters
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to update service instance with no parameters', function(done) {
            request(server)
                .patch('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

    });

    describe('service binding parameter validation', function() {

        let validParameters = { name: 'special-broker' };
        let invalidParameters = { foo: 'bar' };

        beforeEach(function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    parameters: {},
                    accepts_incomplete: true,
                    organization_guid: organizationGuid,
                    space_guid: spaceGuid,
                    context: {},
                    parameters: validParameters
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should create service binding with valid parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    app_guid: appGuid,
                    bind_resource: {},
                    parameters: validParameters
                 })
                .expect(200)
                .then(response => {
                    should.exist(response.body);
                    response.body.should.be.type('object');
                    response.body.should.have.property('credentials');
                    response.body.credentials.should.have.property('username');
                    response.body.credentials.should.have.property('password');
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service binding with invalid parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    app_guid: appGuid,
                    bind_resource: {},
                    parameters: invalidParameters
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should fail to create service binding with no parameters', function(done) {
            request(server)
                .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
                .set('X-Broker-Api-Version', apiVersion)
                .send({
                    service_id: brokerServiceId,
                    plan_id: complexPlanId,
                    app_guid: appGuid,
                    bind_resource: {}
                 })
                .expect(400)
                .then(response => {
                    should.exist(response.body);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

    });

    describe('clean', function(done) {
        request(server)
            .get('/admin/clean')
            .expect(200)
            .then(response => {
                done();
            })
            .catch(error => {
                done(error)
            });
    });

});
