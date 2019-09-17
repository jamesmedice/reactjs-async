window.bundleRegister = (function() {
  var container = {};
  window.__INTERNAL__BUNDLES = container;
  return function() {
    return {
      set: function(path, callback) {
        var isFunction = callback && typeof callback === 'function';
        if (!isFunction) {
          throw new Error('Trying to set invalid bundle callback. Must be an function or React object.');
        }
        if (isFunction) {
          container[path] = callback;
        } else {
          if (!React.isValidElement(callback)) {
            throw new Error('Trying to set invalid bundle callback. Must be an function or React object.');
          }
          container[path] = function() {
            return callback;
          }
        }
      },
      get: function(path) {
        return container[path];
      }
    }
  }
})();

window.widgetRegister = (function() {
  var container = {};
  window.__INTERNAL__WIDGETS = container;
  return function() {
    return {
      set: function(path, callback) {
        var isFunction = callback && typeof callback === 'function';
        if (!isFunction) {
          throw new Error('Trying to set invalid bundle callback. Must be an function or React object.');
        }
        if (isFunction) {
          container[path] = callback;
        } else {
          if (!React.isValidElement(callback)) {
            throw new Error('Trying to set invalid bundle callback. Must be an function or React object.');
          }
          container[path] = function() {
            return callback;
          }
        }
      },
      get: function(path) {
        return container[path];
      }
    }
  }
})();


function FileLoader() {
  var loadingQueue = [];
  this.getIfLoading = function(file) {
    return loadingQueue.find(function(e) {
      return e.file == file;
    });
  };
  
  this.removeFromQueue = function(file){
	this.loadingQueue = loadingQueue.filter(function(e) {
      return e.file == file;
    });
  };
  
  this.addToQueue = function(file, promise){
	loadingQueue.push({
      file: file,
      promise: promise
    });
  };

  this.dynamicLoad = function(file) {
    var found = this.getIfLoading(file);
    if (found) {
      return found.promise;
    }
	var _this = this;
    var promise = new Promise(function(resolve, reject) {
	  var script = document.createElement('script');
      script.src = file;
      script.async = true;
      script.type = 'text/javascript';
      script.id = file;
      script.onload = function() {
        setTimeout(function() {
         _this.removeFromQueue(file);
         resolve(true);
        }, 1000);

      };
      script.onerror = function() {
        _this.removeFromQueue(file);
        reject(false);
      };
      document.body.appendChild(script);
    });
    _this.addToQueue(file, promise);
    return promise;
  };
  this.dynamicLoadCss = function(file) {
    var found = this.getIfLoading(file);
    if (found) {
      return found.promise;
    }
    var _this = this;
    var promise = new Promise(function(resolve, reject) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.type = 'text/css';
      css.id = file;
      css.href = file;
      css.onload = function() {
        _this.removeFromQueue(file);
        resolve(true);
      };
      css.onerror = function() {
        _this.removeFromQueue(file);
        reject(false);
      };
      document.body.appendChild(css);
    });
    _this.addToQueue(file, promise);
    return promise;
  };
};


