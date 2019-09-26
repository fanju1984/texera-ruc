import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { OperatorMetadataService } from './../operator-metadata/operator-metadata.service';
import { OperatorSchema} from '../../types/operator-schema.interface';
import { WorkflowActionService } from './../workflow-graph/model/workflow-action.service';
import * as Ajv from 'ajv';

/**
 *  ValidationWorkflowService handles the logic to check whether the operator is valid
 *    1. When the user add/delete operators/links
 *    2. When the user complete/delete operator properties
 *    3. When the operator ports are all connected
 *
 *  The operator will become valid if all the ports are connected and its required properties
 *    are completed by the users.
 *
 *  AJV is a javascript library that is used to validate a data object against a structure defined
 *    using a JSON Schema.
 *
 * @author Angela Wang
 */
@Injectable()
export class ValidationWorkflowService {

  private operatorSchemaList: ReadonlyArray<OperatorSchema> = [];
  private readonly operatorValidationStream =  new Subject <{status: boolean, operatorID: string}>();
  private ajv = new Ajv ({schemaId: 'auto', allErrors: true});

  /**
   * subcribe the add opertor event, delete operator event, add link event, delete link event
   * and change operator property event. observe each change and record changes in operatorValidationStream
   * @param texeraGraph
   * @param workflowActionService
   */
  constructor(private operatorMetadataService: OperatorMetadataService,
    private workflowActionService: WorkflowActionService) {

    this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

    // fetch operator schema list
    this.operatorMetadataService.getOperatorMetadata()
    .filter(metadata => metadata.operators.length !== 0)
    .subscribe(metadata => {
      this.operatorSchemaList = metadata.operators;
      this.initializeValidation();
    });
  }

  /**
   * Gets the observable for operator validation change event.
   * Contains a boolean variable and an operator ID:
   *  - status: the new status for the validation of operator
   *  - operatorID: operator being validated
   */
  public getOperatorValidationStream(): Observable<{status: boolean, operatorID: string}> {
    return this.operatorValidationStream.asObservable();
  }

  /**
   * This method is a validation that checks whether all ports of the operator
   *  are connected and all required properties of this operator are completed.
   */
  public validateOperator(operatorID: string): boolean {
    return  (!this.isOperatorIsolated(operatorID) && this.isJsonSchemaValid(operatorID));
  }

  /**
   * Initialize all the event listener for validation on the workflow editor
   */
  private initializeValidation(): void {
    // when initialized, first validate any initial operators existing in the editor before the event handlers
    //  have been configured. This will happen when the saved workflow reload on the browser
    this.workflowActionService.getTexeraGraph().getAllOperators().forEach(operator => {
      this.operatorValidationStream.next({
        status: this.validateOperator(operator.operatorID), operatorID: operator.operatorID});
    });

    // Capture the operator add event and validate the newly added operator
    this.workflowActionService.getTexeraGraph().getOperatorAddStream()
      .subscribe(value =>
        this.operatorValidationStream.next({
          status: this.validateOperator(value.operatorID), operatorID: value.operatorID})
      );

    // Capture the link add and delete event and validate the source and target operators for this link
    Observable.merge(
      this.workflowActionService.getTexeraGraph().getLinkAddStream(),
      this.workflowActionService.getTexeraGraph().getLinkDeleteStream().map(link => link.deletedLink)
    ).subscribe(value => {
      this.operatorValidationStream.next({status: this.validateOperator(value.source.operatorID),
        operatorID: value.source.operatorID});
      this.operatorValidationStream.next({status: this.validateOperator(value.target.operatorID),
        operatorID: value.target.operatorID});
    });

    // Capture the operator property change event and validate the current operator being changed
    this.workflowActionService.getTexeraGraph().getOperatorPropertyChangeStream()
      .subscribe(value => this.operatorValidationStream.next({
        status: this.validateOperator(value.operator.operatorID), operatorID: value.operator.operatorID})
      );
  }

  /**
   * This method is used to check whether all required properties of the operator have been completed.
   *  If completed correctly, the operator is valid.
   */
  private isJsonSchemaValid(operatorID: string): boolean {
    const operator = this.workflowActionService.getTexeraGraph().getOperator(operatorID);
    if (operator === undefined) {
      throw new Error(`operator with ID ${operatorID} doesn't exist`);
    }
    const operatorSchema = this.operatorSchemaList.find(schema => schema.operatorType === operator.operatorType);
    if (operatorSchema === undefined) {
      throw new Error(`operatorSchema doesn't exist`);
    }

    const isValid = this.ajv.validate(operatorSchema.jsonSchema, operator.operatorProperties);

    if (isValid) { return true; }
    return false;
  }

  /**
   * This method is used to check whether all ports of the operator have been connected.
   *  if all ports of the operator are connected, the operator is valid.
   */
  private isOperatorIsolated(operatorID: string): boolean {
    const operator = this.workflowActionService.getTexeraGraph().getOperator(operatorID);
      if (operator === undefined) {
      throw new Error(`operator with ID ${operatorID} doesn't exist`);
    }

    const inputPortsNum = operator.inputPorts.length;
    const outputPortsNum = operator.outputPorts.length;

    return !(
      inputPortsNum === this.workflowActionService.getTexeraGraph().getInputLinksByOperatorId(operatorID).length &&
      outputPortsNum === this.workflowActionService.getTexeraGraph().getOutputLinksByOperatorId(operatorID).length
    );
  }





}
