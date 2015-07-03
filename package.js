Package.describe({
  name: 'jeanfredrik:text-filter-selector',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Create a text filter selector for use in collection.find',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  // api.use();
  api.addFiles('text-filter-selector.js', 'client');
  api.export(['TextFilterSelector'], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('jeanfredrik:text-filter-selector');
  api.addFiles('text-filter-selector-tests.js');
});
