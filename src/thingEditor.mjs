import * as Squids from "./squids.mjs";

const thingEditor = document.getElementById("thingEditor");
const thingEditor_content = thingEditor.querySelector("#thingEditor_content");

const thingsList = document.getElementById("thingsList");
const thingsList_content = thingEditor.querySelector("#thingsList_content");

export let selectedThing;

function dragElement(element) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

	element.querySelector("header").onmousedown = dragMouseDown;
	element.onmousedown = (evt) => {
		evt.preventDefault();
	};

	function dragMouseDown(e) {
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// limit movement to within the window
		if (element.offsetTop - pos2 < 0) {
			pos2 = element.offsetTop;
		} else if (element.offsetTop - pos2 > window.innerHeight - element.offsetHeight) {
			pos2 = element.offsetTop - window.innerHeight + element.offsetHeight;
		}

		if (element.offsetLeft - pos1 < 0) {
			pos1 = element.offsetLeft;
		} else if (element.offsetLeft - pos1 > window.innerWidth - element.offsetWidth) {
			pos1 = element.offsetLeft - window.innerWidth + element.offsetWidth;
		}

		// set the element's new position:
		element.style.top = (element.offsetTop - pos2) + "px";
		element.style.left = (element.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

export function init() {
	dragElement(thingEditor);

	thingEditor.querySelector("header").addEventListener("dblclick", () => {
		thingEditor.querySelector("#thingEditor_content").classList.toggle("hidden");
	});

	dragElement(thingsList);
	thingsList.querySelector("header").addEventListener("dblclick", () => {
		thingsList.querySelector("#thingsList_content").classList.toggle("hidden");
	});
}

export function populateThingEditor(thing, doFullUpdate = false) {
	thing = thing || selectedThing;

	if (!thing) {
		thingEditor_content.innerHTML = "Nothing selected";
		return;
	}


	selectedThing = thing;
	let contentString = `
		<form class="flex flow-column">
			<label>
				Alive
				<input type="checkbox" id="thingEditor_alive" name="thingEditor_alive" ${thing.alive ? "checked" : ""}>
			</label>
			<button id="deleteThing">Delete</button>
		</form>
		
		<p>Position: ${thing.position.x}, ${thing.position.y}</p>	
		<p>Velocity: ${thing.velocity.x}, ${thing.velocity.y}</p>
		<p>Image: ${thing.image ? thing.image.src : "none"}</p>
		<p>Font: ${thing.font ? `${thing.font.size}px ${thing.font.family}` : "none"}</p>
		<p>Text: ${thing.text ? thing.text : "none"}</p>
		<p>Color: ${thing.color ? thing.color : "none"}</p>
		<p>Stroke: ${thing.stroke ? thing.stroke : "none"}</p>
		<p>Update: ${thing.update ? thing.update.toString() : "none"}</p>
		<p>Draw: ${thing.draw ? thing.draw.toString() : "none"}</p>
	`;

	thingEditor_content.innerHTML = contentString;

	// add event listeners
	const aliveCheckbox = thingEditor.querySelector("#thingEditor_alive");
	aliveCheckbox.addEventListener("change", () => {
		thing.alive = aliveCheckbox.checked;
		console.log(thing);
	});

	const deleteButton = thingEditor.querySelector("#deleteThing");
	deleteButton.addEventListener("click", (evt) => {
		evt.preventDefault();

		fetch("/api/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				action: "deleteThing",
				filename: thing.name,
			})
		})
			.then(() => {
				thing.alive = false;
				// delete thing from Squids.things array
				Squids.removeThing(thing);
				deselect();
				rplc8ThingsList();
			});
	});
}

export function drawHighlight() {
	if (!selectedThing) {
		return;
	}

	// get bounds of selected thing
	const bounds = {
		x: selectedThing.position.x,
		y: selectedThing.position.y,
		width: 0,
		height: 0,
	}

	if (selectedThing.image) {
		bounds.width = selectedThing.image.width;
		bounds.height = selectedThing.image.height;
	} else if (selectedThing.text) {
		Squids.ctx.font = `${selectedThing.font.size}px ${selectedThing.font.family}`;
		bounds.width = Squids.ctx.measureText(selectedThing.text).width;
		bounds.height = selectedThing.font.size;
	}

	// draw highlight
	Squids.ctx.strokeStyle = "white";
	Squids.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
}

export function deselect() {
	selectedThing = null;
	populateThingEditor();
}

const r8_thing = rplc8("#r8_thing");

export function rplc8ThingsList() {
	r8_thing.update(Squids.things, (element, thing) => {
		element.addEventListener("click", () => {
			populateThingEditor(thing);
		});
	});
}