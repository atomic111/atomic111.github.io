(function() {
	var li = document.createElement('li');
	li.id = 'library-chat';
	var libChatDiv = document.createElement('a');
	libChatDiv.appendChild(document.createTextNode('Ask a Question'));
	libChatDiv.className = 'btn btn-default';
	li.appendChild(libChatDiv);
	document.getElementById('cms-navigation').getElementsByTagName('ul')[0].appendChild(li);
	var chatWindow = function() {
		window.open('https://prod.library.gvsu.edu/labs/chat', 'Ask a Question', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,left=20,top=20,width=460,height=460');
	}
	if (libChatDiv.addEventListener) {
		libChatDiv.addEventListener('click', chatWindow, false);
	} else {
		libChatDiv.attachEvent('onclick', chatWindow);
	}
})();