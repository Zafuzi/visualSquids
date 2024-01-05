import * as Squids from "./squids.mjs";
import * as helloWorld from "./things/helloWorld.js";
import * as ThingEditor from "./thingEditor.mjs";
import {selectedThing} from "./thingEditor.mjs";
import * as ThingsEditor from "./thingEditor.mjs";

Squids.initialize(document.body, gameUpdate, gameDraw);
ThingEditor.init();

window.addEventListener("resize", () => {
	Squids.resizeCanvas({
		width: window.innerWidth,
		height: window.innerHeight
	});
});

Squids.canvas.addEventListener("click", (evt) => {

	// determine if click happened on a thing
	const things = Squids.things.filter(thing => thing.alive);
	const clickedThing = things.find(thing => {
		if(thing.image) {
			return (
				evt.clientX >= thing.position.x &&
				evt.clientX <= thing.position.x + thing.image.width &&
				evt.clientY >= thing.position.y &&
				evt.clientY <= thing.position.y + thing.image.height
			);
		}
		else if(thing.text) {
			const width = Squids.ctx.measureText(thing.text).width;
			const height = thing.font.size;
			return (
				evt.clientX >= thing.position.x &&
				evt.clientX <= thing.position.x + width &&
				evt.clientY >= thing.position.y &&
				evt.clientY <= thing.position.y + height
			);
		}
		else {
			return false;
		}
	});

	if(clickedThing && clickedThing !== selectedThing) {
		ThingEditor.populateThingEditor(clickedThing);
		return;
	}

	if(ThingEditor.selectedThing) {
		ThingEditor.deselect();
		return;
	}

	// generate a new thing on click
	const newThing = new Squids.Thing({
		alive: true,
		position: {x: evt.clientX, y: evt.clientY},
		text: "NEW THING!",
		font: {
			size: 20,
			family: "Arial",
		},
		color: "white",
		draw() {
			Squids.default_draw(this);
		}
	});
	Squids.addThing(newThing);

	ThingEditor.populateThingEditor(newThing);
});

Squids.start();

helloWorld.init();

function gameUpdate() {
}

function gameDraw() {
	// draw keyboard state in top left corner
	Squids.ctx.fillStyle = "white";
	Squids.ctx.font = "20px Arial";
	Squids.ctx.textBaseline = "top";
	Squids.ctx.fillText(`Keyboard state: ${JSON.stringify(Squids.keyboard)}`, 16, Squids.screenSize.height - 36);

	ThingEditor.drawHighlight();
}

const pauseButton = document.getElementById("gameControls_pause");
const resetButton = document.getElementById("gameControls_reset");

pauseButton.addEventListener("click", () => {
	Squids.togglePause();
	if(Squids.isPaused) {
		pauseButton.innerText = "Resume";
		pauseButton.classList.add("green");
	}
	else {
		pauseButton.innerText = "Pause";
		pauseButton.classList.remove("green");
	}
});

resetButton.addEventListener("click", () => {
	Squids.reset();
});