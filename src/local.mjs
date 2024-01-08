import * as Squids from "./squids.mjs";
import * as ThingEditor from "./thingEditor.mjs";
import {rplc8ThingsList, selectedThing} from "./thingEditor.mjs";
import {mouse, Thing} from "./squids.mjs";

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
		if (thing.image) {
			return (
				evt.clientX >= thing.position.x &&
				evt.clientX <= thing.position.x + thing.image.width &&
				evt.clientY >= thing.position.y &&
				evt.clientY <= thing.position.y + thing.image.height
			);
		} else if (thing.text) {
			const width = Squids.ctx.measureText(thing.text).width;
			const height = thing.font.size;
			return (
				evt.clientX >= thing.position.x &&
				evt.clientX <= thing.position.x + width &&
				evt.clientY >= thing.position.y &&
				evt.clientY <= thing.position.y + height
			);
		} else {
			return false;
		}
	});

	if (clickedThing && clickedThing !== selectedThing) {
		ThingEditor.populateThingEditor(clickedThing);
		return;
	}

	if (ThingEditor.selectedThing) {
		ThingEditor.deselect();
		return;
	}

	const newFileName = prompt("Enter a filename for the new thing:");
	if (!newFileName) {
		return;
	}

	const newThing = new Thing({
		alive: true,
		name: newFileName,
		position: {
			x: mouse.x,
			y: mouse.y,
		},
		text: newFileName,
		font: {
			size: 20,
			family: "Arial",
		},
		color: "white",
		draw: function() {
			Squids.default_draw(this);
		}
	});

	// convert newThing into a formdata file
	const blob = new FormData();
	// create a new Buffer from the thing's source code
	const newThingSource = new Blob([stringify(newThing, newFileName)], {type: "text/javascript"});
	blob.append("thing", newThingSource);
	blob.append("filename", `${newFileName}`);


	fetch("/things/new", {
		method: "POST",
		body: blob
	})
		.then(res => res.text())
		.then(data => {
			loadAllSquids();
		});
});

function loadAllSquids() {
	fetch("/api/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			action: "loadThings"
		})
	})
		.then(res => res.json())
		.then(async (data) => {
			console.log(data);
			// import each thing into Squids[] but ignore default_thing.js
			data.forEach((filename) => {
				if (filename === "default_thing.js") {
					return;
				}

				import(`./things/${filename}`)
					.then(thing => {
						// Squids[thing.default.name] = thing.default;
						const newThing = new Thing(thing.default);
						Squids.things.push(newThing);
						Squids.things.forEach(thing => {
							if(typeof thing.init === "function") {
								thing.init();
							}
						});
						ThingEditor.rplc8ThingsList();
					})
					.catch(err => {
						console.error(err);
					});
			});
		})
		.catch(console.error);

}

loadAllSquids();
Squids.start();

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
	if (Squids.isPaused) {
		pauseButton.innerText = "Resume";
		pauseButton.classList.add("green");
	} else {
		pauseButton.innerText = "Pause";
		pauseButton.classList.remove("green");
	}
});

resetButton.addEventListener("click", () => {
	Squids.reset();
});

const stringify = function (obj, filename) {
	const placeholder = '____PLACEHOLDER____';
	const fns = [];
	let json = JSON.stringify(obj, function (key, value) {
		if (typeof value === 'function') {
			fns.push(value);
			return placeholder;
		}
		return value;
	}, 2);
	json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function (_) {
		return fns.shift();
	});
	return `import * as Squids from "../squids.mjs";\n\nexport default ${json}`;
};