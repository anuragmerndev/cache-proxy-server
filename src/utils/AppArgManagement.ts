class AppArguments {
    private static instance: AppArguments;
    private appArgs: Map<string, string>;

    private constructor(arg: string[]) {
        this.appArgs = new Map();
        this.parseArgument(arg);
    }

    private parseArgument(arg: string[]) {
        arg.forEach((argument, index) => {
            if (argument.startsWith("--")) {
                const argName = argument.substring(2);
                this.appArgs.set(argName.toLowerCase(), arg[index + 1]);
            }
        });
        
    }

    public static getInstance(): AppArguments {        
        if (!AppArguments.instance) {
            AppArguments.instance = new AppArguments(process.argv);
        }
        return AppArguments.instance;
    }

    public getArgValue(flag: string) {
        return this.appArgs.get(flag);
    }
}

export { AppArguments };
