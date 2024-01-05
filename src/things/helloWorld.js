import * as Squids from "../squids.mjs";

export function init() {
	const squid = new Squids.Thing({
		alive: true,
		position: {x: 100, y: 100},
		text: "Hello, world!",
		font: {
			size: 30,
			family: "Arial",
		},
		color: "white",
		update() {
			this.position.x += 1;
			this.position.y += 1;

			if (this.position.x > Squids.screenSize.width) {
				this.position.x = 0;
			}

			if (this.position.y > Squids.screenSize.height) {
				this.position.y = 0;
			}
		},
		draw() {
			Squids.default_draw(this);
		}
	});

	Squids.addThing(squid);
}

