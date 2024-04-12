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
import Icons from 'src/components/Icons';
import { useSchemas } from 'src/hooks/apiResources';
import { useEditorQueriesQuery } from 'src/hooks/apiResources/queries';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';
import { RegistryMetadata } from 'src/utils/functionalRegistry';
import { queriesSelector } from 'src/SqlLab/selectors/queryEditor';

export type AddonProps = {
  queryEditorId: string;
  active: boolean;
  useQueryEditor: typeof useQueryEditor;
  useQueryHistoryQuery: typeof useEditorQueriesQuery;
  useSchemaListQuery: typeof useSchemas;
  queriesSelector: typeof queriesSelector;
};

export interface SqlLabAddonMetadata extends RegistryMetadata {
  /**
   * url or dataURI (recommended) of a logo to use in place of a title.  title is fallback display if no logo is provided
   */
  icon?: React.ComponentType<AddonProps>;

  iconName?: keyof typeof Icons;

  optIn: boolean;
}
