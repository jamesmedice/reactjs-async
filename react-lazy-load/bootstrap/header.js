class Header extends React.Component{
	
  constructor(props){
	super(props);
  }	 
    	
   
	
  render(){
	var menuOptions = ['home', 'about', 'contact', 'news', 'login'];
	var elements = [];
	var e = React.createElement;
	for(var i = 0; i < menuOptions.length; i++){
	  elements.push(e('li', {key: i}, e(
	  'a',
	  {
		href: "#" + menuOptions[i]
	  },
	  menuOptions[i]
	  )));	
	}
	var listOfMenus = e('ul', null, elements);
	return e('div', { className: 'Header'}, [
	  e('span', null, this.props.title), listOfMenus
	]);
  };
}

bundleRegister().set('./bootstrap/header.js', function (props){
  return React.createElement(Header, props, null);
});