(window.domApi = new function() {
  var fileLoader = new FileLoader();

  class WidgetLoader extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loaded: false
      };
    }

    componentDidMount() {
      if (this.props.css) {
        fileLoader.dynamicLoadCss(this.props.css);
      }
      fileLoader.dynamicLoad(this.props.file).then((function() {
        this.setState({
          loaded: true,
          file: this.props.file
        });
      }).bind(this));
    }

    render() {
      if (!this.state.loaded/* || true*/) {
        if (this.props.loadingRender) {
          return this.props.loadingRender;
        }
        return null;
      }
      var widgetRender = this.props.widgetRegister.get(this.state.file);
      if (typeof widgetRender === 'function') {
        return widgetRender();
      }
      return null;
    }
  }

  function doesPatternMatch(pattern, currentUrl) {
    var str = '';

    if (!currentUrl.startsWith('/')) {
      currentUrl = '/' + currentUrl;
    }
    if (!pattern.startsWith('/')) {
      pattern = '/' + pattern;
    }
    var parts = currentUrl.split('/');
    var patternParts = pattern.split('/');
    var match = true;
    for (var i = 0; i < parts.length; i++) {
      var patternPart = patternParts[i];
      if (patternPart === null || patternPart === undefined) {
        match = false;
        break;
      }
      var urlPart = parts[i];
      if (patternPart.startsWith('{') && patternPart.endsWith('}')) {
        continue;
      }
      if (urlPart === patternPart) {
        continue;
      }
      match = false;
    }
    return match;
  }

  function getPath(routes) {
    var path = document.location.href.split('#');
    if (!path || !path[1]) {
      return '/';
    }
    var parts = path[1].split('/');
    var pattern = Object.keys(routes)
      .filter(function(route) {
        return doesPatternMatch(route, path[1]);
      });
    var urlFound = path[1];

    if (pattern.length > 0) {
      urlFound = pattern[0];
    }
    return {
      url: urlFound
    };
  }

  class RouterComponent extends React.PureComponent {


    constructor(props) {
      super(props);
      var mapping = getPath(props.routes);
      this.state = {
        route: mapping.url,
        history: []
      };
      this.changeRoute = this.changeRoute.bind(this);
      this.loadRoute = this.loadRoute.bind(this);
      this.bundleRegister = props.bundleRegister;
    }

    changeRoute(mapping) {
      var route = mapping.url;
      if (this.state.route === route) {
        return;
      }
      var newHistory = this.state.history.concat([]);
      newHistory.push(this.state.route);
      this.setState({
        route: route,
        history: newHistory,
        urlProps: mapping.props
      });
    }

    componentDidMount() {
      window.onpopstate = function(e) {
        var mapping = getPath(this.props.routes);
        this.changeRoute(mapping);
      }.bind(this);
      var mapping = getPath(this.props.routes);
      this.changeRoute(mapping);
      this.loadRoute();
    }

    componentDidUpdate(prevProps, prevState) {
      if ((prevState.route === this.state.route)) {
        return;
      }
      this.loadRoute();

    }

    loadRoute() {
      var route = this.props.routes[this.state.route];
      if (route && typeof route.url === 'string' && route.url.indexOf('.js')) {
        if (this.bundleRegister.get(route.url)) {
          return;
        }
        this.setState({
          loading: true
        });
        if (route.css) {
          fileLoader.dynamicLoadCss(route.css);
        }
        fileLoader.dynamicLoad(route.url).then(function() {
            this.setState({
              loading: false
            });
          }.bind(this))
          .catch(function() {
            console.log('Could not load file', route.url);
            this.setState({
              loading: false,
              showWarning: true
            });
          }.bind(this));
      }
    }

    render() {
      if (this.state.loading) {
        if (this.props.loadingRender) {
          return this.props.loadingRender;
        }
		return null;
      }
      var route = this.props.routes[this.state.route];
      if (!route) {
        return null;
      }

      if (route.url && !this.bundleRegister.get(route.url)) {
        if (this.state.showWarning) {
          return "Could not load page: " + route.url;
        }
        return null;
      }

      if (route.url && this.bundleRegister.get(route.url)) {
        var element = this.bundleRegister.get(route.url);
        return React.createElement(element, {}, element);
      }

      var props = Object.assign({}, this.state.urlProps);

      if (typeof route === 'object' && !React.isValidElement(route)) {
        if (typeof route.render === 'string') {
          return route.render;
        }
        return React.cloneElement(route.render, props, route.render);
      }

      if (typeof route === 'string') {
        return route;
      }

      return React.cloneElement(route, props, route);
    }
  };

  this.Router = function(props, children) {
    return React.createElement(RouterComponent, props, children);
  };

  this.WidgetLoader = function(props, children) {
    return React.createElement(WidgetLoader, props, children);
  };
});