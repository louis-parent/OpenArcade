window.addEventListener("load", () => {
	let nodes = document.querySelectorAll(":not(a)[href]");
	
	for(let node of nodes)
	{
		node.style.cursor = "pointer";
		
		node.addEventListener("click", () => {
			window.location.href = node.getAttribute("href");
		});
	}
});
