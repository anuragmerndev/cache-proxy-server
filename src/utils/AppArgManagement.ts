class AppArguments {
    private appArgs: Map<string, string>;

    constructor (arg: string[]) {
        this.appArgs = new Map();
        this.parseArgument(arg);
    }

    private parseArgument(arg: string[]) {
        arg.forEach((argument, index) => {
            if (argument.startsWith("--")) {
                const argName = argument.split("--")[1];
                this.appArgs.set(argName.toLowerCase(), arg[index + 1]);
            }
        })

    }

    public getArgValue(flag: string) {
        return this.appArgs.get(flag);
    }
}

export { AppArguments }