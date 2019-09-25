import { AppSettings } from './../../../../common/app-setting';
import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { StubOperatorMetadataService } from '../../operator-metadata/stub-operator-metadata.service';
import { OperatorMetadataService, OPERATOR_METADATA_ENDPOINT } from '../../operator-metadata/operator-metadata.service';
import { mockOperatorMetaData, mockKeywordSourceSchema } from '../../operator-metadata/mock-operator-metadata.data';

import { DynamicSchemaService } from './../dynamic-schema.service';
import { JointUIService } from './../../joint-ui/joint-ui.service';
import { WorkflowActionService } from './../../workflow-graph/model/workflow-action.service';

import { SourceTablesService, SOURCE_TABLE_NAMES_ENDPOINT } from './source-tables.service';
import { mockSourceTableAPIResponse, mockTableTwitter, mockTablePromed } from './mock-source-tables.data';
import { mockScanPredicate, mockPoint } from '../../workflow-graph/model/mock-workflow-data';
import { OperatorPredicate } from '../../../types/workflow-common.interface';

/* tslint:disable: no-non-null-assertion */
describe('SourceTablesService', () => {

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        {provide: OperatorMetadataService, useClass: StubOperatorMetadataService},
        JointUIService,
        WorkflowActionService,
        DynamicSchemaService,
        SourceTablesService
      ]
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should fetch source tables from backend API', () => {
    const sourceTablesService: SourceTablesService = TestBed.get(SourceTablesService);

    const req = httpTestingController.expectOne(`${AppSettings.getApiEndpoint()}/${SOURCE_TABLE_NAMES_ENDPOINT}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockSourceTableAPIResponse);

    httpTestingController.verify();

    const tableSchemaMap = sourceTablesService.getTableSchemaMap();

    expect(tableSchemaMap !== undefined && tableSchemaMap.size > 0);

  });

  it('should modify tableName of the scan operator schema', () => {
    const workflowActionService: WorkflowActionService = TestBed.get(WorkflowActionService);
    const dynamicSchemaService: DynamicSchemaService = TestBed.get(DynamicSchemaService);
    const sourceTablesService: SourceTablesService = TestBed.get(SourceTablesService);

    const req = httpTestingController.expectOne(`${AppSettings.getApiEndpoint()}/${SOURCE_TABLE_NAMES_ENDPOINT}`);
    req.flush(mockSourceTableAPIResponse);
    httpTestingController.verify();

    workflowActionService.addOperator(mockScanPredicate, mockPoint);

    const dynamicSchema = dynamicSchemaService.getDynamicSchema(mockScanPredicate.operatorID);

    expect(dynamicSchema.jsonSchema.properties!['tableName']).toEqual({
      type: 'string',
      enum: [
        mockTablePromed.tableName, mockTableTwitter.tableName
      ]
    });

  });

  it('should modify the attribute of the scan operator after table is selected', () => {
    // construct the source table service and flush the source table responses
    const workflowActionService: WorkflowActionService = TestBed.get(WorkflowActionService);
    const dynamicSchemaService: DynamicSchemaService = TestBed.get(DynamicSchemaService);
    const sourceTablesService: SourceTablesService = TestBed.get(SourceTablesService);

    const req = httpTestingController.expectOne(`${AppSettings.getApiEndpoint()}/${SOURCE_TABLE_NAMES_ENDPOINT}`);
    req.flush(mockSourceTableAPIResponse);
    httpTestingController.verify();

    const mockKeywordSourcePredicate: OperatorPredicate = {
      operatorID: '1',
      operatorType: mockKeywordSourceSchema.operatorType,
      operatorProperties: {},
      inputPorts: [],
      outputPorts: ['output-0'],
      showAdvanced: true
    };

    // add keyword source operator and select a table name, this should trigger the change of "attributes" property
    workflowActionService.addOperator(mockKeywordSourcePredicate, mockPoint);
    workflowActionService.setOperatorProperty(mockKeywordSourcePredicate.operatorID, { tableName: mockTableTwitter.tableName });

    // check "attributes" is changed with autocomplete attribute names of the selected table
    const dynamicSchema = dynamicSchemaService.getDynamicSchema(mockKeywordSourcePredicate.operatorID);
    expect(dynamicSchema.jsonSchema.properties!['attributes']).toEqual({
      type: 'array',
      items: {
        type: 'string',
        enum: mockTableTwitter.schema.attributes.map(attr => attr.attributeName)
      }
    });

  });


});
