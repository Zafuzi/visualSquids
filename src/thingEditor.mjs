import * as Squids from "./squids.mjs";

const thingEditor = document.getElementById("thingEditor");
const thingEditor_content = thingEditor.querySelector("#thingEditor_content");

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
}

export function populateThingEditor(thing) {
	selectedThing = thing;
	thingEditor_content.innerHTML = `
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
}

export function drawHighlight() {
	if(!selectedThing) {
		return;
	}

	// get bounds of selected thing
	const bounds = {
		x: selectedThing.position.x,
		y: selectedThing.position.y,
		width: 0,
		height: 0,
	}

	if(selectedThing.image) {
		bounds.width = selectedThing.image.width;
		bounds.height = selectedThing.image.height;
	}
	else if(selectedThing.text) {
		Squids.ctx.font = `${selectedThing.font.size}px ${selectedThing.font.family}`;
		bounds.width = Squids.ctx.measureText(selectedThing.text).width;
		bounds.height = selectedThing.font.size;
	}

	// draw highlight
	Squids.ctx.strokeStyle = "white";
	Squids.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
}