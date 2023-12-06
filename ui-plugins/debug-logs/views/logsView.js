// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Backbone = require('backbone');
  var ApiCollection = require('core/collections/apiCollection');
  var OriginView = require('core/views/originView');

  var LogsView = OriginView.extend({
    tagName: 'div',
    className: 'logs',

    initialize: function(options) {
      this.model = new Backbone.Model({
        logs: new ApiCollection({ url: '/api/logs' })
      });
      OriginView.prototype.initialize.apply(this, arguments);
    }
  }, {
    template: 'logs'
  });

  return LogsView;
});
