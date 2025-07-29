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

export const transformValidationRules = (rulesData) => {
  const passwordDefaults = {
    minLength: 8,
    maxLength: 64,
    minUpperCase: 1,
    minLowerCase: 1,
    minNumbers: 1,
    minSpecialChr: 0,
    minUniqueChr: 0,
    maxConsecutiveChr: undefined,
  };

  const mapping = {
    LengthValidator: {
      "min.length": "minLength",
      "max.length": "maxLength",
    },
    NumeralValidator: {
      "min.length": "minNumbers",
    },
    UpperCaseValidator: {
      "min.length": "minUpperCase",
    },
    LowerCaseValidator: {
      "min.length": "minLowerCase",
    },
    SpecialCharacterValidator: {
      "min.length": "minSpecialChr",
    },
  };

  const passwordRules = rulesData.find((rule) => rule.field === "password");
  if (!passwordRules) return passwordDefaults;

  let transformedRules = { ...passwordDefaults };

  passwordRules.rules.forEach(({ validator, properties }) => {
    if (mapping[validator]) {
      properties.forEach(({ key, value }) => {
        const mappedKey = mapping[validator][key];
        if (mappedKey) {
          transformedRules[mappedKey] = parseInt(value, 10);
        }
      });
    }
  });

  return transformedRules;
};
