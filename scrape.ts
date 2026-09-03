import "reflect-metadata";
import { container } from "./container"
import { Scraper } from "./Scraper";
import { AppDataSource } from "./persistence/data-source";

await AppDataSource.initialize()

const scraper = container.resolve(Scraper);

await scraper.run();