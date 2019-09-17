bundleRegister().set('./bootstrap/footer.js', function (props){
   var e = React.createElement;
   var newProps = Object.assign({
	  className: 'Footer'
   }, props);
   
   var loader = window.domApi.WidgetLoader;
   
   var widget = loader({
	   file: './widgets/banner.js',
	   css: './widgets/banner.css',
	   widgetRegister: widgetRegister(),
	   loadingRender: e('span', {
		className: 'loader'
	   }, null)
   });
   
   return e('div', newProps, props.title, widget, widget, widget);
});