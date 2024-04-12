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
import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { omit } from 'lodash';
import { useInView } from 'react-intersection-observer';
import { SqlLabRootState } from 'src/SqlLab/types';
import useEffectEvent from 'src/hooks/useEffectEvent';

import { css } from '@superset-ui/core';

import { List, Skeleton } from 'antd';
import { AddonProps } from 'src/SqlLab/addons/types';
import moment from 'moment';
import { StaticPosition } from 'src/SqlLab/components/QueryTable/styles';
import Card from 'src/components/Card';
import HighlightedSql from 'src/SqlLab/components/HighlightedSql';

const getEditorQueries = (
  queries: SqlLabRootState['sqlLab']['queries'],
  queryEditorId: string | number,
) => Object.values(queries);
// .filter(
//   ({ sqlEditorId }) => String(sqlEditorId) === String(queryEditorId),
// );

const QueryHistory: React.FC<AddonProps> = ({
  queryEditorId,
  queriesSelector,
  useQueryHistoryQuery,
}) => {
  const queries = useSelector(queriesSelector, shallowEqual);
  const [ref, hasReachedBottom] = useInView({ threshold: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const { data, isLoading, isFetching } = useQueryHistoryQuery({ pageIndex });
  const editorQueries = useMemo(
    () =>
      data
        ? getEditorQueries(
            omit(
              queries,
              data.result.map(({ id }) => id),
            ),
            queryEditorId,
          )
            .concat(data.result)
            .reverse()
        : getEditorQueries(queries, queryEditorId),
    [queries, data, queryEditorId],
  );
  const loadNext = useEffectEvent(() => {
    setPageIndex(pageIndex + 1);
  });

  const loadedDataCount = data?.result.length || 0;
  const totalCount = data?.count || 0;

  useEffect(() => {
    if (hasReachedBottom && loadedDataCount < totalCount) {
      loadNext();
    }
  }, [hasReachedBottom, loadNext, loadedDataCount, totalCount]);

  if (!editorQueries.length && isLoading) {
    return <Skeleton active />;
  }

  return (
    <>
      <List
        itemLayout="vertical"
        dataSource={editorQueries}
        renderItem={({ sql, rows, executedSql, id, startDttm }) => (
          <List.Item key={id} actions={[<span>{rows}</span>]}>
            <List.Item.Meta
              title={moment(startDttm).format('LL HH:mm:ss')}
              description={
                <Card css={[StaticPosition]}>
                  <HighlightedSql
                    sql={sql}
                    rawSql={executedSql}
                    shrink
                    maxWidth={60}
                  />
                </Card>
              }
            />
          </List.Item>
        )}
      />
      {data && loadedDataCount < totalCount && (
        <div
          ref={ref}
          css={css`
            position: relative;
            top: -150px;
          `}
        />
      )}
      {isFetching && <Skeleton active />}
    </>
  );
};

export default QueryHistory;
