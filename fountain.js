onLoad(function(){
	var bubbles = 20;
	var width = 800;

	var ease = function (t) { return t<.5 ? t * t :  -0.5 +  Math.pow(t, 0.5) };
	
	var fount = document.createElement("div");
	fount.id = "fountainG";
	fount.style.width = width + "px";
	
	var off_x = width / bubbles;
	for (var i = 0; i < bubbles; i++) {
		var bubble = document.createElement("div");
		bubble.style.left = i * off_x + "px";
		var delay = ease(i / (bubbles - 1)) * 1.5 + "s";
		bubble.style.animationDelay = delay;
		bubble.style.mozAnimationDelay = delay;
		bubble.style.msAnimationDelay = delay;
		bubble.style.webkitAnimationDelay = delay;
		bubble.className="fountainG";
		fount.appendChild(bubble);
	}
	
	document.body.appendChild(fount);
});