export function sleep(ms: number): Promise<void> {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function getArgValue(argName: string): string | undefined {
    const index = process.argv.indexOf(argName);

    if (index === -1) {
        return undefined;
    }

    return process.argv[index + 1];
}