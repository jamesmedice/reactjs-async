bundleRegister().set('./news/news.js', function(){
	var e = React.createElement;
	return e('div', {}, 
	  e('h1', null, 'Those are the middle earth news:'),
	  e('ol', null, 
	    e('li', null, 
		  e('a', { href: '#news/1'}, 'Aragon is getting married.')
		),
		e('li', null, 
		  e('a', { href: '#news/2'}, 'Troll attacks hobbits in plain day light.')
		),
		e('li', null, 
		  e('a', { href: '#news/2'}, 'Tourism in Mount Doom has increased will increase a lot this summer, says Middle Earth mayor.')
		)
	  ),
	  e('a', { href: '#news/2/author'}, 'Written by: Frodo.')
	);
});