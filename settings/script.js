chrome.storage.local.get(null, (result) => {
	for (var option in result)
		document.querySelector("input#" + option).checked = result[option]
})

document.querySelectorAll("input").forEach((input) => {
	input.addEventListener("input", function() {
		var options = {}		
		options[this.id] = this.checked
		
		chrome.storage.local.set(options)
	})
})