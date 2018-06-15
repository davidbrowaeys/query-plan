(function () {

  'use strict';
  exports.topics = [{
    name: 'query',
    description: 'query optimizer'
  }];

  exports.namespace = {
    name: 'dbx',
    description: 'Salesforce Query Optimizer'
  };

  exports.commands = [
    require('./commands/data/query_explain.js')
  ];
}());