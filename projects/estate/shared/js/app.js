(function ($) {
  'use strict';

  const ENDPOINTS = {
    properties: {
      url: 'http://localhost:3000/api/properties',
      transform: (d) => ({
        total: d.total,
        sample: (d.properties || []).slice(0, 3).map((p) => ({
          title: p.title,
          price: '$' + Number(p.price).toLocaleString(),
          location: p.location,
          status: p.status,
        })),
      }),
    },
    listings: {
      url: 'http://localhost:3000/api/listings',
      transform: (d) => ({
        total: d.total,
        sample: (d.listings || []).slice(0, 3).map((l) => ({
          title: l.title,
          price: '$' + Number(l.price).toLocaleString(),
          city: l.location && l.location.city,
          views: l.views,
        })),
      }),
    },
    graphql: {
      url: 'http://localhost:3000/graphql',
      method: 'POST',
      body: {
        query: '{ properties { title price location type status bedrooms } }',
      },
      transform: (d) => (d.data && d.data.properties) || [],
    },
    ruby: {
      url: 'http://localhost:8082/api/market-stats',
      transform: (d) => d,
    },
    php: {
      url: 'http://localhost:8081/api/graphql',
      method: 'POST',
      body: { query: '{ properties { id title price } }' },
      transform: (d) => (d.data && d.data.properties) || [],
    },
    java: {
      url: 'http://localhost:8080/api/listings',
      transform: (d) => (Array.isArray(d) ? d.slice(0, 5) : d),
    },
  };

  function renderOutput(label, payload) {
    $('#apiOutput').html(
      '<code>' +
        '// ' + label + '\n' +
        $('<div>').text(JSON.stringify(payload, null, 2)).html()
      );
  }

  $(document).ready(function () {
    loadStats();

    $('[data-endpoint]').on('click', function () {
      $(this).parent().find('.btn').removeClass('active');
      $(this).addClass('active');
      const key = $(this).data('endpoint');
      const cfg = ENDPOINTS[key];
      if (!cfg) return;

      renderOutput('loading ' + key + '...', { status: 'request in flight' });

      const ajaxCfg = { url: cfg.url, method: cfg.method || 'GET', dataType: 'json' };
      if (cfg.body) {
        ajaxCfg.contentType = 'application/json';
        ajaxCfg.data = JSON.stringify(cfg.body);
      }

      $.ajax(ajaxCfg)
        .done(function (data) {
          let payload;
          try {
            payload = cfg.transform(data);
          } catch (err) {
            payload = { error: err.message, raw: data };
          }
          renderOutput(key + ' -> OK', payload);
        })
        .fail(function (xhr) {
          renderOutput(key + ' -> ERROR', {
            statusCode: xhr.status,
            statusText: xhr.statusText,
            hint: 'Is the corresponding backend running?',
          });
        });
    });
  });

  function loadStats() {
    $.getJSON('http://localhost:3000/api/properties')
      .done((d) => $('#statProps').text(d.total || 0))
      .fail(() => $('#statProps').text('offline'));
    $.getJSON('http://localhost:3000/api/listings')
      .done((d) => $('#statListings').text(d.total || 0))
      .fail(() => $('#statListings').text('offline'));
  }

  window.launch = function (framework) {
    let port = 5173;
    if (framework === 'angular') port = 4200;
    if (framework === 'vue') port = 5174;
    const url = 'http://localhost:' + port;
    const win = window.open(url, '_blank');
    if (!win) {
      alert(framework + ' app not running. Start it with the README instructions (port ' + port + ').');
    }
  };
})(jQuery);