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
/*
  This file can be overridden from outside by custom config, it will add/delete new SQL Lab addons to existing config in
  superset-frontend/src/SqlLab/addons/index.ts file
 */

// import getRegistry from 'src/SqlLab/addons/SqlLabAddonRegistrySingleton';

export default function setupSqlLabAddons() {
  // Add custom addons here. Example:
  // getRegistry().register('example', example);
}
