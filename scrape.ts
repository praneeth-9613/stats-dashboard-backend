import {  main } from "./main";

export function getArgValue(argName: string): string | undefined {
    const index = process.argv.indexOf(argName);

    if (index === -1) {
        return undefined;
    }

    return process.argv[index + 1];
}

const teamName = getArgValue("--teamName") || "";
const teamId = Number(getArgValue("--teamId") || 0);

main({
    teamId,
    teamName,
    resync: getArgValue("--resync") === "true",
    playerIds: [],
    matchIds: [],
}).catch((error) => {
    console.error(error);
    process.exit(1);
});