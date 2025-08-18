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

import { useAsgardeo } from "@asgardeo/react";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import CountrySelect from "../country-select";
import { environmentConfig } from "../../util/environment-util";
import { getPasswordPolicy } from "../../api/server-configurations";
import PasswordField from "../common/password-field";
import { useSnackbar } from "notistack";

const SignUpForm = ({ accountType }) => {
  const { isSignedIn, signIn, http } = useAsgardeo();
  const { enqueueSnackbar } = useSnackbar();

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    country: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    accountType: accountType,
  });
  const [passwordValidationRules, setPasswordValidationRules] = useState({});
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);

  useEffect(() => {
    getPasswordPolicy(http)
      .then((response) => {
        setPasswordValidationRules(response);
      })
      .catch((error) => {
        console.error("Error fetching password policy:", error);
      });
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${environmentConfig.API_SERVICE_URL}/signup`,
        signupData
      );

      if (response.status == 200) {
        signIn();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Something went wrong while creating account", {
        variant: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSignup} className="contact_form-container">
      <label htmlFor="username">Username</label>
      <input
        type="text"
        placeholder="Enter a username"
        value={signupData.username}
        onChange={(e) =>
          setSignupData({ ...signupData, username: e.target.value })
        }
        required
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        placeholder="Enter email address"
        value={signupData.email}
        onChange={(e) =>
          setSignupData({ ...signupData, email: e.target.value })
        }
        required
      />

      <label htmlFor="password">Password</label>
      <PasswordField
        name="password"
        placeholder="Enter a password"
        value={signupData.password}
        onChange={(value) =>
          setSignupData({ ...signupData, password: value })
        }
        showPasswordValidation={true}
        passwordValidationRules={passwordValidationRules}
        onPasswordValidate={(isValid) => {
          setIsNewPasswordValid(isValid);
        }}
        inputProps={{
          autoComplete: "new-password",
        }}
      />

      <div className="row">
        <div className="col-md-6">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            placeholder="Enter first name"
            value={signupData.firstName}
            onChange={(e) =>
              setSignupData({ ...signupData, firstName: e.target.value })
            }
            required
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            placeholder="Enter last name"
            value={signupData.lastName}
            onChange={(e) =>
              setSignupData({ ...signupData, lastName: e.target.value })
            }
            required
          />
        </div>
      </div>

      <label htmlFor="dateOfBirth">Date of Birth</label>
      <input
        type="date"
        placeholder="Date of Birth"
        value={signupData.dateOfBirth}
        onChange={(e) =>
          setSignupData({ ...signupData, dateOfBirth: e.target.value })
        }
        required
      />

      <label htmlFor="country">Country</label>
      <CountrySelect
        value={signupData.country}
        onChange={(value) =>
          setSignupData({ ...signupData, country: value?.label || "" })
        }
      />

      <label htmlFor="mobile">Mobile Number</label>
      <input
        type="number"
        placeholder="Enter mobile"
        value={signupData.mobile}
        onChange={(e) =>
          setSignupData({ ...signupData, mobile: e.target.value })
        }
        required
      />

      <button type="submit" className={`btn ${isNewPasswordValid ? "" : "disabled" }`}>Signup</button>
    </form>
  );
};

SignUpForm.propTypes = {
  accountType: PropTypes.object.isRequired,
};

export default SignUpForm;
