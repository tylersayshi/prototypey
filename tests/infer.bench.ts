import { bench } from "@ark/attest";
import { lx } from "../src/lib.ts";

bench("InferNS with simple object", () => {
	const schema = lx.namespace("test.simple", {
		main: lx.object({
			id: lx.string({ required: true }),
			name: lx.string({ required: true }),
		}),
	});
	return schema.infer;
}).types([62, "instantiations"]);

bench("InferNS with complex nested structure", () => {
	const schema = lx.namespace("test.complex", {
		post: lx.record({
			key: "tid",
			record: lx.object({
				author: lx.ref("test.complex#user", { required: true }),
				replies: lx.array(lx.ref("test.complex#reply")),
				content: lx.string({ required: true }),
				createdAt: lx.string({ required: true, format: "datetime" }),
			}),
		}),
		user: lx.object({
			handle: lx.string({ required: true }),
			displayName: lx.string(),
		}),
		reply: lx.object({
			text: lx.string({ required: true }),
			author: lx.ref("test.complex#user", { required: true }),
		}),
	});
	return schema.infer;
}).types([124, "instantiations"]);
