import { getArgValue } from "./helper";
import {  main } from "./main";

const teamName = getArgValue("--teamName") || "";
const teamId = Number(getArgValue("--teamId") || 0);

main({
    teamId,
    teamName,
    refresh: getArgValue("--refresh") === "true",
    playerIds: [],
    matchIds: [],    
}).catch((error) => {
    console.error(error);
    process.exit(1);
});