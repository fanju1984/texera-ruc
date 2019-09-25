import { JSONSchema4 } from 'json-schema';
import { OperatorSchema, OperatorMetadata, GroupInfo } from '../../types/operator-schema.interface';


// Exports constants related to operator schema and operator metadata for testing purposes.

export const mockScanSourceSchema: OperatorSchema = {
  operatorType: 'ScanSource',
  additionalMetadata: {
    advancedOptions: [],
    operatorDescription: 'Read records from a table one by one',
    operatorGroupName: 'Source',
    numInputPorts: 0,
    numOutputPorts: 1,
    userFriendlyName: 'Source: Scan',
    propertyDescription: {
      tableName: 'The table name is the name of the source table, including twitter and promed'
    }
  },
  jsonSchema: {
    properties: {
      tableName: { type: 'string', description: 'name of source table' }
    },
    required: ['tableName'],
    type: 'object'
  }
};

export const mockNlpSentimentSchema: OperatorSchema = {
  operatorType: 'NlpSentiment',
  additionalMetadata: {
    advancedOptions: [],
    operatorDescription: 'Sentiment analysis based on Stanford NLP package',
    operatorGroupName: 'Analysis',
    numInputPorts: 1,
    numOutputPorts: 1,
    userFriendlyName: 'Sentiment Analysis'
  },
  jsonSchema: {
    properties: {
      attribute: { type: 'string' },
      resultAttribute: { type: 'string' }
    },
    required: ['attribute', 'resultAttribute'],
    type: 'object'
  }
};

export const mockKeywordSourceSchema: OperatorSchema = {
  operatorType: 'KeywordSource',
  jsonSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      attributes: {
        type: 'array',
        items: { type: 'string' }
      },
      tableName: { type: 'string' },
      spanListName: { type: 'string' }
    },
    required: ['query', 'attributes', 'tableName']
  },
  additionalMetadata: {
    userFriendlyName: 'Source: Keyword',
    operatorDescription: 'Perform an index-based search on a table using a keyword',
    operatorGroupName: 'Analysis',
    numInputPorts: 0,
    numOutputPorts: 1,
    advancedOptions: []
  }
};

export const mockKeywordSearchSchema: OperatorSchema = {
  operatorType: 'KeywordMatcher',
  jsonSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      attributes: {
        type: 'array',
        items: { type: 'string' }
      },
      spanListName: { type: 'string' }
    },
    required: [ 'query', 'attributes', ]
  },
  additionalMetadata: {
    userFriendlyName: 'Keyword Search',
    operatorDescription: 'Search the documents using a keyword',
    operatorGroupName: 'Analysis',
    numInputPorts: 1,
    numOutputPorts: 1,
    advancedOptions: []
  }
};

export const mockAggregationSchema: OperatorSchema = {
  operatorType: 'Aggregation',
  jsonSchema: {
    type: 'object',
    properties: {
      listOfAggregations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            attribute: { type: 'string' },
            aggregator: {
              type: 'string',
              enum: ['min', 'max', 'average', 'sum', 'count']
            },
            resultAttribute: { type: 'string' }
          }
        }
      }
    },
    required: ['listOfAggregations']
  },
  additionalMetadata: {
    userFriendlyName: 'Aggregation',
    operatorDescription: 'Aggregate one or more columns to find min, max, sum, average, count of the column',
    operatorGroupName: 'Analysis',
    numInputPorts: 1,
    numOutputPorts: 1,
    advancedOptions: []
  }
};

export const mockViewResultsSchema: OperatorSchema = {
  operatorType: 'ViewResults',
  jsonSchema: {
    properties: {
      limit: {
        default: 10,
        type: 'integer'
      },
      'offset': {
        default: 0,
        type: 'integer'
      }
    },
    type: 'object'
  },
  additionalMetadata: {
    advancedOptions: [],
    operatorDescription: 'View the results of the workflow',
    operatorGroupName: 'View Results',
    numInputPorts: 1,
    numOutputPorts: 0,
    userFriendlyName: 'View Results'
  }
};

export const mockOperatorSchemaList: ReadonlyArray<OperatorSchema> = [
  mockScanSourceSchema,
  mockKeywordSourceSchema,
  mockKeywordSearchSchema,
  mockNlpSentimentSchema,
  mockAggregationSchema,
  mockViewResultsSchema
];

export const mockOperatorGroup: ReadonlyArray<GroupInfo> = [
  { groupName: 'Source', groupOrder: 1 },
  { groupName: 'Analysis', groupOrder: 2 },
  { groupName: 'View Results', groupOrder: 3 },
];

export const mockOperatorMetaData: OperatorMetadata = {
  operators: mockOperatorSchemaList,
  groups: mockOperatorGroup
};


export const testJsonSchema: JSONSchema4 = {
  id: 'urn:jsonschema:edu:uci:ics:texera:dataflow:nlp:sentiment:NlpSentimentPredicate',
  properties: {
    attribute: {
      type: 'string'
    },
    resultAttribute: {
      type: 'string'
    }
  },
  required: [
    'attribute',
    'resultAttribute'
  ],
  type: 'object'
};

