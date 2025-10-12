import type schema from "../samples/demo.json";
import type { InferNS } from "./infer.ts";
export type Schema = InferNS<typeof schema>;
