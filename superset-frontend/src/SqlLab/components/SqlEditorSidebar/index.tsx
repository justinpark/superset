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

import React, { useCallback, useState, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { css, styled, useTheme, t } from '@superset-ui/core';
import AntdTabs from 'antd/lib/tabs';
import Icons from 'src/components/Icons';
import { toggleLeftBar } from 'src/SqlLab/actions/sqlLab';
import getAddonsRegistry from 'src/SqlLab/addons/SqlLabAddonRegistrySingleton';
import { List, Skeleton } from 'antd';
import Button from 'src/components/Button';
import { Tooltip } from 'src/components/Tooltip';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';
import { useSchemas } from 'src/hooks/apiResources';
import { queriesSelector } from 'src/SqlLab/selectors/queryEditor';
import { useEditorQueriesQuery } from 'src/hooks/apiResources/queries';

type Props = {
  queryEditorId: string;
  width: number;
  hide: boolean;
};

const StyledSidebar = styled.div<{
  width: number;
  hide: boolean;
  useTab: boolean;
}>`
  display: ${({ hide, useTab }) => (!useTab && hide ? 'none' : 'block')};
  border-right: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  padding: ${({ theme, useTab }) => (useTab ? 0 : theme.gridUnit * 2.5)}px;
  z-index: 7;
  ${({ width, hide }) => `
  ${!hide && `flex: 0 0 ${width}px;`}
  ${!hide && `width: ${width}px;`}
  `}
`;

const StyledAntdTabPane = styled(AntdTabs.TabPane)`
  ${({ theme }) => `
    padding: ${theme.gridUnit * 2.5}px;
    padding-left: ${theme.gridUnit * 2.5}px !important;
  `}
`;

const registry = getAddonsRegistry();

const SqlEditorSidebar: React.FC<Props> = ({
  hide,
  width,
  queryEditorId,
  children,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const apps = registry.getAll();
  const useTab = apps.length > 0;
  const [myAddons, setMyAddons] = useState(new Set<string>());
  const [currentTab, setCurrentTab] = useState('default');
  const onTabClick = useCallback(
    (tabId: string) => {
      if (currentTab !== tabId) {
        setCurrentTab(tabId);
      }

      if (currentTab === tabId || hide) {
        dispatch(toggleLeftBar({ id: queryEditorId, hideLeftBar: hide }));
      }
    },
    [currentTab, queryEditorId, hide, dispatch],
  );

  return (
    <StyledSidebar width={width} hide={hide} useTab={useTab}>
      {!useTab ? (
        children
      ) : (
        <AntdTabs
          tabPosition="left"
          css={css`
            height: 100%;
            & .ant-tabs-nav {
              & .ant-tabs-tab {
                padding: 0;
                &:first-child {
                  margin-top: ${theme.gridUnit * 2}px;
                }
                & .ant-tabs-tab-btn {
                  padding: ${theme.gridUnit}px 0;
                }
                & .anticon {
                  margin: 0;
                  color: ${theme.colors.grayscale.base};
                }
                &.ant-tabs-tab-active {
                  & .anticon {
                    color: ${theme.colors.grayscale.dark1};
                  }
                }
              }
            }
            & .ant-tabs-ink-bar {
              background-color: ${theme.colors.primary.base};
            }
          `}
          onTabClick={onTabClick}
          activeKey={hide ? '' : currentTab}
          destroyInactiveTabPane
        >
          <StyledAntdTabPane
            key="default"
            tab={
              <Tooltip title={t('Explorer')} placement="right">
                <Icons.FileSearchOutlined />
              </Tooltip>
            }
          >
            {children}
          </StyledAntdTabPane>
          {[...myAddons].map(key => {
            const {
              Component: App,
              metadata: { name, icon: Icon = Icons.FileOutlined },
            } = registry.get(key);

            return (
              <StyledAntdTabPane
                key={key}
                tab={
                  <Tooltip title={name} placement="right">
                    <Icon
                      queryEditorId={queryEditorId}
                      active={currentTab === key}
                      useQueryHistoryQuery={useEditorQueriesQuery}
                      useQueryEditor={useQueryEditor}
                      useSchemaListQuery={useSchemas}
                      queriesSelector={queriesSelector}
                    />{' '}
                  </Tooltip>
                }
                css={css`
                  height: 100%;
                `}
              >
                <Suspense fallback={<Skeleton active />}>
                  <App
                    queryEditorId={queryEditorId}
                    useQueryHistoryQuery={useEditorQueriesQuery}
                    useQueryEditor={useQueryEditor}
                    useSchemaListQuery={useSchemas}
                    queriesSelector={queriesSelector}
                    active={currentTab === key}
                  />
                </Suspense>
              </StyledAntdTabPane>
            );
          })}
          <AntdTabs.TabPane
            key="store"
            tab={
              <Tooltip title={t('Add-ons')} placement="right">
                <Icons.AppstoreAddOutlined />
              </Tooltip>
            }
          >
            <List
              itemLayout="vertical"
              dataSource={apps}
              renderItem={({ key, metadata: { name, description } }) => (
                <List.Item
                  key={key}
                  actions={[
                    myAddons.has(key) ? (
                      <Button
                        icon={<Icons.DownloadOutlined iconSize="m" />}
                        size="small"
                        buttonStyle="danger"
                        onClick={() =>
                          setMyAddons(
                            new Set([...myAddons].filter(k => k !== key)),
                          )
                        }
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        icon={<Icons.DownloadOutlined iconSize="m" />}
                        size="small"
                        buttonStyle="tertiary"
                        onClick={() => setMyAddons(new Set([...myAddons, key]))}
                      >
                        Add
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta title={name} description={description} />
                </List.Item>
              )}
            />
          </AntdTabs.TabPane>
        </AntdTabs>
      )}
    </StyledSidebar>
  );
};
// icon: Icon = Icons.FileOutlined,
export default SqlEditorSidebar;
