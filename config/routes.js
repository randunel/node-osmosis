'use strict';

exports.routes = function(map) {
    map.resources('users');

    map.resources('requests');
    map.get('/:url/requests', 'requests#index');
    map.get('/:url/requests/:id', 'requests#show');

    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    map.all(':controller/:action');
    map.all(':controller/:action/:id');

    map.get('/ip', 'users#ip');
};

