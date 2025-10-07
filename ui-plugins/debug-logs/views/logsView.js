// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Backbone = require('backbone');
  var OriginView = require('core/views/originView');

  var LogsView = OriginView.extend({
    tagName: 'div',
    className: 'logs',
    events: {
      'change input': 'updateModel',
      'keydown input': 'updateModel',
      'change': 'fetchPage',
      'click .nav button': 'onNavClicked',
      'click button.refresh': 'fetchPage',
    },

    initialize: async function(options) {
      this.model = new Backbone.Model({
        allLevels: ['error', 'warn', 'success', 'info', 'debug', 'verbose'],
        levels: ['error', 'warn', 'success', 'info', 'debug', 'verbose'],
        page: 1,
        sort: { timestamp: -1 },
        limit: 50
      });
      this.listenTo(this.model, 'change:levels change:page change:sort', this.fetchPage)

      OriginView.prototype.initialize.apply(this, arguments);

      this.fetchPage();
    },

    renderLogs: function() {
      const $logs = $('.logs-container > .logs');
      $logs.empty();
      this.model.get('logs').forEach(l => $logs.append(Handlebars.partials.part_log(l)));
    },

    remove: function() {
      clearTimeout(this.fetchTimeout);
      OriginView.prototype.remove.apply(this, arguments);
    },

    waitForTimeout: async function() {
      return new Promise(resolve => {
        if(this.keyTimeout) {
          clearTimeout(this.keyTimeout);
        }
        this.keyTimeout = setTimeout(() => {
          this.keyTimeout = undefined;
          resolve();
        }, 500);
      })
    },

    updateModel: async function(e) {
      if(e.type === 'keydown') {
        await this.waitForTimeout()
      }
      const levels = [];
      const checkedInputs = this.$('.level input:checked');
      checkedInputs.each(i => levels.push($(checkedInputs[i]).attr('id')))
      
      const attributes = {
        levels,
      };
      const moduleName = this.$('#module').val();
      if(moduleName) attributes.module = moduleName;
      else this.model.unset('module');

      this.model.set(attributes);
    },

    fetchPage: async function() {
      clearTimeout(this.fetchTimeout)
      
      try {
        const query = [
          `page=${this.model.get('page')}`,
          `sort=${JSON.stringify(this.model.get('sort'))}`,
          `limit=${JSON.stringify(this.model.get('limit'))}`
        ];
        const data = {
          level: { $in: this.model.get('levels') }
        };
        if(this.model.has('module')) {
          data.module = this.model.get('module');
        }
        const logData = await $.post(`/api/logs/query?${query.join('&')}`, data, (data, status, jqXhr) => {
          const linkHeader = jqXhr.getResponseHeader('Link');
          const lastMatch = linkHeader.match(/<[^>]*=(\d+)>; rel="last"/);
          const lastPage = lastMatch && Number(lastMatch[1]);
          if(lastPage) this.model.set('lastPage', lastPage);
        });
        logData.forEach(l => l.data = l.data.map(d => JSON.stringify(d, null, 2)));

        $('.page-no').text(this.model.get('page'));
        this.model.set('logs', logData);
        this.renderLogs();

        // this.fetchTimeout = setTimeout(this.fetchPage.bind(this), 5000);

      } catch(e) {
        console.log(e);
      }
    },

    onNavClicked: function(e) {
      const val = $(e.currentTarget).attr('data-value');
      // TODO fix double fetch (model set triggering updateModel)
      if(val === 'first') {
        this.model.set('page', 1)
      } else if(val === 'last' && this.model.get('lastPage')) {
        this.model.set('page', this.model.get('lastPage'))
      } else if(val) {
        this.model.set('page', this.model.get('page') + Number(val))
      }
    }
  }, {
    template: 'logs'
  });

  return LogsView;
});
