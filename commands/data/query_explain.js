const request = require('request');
const exec = require('child_process').execSync;

function queryPlan(query, accessToken, instanceUrl) {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
            'X-SFDC-Session': accessToken
        },
        url: instanceUrl + '/services/data/v43.0/query/?explain=' + query,
        json: true
    };
    request(options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var Table = require('cli-table');
                var table = new Table({
                    head: ['Cardinality', 'Fields', 'Leading \nOperation Type', 'Relative Cost', 'Object Cardinality', 'Object Type'],
                    colWidths: [20, 50, 20, 20, 20, 20]
                });
                var noteTable = new Table({
                    head: ['Description', 'Fields', 'TableEnumOrId'],
                    colWidths: [70, 30, 30]
                });
                for (var i = 0; i < body.plans.length; i++) {
                    table.push([
                        body.plans[i].cardinality,
                        body.plans[i].fields.toString(),
                        body.plans[i].leadingOperationType,
                        body.plans[i].relativeCost,
                        body.plans[i].sobjectCardinality,
                        body.plans[i].sobjectType
                    ]);

                    for (var n = 0; n < body.plans[i].notes.length; n++) {
                        noteTable.push([
                            body.plans[i].notes[n].description,
                            body.plans[i].notes[n].fields.toString(),
                            body.plans[i].notes[n].tableEnumOrId
                        ]);
                    }
                }
                console.log(table.toString());
                console.log('=== Notes');
                console.log(noteTable.toString());
            } else {
                console.log('Unexpected Error!');
                console.log(response);
            }
        }
    );
}

(function () {
    'use strict';

    module.exports = {
        topic: 'query',
        command: 'explain',
        description: 'Query optimizer',
        help: 'help text for dbx:query:explain',
        flags: [{
            name: 'orgname',
            char: 'u',
            description: 'name of scratch org',
            hasValue: true,
            required: true
        }, {
            name: 'query',
            char: 'q',
            description: 'SOQL',
            hasValue: true,
            required: true
        }],
        run(context) {
            let orgname = context.flags.orgname;
            let query = context.flags.query;
            let stdout = JSON.parse(exec(`sfdx force:org:display -u ${orgname} --json`).toString());

            const accessToken = stdout.result.accessToken;
            const instanceUrl = stdout.result.instanceUrl;

            queryPlan(query, accessToken, instanceUrl);
        }
    };
}());
