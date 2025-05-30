import { Operation } from 'domain/entities/Operation';
import { RenderersManager } from 'application/render/renderers/RenderersManager';

export class Command {
  public operations: Operation[] = [];
  private undoOperationReverse = false;
  private setUndoOperationByPriority = false;

  public addOperation(operation: Operation) {
    this.operations.push(operation);
  }

  public merge(command: Command) {
    this.operations = [...this.operations, ...command.operations];
    this.setUndoOperationByPriority = command.setUndoOperationByPriority;
  }

  public setUndoOperationReverse() {
    // this method marks command that operations should be invoked in opposite sequence during invert()
    this.undoOperationReverse = true;
  }

  public setUndoOperationsByPriority() {
    this.setUndoOperationByPriority = true;
  }

  public invert(renderersManagers: RenderersManager) {
    const operations = this.undoOperationReverse
      ? this.operations.slice().reverse()
      : [...this.operations];

    if (this.setUndoOperationByPriority) {
      operations.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    operations.forEach((operation) => operation.invert(renderersManagers));
    renderersManagers.reinitializeViewModel();
    this.invertAfterAllOperations(renderersManagers, operations);
    renderersManagers.runPostRenderMethods();
  }

  public execute(renderersManagers: RenderersManager) {
    this.operations.forEach((operation) =>
      operation.execute(renderersManagers),
    );
    renderersManagers.reinitializeViewModel();
    this.executeAfterAllOperations(renderersManagers);
    renderersManagers.runPostRenderMethods();
  }

  public executeAfterAllOperations(
    renderersManagers: RenderersManager,
    operations = this.operations,
  ) {
    operations.forEach((operation) => {
      if (operation.executeAfterAllOperations) {
        operation.executeAfterAllOperations(renderersManagers);
      }
    });
  }

  public invertAfterAllOperations(
    renderersManagers: RenderersManager,
    operations = this.operations,
  ) {
    operations.forEach((operation) => {
      if (operation.invertAfterAllOperations) {
        operation.invertAfterAllOperations(renderersManagers);
      }
    });
  }

  public clear() {
    this.operations = [];
  }
}
