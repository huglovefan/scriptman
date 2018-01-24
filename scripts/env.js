"use strict";

{

const env = process.env.NODE_ENV;

const dev = env === "development";
const prod = env === "production";

if (!dev && !prod) {
	throw new Error("NODE_ENV isn't set");
}

module.exports = {dev, prod};

}