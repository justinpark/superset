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
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  fireEvent,
  screen,
  render,
  waitFor,
} from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import { QueryEditor } from 'src/SqlLab/types';
import {
  initialState,
  defaultQueryEditor,
  extraQueryEditor1,
  extraQueryEditor2,
} from 'src/SqlLab/fixtures';
import { Store } from 'redux';
import {
  REMOVE_QUERY_EDITOR,
  QUERY_EDITOR_SET_TITLE,
  ADD_QUERY_EDITOR,
  QUERY_EDITOR_TOGGLE_LEFT_BAR,
} from 'src/SqlLab/actions/sqlLab';
import SqlEditorTabHeader from 'src/SqlLab/components/SqlEditorTabHeader';

jest.mock('src/components/Select', () => () => (
  <div data-test="mock-deprecated-select" />
));
jest.mock('src/components/Select/Select', () => () => (
  <div data-test="mock-deprecated-select-select" />
));
jest.mock('src/components/Select/AsyncSelect', () => () => (
  <div data-test="mock-async-select" />
));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const setup = (queryEditor: QueryEditor, store?: Store) =>
  render(<SqlEditorTabHeader queryEditor={queryEditor} />, {
    useRedux: true,
    ...(store && { store }),
  });

describe('SqlEditorTabHeader', () => {
  it('renders title', () => {
    const { queryByText } = setup(defaultQueryEditor, mockStore(initialState));
    expect(queryByText(defaultQueryEditor.title)).toBeTruthy();
    expect(queryByText(extraQueryEditor1.title)).toBeFalsy();
    expect(queryByText(extraQueryEditor2.title)).toBeFalsy();
  });

  it('renders title from unsaved changes', () => {
    const expectedTitle = 'updated title';
    const { queryByText } = setup(
      defaultQueryEditor,
      mockStore({
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          unsavedQueryEditor: {
            id: defaultQueryEditor.id,
            title: expectedTitle,
          },
        },
      }),
    );
    expect(queryByText(expectedTitle)).toBeTruthy();
    expect(queryByText(defaultQueryEditor.title)).toBeFalsy();
    expect(queryByText(extraQueryEditor1.title)).toBeFalsy();
    expect(queryByText(extraQueryEditor2.title)).toBeFalsy();
  });

  it('renders current title for unrelated unsaved changes', () => {
    const unrelatedTitle = 'updated title';
    const { queryByText } = setup(
      defaultQueryEditor,
      mockStore({
        ...initialState,
        sqlLab: {
          ...initialState.sqlLab,
          unsavedQueryEditor: {
            id: `${defaultQueryEditor.id}-other`,
            title: unrelatedTitle,
          },
        },
      }),
    );
    expect(queryByText(defaultQueryEditor.title)).toBeTruthy();
    expect(queryByText(unrelatedTitle)).toBeFalsy();
    expect(queryByText(extraQueryEditor1.title)).toBeFalsy();
    expect(queryByText(extraQueryEditor2.title)).toBeFalsy();
  });

  describe('with dropdown menus', () => {
    let store = mockStore();
    beforeEach(async () => {
      store = mockStore(initialState);
      const { getByTestId } = setup(defaultQueryEditor, store);
      const dropdown = getByTestId('dropdown-trigger');

      userEvent.click(dropdown);

      await waitFor(() =>
        expect(screen.getByTestId('close-tab-menu-option')).toBeInTheDocument(),
      );
    });

    it('should dispatch removeQueryEditor action', async () => {
      fireEvent.click(screen.getByTestId('close-tab-menu-option'));

      const actions = store.getActions();
      await waitFor(() =>
        expect(actions[0]).toEqual({
          type: REMOVE_QUERY_EDITOR,
          queryEditor: defaultQueryEditor,
        }),
      );
    });

    it('should dispatch queryEditorSetTitle action', async () => {
      const expectedTitle = 'typed text';
      const mockPrompt = jest
        .spyOn(window, 'prompt')
        .mockImplementation(() => expectedTitle);
      fireEvent.click(screen.getByTestId('rename-tab-menu-option'));

      const actions = store.getActions();
      await waitFor(() =>
        expect(actions[0]).toEqual({
          type: QUERY_EDITOR_SET_TITLE,
          title: expectedTitle,
          queryEditor: expect.objectContaining({
            id: defaultQueryEditor.id,
          }),
        }),
      );
      mockPrompt.mockClear();
    });

    it('should dispatch toggleLeftBar action', async () => {
      fireEvent.click(screen.getByTestId('toggle-menu-option'));

      const actions = store.getActions();
      await waitFor(() =>
        expect(actions[0]).toEqual({
          type: QUERY_EDITOR_TOGGLE_LEFT_BAR,
          hideLeftBar: !defaultQueryEditor.hideLeftBar,
          queryEditor: expect.objectContaining({
            id: defaultQueryEditor.id,
          }),
        }),
      );
    });

    it('should dispatch removeAllOtherQueryEditors action', async () => {
      fireEvent.click(screen.getByTestId('close-all-other-menu-option'));

      const actions = store.getActions();
      await waitFor(() =>
        expect(actions).toEqual([
          {
            type: REMOVE_QUERY_EDITOR,
            queryEditor: initialState.sqlLab.queryEditors[1],
          },
          {
            type: REMOVE_QUERY_EDITOR,
            queryEditor: initialState.sqlLab.queryEditors[2],
          },
        ]),
      );
    });

    it('should dispatch cloneQueryToNewTab action', async () => {
      fireEvent.click(screen.getByTestId('clone-tab-menu-option'));

      const actions = store.getActions();
      await waitFor(() =>
        expect(actions[0]).toEqual({
          type: ADD_QUERY_EDITOR,
          queryEditor: expect.objectContaining({
            title: `Copy of ${defaultQueryEditor.title}`,
            sql: defaultQueryEditor.sql,
            autorun: false,
          }),
        }),
      );
    });
  });
});
