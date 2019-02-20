// Gateway Fixer
// keyPage.js
// 		Replaces the default text box set with a single text box

// Check whether the user wants the text box changed
chrome.storage.local.get(["enableAltInputBox"], (result) => {
	if ("enableAltInputBox" in result) {
		if (result.enableAltInputBox) enableAltInputBox()
	} else {
		chrome.storage.local.set({
			enableAltInputBox: true
		})
		enableAltInputBox()
	}
})

function enableAltInputBox() {
	// Create a MutationObserver that will listen for changes in the DOM
	let keyInputObserver = new MutationObserver(
		(mutationsList, observer) => {
			// Check whether the key input box has been loaded
			if (document.querySelector("div.word input.letter")) {
				// Disconnect the observer
				observer.disconnect()
				
				// Process the input boxes
				processKeyInput()
				
				return
			}
		}
	)

	// Start observing for changes in the DOM
	keyInputObserver.observe(
		document,
		{
			childList: true,
			subtree: true
		}
	)
}

// Main processing function
function processKeyInput() {
	var keyInputContainer = document.querySelector("div.key-input")
	var keyForm = keyInputContainer.querySelector("form")
	
	// Hide the current key input form
	keyForm.classList.add("gateway-fixer-key-original-hidden")
	
	// Create a new form
	var newBox = createKeyBox(keyInputContainer, keyForm)
	
	// Update the helper text
	updateKeyHelper("")
	
	// Attach an event listener to the new input box
	newBox.querySelector("input.gateway-fixer-key-input").addEventListener("input", () => {
		// Process the text inside the input box
		var inputBoxValue = processInputValue(newBox.querySelector("input").value)
		
		// Update the helper text
		updateKeyHelper(inputBoxValue)
	})
	
	// Attach an event listener to the new "Submit/Copy to original" button
	newBox.querySelector("button.gateway-fixer-key-submit").addEventListener("click", () => {
		// Process the text inside the input box
		var inputBox = document.querySelector("input.gateway-fixer-key-input")
		var inputBoxValue = processInputValue(inputBox.value)
		
		// Set the original input boxes' value to the new value
		copyToOriginal(inputBoxValue)
		
		// Is the original form hidden? If it is, submit the value!
		if (keyForm.classList.contains("gateway-fixer-key-original-hidden")) {
			submitNewInput()
		}
	})
}

// Process the input box data
function processInputValue(value) {
	// Remove whitespace characters
	value = value.replace(/\s/g, "")
		
	// Replace all Unicode apostrophe-like characters with '
	if (document.querySelector("#gateway-fixer-key-option-apostrophe").checked)
		value = value.replace(/['’ʼ‘`´ʹ′]/g, "'")
		
	return value
}

// Set the original input boxes' values to the new input value
// value is already processed and does not contain whitespace characters
function copyToOriginal(value) {
	// Put the value into the old boxes, one "letter" at a time
	document.querySelectorAll("div.key-input div.word input.letter").forEach((box, index) => {
		if (index >= value.length) {
			box.value = ""
		} else {
			var letter = value[index]
			box.value = letter
		}
	})
}

// Submits the answer
function submitNewInput() {
	document.querySelector("div.key-input form").dispatchEvent(new Event("submit"))
}

// Create the new input key box`
function createKeyBox(parent, originalForm) {
	// The main container
	var box = document.createElement("div")
	box.classList.add("gateway-fixer-key-box")
	
	// Key number label
	var keyLabel = document.createElement("div")
	keyLabel.innerText = parent.querySelector("div.key-input-label").innerText + " (Gateway Fixer)"
	box.appendChild(keyLabel)
	
	// Key helper label
	var keyHelper = document.createElement("div")
	keyHelper.classList.add("gateway-fixer-key-helper")
	box.appendChild(keyHelper)
	
	// Key input box
	var keyInput = document.createElement("input")
	keyInput.classList.add("gateway-fixer-key-input")
	box.appendChild(keyInput)
	
	// Options container
	var keyOptions = document.createElement("div")
	keyOptions.classList.add("gateway-fixer-key-options")
	
	// Apostrophe replacement checkbox & label
	var keyApostropheOption = document.createElement("input")
	keyApostropheOption.classList.add("gateway-fixer-key-option")
	keyApostropheOption.id = "gateway-fixer-key-option-apostrophe"
	keyApostropheOption.type = "checkbox"
	keyApostropheOption.checked = true // Checked by defaut
	keyOptions.appendChild(keyApostropheOption)
	
	var keyApostropheOptionLabel = document.createElement("label")
	keyApostropheOptionLabel.htmlFor = "gateway-fixer-key-option-apostrophe"
	keyApostropheOptionLabel.innerText = "Replace all apostrophe-like characters with ' (ASCII apostrophe, 0x27)"	
	keyOptions.appendChild(keyApostropheOptionLabel)
	
	box.appendChild(keyOptions)
	
	// Buttons container
	var keyButtons = document.createElement("div")
	keyButtons.classList.add("gateway-fixer-key-buttons")
	
	// Key submit button (or Copy to original if the original is visible)
	var keySubmit = document.createElement("button")
	keySubmit.classList.add("gateway-fixer-key-submit")
	keySubmit.innerText = "Submit"
	keyButtons.appendChild(keySubmit)
	
	// Show original key input button
	var keyOriginal = document.createElement("button")
	keyOriginal.classList.add("gateway-fixer-key-toggle-original")
	keyOriginal.innerText = "Show original"
	keyButtons.appendChild(keyOriginal)
	
	// Show/hide the original inputs
	keyOriginal.addEventListener("click", function() {
		var form = document.querySelector("div.key-input form")
		
		// Toggle between hidden/visible
		form.classList.toggle("gateway-fixer-key-original-hidden")
		
		var contains = form.classList.contains("gateway-fixer-key-original-hidden")
		
		// Change the button contents
		this.innerText = contains ? "Show original" : "Hide original"
		document.querySelector("button.gateway-fixer-key-submit").innerText =
			contains ? "Submit" : "Copy to original"
	})
	
	box.appendChild(keyButtons)
	
	parent.insertBefore(box, originalForm)
	return box
}

// Update the key helper label
function updateKeyHelper(value) {
	var helper = document.querySelector("div.gateway-fixer-key-helper")
	
	// Retrieve the letter layout
	var letterLayout = []
	
	document.querySelectorAll("div.key-input div.word").forEach((word) => {
		letterLayout.push(word.children.length)
	})
	
	// Create the helper label
	var helperLabel = ""
	
	letterLayout.forEach((letterCount, index) => {
		// Get the first n letters of the current value
		var word = value.substring(0, letterCount)
		
		// Trim the current value
		value = value.substring(letterCount)
		
		// Convert to an array
		word = word.split("")
		
		// If the letter count is less than letterCount, add underscores
		if (word.length < letterCount)
			for (var i = word.length; i < letterCount; i++)
				word.push("_")
		
		// Add spaces between letters and attach them to the label
		helperLabel += word.join(" ")
		
		// Add the 3 spaces if the word isn't the last word
		if (index < letterLayout.length - 1)
			helperLabel += "   "
	})
	
	// Convert spaces to non-breakable spaces and send them to the helper box
	helper.innerHTML = helperLabel.replace(/\s/g, "&nbsp;")
}