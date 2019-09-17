(function (){
	
	var layout = [
	  { file:'lib/dom'},
	  { file: 'bootstrap/footer', css: true},
	  { file:'bootstrap/header', css: true}
	];

	var routes = {
	  '/': {
		 render: 'Index'
	  },
	  '/home': {
		 render: 'Welcome to home page'
	  },
	  '/about': 'Middle Earth Jornal is a company who produces news about middle earth and the adventures in the land of Sauron.',
	  '/contact': 'React & Routing',
	  '/news': {
		  url: './news/news.js'
	  },
	  '/login': {
		  url: './login/login.js',
		  css: './login/login.css'
	  },
	  '/news/{id}': {
		  url: './news/newsView.js'
	  },
	  '/news/{id}/author': {
		  url: './news/newsAuthor.js'
	  }
	};
	var initialState = {
		header: {
			title: 'Middle Earth Jornal'
		},
		footer: {
			title: 'Copyright Frodo Baggins, 2019.'
		}
	};
	
	function layoutInitializer(layoutEntries){
	   return function initializeScripts(){
		  var currentScript = layoutEntries.shift();
		  if(!currentScript){
			  return;
		  }
		  var fileName = currentScript.file;
		  var script = document.createElement('script');
		  script.src = './' + fileName + '.js';
		  script.type = 'text/javascript';
		  script.async = true;
		  script.id = fileName;
		  script.onload = function (){
			 initializeScripts();
		  };
		  if(currentScript.css){
			 var css = document.createElement('link');  
			 css.rel = 'stylesheet';
			 css.type = 'text/css';
			 css.href = './' + fileName + '.css';
			 document.body.appendChild(css);
		  }
		  document.body.appendChild(script);
	   return initializeScripts;
	  };	
	};
	
	layoutInitializer(layout)();

	window.onload = function() {
	  console.log('Starting application');
	  var registerBundleApi = bundleRegister();
	  var createHeader = registerBundleApi.get('./bootstrap/header.js');
	  var createFooter = registerBundleApi.get('./bootstrap/footer.js');
	  var e = React.createElement;
	  
	  var mainApp = e('div',{}, createHeader(initialState.header),
	  e('div', { className: 'Container'}, domApi.Router({
		  routes: routes,
		  bundleRegister: registerBundleApi,
		  loadingRender: e('span', {
		    className: 'loader'
	       }, null
		  )
	  })),
	  createFooter(initialState.footer));
	  ReactDOM.render(mainApp, document.querySelector('#application'));
	};
	
})();

