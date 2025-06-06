/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  DataRecordValue,
  GenericDataType,
  NumberFormatter,
  QueryObjectFilterClause,
  TimeFormatter,
  ExtraFormData,
} from '@superset-ui/core';
import { FALSE_STRING, NULL_STRING, TRUE_STRING } from 'src/utils/common';
import {
  Clauses,
  ExpressionTypes,
} from '../explore/components/controls/FilterControl/types';

export const getSelectExtraFormData = (
  col: string,
  value?: null | (string | number | boolean | null)[],
  emptyFilter = false,
  shouldExcludeFilter = false,
): ExtraFormData => {
  const extra: ExtraFormData = {};
  if (emptyFilter) {
    extra.adhoc_filters = [
      {
        expressionType: ExpressionTypes.Sql,
        clause: Clauses.Where,
        sqlExpression: '1 = 0',
      },
    ];
  } else if (value !== undefined && value !== null && value.length !== 0) {
    extra.filters = [
      {
        col,
        op: shouldExcludeFilter ? ('NOT IN' as const) : ('IN' as const),
        // @ts-ignore
        val: value,
      },
    ];
  }
  return extra;
};

export const getRangeExtraFormData = (
  col: string,
  lower?: number | null,
  upper?: number | null,
) => {
  const filters: QueryObjectFilterClause[] = [];
  if (lower !== undefined && lower !== null && lower !== upper) {
    filters.push({ col, op: '>=', val: lower });
  }
  if (upper !== undefined && upper !== null && upper !== lower) {
    filters.push({ col, op: '<=', val: upper });
  }
  if (
    upper !== undefined &&
    upper !== null &&
    lower !== undefined &&
    lower !== null &&
    upper === lower
  ) {
    filters.push({ col, op: '==', val: upper });
  }

  return filters.length
    ? {
        filters,
      }
    : {};
};

export interface DataRecordValueFormatter {
  (value: DataRecordValue, dtype: GenericDataType): string;
}

export function getDataRecordFormatter({
  timeFormatter,
  numberFormatter,
}: {
  timeFormatter?: TimeFormatter;
  numberFormatter?: NumberFormatter;
} = {}): DataRecordValueFormatter {
  return (value, dtype) => {
    if (value === null || value === undefined) {
      return NULL_STRING;
    }
    if (typeof value === 'boolean') {
      return value ? TRUE_STRING : FALSE_STRING;
    }
    if (dtype === GenericDataType.Boolean) {
      try {
        return JSON.parse(String(value).toLowerCase())
          ? TRUE_STRING
          : FALSE_STRING;
      } catch {
        return FALSE_STRING;
      }
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'bigint') {
      return String(value);
    }
    if (timeFormatter && dtype === GenericDataType.Temporal) {
      return timeFormatter(value);
    }
    if (
      numberFormatter &&
      typeof value === 'number' &&
      dtype === GenericDataType.Numeric
    ) {
      return numberFormatter(value);
    }
    return String(value);
  };
}
