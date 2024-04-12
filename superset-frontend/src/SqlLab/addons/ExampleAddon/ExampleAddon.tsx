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
import React from 'react';
import { t } from '@superset-ui/core';
import { AddonProps } from 'src/SqlLab/addons/types';
import { Input, List } from 'antd';
import Icons from 'src/components/Icons';

// TODO: POC only component can be removed after PR approved
const ExampleAddon: React.FC<AddonProps> = ({ queryEditorId }) => (
  <>
    <List
      dataSource={[1, 2, 3]}
      renderItem={() => (
        <List.Item>
          <List.Item.Meta
            description={t('Example Description')}
            avatar={<Icons.GithubOutlined />}
          />
        </List.Item>
      )}
    />
    <Input
      size="large"
      placeholder="large size"
      prefix={<Icons.UserOutlined />}
    />
  </>
);

export default ExampleAddon;
