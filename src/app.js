import Hapi from "@hapi/hapi";

import { loadModel, predict } from "./inference.js";

(async () => {
	const model = await loadModel();
	console.log("model loaded");

	const server = Hapi.server({
		host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
		port: 3000,
	});

	server.route({
		method: "POST",
		path: "/predicts",
		handler: async (req) => {
			const { image } = req.payload;
			const prediction = await predict(model, image);
			const [paper, rock] = prediction;

			if (paper) {
				return { result: "paper" };
			}
			if (rock) {
				return { result: "rock" };
			}
			return { result: "scissors" };
		},
		options: {
			payload: {
				allow: "multipart/form-data",
				multipart: true,
			},
		},
	});
	await server.start();

	console.log(`server start at: ${server.info.uri}`);
})();
