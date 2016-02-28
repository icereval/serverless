'use strict';

/**
 * Test: Serverless Project Class
 */

let Serverless = require('../../../lib/Serverless.js'),
    path       = require('path'),
    utils      = require('../../../lib/utils/index'),
    assert     = require('chai').assert,
    testUtils  = require('../../test_utils'),
    config     = require('../../config');

let serverless;
let instance;

describe('Test Serverless Project Class', function() {
    this.timeout(0);

    before(function() {
        return testUtils.createTestProject(config)
            .then(projectPath => {
                process.chdir(projectPath);

                serverless = new Serverless({
                    projectPath,
                    interactive: false
                });

                return serverless.init()
                    .then(function() {

                        instance = serverless.getProject();
                    });
            });
    });

    describe('Tests', function() {

        it('Get instance data, without project properties', function() {
            let clone = instance.toObject();
            assert.equal(true, typeof clone._class === 'undefined');
            assert.equal(true, typeof clone.variables._class === 'undefined');
            assert.equal(true, typeof clone.templates._class === 'undefined');
        });

        it('Get populated instance data', function() {
          let data = instance.toObjectPopulated({ stage: config.stage, region: config.region });
          assert.equal(true, JSON.stringify(data).indexOf('$${') == -1);
          assert.equal(true, JSON.stringify(data).indexOf('${') == -1);

          /*============================================================================
          *   Populated project data no longer populates its components and functions.
          *   So I don't think we need the following tests here, and we should test them
          *   in their respective class tests - Eslam @ Feb 28 2016
          *============================================================================*/

          //assert.isDefined(data.components.nodejscomponent.functions.function1.endpoints[0].requestTemplates['application/json'].httpMethod);
          //// Component template
          //assert.equal(true, typeof data.components.nodejscomponent.functions.function1.endpoints[0].requestTemplates['application/json'].headerParams !== 'undefined');
          //// Module template
          //assert.equal(true, typeof data.components.nodejscomponent.functions.function1.endpoints[0].requestTemplates['application/json'].queryParams !== 'undefined');
          //
          //// Test relative template inheritance
          //// These functions have their own s-templates.json files which give them the same template, with one different property
          //
          //// Function1 template
          //assert.equal(data.components.nodejscomponent.functions.function1.endpoints[0].requestTemplates['application/json'].pathParams, "$input.path('$.id1')");
          //// Function2 template
          //assert.equal(true, data.components.nodejscomponent.functions.function2.endpoints[0].requestTemplates['application/json'].pathParams === "$input.path('$.id2')");
          //// Function3 template - s-templates.json left undefined
          //assert.equal(true, typeof data.components.nodejscomponent.functions.function3.endpoints[0].requestTemplates['application/json'].pathParams === 'undefined');
        });

        //
        it('Get functions w/o paths', function() {
          let functions = instance.getAllFunctions();
          assert.equal(true, functions.length === 5);
        });

        it('Get function by name', function() {
          let func = instance.getFunction( 'function1' );
          assert.isDefined(func);
        });

        it('Get all components', function() {
          let components = instance.getAllComponents();
          assert.equal(components[0].name, 'nodejscomponent');
          assert.lengthOf(components, 1);
        });

        it('Get components by name', function() {
          let component = instance.getComponent('nodejscomponent');
          assert.equal(component.name, 'nodejscomponent');
        });

        it('Get all events', function() {
          let events = instance.getAllEvents();
          assert.equal(true, events.length === 4);
        });

        it('Get event by name', function() {
          let event = instance.getEvent('s3');
          assert.isDefined(event);
        });

        it('Get all endpoints', function() {
          let endpoints = instance.getAllEndpoints();
          assert.lengthOf(endpoints, 7);
        });

        it('Get endpoints by path and method', function() {
          let endpoint = instance.getEndpoint('group1/function1', 'GET');
          assert.isDefined(endpoint);
        });

        it('Get resources (unpopulated)', function() {
          let resources = instance.getAllResources().toObject();
          assert.equal(true, JSON.stringify(resources).indexOf('${') !== -1);
          assert.equal(true, JSON.stringify(resources).indexOf('fakeBucket') !== -1);
        });

        it('Get resources (populated)', function() {
          let resources = instance.getAllResources().toObjectPopulated({populate: true, stage: config.stage, region: config.region})
          assert.equal(true, JSON.stringify(resources).indexOf('$${') == -1);
          assert.equal(true, JSON.stringify(resources).indexOf('${') == -1);
          assert.equal(true, JSON.stringify(resources).indexOf('fakeBucket') !== -1);
        });

        it('Validate region exists', function() {
          assert.equal(true, instance.validateRegionExists(config.stage, config.region));
          assert.equal(false, instance.validateRegionExists(config.stage, 'invalid'));
        });

        it('Validate stage exists', function() {
          assert.equal(true, instance.validateStageExists(config.stage));
          assert.equal(false, instance.validateStageExists('invalid'));
        });

        it('Get regions', function() {
          let regions = instance.getAllRegions(config.stage);
          assert.equal(true, regions[0].getName() === config.region);
        });

        it('Get stages', function() {
          let stages = instance.getAllStages();
          assert.equal(true, stages[0].name === config.stage);
        });

        it('Set instance data', function() {
            let clone = instance.toObject();
            clone.name = 'newProject';
            instance.fromObject(clone);
            assert.equal(instance.name, 'newProject');
        });

        it('Save instance to the file system', function() {
            return instance.save();
        });

        it('Create new and save', function() {
          let project = new serverless.classes.Project(serverless);
          return project.save()
            .then(function() {
              return project.load();
            });
        });
    });
});