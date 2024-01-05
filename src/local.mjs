import * as Squids from "./squids.mjs";
import * as helloWorld from "./things/helloWorld.js";
import * as ThingEditor from "./thingEditor.mjs";

Squids.initialize(document.body);
ThingEditor.init();

let selectedThing = null;

window.addEventListener("resize", () => {
	Squids.resizeCanvas({
		width: window.innerWidth,
		height: window.innerHeight
	});
});

Squids.canvas.addEventListener("click", (evt) => {
	// determin if click happened on a thing
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

	if(clickedThing) {
		selectedThing = clickedThing;
		ThingEditor.populateThingEditor(clickedThing);
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
			if(selectedThing === this) {
				Squids.ctx.strokeStyle = "white";
				let width, height;
				if(this.image) {
					width = this.image.width;
					height = this.image.height;
				}
				else if(this.text) {
					width = Squids.ctx.measureText(this.text).width;
					height = this.font.size;
				}
				Squids.ctx.strokeRect(this.position.x - 8, this.position.y - 8, width + 16, height + 16);
			}
		}
	});
	Squids.addThing(newThing);

	selectedThing = newThing;
	ThingEditor.populateThingEditor(newThing);
});

Squids.start();

helloWorld.init();
