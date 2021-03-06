import { Command } from 'commander';
import { ChangeSetProvider } from '../change-set/change-set-provider';
import { TemplateRoot } from '../parser/parser';
import { BaseCliCommand, ICommandArgs } from './base-command';

const commandName = 'create-change-set <templateFile>';
const commandDescription = 'create change set that can be reviewed and executed later';

export class CreateChangeSetCommand extends BaseCliCommand<ICreateChangeSetCommandArgs> {

    constructor(command: Command) {
        super(command, commandName, commandDescription, 'templateFile');
    }

    public addOptions(command: Command) {
        super.addOptions(command);
        command.option('--change-set-name [change-set-name]', 'change set name');
    }

    public async performCommand(command: ICreateChangeSetCommandArgs) {
        const template = TemplateRoot.create(command.templateFile);

        const state = await this.getState(command);
        const binder = await this.getOrganizationBinder(template, state);

        const stateBucketName = await this.GetStateBucketName(command);
        const provider = new ChangeSetProvider(stateBucketName);
        const tasks = binder.enumBuildTasks();

        const changeSet = await provider.createChangeSet(command.changeSetName, template, tasks);

        const contents = JSON.stringify(changeSet, null, 2);
        console.log(contents);
    }
}

interface ICreateChangeSetCommandArgs extends ICommandArgs {
    templateFile: string;
    changeSetName?: string;
}
