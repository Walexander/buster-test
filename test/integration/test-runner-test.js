if (typeof require != "undefined") {
    var testCase = require("buster-util").testCase;
    var sys = require("sys");
    var sinon = require("sinon");
    var sys = require("sys"); 

    var buster = {
        assert: require("buster-assert"),
        testCase: require("buster-test/test-case"),
        spec: require("buster-test/spec"),
        testRunner: require("buster-test/test-runner"),
        util: require("buster-util")
    };
}

(function () {
    function recordEvents(runner) {
        var contexts = [];
        var events = [];

        runner.on("context:start", function (context) {
            contexts.push(context.name);
            events.push("start: " + context.name);
        });

        runner.on("context:end", function (context) {
            contexts.pop();
            events.push("end: " + context.name);
        });

        runner.on("test:setUp", function (test) {
            events.push("setUp: " + contexts.join(" ") + " " + test.name);
        });

        runner.on("test:tearDown", function (test) {
            events.push("tearDown: " + contexts.join(" ") + " " + test.name);
        });

        runner.on("test:start", function (test) {
            events.push("start: " + contexts.join(" ") + " " + test.name);
        });

        runner.on("test:error", function (result) {
            events.push("error: " + contexts.join(" ") + " " + result.name);
        });

        runner.on("test:fail", function (result) {
            events.push("failed: " + contexts.join(" ") + " " + result.name);
        });

        runner.on("test:success", function (test) {
            events.push("passed: " + contexts.join(" ") + " " + test.name);
        });

        return events;
    }

    testCase("TestRunnerIntegrationTest", {
        "should emit all test case events in proper order": function () {
            var assertionError = new Error("Test failed");
            assertionError.name = "AssertionError";
            var error = new Error("Oops");

            var context = buster.testCase("TestCase", {
                setUp: function () {},
                tearDown: function () {},
                test1: function () {},
                test2: sinon.stub().throws(assertionError),

                context1: {
                    setUp: function () {},
                    tearDown: function () {},
                    test11: sinon.stub().throws(error),
                    test12: function () {}
                },

                context2: {
                    setUp: function () {},
                    tearDown: function () {},
                    test21: function () {},
                    test22: function () {}
                }
            });

            var runner = buster.util.create(buster.testRunner);
            var events = recordEvents(runner);
            runner.run(context);

            var expected = "start: TestCase\n" +
                "setUp: TestCase test1\n" +
                "start: TestCase test1\n" +
                "tearDown: TestCase test1\n" +
                "passed: TestCase test1\n" +
                "setUp: TestCase test2\n" +
                "start: TestCase test2\n" +
                "tearDown: TestCase test2\n" +
                "failed: TestCase test2\n" +
                "start: context1\n" +
                "setUp: TestCase context1 test11\n" +
                "start: TestCase context1 test11\n" +
                "tearDown: TestCase context1 test11\n" +
                "error: TestCase context1 test11\n" +
                "setUp: TestCase context1 test12\n" +
                "start: TestCase context1 test12\n" +
                "tearDown: TestCase context1 test12\n" +
                "passed: TestCase context1 test12\n" +
                "end: context1\n" +
                "start: context2\n" +
                "setUp: TestCase context2 test21\n" +
                "start: TestCase context2 test21\n" +
                "tearDown: TestCase context2 test21\n" +
                "passed: TestCase context2 test21\n" +
                "setUp: TestCase context2 test22\n" +
                "start: TestCase context2 test22\n" +
                "tearDown: TestCase context2 test22\n" +
                "passed: TestCase context2 test22\n" +
                "end: context2\n" +
                "end: TestCase";

            buster.assert.equals(expected, events.join("\n"));
        },

        "should emit all spec events in proper order": function () {
            var assertionError = new Error("Test failed");
            assertionError.name = "AssertionError";
            var error = new Error("Oops");

            var context = buster.spec("TestCase", function (should) {
                this.before(function () {});
                this.after(function () {});
                should("test1", function () {});
                should("test2", sinon.stub().throws(assertionError));

                this.context("context1", function (should) {
                    this.before(function () {});
                    this.after(function () {});
                    should("test11", sinon.stub().throws(error));
                    should("test12", function () {});
                });

                this.context("context2", function (should) {
                    this.before(function () {});
                    this.after(function () {});
                    should("test21", function () {});
                    should("test22", function () {});
                });
            });

            var runner = buster.util.create(buster.testRunner);
            var events = recordEvents(runner);
            runner.run(context);

            var expected = "start: TestCase\n" +
                "setUp: TestCase test1\n" +
                "start: TestCase test1\n" +
                "tearDown: TestCase test1\n" +
                "passed: TestCase test1\n" +
                "setUp: TestCase test2\n" +
                "start: TestCase test2\n" +
                "tearDown: TestCase test2\n" +
                "failed: TestCase test2\n" +
                "start: context1\n" +
                "setUp: TestCase context1 test11\n" +
                "start: TestCase context1 test11\n" +
                "tearDown: TestCase context1 test11\n" +
                "error: TestCase context1 test11\n" +
                "setUp: TestCase context1 test12\n" +
                "start: TestCase context1 test12\n" +
                "tearDown: TestCase context1 test12\n" +
                "passed: TestCase context1 test12\n" +
                "end: context1\n" +
                "start: context2\n" +
                "setUp: TestCase context2 test21\n" +
                "start: TestCase context2 test21\n" +
                "tearDown: TestCase context2 test21\n" +
                "passed: TestCase context2 test21\n" +
                "setUp: TestCase context2 test22\n" +
                "start: TestCase context2 test22\n" +
                "tearDown: TestCase context2 test22\n" +
                "passed: TestCase context2 test22\n" +
                "end: context2\n" +
                "end: TestCase";

            buster.assert.equals(expected, events.join("\n"));
        }
    });
}());