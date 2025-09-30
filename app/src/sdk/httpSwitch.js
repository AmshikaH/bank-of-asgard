/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useSwitchToken } from './SwitchTokenContext';
import axios from 'axios';

/**
 * Custom hook that returns an http client with the switch token
 *
 * TODO:
 *
 * When transferring this into the Asgardeo SDK, it would be ideal to
 * integrate this with the existing http component such that if a switch
 * token is available, i.e., if used within ContextSwitch, the request
 * uses the switch token, and if used outside ContextSwitch, the request
 * uses the logged in organization's token as usual.
 */
export const useHttpSwitch = () => {

  const switchToken = useSwitchToken();
  if (switchToken === null) {
    throw new Error(
      "useHttpSwitch must be used within a ContextSwitch provider"
    );
  }

  const instance = axios.create({
    headers: {
      Authorization: `Bearer ${switchToken}`,
    },
  });

  return {
    /**
     * Proxy to axios.request with switch token
     * @param {object} config - Axios request config
     */
    request: (config) => {
      return instance.request(config);
    },
  };
};
