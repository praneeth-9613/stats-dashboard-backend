import "reflect-metadata";
import { container } from "./container";
import { ApiServer } from "./ApiServer";

const server = container.resolve(ApiServer);

await server.start();