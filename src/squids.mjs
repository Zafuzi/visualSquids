import * as ThingEditor from "./thingEditor.mjs";
import {rplc8ThingsList} from "./thingEditor.mjs";

export let canvas, ctx;
export let things = [];
export let screenSize = {
	width: window.innerWidth,
	height: window.innerHeight
};
export let tick = 0;

export let defaultClearColor = "#222";

export let mouse;

export let isPaused = true;

export let keyboard = {};

export function initialize(rootElement, update, draw) {
	// create a canvas and render to the page
	canvas = document.createElement("canvas");
	canvas.id = "squids-canvas";
	canvas.style.userSelect = "none";

	rootElement.appendChild(canvas);
	ctx = canvas.getContext("2d");
	resizeCanvas(screenSize);

	canvas.addEventListener("mousemove", mouseHandler);
	canvas.addEventListener("mousedown", mouseHandler);
	canvas.addEventListener("mouseup", mouseHandler);
	canvas.addEventListener("wheel", mouseHandler);
	canvas.addEventListener("dblclick", mouseHandler);

	window.addEventListener("keydown", keyboardHandler);
	window.addEventListener("keyup", keyboardHandler);

	_globalUpdate = update || _globalUpdate;
	_globalDraw = draw || _globalDraw;
}

export function resizeCanvas(newScreeSize) {
	screenSize = newScreeSize;
	canvas.width = screenSize?.width || window.innerWidth;
	canvas.height = screenSize?.height || window.innerHeight;
	canvas.style.backgroundColor = defaultClearColor;
}

export function addThing(thing) {
	things.push(thing);
	ThingEditor.rplc8ThingsList();
}

export function removeThing(thing) {
	things = things.filter(t => t !== thing);
}

export function clearThings() {
	things = [];
}

export function loadImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = src;
	});
}

export let _globalUpdate;
export let _globalDraw;

export function update() {
	if(typeof _globalUpdate === "function") {
		_globalUpdate();
	}
	things.forEach(thing => thing.update());
}

export function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if(typeof _globalDraw === "function") {
		_globalDraw();
	}
	things.forEach(thing => thing.draw());
}

export function loop() {
	tick++;
	if(!isPaused) {
		update();
	}

	draw();
	window.requestAnimationFrame(loop);
}

export function start() {
	isPaused = false;
	window.requestAnimationFrame(loop);
}

export function default_draw(thing) {
	if(!thing?.alive) {
		return;
	}

	if (thing.image) {
		ctx.drawImage(thing.image, thing.position.x, thing.position.y);
	}
	if (thing.text) {
		if(thing.color) {
			ctx.fillStyle = thing.color;
		}
		ctx.font = `${thing.font.size}px ${thing.font.family}`;
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.fillText(thing.text, thing.position.x, thing.position.y);
		if(thing.stroke) {
			ctx.strokeStyle = thing.stroke;
			ctx.strokeText(thing.text, thing.position.x, thing.position.y);
		}
	}
}

export let seqNum = 0;
export function seq() {
	seqNum += 1;
	return seqNum;
}

export class Thing {
	id = seq();

	alive = false;
	name = null;

	position = {
		x: 0,
		y: 0,
	};

	startPosition = {
		x: 0,
		y: 0,
	};

	velocity = {
		x: 0,
		y: 0,
	};

	image = null;
	font = null;
	text = null;

	color = null;
	stroke = null;

	constructor({
		alive, position, velocity, image, font, text, color, stroke,
		name,
		update = () => {},
		draw = () => {
			default_draw(this);
		}
	}) {
		this.alive = alive || this.alive;
		this.name = name || this.name;
		this.position = position || this.position;
		this.startPosition = {...this.position};
		this.velocity = velocity || this.velocity;
		this.image = image || this.image;
		this.font = font || this.font;
		this.text = text || this.text;
		this.color = color || this.color;
		this.stroke = stroke || this.stroke;
		this.draw = draw;
		this.update = update;
	}
}

function mouseHandler(evt) {
	mouse = {
		x: evt.clientX,
		y: evt.clientY,
		leftButtonDown: evt.buttons === 1,
		rightButtonDown: evt.buttons === 2,
		scrollDelta: evt.deltaY,
		isDoubleClick: evt.detail === 2
	};
}

function keyboardHandler(evt) {
	let key = evt.key.toLowerCase();

	if(evt.key === " ") {
		key = "Space";
	}

	switch(evt.type) {
		case "keydown":
			keyboard[key] = true;
			break;
		case "keyup":
			if(key === "escape") {
				ThingEditor.deselect();
			}
			delete keyboard[key];
			break;
		case "keypress":
			break;
	}
}

export function togglePause() {
	isPaused = !isPaused;
}

export function reset() {
	window.location.reload();
}