// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  const Origin = require('core/origin');
  const LogsView = require('./views/logsView');

  Origin.trigger(`debug:addView`, { 
    name: 'logs', 
    icon: 'tasks', 
    title: Origin.l10n.t('app.logs'), 
    view: LogsView
  })
});
